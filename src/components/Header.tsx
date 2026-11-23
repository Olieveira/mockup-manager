import { brand } from '../config/brand'
import { Logo } from './brand/Logo'
import { ThemeSwitcher } from './ThemeSwitcher'

export function Header() {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-line bg-chrome px-4 sm:px-6">
      <div className="flex items-center gap-2.5">
        <Logo className="size-5 text-ink-muted" />
        <h1 className="text-[0.9375rem] font-semibold tracking-tight">{brand.name}</h1>
      </div>
      <ThemeSwitcher />
    </header>
  )
}
