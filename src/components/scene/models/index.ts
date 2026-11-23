import { lazy } from 'react'
import type { ComponentType } from 'react'
import type { ModelId } from './catalog'
import type { ModelProps } from './types'

type ModelModule = { default: ComponentType<ModelProps> }

/**
 * Cada modelo é um chunk próprio, baixado só quando aparece. Ao carregar, o
 * módulo já começa a baixar o .glb e a arte padrão (ver o preload no fim de
 * cada arquivo).
 */
const MODEL_LOADERS = {
  blister: () => import('./BlisterModel').then((module) => ({ default: module.BlisterModel })),
  mug: () => import('./MugModel').then((module) => ({ default: module.MugModel })),
} satisfies Record<ModelId, () => Promise<ModelModule>>

export const MODEL_COMPONENTS: Record<ModelId, ComponentType<ModelProps>> = {
  blister: lazy(MODEL_LOADERS.blister),
  mug: lazy(MODEL_LOADERS.mug),
}

/** Baixa o modelo antes de ele ser escolhido, para a troca ser imediata. */
export function preloadModel(id: ModelId) {
  return MODEL_LOADERS[id]()
}
