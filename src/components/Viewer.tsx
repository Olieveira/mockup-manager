import { useRef, useState } from 'react'
import type { ChangeEvent, DragEvent } from 'react'
import {
  FaArrowLeft,
  FaArrowRight,
  FaArrowsRotate,
  FaCircleStop,
  FaDownload,
  FaEye,
  FaEyeSlash,
  FaFileCirclePlus,
  FaGear,
  FaRotate,
} from 'react-icons/fa6'
import type { SceneSettings } from '../config/scene'
import { useArtwork } from '../hooks/useArtwork'
import { ACCEPTED_ARTWORK_TYPES } from '../lib/artwork'
import { saveImage } from '../lib/saveImage'
import { Scene } from './scene/Scene'
import type { SceneHandle } from './scene/Scene'
import { MODEL_IDS } from './scene/models'
import { ActionButton } from './ui/ActionButton'
import { IconButton } from './ui/IconButton'
import { Toast } from './ui/Toast'

const EXPORT_FILE_NAME = 'mockup.png'

interface ViewerProps {
  settings: SceneSettings
  onToggleAutoRotate: () => void
  onOpenPreferences: () => void
}

export function Viewer({ settings, onToggleAutoRotate, onOpenPreferences }: ViewerProps) {
  const [modelIndex, setModelIndex] = useState(0)
  const [showHints, setShowHints] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)
  const { artworkUrl, error, isProcessing, selectArtwork, resetArtwork, dismissError } = useArtwork()
  const sceneRef = useRef<SceneHandle>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function stepModel(step: number) {
    setModelIndex((index) => (index + step + MODEL_IDS.length) % MODEL_IDS.length)
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    // Limpa o campo para permitir escolher o mesmo arquivo de novo
    event.target.value = ''
    if (file) selectArtwork(file)
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file) selectArtwork(file)
  }

  async function handleExport() {
    try {
      const blob = await sceneRef.current?.capture()
      if (blob) await saveImage(blob, EXPORT_FILE_NAME)
    } catch {
      setExportError('Não foi possível exportar a imagem.')
    }
  }

  function dismissErrors() {
    dismissError()
    setExportError(null)
  }

  return (
    <div
      className="relative flex aspect-[16/24] max-h-[80dvh] w-full items-center justify-center self-center overflow-hidden rounded-lg bg-gray-950 shadow-lg sm:aspect-video sm:max-h-none sm:max-w-5xl sm:self-stretch"
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDrop}
    >
      <Scene ref={sceneRef} model={MODEL_IDS[modelIndex]} artworkUrl={artworkUrl} settings={settings} />

      <Toast message={error ?? exportError} onDismiss={dismissErrors} />

      <IconButton
        className="top-3 left-3"
        label={settings.autoRotate ? 'Desativar rotação automática' : 'Ativar rotação automática'}
        icon={settings.autoRotate ? <FaCircleStop /> : <FaRotate />}
        onClick={onToggleAutoRotate}
        showHint={showHints}
        hintDirection="right"
      />
      <IconButton
        className="top-3 right-3"
        label="Preferências do mockup"
        icon={<FaGear />}
        onClick={onOpenPreferences}
        showHint={showHints}
        hintDirection="left"
      />
      <IconButton
        className="top-1/2 left-2 -translate-y-1/2"
        label="Mockup anterior"
        icon={<FaArrowLeft />}
        onClick={() => stepModel(-1)}
        showHint={showHints}
        hintDirection="right"
      />
      <IconButton
        className="top-1/2 right-2 -translate-y-1/2"
        label="Próximo mockup"
        icon={<FaArrowRight />}
        onClick={() => stepModel(1)}
        showHint={showHints}
        hintDirection="left"
      />
      <IconButton
        className="bottom-2 left-2"
        label={showHints ? 'Ocultar dicas dos botões' : 'Mostrar dicas dos botões'}
        icon={showHints ? <FaEyeSlash /> : <FaEye />}
        onClick={() => setShowHints((show) => !show)}
        showHint={showHints}
        hintDirection="top-start"
      />

      <div className="absolute bottom-2 flex items-center justify-center gap-2">
        <ActionButton
          label="Trocar arte"
          icon={<FaFileCirclePlus />}
          onClick={() => fileInputRef.current?.click()}
          showLabel={showHints}
          disabled={isProcessing}
        />
        <ActionButton label="Redefinir" icon={<FaArrowsRotate />} onClick={resetArtwork} showLabel={showHints} />
        <ActionButton label="Exportar" icon={<FaDownload />} onClick={handleExport} showLabel={showHints} />
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
    </div>
  )
}
