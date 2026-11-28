import { Suspense, useCallback, useDeferredValue, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import type { Ref, RefObject } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { ContactShadows, Environment, useTexture } from '@react-three/drei'
import { Box3, MathUtils } from 'three'
import type { Group } from 'three'
import { getEnvironmentPreset } from '../../config/scene'
import type { EnvironmentPreset, LightingSettings, SceneSettings } from '../../config/scene'
import type { CameraView } from '../../config/cameraViews'
import { StageProgress } from '../ui/StageProgress'
import { MODEL_CATALOG, MODEL_IDS } from './models/catalog'
import type { ModelId } from './models/catalog'
import { MODEL_COMPONENTS, preloadModel } from './models'
import { getDevice, getInitialOrbit, orbitToPosition } from './cameraOrbit'
import { CameraRig } from './CameraRig'
import type { CameraRigHandle } from './CameraRig'
import { useLoadingProgress } from './useLoadingProgress'

type Vector3Tuple = [number, number, number]

const CAMERA_FOV = 50
const LIGHT_INTENSITY = 0.6
const LIGHT_POSITIONS: Vector3Tuple[] = [
  [100, 100, 100],
  [-100, 100, 100],
]
const DEG_TO_RAD = Math.PI / 180
const SHADOW_OPACITY = 0.5
const SHADOW_BLUR = 2.5
/** Folga do chão da sombra além do ponto do modelo mais longe do centro, para o desfoque não ser cortado. */
const SHADOW_MARGIN = 1.5

export interface SceneHandle {
  /** Renderiza o quadro atual e o devolve como imagem PNG. */
  capture: () => Promise<Blob>
  /** Leva a câmera até a vista, animando o caminho. */
  setView: (view: CameraView) => void
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

/** Exposição do tone mapping, que fica no renderer e não na cena. */
function Exposure({ exposure }: { exposure: number }) {
  // get() lê o renderer na hora, para alterá-lo fora do ciclo de renderização
  const get = useThree((state) => state.get)
  useEffect(() => {
    get().gl.toneMappingExposure = 2 ** exposure
    get().invalidate()
  }, [get, exposure])

  return null
}

/**
 * Sombra suave no chão, logo abaixo do modelo. É desenhada uma vez só
 * (frames=1) e de novo apenas quando o modelo muda: o giro move a câmera, não
 * o modelo, então a sombra continua certa e não custa nada com a cena parada.
 *
 * Fica centrada em x = z = 0, e não no centro do modelo: o desfoque do drei
 * desenha um plano auxiliar na origem com a câmera da sombra, e com a sombra
 * fora do eixo a textura sai deslocada e cortada. Os modelos já ficam em
 * volta da origem (é para onde a câmera olha), com a base abaixo dela.
 */
function ModelShadow({ bounds }: { bounds: Box3 }) {
  const { position, scale, far } = useMemo(() => {
    const height = bounds.max.y - bounds.min.y
    const reach = Math.max(-bounds.min.x, bounds.max.x, -bounds.min.z, bounds.max.z)
    return {
      // Um pouco abaixo da base, para o plano não disputar pixel com ela
      position: [0, bounds.min.y - height * 0.002, 0] as Vector3Tuple,
      scale: reach * 2 * SHADOW_MARGIN,
      // O plano auxiliar do desfoque (em y = 0) precisa caber no alcance da câmera
      far: Math.max(height, -bounds.min.y),
    }
  }, [bounds])

  return (
    <ContactShadows frames={1} position={position} scale={scale} far={far} blur={SHADOW_BLUR} opacity={SHADOW_OPACITY} />
  )
}

interface SceneBridgeProps {
  ref?: Ref<SceneHandle>
  rig: RefObject<CameraRigHandle | null>
}

/** O que a interface pode pedir à cena de fora do Canvas. */
function SceneBridge({ ref, rig }: SceneBridgeProps) {
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
      setView: (view) => rig.current?.setView(view),
    }),
    [gl, scene, camera, rig],
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
  lighting: LightingSettings
  onReady: () => void
  onPendingChange: (pending: PendingChange) => void
}

function SceneContent({
  model,
  artworkUrl,
  environment,
  showEnvironment,
  lighting,
  onReady,
  onPendingChange,
}: SceneContentProps) {
  const { backgroundBlur, environmentIntensity, environmentRotation, lightIntensity, contactShadow } = lighting
  // Os valores adiados precisam ficar dentro do Canvas: o R3F renderiza os
  // filhos com o próprio reconciler, e só assim a troca que ainda está
  // baixando mantém a cena anterior na tela em vez de esvaziá-la
  const deferredModel = useDeferredValue(model)
  const deferredArtworkUrl = useDeferredValue(artworkUrl)
  const deferredEnvironment = useDeferredValue(environment)
  const Model = MODEL_COMPONENTS[deferredModel]
  const invalidate = useThree((state) => state.invalidate)
  const rotation = useMemo<Vector3Tuple>(() => [0, environmentRotation * DEG_TO_RAD, 0], [environmentRotation])
  const [modelBounds, setModelBounds] = useState<Box3 | null>(null)

  // Mede o modelo quando ele entra na cena (o grupo é recriado a cada troca),
  // para a sombra ficar logo abaixo da base de qualquer modelo do catálogo
  const measureModel = useCallback((group: Group | null) => {
    if (group) setModelBounds(new Box3().setFromObject(group))
  }, [])

  const pending: PendingChange =
    model !== deferredModel
      ? 'model'
      : environment !== deferredEnvironment
        ? 'environment'
        : artworkUrl !== deferredArtworkUrl
          ? 'artwork'
          : null

  useEffect(() => onPendingChange(pending), [pending, onPendingChange])

  // O <Environment> muda a cena direto, sem passar pelo reconciler do R3F,
  // então o quadro novo precisa ser pedido aqui (os efeitos dele já rodaram)
  useEffect(
    () => invalidate(),
    [invalidate, deferredEnvironment, showEnvironment, backgroundBlur, environmentIntensity, rotation],
  )

  // Tira a arte enviada do cache só quando a cena já passou para a próxima.
  // Antes disso, uma renderização com o valor antigo ainda pode lê-la, e a
  // URL temporária dela já foi revogada
  useEffect(() => {
    if (!deferredArtworkUrl) return
    return () => useTexture.clear(deferredArtworkUrl)
  }, [deferredArtworkUrl])

  return (
    <Suspense fallback={null}>
      <Environment
        files={getEnvironmentPreset(deferredEnvironment).url}
        background={showEnvironment}
        backgroundBlurriness={backgroundBlur}
        environmentIntensity={environmentIntensity}
        backgroundIntensity={environmentIntensity}
        environmentRotation={rotation}
        backgroundRotation={rotation}
      />
      {LIGHT_POSITIONS.map((position) => (
        <directionalLight key={position.join()} position={position} intensity={LIGHT_INTENSITY * lightIntensity} />
      ))}
      {/* O modelo fica parado com a frente em +z: quem dá a volta é a câmera */}
      <group key={deferredModel} ref={measureModel} rotation-y={MathUtils.degToRad(MODEL_CATALOG[deferredModel].frontTurn)}>
        <Model artworkUrl={deferredArtworkUrl} />
      </group>
      {contactShadow && modelBounds && <ModelShadow bounds={modelBounds} />}
      <ReadySignal onReady={onReady} />
    </Suspense>
  )
}

/**
 * Cena 3D completa. Fica em um chunk à parte, carregado sob demanda, junto
 * com three, R3F e drei.
 */
export default function Scene({ ref, model, artworkUrl, settings, onReady }: SceneProps) {
  // A câmera abre na vista Inicial do primeiro modelo e depois fica com quem a move
  const [cameraPosition] = useState(() => orbitToPosition(getInitialOrbit(model, getDevice())))
  const rigRef = useRef<CameraRigHandle>(null)
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
    environment: `Carregando cenário ${getEnvironmentPreset(settings.environment).label}`,
    artwork: 'Aplicando a arte',
  }

  return (
    <>
      {/* Sob demanda: com a cena parada nada é redesenhado. Arrastar, o giro
          automático e as mudanças de props pedem quadros novos sozinhos; o
          que mexe direto no renderer ou na cena chama invalidate() */}
      <Canvas
        frameloop="demand"
        dpr={[1, 2]}
        gl={{ alpha: false }}
        camera={{ position: cameraPosition, fov: CAMERA_FOV }}
        // Sem alpha no canvas, o three limpa opaco; a textura da sombra precisa
        // começar transparente (a tela não muda, ela não tem canal alpha)
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        {/* A cor sólida é o fundo da cena, e não a cor de limpeza do renderer:
            a sombra de contato desenha numa textura à parte que precisa ser
            limpa transparente. No modo cenário o <Environment> troca este
            fundo pelo HDRI e devolve a cor quando sai */}
        <color attach="background" args={[settings.backgroundColor]} />
        <Exposure exposure={settings.exposure} />
        <SceneBridge ref={ref} rig={rigRef} />

        <SceneContent
          model={model}
          artworkUrl={artworkUrl}
          environment={settings.environment}
          showEnvironment={settings.backgroundMode === 'preset'}
          lighting={settings}
          onReady={markReady}
          onPendingChange={setPending}
        />

        <CameraRig
          ref={rigRef}
          model={model}
          autoRotate={settings.autoRotate}
          autoRotateSpeed={settings.rotateSpeed}
        />
      </Canvas>

      <StageProgress placement="center" label="Carregando a cena" {...progress} hidden={isReady} />
      {isReady && pending && <StageProgress placement="corner" label={pendingLabel[pending]} {...progress} />}
    </>
  )
}
