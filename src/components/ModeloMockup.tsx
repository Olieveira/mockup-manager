import { useEffect } from 'react'
import { useGLTF, useTexture } from '@react-three/drei'
import { DoubleSide, Mesh, MeshStandardMaterial } from 'three'

export function ModeloMockup() {
  const { scene } = useGLTF('/modelo6.glb')
  const texture = useTexture('/arte2.jpg')

  useEffect(() => {
    if (!texture) return

    texture.center.set(0.5, 0.5)
    texture.repeat.set(-1, 1)

    texture.needsUpdate = true
  }, [texture])

  useEffect(() => {
    const parteCustomizavel = scene.getObjectByName('Plano') as Mesh
    if (parteCustomizavel && parteCustomizavel.material) {
      if (Array.isArray(parteCustomizavel.material)) {
        parteCustomizavel.material.forEach((mat) => {
          if (mat instanceof MeshStandardMaterial) {
            mat.map = texture
            mat.needsUpdate = true
            mat.side = DoubleSide
            mat.transparent = true
          }
        })
      } else if (parteCustomizavel.material instanceof MeshStandardMaterial) {
        parteCustomizavel.material.map = texture
        parteCustomizavel.material.needsUpdate = true
      }
    }
  }, [scene, texture])

  return <primitive object={scene} />
}
