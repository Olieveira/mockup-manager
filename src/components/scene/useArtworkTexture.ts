import { useEffect, useMemo } from 'react'
import { useTexture } from '@react-three/drei'
import { SRGBColorSpace } from 'three'

interface ArtworkTextureOptions {
  flipX?: boolean
  flipY?: boolean
}

/**
 * Carrega a arte e devolve uma cópia configurada para o modelo. A cópia evita
 * alterar a textura em cache, que é compartilhada entre os modelos.
 */
export function useArtworkTexture(url: string, { flipX = false, flipY = false }: ArtworkTextureOptions = {}) {
  const source = useTexture(url)

  const texture = useMemo(() => {
    const copy = source.clone()
    copy.colorSpace = SRGBColorSpace
    copy.center.set(0.5, 0.5)
    copy.repeat.set(flipX ? -1 : 1, flipY ? -1 : 1)
    copy.needsUpdate = true
    return copy
  }, [source, flipX, flipY])

  useEffect(() => () => texture.dispose(), [texture])

  return texture
}
