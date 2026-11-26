import { useCallback, useEffect, useState } from 'react'
import { Header } from './components/Header'
import { ModelLibrary } from './components/ModelLibrary'
import { ModelSelector } from './components/ModelSelector'
import { PreferencesPanel } from './components/PreferencesPanel'
import { Viewer } from './components/Viewer'
import { MODEL_IDS } from './components/scene/models/catalog'
import type { ModelId } from './components/scene/models/catalog'
import { LANDSCAPE_SHORT_QUERY } from './config/layout'
import { DEFAULT_SCENE_SETTINGS } from './config/scene'
import type { SceneSettings } from './config/scene'
import { useMediaQuery } from './hooks/useMediaQuery'

function preventDefault(event: Event) {
  event.preventDefault()
}

export function App() {
  const [settings, setSettings] = useState(DEFAULT_SCENE_SETTINGS)
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false)
  const [isLibraryOpen, setIsLibraryOpen] = useState(false)
  const [modelIndex, setModelIndex] = useState(0)
  const isLandscapeShort = useMediaQuery(LANDSCAPE_SHORT_QUERY)

  const updateSettings = useCallback((changes: Partial<SceneSettings>) => {
    setSettings((current) => ({ ...current, ...changes }))
  }, [])

  const closePreferences = useCallback(() => setIsPreferencesOpen(false), [])
  const closeLibrary = useCallback(() => setIsLibraryOpen(false), [])
  const selectModel = useCallback((model: ModelId) => setModelIndex(MODEL_IDS.indexOf(model)), [])

  const stepModel = useCallback((step: number) => {
    setModelIndex((index) => (index + step + MODEL_IDS.length) % MODEL_IDS.length)
  }, [])

  // Deitado, o seletor fica no meio da barra do cabeçalho. Ele muda de lugar no
  // DOM, e não só na tela, para a ordem do Tab seguir a ordem visual
  const modelSelector = (
    <ModelSelector index={modelIndex} onStep={stepModel} onOpenLibrary={() => setIsLibraryOpen(true)} />
  )

  // Evita que o navegador abra um arquivo solto fora da área do mockup
  useEffect(() => {
    window.addEventListener('dragover', preventDefault)
    window.addEventListener('drop', preventDefault)
    return () => {
      window.removeEventListener('dragover', preventDefault)
      window.removeEventListener('drop', preventDefault)
    }
  }, [])

  return (
    // Deitado, a página vira uma grade de duas colunas (conteúdo e trilho de
    // ações) e o <main> e o Viewer cedem os filhos a ela com display: contents
    <div className="flex h-dvh flex-col landscape-short:grid landscape-short:grid-cols-[minmax(0,1fr)_auto] landscape-short:grid-rows-[auto_minmax(0,1fr)]">
      <Header>{isLandscapeShort && modelSelector}</Header>
      <main className="flex min-h-0 flex-1 flex-col landscape-short:contents">
        <Viewer
          model={MODEL_IDS[modelIndex]}
          modelSelector={isLandscapeShort ? null : modelSelector}
          settings={settings}
          onToggleAutoRotate={() => updateSettings({ autoRotate: !settings.autoRotate })}
          onOpenPreferences={() => setIsPreferencesOpen(true)}
        />
      </main>
      <PreferencesPanel
        open={isPreferencesOpen}
        settings={settings}
        onChange={updateSettings}
        onClose={closePreferences}
      />
      <ModelLibrary
        open={isLibraryOpen}
        model={MODEL_IDS[modelIndex]}
        onSelect={selectModel}
        onClose={closeLibrary}
      />
    </div>
  )
}
