/**
 * Gera as miniaturas da biblioteca de modelos em public/thumbnails/<id>.webp.
 *
 * Sobe o app com o servidor do Vite, abre no Chromium do Playwright e passa por
 * cada modelo do catálogo na vista inicial do desktop, sobre fundo cinza claro
 * e com a arte padrão. Cada palco é capturado, recortado em quadrado e
 * convertido para webp no próprio navegador. As miniaturas são imagens, e não
 * cenas 3D, para a biblioteca não puxar o three para o pacote inicial.
 *
 * Usa o Chromium que o Playwright instala (npx playwright-core install
 * --only-shell chromium) ou o caminho em CHROMIUM_PATH. O WebGL roda por
 * software, então a mesma imagem sai em qualquer máquina.
 *
 * Uso: npm run thumbnails
 */
import { existsSync, readdirSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { chromium } from 'playwright-core'
import { createServer } from 'vite'

const OUTPUT_DIR = new URL('../public/thumbnails/', import.meta.url)
/** Lado da miniatura em pixels: o dobro do maior cartão da biblioteca, para telas de alta densidade. */
const SIZE = 320
const QUALITY = 0.85
const BACKGROUND = 'Cinza claro'
const VIEWPORT = { width: 1280, height: 800 }
/** Tempo para a sombra de contato e o cenário assentarem depois da troca de modelo. */
const SETTLE_MS = 3000
const TIMEOUT_MS = 180_000

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

/** Recorta a captura do palco e a converte para webp dentro do navegador. */
async function toWebp(page, png) {
  const dataUrl = await page.evaluate(
    async ({ base64, size, quality }) => {
      const bitmap = await createImageBitmap(await (await fetch(`data:image/png;base64,${base64}`)).blob())
      const canvas = new OffscreenCanvas(size, size)
      const context = canvas.getContext('2d')
      context.imageSmoothingQuality = 'high'
      context.drawImage(bitmap, 0, 0, size, size)
      const blob = await canvas.convertToBlob({ type: 'image/webp', quality })
      const reader = new FileReader()
      return new Promise((resolve) => {
        reader.onload = () => resolve(reader.result)
        reader.readAsDataURL(blob)
      })
    },
    { base64: png.toString('base64'), size: SIZE, quality: QUALITY },
  )
  if (!dataUrl.startsWith('data:image/webp')) throw new Error('O navegador não gerou webp.')
  return Buffer.from(dataUrl.split(',')[1], 'base64')
}

/** Espera a troca de modelo terminar: sem régua de progresso no palco e com tempo para a sombra. */
async function waitForStage(page) {
  await page.waitForSelector('button:has-text("Exportar"):not([disabled])', { timeout: TIMEOUT_MS })
  await page.waitForFunction(() => !/Carregando|Aplicando/.test(document.body.innerText), null, {
    timeout: TIMEOUT_MS,
  })
  await page.waitForTimeout(SETTLE_MS)
}

async function chooseBackground(page) {
  await page.getByRole('button', { name: 'Ajustes', exact: true }).click()
  await page.getByText('Cor sólida', { exact: true }).click()
  await page.locator(`label:has(input[aria-label="${BACKGROUND}"])`).click()
  await page.keyboard.press('Escape')
}

const server = await createServer({ logLevel: 'error', server: { port: 5190 } })
const browser = await chromium.launch({
  executablePath: findChromium(),
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
})

try {
  await server.listen()
  const { MODEL_CATALOG, MODEL_IDS } = await server.ssrLoadModule('/src/components/scene/models/catalog.ts')
  const page = await browser.newPage({ viewport: VIEWPORT, colorScheme: 'light' })
  page.on('pageerror', (error) => console.error(error.message))
  await page.goto(server.resolvedUrls.local[0])
  await waitForStage(page)
  await chooseBackground(page)
  await mkdir(OUTPUT_DIR, { recursive: true })

  for (const [index, id] of MODEL_IDS.entries()) {
    if (index > 0) {
      await page.getByRole('button', { name: 'Próximo mockup' }).click()
      await page.mouse.move(0, 0)
    }
    await page.waitForFunction((label) => document.body.innerText.includes(label), MODEL_CATALOG[id].label)
    await waitForStage(page)

    const stage = await page.locator('canvas').boundingBox()
    // Quadrado com a altura do palco, no centro: a câmera enquadra todos os
    // modelos nessa altura, com folga para a sombra
    const side = Math.round(stage.height)
    const clip = {
      x: Math.round(stage.x + (stage.width - side) / 2),
      y: Math.round(stage.y + (stage.height - side) / 2),
      width: side,
      height: side,
    }
    const webp = await toWebp(page, await page.screenshot({ clip }))
    await writeFile(new URL(`${id}.webp`, OUTPUT_DIR), webp)
    console.log(`thumbnails/${id}.webp: ${(webp.length / 1024).toFixed(1)}KB`)
  }
} finally {
  await browser.close()
  await server.close()
}
