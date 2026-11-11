export const ACCEPTED_ARTWORK_TYPES = ['image/png', 'image/jpeg', 'image/webp']

const MAX_FILE_SIZE = 5 * 1024 * 1024

export class ArtworkError extends Error {}

export async function prepareArtwork(file: File): Promise<Blob> {
  if (!ACCEPTED_ARTWORK_TYPES.includes(file.type)) {
    throw new ArtworkError('Formato não suportado. Utilize imagens PNG, JPG ou WebP.')
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new ArtworkError('Imagem muito grande! Utilize arquivos de até 5MB.')
  }
  return file
}
