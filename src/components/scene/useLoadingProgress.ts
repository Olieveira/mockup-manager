import { useSyncExternalStore } from 'react'
import { DefaultLoadingManager } from 'three'

export interface LoadingProgress {
  /** Arquivos já baixados no lote atual. */
  done: number
  /** Total de arquivos do lote atual, ou 0 enquanto ainda não se sabe. */
  total: number
}

const IDLE: LoadingProgress = { done: 0, total: 0 }

let progress = IDLE
let batchStart = 0
const listeners = new Set<() => void>()

function publish(next: LoadingProgress) {
  progress = next
  listeners.forEach((listener) => listener())
}

// Todos os loaders da cena (GLTF, texturas e HDRI dos cenários) usam o
// gerenciador padrão do three. Nada mais no app ocupa estes callbacks; se
// algum dia o <Loader> ou o useProgress do drei entrarem, eles os disputam.
// O three só informa o total quando um arquivo termina, então o lote começa
// com total desconhecido em vez de mostrar uma contagem que logo muda
DefaultLoadingManager.onStart = (_url, loaded) => {
  batchStart = loaded
  publish(IDLE)
}
DefaultLoadingManager.onProgress = (_url, loaded, total) => {
  publish({ done: loaded - batchStart, total: total - batchStart })
}
DefaultLoadingManager.onLoad = () => publish(IDLE)

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** Progresso dos arquivos que a cena está baixando agora. */
export function useLoadingProgress() {
  return useSyncExternalStore(subscribe, () => progress)
}
