interface ModelInfo {
  label: string
  /**
   * Giro em y, em graus, que leva a frente do modelo para +z. A frente é o
   * lado que a vista Frente mostra com a arte reta.
   */
  frontTurn: number
  /** Ângulo da vista Inicial a partir da frente, em graus, quando o padrão não serve ao modelo. */
  initialAngle?: number
}

const CATALOG = {
  // Os cartões ficam de pé no plano yz, com a frente para +x
  blister: { label: 'Blister', frontTurn: -90 },
  // A alça fica em +z e a emenda da arte passa por ela: o centro da arte fica
  // do lado oposto. A Inicial gira mais, para a alça aparecer à direita
  mug: { label: 'Caneca', frontTurn: 180, initialAngle: 70 },
  canvasPrint: { label: 'Quadro', frontTurn: 0 },
  packagingBox: { label: 'Caixa', frontTurn: 0 },
} satisfies Record<string, ModelInfo>

export type ModelId = keyof typeof CATALOG

/**
 * Dados dos modelos que a interface usa antes da cena 3D existir. Fica
 * separado dos componentes para o seletor de modelo não puxar o three para o
 * pacote inicial. Os componentes ficam em ./index.ts.
 */
export const MODEL_CATALOG: Record<ModelId, ModelInfo> = CATALOG

export const MODEL_IDS = Object.keys(MODEL_CATALOG) as ModelId[]

/** Miniatura do modelo, gerada por scripts/thumbnails.mjs (npm run thumbnails). */
export function getModelThumbnail(id: ModelId) {
  return `/thumbnails/${id}.webp`
}
