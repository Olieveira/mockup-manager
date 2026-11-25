import { useId } from 'react'

interface RangeFieldProps {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
  /** Texto do valor ao lado do rótulo, também lido pelo leitor de tela. */
  format?: (value: number) => string
  disabled?: boolean
}

/** Controle deslizante com rótulo e o valor atual por extenso. */
export function RangeField({ label, value, min, max, step, onChange, format = String, disabled = false }: RangeFieldProps) {
  const id = useId()
  const valueText = format(value)

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-4 text-sm">
        <label htmlFor={id} className={disabled ? 'text-ink-muted' : ''}>
          {label}
        </label>
        <output htmlFor={id} className="text-ink-muted tabular-nums">
          {valueText}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-valuetext={valueText}
        disabled={disabled}
        className="w-full cursor-pointer accent-accent disabled:cursor-not-allowed disabled:opacity-45"
      />
    </div>
  )
}
