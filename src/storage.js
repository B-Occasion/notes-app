const STORAGE_KEY = 'notes-app:notes'

function getStorage() {
  const storage = globalThis.localStorage

  if (!storage) {
    throw new Error('localStorage is not available')
  }

  return storage
}

function createId(notes) {
  const baseId =
    globalThis.crypto?.randomUUID?.() ??
    `note-${Date.now()}-${Math.random().toString(36).slice(2)}`
  let id = baseId
  let suffix = 1

  while (notes.some((note) => note.id === id)) {
    id = `${baseId}-${suffix}`
    suffix += 1
  }

  return id
}

export function createStore() {
  function list() {
    const storedNotes = getStorage().getItem(STORAGE_KEY)

    if (storedNotes === null) {
      return []
    }

    const notes = JSON.parse(storedNotes)

    if (!Array.isArray(notes)) {
      throw new Error('Stored notes must be an array')
    }

    return notes
  }

  function save(note) {
    if (!note || typeof note !== 'object' || Array.isArray(note)) {
      throw new TypeError('A note object is required')
    }

    const notes = list()
    const savedNote = { ...note, id: note.id ?? createId(notes) }
    const existingIndex = notes.findIndex((item) => item.id === savedNote.id)

    if (existingIndex === -1) {
      notes.push(savedNote)
    } else {
      notes[existingIndex] = savedNote
    }

    getStorage().setItem(STORAGE_KEY, JSON.stringify(notes))
    return savedNote
  }

  function remove(id) {
    const notes = list()
    const remainingNotes = notes.filter((note) => note.id !== id)

    if (remainingNotes.length === notes.length) {
      return false
    }

    getStorage().setItem(STORAGE_KEY, JSON.stringify(remainingNotes))
    return true
  }

  function search(query) {
    const normalizedQuery = String(query ?? '').trim().toLowerCase()

    if (!normalizedQuery) {
      return list()
    }

    return list().filter((note) =>
      [note.title, note.content].some(
        (value) =>
          typeof value === 'string' &&
          value.toLowerCase().includes(normalizedQuery),
      ),
    )
  }

  return { list, save, remove, search }
}
