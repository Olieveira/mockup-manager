import type { ModelId } from '../components/scene/models/catalog'
import type { SceneSettings } from '../config/scene'
import { ACCEPTED_ARTWORK_TYPES } from './artwork'
import { FORMAT_VERSION, isRecord, readModelId, readPresetList, readSceneSettings } from './sceneStorage'
import type { ScenePreset } from './sceneStorage'

// Arquivos .json para guardar a cena ou as predefinições fora do navegador.
// Usam o mesmo envelope do que fica salvo no localStorage ({ version, data }),
// com um type a mais para dizer o que o arquivo traz, e passam pela mesma
// validação campo a campo na volta

const SCENE_FILE_TYPE = 'mockup-viewer/scene'
const PRESETS_FILE_TYPE = 'mockup-viewer/presets'

/** A arte embutida em base64 cresce um terço; uma arte de 2048px cabe com folga. */
const MAX_FILE_SIZE = 32 * 1024 * 1024

export class SceneFileError extends Error {}

/**
 * O que um arquivo de cena traz. A arte tem três casos: um Blob (embutida),
 * null (a arte de exemplo do modelo) ou undefined (não foi incluída, e a
 * arte atual continua). O posicionamento da arte, quando existir, entra como
 * outro campo ao lado dela, lido do mesmo jeito.
 */
export interface SceneFileContent {
  /** undefined quando o modelo do arquivo não existe nesta versão. */
  model: ModelId | undefined
  settings: SceneSettings
  artwork: Blob | null | undefined
  /** A arte veio no arquivo, mas não pôde ser lida. */
  isArtworkInvalid: boolean
}

export type OpenedFile = { kind: 'scene'; scene: SceneFileContent } | { kind: 'presets'; presets: ScenePreset[] }

function toJsonBlob(type: string, data: unknown) {
  return new Blob([JSON.stringify({ type, version: FORMAT_VERSION, data }, null, 2)], { type: 'application/json' })
}

function blobToBase64(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    // Data URL em vez de montar a string byte a byte: o navegador converte
    // uma arte de vários MB sem travar a página
    reader.onload = () => resolve(String(reader.result).slice(String(reader.result).indexOf(',') + 1))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

function base64ToBlob(base64: string, type: string) {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return new Blob([bytes], { type })
}

interface SceneFileInput {
  model: ModelId
  settings: SceneSettings
  artwork: Blob | null | undefined
}

/** Arquivo .json da cena, com a arte embutida se ela vier como Blob. */
export async function createSceneFile({ model, settings, artwork }: SceneFileInput) {
  const data: Record<string, unknown> = { model, settings }
  if (artwork === null) data.artwork = null
  else if (artwork) data.artwork = { mediaType: artwork.type, base64: await blobToBase64(artwork) }
  return toJsonBlob(SCENE_FILE_TYPE, data)
}

export function createPresetsFile(presets: ScenePreset[]) {
  return toJsonBlob(PRESETS_FILE_TYPE, presets)
}

/** Tamanho aproximado que a arte ocupa no arquivo, já em base64. */
export function embeddedSize(artwork: Blob) {
  return Math.ceil(artwork.size / 3) * 4
}

/** Diz se o arquivo parece um .json: no Windows o tipo às vezes chega vazio, então vale também a extensão. */
export function isJsonFile(file: File) {
  return file.type === 'application/json' || /\.json$/i.test(file.name)
}

function readArtwork(value: unknown): Pick<SceneFileContent, 'artwork' | 'isArtworkInvalid'> {
  if (value === undefined || value === null) return { artwork: value, isArtworkInvalid: false }
  if (
    isRecord(value) &&
    typeof value.base64 === 'string' &&
    ACCEPTED_ARTWORK_TYPES.includes(value.mediaType as string)
  ) {
    try {
      return { artwork: base64ToBlob(value.base64, value.mediaType as string), isArtworkInvalid: false }
    } catch {
      // base64 quebrado: cai no aviso abaixo
    }
  }
  return { artwork: undefined, isArtworkInvalid: true }
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    return undefined
  }
}

/**
 * Lê um arquivo de cena ou de predefinições. Recusa (com SceneFileError) o
 * que não for desses tipos ou for de outra versão; dentro de um arquivo
 * aceito, o campo inválido cai no padrão, como no estado salvo.
 */
export async function readSceneFile(file: File): Promise<OpenedFile> {
  if (file.size > MAX_FILE_SIZE) throw new SceneFileError('Arquivo muito grande. Uma cena tem no máximo 32 MB.')

  const parsed = parseJson(await file.text())
  const isKnownType = isRecord(parsed) && (parsed.type === SCENE_FILE_TYPE || parsed.type === PRESETS_FILE_TYPE)
  if (!isKnownType) throw new SceneFileError('Este arquivo não é uma cena nem uma lista de predefinições.')

  if (parsed.version !== FORMAT_VERSION) {
    throw new SceneFileError(
      typeof parsed.version === 'number' && parsed.version > FORMAT_VERSION
        ? 'Este arquivo foi salvo numa versão mais nova do app. Atualize a página e tente de novo.'
        : 'Este arquivo é de uma versão que o app não abre mais.',
    )
  }

  if (parsed.type === PRESETS_FILE_TYPE) return { kind: 'presets', presets: readPresetList(parsed.data) }

  const data = isRecord(parsed.data) ? parsed.data : {}
  return {
    kind: 'scene',
    scene: {
      model: readModelId(data.model, undefined),
      settings: readSceneSettings(data.settings),
      ...readArtwork(data.artwork),
    },
  }
}
