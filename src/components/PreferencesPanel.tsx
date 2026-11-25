import { useEffect, useId, useRef } from 'react'
import type { ReactNode } from 'react'
import { PiCaretRight, PiX } from 'react-icons/pi'
import {
  BACKGROUND_SWATCHES,
  DEFAULT_LIGHTING,
  ENVIRONMENT_PRESETS,
  isDefaultLighting,
  LIGHTING_RANGES,
  ROTATE_SPEED_RANGE,
} from '../config/scene'
import type { BackgroundMode, SceneSettings } from '../config/scene'
import { IconButton } from './ui/IconButton'
import { RangeField } from './ui/RangeField'
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

const percentFormat = new Intl.NumberFormat('pt-BR', { style: 'percent' })
const exposureFormat = new Intl.NumberFormat('pt-BR', {
  signDisplay: 'exceptZero',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

const formatPercent = (value: number) => percentFormat.format(value)
const formatDegrees = (value: number) => `${value}°`
const formatExposure = (value: number) => `${exposureFormat.format(value)} EV`

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

const footerButton =
  'h-10 flex-1 cursor-pointer rounded-control text-sm font-medium transition-[background-color,opacity]'

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
  const isCustomColor = !SWATCH_COLORS.includes(settings.backgroundColor)
  const isLightingDefault = isDefaultLighting(settings)

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
      className="m-0 flex-col bg-surface p-0 text-ink shadow-raised transition-[opacity,translate,display,overlay] transition-discrete duration-200 ease-snappy backdrop:bg-transparent open:flex open:translate-x-0 open:translate-y-0 open:opacity-100 max-sm:inset-x-0 max-sm:top-auto max-sm:bottom-0 max-sm:max-h-[75dvh] max-sm:w-full max-sm:max-w-none max-sm:translate-y-full max-sm:rounded-t-panel max-sm:border-t max-sm:border-line max-sm:starting:open:translate-y-full sm:top-[calc(4.25rem+env(safe-area-inset-top))] sm:right-[max(--spacing(4),env(safe-area-inset-right))] sm:bottom-auto sm:left-auto sm:max-h-[calc(100dvh-5.25rem-env(safe-area-inset-top)-env(safe-area-inset-bottom))] sm:w-88 sm:translate-x-3 sm:rounded-panel sm:border sm:border-line sm:opacity-0 sm:starting:open:translate-x-3 sm:starting:open:opacity-0 landscape-short:top-2 landscape-short:max-h-[calc(100dvh-0.5rem-max(0.5rem,env(safe-area-inset-bottom)))]"
    >
      {/* Título e rodapé ficam fixos e só os ajustes rolam, para Concluir
          estar sempre à mão mesmo na folha do celular e com ele deitado. O
          relative da área rolável segura os rádios sr-only (absolutos) dentro
          dela, senão eles fazem o próprio <dialog> rolar */}
      <div className="flex min-h-0 flex-col">
        <div className="flex shrink-0 items-center justify-between py-2 pr-2 pl-5">
          <h2 id={titleId} className="text-base font-semibold">
            Ajustes da cena
          </h2>
          <IconButton label="Fechar" icon={<PiX aria-hidden />} onClick={onClose} tooltipSide="left" />
        </div>

        <div className="relative flex min-h-0 flex-col gap-5 overflow-y-auto overscroll-contain border-y border-line px-5 py-4 sm:gap-6 sm:py-5 landscape-short:gap-5 landscape-short:py-4">
          <Section title="Fundo">
            <SegmentedControl
              legend="Tipo de fundo"
              name="backgroundMode"
              options={BACKGROUND_OPTIONS}
              value={settings.backgroundMode}
              onChange={(backgroundMode) => onChange({ backgroundMode })}
            />

            {settings.backgroundMode === 'preset' ? (
              // Deitado, a grade volta a ser uma fileira rolável, como no celular em pé
              <fieldset className="-mx-5 flex min-w-0 gap-2 overflow-x-auto px-5 py-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 landscape-short:-mx-5 landscape-short:flex landscape-short:overflow-x-auto landscape-short:px-5">
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

            {settings.backgroundMode === 'preset' && (
              <RangeField
                label="Desfoque do fundo"
                value={settings.backgroundBlur}
                {...LIGHTING_RANGES.backgroundBlur}
                onChange={(backgroundBlur) => onChange({ backgroundBlur })}
                format={formatPercent}
              />
            )}
          </Section>

          <Section title="Luz">
            <Switch
              label="Sombra de contato"
              checked={settings.contactShadow}
              onChange={(contactShadow) => onChange({ contactShadow })}
            />
            <RangeField
              label="Intensidade do cenário"
              value={settings.environmentIntensity}
              {...LIGHTING_RANGES.environmentIntensity}
              onChange={(environmentIntensity) => onChange({ environmentIntensity })}
              format={formatPercent}
            />
            <RangeField
              label="Rotação do cenário"
              value={settings.environmentRotation}
              {...LIGHTING_RANGES.environmentRotation}
              onChange={(environmentRotation) => onChange({ environmentRotation })}
              format={formatDegrees}
            />
            {/* Recolhido para a folha do celular não crescer demais */}
            <details className="group/more">
              <summary className="-mx-1 flex w-fit cursor-pointer list-none items-center gap-1.5 rounded-control px-1 py-1 text-sm text-ink-muted transition-colors hover:text-ink [&::-webkit-details-marker]:hidden">
                <PiCaretRight aria-hidden className="size-3.5 transition-transform duration-150 group-open/more:rotate-90" />
                Mais ajustes de luz
              </summary>
              <div className="mt-3 flex flex-col gap-3">
                <RangeField
                  label="Exposição"
                  value={settings.exposure}
                  {...LIGHTING_RANGES.exposure}
                  onChange={(exposure) => onChange({ exposure })}
                  format={formatExposure}
                />
                <RangeField
                  label="Luz principal"
                  value={settings.lightIntensity}
                  {...LIGHTING_RANGES.lightIntensity}
                  onChange={(lightIntensity) => onChange({ lightIntensity })}
                  format={formatPercent}
                />
              </div>
            </details>
          </Section>

          <Section title="Giro automático">
            <Switch
              label="Girar automaticamente"
              checked={settings.autoRotate}
              onChange={(autoRotate) => onChange({ autoRotate })}
            />
            <RangeField
              label="Velocidade"
              value={settings.rotateSpeed}
              {...ROTATE_SPEED_RANGE}
              onChange={(rotateSpeed) => onChange({ rotateSpeed })}
              disabled={!settings.autoRotate}
            />
          </Section>
        </div>

        {/* Na folha inferior, o botão fica acima da barra de início do iPhone */}
        <div className="flex shrink-0 gap-2 px-5 pt-3 pb-safe-3 sm:py-4 landscape-short:py-3">
          {/* aria-disabled em vez de disabled: o botão continua focável e o
              foco não se perde quando ele fica sem efeito logo após o clique */}
          <button
            type="button"
            onClick={() => !isLightingDefault && onChange(DEFAULT_LIGHTING)}
            aria-disabled={isLightingDefault}
            className={`${footerButton} border border-line hover:bg-fill-hover aria-disabled:cursor-not-allowed aria-disabled:opacity-45 aria-disabled:hover:bg-transparent`}
          >
            Restaurar padrão
          </button>
          <button
            type="button"
            onClick={onClose}
            className={`${footerButton} bg-accent text-on-accent hover:opacity-90`}
          >
            Concluir
          </button>
        </div>
      </div>
    </dialog>
  )
}
