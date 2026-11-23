import { useEffect, useId } from 'react'
import { motion } from 'motion/react'
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa6'
import { ENVIRONMENT_PRESETS, ROTATE_SPEED_RANGE } from '../config/scene'
import type { BackgroundMode, SceneSettings } from '../config/scene'

interface PreferencesModalProps {
  settings: SceneSettings
  onChange: (changes: Partial<SceneSettings>) => void
  onClose: () => void
}

const BACKGROUND_OPTIONS: { mode: BackgroundMode; label: string }[] = [
  { mode: 'color', label: 'Cor de fundo' },
  { mode: 'preset', label: 'Cenário' },
]

const arrowButton = 'cursor-pointer rounded-sm bg-gray-700 px-2 py-1 text-blue-400 hover:bg-gray-600'

export function PreferencesModal({ settings, onChange, onClose }: PreferencesModalProps) {
  const titleId = useId()
  const presetIndex = ENVIRONMENT_PRESETS.findIndex((preset) => preset.id === settings.environment)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  function stepPreset(step: number) {
    const count = ENVIRONMENT_PRESETS.length
    onChange({ environment: ENVIRONMENT_PRESETS[(presetIndex + step + count) % count].id })
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative flex w-full max-w-md flex-col gap-6 rounded-xl bg-gray-900 p-8 shadow-2xl"
        initial={{ scale: 0.8, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 40 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="absolute top-3 right-3 cursor-pointer text-xl text-gray-400 hover:text-white"
          onClick={onClose}
          aria-label="Fechar"
        >
          ×
        </button>
        <h2 id={titleId} className="text-2xl font-bold text-white">
          Preferências do Mockup
        </h2>

        <div className="flex flex-col gap-6 text-gray-200">
          <div className="flex items-center justify-between">
            <span>Rotação automática</span>
            <button
              type="button"
              role="switch"
              aria-checked={settings.autoRotate}
              aria-label="Rotação automática"
              onClick={() => onChange({ autoRotate: !settings.autoRotate })}
              className={`inline-flex h-6 w-12 cursor-pointer items-center rounded-full transition-colors ${
                settings.autoRotate ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`size-6 rounded-full bg-white shadow-sm transition-transform ${
                  settings.autoRotate ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <label className="flex flex-col gap-1">
            Velocidade de rotação
            <input
              type="range"
              {...ROTATE_SPEED_RANGE}
              value={settings.rotateSpeed}
              onChange={(event) => onChange({ rotateSpeed: Number(event.target.value) })}
              disabled={!settings.autoRotate}
              className="w-full cursor-pointer accent-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </label>
        </div>

        <hr className="border-gray-700" />

        <h3 className="text-lg font-semibold text-white">Cenário</h3>

        <div className="flex min-h-20 flex-row items-center justify-around">
          <fieldset className="flex flex-col gap-2 text-gray-200">
            <legend className="sr-only">Tipo de fundo</legend>
            {BACKGROUND_OPTIONS.map(({ mode, label }) => (
              <label key={mode} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="backgroundMode"
                  value={mode}
                  checked={settings.backgroundMode === mode}
                  onChange={() => onChange({ backgroundMode: mode })}
                />
                {label}
              </label>
            ))}
          </fieldset>

          {settings.backgroundMode === 'color' ? (
            <input
              type="color"
              aria-label="Cor de fundo"
              value={settings.backgroundColor}
              onChange={(event) => onChange({ backgroundColor: event.target.value })}
              className="size-10 cursor-pointer rounded-full bg-transparent"
            />
          ) : (
            <div className="flex flex-col items-center gap-2">
              <motion.span
                key={settings.environment}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="min-w-28 text-center text-lg font-medium text-white"
              >
                {ENVIRONMENT_PRESETS[presetIndex].label}
              </motion.span>
              <div className="flex gap-2">
                <button type="button" className={arrowButton} onClick={() => stepPreset(-1)} aria-label="Cenário anterior">
                  <FaArrowLeft className="size-5" />
                </button>
                <button type="button" className={arrowButton} onClick={() => stepPreset(1)} aria-label="Próximo cenário">
                  <FaArrowRight className="size-5" />
                </button>
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          className="cursor-pointer rounded-sm bg-blue-600 py-2 font-semibold text-white transition hover:bg-blue-700"
          onClick={onClose}
        >
          Concluir
        </button>
      </motion.div>
    </motion.div>
  )
}
