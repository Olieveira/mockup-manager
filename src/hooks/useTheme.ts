import { useCallback, useEffect, useState } from 'react'
import { DARK_SCHEME_QUERY, THEME_STORAGE_KEY } from '../config/theme'
import type { ThemePreference } from '../config/theme'
import { applyTheme, readThemePreference, storeThemePreference } from '../lib/theme'

/**
 * Preferência de tema (claro, escuro ou do sistema), salva no navegador.
 * No modo do sistema acompanha a mudança do sistema operacional em tempo real.
 */
export function useTheme() {
  const [preference, setPreference] = useState(readThemePreference)

  useEffect(() => {
    applyTheme(preference)
    if (preference !== 'system') return

    const media = window.matchMedia(DARK_SCHEME_QUERY)
    const handleChange = () => applyTheme('system')
    media.addEventListener('change', handleChange)
    return () => media.removeEventListener('change', handleChange)
  }, [preference])

  // Mantém outras abas abertas com a mesma escolha
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === THEME_STORAGE_KEY) setPreference(readThemePreference())
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const changePreference = useCallback((next: ThemePreference) => {
    storeThemePreference(next)
    setPreference(next)
  }, [])

  return { preference, setPreference: changePreference }
}
