import { useCallback } from 'react'
import type { FocusEvent } from 'react'
import { PiCheck } from 'react-icons/pi'
import { getModelThumbnail, MODEL_CATALOG, MODEL_IDS } from './scene/models/catalog'
import type { ModelId } from './scene/models/catalog'
import { SidePanel } from './ui/SidePanel'

interface ModelLibraryProps {
  open: boolean
  model: ModelId
  onSelect: (model: ModelId) => void
  onClose: () => void
}

/** Lado das miniaturas geradas pelo script, para o navegador reservar o espaço antes de carregar. */
const THUMBNAIL_SIZE = 320

/**
 * Biblioteca de modelos no painel lateral, com as miniaturas pré-renderizadas
 * (imagens, e não cenas 3D, para não puxar o three para o pacote inicial).
 * Escolher troca o modelo na hora e o painel continua aberto, como nos
 * ajustes. No celular em pé é uma fileira que rola para o lado, para a folha
 * ficar baixa e o palco continuar à vista; deitado, uma coluna sobre o trilho.
 *
 * Os cartões são rádios nativos: o Tab entra no modelo atual e as setas trocam.
 */
/**
 * O navegador rola até o rádio focado, que é só um ponto no topo do cartão.
 * Pelas setas ou ao abrir, o cartão inteiro precisa aparecer.
 */
function revealCard(event: FocusEvent<HTMLInputElement>) {
  event.currentTarget.parentElement?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
}

export function ModelLibrary({ open, model, onSelect, onClose }: ModelLibraryProps) {
  // O <dialog> leva o foco ao botão de fechar; aqui ele vai para o modelo
  // atual, que assim também rola para dentro da fileira
  const focusCurrent = useCallback((dialog: HTMLDialogElement) => {
    dialog.querySelector<HTMLInputElement>('input[name="model"]:checked')?.focus()
  }, [])

  return (
    <SidePanel open={open} title="Modelos" onClose={onClose} onOpened={focusCurrent} className="sm:w-88 landscape-short:w-52">
      {/* Quem rola é esta div, e não o <fieldset>, que por padrão cresce até
          caber o conteúdo e faria o próprio <dialog> rolar, levando o título
          junto. O relative segura os rádios sr-only (absolutos) aqui dentro */}
      <div className="relative min-h-0 overflow-auto overscroll-contain border-t border-line">
        <fieldset className="flex w-max gap-3 px-5 pt-4 pb-safe-4 sm:grid sm:w-auto sm:min-w-0 sm:grid-cols-2 sm:pb-5 landscape-short:grid-cols-1 landscape-short:pb-4">
          <legend className="sr-only">Modelo</legend>
          {MODEL_IDS.map((id) => (
            <label
              key={id}
              className="group relative flex w-36 shrink-0 scroll-m-3 cursor-pointer flex-col gap-1.5 rounded-control p-1.5 transition-colors hover:bg-fill-hover has-checked:bg-fill-pressed has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink sm:w-auto"
            >
              <input
                type="radio"
                name="model"
                value={id}
                checked={model === id}
                onChange={() => onSelect(id)}
                onFocus={revealCard}
                className="sr-only"
              />
              <img
                src={getModelThumbnail(id)}
                alt=""
                width={THUMBNAIL_SIZE}
                height={THUMBNAIL_SIZE}
                loading="lazy"
                decoding="async"
                className="aspect-square w-full rounded-inner border border-line bg-sunken group-has-checked:border-ink"
              />
              <span className="flex items-center justify-between gap-2 px-0.5 text-sm font-medium">
                {MODEL_CATALOG[id].label}
                <PiCheck aria-hidden className="hidden size-4 group-has-checked:block" />
              </span>
            </label>
          ))}
        </fieldset>
      </div>
    </SidePanel>
  )
}
