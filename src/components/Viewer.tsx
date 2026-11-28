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
import type { ArtworkController } from '../hooks/useArtwork'
import type { OpenResult } from '../hooks/useSceneFile'
import { ACCEPTED_ARTWORK_TYPES } from '../lib/artwork'
import { saveFile } from '../lib/saveFile'
import { isJsonFile } from '../lib/sceneFile'
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
  /** A arte enviada, controlada pelo App para o painel também ler e trocar. */
  artwork: ArtworkController
  /** Abre um arquivo de cena ou de predefinições solto no palco. */
  onOpenFile: (file: File) => Promise<OpenResult>
  /** Um arquivo .json está sendo aberto. */
  isOpeningFile: boolean
  onToggleAutoRotate: () => void
  onOpenPreferences: () => void
  /** Duplo clique no palco, para voltar à vista Inicial (só com mouse ou trackpad). */
  onResetView?: () => void
}

function hasFiles(event: DragEvent) {
  return event.dataTransfer.types.includes('Files')
}

/**
 * O que o aviso de soltar diz, pelo tipo dos itens arrastados. Nem todo
 * navegador conta o tipo antes de soltar (e no Windows um .json pode vir sem
 * tipo): aí vale o texto que serve para os dois.
 */
function dropLabel({ items }: DataTransfer) {
  if (items.length > 1) return 'Solte um arquivo por vez'
  const type = items[0]?.type ?? ''
  if (type.startsWith('image/')) return 'Solte para aplicar a arte'
  if (type === 'application/json') return 'Solte para abrir o arquivo'
  return 'Solte a imagem ou o arquivo de cena'
}

type FileNotice = { tone: 'error' | 'info'; text: string }

export function Viewer({
  sceneRef,
  model,
  modelSelector,
  viewMenu,
  settings,
  artwork,
  onOpenFile,
  isOpeningFile,
  onToggleAutoRotate,
  onOpenPreferences,
  onResetView,
}: ViewerProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)
  const [isSceneReady, setIsSceneReady] = useState(false)
  // Conta entradas e saídas, já que dragleave também dispara ao passar sobre os filhos
  const [dragDepth, setDragDepth] = useState(0)
  const [dragLabel, setDragLabel] = useState('')
  const [fileNotice, setFileNotice] = useState<FileNotice | null>(null)
  const { error, isProcessing, selectArtwork, resetArtwork, dismissError } = artwork
  const artworkUrl = artwork.artwork?.url ?? null
  const fileInputRef = useRef<HTMLInputElement>(null)

  const markSceneReady = useCallback(() => setIsSceneReady(true), [])

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    // Limpa o campo para permitir escolher o mesmo arquivo de novo
    event.target.value = ''
    if (file) selectArtwork(file)
  }

  function handleDragEnter(event: DragEvent) {
    if (!hasFiles(event)) return
    if (dragDepth === 0) setDragLabel(dropLabel(event.dataTransfer))
    setDragDepth((depth) => depth + 1)
  }

  function handleDragLeave(event: DragEvent) {
    if (hasFiles(event)) setDragDepth((depth) => Math.max(0, depth - 1))
  }

  async function handleDrop(event: DragEvent) {
    event.preventDefault()
    setDragDepth(0)
    setFileNotice(null)
    const { files } = event.dataTransfer
    // Uma imagem e uma cena juntas não têm uma leitura óbvia: nada muda
    if (files.length > 1) {
      setFileNotice({ tone: 'error', text: 'Solte um arquivo por vez.' })
      return
    }
    const file = files[0]
    if (!file) return
    if (!isJsonFile(file)) {
      selectArtwork(file)
      return
    }
    const { kind, done, warning, error: openError } = await onOpenFile(file)
    const problem = openError ?? warning
    // A cena aberta aparece no palco; só as predefinições precisam de aviso
    if (problem) setFileNotice({ tone: 'error', text: problem })
    else if (kind === 'presets' && done) setFileNotice({ tone: 'info', text: done })
  }

  async function handleExport() {
    setIsExporting(true)
    try {
      const blob = await sceneRef.current?.capture()
      if (blob) await saveFile(blob, EXPORT_FILE_NAME)
    } catch {
      setExportError('Não foi possível exportar a imagem.')
    } finally {
      setIsExporting(false)
    }
  }

  function dismissErrors() {
    dismissError()
    setExportError(null)
    setFileNotice(null)
  }

  const notice: FileNotice | null =
    error || exportError ? { tone: 'error', text: (error ?? exportError) as string } : fileNotice

  return (
    <section
      aria-label="Mockup"
      className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col gap-4 px-safe-4 pt-2 pb-safe-4 sm:px-safe-6 sm:pt-3 sm:pb-safe-5 landscape-short:contents"
    >
      <div className="flex h-10 shrink-0 items-center justify-between gap-4 landscape-short:hidden">
        {modelSelector}
        <div className="flex min-w-0 items-center gap-4">
          <p className="hidden truncate text-sm text-ink-muted pointer-fine:block">
            {isProcessing
              ? 'Preparando a arte…'
              : isOpeningFile
                ? 'Abrindo o arquivo…'
                : 'Arraste uma imagem PNG, JPG ou WebP ou um arquivo .json até a cena'}
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
            <p className="text-base font-semibold">{dragLabel}</p>
          </div>
        )}

        <Notice message={notice?.text ?? null} tone={notice?.tone} onDismiss={dismissErrors} />
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
