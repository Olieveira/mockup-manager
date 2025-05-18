import { Scene } from './components/Scene'

function App() {
  return (
    <div className="w-screen h-screen bg-red-800">
      <div className='flex h-24 justify-center items-center bg-black'>
        <h1 className='text-white font-bold'>Teste tailwind</h1>
      </div>
      <Scene />
    </div>
  )
}

export default App
