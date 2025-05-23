import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei'
import { BlisterMockup } from './modelos/Blister'
import { CanecaMockup } from './modelos/Caneca'
import { Suspense, useRef, useEffect, useMemo } from 'react'
import { PerspectiveCamera } from 'three'
import { BgDinamico } from './BgDinamico'
import type { PresetsType } from '@react-three/drei/helpers/environment-assets'

interface SceneProps {
  modelo: 'blister' | 'caneca',
  arte: string | undefined,
  bgColor: string | undefined,
  bgPresetMode: boolean,
  bgPreset: PresetsType,
  autoRotate: boolean,
  rotateSpeed: number
}

export function Scene({ modelo, arte, bgColor, bgPresetMode, bgPreset, autoRotate, rotateSpeed }: SceneProps) {
  const cameraRef = useRef<PerspectiveCamera | null>(null);
  const cameraPosition: [number, number, number] = useMemo(() => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 768) {
        // Telas pequenas
        return [260, 80, 20] as [number, number, number]
      }
    }
    // Telas grandes
    return [260, 80, 20] as [number, number, number]
  }, [])

  useEffect(() => {
    console.log("rotate speed alterado:\n", rotateSpeed)
  }, [rotateSpeed])

  function renderModel(modelo: 'blister' | 'caneca') {
    if (modelo === 'caneca') {
      return <CanecaMockup arte={arte} />
    }
    if (modelo === 'blister') {
      return <BlisterMockup arte={arte} />
    }
    return null
  }

  return (
    <>
      <Canvas
        shadows
        gl={{
          preserveDrawingBuffer: true,
          alpha: false // fundo opaco
        }}
        dpr={[1, 2]}
        camera={{ position: cameraPosition, fov: 50 }}
        onCreated={({ gl, camera }) => {
          gl.setClearColor(bgColor ? bgColor : '#f0d8d8')
          cameraRef.current = camera as PerspectiveCamera
        }}
        style={{ background: bgColor ? bgColor : '#f0d8d8' }}
      >

        <BgDinamico color={bgColor || '#fff'} />

        <Suspense fallback={null}>
          <Environment preset={bgPreset ? bgPreset : "city"} background={bgPresetMode} />

          <directionalLight
            position={[100, 100, 100]}
            intensity={0.2}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-bias={-0.0001}
          />
          <directionalLight
            position={[-100, 100, 100]}
            intensity={0.2}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-bias={-0.0001}
          />

          {renderModel(modelo)}

          <ContactShadows
            position={[0, 0, 0]}
            opacity={1}
            scale={10}
            blur={2.5}
            far={2.5}
          />
        </Suspense>

        <OrbitControls
          autoRotate={autoRotate}
          autoRotateSpeed={rotateSpeed}
          rotateSpeed={0.6}
          target={[0, 0, 0]}
          enablePan={false}
          enableDamping
          dampingFactor={0.1}
          zoomSpeed={0.5}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas >
    </>
  )
}
