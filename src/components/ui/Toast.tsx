import { useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'

const AUTO_DISMISS_MS = 5000

interface ToastProps {
  message: string | null
  onDismiss: () => void
}

export function Toast({ message, onDismiss }: ToastProps) {
  useEffect(() => {
    if (!message) return
    const timeout = setTimeout(onDismiss, AUTO_DISMISS_MS)
    return () => clearTimeout(timeout)
  }, [message, onDismiss])

  return (
    <AnimatePresence>
      {message && (
        <motion.button
          type="button"
          role="alert"
          onClick={onDismiss}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-3 left-1/2 z-40 w-max max-w-[70%] -translate-x-1/2 cursor-pointer rounded-lg bg-red-600 px-4 py-2 text-center text-sm text-white shadow-lg"
        >
          {message}
        </motion.button>
      )}
    </AnimatePresence>
  )
}
