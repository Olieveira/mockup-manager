import { useEffect, useId, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { PiCameraRotate, PiCaretDown } from 'react-icons/pi'
import { CAMERA_VIEWS } from '../config/cameraViews'
import type { CameraView } from '../config/cameraViews'

interface ViewMenuProps {
  onSelect: (view: CameraView) => void
  /** Classes somadas às do botão, como o recuo que o alinha à borda do palco. */
  className?: string
}

/**
 * Botão Vista, que abre o menu das vistas da câmera. Segue o padrão de botão
 * de menu: as setas, Home e End andam pelos itens, o Esc fecha e devolve o
 * foco ao botão, e o Tab ou um clique fora fecham.
 */
export function ViewMenu({ onSelect, className = '' }: ViewMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  // Item que recebe o foco ao abrir (o primeiro ou, pela seta para cima, o último)
  const [initialFocus, setInitialFocus] = useState<'first' | 'last'>('first')
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonId = useId()
  const menuId = useId()

  function getItems() {
    return Array.from(menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]') ?? [])
  }

  function open(focus: 'first' | 'last') {
    setInitialFocus(focus)
    setIsOpen(true)
  }

  function close({ returnFocus }: { returnFocus: boolean }) {
    setIsOpen(false)
    if (returnFocus) buttonRef.current?.focus()
  }

  useEffect(() => {
    if (!isOpen) return
    const items = menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')
    items?.[initialFocus === 'first' ? 0 : items.length - 1]?.focus()

    // Clique ou toque fora fecha, sem tirar o foco de onde a pessoa foi
    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false)
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [isOpen, initialFocus])

  function handleButtonKeyDown(event: KeyboardEvent) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      open(event.key === 'ArrowDown' ? 'first' : 'last')
    }
  }

  function handleMenuKeyDown(event: KeyboardEvent) {
    const items = getItems()
    const index = items.indexOf(document.activeElement as HTMLButtonElement)
    const moves: Record<string, number> = {
      ArrowDown: (index + 1) % items.length,
      ArrowUp: (index - 1 + items.length) % items.length,
      Home: 0,
      End: items.length - 1,
    }
    if (event.key in moves) {
      event.preventDefault()
      items[moves[event.key]]?.focus()
    } else if (event.key === 'Escape') {
      // Não deixa o Esc chegar a um painel aberto, que também fecharia
      event.preventDefault()
      event.stopPropagation()
      close({ returnFocus: true })
    } else if (event.key === 'Tab') {
      close({ returnFocus: false })
    }
  }

  function select(view: CameraView) {
    close({ returnFocus: true })
    onSelect(view)
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        id={buttonId}
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        onClick={() => (isOpen ? close({ returnFocus: false }) : open('first'))}
        onKeyDown={handleButtonKeyDown}
        className={`flex h-9 cursor-pointer items-center gap-2 rounded-control px-2.5 text-sm font-medium transition-colors hover:bg-fill-hover active:bg-fill-pressed aria-expanded:bg-fill-pressed ${className}`}
      >
        <PiCameraRotate aria-hidden className="size-4.5" />
        Vista
        <PiCaretDown aria-hidden className="size-3.5 text-ink-muted" />
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-labelledby={buttonId}
          onKeyDown={handleMenuKeyDown}
          className="absolute top-full right-0 z-30 mt-1 flex w-40 flex-col rounded-panel border border-line bg-surface p-1 shadow-raised"
        >
          {CAMERA_VIEWS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              role="menuitem"
              tabIndex={-1}
              onClick={() => select(id)}
              className="flex h-9 cursor-pointer items-center rounded-inner px-2.5 text-left text-sm outline-none hover:bg-fill-hover focus-visible:bg-fill-pressed focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ink"
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
