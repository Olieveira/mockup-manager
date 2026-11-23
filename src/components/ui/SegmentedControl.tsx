import type { IconType } from 'react-icons'
import { Tooltip } from './Tooltip'

export interface SegmentedOption<T extends string> {
  value: T
  label: string
  Icon?: IconType
}

interface SegmentedControlProps<T extends string> {
  legend: string
  name: string
  options: readonly SegmentedOption<T>[]
  value: T
  onChange: (value: T) => void
  /** Mostra só o ícone e leva o rótulo para a dica e o aria-label. */
  iconOnly?: boolean
  className?: string
}

/** Grupo de opções exclusivas em rádios nativos, navegáveis pelas setas do teclado. */
export function SegmentedControl<T extends string>({
  legend,
  name,
  options,
  value,
  onChange,
  iconOnly = false,
  className = '',
}: SegmentedControlProps<T>) {
  return (
    <fieldset className={`flex min-w-0 rounded-control border border-line p-0.5 ${className}`}>
      <legend className="sr-only">{legend}</legend>
      {options.map(({ value: optionValue, label, Icon }, index) => (
        <label
          key={optionValue}
          className={`group relative flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-inner text-sm font-medium text-ink-muted transition-colors hover:bg-fill-hover hover:text-ink has-checked:bg-fill-pressed has-checked:text-ink has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink ${
            iconOnly ? 'size-8' : 'h-8 px-3'
          }`}
        >
          <input
            type="radio"
            name={name}
            value={optionValue}
            checked={value === optionValue}
            onChange={() => onChange(optionValue)}
            aria-label={iconOnly ? label : undefined}
            className="sr-only"
          />
          {Icon && <Icon aria-hidden className="size-4.5 shrink-0" />}
          {iconOnly ? <Tooltip side={index === options.length - 1 ? 'bottom-end' : 'bottom'}>{label}</Tooltip> : label}
        </label>
      ))}
    </fieldset>
  )
}
