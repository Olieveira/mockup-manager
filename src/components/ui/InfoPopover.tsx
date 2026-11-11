import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'

export type PopoverDirection = 'top' | 'top-start' | 'bottom' | 'left' | 'right'

interface InfoPopoverProps {
  show: boolean
  direction?: PopoverDirection
  children: ReactNode
}

const OFFSET = 10

const placement: Record<PopoverDirection, { className: string; x: number; y: number }> = {
  top: { className: 'bottom-full left-1/2 -translate-x-1/2 mb-2', x: 0, y: OFFSET },
  // Alinhado à borda esquerda, para botões encostados no canto
  'top-start': { className: 'bottom-full left-0 mb-2', x: 0, y: OFFSET },
  bottom: { className: 'top-full left-1/2 -translate-x-1/2 mt-2', x: 0, y: -OFFSET },
  left: { className: 'right-full top-1/2 -translate-y-1/2 mr-2', x: OFFSET, y: 0 },
  right: { className: 'left-full top-1/2 -translate-y-1/2 ml-2', x: -OFFSET, y: 0 },
}

export function InfoPopover({ show, direction = 'top', children }: InfoPopoverProps) {
  const { className, x, y } = placement[direction]

  return (
    <AnimatePresence>
      {show && (
        <motion.span
          aria-hidden
          initial={{ opacity: 0, x, y }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x, y }}
          transition={{ duration: 0.2 }}
          className={`pointer-events-none absolute z-50 w-max max-w-28 rounded-sm bg-gray-900/80 px-3 py-2 text-xs font-medium text-white shadow-lg sm:max-w-40 ${className}`}
        >
          {children}
        </motion.span>
      )}
    </AnimatePresence>
  )
}
