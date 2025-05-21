import { useEffect } from 'react'
import { useGLTF, useTexture } from '@react-three/drei'
import {
  DoubleSide,
  Mesh,
  MeshStandardMaterial,
  MeshPhysicalMaterial,
  FrontSide,
} from 'three'

interface BlisterProps {
  arte: string | undefined;
}

export function BlisterMockup({ arte }: BlisterProps) {
  const textureUrl = arte || "/flork.jpg"
  const texture = useTexture(textureUrl)
  const { scene } = useGLTF('/card-blister-sm.glb')

  useEffect(() => {
    console.log("Arte recebida no blister:\n", arte)
    if (!arte) return
    return () => {
      URL.revokeObjectURL(textureUrl)
    }
  }, [arte, textureUrl])

  useEffect(() => {
    if (!texture) return
    texture.center.set(0.5, 0.5)
    texture.repeat.set(1, -1)
    texture.needsUpdate = true
  }, [texture])

  useEffect(() => {
    if (!scene) return

    console.log(scene)

    const cardFrente = scene.getObjectByName('CardFrente')
    const cardVerso = scene.getObjectByName('CardVerso')
    const blenderBlister = scene.getObjectByName('Blister') as Mesh
    const blenderCircle = scene.getObjectByName('Círculo')

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
        child.material.map = texture
        child.material.needsUpdate = true
        child.material.side = FrontSide
        child.material.transparent = true
      }
    })

    const blisterMaterial = new MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.8,
      opacity: 1,
      roughness: 0.1,
      metalness: 0,
      ior: 1.45,
      thickness: 0,
      transparent: true,
      side: DoubleSide
    })

    if (blenderCircle && ("children" in blenderCircle)) {
      blenderCircle.children.forEach((child) => {
        if (child instanceof Mesh && child.material instanceof MeshStandardMaterial) {
          child.material = blisterMaterial
        }
      })
    }

    blenderBlister && (blenderBlister.material = blisterMaterial)

  }, [scene, texture])

  return (
    <group scale={[950, 950, 950]}>
      <primitive object={scene} />
    </group>
  )
}
