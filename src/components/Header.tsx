import { brand } from '../config/brand'
import { Logo } from './brand/Logo'

export function Header() {
  return (
    <header className="flex h-20 items-center justify-center gap-3 bg-linear-to-b from-gray-900/70 to-gray-950/80 shadow-lg shadow-slate-500/20">
      <Logo className="size-6 text-white" />
      <h1 className="text-2xl font-bold tracking-wide text-white">{brand.name}</h1>
    </header>
  )
}
