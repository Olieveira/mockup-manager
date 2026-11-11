const OBJECT_URL_TTL = 60_000

export async function saveImage(blob: Blob, fileName: string) {
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
