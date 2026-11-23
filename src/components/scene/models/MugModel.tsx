import { useGLTF } from '@react-three/drei'
import { DoubleSide, MeshStandardMaterial } from 'three'
import type { Object3D, Texture } from 'three'
import { useArtworkTexture } from '../useArtworkTexture'
import { forEachMesh } from './materials'
import type { BuiltModel } from './materials'
import { useBuiltModel } from './useBuiltModel'
import type { ModelProps } from './types'

const MODEL_URL = '/caneca.glb'
const DEFAULT_ARTWORK = '/arte.jpg'
const ARTWORK_PART = 'Arte'

function buildMug(scene: Object3D, artwork: Texture): BuiltModel {
  const object = scene.clone(true)
  const materials: BuiltModel['materials'] = []

  forEachMesh(object, ARTWORK_PART, (mesh) => {
    const material = (mesh.material as MeshStandardMaterial).clone()
    material.map = artwork
    material.side = DoubleSide
    material.transparent = true
    mesh.material = material
    materials.push(material)
  })

  return { object, materials }
}

export function MugModel({ artworkUrl }: ModelProps) {
  const { scene } = useGLTF(MODEL_URL)
  const artwork = useArtworkTexture(artworkUrl ?? DEFAULT_ARTWORK, { flipX: true })
  const model = useBuiltModel(buildMug, scene, artwork)

  return <primitive object={model} />
}

useGLTF.preload(MODEL_URL)
