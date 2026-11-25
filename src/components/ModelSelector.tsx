import { PiCaretLeft, PiCaretRight } from 'react-icons/pi'
import { MODEL_CATALOG, MODEL_IDS } from './scene/models/catalog'
import { IconButton } from './ui/IconButton'

interface ModelSelectorProps {
  index: number
  onStep: (step: number) => void
}

/** Alterna entre os modelos do catálogo, em ciclo. */
export function ModelSelector({ index, onStep }: ModelSelectorProps) {
  return (
    <div className="-ml-2 flex items-center landscape-short:ml-0">
      <IconButton label="Mockup anterior" icon={<PiCaretLeft aria-hidden />} onClick={() => onStep(-1)} tooltipSide="bottom" />
      <p aria-live="polite" className="flex min-w-28 items-baseline justify-center gap-2 px-2">
        <span className="text-base font-semibold">{MODEL_CATALOG[MODEL_IDS[index]].label}</span>
        <span className="text-sm text-ink-muted tabular-nums">
          <span className="sr-only">modelo </span>
          {index + 1} de {MODEL_IDS.length}
        </span>
      </p>
      <IconButton label="Próximo mockup" icon={<PiCaretRight aria-hidden />} onClick={() => onStep(1)} tooltipSide="bottom" />
    </div>
  )
}
