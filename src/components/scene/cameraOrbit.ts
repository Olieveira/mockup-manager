import { MathUtils, Vector3 } from 'three'
import { MODEL_CATALOG } from './models/catalog'
import type { ModelId } from './models/catalog'

/**
 * Posição da câmera em volta do centro da cena, para onde ela sempre olha.
 * O azimute é medido de +z (a frente dos modelos) para +x, e o ângulo polar a
 * partir do alto: π/2 é a altura do centro.
 */
export interface Orbit {
  azimuth: number
  polar: number
  radius: number
}

/** Ângulo padrão da vista Inicial a partir da frente: três quartos, com a lateral direita à vista. */
const INITIAL_ANGLE = 35

/**
 * Altura e distância de abertura. No celular em pé o palco é estreito, então a
 * câmera fica mais longe e mais baixa para o modelo caber na largura.
 */
const OPENING = {
  desktop: { elevation: 17, radius: 336 },
  mobile: { elevation: 10, radius: 391 },
}

export type Device = keyof typeof OPENING

/** Vista Inicial do modelo: três quartos e o zoom de abertura. */
export function getInitialOrbit(model: ModelId, device: Device): Orbit {
  const { elevation, radius } = OPENING[device]
  return {
    azimuth: MathUtils.degToRad(MODEL_CATALOG[model].initialAngle ?? INITIAL_ANGLE),
    polar: MathUtils.degToRad(90 - elevation),
    radius,
  }
}

export function orbitToPosition({ azimuth, polar, radius }: Orbit): [number, number, number] {
  return new Vector3().setFromSphericalCoords(radius, polar, azimuth).toArray()
}
