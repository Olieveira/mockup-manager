import { useEffect, useState } from 'react'
import type { SceneSettings } from '../config/scene'
import {
  isSamePresetName,
  isScenePresetsKey,
  readScenePresets,
  writeScenePresets,
} from '../lib/sceneStorage'

/**
 * Predefinições de cena salvas no navegador. Diferente do último estado, a
 * lista acompanha as outras abas abertas: uma predefinição salva numa aparece
 * na outra.
 */
export function useScenePresets() {
  const [presets, setPresets] = useState(readScenePresets)

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (isScenePresetsKey(event.key)) setPresets(readScenePresets())
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  function update(next: typeof presets) {
    writeScenePresets(next)
    setPresets(next)
  }

  /** Salva com o nome dado. Um nome que já existe tem a predefinição substituída, no mesmo lugar da lista. */
  function savePreset(name: string, settings: SceneSettings) {
    const preset = { name: name.trim(), settings }
    const index = presets.findIndex((item) => isSamePresetName(item.name, preset.name))
    update(index === -1 ? [...presets, preset] : presets.map((item, i) => (i === index ? preset : item)))
  }

  function removePreset(name: string) {
    update(presets.filter((item) => !isSamePresetName(item.name, name)))
  }

  return { presets, savePreset, removePreset }
}
