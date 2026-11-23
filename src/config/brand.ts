/**
 * Identidade do app em um só lugar. Este arquivo alimenta o header, o
 * <title>, as meta tags e o favicon do index.html (via vite/brandHtml.ts) e
 * as cores de marca usadas pelos tokens em src/index.css.
 *
 * Tudo aqui é PROVISÓRIO até a marca ser definida. Para trocar:
 * - nome e textos: edite os campos abaixo
 * - logo: substitua o placeholder em src/components/brand/Logo.tsx
 * - ícones: troque os arquivos em public/ ou aponte para novos caminhos
 * - cores: edite `colors`. O padrão é monocromático (destaque na cor da tinta)
 *
 * Este módulo também é lido pelo Vite em Node, então não pode importar nada
 * do navegador nem do React.
 */
export const brand = {
  name: 'Mockup Viewer',
  description:
    'Crie mockups 3D com arte personalizada e exporte imagens direto do navegador. Rápido, visual e gratuito.',
  shareDescription: 'Crie mockups 3D com arte personalizada e exportação em tempo real.',
  lang: 'pt-BR',

  icons: {
    favicon: '/favicon.png',
    appleTouch: '/apple-touch-icon.png',
    shareImage: '/icon.png',
  },

  /**
   * Cores de marca por tema, em hex para facilitar a troca.
   * - accent: botão principal e controles ativos
   * - onAccent: texto e ícones sobre o accent
   * - chrome: fundo do header e cor da barra do navegador (meta theme-color)
   */
  colors: {
    light: { accent: '#262626', onAccent: '#fafafa', chrome: '#fafafa' },
    dark: { accent: '#ededed', onAccent: '#1c1c1c', chrome: '#212121' },
  },
} as const

export type BrandTheme = keyof typeof brand.colors
