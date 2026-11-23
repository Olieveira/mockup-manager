import type { ReactNode } from 'react'
import { InfoPopover } from './InfoPopover'
import type { PopoverDirection } from './InfoPopover'

interface IconButtonProps {
  label: string
  icon: ReactNode
  onClick: () => void
  showHint: boolean
  hintDirection: PopoverDirection
  className?: string
}

/** Botão redondo sobreposto à cena, com dica opcional ao lado. */
export function IconButton({ label, icon, onClick, showHint, hintDirection, className = '' }: IconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`absolute z-20 flex size-10 cursor-pointer items-center justify-center rounded-full bg-gray-800/80 text-xl text-white transition hover:bg-gray-700 ${className}`}
    >
      {icon}
      <InfoPopover show={showHint} direction={hintDirection}>
        {label}
      </InfoPopover>
    </button>
  )
}
