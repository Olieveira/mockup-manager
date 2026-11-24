import { useCallback, useEffect, useState } from 'react'
import { Header } from './components/Header'
import { PreferencesPanel } from './components/PreferencesPanel'
import { Viewer } from './components/Viewer'
import { DEFAULT_SCENE_SETTINGS } from './config/scene'
import type { SceneSettings } from './config/scene'

function preventDefault(event: Event) {
  event.preventDefault()
}

export function App() {
  const [settings, setSettings] = useState(DEFAULT_SCENE_SETTINGS)
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false)

  const updateSettings = useCallback((changes: Partial<SceneSettings>) => {
    setSettings((current) => ({ ...current, ...changes }))
  }, [])

  const closePreferences = useCallback(() => setIsPreferencesOpen(false), [])

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
      <Header />
      <main className="flex min-h-0 flex-1 flex-col landscape-short:contents">
        <Viewer
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
    </div>
  )
}
