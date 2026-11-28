import { useImperativeHandle, useRef } from 'react'
import type { ComponentRef, Ref } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import type { CameraView } from '../../config/cameraViews'
import { getDevice, getViewOrbit, lerpOrbit, orbitFromOffset, orbitToOffset } from './cameraOrbit'
import type { Orbit } from './cameraOrbit'
import type { ModelId } from './models/catalog'

/** Duração da troca de vista, em milissegundos. */
const TRANSITION_MS = 400
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

export interface CameraRigHandle {
  /** Leva a câmera até a vista, animando o caminho. */
  setView: (view: CameraView) => void
}

interface CameraRigProps {
  ref?: Ref<CameraRigHandle>
  /** Modelo atual, que define o ângulo da vista Inicial. */
  model: ModelId
  autoRotate: boolean
  autoRotateSpeed: number
}

interface Transition {
  from: Orbit
  to: Orbit
  start: number
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2
}

/**
 * Controles de órbita da câmera e as trocas de vista. A troca anda pela
 * esfera em volta do centro, e não em linha reta, para a câmera não passar por
 * dentro do modelo. Quem arrasta ou dá zoom no meio dela fica com a câmera.
 */
export function CameraRig({ ref, model, autoRotate, autoRotateSpeed }: CameraRigProps) {
  const controlsRef = useRef<ComponentRef<typeof OrbitControls>>(null)
  const transition = useRef<Transition | null>(null)
  // get() lê a câmera na hora, para movê-la fora do ciclo de renderização
  const get = useThree((state) => state.get)

  useImperativeHandle(
    ref,
    () => ({
      setView: (view) => {
        const controls = controlsRef.current
        if (!controls) return
        const { camera, invalidate } = get()
        // Gasta de uma vez o embalo que sobrou de um arraste, senão ele
        // continua girando a câmera depois que ela chega na vista
        controls.enableDamping = false
        controls.update()
        controls.enableDamping = true

        const from = orbitFromOffset(camera.position.clone().sub(controls.target))
        const to = getViewOrbit(view, model, getDevice(), from)
        // Sem animação, a troca já começa terminada
        const elapsed = window.matchMedia(REDUCED_MOTION_QUERY).matches ? TRANSITION_MS : 0
        transition.current = { from, to, start: performance.now() - elapsed }
        invalidate()
      },
    }),
    [get, model],
  )

  // Roda depois do update() dos controles (o drei o chama com prioridade -1),
  // então a posição daqui é a que vai para a tela
  useFrame(({ camera, invalidate }) => {
    const current = transition.current
    const controls = controlsRef.current
    if (!current || !controls) return
    const t = Math.min((performance.now() - current.start) / TRANSITION_MS, 1)
    camera.position.copy(controls.target).add(orbitToOffset(lerpOrbit(current.from, current.to, easeInOutCubic(t))))
    camera.lookAt(controls.target)
    if (t < 1) invalidate()
    else transition.current = null
  })

  return (
    <OrbitControls
      ref={controlsRef}
      autoRotate={autoRotate}
      autoRotateSpeed={autoRotateSpeed}
      rotateSpeed={0.6}
      zoomSpeed={0.5}
      dampingFactor={0.1}
      enablePan={false}
      // Sem vista de baixo: a câmera não desce do chão
      maxPolarAngle={Math.PI / 2}
      onStart={() => {
        transition.current = null
      }}
    />
  )
}
