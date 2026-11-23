import { lazy, Suspense, useCallback, useRef, useState } from 'react'
import type { ChangeEvent, DragEvent } from 'react'
import {
  PiArrowCounterClockwise,
  PiArrowsClockwise,
  PiCaretLeft,
  PiCaretRight,
  PiDownloadSimple,
  PiImageSquare,
  PiSlidersHorizontal,
} from 'react-icons/pi'
import type { SceneSettings } from '../config/scene'
import { useArtwork } from '../hooks/useArtwork'
import { ACCEPTED_ARTWORK_TYPES } from '../lib/artwork'
import { saveImage } from '../lib/saveImage'
import type { SceneHandle } from './scene/Scene'
import { MODEL_CATALOG, MODEL_IDS } from './scene/models/catalog'
import { CropMarks } from './ui/CropMarks'
import { IconButton } from './ui/IconButton'
import { Notice } from './ui/Notice'
import { ToolButton } from './ui/ToolButton'

const EXPORT_FILE_NAME = 'mockup.png'

// three, R3F e drei ficam fora do pacote inicial: o restante da interface
// aparece antes, enquanto a cena baixa
const Scene = lazy(() => import('./scene/Scene'))

interface ViewerProps {
  settings: SceneSettings
  onToggleAutoRotate: () => void
  onOpenPreferences: () => void
}

function hasFiles(event: DragEvent) {
  return event.dataTransfer.types.includes('Files')
}

export function Viewer({ settings, onToggleAutoRotate, onOpenPreferences }: ViewerProps) {
  const [modelIndex, setModelIndex] = useState(0)
  const [isExporting, setIsExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)
  const [isSceneReady, setIsSceneReady] = useState(false)
  // Conta entradas e saídas, já que dragleave também dispara ao passar sobre os filhos
  const [dragDepth, setDragDepth] = useState(0)
  const { artworkUrl, error, isProcessing, selectArtwork, resetArtwork, dismissError } = useArtwork()
  const sceneRef = useRef<SceneHandle>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const model = MODEL_IDS[modelIndex]
  const markSceneReady = useCallback(() => setIsSceneReady(true), [])

  function stepModel(step: number) {
    setModelIndex((index) => (index + step + MODEL_IDS.length) % MODEL_IDS.length)
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    // Limpa o campo para permitir escolher o mesmo arquivo de novo
    event.target.value = ''
    if (file) selectArtwork(file)
  }

  function handleDragEnter(event: DragEvent) {
    if (hasFiles(event)) setDragDepth((depth) => depth + 1)
  }

  function handleDragLeave(event: DragEvent) {
    if (hasFiles(event)) setDragDepth((depth) => Math.max(0, depth - 1))
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault()
    setDragDepth(0)
    const file = event.dataTransfer.files[0]
    if (file) selectArtwork(file)
  }

  async function handleExport() {
    setIsExporting(true)
    try {
      const blob = await sceneRef.current?.capture()
      if (blob) await saveImage(blob, EXPORT_FILE_NAME)
    } catch {
      setExportError('Não foi possível exportar a imagem.')
    } finally {
      setIsExporting(false)
    }
  }

  function dismissErrors() {
    dismissError()
    setExportError(null)
  }

  return (
    <section
      aria-label="Mockup"
      className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col gap-4 px-4 pt-2 pb-4 sm:px-6 sm:pt-3 sm:pb-5"
    >
      <div className="flex h-10 shrink-0 items-center justify-between gap-4">
        <div className="-ml-2 flex items-center">
          <IconButton label="Mockup anterior" icon={<PiCaretLeft aria-hidden />} onClick={() => stepModel(-1)} tooltipSide="bottom" />
          <p aria-live="polite" className="flex min-w-28 items-baseline justify-center gap-2 px-2">
            <span className="text-base font-semibold">{MODEL_CATALOG[model].label}</span>
            <span className="text-sm text-ink-muted tabular-nums">
              <span className="sr-only">modelo </span>
              {modelIndex + 1} de {MODEL_IDS.length}
            </span>
          </p>
          <IconButton label="Próximo mockup" icon={<PiCaretRight aria-hidden />} onClick={() => stepModel(1)} tooltipSide="bottom" />
        </div>
        <p className="hidden text-sm text-ink-muted pointer-fine:block">
          {isProcessing ? 'Preparando a arte…' : 'Arraste uma imagem PNG, JPG ou WebP até a cena'}
        </p>
      </div>

      <div
        className="relative min-h-0 flex-1"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
      >
        <CropMarks />
        <div className="absolute inset-0 overflow-hidden bg-sunken">
          <Suspense fallback={null}>
            <Scene
              ref={sceneRef}
              model={model}
              artworkUrl={artworkUrl}
              settings={settings}
              onReady={markSceneReady}
            />
          </Suspense>
        </div>

        {dragDepth > 0 && (
          <div className="pointer-events-none absolute inset-3 z-10 grid place-items-center rounded-control border-2 border-dashed border-ink bg-surface/85 transition-opacity duration-150 starting:opacity-0">
            <p className="text-base font-semibold">Solte para aplicar a arte</p>
          </div>
        )}

        <Notice message={error ?? exportError} onDismiss={dismissErrors} />
      </div>

      <div className="flex shrink-0 gap-1 sm:justify-between sm:gap-2">
        <div className="flex gap-2 max-sm:contents">
          <ToolButton
            label="Girar"
            icon={<PiArrowsClockwise />}
            onClick={onToggleAutoRotate}
            pressed={settings.autoRotate}
          />
          <ToolButton label="Ajustes" icon={<PiSlidersHorizontal />} onClick={onOpenPreferences} />
        </div>
        <div className="flex gap-2 max-sm:contents">
          <ToolButton
            label="Trocar arte"
            shortLabel="Arte"
            icon={<PiImageSquare />}
            onClick={() => fileInputRef.current?.click()}
            busy={isProcessing}
          />
          <ToolButton
            label="Redefinir"
            icon={<PiArrowCounterClockwise />}
            onClick={resetArtwork}
            disabled={!artworkUrl}
          />
          <ToolButton
            label={isExporting ? 'Exportando…' : 'Exportar'}
            icon={<PiDownloadSimple />}
            onClick={handleExport}
            variant="primary"
            busy={isExporting}
            disabled={!isSceneReady}
          />
        </div>
      </div>

      {/* O campo precisa estar no DOM: o Safari do iOS não dispara o evento
          change em inputs criados só em memória */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_ARTWORK_TYPES.join(',')}
        onChange={handleFileChange}
        className="hidden"
        tabIndex={-1}
        aria-hidden
      />
    </section>
  )
}
