import { useId, useRef, useState } from 'react'
import type { FormEvent, KeyboardEvent } from 'react'
import { flushSync } from 'react-dom'
import type { SceneSettings } from '../config/scene'
import { useScenePresets } from '../hooks/useScenePresets'
import { isSamePresetName, isSameScene, PRESET_NAME_MAX_LENGTH } from '../lib/sceneStorage'
import { Chip, ChipGroup } from './ui/ChipGroup'

interface ScenePresetsProps {
  settings: SceneSettings
  onApply: (settings: SceneSettings) => void
}

const secondaryButton =
  'h-9 cursor-pointer rounded-control border border-line px-3 text-sm transition-colors hover:bg-fill-hover active:bg-fill-pressed'

/**
 * Predefinições de cena (fundo, luz e giro) com nome, no topo do painel de
 * ajustes. A marcada é a que bate com a cena atual: não existe "predefinição
 * escolhida" guardada à parte, então mexer num ajuste desmarca na hora e
 * voltar ao mesmo valor marca de novo.
 */
export function ScenePresets({ settings, onApply }: ScenePresetsProps) {
  const { presets, savePreset, removePreset } = useScenePresets()
  const [name, setName] = useState<string | null>(null)
  const saveButtonRef = useRef<HTMLButtonElement>(null)
  const inputId = useId()
  const hintId = useId()

  const current = presets.find((preset) => isSameScene(preset.settings, settings))
  const isNaming = name !== null
  const trimmedName = name?.trim() ?? ''
  const replaces = presets.some((preset) => isSamePresetName(preset.name, trimmedName))

  // O formulário e o "Excluir" somem da tela: o foco volta para "Salvar cena
  // atual" em vez de cair no <body> do painel
  function finish(action?: () => void) {
    flushSync(() => {
      action?.()
      setName(null)
    })
    saveButtonRef.current?.focus()
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (trimmedName) finish(() => savePreset(trimmedName, settings))
  }

  // Dentro do <dialog>, o Esc fecharia o painel inteiro: aqui ele só desiste do nome
  function handleKeyDown(event: KeyboardEvent) {
    if (event.key !== 'Escape') return
    event.preventDefault()
    finish()
  }

  return (
    <>
      {presets.length > 0 ? (
        <ChipGroup legend="Predefinição">
          {presets.map((preset) => (
            <Chip
              key={preset.name}
              name="scenePreset"
              title={preset.name}
              checked={preset === current}
              onChange={() => onApply(preset.settings)}
            >
              {preset.name}
            </Chip>
          ))}
        </ChipGroup>
      ) : (
        !isNaming && (
          <p className="text-sm text-ink-muted">
            Guarde fundo, luz e giro com um nome para aplicar de novo em qualquer modelo e arte.
          </p>
        )
      )}

      {isNaming ? (
        <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="flex flex-col gap-2">
          <label htmlFor={inputId} className="text-sm">
            Nome da predefinição
          </label>
          <input
            id={inputId}
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={PRESET_NAME_MAX_LENGTH}
            autoComplete="off"
            enterKeyHint="done"
            aria-describedby={replaces ? hintId : undefined}
            // O campo só aparece depois de um clique em "Salvar cena atual"
            autoFocus
            // Com menos de 16px o Safari do iPhone dá zoom na página ao focar
            className="h-10 min-w-0 rounded-control border border-line bg-surface px-3 text-base focus-visible:border-ink focus-visible:outline-none pointer-fine:text-sm"
          />
          {replaces && (
            <p id={hintId} className="text-xs text-ink-muted">
              Já existe uma predefinição com esse nome. Ela será substituída.
            </p>
          )}
          <div className="flex gap-2">
            <button type="button" onClick={() => finish()} className={`${secondaryButton} flex-1`}>
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!trimmedName}
              className="h-9 flex-1 cursor-pointer rounded-control bg-accent px-3 text-sm font-medium text-on-accent transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45"
            >
              {replaces ? 'Substituir' : 'Salvar'}
            </button>
          </div>
        </form>
      ) : (
        <div className="flex flex-wrap gap-2">
          <button ref={saveButtonRef} type="button" onClick={() => setName('')} className={secondaryButton}>
            Salvar cena atual
          </button>
          {current && (
            <button
              type="button"
              onClick={() => finish(() => removePreset(current.name))}
              aria-label={`Excluir a predefinição ${current.name}`}
              className={secondaryButton}
            >
              Excluir
            </button>
          )}
        </div>
      )}
    </>
  )
}
