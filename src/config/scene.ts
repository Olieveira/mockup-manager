export const ENVIRONMENT_PRESETS = [
  { id: 'apartment', label: 'Apartamento' },
  { id: 'city', label: 'Cidade' },
  { id: 'dawn', label: 'Amanhecer' },
  { id: 'forest', label: 'Floresta' },
  { id: 'lobby', label: 'Lobby' },
  { id: 'night', label: 'Noite' },
  { id: 'park', label: 'Parque' },
  { id: 'studio', label: 'Estúdio' },
  { id: 'sunset', label: 'Pôr do Sol' },
  { id: 'warehouse', label: 'Armazém' },
] as const

export type EnvironmentPreset = (typeof ENVIRONMENT_PRESETS)[number]['id']

export type BackgroundMode = 'preset' | 'color'

export interface SceneSettings {
  backgroundMode: BackgroundMode
  backgroundColor: string
  environment: EnvironmentPreset
  autoRotate: boolean
  rotateSpeed: number
}

export const DEFAULT_SCENE_SETTINGS: SceneSettings = {
  backgroundMode: 'preset',
  backgroundColor: '#ffffff',
  environment: 'apartment',
  autoRotate: false,
  rotateSpeed: 3,
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
