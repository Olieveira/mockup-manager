import type { ReactNode } from 'react'
import { PiCaretRight } from 'react-icons/pi'
import {
  BACKGROUND_SWATCHES,
  DEFAULT_LIGHTING,
  ENVIRONMENT_PRESETS,
  isDefaultLighting,
  LIGHTING_RANGES,
  ROTATE_SPEED_RANGE,
} from '../config/scene'
import type { BackgroundMode, SceneSettings } from '../config/scene'
import { Chip, ChipGroup } from './ui/ChipGroup'
import { RangeField } from './ui/RangeField'
import { SegmentedControl } from './ui/SegmentedControl'
import type { SegmentedOption } from './ui/SegmentedControl'
import { SidePanel } from './ui/SidePanel'
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

const footerButton =
  'h-10 flex-1 cursor-pointer rounded-control text-sm font-medium transition-[background-color,opacity]'

const swatch =
  'size-8 shrink-0 cursor-pointer rounded-full border border-line has-checked:outline-2 has-checked:outline-offset-2 has-checked:outline-ink has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink'

/**
 * Ajustes da cena no painel lateral (folha inferior no celular). Título e
 * rodapé ficam fixos e só os ajustes rolam, para Concluir estar sempre à mão
 * mesmo na folha do celular e com ele deitado.
 */
export function PreferencesPanel({ open, settings, onChange, onClose }: PreferencesPanelProps) {
  const isCustomColor = !SWATCH_COLORS.includes(settings.backgroundColor)
  const isLightingDefault = isDefaultLighting(settings)

  return (
    <SidePanel open={open} title="Ajustes da cena" onClose={onClose} className="sm:w-88">
      {/* O relative da área rolável segura os rádios sr-only (absolutos)
          dentro dela, senão eles fazem o próprio <dialog> rolar */}
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
            <ChipGroup legend="Cenário">
              {ENVIRONMENT_PRESETS.map(({ id, label }) => (
                <Chip
                  key={id}
                  name="environment"
                  checked={settings.environment === id}
                  onChange={() => onChange({ environment: id })}
                >
                  {label}
                </Chip>
              ))}
            </ChipGroup>
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
    </SidePanel>
  )
}
