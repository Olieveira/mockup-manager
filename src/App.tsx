import React, { useEffect, useState } from 'react'
import { Scene } from './components/Scene'
import Header from './components/Header'
import { Nav } from './components/Nav'
import { FaFileCirclePlus, FaArrowsRotate, FaArrowLeft, FaArrowRight, FaGear, FaDownload, FaRotate, FaCircleStop } from "react-icons/fa6"
import { motion, AnimatePresence } from 'framer-motion'
import { Preferencias } from './components/Preferencias'
import { PresetsType } from '@react-three/drei/helpers/environment-assets'


function App() {
  const [models, setModels] = useState<'blister' | 'caneca'>('caneca')
  const [selectedFile, setSelectedFile] = useState<File | undefined>()
  const [arteUrl, setArteUrl] = useState<string | undefined>(undefined)
  const [bgScene, setBgScene] = useState<string | undefined>(undefined)
  const [preferencesView, setPreferencesView] = useState<boolean>(false)
  const [bgPresetMode, setBgPresetMode] = useState<boolean>(false)
  const [bgPreset, setBgPreset] = useState<PresetsType>("city")
  const [autoRotate, setAutoRotate] = useState<boolean>(true)
  const [rotateSpeed, setRotateSpeed] = useState<number>(3)


  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile)
      setArteUrl(url)
      return () => {
        URL.revokeObjectURL(url)
      }
    } else {
      setArteUrl(undefined)
    }
  }, [selectedFile])

  // download da cena
  function handleNewMockup() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        setSelectedFile(file)
      }
    }
    input.click()
  }

  function handleExport() {
    // Aguarda o render do Three.js antes de capturar
    setTimeout(() => {
      const canvas = document.querySelector('.bg-gray-950 canvas') as HTMLCanvasElement | null;
      if (!canvas) {
        alert('Não foi possível encontrar a visualização para exportar.');
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
    <div className="min-h-screen min-w-screen flex flex-col bg-gradient-to-br from-gray-800 to-slate-950">
      <Header />
      <main className="flex flex-1 flex-col sm:flex-row">
        <Nav />
        <section className="flex-1 flex items-center justify-center p-2">
          <div className="relative w-full h-full bg-gray-950 rounded-lg shadow-lg flex items-center justify-center
            sm:aspect-video aspect-[16/24] sm:max-w-5xl max-w-full sm:max-h-none max-h-[80vh]">

            <motion.div
              className="absolute top-3 right-3 z-20 w-10 h-10 bg-gray-800/80 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-700 transition"
              title="Preferências do Mockup"
            >
              <FaGear
                onClick={() => { setPreferencesView(true) }}
                className="text-white text-xl" />
            </motion.div>

            <motion.div
              className="absolute top-3 left-3 z-20 w-10 h-10 bg-gray-800/80 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-700 transition"
              title="Ativar/desativar rotação automática"
              onClick={() => setAutoRotate((prev) => !prev)}
            >
              {autoRotate ? <FaCircleStop className="text-white text-xl" /> : <FaRotate className="text-white text-xl" />}


            </motion.div>

            <Scene modelo={models}
              arte={arteUrl}
              bgColor={bgScene}
              bgPresetMode={bgPresetMode}
              bgPreset={bgPreset}
              autoRotate={autoRotate}
              rotateSpeed={rotateSpeed}
            />

            <motion.div
              className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 bg-gray-800/70 rounded-full cursor-pointer hover:bg-gray-700 transition"
              onClick={() => setModels(models === 'blister' ? 'caneca' : 'blister')}
              aria-label="Anterior"
            >
              <FaArrowLeft className="text-white text-2xl select-none" />
            </motion.div>
            <motion.div
              className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 bg-gray-800/70 rounded-full cursor-pointer hover:bg-gray-700 transition"
              onClick={() => setModels(models === 'blister' ? 'caneca' : 'blister')}
              aria-label="Próximo"
            >
              <FaArrowRight className="text-white text-2xl select-none" />
            </motion.div>

            <motion.div
              className='absolute bottom-2 flex flex-row items-center justify-center gap-3'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <motion.div
                onClick={handleNewMockup}
                className='w-10 h-10 bg-gray-800 rounded-full cursor-pointer hover:bg-gray-700 transition-all flex justify-center items-center'
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.1 }}
              >
                <FaFileCirclePlus color='#fff' size={'1.2rem'} />
              </motion.div>
              <motion.div
                onClick={() => { setSelectedFile(undefined) }}
                className='w-10 h-10 bg-gray-800 rounded-full cursor-pointer hover:bg-gray-700 transition-all flex justify-center items-center'
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.1 }}
              >
                <FaArrowsRotate color='#fff' />
              </motion.div>
              <motion.div
                onClick={handleExport}
                className='w-10 h-10 bg-gray-800 rounded-full cursor-pointer hover:bg-gray-700 transition-all flex justify-center items-center'
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.1 }}
              >
                <FaDownload color='#fff' />
              </motion.div>
            </motion.div>
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
    </div>
  )
}

export default App
