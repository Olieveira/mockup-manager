import React, { useEffect, useState } from 'react'
import { Scene } from './components/Scene'
import Header from './components/Header'
import { Nav } from './components/Nav'
import { FaFileCirclePlus, FaArrowsRotate } from "react-icons/fa6"

function App() {
  const [models, setModels] = useState<'blister' | 'caneca'>('caneca')
  const [selectedFile, setSelectedFile] = useState<File | undefined>()
  const [arteUrl, setArteUrl] = useState<string | undefined>(undefined)

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

            <Scene modelo={models} arte={arteUrl} />
            <div
              className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 bg-gray-800/70 rounded-full cursor-pointer hover:bg-gray-700 transition"
              onClick={() => setModels(models === 'blister' ? 'caneca' : 'blister')}
              aria-label="Anterior"
            >
              <span className="text-white text-2xl select-none">&#8592;</span>
            </div>
            <div
              className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 bg-gray-800/70 rounded-full cursor-pointer hover:bg-gray-700 transition"
              onClick={() => setModels(models === 'blister' ? 'caneca' : 'blister')}
              aria-label="Próximo"
            >
              <span className="text-white text-2xl select-none">&#8594;</span>
            </div>

            <div className='absolute bottom-2 flex flex-row items-center justify-center gap-3'>
              <div
                onClick={handleNewMockup}
                className='w-10 h-10 bg-gray-800 rounded-full cursor-pointer hover:bg-gray-700 transition-all flex justify-center items-center'>
                <FaFileCirclePlus color='#fff' size={'1.2rem'} />
              </div>
              <div
                onClick={() => { setSelectedFile(undefined) }}
                className='w-10 h-10 bg-gray-800 rounded-full cursor-pointer hover:bg-gray-700 transition-all flex justify-center items-center'>
                <FaArrowsRotate color='#fff' />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
