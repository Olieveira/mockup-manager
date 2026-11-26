// Guarda a última arte enviada no IndexedDB, que aceita o arquivo (Blob) como
// ele é. O localStorage só guarda texto e tem uns 5MB, menos do que uma arte
// em PNG de 2048px pode ter. Tudo aqui falha em silêncio: sem armazenamento
// (modo privado, cota cheia) a arte vale só para esta visita

const DATABASE = 'mockup-viewer'
const STORE = 'artwork'
const LAST_ARTWORK_KEY = 'last'

function request<T>(operation: IDBRequest<T>) {
  return new Promise<T>((resolve, reject) => {
    operation.onsuccess = () => resolve(operation.result)
    operation.onerror = () => reject(operation.error)
  })
}

let database: Promise<IDBDatabase> | null = null

function openDatabase() {
  if (!database) {
    const opening = indexedDB.open(DATABASE, 1)
    opening.onupgradeneeded = () => opening.result.createObjectStore(STORE)
    database = request(opening)
    // Uma falha não fica guardada: a próxima chamada tenta abrir de novo
    database.catch(() => (database = null))
  }
  return database
}

async function withStore<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>) {
  const db = await openDatabase()
  return request(run(db.transaction(STORE, mode).objectStore(STORE)))
}

/** A última arte enviada, ou null se não houver ou se o armazenamento não estiver disponível. */
export async function loadStoredArtwork(): Promise<Blob | null> {
  try {
    const stored: unknown = await withStore('readonly', (store) => store.get(LAST_ARTWORK_KEY))
    return stored instanceof Blob ? stored : null
  } catch {
    return null
  }
}

export async function storeArtwork(artwork: Blob) {
  try {
    await withStore('readwrite', (store) => store.put(artwork, LAST_ARTWORK_KEY))
  } catch {
    // Sem armazenamento: a arte continua na tela até a página fechar
  }
}

export async function clearStoredArtwork() {
  try {
    await withStore('readwrite', (store) => store.delete(LAST_ARTWORK_KEY))
  } catch {
    // Nada salvo para apagar
  }
}
