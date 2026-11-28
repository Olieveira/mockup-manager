import { useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { PiWarningCircle } from 'react-icons/pi'
import type { OpenResult, SceneFileController } from '../hooks/useSceneFile'
import { embeddedSize } from '../lib/sceneFile'
import { secondaryButton } from './ui/buttons'
import { Switch } from './ui/Switch'

interface SceneFileProps {
  controller: SceneFileController
  /** A arte enviada, ou null com a arte de exemplo (que não precisa ir no arquivo). */
  artwork: Blob | null
  hasPresets: boolean
}

type Status = { tone: 'done' | 'warning'; text: string }

const megabytes = new Intl.NumberFormat('pt-BR', { style: 'unit', unit: 'megabyte', maximumFractionDigits: 1 })
const kilobytes = new Intl.NumberFormat('pt-BR', { style: 'unit', unit: 'kilobyte', maximumFractionDigits: 0 })

function formatSize(bytes: number) {
  return bytes < 100_000 ? kilobytes.format(bytes / 1000) : megabytes.format(bytes / 1_000_000)
}

function toStatus({ done = '', error, warning }: OpenResult): Status {
  const problem = error ?? warning
  return problem ? { tone: 'warning', text: problem } : { tone: 'done', text: done }
}

/**
 * Exportar e abrir a cena e as predefinições em arquivo, no fim do painel de
 * ajustes. O resultado de abrir aparece aqui mesmo, e não sobre o palco, que
 * a folha do celular em pé cobre em parte.
 */
export function SceneFile({ controller, artwork, hasPresets }: SceneFileProps) {
  const [includeArtwork, setIncludeArtwork] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [status, setStatus] = useState<Status | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { isOpening, exportScene, exportPresets, openFile } = controller

  async function handleExport(save: () => Promise<void>) {
    setStatus(null)
    setIsExporting(true)
    try {
      await save()
    } catch {
      setStatus({ tone: 'warning', text: 'Não foi possível exportar o arquivo.' })
    } finally {
      setIsExporting(false)
    }
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    // Limpa o campo para permitir abrir o mesmo arquivo de novo
    event.target.value = ''
    if (!file) return
    setStatus(null)
    setStatus(toStatus(await openFile(file)))
  }

  return (
    <>
      <p className="text-sm text-ink-muted">
        Guarde o modelo, os ajustes e a arte num arquivo .json para abrir depois ou em outro aparelho. As
        predefinições saem num arquivo à parte.
      </p>
      {artwork && (
        <Switch
          label={`Incluir a arte (${formatSize(embeddedSize(artwork))})`}
          checked={includeArtwork}
          onChange={setIncludeArtwork}
        />
      )}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => handleExport(() => exportScene(includeArtwork))}
          disabled={isExporting}
          className={`${secondaryButton} flex-1 whitespace-nowrap`}
        >
          Exportar cena
        </button>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isOpening}
          className={`${secondaryButton} flex-1 whitespace-nowrap`}
        >
          {isOpening ? 'Abrindo…' : 'Abrir arquivo'}
        </button>
        <button
          type="button"
          onClick={() => handleExport(exportPresets)}
          disabled={isExporting || !hasPresets}
          className={`${secondaryButton} basis-full`}
        >
          Exportar predefinições
        </button>
      </div>
      <div role="status" className="empty:hidden">
        {status && (
          <p className={`flex gap-2 text-sm ${status.tone === 'done' ? 'text-ink-muted' : ''}`}>
            {status.tone === 'warning' && <PiWarningCircle aria-hidden className="mt-0.5 size-4 shrink-0 text-danger" />}
            {status.text}
          </p>
        )}
      </div>
      {/* No DOM pelo mesmo motivo do campo da arte: o Safari do iOS não
          dispara o change em campos criados só em memória */}
      <input
        ref={inputRef}
        type="file"
        accept="application/json,.json"
        onChange={handleFileChange}
        className="hidden"
        tabIndex={-1}
        aria-hidden
      />
    </>
  )
}
