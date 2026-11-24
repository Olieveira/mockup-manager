import { PiMonitor, PiMoon, PiSun } from 'react-icons/pi'
import type { ThemePreference } from '../config/theme'
import { useTheme } from '../hooks/useTheme'
import { SegmentedControl } from './ui/SegmentedControl'
import type { SegmentedOption } from './ui/SegmentedControl'

const OPTIONS: SegmentedOption<ThemePreference>[] = [
  { value: 'light', label: 'Tema claro', Icon: PiSun },
  { value: 'dark', label: 'Tema escuro', Icon: PiMoon },
  { value: 'system', label: 'Tema do sistema', Icon: PiMonitor },
]

export function ThemeSwitcher() {
  const { preference, setPreference } = useTheme()

  return (
    <SegmentedControl
      legend="Tema"
      name="theme"
      options={OPTIONS}
      value={preference}
      onChange={setPreference}
      iconOnly
    />
  )
}
