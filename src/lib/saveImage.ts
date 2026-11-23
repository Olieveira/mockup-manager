const OBJECT_URL_TTL = 60_000

function download(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  // O Safari precisa que a URL continue válida depois do clique
  setTimeout(() => URL.revokeObjectURL(url), OBJECT_URL_TTL)
}

/**
 * Em dispositivos de toque usa a folha de compartilhamento nativa, que no
 * iOS é o caminho para salvar a imagem em Fotos. Nos demais, baixa o arquivo.
 */
export async function saveImage(blob: Blob, fileName: string) {
  const file = new File([blob], fileName, { type: blob.type })
  const isTouchDevice = window.matchMedia('(pointer: coarse)').matches

  if (isTouchDevice && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] })
      return
    } catch (error) {
      // Usuário fechou a folha de compartilhamento
      if (error instanceof DOMException && error.name === 'AbortError') return
    }
  }

  download(blob, fileName)
}
