import { useCallback, useEffect, useRef, useState } from 'react'
import { Header } from './components/Header'
import { ModelLibrary } from './components/ModelLibrary'
import { ModelSelector } from './components/ModelSelector'
import { PreferencesPanel } from './components/PreferencesPanel'
import { ViewMenu } from './components/ViewMenu'
import { Viewer } from './components/Viewer'
import type { SceneHandle } from './components/scene/Scene'
import { MODEL_IDS } from './components/scene/models/catalog'
import type { CameraView } from './config/cameraViews'
import { LANDSCAPE_SHORT_QUERY } from './config/layout'
import { useMediaQuery } from './hooks/useMediaQuery'
import { useSceneState } from './hooks/useSceneState'

function preventDefault(event: Event) {
  event.preventDefault()
}

export function App() {
  const { settings, model, updateSettings, selectModel, stepModel } = useSceneState()
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false)
  const [isLibraryOpen, setIsLibraryOpen] = useState(false)
  const isLandscapeShort = useMediaQuery(LANDSCAPE_SHORT_QUERY)
  const sceneRef = useRef<SceneHandle>(null)

  const closePreferences = useCallback(() => setIsPreferencesOpen(false), [])
  const closeLibrary = useCallback(() => setIsLibraryOpen(false), [])

  // Uma vista escolhida para o giro automático, senão ele tira a câmera de lá
  function selectView(view: CameraView) {
    sceneRef.current?.setView(view)
    if (settings.autoRotate) updateSettings({ autoRotate: false })
  }

  // Deitado, o seletor e o botão Vista ficam no meio da barra do cabeçalho.
  // Eles mudam de lugar no DOM, e não só na tela, para a ordem do Tab seguir a
  // ordem visual
  const modelSelector = (
    <ModelSelector index={MODEL_IDS.indexOf(model)} onStep={stepModel} onOpenLibrary={() => setIsLibraryOpen(true)} />
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
      <Header>
        {isLandscapeShort && (
          <div className="flex items-center gap-1">
            {modelSelector}
            <ViewMenu onSelect={selectView} />
          </div>
        )}
      </Header>
      <main className="flex min-h-0 flex-1 flex-col landscape-short:contents">
        <Viewer
          sceneRef={sceneRef}
          model={model}
          modelSelector={isLandscapeShort ? null : modelSelector}
          viewMenu={isLandscapeShort ? null : <ViewMenu onSelect={selectView} className="-mr-2.5" />}
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
        model={model}
        onSelect={selectModel}
        onClose={closeLibrary}
      />
    </div>
  )
}
