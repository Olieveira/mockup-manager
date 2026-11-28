import { useEffect } from 'react'
import { CAMERA_VIEWS } from '../config/cameraViews'
import type { CameraView } from '../config/cameraViews'

/** Campos em que a pessoa digita, onde os números são texto e não atalhos. */
function isTextField(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) return true
  return target instanceof HTMLInputElement && !['radio', 'checkbox', 'range', 'button', 'color'].includes(target.type)
}

/** Teclas 1 a 5 para as vistas da câmera, na ordem do menu Vista. */
export function useViewShortcuts(enabled: boolean, onSelect: (view: CameraView) => void) {
  useEffect(() => {
    if (!enabled) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.repeat || event.ctrlKey || event.altKey || event.metaKey) return
      if (isTextField(event.target)) return
      const view = CAMERA_VIEWS.find(({ shortcut }) => shortcut === event.key)
      if (!view) return
      event.preventDefault()
      onSelect(view.id)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [enabled, onSelect])
}
