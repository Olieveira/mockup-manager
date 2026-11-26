/**
 * Gera public/caixa-exemplo.webp, a arte padrão da caixa de embalagem: a faca
 * planificada inteira de um chá fictício, na proporção exata da faca. Assim a
 * caixa abre com a arte cobrindo as seis faces (e não só a frente, como uma
 * imagem qualquer) e não fica parecida com o quadro na biblioteca.
 *
 * A arte é um SVG desenhado em milímetros sobre as medidas de
 * models/packagingBoxDie.mjs, renderizado no Chromium (scripts/browser.mjs) e
 * convertido para webp. A fonte é a mesma da interface, lida do Fontsource.
 *
 * Uso: npm run artwork
 */
import { readFile, writeFile } from 'node:fs/promises'
import { launchChromium, pngToWebp } from './browser.mjs'
import {
  BACK_U,
  BODY_V,
  DEPTH,
  DIE_HEIGHT,
  DIE_WIDTH,
  FRONT_U,
  GLUE_FLAP,
  HEIGHT,
  LEFT_SIDE_U,
  RIGHT_SIDE_U,
  TUCK,
  WIDTH,
} from './models/packagingBoxDie.mjs'

const OUTPUT = new URL('../public/caixa-exemplo.webp', import.meta.url)
const FONT = new URL(
  '../node_modules/@fontsource-variable/schibsted-grotesk/files/schibsted-grotesk-latin-wght-normal.woff2',
  import.meta.url,
)
/** Resolução da arte: na frente da caixa (90mm) dá 540px, mais do que ela ocupa na tela. */
const PIXELS_PER_MM = 6
const QUALITY = 0.9

const COLORS = {
  paper: '#f3eee2',
  green: '#2f4a3a',
  yolk: '#e7b442',
  petal: '#fffdf6',
  ink: '#22332a',
}

/** Medidas em milímetros, como no SVG. */
const mm = (meters) => Math.round(meters * 1000 * 10) / 10
const die = { width: mm(DIE_WIDTH), height: mm(DIE_HEIGHT) }

/**
 * Retângulo de cada painel no SVG, com y crescendo para baixo. Na faca o v
 * cresce para cima (base do fundo em 0), então y = altura da faca - v - altura.
 */
function panel(u, v, width, height) {
  const [x, w, h] = [mm(u), mm(width), mm(height)]
  return { x, y: die.height - mm(v) - h, width: w, height: h, cx: x + w / 2 }
}

const body = { y: die.height - mm(BODY_V + HEIGHT), height: mm(HEIGHT) }
const panels = {
  glue: panel(0, BODY_V, GLUE_FLAP, HEIGHT),
  left: panel(LEFT_SIDE_U, BODY_V, DEPTH, HEIGHT),
  front: panel(FRONT_U, BODY_V, WIDTH, HEIGHT),
  right: panel(RIGHT_SIDE_U, BODY_V, DEPTH, HEIGHT),
  back: panel(BACK_U, BODY_V, WIDTH, HEIGHT),
  // A tampa sai de cima do verso e o fundo de baixo da frente
  lid: panel(BACK_U, BODY_V + HEIGHT, WIDTH, DEPTH),
  lidTuck: panel(BACK_U, BODY_V + HEIGHT + DEPTH, WIDTH, TUCK),
  bottom: panel(FRONT_U, TUCK, WIDTH, DEPTH),
  bottomTuck: panel(FRONT_U, 0, WIDTH, TUCK),
}

/** Faixa verde que dá a volta no corpo da caixa, da aba de cola ao verso. */
const band = { y: body.y + body.height * 0.52, height: body.height * 0.48 }

function rect({ x, y, width, height }, fill) {
  return `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${fill}"/>`
}

function text(x, y, content, { size, weight = 400, fill = COLORS.ink, anchor = 'middle', spacing = 0, transform = '' }) {
  return `<text x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}" letter-spacing="${spacing}"${
    transform ? ` transform="${transform}"` : ''
  }>${content}</text>`
}

/** Flor de camomila: pétalas em volta de um miolo. */
function flower(cx, cy, radius) {
  const petals = Array.from({ length: 14 }, (_, i) => {
    const angle = (i * 360) / 14
    return `<ellipse cx="${cx}" cy="${cy - radius * 0.62}" rx="${radius * 0.17}" ry="${radius * 0.42}" fill="${COLORS.petal}" transform="rotate(${angle} ${cx} ${cy})"/>`
  })
  return `${petals.join('')}<circle cx="${cx}" cy="${cy}" r="${radius * 0.3}" fill="${COLORS.yolk}"/>`
}

/** Código de barras de enfeite, com barras de largura fixa por posição (sempre o mesmo desenho). */
function barcode(x, y, width, height) {
  const widths = [1, 2, 1, 1, 3, 1, 2, 2, 1, 3, 1, 1, 2, 1, 3, 2, 1, 1, 2, 3, 1, 2, 1, 1, 3, 1, 2, 1]
  const unit = width / widths.reduce((sum, w) => sum + w * 2, 0)
  let cursor = x
  const bars = widths.map((w) => {
    const bar = `<rect x="${cursor}" y="${y}" width="${w * unit}" height="${height}" fill="${COLORS.ink}"/>`
    cursor += w * unit * 2
    return bar
  })
  return `${rect({ x: x - 3, y: y - 3, width: width + 6, height: height + 9 }, '#ffffff')}${bars.join('')}${text(
    x + width / 2,
    y + height + 4.5,
    '7 890000 000000',
    { size: 3, spacing: 0.4 },
  )}`
}

function lines(x, y, content, { size, gap, anchor = 'start', fill = COLORS.ink }) {
  return content.map((line, i) => text(x, y + i * gap, line, { size, anchor, fill })).join('')
}

function buildSvg(fontUrl) {
  const { left, front, right, back, lid } = panels
  const bandTop = band.y
  // No meio da parte clara da lateral, acima da faixa
  const sideLabelY = (body.y + bandTop) / 2
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${die.width} ${die.height}" width="${die.width * PIXELS_PER_MM}" height="${die.height * PIXELS_PER_MM}">
<style>@font-face{font-family:Schibsted;src:url(${fontUrl}) format("woff2");font-weight:400 900}text{font-family:Schibsted}</style>
${rect({ x: 0, y: 0, width: die.width, height: die.height }, '#ffffff')}
${Object.values(panels).map((item) => rect(item, COLORS.paper)).join('')}
${rect({ x: 0, y: band.y, width: die.width, height: band.height }, COLORS.green)}
${rect({ x: 0, y: band.y - 2.2, width: die.width, height: 1 }, COLORS.yolk)}
${rect(lid, COLORS.green)}
${rect(panels.bottom, COLORS.green)}

${text(front.cx, front.y + 17, 'CAMPO MANSO', { size: 4.2, weight: 700, spacing: 1.2, fill: COLORS.green })}
${text(front.cx, front.y + 40, 'Camomila', { size: 14, weight: 800 })}
${text(front.cx, front.y + 51, 'e mel', { size: 8, weight: 500 })}
${text(front.cx, front.y + 61, 'chá de ervas', { size: 4.4, weight: 500, spacing: 0.3 })}
${flower(front.cx, bandTop + 28, 22)}
${text(front.cx, front.y + front.height - 6, '20 sachês  ·  30 g', { size: 4, weight: 600, fill: COLORS.petal, spacing: 0.3 })}

${text(left.cx + 1.8, sideLabelY, 'CAMPO MANSO', { size: 5, weight: 800, spacing: 1.2, fill: COLORS.green, transform: `rotate(-90 ${left.cx} ${sideLabelY})` })}
${flower(left.cx, bandTop + 34, 13)}

${text(right.cx, body.y + 12, 'Modo de preparo', { size: 3.6, weight: 700 })}
${lines(right.cx, body.y + 20, ['Ferva 200 ml', 'de água, desligue', 'o fogo e abafe', 'o sachê por', '5 minutos.'], { size: 3.2, gap: 4.6, anchor: 'middle' })}
${text(right.cx, bandTop + 22, 'sem', { size: 4, weight: 500, fill: COLORS.petal })}
${text(right.cx, bandTop + 28, 'cafeína', { size: 4, weight: 700, fill: COLORS.petal })}

${text(back.x + 8, body.y + 14, 'Ingredientes', { size: 4.2, weight: 700, anchor: 'start' })}
${lines(back.x + 8, body.y + 22, ['Flores de camomila desidratadas', 'e aroma natural de mel.', '', 'Conservar em local seco e', 'longe da luz. Depois de aberto,', 'manter a caixa bem fechada.'], { size: 3.2, gap: 4.6 })}
${barcode(back.x + 14, bandTop + 14, 34, 14)}
${lines(back.x + back.width - 8, bandTop + 18, ['Arte de exemplo', 'faca 275 x 250 mm', 'troque pela sua'], { size: 3, gap: 4.4, anchor: 'end', fill: COLORS.petal })}

${text(lid.cx, lid.y + lid.height / 2 + 1.6, 'CAMPO MANSO', { size: 5, weight: 800, spacing: 1.4, fill: COLORS.petal, transform: `rotate(180 ${lid.cx} ${lid.y + lid.height / 2})` })}
</svg>`
}

const font = await readFile(FONT)
const svg = buildSvg(`data:font/woff2;base64,${font.toString('base64')}`)
const size = { width: die.width * PIXELS_PER_MM, height: die.height * PIXELS_PER_MM }

const browser = await launchChromium()
try {
  const page = await browser.newPage({ viewport: size })
  await page.setContent(`<body style="margin:0">${svg}</body>`)
  await page.evaluate(() => document.fonts.ready)
  const png = await page.locator('svg').screenshot()
  const webp = await pngToWebp(page, png, { ...size, quality: QUALITY })
  await writeFile(OUTPUT, webp)
  console.log(`${OUTPUT.pathname}: ${size.width}x${size.height}px, ${(webp.length / 1024).toFixed(1)}KB`)
} finally {
  await browser.close()
}
