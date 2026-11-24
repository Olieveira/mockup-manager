import { useEffect, useId, useRef } from 'react'
import type { ReactNode } from 'react'
import { PiX } from 'react-icons/pi'
import { BACKGROUND_SWATCHES, ENVIRONMENT_PRESETS, ROTATE_SPEED_RANGE } from '../config/scene'
import type { BackgroundMode, SceneSettings } from '../config/scene'
import { IconButton } from './ui/IconButton'
import { SegmentedControl } from './ui/SegmentedControl'
import type { SegmentedOption } from './ui/SegmentedControl'
import { Switch } from './ui/Switch'

interface PreferencesPanelProps {
  open: boolean
  settings: SceneSettings
  onChange: (changes: Partial<SceneSettings>) => void
  onClose: () => void
}

const BACKGROUND_OPTIONS: SegmentedOption<BackgroundMode>[] = [
  { value: 'preset', label: 'Cenário' },
  { value: 'color', label: 'Cor sólida' },
]

const SWATCH_COLORS: readonly string[] = BACKGROUND_SWATCHES.map(({ color }) => color)

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-xs font-semibold text-ink-muted">{title}</h3>
      {children}
    </section>
  )
}

const optionChip =
  'flex h-9 shrink-0 cursor-pointer items-center rounded-control border border-line px-3 text-sm transition-colors hover:bg-fill-hover has-checked:border-ink has-checked:bg-fill-pressed has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink'

const swatch =
  'size-8 shrink-0 cursor-pointer rounded-full border border-line has-checked:outline-2 has-checked:outline-offset-2 has-checked:outline-ink has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink'

/**
 * Ajustes da cena em um <dialog> nativo, que já cuida do foco preso, do Esc e
 * de devolver o foco ao botão que o abriu. Fica ao lado da cena (folha
 * inferior no celular, altura toda sobre o trilho quando deitado) e não
 * escurece o fundo, para as mudanças aparecerem ao vivo no mockup.
 */
export function PreferencesPanel({ open, settings, onChange, onClose }: PreferencesPanelProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const speedId = useId()
  const isCustomColor = !SWATCH_COLORS.includes(settings.backgroundColor)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={onClose}
      // Clique fora do painel cai no próprio <dialog> (área do backdrop)
      onClick={(event) => event.target === event.currentTarget && onClose()}
      className="m-0 bg-surface p-0 text-ink shadow-raised transition-[opacity,translate,display,overlay] transition-discrete duration-200 ease-snappy backdrop:bg-transparent open:translate-x-0 open:translate-y-0 open:opacity-100 max-sm:inset-x-0 max-sm:top-auto max-sm:bottom-0 max-sm:max-h-[75dvh] max-sm:w-full max-sm:max-w-none max-sm:translate-y-full max-sm:rounded-t-panel max-sm:border-t max-sm:border-line max-sm:starting:open:translate-y-full sm:top-[calc(4.25rem+env(safe-area-inset-top))] sm:right-[max(--spacing(4),env(safe-area-inset-right))] sm:bottom-auto sm:left-auto sm:max-h-[calc(100dvh-5.25rem-env(safe-area-inset-top)-env(safe-area-inset-bottom))] sm:w-88 sm:translate-x-3 sm:rounded-panel sm:border sm:border-line sm:opacity-0 sm:starting:open:translate-x-3 sm:starting:open:opacity-0 landscape-short:top-2 landscape-short:max-h-[calc(100dvh-0.5rem-max(0.5rem,env(safe-area-inset-bottom)))]"
    >
      <div className="flex flex-col">
        <div className="flex items-center justify-between py-2 pr-2 pl-5">
          <h2 id={titleId} className="text-base font-semibold">
            Ajustes da cena
          </h2>
          <IconButton label="Fechar" icon={<PiX aria-hidden />} onClick={onClose} tooltipSide="left" />
        </div>

        <div className="flex flex-col gap-5 border-y border-line px-5 py-4 sm:gap-6 sm:py-5 landscape-short:gap-5 landscape-short:py-4">
          <Section title="Rotação">
            <Switch
              label="Girar automaticamente"
              checked={settings.autoRotate}
              onChange={(autoRotate) => onChange({ autoRotate })}
            />
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm">
                <label htmlFor={speedId} className={settings.autoRotate ? '' : 'text-ink-muted'}>
                  Velocidade
                </label>
                <output htmlFor={speedId} className="text-ink-muted tabular-nums">
                  {settings.rotateSpeed}
                </output>
              </div>
              <input
                id={speedId}
                type="range"
                {...ROTATE_SPEED_RANGE}
                value={settings.rotateSpeed}
                onChange={(event) => onChange({ rotateSpeed: Number(event.target.value) })}
                disabled={!settings.autoRotate}
                className="w-full cursor-pointer accent-accent disabled:cursor-not-allowed disabled:opacity-45"
              />
            </div>
          </Section>

          <Section title="Fundo">
            <SegmentedControl
              legend="Tipo de fundo"
              name="backgroundMode"
              options={BACKGROUND_OPTIONS}
              value={settings.backgroundMode}
              onChange={(backgroundMode) => onChange({ backgroundMode })}
            />

            {settings.backgroundMode === 'preset' ? (
              <fieldset className="-mx-5 flex min-w-0 gap-2 overflow-x-auto px-5 py-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0">
                <legend className="sr-only">Cenário</legend>
                {ENVIRONMENT_PRESETS.map(({ id, label }) => (
                  <label key={id} className={optionChip}>
                    <input
                      type="radio"
                      name="environment"
                      value={id}
                      checked={settings.environment === id}
                      onChange={() => onChange({ environment: id })}
                      className="sr-only"
                    />
                    {label}
                  </label>
                ))}
              </fieldset>
            ) : (
              <fieldset className="flex flex-wrap items-center gap-3 py-1">
                <legend className="sr-only">Cor de fundo</legend>
                {BACKGROUND_SWATCHES.map(({ color, label }) => (
                  <label key={color} className={swatch} style={{ backgroundColor: color }}>
                    <input
                      type="radio"
                      name="backgroundColor"
                      value={color}
                      checked={settings.backgroundColor === color}
                      onChange={() => onChange({ backgroundColor: color })}
                      aria-label={label}
                      className="sr-only"
                    />
                  </label>
                ))}
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="color"
                    value={settings.backgroundColor}
                    onChange={(event) => onChange({ backgroundColor: event.target.value })}
                    className={`size-8 cursor-pointer rounded-full border border-line bg-transparent p-0 [&::-moz-color-swatch]:rounded-full [&::-moz-color-swatch]:border-0 [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-0 [&::-webkit-color-swatch-wrapper]:p-0 ${
                      isCustomColor ? 'outline-2 outline-offset-2 outline-ink' : ''
                    }`}
                  />
                  Outra cor
                </label>
              </fieldset>
            )}
          </Section>
        </div>

        {/* Na folha inferior, o botão fica acima da barra de início do iPhone */}
        <div className="px-5 pt-3 pb-safe-3 sm:py-4 landscape-short:py-3">
          <button
            type="button"
            onClick={onClose}
            className="h-10 w-full cursor-pointer rounded-control bg-accent text-sm font-medium text-on-accent transition-opacity hover:opacity-90"
          >
            Concluir
          </button>
        </div>
      </div>
    </dialog>
  )
}
