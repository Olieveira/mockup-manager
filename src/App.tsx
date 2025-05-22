import React, { useEffect, useState } from 'react'
import { Scene } from './components/Scene'
import Header from './components/Header'
import { Nav } from './components/Nav'
import { FaFileCirclePlus, FaArrowsRotate, FaArrowLeft, FaArrowRight, FaGear } from "react-icons/fa6"
import { motion, AnimatePresence } from 'framer-motion'


function App() {
  const [models, setModels] = useState<'blister' | 'caneca'>('caneca')
  const [selectedFile, setSelectedFile] = useState<File | undefined>()
  const [arteUrl, setArteUrl] = useState<string | undefined>(undefined)
  const [preferencesView, setPreferencesView] = useState<boolean>(false)

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

            <Scene modelo={models} arte={arteUrl} />

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
            </motion.div>
          </div>
        </section>
      </main>
      <AnimatePresence>
        {preferencesView && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gray-900 rounded-xl shadow-2xl p-8 w-full max-w-md flex flex-col gap-6 relative"
              initial={{ scale: 0.8, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 40 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-white text-xl"
                onClick={() => setPreferencesView(false)}
                aria-label="Fechar"
              >
                ×
              </button>
              <h2 className="text-2xl font-bold text-white mb-2">Preferências do Mockup</h2>
              <div className="flex flex-col gap-4">
                <label className="flex flex-col gap-1 text-gray-200">
                  Cor de fundo
                  <input type="color" className="w-12 h-8 rounded border-none bg-transparent" />
                </label>
              </div>
              <label className="flex flex-col gap-1 text-gray-200">
                Intensidade da Luz
                <input
                  type="range"
                  min={0}
                  max={2}
                  step={0.01}
                  defaultValue={1}
                  className="w-full accent-blue-600"
                  aria-label="Intensidade da Luz"
                />
              </label>

              <hr className="my-6 border-gray-700" />

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Cenários de Fundo</h3>
                <div className="grid grid-cols-2 gap-4">
                  
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-12 rounded-lg bg-gradient-to-br from-blue-400 to-blue-900 border-2 border-blue-500 mb-1 flex items-center justify-center text-xs text-white font-bold">Cidade</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-12 rounded-lg bg-gradient-to-br from-green-300 to-green-700 border-2 border-green-500 mb-1 flex items-center justify-center text-xs text-white font-bold">Natureza</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-12 rounded-lg bg-gradient-to-br from-gray-400 to-gray-800 border-2 border-gray-500 mb-1 flex items-center justify-center text-xs text-white font-bold">Estúdio</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-12 rounded-lg bg-gradient-to-br from-yellow-200 to-yellow-600 border-2 border-yellow-400 mb-1 flex items-center justify-center text-xs text-gray-900 font-bold">Minimalista</div>
                  </div>
                </div>
              </div>
              <button
                className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition"
                onClick={() => setPreferencesView(false)}
              >
                Salvar Preferências
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
