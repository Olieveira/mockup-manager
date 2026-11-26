/**
 * Gera public/caixa.glb: caixa de embalagem tipo cartucho (fechamento reverso,
 * como as de remédio e cosmético) de 9 x 4 x 14cm, montada só com geometria do
 * three.
 *
 * O UV da malha "Arte" segue a faca planificada em proporção física, vista do
 * lado impresso. Na horizontal: aba de cola, lateral esquerda, frente, lateral
 * direita e verso. A tampa sai de cima do verso e o fundo de baixo da frente,
 * cada um com a lingueta que entra na caixa. Linguetas, abas de cola e abas de
 * pó ficam escondidas quando a caixa fecha, então só as seis faces externas
 * têm malha.
 *
 * Medidas em metros (padrão do glTF), com a frente virada para +z, o centro em
 * x = z = 0 e a base abaixo da origem, como a sombra de contato da cena espera.
 *
 * Uso: npm run models
 */
import { Box3, Group, Mesh, MeshStandardMaterial, PlaneGeometry } from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { exportGlb } from './exportGlb.mjs'

const OUTPUT = new URL('../../public/caixa.glb', import.meta.url)

const WIDTH = 0.09
const DEPTH = 0.04
const HEIGHT = 0.14
/** Aba de cola, presa por dentro do verso. */
const GLUE_FLAP = 0.015
/** Lingueta da tampa e do fundo, que entra na caixa. */
const TUCK = 0.015

const HALF_W = WIDTH / 2
const HALF_H = HEIGHT / 2
const HALF_D = DEPTH / 2

/** Tamanho da faca inteira, que é o tamanho da arte. */
const DIE_WIDTH = GLUE_FLAP + 2 * DEPTH + 2 * WIDTH
const DIE_HEIGHT = HEIGHT + 2 * (DEPTH + TUCK)

/** Início de cada painel na faca, da esquerda para a direita e de baixo para cima. */
const LEFT_SIDE_U = GLUE_FLAP
const FRONT_U = LEFT_SIDE_U + DEPTH
const RIGHT_SIDE_U = FRONT_U + WIDTH
const BACK_U = RIGHT_SIDE_U + DEPTH
const BODY_V = TUCK + DEPTH

/**
 * Leva um ponto da caixa montada para a faca. Cada painel continua o vizinho
 * pela dobra: a lateral direita começa onde a frente termina, a tampa sai da
 * borda de cima do verso e o fundo da borda de baixo da frente.
 */
const UNFOLD = {
  front: (x, y) => [FRONT_U + (x + HALF_W), BODY_V + (y + HALF_H)],
  right: (x, y, z) => [RIGHT_SIDE_U + (HALF_D - z), BODY_V + (y + HALF_H)],
  back: (x, y) => [BACK_U + (HALF_W - x), BODY_V + (y + HALF_H)],
  left: (x, y, z) => [LEFT_SIDE_U + (z + HALF_D), BODY_V + (y + HALF_H)],
  top: (x, y, z) => [BACK_U + (HALF_W - x), BODY_V + HEIGHT + (z + HALF_D)],
  bottom: (x, y, z) => [FRONT_U + (x + HALF_W), BODY_V - (HALF_D - z)],
}

/** Grava no UV a posição de cada vértice na faca (0 a 1 na imagem inteira). */
function mapDieUv(geometry, unfold) {
  const position = geometry.getAttribute('position')
  const uv = geometry.getAttribute('uv')
  for (let i = 0; i < position.count; i++) {
    const [u, v] = unfold(position.getX(i), position.getY(i), position.getZ(i))
    // v cresce para cima, como a textura carregada com flipY no app
    uv.setXY(i, u / DIE_WIDTH, v / DIE_HEIGHT)
  }
  return geometry
}

function buildCarton() {
  const faces = [
    mapDieUv(new PlaneGeometry(WIDTH, HEIGHT).translate(0, 0, HALF_D), UNFOLD.front),
    mapDieUv(new PlaneGeometry(DEPTH, HEIGHT).rotateY(Math.PI / 2).translate(HALF_W, 0, 0), UNFOLD.right),
    mapDieUv(new PlaneGeometry(WIDTH, HEIGHT).rotateY(Math.PI).translate(0, 0, -HALF_D), UNFOLD.back),
    mapDieUv(new PlaneGeometry(DEPTH, HEIGHT).rotateY(-Math.PI / 2).translate(-HALF_W, 0, 0), UNFOLD.left),
    mapDieUv(new PlaneGeometry(WIDTH, DEPTH).rotateX(-Math.PI / 2).translate(0, HALF_H, 0), UNFOLD.top),
    mapDieUv(new PlaneGeometry(WIDTH, DEPTH).rotateX(Math.PI / 2).translate(0, -HALF_H, 0), UNFOLD.bottom),
  ]
  const material = new MeshStandardMaterial({ name: 'Cartao', color: 0xffffff, roughness: 0.55, metalness: 0 })
  const mesh = new Mesh(mergeGeometries(faces), material)
  mesh.name = 'Arte'
  // Vão para os extras do glTF: o app reconhece uma arte com a proporção da
  // faca e, se não for uma, aplica a imagem só no retângulo da frente
  mesh.userData.printSize = [DIE_WIDTH, DIE_HEIGHT]
  mesh.userData.printFront = [FRONT_U, BODY_V, WIDTH, HEIGHT]
  return mesh
}

const box = new Group()
box.name = 'Caixa'
box.add(buildCarton())

const bytes = await exportGlb(box, OUTPUT)
const { min, max } = new Box3().setFromObject(box)
const format = (vector) => vector.toArray().map((n) => n.toFixed(3)).join(', ')
const millimeters = (meters) => Math.round(meters * 1000)
console.log(`${OUTPUT.pathname}: ${(bytes / 1024).toFixed(1)}KB, limites [${format(min)}] a [${format(max)}]`)
console.log(`faca: ${millimeters(DIE_WIDTH)} x ${millimeters(DIE_HEIGHT)}mm`)
