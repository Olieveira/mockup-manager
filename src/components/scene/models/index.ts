import type { ComponentType } from 'react'
import { BlisterModel } from './BlisterModel'
import { MugModel } from './MugModel'
import type { ModelProps } from './types'

export const MODELS = {
  blister: { label: 'Blister', Component: BlisterModel },
  mug: { label: 'Caneca', Component: MugModel },
} satisfies Record<string, { label: string; Component: ComponentType<ModelProps> }>

export type ModelId = keyof typeof MODELS

export const MODEL_IDS = Object.keys(MODELS) as ModelId[]
