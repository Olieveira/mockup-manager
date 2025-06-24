import React, { useEffect, useState, useRef } from 'react'
import { Scene } from './components/Scene'
import Header from './components/Header'
import heic2any from 'heic2any'
import { Nav } from './components/Nav'
import {
  FaFileCirclePlus, FaArrowsRotate, FaArrowLeft, FaArrowRight, FaGear, FaDownload, FaRotate,
  FaCircleStop, FaEye, FaEyeSlash, FaArrowDown, FaArrowUp
} from "react-icons/fa6"
import { motion, AnimatePresence } from 'framer-motion'
import { Preferencias } from './components/Preferencias'
import { PresetsType } from '@react-three/drei/helpers/environment-assets'
import { InfoPopOver } from './components/InfoPopOver'
import { Alert } from './components/Alert'

function App() {
  const [models, setModels] = useState<'blister' | 'caneca'>('blister')
  const [selectedFile, setSelectedFile] = useState<File | undefined>()
  const [arteUrl, setArteUrl] = useState<string | undefined>(undefined)
  const [bgScene, setBgScene] = useState<string | undefined>(undefined)
  const [preferencesView, setPreferencesView] = useState<boolean>(false)
  const [bgPresetMode, setBgPresetMode] = useState<boolean>(true)
  const [bgPreset, setBgPreset] = useState<PresetsType>("apartment")
  const [autoRotate, setAutoRotate] = useState<boolean>(false)
  const [rotateSpeed, setRotateSpeed] = useState<number>(3)
  const [showInfo, setShowInfo] = useState<boolean>(false)
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [showScrollUp, setShowScrollUp] = useState(false);
  const [showAlert, setShowAlert] = useState<[Boolean, string]>([false, "Alert"]);
  const [showLoading, setShowLoading] = useState<boolean>(false)
  const uploadTimer = useRef<number | undefined>(undefined)

  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.userAgent.includes('Macintosh') && 'ontouchend' in document);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    if (isIOS && isSafari) {
      startAlert('Atenção: Fotos no formato HEIC tiradas no iPhone/iPad podem não ser suportadas. Prefira JPEG/PNG ao enviar imagens.');
    }

    function handleScroll() {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;

      if (docHeight > windowHeight + 10) {
        setShowScrollDown(scrollY + windowHeight < docHeight - 10);
        setShowScrollUp(scrollY > 5);
      } else {
        setShowScrollDown(false);
        setShowScrollUp(false);
      }
    }

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('dragover', (e) => e.preventDefault());
    window.addEventListener('drop', (e) => e.preventDefault());

    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('dragover', (e) => e.preventDefault());
      window.removeEventListener('drop', (e) => e.preventDefault());
    };
  }, []);

  useEffect(() => {
    if (selectedFile) {
      startAlert("Arte alterada:\nnome: " + selectedFile.name + "\nTamanho: " + selectedFile.size + "\nTipo: " + selectedFile.type)
      const url = URL.createObjectURL(selectedFile)
      setArteUrl(url)
      return () => {
        URL.revokeObjectURL(url)
      }
    } else {
      setArteUrl(undefined)
    }
  }, [selectedFile])

  useEffect(() => {
    if (!showLoading) {
      clearTimeout(uploadTimer.current);
    }
  }, [showLoading])

  // Fecha o alerta automaticamente
  useEffect(() => {
    if (showAlert[0]) {
      const timer = setTimeout(() => {
        setShowAlert([false, showAlert[1]]);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showAlert]);

  function startAlert(message: string) {
    setShowAlert([true, message]);
  }

  function selectFile(): Promise<File | undefined> {
    return new Promise((resolve) => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/png, image/jpeg, image/jpg, image/heic, image/heif'
      input.onchange = (e: Event) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        resolve(file)
        uploadTimer.current = window.setTimeout(() => {
          startAlert("Arquivo ausente ou inválido. Prefira fotos PNG/JPEG.")
          setShowLoading(false)
        }, 8000)

        input.oninput = () => clearTimeout(uploadTimer.current);
      }
      input.click()
    })
  }

  // Converte heic -> png
  async function convertHeic(file: File): Promise<File | null> {
    try {
      const convertedBlob = await heic2any({
        blob: file,
        toType: "image/png"
      }) as Blob;

      if (!convertedBlob || convertedBlob.size === 0) {
        return null;
      }

      const nameWithoutExt = file.name.split('.').slice(0, -1).join('.');
      const convertedFile = new File([convertedBlob], nameWithoutExt + '.png', {
        type: 'image/png'
      });

      return convertedFile;
    } catch (err) {
      console.error('Erro na conversão heic2any:', err);
      return null;
    }
  }

  // exporta mockup
  async function handleNewMockup() {
    startAlert("Iniciado upload")
    setShowLoading(true)

    const file = await selectFile()

    if (!file) {
      setShowLoading(false)
      startAlert("Nenhum arquivo selecionado.")
      return
    }

    const maxSize = 7 * 1024 * 1024
    const isHeic = file.type.includes('heic') || file.name.toLowerCase().endsWith('.heic')

    if (file.size > maxSize) {
      setShowLoading(false)
      startAlert("Imagem muito grande! Utilize arquivos até 7MB.")
      return
    }

    try {
      if (isHeic) {
        const converted = await convertHeic(file);

        if (!converted) {
          setShowLoading(false);
          startAlert("Erro ao converter imagem HEIC. Prefira JPEG/PNG.");
          return;
        }

        setSelectedFile(converted);
      } else {
        setSelectedFile(file);
      }

      startAlert("Imagem carregada com sucesso!")
    } catch (error) {
      console.error("Erro ao processar imagem:", error)
      startAlert("Erro ao processar a imagem. Use outro formato.")
    }

    setShowLoading(false)
  }


  function handleExport() {
    // Aguarda o render do Three.js antes de capturar
    setTimeout(() => {
      const canvas = document.querySelector('.bg-gray-950 canvas') as HTMLCanvasElement | null;
      if (!canvas) {
        startAlert('Não foi possível encontrar a visualização para exportar.');
        return;
      }
      const dataUrl = canvas.toDataURL('image/png');

      // Link para download
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = 'mockup.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 100);
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-gradient-to-br from-gray-800 to-slate-950">
      <Header />
      <main className="flex flex-1 flex-col sm:flex-row">
        {/* WIP <Nav /> */}
        <section className="flex-1 flex items-center justify-center p-2">
          <div className="relative w-full h-full bg-gray-950 rounded-lg shadow-lg flex items-center justify-center
            sm:aspect-video aspect-[16/24] sm:max-w-5xl max-w-full sm:max-h-none max-h-[80vh]">

            {/* mostrar dicas */}
            <motion.div
              onClick={() => { setShowInfo((prev) => !prev) }}
              className="absolute bottom-2 left-2 z-30 w-10 h-10 bg-gray-800/80 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-700 transition"
              title="Mostrar/ocultar labels dos ícones"
            >
              {showInfo ? <FaEyeSlash className="text-white text-xl" /> : <FaEye className="text-white text-xl" />}
              <InfoPopOver show={showInfo} direction="top" className='mb-4 left-0'>
                Mostrar/ocultar dicas dos botões
              </InfoPopOver>
            </motion.div>

            {/* preferencias */}
            <motion.div
              className="absolute top-3 right-3 z-20 w-10 h-10 bg-gray-800/80 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-700 transition"
              title="Preferências do Mockup"
            >
              <FaGear
                onClick={() => { setPreferencesView(true) }}
                className="text-white text-xl" />
              <InfoPopOver show={showInfo} direction="left">
                Preferências do mockup
              </InfoPopOver>
            </motion.div>

            {/* Ir para início da página */}
            {showScrollUp && (
              <motion.button
                className="absolute top-3 left-2/6 z-20 w-10 h-10 bg-gray-800/80 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-700 transition"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                title="Ir para o topo da página"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
              >
                <FaArrowUp className="text-white text-2xl" />
                <InfoPopOver
                  show={showInfo}
                  direction="bottom"
                  className="-left-1/2 -translate-x-1/2 w-20 sm:w-32 transform"
                >
                  Voltar ao topo da página
                </InfoPopOver>
              </motion.button>
            )}

            {/* rotação automatica */}
            <motion.div
              className="absolute top-3 left-3 z-20 w-10 h-10 bg-gray-800/80 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-700 transition"
              title="Ativar/desativar rotação automática"
              onClick={() => setAutoRotate((prev) => !prev)}
            >
              {autoRotate ? <FaCircleStop className="text-white text-xl" /> : <FaRotate className="text-white text-xl" />}
              <InfoPopOver show={showInfo} direction="right">
                {autoRotate ? 'Desativar rotação automática' : 'Ativar rotação automática'}
              </InfoPopOver>
            </motion.div>

            {/* mockup anterior */}
            <motion.div
              className="z-20 absolute left-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 bg-gray-800/70 rounded-full cursor-pointer hover:bg-gray-700 transition"
              onClick={() => setModels(models === 'blister' ? 'caneca' : 'blister')}
              aria-label="Anterior"
            >
              <FaArrowLeft className="text-white text-2xl select-none" />
              <InfoPopOver show={showInfo} direction="right">
                Mockup anterior
              </InfoPopOver>
            </motion.div>

            {/* próximo mockup */}
            <motion.div
              className="z-20 absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 bg-gray-800/70 rounded-full cursor-pointer hover:bg-gray-700 transition"
              onClick={() => setModels(models === 'blister' ? 'caneca' : 'blister')}
              aria-label="Próximo"
            >
              <FaArrowRight className="text-white text-2xl select-none" />
              <InfoPopOver show={showInfo} direction="left">
                Próximo mockup
              </InfoPopOver>

            </motion.div>

            {/* cena 3D */}
            <Scene modelo={models}
              arte={arteUrl}
              bgColor={bgScene}
              bgPresetMode={bgPresetMode}
              bgPreset={bgPreset}
              autoRotate={autoRotate}
              rotateSpeed={rotateSpeed}
              isLoading={showLoading}
            />

            {/* manipulação da arte do mockup */}
            <div
              className='absolute bottom-2 flex flex-row items-center justify-center gap-2'
            >
              <motion.div
                onClick={handleNewMockup}
                className={`p-1.5 min-w-10 min-h-10 bg-gray-800 rounded-full cursor-pointer hover:bg-gray-700 transition-all flex flex-col justify-center items-center overflow-hidden`}
                animate={{
                  height: showInfo ? 50 : 30,
                  width: showInfo ? (showInfo && window.innerWidth < 640 ? 80 : 160) : 40,
                  minWidth: showInfo ? (window.innerWidth < 640 ? 80 : 160) : 40,
                  transition: { ease: 'easeInOut', duration: 0.2 }
                }}
              >
                <AnimatePresence>
                  {showInfo && (
                    <motion.span
                      initial={{ opacity: 0, y: -30, scaleX: 0, transition: { delay: 0.3 } }}
                      animate={{ opacity: 1, y: 0, scaleX: 1 }}
                      exit={{ opacity: 0, y: -30, scaleX: 0, transition: { duration: 0.2 } }}
                      transition={{ duration: 0.5, ease: 'easeInOut' }}
                      className='text-xs text-white p-1 text-center text-wrap'>
                      Trocar arte
                    </motion.span>
                  )}
                </AnimatePresence>

                {!showInfo && (
                  <FaFileCirclePlus color='#fff' size={'1.2rem'} className='relative' />
                )}

              </motion.div>

              <motion.div
                animate={{
                  height: showInfo ? 50 : 30,
                  width: showInfo ? (showInfo && window.innerWidth < 640 ? 80 : 160) : 40,
                  minWidth: showInfo ? (window.innerWidth < 640 ? 80 : 160) : 40,
                  transition: { ease: 'easeInOut', duration: 0.2 }
                }}
                onClick={() => { setSelectedFile(undefined) }}
                className={`p-1.5 min-w-10 min-h-10 bg-gray-800 rounded-full cursor-pointer hover:bg-gray-700 transition-all flex flex-col justify-center items-center`}
                transition={{ duration: 0.8 }}
              >
                {showInfo && (
                  <motion.span
                    initial={{ opacity: 0, y: -30, scaleX: 0, transition: { delay: 0.3 } }}
                    animate={{ opacity: 1, y: 0, scaleX: 1 }}
                    exit={{ opacity: 0, y: -30, scaleX: 0, transition: { duration: 0.2 } }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                    className='text-xs text-white p-1 text-center text-wrap'>
                    Redefinir
                  </motion.span>
                )}

                {!showInfo && (
                  <FaArrowsRotate color='#fff' />
                )}

              </motion.div>

              <motion.div
                animate={{
                  height: showInfo ? 50 : 30,
                  width: showInfo ? (showInfo && window.innerWidth < 640 ? 80 : 160) : 40,
                  minWidth: showInfo ? (window.innerWidth < 640 ? 80 : 160) : 40,
                  transition: { ease: 'easeInOut', duration: 0.2 }
                }}
                onClick={handleExport}
                className={`p-1.5 min-w-10 min-h-10 bg-gray-800 rounded-full cursor-pointer hover:bg-gray-700 transition-all flex flex-col justify-center items-center`}
                transition={{ duration: 0.8 }}
              >
                {showInfo && (
                  <motion.span
                    initial={{ opacity: 0, y: -30, scaleX: 0, transition: { delay: 0.3 } }}
                    animate={{ opacity: 1, y: 0, scaleX: 1 }}
                    exit={{ opacity: 0, y: -30, scaleX: 0, transition: { duration: 0.2 } }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                    className='text-xs text-white p-1 text-center text-wrap'>
                    Exportar
                  </motion.span>
                )}
                {!showInfo && (
                  <FaDownload color='#fff' />
                )}
              </motion.div>

            </div>
          </div>
        </section>
      </main>
      <AnimatePresence>
        {preferencesView && (
          <Preferencias
            handleClose={() => setPreferencesView(false)}
            handleChangeColor={(color: string) => { setBgScene(color) }}
            handleChangePresetMode={(presetMode) => { setBgPresetMode(presetMode) }}
            handleChangePreset={(preset) => { setBgPreset(preset) }}
            handleChangeAutoRotate={(rotate) => { setAutoRotate(rotate) }}
            handleChangeRotateSpeed={(speed) => { setRotateSpeed(speed) }}
            currentColor={bgScene ? bgScene : "#ffffff"}
            currentBgMode={bgPresetMode}
            currentPreset={bgPreset}
            currentSpeed={rotateSpeed}
            currentRotate={autoRotate}
          />
        )}
      </AnimatePresence>

      {/* scroll para o fim da página */}
      <AnimatePresence>
        {showScrollDown && (
          <motion.button
            className="fixed right-6 bottom-6 z-50 w-12 h-12 bg-gray-800/90 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-700 transition"
            onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
            title="Ir para o final da página"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
          >
            <FaArrowDown className="text-white text-2xl" />
          </motion.button>
        )}

      </AnimatePresence>

      {/* alerta */}
      <AnimatePresence>
        {showAlert[0] && (
          <Alert
            message={showAlert[1]}
          />
        )}
      </AnimatePresence>

    </div>
  )
}

export default App
