import { useState } from 'react'
import { useGLTF, useTexture } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import type { MeshStandardMaterial, Object3D, Texture } from 'three'
import { useArtworkTexture } from '../useArtworkTexture'
import { forEachMesh } from './materials'
import type { BuiltModel } from './materials'
import { useBuiltModel } from './useBuiltModel'
import type { ModelProps } from './types'

/** Gerado por scripts/models/canvasPrint.mjs, em metros e com a frente em +z. */
const MODEL_URL = '/quadro.glb'
const DEFAULT_ARTWORK = '/flork.jpg'
const ARTWORK_PART = 'Arte'
/** Nesta escala o quadro ocupa o palco como os outros modelos. */
const SCALE = 550
/** Giro além de ficar de frente para a câmera, para uma das bordas aparecer. */
const SIDE_TURN = 0.45

/**
 * Compõe a arte sobre a tela branca: o que é transparente no PNG sai branco,
 * como na impressão. A arte é a própria superfície do quadro, então deixá-la
 * transparente mostraria o chassi por dentro.
 */
function printOnWhite(material: MeshStandardMaterial) {
  material.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <map_fragment>',
      '#include <map_fragment>\n\tdiffuseColor = vec4(mix(vec3(1.0), diffuseColor.rgb, diffuseColor.a), 1.0);',
    )
  }
  material.customProgramCacheKey = () => 'print-on-white'
}

function buildCanvasPrint(scene: Object3D, artwork: Texture): BuiltModel {
  const object = scene.clone(true)
  const materials: BuiltModel['materials'] = []

  forEachMesh(object, ARTWORK_PART, (mesh) => {
    const material = (mesh.material as MeshStandardMaterial).clone()
    material.map = artwork
    printOnWhite(material)
    mesh.material = material
    materials.push(material)
  })

  return { object, materials }
}

/** Proporção da área de impressão (frente mais bordas), gravada no .glb pelo script. */
function getPrintAspect(scene: Object3D) {
  const printSize: unknown = scene.getObjectByName(ARTWORK_PART)?.userData.printSize
  if (!Array.isArray(printSize)) return undefined
  const [width, height] = printSize as [number, number]
  return width / height
}

export function CanvasPrintModel({ artworkUrl }: ModelProps) {
  const { scene } = useGLTF(MODEL_URL)
  const artwork = useArtworkTexture(artworkUrl ?? DEFAULT_ARTWORK, { cover: getPrintAspect(scene) })
  const model = useBuiltModel(buildCanvasPrint, scene, artwork)
  const camera = useThree((state) => state.camera)
  // Só a frente tem arte, e a câmera do celular começa do lado oposto à do
  // desktop: o quadro entra virado para ela, de onde quer que ela esteja
  const [facing] = useState(() => Math.atan2(camera.position.x, camera.position.z) + SIDE_TURN)

  return <primitive object={model} scale={SCALE} rotation-y={facing} />
}

useGLTF.preload(MODEL_URL)
useTexture.preload(DEFAULT_ARTWORK)
