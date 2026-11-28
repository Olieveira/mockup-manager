import { lazy, Suspense, useCallback, useRef, useState } from 'react'
import type { ChangeEvent, DragEvent, ReactNode, RefObject } from 'react'
import {
  PiArrowCounterClockwise,
  PiArrowsClockwise,
  PiDownloadSimple,
  PiImageSquare,
  PiSlidersHorizontal,
} from 'react-icons/pi'
import type { SceneSettings } from '../config/scene'
import { useArtwork } from '../hooks/useArtwork'
import { ACCEPTED_ARTWORK_TYPES } from '../lib/artwork'
import { saveImage } from '../lib/saveImage'
import { StageErrorBoundary } from './StageErrorBoundary'
import type { SceneHandle } from './scene/Scene'
import type { ModelId } from './scene/models/catalog'
import { CropMarks } from './ui/CropMarks'
import { Notice } from './ui/Notice'
import { StageProgress } from './ui/StageProgress'
import { ToolButton } from './ui/ToolButton'

const EXPORT_FILE_NAME = 'mockup.png'

// three, R3F e drei ficam fora do pacote inicial: o restante da interface
// aparece antes, enquanto a cena baixa
const Scene = lazy(() => import('./scene/Scene'))

interface ViewerProps {
  sceneRef: RefObject<SceneHandle | null>
  model: ModelId
  /** Seletor de modelo, quando ele fica acima do palco (fora do celular deitado). */
  modelSelector: ReactNode
  /** Botão Vista, quando ele fica acima do palco (fora do celular deitado). */
  viewMenu: ReactNode
  settings: SceneSettings
  onToggleAutoRotate: () => void
  onOpenPreferences: () => void
  /** Duplo clique no palco, para voltar à vista Inicial (só com mouse ou trackpad). */
  onResetView?: () => void
}

function hasFiles(event: DragEvent) {
  return event.dataTransfer.types.includes('Files')
}

export function Viewer({
  sceneRef,
  model,
  modelSelector,
  viewMenu,
  settings,
  onToggleAutoRotate,
  onOpenPreferences,
  onResetView,
}: ViewerProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)
  const [isSceneReady, setIsSceneReady] = useState(false)
  // Conta entradas e saídas, já que dragleave também dispara ao passar sobre os filhos
  const [dragDepth, setDragDepth] = useState(0)
  const { artworkUrl, error, isProcessing, selectArtwork, resetArtwork, dismissError } = useArtwork()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const markSceneReady = useCallback(() => setIsSceneReady(true), [])

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
      className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col gap-4 px-safe-4 pt-2 pb-safe-4 sm:px-safe-6 sm:pt-3 sm:pb-safe-5 landscape-short:contents"
    >
      <div className="flex h-10 shrink-0 items-center justify-between gap-4 landscape-short:hidden">
        {modelSelector}
        <div className="flex min-w-0 items-center gap-4">
          <p className="hidden truncate text-sm text-ink-muted pointer-fine:block">
            {isProcessing ? 'Preparando a arte…' : 'Arraste uma imagem PNG, JPG ou WebP até a cena'}
          </p>
          {viewMenu}
        </div>
      </div>

      <div
        className="relative min-h-0 flex-1 landscape-short:col-start-1 landscape-short:row-start-2 landscape-short:mt-3 landscape-short:mr-3 landscape-short:mb-[max(--spacing(3),env(safe-area-inset-bottom))] landscape-short:ml-[max(--spacing(4),env(safe-area-inset-left))]"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
      >
        <CropMarks />
        <div className="absolute inset-0 overflow-hidden bg-sunken" onDoubleClick={onResetView}>
          <StageErrorBoundary>
            <Suspense fallback={<StageProgress placement="center" label="Preparando o visualizador" />}>
              <Scene
                ref={sceneRef}
                model={model}
                artworkUrl={artworkUrl}
                settings={settings}
                onReady={markSceneReady}
              />
            </Suspense>
          </StageErrorBoundary>
        </div>

        {dragDepth > 0 && (
          <div className="pointer-events-none absolute inset-3 z-10 grid place-items-center rounded-control border-2 border-dashed border-ink bg-surface/85 transition-opacity duration-150 starting:opacity-0">
            <p className="text-base font-semibold">Solte para aplicar a arte</p>
          </div>
        )}

        <Notice message={error ?? exportError} onDismiss={dismissErrors} />
      </div>

      <div className="flex shrink-0 gap-1 sm:justify-between sm:gap-2 landscape-short:col-start-2 landscape-short:row-span-2 landscape-short:row-start-1 landscape-short:flex-col landscape-short:border-l landscape-short:border-line landscape-short:bg-chrome landscape-short:pt-2 landscape-short:pb-safe-2 landscape-short:pl-2 landscape-short:pr-[max(--spacing(2),env(safe-area-inset-right))]">
        <div className="flex gap-2 max-sm:contents landscape-short:flex-col landscape-short:gap-1">
          <ToolButton
            label="Girar"
            icon={<PiArrowsClockwise />}
            onClick={onToggleAutoRotate}
            pressed={settings.autoRotate}
          />
          <ToolButton label="Ajustes" icon={<PiSlidersHorizontal />} onClick={onOpenPreferences} />
        </div>
        <div className="flex gap-2 max-sm:contents landscape-short:flex-col landscape-short:gap-1">
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
