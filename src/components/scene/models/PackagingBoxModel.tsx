import { useMemo } from 'react'
import { useGLTF, useTexture } from '@react-three/drei'
import type { Object3D } from 'three'
import { useArtworkTexture } from '../useArtworkTexture'
import { buildPrintModel, PRINT_PART } from './materials'
import { useBuiltModel } from './useBuiltModel'
import { useFacingCamera } from './useFacingCamera'
import type { ModelProps } from './types'

/** Gerado por scripts/models/packagingBox.mjs, em metros e com a frente em +z. */
const MODEL_URL = '/caixa.glb'
const DEFAULT_ARTWORK = '/flork.jpg'
/** Nesta escala a caixa ocupa o palco como os outros modelos. */
const SCALE = 1400
/** Giro além de ficar de frente para a câmera, para uma das laterais aparecer. */
const SIDE_TURN = 0.6
/**
 * Diferença de proporção aceita para tratar a imagem como a faca inteira. Cobre
 * a sangria de 3mm em volta e o arredondamento de quem exporta em pixels.
 */
const DIELINE_TOLERANCE = 0.04

type Rect = readonly [number, number, number, number]

interface PrintLayout {
  /** Proporção da faca planificada. */
  dieAspect: number
  /** Proporção da frente. */
  frontAspect: number
  /** Retângulo da frente no UV, de 0 a 1. */
  frontRegion: Rect
}

/** Medidas da faca e da frente, gravadas no .glb pelo script. */
function readPrintLayout(scene: Object3D): PrintLayout {
  const { printSize, printFront } = scene.getObjectByName(PRINT_PART)?.userData ?? {}
  const [dieWidth, dieHeight] = printSize as [number, number]
  const [u, v, width, height] = printFront as Rect
  return {
    dieAspect: dieWidth / dieHeight,
    frontAspect: width / height,
    frontRegion: [u / dieWidth, v / dieHeight, width / dieWidth, height / dieHeight],
  }
}

export function PackagingBoxModel({ artworkUrl }: ModelProps) {
  const { scene } = useGLTF(MODEL_URL)
  const url = artworkUrl ?? DEFAULT_ARTWORK
  // A mesma textura em cache que o useArtworkTexture usa, lida só para saber a proporção
  const { image } = useTexture(url) as { image: { width: number; height: number } }
  const imageAspect = image.width / image.height

  // Uma arte na proporção da faca cobre a caixa inteira. Qualquer outra vai só
  // na frente, recortada sem distorcer, e o resto da caixa fica branco
  const options = useMemo(() => {
    const { dieAspect, frontAspect, frontRegion } = readPrintLayout(scene)
    const isDieline = Math.abs(imageAspect / dieAspect - 1) <= DIELINE_TOLERANCE
    return isDieline ? { cover: dieAspect } : { cover: frontAspect, region: frontRegion }
  }, [scene, imageAspect])

  const artwork = useArtworkTexture(url, options)
  const model = useBuiltModel(buildPrintModel, scene, artwork)
  // A frente é a face principal: a caixa entra virada para a câmera
  const facing = useFacingCamera(SIDE_TURN)

  return <primitive object={model} scale={SCALE} rotation-y={facing} />
}

useGLTF.preload(MODEL_URL)
useTexture.preload(DEFAULT_ARTWORK)
