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

export const ROTATE_SPEED_RANGE = { min: 1, max: 15, step: 1 } as const
