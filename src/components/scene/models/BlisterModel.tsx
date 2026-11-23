import { useGLTF, useTexture } from '@react-three/drei'
import { DoubleSide, FrontSide, MeshPhysicalMaterial, MeshStandardMaterial } from 'three'
import type { Object3D, Texture } from 'three'
import { useArtworkTexture } from '../useArtworkTexture'
import { forEachMesh } from './materials'
import type { BuiltModel } from './materials'
import { useBuiltModel } from './useBuiltModel'
import type { ModelProps } from './types'

const MODEL_URL = '/card-blister-sm.glb'
const DEFAULT_ARTWORK = '/flork.jpg'
const CARD_PARTS = ['CardFrente', 'CardVerso']
const PLASTIC_PARTS = ['Blister', 'Círculo']

function buildBlister(scene: Object3D, artwork: Texture): BuiltModel {
  const object = scene.clone(true)

  const plastic = new MeshPhysicalMaterial({
    color: 0xffffff,
    transmission: 0.8,
    roughness: 0.1,
    metalness: 0.25,
    ior: 1.45,
    thickness: 0.5,
    transparent: true,
    side: DoubleSide,
  })
  const materials: BuiltModel['materials'] = [plastic]

  for (const part of CARD_PARTS) {
    forEachMesh(object, part, (mesh) => {
      const material = (mesh.material as MeshStandardMaterial).clone()
      material.map = artwork
      material.side = FrontSide
      material.transparent = true
      mesh.material = material
      materials.push(material)
    })
  }

  for (const part of PLASTIC_PARTS) {
    forEachMesh(object, part, (mesh) => {
      mesh.material = plastic
    })
  }

  return { object, materials }
}

export function BlisterModel({ artworkUrl }: ModelProps) {
  const { scene } = useGLTF(MODEL_URL)
  const artwork = useArtworkTexture(artworkUrl ?? DEFAULT_ARTWORK, { flipY: true })
  const model = useBuiltModel(buildBlister, scene, artwork)

  return <primitive object={model} scale={950} />
}

useGLTF.preload(MODEL_URL)
useTexture.preload(DEFAULT_ARTWORK)
