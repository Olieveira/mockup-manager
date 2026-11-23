import type { ReactNode } from 'react'
import { Tooltip } from './Tooltip'
import type { TooltipSide } from './Tooltip'

interface IconButtonProps {
  label: string
  icon: ReactNode
  onClick: () => void
  tooltipSide?: TooltipSide
  className?: string
}

/** Botão só de ícone. O rótulo vira aria-label e aparece como dica no hover e no foco. */
export function IconButton({ label, icon, onClick, tooltipSide = 'top', className = '' }: IconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`group relative grid size-9 shrink-0 cursor-pointer place-items-center rounded-control text-lg text-ink-muted transition-colors hover:bg-fill-hover hover:text-ink active:bg-fill-pressed ${className}`}
    >
      {icon}
      <Tooltip side={tooltipSide}>{label}</Tooltip>
    </button>
  )
}
