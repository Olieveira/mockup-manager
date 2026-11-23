import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence } from 'motion/react'
import { Header } from './components/Header'
import { PreferencesModal } from './components/PreferencesModal'
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
    <div className="flex min-h-dvh flex-col bg-linear-to-br from-gray-800 to-slate-950">
      <Header />
      <main className="flex flex-1 justify-center p-2">
        <Viewer
          settings={settings}
          onToggleAutoRotate={() => updateSettings({ autoRotate: !settings.autoRotate })}
          onOpenPreferences={() => setIsPreferencesOpen(true)}
        />
      </main>
      <AnimatePresence>
        {isPreferencesOpen && (
          <PreferencesModal settings={settings} onChange={updateSettings} onClose={closePreferences} />
        )}
      </AnimatePresence>
    </div>
  )
}
