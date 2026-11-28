import { useCallback, useEffect, useState } from 'react'
import { MODEL_IDS } from '../components/scene/models/catalog'
import type { ModelId } from '../components/scene/models/catalog'
import type { SceneSettings } from '../config/scene'
import { readSceneState, writeSceneState } from '../lib/sceneStorage'
import type { SceneState } from '../lib/sceneStorage'

/** Espera os controles deslizantes pararem antes de gravar, em vez de gravar a cada passo. */
const SAVE_DELAY_MS = 400

/**
 * Ajustes da cena e modelo escolhido, salvos no navegador para voltarem
 * iguais ao recarregar a página. Não acompanha outras abas: cada uma pode
 * estar montando uma cena diferente, e a última a mudar é a que fica salva.
 */
export function useSceneState() {
  const [state, setState] = useState(readSceneState)

  useEffect(() => {
    const save = () => writeSceneState(state)
    const timer = setTimeout(save, SAVE_DELAY_MS)
    // O Safari do iPhone pode descartar a aba em segundo plano sem aviso:
    // ao sair dela, grava na hora o que ainda estava esperando
    const saveIfHidden = () => document.visibilityState === 'hidden' && save()
    document.addEventListener('visibilitychange', saveIfHidden)
    window.addEventListener('pagehide', save)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('visibilitychange', saveIfHidden)
      window.removeEventListener('pagehide', save)
    }
  }, [state])

  const updateSettings = useCallback((changes: Partial<SceneSettings>) => {
    setState((current) => ({ ...current, settings: { ...current.settings, ...changes } }))
  }, [])

  const selectModel = useCallback((model: ModelId) => {
    setState((current) => ({ ...current, model }))
  }, [])

  /** Troca a cena inteira de uma vez, como ao abrir um arquivo. */
  const loadScene = useCallback((scene: SceneState) => setState(scene), [])

  /** Passa para o modelo vizinho no catálogo, em ciclo. */
  const stepModel = useCallback((step: number) => {
    setState((current) => {
      const index = MODEL_IDS.indexOf(current.model)
      return { ...current, model: MODEL_IDS[(index + step + MODEL_IDS.length) % MODEL_IDS.length] }
    })
  }, [])

  return { settings: state.settings, model: state.model, updateSettings, selectModel, stepModel, loadScene }
}
