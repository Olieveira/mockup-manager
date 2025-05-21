import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei'
import { BlisterMockup } from './modelos/Blister'
import { CanecaMockup } from './modelos/Caneca'
import { Suspense, useRef, useEffect, useMemo } from 'react'
import { PerspectiveCamera } from 'three'

interface SceneProps {
  modelo: 'blister' | 'caneca',
  arte: string | undefined
}

export function Scene({ modelo, arte }: SceneProps) {
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

  // useEffect(() => {
  //   if (cameraRef.current) {
  //     console.log('Camera position:', cameraRef.current.position.toArray());
  //     console.log('Camera rotation:', cameraRef.current.rotation.toArray());
  //   }
  // }, [modelo]);

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
        dpr={[1, 2]}
        camera={{ position: cameraPosition, fov: 80 }}
        style={{ background: '#f0d8d8' }}
        onCreated={({ camera }) => {
          cameraRef.current = camera as PerspectiveCamera;
        }}>

        <Suspense fallback={null}>
          <Environment preset="city" />

          {renderModel(modelo)}

          <ContactShadows
            position={[0, 0, 0]}
            opacity={0.4}
            scale={10}
            blur={2.5}
            far={2.5}
          />
        </Suspense>

        <OrbitControls
          autoRotate
          target={[0, 0, 0]}
          enablePan={false}
          enableDamping
          dampingFactor={0.1}
          rotateSpeed={0.6}
          zoomSpeed={0.5}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas >
    </>
  )
}
