import type { HtmlTagDescriptor, Plugin } from 'vite'
import { brand } from '../src/config/brand'

function escapeHtml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function meta(attrs: Record<string, string>): HtmlTagDescriptor {
  return { tag: 'meta', attrs, injectTo: 'head' }
}

function link(rel: string, href: string, type?: string): HtmlTagDescriptor {
  return { tag: 'link', attrs: { rel, href, ...(type && { type }) }, injectTo: 'head' }
}

/** Variáveis de marca consumidas pelos tokens de src/index.css. */
function brandStyle() {
  const block = (colors: (typeof brand.colors)[keyof typeof brand.colors]) =>
    `--brand-accent:${colors.accent};--brand-on-accent:${colors.onAccent};--brand-chrome:${colors.chrome};`
  return `:root{${block(brand.colors.light)}}:root.dark{${block(brand.colors.dark)}}`
}

/**
 * Preenche o index.html com os dados de src/config/brand.ts, para que nome,
 * descrição, ícones e cores fiquem definidos em um único lugar.
 */
export function brandHtml(): Plugin {
  return {
    name: 'brand-html',
    transformIndexHtml(html) {
      const document = html
        .replace(/<html lang="[^"]*"/, `<html lang="${escapeHtml(brand.lang)}"`)
        .replace(/<title>.*<\/title>/, `<title>${escapeHtml(brand.name)}</title>`)

      const tags: HtmlTagDescriptor[] = [
        meta({ name: 'description', content: brand.description }),
        meta({ name: 'theme-color', content: brand.colors.light.chrome }),
        meta({ property: 'og:title', content: brand.name }),
        meta({ property: 'og:description', content: brand.shareDescription }),
        meta({ property: 'og:image', content: brand.icons.shareImage }),
        meta({ property: 'og:type', content: 'website' }),
        link('icon', brand.icons.favicon, 'image/png'),
        link('apple-touch-icon', brand.icons.appleTouch),
        { tag: 'style', attrs: { id: 'brand-colors' }, children: brandStyle(), injectTo: 'head' },
      ]

      return { html: document, tags }
    },
  }
}
