import { Scene } from './components/Scene'

function App() {
  return (
    <div className="w-screen h-screen overflow-hidden flex-col justify-center items-center">
      <div className='flex h-24 justify-center items-center bg-black'>
        <h1 className='text-white font-bold'>Teste tailwind</h1>
      </div>

      <div className='flex flex-row w-full bg-pink-300'>
        <div className='bg-white w-44'>
        </div>
        <div className="w-full aspect-video">
          <Scene />
        </div>
      </div>
    </div>
  )
}

export default App
