import { Suspense, useCallback, useDeferredValue, useEffect, useImperativeHandle, useState } from 'react'
import type { Ref } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { Environment, OrbitControls, useTexture } from '@react-three/drei'
import { ENVIRONMENT_PRESETS } from '../../config/scene'
import type { EnvironmentPreset, SceneSettings } from '../../config/scene'
import { StageProgress } from '../ui/StageProgress'
import { MODEL_CATALOG, MODEL_IDS } from './models/catalog'
import type { ModelId } from './models/catalog'
import { MODEL_COMPONENTS, preloadModel } from './models'
import { useLoadingProgress } from './useLoadingProgress'

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

export interface SceneProps {
  ref?: Ref<SceneHandle>
  model: ModelId
  artworkUrl: string | null
  settings: SceneSettings
  /** Chamado uma vez, quando modelo, arte e cenário terminam de carregar. */
  onReady?: () => void
}

/** Roda o callback quando o navegador estiver ocioso. Devolve o cancelamento. */
function whenIdle(callback: () => void) {
  // O Safari não tem requestIdleCallback
  if ('requestIdleCallback' in window) {
    const id = requestIdleCallback(callback, { timeout: 4000 })
    return () => cancelIdleCallback(id)
  }
  const id = setTimeout(callback, 1500)
  return () => clearTimeout(id)
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

/** Dispara o callback quando o Suspense em volta deixa de esperar. */
function ReadySignal({ onReady }: { onReady: () => void }) {
  useEffect(onReady, [onReady])
  return null
}

/** O que mudou e ainda está carregando, enquanto a cena anterior segue na tela. */
type PendingChange = 'model' | 'environment' | 'artwork' | null

interface SceneContentProps {
  model: ModelId
  artworkUrl: string | null
  environment: EnvironmentPreset
  showEnvironment: boolean
  onReady: () => void
  onPendingChange: (pending: PendingChange) => void
}

function SceneContent({
  model,
  artworkUrl,
  environment,
  showEnvironment,
  onReady,
  onPendingChange,
}: SceneContentProps) {
  // Os valores adiados precisam ficar dentro do Canvas: o R3F renderiza os
  // filhos com o próprio reconciler, e só assim a troca que ainda está
  // baixando mantém a cena anterior na tela em vez de esvaziá-la
  const deferredModel = useDeferredValue(model)
  const deferredArtworkUrl = useDeferredValue(artworkUrl)
  const deferredEnvironment = useDeferredValue(environment)
  const Model = MODEL_COMPONENTS[deferredModel]

  const pending: PendingChange =
    model !== deferredModel
      ? 'model'
      : environment !== deferredEnvironment
        ? 'environment'
        : artworkUrl !== deferredArtworkUrl
          ? 'artwork'
          : null

  useEffect(() => onPendingChange(pending), [pending, onPendingChange])

  // Tira a arte enviada do cache só quando a cena já passou para a próxima.
  // Antes disso, uma renderização com o valor antigo ainda pode lê-la, e a
  // URL temporária dela já foi revogada
  useEffect(() => {
    if (!deferredArtworkUrl) return
    return () => useTexture.clear(deferredArtworkUrl)
  }, [deferredArtworkUrl])

  return (
    <Suspense fallback={null}>
      <Environment preset={deferredEnvironment} background={showEnvironment} />
      {LIGHT_POSITIONS.map((position) => (
        <directionalLight key={position.join()} position={position} intensity={LIGHT_INTENSITY} />
      ))}
      <Model artworkUrl={deferredArtworkUrl} />
      <ReadySignal onReady={onReady} />
    </Suspense>
  )
}

/**
 * Cena 3D completa. Fica em um chunk à parte, carregado sob demanda, junto
 * com three, R3F e drei.
 */
export default function Scene({ ref, model, artworkUrl, settings, onReady }: SceneProps) {
  const [cameraPosition] = useState(() =>
    window.matchMedia(MOBILE_QUERY).matches ? MOBILE_CAMERA : DESKTOP_CAMERA,
  )
  const [isReady, setIsReady] = useState(false)
  const markReady = useCallback(() => setIsReady(true), [])
  const [pending, setPending] = useState<PendingChange>(null)
  const progress = useLoadingProgress()

  useEffect(() => {
    if (isReady) onReady?.()
  }, [isReady, onReady])

  // Com a primeira cena pronta, adianta os outros modelos em segundo plano
  useEffect(() => {
    if (!isReady) return
    // Uma falha aqui é ignorada: ela volta a aparecer se o modelo for escolhido
    return whenIdle(() => MODEL_IDS.forEach((id) => preloadModel(id).catch(() => {})))
  }, [isReady])

  const pendingLabel = {
    model: `Carregando ${MODEL_CATALOG[model].label.toLowerCase()}`,
    environment: `Carregando cenário ${ENVIRONMENT_PRESETS.find(({ id }) => id === settings.environment)?.label}`,
    artwork: 'Aplicando a arte',
  }

  return (
    <>
      <Canvas dpr={[1, 2]} gl={{ alpha: false }} camera={{ position: cameraPosition, fov: CAMERA_FOV }}>
        <ClearColor color={settings.backgroundColor} />
        <SceneCapture ref={ref} />

        <SceneContent
          model={model}
          artworkUrl={artworkUrl}
          environment={settings.environment}
          showEnvironment={settings.backgroundMode === 'preset'}
          onReady={markReady}
          onPendingChange={setPending}
        />

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

      <StageProgress placement="center" label="Carregando a cena" {...progress} hidden={isReady} />
      {isReady && pending && <StageProgress placement="corner" label={pendingLabel[pending]} {...progress} />}
    </>
  )
}
