import type { Material, Mesh, MeshStandardMaterial, Object3D, Texture } from 'three'

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

/**
 * Compõe a arte sobre o suporte branco: o que é transparente no PNG sai
 * branco, como na impressão, e o mesmo vale para o que fica fora da arte (UV
 * fora de 0 a 1, quando ela ocupa só uma parte da malha). A arte é a própria
 * superfície do modelo, então deixá-la transparente mostraria o miolo dele.
 */
export function printOnWhite(material: MeshStandardMaterial) {
  material.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <map_fragment>',
      [
        '#include <map_fragment>',
        '\tvec2 printInside = step(vec2(0.0), vMapUv) * step(vMapUv, vec2(1.0));',
        '\tfloat printCoverage = diffuseColor.a * printInside.x * printInside.y;',
        '\tdiffuseColor = vec4(mix(vec3(1.0), diffuseColor.rgb, printCoverage), 1.0);',
      ].join('\n'),
    )
  }
  material.customProgramCacheKey = () => 'print-on-white'
}

/** Nome da malha que recebe a arte nos modelos gerados por scripts/models. */
export const PRINT_PART = 'Arte'

/** Cópia de um modelo gerado por script com a arte impressa sobre branco na malha da arte. */
export function buildPrintModel(scene: Object3D, artwork: Texture): BuiltModel {
  const object = scene.clone(true)
  const materials: BuiltModel['materials'] = []

  forEachMesh(object, PRINT_PART, (mesh) => {
    const material = (mesh.material as MeshStandardMaterial).clone()
    material.map = artwork
    printOnWhite(material)
    mesh.material = material
    materials.push(material)
  })

  return { object, materials }
}
