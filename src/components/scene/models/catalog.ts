/**
 * Dados dos modelos que a interface usa antes da cena 3D existir. Fica
 * separado dos componentes para o seletor de modelo não puxar o three para o
 * pacote inicial. Os componentes ficam em ./index.ts.
 */
export const MODEL_CATALOG = {
  blister: { label: 'Blister' },
  mug: { label: 'Caneca' },
} satisfies Record<string, { label: string }>

export type ModelId = keyof typeof MODEL_CATALOG

export const MODEL_IDS = Object.keys(MODEL_CATALOG) as ModelId[]
