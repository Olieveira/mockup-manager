import { useState } from 'react'
import { useThree } from '@react-three/fiber'

/**
 * Giro em y para a frente do modelo (+z) entrar virada para a câmera, mais um
 * pouco para uma das laterais aparecer. Serve aos modelos com arte só na
 * frente: a câmera do celular começa do lado oposto à do desktop. É lido uma
 * vez, na montagem, para o modelo não acompanhar a câmera depois.
 */
export function useFacingCamera(sideTurn: number) {
  const camera = useThree((state) => state.camera)
  const [rotation] = useState(() => Math.atan2(camera.position.x, camera.position.z) + sideTurn)
  return rotation
}
