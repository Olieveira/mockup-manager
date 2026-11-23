import type { Material, Mesh, Object3D } from 'three'

/** Executa o callback em cada mesh a partir do objeto com o nome informado. */
export function forEachMesh(root: Object3D, name: string, callback: (mesh: Mesh) => void) {
  root.getObjectByName(name)?.traverse((object) => {
    if ((object as Mesh).isMesh) callback(object as Mesh)
  })
}

export interface BuiltModel {
  object: Object3D
  materials: Material[]
}
