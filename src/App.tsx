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
    <div className="flex h-dvh flex-col">
      <Header />
      <main className="flex min-h-0 flex-1 flex-col">
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
