import { useGLTF, useTexture } from '@react-three/drei'
import type { Object3D } from 'three'
import { useArtworkTexture } from '../useArtworkTexture'
import { buildPrintModel, PRINT_PART } from './materials'
import { useBuiltModel } from './useBuiltModel'
import type { ModelProps } from './types'

/** Gerado por scripts/models/canvasPrint.mjs, em metros e com a frente em +z. */
const MODEL_URL = '/quadro.glb'
const DEFAULT_ARTWORK = '/flork.jpg'
/** Nesta escala o quadro ocupa o palco como os outros modelos. */
const SCALE = 550

/** Proporção da área de impressão (frente mais bordas), gravada no .glb pelo script. */
function getPrintAspect(scene: Object3D) {
  const printSize: unknown = scene.getObjectByName(PRINT_PART)?.userData.printSize
  if (!Array.isArray(printSize)) return undefined
  const [width, height] = printSize as [number, number]
  return width / height
}

export function CanvasPrintModel({ artworkUrl }: ModelProps) {
  const { scene } = useGLTF(MODEL_URL)
  const artwork = useArtworkTexture(artworkUrl ?? DEFAULT_ARTWORK, { cover: getPrintAspect(scene) })
  const model = useBuiltModel(buildPrintModel, scene, artwork)

  return <primitive object={model} scale={SCALE} />
}

useGLTF.preload(MODEL_URL)
useTexture.preload(DEFAULT_ARTWORK)
