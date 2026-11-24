import { useCallback, useEffect, useRef, useState } from 'react'
import { ArtworkError, prepareArtwork } from '../lib/artwork'

/**
 * Controla a arte enviada pelo usuário: processa o arquivo, expõe a URL
 * temporária usada como textura e libera os recursos quando ela é trocada.
 */
export function useArtwork() {
  const [artworkUrl, setArtworkUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const lastRequest = useRef(0)

  // O cache da textura é limpo pela cena (ver SceneContent), para este hook
  // não puxar o drei para o pacote inicial
  useEffect(() => {
    if (!artworkUrl) return
    return () => URL.revokeObjectURL(artworkUrl)
  }, [artworkUrl])

  const selectArtwork = useCallback(async (file: File) => {
    const request = ++lastRequest.current
    setError(null)
    setIsProcessing(true)
    try {
      const blob = await prepareArtwork(file)
      // Ignora o resultado se outro arquivo foi escolhido nesse meio tempo
      if (request === lastRequest.current) setArtworkUrl(URL.createObjectURL(blob))
    } catch (cause) {
      if (request !== lastRequest.current) return
      setError(cause instanceof ArtworkError ? cause.message : 'Não foi possível carregar a imagem.')
    } finally {
      if (request === lastRequest.current) setIsProcessing(false)
    }
  }, [])

  const resetArtwork = useCallback(() => {
    lastRequest.current++
    setIsProcessing(false)
    setError(null)
    setArtworkUrl(null)
  }, [])

  const dismissError = useCallback(() => setError(null), [])

  return { artworkUrl, error, isProcessing, selectArtwork, resetArtwork, dismissError }
}
