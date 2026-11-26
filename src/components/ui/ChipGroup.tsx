import type { FocusEvent, ReactNode } from 'react'

interface ChipGroupProps {
  legend: string
  children: ReactNode
}

/**
 * Grupo de chips no painel lateral: grade de duas colunas no desktop e
 * fileira que rola para o lado no celular, em pé ou deitado. A fileira vai até
 * as bordas do painel (-mx-5) para os chips não serem cortados no padding.
 */
export function ChipGroup({ legend, children }: ChipGroupProps) {
  return (
    <fieldset className="-mx-5 flex min-w-0 gap-2 overflow-x-auto px-5 py-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 landscape-short:-mx-5 landscape-short:flex landscape-short:overflow-x-auto landscape-short:px-5">
      <legend className="sr-only">{legend}</legend>
      {children}
    </fieldset>
  )
}

interface ChipProps {
  name: string
  checked: boolean
  onChange: () => void
  children: ReactNode
}

/**
 * O navegador rola até o rádio focado, que é só um ponto no canto do chip.
 * Pelas setas, na fileira do celular, o chip inteiro precisa aparecer.
 */
function revealChip(event: FocusEvent<HTMLInputElement>) {
  event.currentTarget.parentElement?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
}

/**
 * Opção do ChipGroup em rádio nativo: o Tab entra na marcada e as setas trocam.
 * O relative prende o rádio sr-only (absoluto) dentro do chip, e assim dentro
 * da fileira: solto, ele alarga a área rolável do painel, que anda para o lado.
 */
export function Chip({ name, checked, onChange, children }: ChipProps) {
  return (
    <label className="relative flex h-9 max-w-56 min-w-0 shrink-0 scroll-mx-5 cursor-pointer items-center rounded-control border border-line px-3 text-sm transition-colors hover:bg-fill-hover has-checked:border-ink has-checked:bg-fill-pressed has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink">
      <input type="radio" name={name} checked={checked} onChange={onChange} onFocus={revealChip} className="sr-only" />
      <span className="truncate">{children}</span>
    </label>
  )
}
