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
import { FINE_POINTER_QUERY, LANDSCAPE_SHORT_QUERY } from './config/layout'
import { useArtwork } from './hooks/useArtwork'
import { useMediaQuery } from './hooks/useMediaQuery'
import { useSceneFile } from './hooks/useSceneFile'
import { useScenePresets } from './hooks/useScenePresets'
import { useSceneState } from './hooks/useSceneState'
import { useViewShortcuts } from './hooks/useViewShortcuts'

function preventDefault(event: Event) {
  event.preventDefault()
}

export function App() {
  const { settings, model, updateSettings, selectModel, stepModel, loadScene } = useSceneState()
  // Arte e predefinições ficam aqui porque o palco e o painel mexem nelas
  const artwork = useArtwork()
  const scenePresets = useScenePresets()
  const sceneFile = useSceneFile({ model, settings, artwork, presets: scenePresets, loadScene })
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false)
  const [isLibraryOpen, setIsLibraryOpen] = useState(false)
  const isLandscapeShort = useMediaQuery(LANDSCAPE_SHORT_QUERY)
  // Atalhos da câmera só com mouse ou trackpad, como a dica acima do palco
  const hasShortcuts = useMediaQuery(FINE_POINTER_QUERY)
  const sceneRef = useRef<SceneHandle>(null)

  const closePreferences = useCallback(() => setIsPreferencesOpen(false), [])
  const closeLibrary = useCallback(() => setIsLibraryOpen(false), [])

  // Os painéis ocupam o mesmo lugar e, sem modal, um não impede de abrir o
  // outro: abrir um fecha o outro
  function openPreferences() {
    setIsLibraryOpen(false)
    setIsPreferencesOpen(true)
  }

  function openLibrary() {
    setIsPreferencesOpen(false)
    setIsLibraryOpen(true)
  }

  // Uma vista escolhida para o giro automático, senão ele tira a câmera de lá
  const { autoRotate } = settings
  const selectView = useCallback(
    (view: CameraView) => {
      sceneRef.current?.setView(view)
      if (autoRotate) updateSettings({ autoRotate: false })
    },
    [autoRotate, updateSettings],
  )
  useViewShortcuts(hasShortcuts, selectView)

  // Deitado, o seletor e o botão Vista ficam no meio da barra do cabeçalho.
  // Eles mudam de lugar no DOM, e não só na tela, para a ordem do Tab seguir a
  // ordem visual
  const modelSelector = (
    <ModelSelector index={MODEL_IDS.indexOf(model)} onStep={stepModel} onOpenLibrary={openLibrary} />
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
            <ViewMenu onSelect={selectView} showShortcuts={hasShortcuts} />
          </div>
        )}
      </Header>
      <main className="flex min-h-0 flex-1 flex-col landscape-short:contents">
        <Viewer
          sceneRef={sceneRef}
          model={model}
          modelSelector={isLandscapeShort ? null : modelSelector}
          viewMenu={
            isLandscapeShort ? null : <ViewMenu onSelect={selectView} showShortcuts={hasShortcuts} className="-mr-2.5" />
          }
          onResetView={hasShortcuts ? () => selectView('initial') : undefined}
          settings={settings}
          artwork={artwork}
          onOpenFile={sceneFile.openFile}
          isOpeningFile={sceneFile.isOpening}
          onToggleAutoRotate={() => updateSettings({ autoRotate: !settings.autoRotate })}
          onOpenPreferences={openPreferences}
        />
      </main>
      <PreferencesPanel
        open={isPreferencesOpen}
        settings={settings}
        presets={scenePresets}
        sceneFile={sceneFile}
        artwork={artwork.artwork?.blob ?? null}
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
