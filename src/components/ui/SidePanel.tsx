import { useEffect, useId, useRef } from 'react'
import type { KeyboardEvent, ReactNode } from 'react'
import { PiX } from 'react-icons/pi'
import { LANDSCAPE_SHORT_QUERY, NARROW_QUERY } from '../../config/layout'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { IconButton } from './IconButton'

interface SidePanelProps {
  open: boolean
  title: string
  onClose: () => void
  /** Chamado logo depois de o painel abrir, para levar o foco a outro lugar que não o botão de fechar. */
  onOpened?: (dialog: HTMLDialogElement) => void
  /** Classes somadas às da base, como a largura própria do painel. */
  className?: string
  /** Conteúdo abaixo do título. Quem rola é ele, para o título ficar fixo. */
  children: ReactNode
}

/**
 * Painel ao lado da cena em um <dialog> nativo. Fica à direita no desktop,
 * vira folha inferior no celular em pé e ocupa a altura toda sobre o trilho
 * quando deitado. Não escurece o fundo, para as mudanças aparecerem ao vivo no
 * mockup.
 *
 * No desktop e deitado ele não é modal (show()): o palco continua respondendo,
 * para girar o modelo com o painel aberto, e clicar fora não fecha. O Esc e a
 * volta do foco, que o modal já faz sozinho, ficam por conta daqui. Na folha
 * do celular em pé, que cobre a parte de baixo da tela, ele é modal e fecha
 * com um toque fora.
 */
export function SidePanel({ open, title, onClose, onOpened, className = '', children }: SidePanelProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  // Quem tinha o foco quando o painel abriu, para recebê-lo de volta
  const openerRef = useRef<Element | null>(null)
  const titleId = useId()
  // Folha inferior: tela estreita e não deitada (deitado vale o trilho)
  const isNarrow = useMediaQuery(NARROW_QUERY)
  const isLandscapeShort = useMediaQuery(LANDSCAPE_SHORT_QUERY)
  const modal = isNarrow && !isLandscapeShort

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    // O aparelho girou com o painel aberto: reabre no outro modo. O evento
    // close desta troca chega com o painel já aberto e é ignorado
    const isSwitching = open && dialog.open && dialog.matches(':modal') !== modal
    if (isSwitching) dialog.close()

    if (open && !dialog.open) {
      if (!isSwitching) openerRef.current = document.activeElement
      if (modal) dialog.showModal()
      else dialog.show()
      onOpened?.(dialog)
    }

    if (!open && dialog.open) {
      const { activeElement } = document
      const hadFocus = dialog.contains(activeElement) || activeElement === document.body
      const wasModal = dialog.matches(':modal')
      dialog.close()
      // O modal devolve o foco sozinho. Aqui ele só volta se estava no painel
      // ou perdido no body (depois de um clique no palco), e não se a pessoa
      // já foi para outro controle
      if (!wasModal && hadFocus && openerRef.current instanceof HTMLElement && openerRef.current.isConnected) {
        openerRef.current.focus()
      }
    }
  }, [open, modal, onOpened])

  // Sem modal, o Esc fecha também com o foco solto no body, como depois de
  // girar o modelo no palco, que não recebe foco
  useEffect(() => {
    if (!open || modal) return
    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape' && !event.defaultPrevented && event.target === document.body) onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, modal, onClose])

  function handleKeyDown(event: KeyboardEvent) {
    // O modal fecha pelo evento cancel. Quem já tratou o Esc (como o campo de
    // nome das predefinições) chama preventDefault, e o painel fica aberto
    if (modal || event.key !== 'Escape' || event.defaultPrevented) return
    event.preventDefault()
    onClose()
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={(event) => !event.currentTarget.open && onClose()}
      onKeyDown={handleKeyDown}
      // Toque fora da folha cai no próprio <dialog> (área do backdrop)
      onClick={(event) => modal && event.target === event.currentTarget && onClose()}
      className={`fixed z-40 m-0 flex-col overflow-auto bg-surface p-0 text-ink shadow-raised transition-[opacity,translate,display,overlay] transition-discrete duration-200 ease-snappy backdrop:bg-transparent open:flex open:translate-x-0 open:translate-y-0 open:opacity-100 max-sm:inset-x-0 max-sm:top-auto max-sm:bottom-0 max-sm:max-h-[75dvh] max-sm:w-full max-sm:max-w-none max-sm:translate-y-full max-sm:rounded-t-panel max-sm:border-t max-sm:border-line max-sm:starting:open:translate-y-full sm:top-[calc(7.75rem+env(safe-area-inset-top))] sm:right-[max(--spacing(4),env(safe-area-inset-right))] sm:bottom-auto sm:left-auto sm:max-h-[calc(100dvh-12.5rem-env(safe-area-inset-top)-env(safe-area-inset-bottom))] sm:translate-x-3 sm:rounded-panel sm:border sm:border-line sm:opacity-0 sm:starting:open:translate-x-3 sm:starting:open:opacity-0 landscape-short:top-[calc(3.25rem+env(safe-area-inset-top))] landscape-short:max-h-[calc(100dvh-3.25rem-env(safe-area-inset-top)-max(0.5rem,env(safe-area-inset-bottom)))] ${className}`}
    >
      <div className="flex min-h-0 flex-col">
        <div className="flex shrink-0 items-center justify-between py-2 pr-2 pl-5">
          <h2 id={titleId} className="text-base font-semibold">
            {title}
          </h2>
          <IconButton label="Fechar" icon={<PiX aria-hidden />} onClick={onClose} tooltipSide="left" />
        </div>
        {children}
      </div>
    </dialog>
  )
}
