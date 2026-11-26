/**
 * Gera public/quadro.glb: quadro em tela esticada (canvas) de 30x40cm com
 * chassi de 3cm, montado só com geometria do three.
 *
 * A arte cobre a frente e dobra nas quatro bordas, como na impressão real.
 * O UV da malha "Arte" segue a tela planificada em proporção física: a frente
 * fica no miolo da imagem e cada borda na faixa de 3cm em volta. Os cantos da
 * imagem ficam de fora, já que na tela eles viram a dobra escondida no verso.
 *
 * Medidas em metros (padrão do glTF), com a frente virada para +z, o centro em
 * x = z = 0 e a base abaixo da origem, como a sombra de contato da cena espera.
 *
 * Uso: npm run models
 */
import { Box3, BoxGeometry, Group, Mesh, MeshStandardMaterial, PlaneGeometry } from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { exportGlb } from './exportGlb.mjs'

const OUTPUT = new URL('../../public/quadro.glb', import.meta.url)

const WIDTH = 0.3
const HEIGHT = 0.4
const DEPTH = 0.03
/** Tamanho da área de impressão: a frente mais uma borda de cada lado. */
const PRINT_WIDTH = WIDTH + 2 * DEPTH
const PRINT_HEIGHT = HEIGHT + 2 * DEPTH
/** Largura das ripas do chassi. */
const BAR = 0.04
/** Quanto da tela dobra para o verso, por cima das ripas. */
const FOLD = 0.025
/** Folga entre camadas que se sobrepõem, para não disputarem o mesmo pixel. */
const GAP = 0.001
const STAPLE = { length: 0.01, width: 0.0012, thickness: 0.0006 }
const STAPLES_PER_SIDE = { horizontal: 4, vertical: 5 }

const HALF_W = WIDTH / 2
const HALF_H = HEIGHT / 2
const HALF_D = DEPTH / 2

/**
 * Leva um ponto da superfície impressa para a tela planificada. Na frente o
 * ponto fica onde está; numa borda ele se afasta do contorno da frente o
 * quanto já desceu em direção ao verso.
 */
const UNFOLD = {
  front: (x, y) => [x, y],
  right: (x, y, z) => [HALF_W + (HALF_D - z), y],
  left: (x, y, z) => [-HALF_W - (HALF_D - z), y],
  top: (x, y, z) => [x, HALF_H + (HALF_D - z)],
  bottom: (x, y, z) => [x, -HALF_H - (HALF_D - z)],
}

/** Grava no UV a posição de cada vértice na tela planificada (0 a 1 na imagem inteira). */
function mapPrintUv(geometry, unfold) {
  const position = geometry.getAttribute('position')
  const uv = geometry.getAttribute('uv')
  for (let i = 0; i < position.count; i++) {
    const [x, y] = unfold(position.getX(i), position.getY(i), position.getZ(i))
    // v cresce para cima, como a textura carregada com flipY no app
    uv.setXY(i, x / PRINT_WIDTH + 0.5, y / PRINT_HEIGHT + 0.5)
  }
  return geometry
}

function buildArtwork() {
  const faces = [
    mapPrintUv(new PlaneGeometry(WIDTH, HEIGHT).translate(0, 0, HALF_D), UNFOLD.front),
    mapPrintUv(new PlaneGeometry(DEPTH, HEIGHT).rotateY(Math.PI / 2).translate(HALF_W, 0, 0), UNFOLD.right),
    mapPrintUv(new PlaneGeometry(DEPTH, HEIGHT).rotateY(-Math.PI / 2).translate(-HALF_W, 0, 0), UNFOLD.left),
    mapPrintUv(new PlaneGeometry(WIDTH, DEPTH).rotateX(-Math.PI / 2).translate(0, HALF_H, 0), UNFOLD.top),
    mapPrintUv(new PlaneGeometry(WIDTH, DEPTH).rotateX(Math.PI / 2).translate(0, -HALF_H, 0), UNFOLD.bottom),
  ]
  const material = new MeshStandardMaterial({ name: 'Arte', color: 0xffffff, roughness: 0.85, metalness: 0 })
  const mesh = new Mesh(mergeGeometries(faces), material)
  mesh.name = 'Arte'
  // Vai para os extras do glTF: o app recorta a arte nesta proporção
  mesh.userData.printSize = [PRINT_WIDTH, PRINT_HEIGHT]
  return mesh
}

/** Plano virado para o verso (-z) com o centro e o tamanho informados. */
function backPlane(width, height, x, y, z) {
  return new PlaneGeometry(width, height).rotateY(Math.PI).translate(x, y, z)
}

function withoutUv(geometry) {
  geometry.deleteAttribute('uv')
  return geometry
}

/** O avesso da tela, visto pelo vão do chassi, e a dobra presa nas ripas. */
function buildLinen() {
  const innerHeight = HEIGHT - 2 * FOLD
  const parts = [
    backPlane(WIDTH - 2 * GAP, HEIGHT - 2 * GAP, 0, 0, HALF_D - GAP / 2),
    backPlane(WIDTH, FOLD, 0, HALF_H - FOLD / 2, -HALF_D),
    backPlane(WIDTH, FOLD, 0, -HALF_H + FOLD / 2, -HALF_D),
    backPlane(FOLD, innerHeight, HALF_W - FOLD / 2, 0, -HALF_D),
    backPlane(FOLD, innerHeight, -HALF_W + FOLD / 2, 0, -HALF_D),
  ]
  const material = new MeshStandardMaterial({ name: 'Linho', color: '#e2d6bd', roughness: 1, metalness: 0 })
  const mesh = new Mesh(mergeGeometries(parts.map(withoutUv)), material)
  mesh.name = 'Tecido'
  return mesh
}

/** Quatro ripas por dentro da tela, recuadas para não encostar nela. */
function buildStretcher() {
  const outerW = WIDTH - 2 * GAP
  const outerH = HEIGHT - 2 * GAP
  const depth = DEPTH - 2 * GAP
  const sideHeight = outerH - 2 * BAR
  const parts = [
    new BoxGeometry(outerW, BAR, depth).translate(0, outerH / 2 - BAR / 2, 0),
    new BoxGeometry(outerW, BAR, depth).translate(0, -outerH / 2 + BAR / 2, 0),
    new BoxGeometry(BAR, sideHeight, depth).translate(outerW / 2 - BAR / 2, 0, 0),
    new BoxGeometry(BAR, sideHeight, depth).translate(-outerW / 2 + BAR / 2, 0, 0),
  ]
  const material = new MeshStandardMaterial({ name: 'Madeira', color: '#c9a67a', roughness: 0.8, metalness: 0 })
  const mesh = new Mesh(mergeGeometries(parts.map(withoutUv)), material)
  mesh.name = 'Chassi'
  return mesh
}

/** Grampos no meio da dobra do verso, distribuídos ao longo de cada lado. */
function buildStaples() {
  const z = -HALF_D - STAPLE.thickness / 2
  const offset = FOLD / 2
  const parts = []
  const spread = (count, span) => Array.from({ length: count }, (_, i) => ((i + 1) / (count + 1) - 0.5) * span)

  for (const x of spread(STAPLES_PER_SIDE.horizontal, WIDTH - 2 * FOLD)) {
    for (const y of [HALF_H - offset, -HALF_H + offset]) {
      parts.push(new BoxGeometry(STAPLE.length, STAPLE.width, STAPLE.thickness).translate(x, y, z))
    }
  }
  for (const y of spread(STAPLES_PER_SIDE.vertical, HEIGHT - 2 * FOLD)) {
    for (const x of [HALF_W - offset, -HALF_W + offset]) {
      parts.push(new BoxGeometry(STAPLE.width, STAPLE.length, STAPLE.thickness).translate(x, y, z))
    }
  }
  const material = new MeshStandardMaterial({ name: 'Metal', color: '#b4b4b4', roughness: 0.35, metalness: 1 })
  const mesh = new Mesh(mergeGeometries(parts.map(withoutUv)), material)
  mesh.name = 'Grampos'
  return mesh
}

const canvas = new Group()
canvas.name = 'Quadro'
canvas.add(buildArtwork(), buildLinen(), buildStretcher(), buildStaples())

const bytes = await exportGlb(canvas, OUTPUT)
const { min, max } = new Box3().setFromObject(canvas)
const format = (vector) => vector.toArray().map((n) => n.toFixed(3)).join(', ')
console.log(`${OUTPUT.pathname}: ${(bytes / 1024).toFixed(1)}KB, limites [${format(min)}] a [${format(max)}]`)
