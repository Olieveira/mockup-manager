import type { ReactNode } from 'react'

export type TooltipSide = 'top' | 'bottom' | 'bottom-end' | 'left' | 'right'

interface TooltipProps {
  children: ReactNode
  side?: TooltipSide
}

const position: Record<TooltipSide, string> = {
  top: 'bottom-full left-1/2 mb-2 -translate-x-1/2',
  bottom: 'top-full left-1/2 mt-2 -translate-x-1/2',
  // Alinhada pela direita, para controles encostados na borda da tela
  'bottom-end': 'top-full right-0 mt-2',
  left: 'right-full top-1/2 mr-2 -translate-y-1/2',
  right: 'left-full top-1/2 ml-2 -translate-y-1/2',
}

/**
 * Dica visual para controles só de ícone. O elemento pai precisa das classes
 * `group relative`. Aparece no hover (com atraso, só em dispositivos com
 * ponteiro) e no foco pelo teclado. O nome acessível continua no aria-label do
 * controle, por isso a dica fica oculta para leitores de tela.
 */
export function Tooltip({ children, side = 'top' }: TooltipProps) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute z-30 w-max rounded-inner bg-ink px-2 py-1 text-xs font-medium text-canvas opacity-0 shadow-raised transition-opacity duration-150 group-hover:opacity-100 group-hover:delay-400 group-focus-visible:opacity-100 group-has-focus-visible:opacity-100 ${position[side]}`}
    >
      {children}
    </span>
  )
}
