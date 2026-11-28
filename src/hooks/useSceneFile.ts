import { useState } from 'react'
import { MODEL_CATALOG } from '../components/scene/models/catalog'
import type { ModelId } from '../components/scene/models/catalog'
import type { SceneSettings } from '../config/scene'
import { prepareArtwork } from '../lib/artwork'
import { saveFile } from '../lib/saveFile'
import { createPresetsFile, createSceneFile, readSceneFile, SceneFileError } from '../lib/sceneFile'
import type { SceneState } from '../lib/sceneStorage'
import type { ArtworkController } from './useArtwork'
import type { ScenePresetsController } from './useScenePresets'

interface SceneFileOptions {
  model: ModelId
  settings: SceneSettings
  artwork: ArtworkController
  presets: ScenePresetsController
  loadScene: (scene: SceneState) => void
}

/** Resultado de abrir um arquivo, para quem abriu mostrar onde estiver. */
export interface OpenResult {
  /** O que foi aberto, quando deu certo. */
  done?: string
  /** Deu certo, mas com um aviso (a arte do arquivo não pôde ser usada). */
  warning?: string
  error?: string
}

const PRESETS_FILE_NAME = 'predefinicoes.json'

const count = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`

function presetsSummary({ added, replaced }: { added: number; replaced: number }) {
  const parts = []
  if (added) parts.push(count(added, 'predefinição nova', 'predefinições novas'))
  if (replaced) parts.push(count(replaced, 'substituída', 'substituídas'))
  return `${parts.join(', ')}.`
}

/** Nome do arquivo pelo modelo, sem acento: cena-caixa.json. */
function sceneFileName(model: ModelId) {
  const label = MODEL_CATALOG[model].label.normalize('NFD').replace(/[̀-ͯ]/g, '')
  return `cena-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.json`
}

/**
 * Exporta e abre arquivos .json: a cena (modelo, ajustes e, se pedido, a
 * arte enviada) ou a lista de predefinições. Abrir reconhece sozinho qual dos
 * dois veio. A cena troca tudo de uma vez, só depois de o arquivo inteiro ter
 * sido lido e a arte preparada, para uma falha no meio não deixar a cena pela
 * metade.
 */
export function useSceneFile({ model, settings, artwork, presets, loadScene }: SceneFileOptions) {
  const [isOpening, setIsOpening] = useState(false)

  async function exportScene(includeArtwork: boolean) {
    // Com a arte de exemplo o arquivo guarda null, para abrir com ela de novo
    const blob = artwork.artwork?.blob
    const file = await createSceneFile({
      model,
      settings,
      artwork: blob ? (includeArtwork ? blob : undefined) : null,
    })
    await saveFile(file, sceneFileName(model))
  }

  async function exportPresets() {
    await saveFile(createPresetsFile(presets.presets), PRESETS_FILE_NAME)
  }

  async function openFile(file: File): Promise<OpenResult> {
    setIsOpening(true)
    try {
      const opened = await readSceneFile(file)
      if (opened.kind === 'presets') {
        if (!opened.presets.length) return { error: 'Nenhuma predefinição válida neste arquivo.' }
        return { done: presetsSummary(presets.importPresets(opened.presets)) }
      }

      const { scene } = opened
      // A arte embutida passa pelas mesmas checagens de uma enviada; se não
      // servir, a cena abre do mesmo jeito, com a arte que já estava
      let prepared: Blob | null | undefined = scene.artwork
      let isArtworkInvalid = scene.isArtworkInvalid
      if (scene.artwork) {
        prepared = await prepareArtwork(new File([scene.artwork], 'arte', { type: scene.artwork.type })).catch(
          () => undefined,
        )
        isArtworkInvalid = !prepared
      }

      loadScene({ model: scene.model ?? model, settings: scene.settings })
      if (prepared) artwork.applyArtwork(prepared)
      else if (prepared === null) artwork.resetArtwork()
      return isArtworkInvalid
        ? { warning: 'Cena aberta, mas a arte do arquivo não pôde ser usada. A arte atual continua.' }
        : { done: 'Cena aberta.' }
    } catch (cause) {
      return { error: cause instanceof SceneFileError ? cause.message : 'Não foi possível abrir o arquivo.' }
    } finally {
      setIsOpening(false)
    }
  }

  return { isOpening, exportScene, exportPresets, openFile }
}

export type SceneFileController = ReturnType<typeof useSceneFile>
