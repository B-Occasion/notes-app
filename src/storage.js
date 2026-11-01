const STORAGE_KEY = "notes-app.notes";

export function createStore(storage = globalThis.localStorage) {
  function list() {
    const notes = storage.getItem(STORAGE_KEY);
    return notes === null ? [] : JSON.parse(notes);
  }

  function save(note) {
    const notes = list();
    const index = notes.findIndex((savedNote) => savedNote.id === note.id);

    if (index === -1) {
      notes.push(note);
    } else {
      notes[index] = note;
    }

    storage.setItem(STORAGE_KEY, JSON.stringify(notes));
    return note;
  }

  function remove(id) {
    const notes = list();
    const remainingNotes = notes.filter((note) => note.id !== id);
    storage.setItem(STORAGE_KEY, JSON.stringify(remainingNotes));
  }

  function search(query) {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return list().filter((note) =>
      `${note.title} ${note.body}`.toLocaleLowerCase().includes(normalizedQuery),
    );
  }

  return { list, save, remove, search };
}
