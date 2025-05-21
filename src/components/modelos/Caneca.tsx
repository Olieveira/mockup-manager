import { useEffect, useMemo } from 'react'
import { useGLTF, useTexture } from '@react-three/drei'
import { DoubleSide, Mesh, MeshStandardMaterial, Object3D } from 'three'

interface ModeloMockupProps {
  arte: string | undefined;
}

export function CanecaMockup({ arte }: ModeloMockupProps) {
  const textureUrl = arte || "/arte.jpg"
  const texture = useTexture(textureUrl)
  const { scene } = useGLTF('/mockup-caneca.glb')

  // Clona a cena original
  const clonedScene = useMemo(() => scene.clone(true), [scene, arte])

  useEffect(() => {
    if (!texture) return
    texture.center.set(0.5, 0.5)
    texture.repeat.set(-1, 1)
    texture.needsUpdate = true
  }, [texture])

  useEffect(() => {
    const parteCustomizavel = clonedScene.getObjectByName('Arte') as Mesh
    if (parteCustomizavel && parteCustomizavel.material) {
      if (Array.isArray(parteCustomizavel.material)) {
        parteCustomizavel.material = parteCustomizavel.material.map(mat => {
          if (mat instanceof MeshStandardMaterial) {
            const newMat = mat.clone()
            newMat.map = texture
            newMat.needsUpdate = true
            newMat.side = DoubleSide
            newMat.transparent = true
            return newMat
          }
          return mat
        })
      } else if (parteCustomizavel.material instanceof MeshStandardMaterial) {
        const newMat = parteCustomizavel.material.clone()
        newMat.map = texture
        newMat.needsUpdate = true
        newMat.side = DoubleSide
        newMat.transparent = true
        parteCustomizavel.material = newMat
      }
    }
  }, [clonedScene, texture])

  return <primitive object={clonedScene} />
}
