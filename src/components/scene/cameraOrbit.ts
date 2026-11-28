import { MathUtils, Spherical, Vector3 } from 'three'
import type { CameraView } from '../../config/cameraViews'
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

const MOBILE_QUERY = '(max-width: 767px)'

/** Abertura que serve ao palco agora: o celular deitado usa a do desktop, que é largo. */
export function getDevice(): Device {
  return window.matchMedia(MOBILE_QUERY).matches ? 'mobile' : 'desktop'
}

/**
 * Bem perto do polo, e não nele: exatamente no alto a câmera perde a noção de
 * para onde é a frente. Assim a frente do modelo fica embaixo na tela.
 */
const TOP_POLAR = 1e-4

/** Vista Inicial do modelo: três quartos e o zoom de abertura. */
export function getInitialOrbit(model: ModelId, device: Device): Orbit {
  const { elevation, radius } = OPENING[device]
  return {
    azimuth: MathUtils.degToRad(MODEL_CATALOG[model].initialAngle ?? INITIAL_ANGLE),
    polar: MathUtils.degToRad(90 - elevation),
    radius,
  }
}

/** Órbita de cada vista. Fora a Inicial, todas mantêm a distância atual (o zoom). */
export function getViewOrbit(view: CameraView, model: ModelId, device: Device, current: Orbit): Orbit {
  const { radius } = current
  switch (view) {
    case 'initial':
      return getInitialOrbit(model, device)
    case 'front':
      return { azimuth: 0, polar: Math.PI / 2, radius }
    case 'left':
      return { azimuth: -Math.PI / 2, polar: Math.PI / 2, radius }
    case 'right':
      return { azimuth: Math.PI / 2, polar: Math.PI / 2, radius }
    case 'top':
      return { azimuth: 0, polar: TOP_POLAR, radius }
  }
}

/** Mistura duas órbitas, com o azimute pelo caminho mais curto. */
export function lerpOrbit(from: Orbit, to: Orbit, t: number): Orbit {
  const turn = MathUtils.euclideanModulo(to.azimuth - from.azimuth + Math.PI, Math.PI * 2) - Math.PI
  return {
    azimuth: from.azimuth + turn * t,
    polar: MathUtils.lerp(from.polar, to.polar, t),
    radius: MathUtils.lerp(from.radius, to.radius, t),
  }
}

export function orbitFromOffset(offset: Vector3): Orbit {
  const { radius, phi, theta } = new Spherical().setFromVector3(offset)
  return { azimuth: theta, polar: phi, radius }
}

export function orbitToOffset({ azimuth, polar, radius }: Orbit, target = new Vector3()) {
  return target.setFromSphericalCoords(radius, polar, azimuth)
}

export function orbitToPosition(orbit: Orbit): [number, number, number] {
  return orbitToOffset(orbit).toArray()
}
