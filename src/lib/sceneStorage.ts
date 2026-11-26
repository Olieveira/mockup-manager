import { MODEL_IDS } from '../components/scene/models/catalog'
import type { ModelId } from '../components/scene/models/catalog'
import { DEFAULT_SCENE_SETTINGS, ENVIRONMENT_PRESETS, LIGHTING_RANGES, ROTATE_SPEED_RANGE } from '../config/scene'
import type { BackgroundMode, EnvironmentPreset, SceneSettings } from '../config/scene'

// O que fica salvo no navegador passa por aqui na volta: um valor de uma
// versão antiga, editado à mão ou fora dos limites cai no padrão, campo a
// campo, em vez de quebrar a cena

const SCENE_STATE_KEY = 'scene-state'
/** Muda quando o formato salvo deixar de ser compatível. Um valor de outra versão é ignorado. */
const STORAGE_VERSION = 1

export interface SceneState {
  settings: SceneSettings
  model: ModelId
}

type Range = { min: number; max: number }

const BACKGROUND_MODES: readonly BackgroundMode[] = ['preset', 'color']
const ENVIRONMENT_IDS: readonly string[] = ENVIRONMENT_PRESETS.map(({ id }) => id)
const HEX_COLOR = /^#[0-9a-f]{6}$/i

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function readNumber(value: unknown, fallback: number, { min, max }: Range) {
  return typeof value === 'number' && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback
}

function readBoolean(value: unknown, fallback: boolean) {
  return typeof value === 'boolean' ? value : fallback
}

/** Ajustes de cena válidos a partir de qualquer valor, com o padrão no lugar do que estiver errado. */
export function readSceneSettings(value: unknown): SceneSettings {
  const stored = isRecord(value) ? value : {}
  const fallback = DEFAULT_SCENE_SETTINGS
  return {
    backgroundMode: BACKGROUND_MODES.includes(stored.backgroundMode as BackgroundMode)
      ? (stored.backgroundMode as BackgroundMode)
      : fallback.backgroundMode,
    backgroundColor:
      typeof stored.backgroundColor === 'string' && HEX_COLOR.test(stored.backgroundColor)
        ? stored.backgroundColor.toLowerCase()
        : fallback.backgroundColor,
    environment: ENVIRONMENT_IDS.includes(stored.environment as string)
      ? (stored.environment as EnvironmentPreset)
      : fallback.environment,
    autoRotate: readBoolean(stored.autoRotate, fallback.autoRotate),
    rotateSpeed: readNumber(stored.rotateSpeed, fallback.rotateSpeed, ROTATE_SPEED_RANGE),
    backgroundBlur: readNumber(stored.backgroundBlur, fallback.backgroundBlur, LIGHTING_RANGES.backgroundBlur),
    environmentIntensity: readNumber(
      stored.environmentIntensity,
      fallback.environmentIntensity,
      LIGHTING_RANGES.environmentIntensity,
    ),
    environmentRotation: readNumber(
      stored.environmentRotation,
      fallback.environmentRotation,
      LIGHTING_RANGES.environmentRotation,
    ),
    exposure: readNumber(stored.exposure, fallback.exposure, LIGHTING_RANGES.exposure),
    lightIntensity: readNumber(stored.lightIntensity, fallback.lightIntensity, LIGHTING_RANGES.lightIntensity),
    contactShadow: readBoolean(stored.contactShadow, fallback.contactShadow),
  }
}

/** Lê um JSON salvo na versão atual. Devolve undefined se não houver, se for de outra versão ou se o armazenamento estiver bloqueado. */
export function readStored(key: string): unknown {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return undefined
    const stored: unknown = JSON.parse(raw)
    return isRecord(stored) && stored.version === STORAGE_VERSION ? stored.data : undefined
  } catch {
    // Armazenamento bloqueado (modo privado em alguns navegadores) ou JSON inválido
    return undefined
  }
}

export function writeStored(key: string, data: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify({ version: STORAGE_VERSION, data }))
  } catch {
    // Sem armazenamento, ou sem espaço: vale só para esta visita
  }
}

/** Último estado da cena salvo, ou o padrão na primeira visita. */
export function readSceneState(): SceneState {
  const stored = readStored(SCENE_STATE_KEY)
  const { settings, model } = isRecord(stored) ? stored : {}
  return {
    settings: readSceneSettings(settings),
    model: MODEL_IDS.includes(model as ModelId) ? (model as ModelId) : MODEL_IDS[0],
  }
}

export function writeSceneState(state: SceneState) {
  writeStored(SCENE_STATE_KEY, state)
}

const SCENE_PRESETS_KEY = 'scene-presets'
export const PRESET_NAME_MAX_LENGTH = 40

/** Fundo, luz e giro salvos com um nome. Não leva modelo nem arte, para valer em qualquer mockup. */
export interface ScenePreset {
  name: string
  settings: SceneSettings
}

export function isScenePresetsKey(key: string | null) {
  return key === SCENE_PRESETS_KEY
}

/** Compara nomes sem diferenciar maiúsculas, que na lista pareceriam a mesma predefinição. */
export function isSamePresetName(a: string, b: string) {
  return a.trim().localeCompare(b.trim(), 'pt-BR', { sensitivity: 'accent' }) === 0
}

/** Predefinições salvas, sem as inválidas e sem nomes repetidos. */
export function readScenePresets(): ScenePreset[] {
  const stored = readStored(SCENE_PRESETS_KEY)
  if (!Array.isArray(stored)) return []
  const presets: ScenePreset[] = []
  for (const item of stored) {
    if (!isRecord(item) || typeof item.name !== 'string') continue
    const name = item.name.trim().slice(0, PRESET_NAME_MAX_LENGTH)
    if (!name || presets.some((preset) => isSamePresetName(preset.name, name))) continue
    presets.push({ name, settings: readSceneSettings(item.settings) })
  }
  return presets
}

export function writeScenePresets(presets: ScenePreset[]) {
  writeStored(SCENE_PRESETS_KEY, presets)
}

/**
 * Diz se duas cenas ficam iguais na tela. Ignora o que o modo de fundo não
 * usa (a cor com cenário, o cenário e o desfoque com cor sólida) e a
 * velocidade com o giro desligado, para a predefinição continuar marcada
 * depois de um vaivém nesses controles.
 */
export function isSameScene(a: SceneSettings, b: SceneSettings) {
  return (Object.keys(a) as (keyof SceneSettings)[]).every((key) => {
    if (a.backgroundMode === 'preset' && key === 'backgroundColor') return true
    if (a.backgroundMode === 'color' && (key === 'environment' || key === 'backgroundBlur')) return true
    if (!a.autoRotate && key === 'rotateSpeed') return true
    return a[key] === b[key]
  })
}
