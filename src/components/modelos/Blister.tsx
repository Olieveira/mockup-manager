import { useEffect } from 'react'
import { useGLTF, useTexture } from '@react-three/drei'
import {
  DoubleSide,
  Mesh,
  MeshStandardMaterial,
  MeshPhysicalMaterial,
} from 'three'


export function BlisterMockup() {
  const { scene } = useGLTF('/card-sm.glb')
  const texture = useTexture('/arte2.jpg')

  useEffect(() => {
    if (!texture) return
    texture.center.set(0.5, 0.5)
    texture.repeat.set(-1, 1)
    texture.needsUpdate = true
  }, [texture])

  useEffect(() => {
    if (!scene) return

    const blenderCard = scene.getObjectByName('Card') as Mesh
    const blenderBlister = scene.getObjectByName('Blister') as Mesh

    if (blenderCard?.material instanceof MeshStandardMaterial) {
      blenderCard.material.map = texture
      blenderCard.material.needsUpdate = true
      blenderCard.material.side = DoubleSide
      blenderCard.material.transparent = true
    }

    if (blenderBlister) {
      const blisterMaterial = new MeshPhysicalMaterial({
        color: 0xffffff,
        transmission: 1,
        opacity: 1,
        roughness: 0.1,
        metalness: 0,
        ior: 1.45,
        thickness: 0.05,
        transparent: true,
        side: DoubleSide
      })

      blenderBlister.material = blisterMaterial
    }
  }, [scene, texture])

  return <primitive object={scene} />
}
