import { PiCaretDown, PiCaretLeft, PiCaretRight } from 'react-icons/pi'
import { MODEL_CATALOG, MODEL_IDS } from './scene/models/catalog'
import { IconButton } from './ui/IconButton'

interface ModelSelectorProps {
  index: number
  onStep: (step: number) => void
  onOpenLibrary: () => void
}

/**
 * Alterna entre os modelos do catálogo, em ciclo, e abre a biblioteca pelo
 * nome do modelo atual.
 */
export function ModelSelector({ index, onStep, onOpenLibrary }: ModelSelectorProps) {
  return (
    <div className="-ml-2 flex items-center landscape-short:ml-0">
      <IconButton label="Mockup anterior" icon={<PiCaretLeft aria-hidden />} onClick={() => onStep(-1)} tooltipSide="bottom" />
      {/* A região viva anuncia o modelo novo ao trocar pelas setas ou pela biblioteca */}
      <p aria-live="polite">
        <button
          type="button"
          onClick={onOpenLibrary}
          aria-haspopup="dialog"
          className="flex h-9 min-w-32 cursor-pointer items-center justify-center gap-2 rounded-control px-2.5 transition-colors hover:bg-fill-hover active:bg-fill-pressed"
        >
          <span className="text-base font-semibold">{MODEL_CATALOG[MODEL_IDS[index]].label}</span>
          <span className="text-sm text-ink-muted tabular-nums">
            <span className="sr-only">modelo </span>
            {index + 1} de {MODEL_IDS.length}
          </span>
          <PiCaretDown aria-hidden className="size-3.5 text-ink-muted" />
        </button>
      </p>
      <IconButton label="Próximo mockup" icon={<PiCaretRight aria-hidden />} onClick={() => onStep(1)} tooltipSide="bottom" />
    </div>
  )
}
