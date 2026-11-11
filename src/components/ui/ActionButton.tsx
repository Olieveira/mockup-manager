import type { ReactNode } from 'react'

interface ActionButtonProps {
  label: string
  icon: ReactNode
  onClick: () => void
  showLabel: boolean
  disabled?: boolean
}

/** Botão da barra inferior, que se expande para mostrar o rótulo no lugar do ícone. */
export function ActionButton({ label, icon, onClick, showLabel, disabled = false }: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`flex cursor-pointer items-center justify-center overflow-hidden rounded-full bg-gray-800 text-white transition-all duration-200 ease-in-out hover:bg-gray-700 disabled:cursor-wait disabled:opacity-60 ${
        showLabel ? 'h-12 w-20 sm:w-40' : 'size-10'
      }`}
    >
      {showLabel ? <span className="px-1 text-center text-xs">{label}</span> : icon}
    </button>
  )
}
