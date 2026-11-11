export const ACCEPTED_ARTWORK_TYPES = ['image/png', 'image/jpeg', 'image/webp']

const MAX_FILE_SIZE = 25 * 1024 * 1024
// Lado maior da textura. Fotos de celular chegam a 48MP e estouram a memória
// de WebGL no iOS se forem enviadas para a GPU no tamanho original.
const MAX_TEXTURE_SIDE = 2048
const JPEG_QUALITY = 0.92

export class ArtworkError extends Error {}

function loadImage(file: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      URL.revokeObjectURL(url)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new ArtworkError('Não foi possível ler a imagem selecionada.'))
    }
    image.src = url
  })
}

/**
 * Valida a imagem e a redesenha em um canvas limitado a MAX_TEXTURE_SIDE.
 * O redesenho também aplica a orientação EXIF, que o WebGL não trata de
 * forma consistente entre navegadores.
 */
export async function prepareArtwork(file: File): Promise<Blob> {
  if (!ACCEPTED_ARTWORK_TYPES.includes(file.type)) {
    throw new ArtworkError('Formato não suportado. Utilize imagens PNG, JPG ou WebP.')
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new ArtworkError('Imagem muito grande! Utilize arquivos de até 25MB.')
  }

  const image = await loadImage(file)
  const scale = Math.min(1, MAX_TEXTURE_SIDE / Math.max(image.naturalWidth, image.naturalHeight))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))

  const context = canvas.getContext('2d')
  if (!context) throw new ArtworkError('Não foi possível processar a imagem.')
  context.drawImage(image, 0, 0, canvas.width, canvas.height)

  // JPEG não tem transparência, então só os demais formatos saem como PNG
  const outputType = file.type === 'image/jpeg' ? 'image/jpeg' : 'image/png'
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new ArtworkError('Não foi possível processar a imagem.'))),
      outputType,
      JPEG_QUALITY,
    )
  })
}
