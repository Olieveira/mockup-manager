/**
 * Gera as miniaturas da biblioteca de modelos em public/thumbnails/<id>.webp.
 *
 * Sobe o app com o servidor do Vite, abre no Chromium do Playwright e passa por
 * cada modelo do catálogo na vista inicial do desktop, sobre fundo cinza claro
 * e com a arte padrão. Cada palco é capturado, recortado em quadrado e
 * convertido para webp no próprio navegador. As miniaturas são imagens, e não
 * cenas 3D, para a biblioteca não puxar o three para o pacote inicial.
 *
 * O Chromium vem de scripts/browser.mjs.
 *
 * Uso: npm run thumbnails
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { createServer } from 'vite'
import { launchChromium, pngToWebp } from './browser.mjs'

const OUTPUT_DIR = new URL('../public/thumbnails/', import.meta.url)
/** Lado da miniatura em pixels: o dobro do maior cartão da biblioteca, para telas de alta densidade. */
const SIZE = 320
const QUALITY = 0.85
const BACKGROUND = 'Cinza claro'
const VIEWPORT = { width: 1280, height: 800 }
/** Tempo para a sombra de contato e o cenário assentarem depois da troca de modelo. */
const SETTLE_MS = 3000
const TIMEOUT_MS = 180_000

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
const browser = await launchChromium()

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
    const webp = await pngToWebp(page, await page.screenshot({ clip }), { width: SIZE, height: SIZE, quality: QUALITY })
    await writeFile(new URL(`${id}.webp`, OUTPUT_DIR), webp)
    console.log(`thumbnails/${id}.webp: ${(webp.length / 1024).toFixed(1)}KB`)
  }
} finally {
  await browser.close()
  await server.close()
}
