import { PiMonitor, PiMoon, PiSun } from 'react-icons/pi'
import type { IconType } from 'react-icons'
import type { ThemePreference } from '../config/theme'
import { useTheme } from '../hooks/useTheme'
import { Tooltip } from './ui/Tooltip'

const OPTIONS: { value: ThemePreference; label: string; Icon: IconType }[] = [
  { value: 'light', label: 'Tema claro', Icon: PiSun },
  { value: 'dark', label: 'Tema escuro', Icon: PiMoon },
  { value: 'system', label: 'Tema do sistema', Icon: PiMonitor },
]

/** Seletor de tema em botões de rádio nativos, navegáveis pelas setas do teclado. */
export function ThemeSwitcher() {
  const { preference, setPreference } = useTheme()

  return (
    <fieldset className="flex rounded-control border border-line p-0.5">
      <legend className="sr-only">Tema</legend>
      {OPTIONS.map(({ value, label, Icon }) => (
        <label
          key={value}
          className="group relative grid size-8 cursor-pointer place-items-center rounded-inner text-ink-muted transition-colors hover:bg-fill-hover hover:text-ink has-checked:bg-fill-pressed has-checked:text-ink has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink"
        >
          <input
            type="radio"
            name="theme"
            value={value}
            checked={preference === value}
            onChange={() => setPreference(value)}
            aria-label={label}
            className="sr-only"
          />
          <Icon aria-hidden className="size-4.5" />
          <Tooltip side="bottom">{label}</Tooltip>
        </label>
      ))}
    </fieldset>
  )
}
