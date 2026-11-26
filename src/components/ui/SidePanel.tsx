import { useEffect, useId, useRef } from 'react'
import type { ReactNode } from 'react'
import { PiX } from 'react-icons/pi'
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
 * Painel ao lado da cena em um <dialog> nativo, que já cuida do foco preso,
 * do Esc e de devolver o foco ao botão que o abriu. Fica à direita no desktop,
 * vira folha inferior no celular e ocupa a altura toda sobre o trilho quando
 * deitado. Não escurece o fundo, para as mudanças aparecerem ao vivo no mockup.
 */
export function SidePanel({ open, title, onClose, onOpened, className = '', children }: SidePanelProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) {
      dialog.showModal()
      onOpened?.(dialog)
    }
    if (!open && dialog.open) dialog.close()
  }, [open, onOpened])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={onClose}
      // Clique fora do painel cai no próprio <dialog> (área do backdrop)
      onClick={(event) => event.target === event.currentTarget && onClose()}
      className={`m-0 flex-col bg-surface p-0 text-ink shadow-raised transition-[opacity,translate,display,overlay] transition-discrete duration-200 ease-snappy backdrop:bg-transparent open:flex open:translate-x-0 open:translate-y-0 open:opacity-100 max-sm:inset-x-0 max-sm:top-auto max-sm:bottom-0 max-sm:max-h-[75dvh] max-sm:w-full max-sm:max-w-none max-sm:translate-y-full max-sm:rounded-t-panel max-sm:border-t max-sm:border-line max-sm:starting:open:translate-y-full sm:top-[calc(4.25rem+env(safe-area-inset-top))] sm:right-[max(--spacing(4),env(safe-area-inset-right))] sm:bottom-auto sm:left-auto sm:max-h-[calc(100dvh-5.25rem-env(safe-area-inset-top)-env(safe-area-inset-bottom))] sm:translate-x-3 sm:rounded-panel sm:border sm:border-line sm:opacity-0 sm:starting:open:translate-x-3 sm:starting:open:opacity-0 landscape-short:top-2 landscape-short:max-h-[calc(100dvh-0.5rem-max(0.5rem,env(safe-area-inset-bottom)))] ${className}`}
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
