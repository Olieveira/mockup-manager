/**
 * Chromium do Playwright para os scripts que geram imagens (miniaturas e arte
 * de exemplo). Usa o que o Playwright instala (npx playwright-core install
 * --only-shell chromium) ou o caminho em CHROMIUM_PATH. O WebGL roda por
 * software, então a mesma imagem sai em qualquer máquina.
 */
import { existsSync, readdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { chromium } from 'playwright-core'

/**
 * O Chromium esperado por esta versão do Playwright ou, se ele não estiver
 * instalado, o mais recente que já estiver na pasta de navegadores.
 */
function findChromium() {
  if (process.env.CHROMIUM_PATH) return process.env.CHROMIUM_PATH
  if (existsSync(chromium.executablePath())) return chromium.executablePath()

  const root = process.env.PLAYWRIGHT_BROWSERS_PATH ?? join(homedir(), '.cache', 'ms-playwright')
  const candidates = existsSync(root) ? readdirSync(root).filter((name) => /^chromium(_headless_shell)?-\d+$/.test(name)) : []
  const binaries = candidates
    .sort((a, b) => Number(b.split('-').pop()) - Number(a.split('-').pop()))
    .map((name) =>
      name.startsWith('chromium_headless_shell')
        ? join(root, name, 'chrome-headless-shell-linux64', 'chrome-headless-shell')
        : join(root, name, 'chrome-linux64', 'chrome'),
    )
  const found = binaries.find((path) => existsSync(path))
  if (found) return found

  throw new Error(
    'Chromium não encontrado. Instale com "npx playwright-core install --only-shell chromium" ou informe o caminho em CHROMIUM_PATH.',
  )
}

export function launchChromium() {
  return chromium.launch({
    executablePath: findChromium(),
    args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
  })
}

/** Redimensiona um PNG para width x height e o converte para webp dentro do navegador. */
export async function pngToWebp(page, png, { width, height, quality }) {
  const dataUrl = await page.evaluate(
    async ({ base64, width, height, quality }) => {
      const bitmap = await createImageBitmap(await (await fetch(`data:image/png;base64,${base64}`)).blob())
      const canvas = new OffscreenCanvas(width, height)
      const context = canvas.getContext('2d')
      context.imageSmoothingQuality = 'high'
      context.drawImage(bitmap, 0, 0, width, height)
      const blob = await canvas.convertToBlob({ type: 'image/webp', quality })
      const reader = new FileReader()
      return new Promise((resolve) => {
        reader.onload = () => resolve(reader.result)
        reader.readAsDataURL(blob)
      })
    },
    { base64: png.toString('base64'), width, height, quality },
  )
  if (!dataUrl.startsWith('data:image/webp')) throw new Error('O navegador não gerou webp.')
  return Buffer.from(dataUrl.split(',')[1], 'base64')
}
