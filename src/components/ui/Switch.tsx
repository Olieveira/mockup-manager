interface SwitchProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}

/** Interruptor com rótulo clicável. */
export function Switch({ label, checked, onChange }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="group flex w-full cursor-pointer items-center justify-between gap-4 rounded-control py-1 text-sm"
    >
      {label}
      <span
        aria-hidden
        className="flex h-6 w-10 shrink-0 items-center rounded-full bg-line-strong p-0.5 transition-colors group-aria-checked:bg-accent"
      >
        <span className="size-5 rounded-full bg-surface transition-transform duration-150 ease-snappy group-aria-checked:translate-x-4" />
      </span>
    </button>
  )
}
