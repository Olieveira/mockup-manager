import type { ReactNode } from 'react'

interface ToolButtonProps {
  label: string
  /** Rótulo para telas estreitas, quando o normal não cabe. */
  shortLabel?: string
  icon: ReactNode
  onClick: () => void
  variant?: 'default' | 'primary'
  /** Transforma o botão em alternância (aria-pressed). */
  pressed?: boolean
  disabled?: boolean
  busy?: boolean
}

const variants = {
  default: 'border-line bg-surface text-ink hover:bg-fill-hover aria-pressed:border-line-strong aria-pressed:bg-fill-pressed',
  primary: 'border-accent bg-accent text-on-accent hover:opacity-90',
}

/**
 * Botão da barra de ações, sempre com rótulo visível. No celular o rótulo vai
 * abaixo do ícone para caberem todas as ações em uma linha.
 */
export function ToolButton({
  label,
  shortLabel,
  icon,
  onClick,
  variant = 'default',
  pressed,
  disabled = false,
  busy = false,
}: ToolButtonProps) {
  return (
    <button
      type="button"
      // Ocupado não usa disabled, que tiraria o foco de quem usa teclado
      onClick={busy ? undefined : onClick}
      disabled={disabled}
      aria-disabled={busy || undefined}
      aria-pressed={pressed}
      aria-busy={busy || undefined}
      className={`flex min-w-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-control border px-1 text-xs font-medium transition-[background-color,border-color,opacity] duration-150 max-sm:h-14 max-sm:flex-auto sm:h-10 sm:flex-row sm:gap-2 sm:px-3.5 sm:text-sm disabled:cursor-not-allowed disabled:opacity-45 aria-busy:cursor-wait aria-busy:opacity-70 ${variants[variant]}`}
    >
      <span aria-hidden className="text-lg leading-none">
        {icon}
      </span>
      {shortLabel ? (
        <>
          <span className="max-w-full truncate sm:hidden">{shortLabel}</span>
          <span className="max-w-full truncate max-sm:hidden">{label}</span>
        </>
      ) : (
        <span className="max-w-full truncate">{label}</span>
      )}
    </button>
  )
}
