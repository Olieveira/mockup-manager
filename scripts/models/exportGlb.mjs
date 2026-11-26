import { writeFile } from 'node:fs/promises'
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js'

// O GLTFExporter monta o .glb lendo um Blob com FileReader, que existe só no
// navegador. Basta a leitura como ArrayBuffer, que o Blob do Node já faz
globalThis.FileReader ??= class {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((result) => {
      this.result = result
      this.onloadend?.()
    })
  }
}

/** Exporta o objeto como .glb no caminho informado e devolve o tamanho em bytes. */
export async function exportGlb(object, path) {
  const result = await new GLTFExporter().parseAsync(object, { binary: true })
  await writeFile(path, Buffer.from(result))
  return result.byteLength
}
