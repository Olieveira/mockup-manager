import { useCallback, useEffect, useRef, useState } from 'react'
import { ArtworkError, prepareArtwork } from '../lib/artwork'
import { clearStoredArtwork, loadStoredArtwork, storeArtwork } from '../lib/artworkStore'

/** A arte enviada: o arquivo já preparado e a URL temporária usada como textura. */
export interface Artwork {
  blob: Blob
  url: string
}

function toArtwork(blob: Blob): Artwork {
  return { blob, url: URL.createObjectURL(blob) }
}

/**
 * Controla a arte enviada pelo usuário: processa o arquivo, expõe a URL
 * temporária usada como textura e libera os recursos quando ela é trocada.
 * A última arte fica salva no navegador e volta ao recarregar a página, até
 * ser trocada ou redefinida.
 */
export function useArtwork() {
  const [artwork, setArtwork] = useState<Artwork | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const lastRequest = useRef(0)

  // Traz de volta a arte da última visita. Se outra for escolhida (ou a arte
  // for redefinida) antes de a leitura terminar, a salva é descartada
  useEffect(() => {
    let isCancelled = false
    const request = lastRequest.current
    loadStoredArtwork().then((stored) => {
      if (stored && !isCancelled && request === lastRequest.current) setArtwork(toArtwork(stored))
    })
    return () => {
      isCancelled = true
    }
  }, [])

  // O cache da textura é limpo pela cena (ver SceneContent), para este hook
  // não puxar o drei para o pacote inicial
  const artworkUrl = artwork?.url ?? null
  useEffect(() => {
    if (!artworkUrl) return
    return () => URL.revokeObjectURL(artworkUrl)
  }, [artworkUrl])

  /** Aplica e salva uma arte que já passou por prepareArtwork, descartando a que ainda estava em preparo. */
  const applyArtwork = useCallback((blob: Blob) => {
    lastRequest.current++
    setIsProcessing(false)
    setError(null)
    setArtwork(toArtwork(blob))
    storeArtwork(blob)
  }, [])

  const selectArtwork = useCallback(async (file: File) => {
    const request = ++lastRequest.current
    setError(null)
    setIsProcessing(true)
    try {
      const blob = await prepareArtwork(file)
      // Ignora o resultado se outro arquivo foi escolhido nesse meio tempo
      if (request !== lastRequest.current) return
      setArtwork(toArtwork(blob))
      storeArtwork(blob)
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
    setArtwork(null)
    clearStoredArtwork()
  }, [])

  const dismissError = useCallback(() => setError(null), [])

  return { artwork, error, isProcessing, selectArtwork, applyArtwork, resetArtwork, dismissError }
}

export type ArtworkController = ReturnType<typeof useArtwork>
