import { useEffect, useMemo } from 'react'
import { useTexture } from '@react-three/drei'
import { SRGBColorSpace } from 'three'

const FULL_UV = [0, 0, 1, 1] as const

interface ArtworkTextureOptions {
  flipX?: boolean
  flipY?: boolean
  /**
   * Proporção (largura / altura) da área de impressão. Com ela a arte é
   * recortada no centro para preencher a área sem distorcer, como faz a
   * gráfica, em vez de ser esticada.
   */
  cover?: number
  /**
   * Retângulo do UV (u, v, largura e altura, de 0 a 1) que a arte ocupa,
   * quando ela vai só numa parte da malha. Fora dele o UV passa de 0 a 1, e o
   * material decide o que mostrar ali. Sem ele a arte ocupa o UV inteiro.
   */
  region?: readonly [number, number, number, number]
}

/**
 * Carrega a arte e devolve uma cópia configurada para o modelo. A cópia evita
 * alterar a textura em cache, que é compartilhada entre os modelos.
 */
export function useArtworkTexture(
  url: string,
  { flipX = false, flipY = false, cover, region }: ArtworkTextureOptions = {},
) {
  const source = useTexture(url)
  const [regionU, regionV, regionWidth, regionHeight] = region ?? FULL_UV

  const texture = useMemo(() => {
    const copy = source.clone()
    copy.colorSpace = SRGBColorSpace
    // A transformação parte do centro da região e o leva ao centro da imagem
    copy.center.set(regionU + regionWidth / 2, regionV + regionHeight / 2)
    copy.offset.set(0.5 - copy.center.x, 0.5 - copy.center.y)
    // Com repeat menor que 1 a textura mostra só o miolo, a partir do centro
    const { width, height } = source.image as { width: number; height: number }
    const aspect = width / height
    const scaleX = cover ? Math.min(1, cover / aspect) : 1
    const scaleY = cover ? Math.min(1, aspect / cover) : 1
    copy.repeat.set(((flipX ? -1 : 1) * scaleX) / regionWidth, ((flipY ? -1 : 1) * scaleY) / regionHeight)
    copy.needsUpdate = true
    return copy
  }, [source, flipX, flipY, cover, regionU, regionV, regionWidth, regionHeight])

  useEffect(() => () => texture.dispose(), [texture])

  return texture
}
