/**
 * Medidas da caixa de embalagem (cartucho de 9 x 4 x 14cm) e da faca
 * planificada dela, em metros. Usadas pelo gerador do modelo
 * (packagingBox.mjs) e pelo da arte de exemplo (../boxArtwork.mjs), para os
 * dois seguirem a mesma faca.
 *
 * Na horizontal, a faca tem aba de cola, lateral esquerda, frente, lateral
 * direita e verso. A tampa sai de cima do verso e o fundo de baixo da frente,
 * cada um com a lingueta que entra na caixa.
 */
export const WIDTH = 0.09
export const DEPTH = 0.04
export const HEIGHT = 0.14
/** Aba de cola, presa por dentro do verso. */
export const GLUE_FLAP = 0.015
/** Lingueta da tampa e do fundo, que entra na caixa. */
export const TUCK = 0.015

/** Tamanho da faca inteira, que é o tamanho da arte. */
export const DIE_WIDTH = GLUE_FLAP + 2 * DEPTH + 2 * WIDTH
export const DIE_HEIGHT = HEIGHT + 2 * (DEPTH + TUCK)

/** Início de cada painel na faca, da esquerda para a direita e de baixo para cima. */
export const LEFT_SIDE_U = GLUE_FLAP
export const FRONT_U = LEFT_SIDE_U + DEPTH
export const RIGHT_SIDE_U = FRONT_U + WIDTH
export const BACK_U = RIGHT_SIDE_U + DEPTH
export const BODY_V = TUCK + DEPTH
