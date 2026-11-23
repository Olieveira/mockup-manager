import { brand } from '../config/brand'
import type { BrandTheme } from '../config/brand'
import { DARK_SCHEME_QUERY, THEME_PREFERENCES, THEME_STORAGE_KEY } from '../config/theme'
import type { ThemePreference } from '../config/theme'

// O script inline em vite/brandHtml.ts repete esta lógica antes da primeira
// pintura, para evitar o flash de tema errado. Mantenha os dois em sincronia.

function isThemePreference(value: unknown): value is ThemePreference {
  return THEME_PREFERENCES.includes(value as ThemePreference)
}

export function readThemePreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    if (isThemePreference(stored)) return stored
  } catch {
    // Armazenamento bloqueado (modo privado em alguns navegadores)
  }
  return 'system'
}

export function storeThemePreference(preference: ThemePreference) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, preference)
  } catch {
    // Sem armazenamento a escolha vale só para esta visita
  }
}

export function resolveTheme(preference: ThemePreference): BrandTheme {
  if (preference !== 'system') return preference
  return window.matchMedia(DARK_SCHEME_QUERY).matches ? 'dark' : 'light'
}

/** Aplica o tema no documento e na cor da barra do navegador. */
export function applyTheme(preference: ThemePreference) {
  const theme = resolveTheme(preference)
  document.documentElement.classList.toggle('dark', theme === 'dark')
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', brand.colors[theme].chrome)
}
