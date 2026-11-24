import { useEffect, useState } from 'react'
import { PiWarningCircle, PiX } from 'react-icons/pi'

const AUTO_DISMISS_MS = 6000

interface NoticeProps {
  message: string | null
  onDismiss: () => void
}

/**
 * Aviso de erro sobre a cena. Some sozinho depois de alguns segundos, exceto
 * enquanto o ponteiro ou o foco estiverem nele, para dar tempo de ler.
 */
export function Notice({ message, onDismiss }: NoticeProps) {
  const [isHeld, setIsHeld] = useState(false)

  useEffect(() => {
    if (!message || isHeld) return
    const timeout = setTimeout(onDismiss, AUTO_DISMISS_MS)
    return () => clearTimeout(timeout)
  }, [message, isHeld, onDismiss])

  return (
    <div role="alert" className="pointer-events-none absolute inset-x-3 top-3 z-20 flex justify-center">
      {message && (
        <div
          onPointerEnter={() => setIsHeld(true)}
          onPointerLeave={() => setIsHeld(false)}
          onFocus={() => setIsHeld(true)}
          onBlur={() => setIsHeld(false)}
          className="pointer-events-auto flex max-w-md items-start gap-2.5 rounded-control border border-danger-line bg-danger-surface py-2 pr-1.5 pl-3 text-sm text-ink shadow-raised transition-[opacity,translate] duration-200 ease-snappy starting:-translate-y-1 starting:opacity-0"
        >
          <PiWarningCircle aria-hidden className="mt-0.5 size-4.5 shrink-0 text-danger" />
          <p className="py-px">{message}</p>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Fechar aviso"
            className="grid size-6 shrink-0 cursor-pointer place-items-center rounded-inner text-ink-muted hover:bg-fill-hover hover:text-ink"
          >
            <PiX aria-hidden />
          </button>
        </div>
      )}
    </div>
  )
}
