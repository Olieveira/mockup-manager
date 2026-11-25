import type { ReactNode } from 'react'
import { brand } from '../config/brand'
import { Logo } from './brand/Logo'
import { ThemeSwitcher } from './ThemeSwitcher'

interface HeaderProps {
  /** Conteúdo no meio da barra, entre a marca e o tema (o seletor, quando deitado). */
  children?: ReactNode
}

export function Header({ children }: HeaderProps) {
  return (
    // Deitado, a barra vira uma grade de três colunas para o meio ficar
    // centralizado, e a ordem do DOM (marca, seletor, tema) é a mesma do Tab
    <header className="flex h-[calc(--spacing(14)+env(safe-area-inset-top))] shrink-0 items-center justify-between gap-4 border-b border-line bg-chrome px-safe-4 pt-safe sm:px-safe-6 landscape-short:col-start-1 landscape-short:row-start-1 landscape-short:grid landscape-short:h-[calc(--spacing(11)+env(safe-area-inset-top))] landscape-short:grid-cols-[1fr_auto_1fr] landscape-short:pr-3">
      <div className="flex items-center gap-2.5">
        <Logo className="size-5 text-ink-muted" />
        <h1 className="text-[0.9375rem] font-semibold tracking-tight">{brand.name}</h1>
      </div>
      {children}
      <div className="flex justify-end">
        <ThemeSwitcher />
      </div>
    </header>
  )
}
