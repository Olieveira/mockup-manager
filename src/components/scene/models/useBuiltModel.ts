import { useEffect, useMemo } from 'react'
import type { Object3D, Texture } from 'three'
import type { BuiltModel } from './materials'

/**
 * Monta uma cópia do modelo com a arte aplicada e descarta os materiais
 * criados quando a cópia deixa de ser usada. A cena original do GLTF fica
 * intacta, já que ela é mantida em cache e reutilizada.
 */
export function useBuiltModel(
  build: (scene: Object3D, artwork: Texture) => BuiltModel,
  scene: Object3D,
  artwork: Texture,
) {
  const model = useMemo(() => build(scene, artwork), [build, scene, artwork])

  useEffect(() => () => model.materials.forEach((material) => material.dispose()), [model])

  return model.object
}
