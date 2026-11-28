/**
 * Celular deitado (e janelas baixas). Precisa ser igual à variante
 * landscape-short: de src/index.css, que cuida do layout; esta cópia serve
 * para o que só o React resolve, como mudar um controle de lugar no DOM.
 */
export const LANDSCAPE_SHORT_QUERY = '(orientation: landscape) and (max-height: 500px)'

/**
 * Mouse ou trackpad, onde valem os atalhos da câmera (teclas e duplo clique).
 * É a mesma condição da dica de arrastar acima do palco (pointer-fine:).
 */
export const FINE_POINTER_QUERY = '(pointer: fine)'

/**
 * Tela estreita, onde o painel lateral vira folha inferior. Igual à variante
 * max-sm: do Tailwind (abaixo de 40rem).
 */
export const NARROW_QUERY = '(max-width: 39.99rem)'
