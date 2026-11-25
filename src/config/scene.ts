/**
 * Cenários HDRI da Poly Haven (CC0), em resolução 1k, servidos de
 * public/hdri. São os mesmos dos presets do drei, mas hospedados aqui para
 * não depender do CDN dele. Cada arquivo só baixa quando o cenário é escolhido.
 */
export const ENVIRONMENT_PRESETS = [
  { id: 'apartment', label: 'Apartamento', file: 'lebombo_1k.hdr' },
  { id: 'city', label: 'Cidade', file: 'potsdamer_platz_1k.hdr' },
  { id: 'dawn', label: 'Amanhecer', file: 'kiara_1_dawn_1k.hdr' },
  { id: 'forest', label: 'Floresta', file: 'forest_slope_1k.hdr' },
  { id: 'lobby', label: 'Lobby', file: 'st_fagans_interior_1k.hdr' },
  { id: 'night', label: 'Noite', file: 'dikhololo_night_1k.hdr' },
  { id: 'park', label: 'Parque', file: 'rooitou_park_1k.hdr' },
  { id: 'studio', label: 'Estúdio', file: 'studio_small_03_1k.hdr' },
  { id: 'sunset', label: 'Pôr do Sol', file: 'venice_sunset_1k.hdr' },
  { id: 'warehouse', label: 'Armazém', file: 'empty_warehouse_01_1k.hdr' },
] as const

export type EnvironmentPreset = (typeof ENVIRONMENT_PRESETS)[number]['id']

const ENVIRONMENT_DIR = '/hdri/'

export function getEnvironmentPreset(id: EnvironmentPreset) {
  const preset = ENVIRONMENT_PRESETS.find((item) => item.id === id) ?? ENVIRONMENT_PRESETS[0]
  return { ...preset, url: ENVIRONMENT_DIR + preset.file }
}

export type BackgroundMode = 'preset' | 'color'

/** Ajustes finos de luz e fundo. São os valores que o "Restaurar padrão" do painel desfaz. */
export interface LightingSettings {
  /** Desfoque do fundo do cenário, de 0 (nítido) a 1. */
  backgroundBlur: number
  /** Multiplica a luz do cenário, tanto nos reflexos quanto no fundo. */
  environmentIntensity: number
  /** Giro do cenário em graus, reflexos e fundo juntos. */
  environmentRotation: number
  /** Exposição em EV: cada ponto dobra ou divide a luz pela metade. */
  exposure: number
  /** Multiplica a intensidade das luzes direcionais. */
  lightIntensity: number
  /** Sombra suave no chão, logo abaixo do modelo. */
  contactShadow: boolean
}

export interface SceneSettings extends LightingSettings {
  backgroundMode: BackgroundMode
  backgroundColor: string
  environment: EnvironmentPreset
  autoRotate: boolean
  rotateSpeed: number
}

export const DEFAULT_LIGHTING: LightingSettings = {
  backgroundBlur: 0,
  environmentIntensity: 1,
  environmentRotation: 0,
  exposure: 0,
  lightIntensity: 1,
  contactShadow: true,
}

export const DEFAULT_SCENE_SETTINGS: SceneSettings = {
  backgroundMode: 'preset',
  backgroundColor: '#ffffff',
  environment: 'apartment',
  autoRotate: false,
  rotateSpeed: 3,
  ...DEFAULT_LIGHTING,
}

export function isDefaultLighting(settings: LightingSettings) {
  return (Object.keys(DEFAULT_LIGHTING) as (keyof LightingSettings)[]).every(
    (key) => settings[key] === DEFAULT_LIGHTING[key],
  )
}

/**
 * Fundos sólidos sugeridos para a cena, como papéis de estúdio fotográfico.
 * São conteúdo do mockup (saem na imagem exportada), não cores da interface,
 * por isso não seguem os tokens nem o tema.
 */
export const BACKGROUND_SWATCHES = [
  { color: '#ffffff', label: 'Branco' },
  { color: '#e8e8e6', label: 'Cinza claro' },
  { color: '#a3a3a1', label: 'Cinza médio' },
  { color: '#3b3b3a', label: 'Grafite' },
  { color: '#121212', label: 'Preto' },
] as const

export const ROTATE_SPEED_RANGE = { min: 1, max: 15, step: 1 } as const

/** Limites dos controles deslizantes de luz e fundo, no formato de <input type="range">. */
export const LIGHTING_RANGES = {
  backgroundBlur: { min: 0, max: 1, step: 0.05 },
  environmentIntensity: { min: 0, max: 2, step: 0.05 },
  environmentRotation: { min: 0, max: 355, step: 5 },
  exposure: { min: -2, max: 2, step: 0.1 },
  lightIntensity: { min: 0, max: 2, step: 0.05 },
} as const satisfies Partial<Record<keyof LightingSettings, { min: number; max: number; step: number }>>
