import React, { useState } from 'react'
import { Scene } from './components/Scene'

function App() {
  const [models, setModels] = useState<'blister' | 'caneca'>('blister')

  return (
    <div className="min-h-screen min-w-screen flex flex-col bg-gradient-to-br from-gray-800 to-slate-950">

      <header className="h-20 flex items-center justify-center bg-gradient-to-b shadow-lg shadow-slate-500/20 from-gray-900/70 to-gray-950/80">
        <h1 className="text-white text-2xl font-bold tracking-wide">Criador de Mockups</h1>
      </header>

      <main className="flex flex-1 flex-col sm:flex-row">
        <nav className="w-full sm:w-44 min-w-20 bg-gray-900 flex flex-col items-center py-8 border-r border-gray-800 shadow-lg">
          <span className="text-white text-base font-semibold mb-6 tracking-wide">Acessos</span>
          <hr className="w-3/4 border-gray-700 mb-6" />
          <ul className="flex sm:flex-col flex-row gap-2 w-full px-4">
            <li>
              <a
                href="/"
                className="block py-2 px-3 rounded-md text-gray-200 hover:bg-gray-800 hover:text-white transition font-medium"
              >
                Modelos
              </a>
            </li>
            <li>
              <div className="flex flex-col gap-1 w-full">
                <span className="text-gray-400 text-xs self-center uppercase tracking-wider px-3 mt-4 mb-2">Mockup's</span>
                <a
                  href="/"
                  className="block py-2 px-3 rounded-md text-gray-200 hover:bg-gray-800 hover:text-white transition font-medium"
                >
                  Novo Mockup
                </a>
                <a
                  href="/"
                  className="block py-2 px-3 rounded-md text-gray-200 hover:bg-gray-800 hover:text-white transition font-medium"
                >
                  Galeria
                </a>
              </div>
            </li>
          </ul>
        </nav>
        <section className="flex-1 flex items-center justify-center p-2">
            <div className="relative w-full h-full bg-gray-950 rounded-lg shadow-lg flex items-center justify-center
            sm:aspect-video aspect-[16/24] sm:max-w-5xl max-w-full sm:max-h-none max-h-[80vh]">
            <Scene modelo={models} />
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
            </div>
        </section>
      </main>
    </div>
  )
}

export default App
