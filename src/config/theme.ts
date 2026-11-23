// Lido também pelo Vite em Node (vite/brandHtml.ts), então não pode usar APIs do navegador

export const THEME_PREFERENCES = ['light', 'dark', 'system'] as const

export type ThemePreference = (typeof THEME_PREFERENCES)[number]

export const THEME_STORAGE_KEY = 'theme-preference'

export const DARK_SCHEME_QUERY = '(prefers-color-scheme: dark)'
