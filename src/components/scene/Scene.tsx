import { Suspense, useDeferredValue, useEffect, useImperativeHandle, useState } from 'react'
import type { Ref } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { Environment, OrbitControls } from '@react-three/drei'
import type { SceneSettings } from '../../config/scene'
import { MODELS } from './models'
import type { ModelId } from './models'

type Vector3Tuple = [number, number, number]

const CAMERA_FOV = 50
const DESKTOP_CAMERA: Vector3Tuple = [320, 100, 20]
const MOBILE_CAMERA: Vector3Tuple = [-380, 70, 60]
const MOBILE_QUERY = '(max-width: 767px)'
const LIGHT_INTENSITY = 0.6
const LIGHT_POSITIONS: Vector3Tuple[] = [
  [100, 100, 100],
  [-100, 100, 100],
]

export interface SceneHandle {
  /** Renderiza o quadro atual e o devolve como imagem PNG. */
  capture: () => Promise<Blob>
}

interface SceneProps {
  ref?: Ref<SceneHandle>
  model: ModelId
  artworkUrl: string | null
  settings: SceneSettings
}

function ClearColor({ color }: { color: string }) {
  const gl = useThree((state) => state.gl)

  useEffect(() => {
    gl.setClearColor(color)
  }, [gl, color])

  return null
}

function SceneCapture({ ref }: { ref?: Ref<SceneHandle> }) {
  const gl = useThree((state) => state.gl)
  const scene = useThree((state) => state.scene)
  const camera = useThree((state) => state.camera)

  useImperativeHandle(
    ref,
    () => ({
      capture: async () => {
        // Renderiza na hora da captura para não depender de
        // preserveDrawingBuffer, que custa desempenho em todo quadro
        gl.render(scene, camera)
        // toDataURL é síncrono, então lê o quadro antes que o buffer seja limpo
        const dataUrl = gl.domElement.toDataURL('image/png')
        const response = await fetch(dataUrl)
        return response.blob()
      },
    }),
    [gl, scene, camera],
  )

  return null
}

export function Scene({ ref, model, artworkUrl, settings }: SceneProps) {
  const [cameraPosition] = useState(() =>
    window.matchMedia(MOBILE_QUERY).matches ? MOBILE_CAMERA : DESKTOP_CAMERA,
  )
  // Mantém o cenário anterior na tela enquanto o novo HDRI é baixado
  const environment = useDeferredValue(settings.environment)
  const Model = MODELS[model].Component

  return (
    <Canvas dpr={[1, 2]} gl={{ alpha: false }} camera={{ position: cameraPosition, fov: CAMERA_FOV }}>
      <ClearColor color={settings.backgroundColor} />
      <SceneCapture ref={ref} />

      <Suspense fallback={null}>
        <Environment preset={environment} background={settings.backgroundMode === 'preset'} />
        {LIGHT_POSITIONS.map((position) => (
          <directionalLight key={position.join()} position={position} intensity={LIGHT_INTENSITY} />
        ))}
        <Model artworkUrl={artworkUrl} />
      </Suspense>

      <OrbitControls
        autoRotate={settings.autoRotate}
        autoRotateSpeed={settings.rotateSpeed}
        rotateSpeed={0.6}
        zoomSpeed={0.5}
        dampingFactor={0.1}
        enablePan={false}
        maxPolarAngle={Math.PI / 2}
      />
    </Canvas>
  )
}
