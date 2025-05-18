import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei'
import { BlisterMockup } from './modelos/Blister'
import { ModeloMockup } from './ModeloMockup'
import { Suspense, useEffect, useState } from 'react'

export function Scene() {

  return (
    <>
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [260, 80, 20], fov: 70 }}
        style={{ background: '#f0d8d8' }}>

        <Suspense fallback={null}>
          <Environment preset="city" />
          {/* <ModeloMockup /> */}
          <BlisterMockup />
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
