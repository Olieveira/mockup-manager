import { useEffect } from 'react'
import { useGLTF, useTexture } from '@react-three/drei'
import {
  DoubleSide,
  Mesh,
  MeshStandardMaterial,
  MeshPhysicalMaterial,
  FrontSide,
} from 'three'

export function BlisterMockup() {
  const { scene } = useGLTF('/card-blister.glb')
  const texture = useTexture('/flork.jpg')
  const texture2 = useTexture('/flork2.jpg')

  useEffect(() => {
    if (!texture || !texture2) return
    texture.center.set(0.5, 0.5)
    texture.repeat.set(-1, -1)
    texture.needsUpdate = true

    texture2.center.set(0.5, 0.5)
    texture2.repeat.set(1, -1)
    texture2.needsUpdate = true


  }, [texture, texture2])

  useEffect(() => {
    if (!scene) return

    const cardFrente = scene.getObjectByName('CardFrente')
    const cardVerso = scene.getObjectByName('CardVerso')
    const blenderBlister = scene.getObjectByName('Blister') as Mesh

    if ((!cardFrente || !("children" in cardFrente)) ||
      (!cardVerso || !("children" in cardVerso))) return

    cardFrente.children.forEach((child) => {
      if (child instanceof Mesh && child.material instanceof MeshStandardMaterial) {
        child.material.map = texture
        child.material.needsUpdate = true
        child.material.side = FrontSide
        child.material.transparent = true
      }
    })

    cardVerso.children.forEach((child) => {
      if (child instanceof Mesh && child.material instanceof MeshStandardMaterial) {
        child.material.map = texture2
        child.material.needsUpdate = true
        child.material.side = FrontSide
        child.material.transparent = true
      }
    })

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

  return (
    <group scale={[950, 950, 950]}>
      <primitive object={scene} />
    </group>
  )
}
