import "./style.css";
import { createStore } from "./storage.js";

const store = createStore();
const app = document.querySelector("#app");

app.innerHTML = `
  <main class="notes-app">
    <header class="page-header">
      <h1>Catatan</h1>
      <button class="primary-button" id="add-note" type="button">Tambah catatan</button>
    </header>
    <section id="notes-view" aria-label="Daftar catatan">
      <div class="search-field">
        <label for="search-input">Cari</label>
        <input id="search-input" type="search" autocomplete="off">
      </div>
      <div id="notes-list" class="notes-list"></div>
      <p id="empty-state" class="empty-state">Belum ada catatan. Tambahkan catatan pertamamu.</p>
    </section>
    <section id="editor-view" class="editor-view" aria-label="Editor catatan" hidden>
      <form id="note-form">
        <label for="note-title">Judul</label>
        <input id="note-title" name="title" type="text" autocomplete="off" required>
        <label for="note-body">Isi</label>
        <textarea id="note-body" name="body" rows="8" required></textarea>
        <div class="form-actions">
          <button class="primary-button" type="submit">Simpan</button>
          <button class="secondary-button" id="delete-note" type="button" hidden>Hapus</button>
          <button class="secondary-button" id="cancel-edit" type="button">Batal</button>
        </div>
      </form>
    </section>
  </main>
`;

const addButton = document.querySelector("#add-note");
const notesView = document.querySelector("#notes-view");
const editorView = document.querySelector("#editor-view");
const noteForm = document.querySelector("#note-form");
const titleInput = document.querySelector("#note-title");
const bodyInput = document.querySelector("#note-body");
const deleteButton = document.querySelector("#delete-note");
const cancelButton = document.querySelector("#cancel-edit");
const notesList = document.querySelector("#notes-list");
const emptyState = document.querySelector("#empty-state");
const searchInput = document.querySelector("#search-input");

let editingId = null;

function showList() {
  editorView.hidden = true;
  notesView.hidden = false;
  addButton.hidden = false;
  editingId = null;
  renderNotes();
}

function showEditor(note = null) {
  editingId = note?.id ?? null;
  titleInput.value = note?.title ?? "";
  bodyInput.value = note?.body ?? "";
  deleteButton.hidden = !note;
  notesView.hidden = true;
  editorView.hidden = false;
  addButton.hidden = true;
  titleInput.focus();
}

function renderNotes() {
  const query = searchInput.value;
  const notes = store.search(query);
  notesList.replaceChildren();
  emptyState.hidden = notes.length > 0;
  emptyState.textContent = query.trim()
    ? "Tidak ada catatan yang cocok."
    : "Belum ada catatan. Tambahkan catatan pertamamu.";

  for (const note of notes) {
    const card = document.createElement("article");
    card.className = "note-card";

    const title = document.createElement("h2");
    title.textContent = note.title;

    const body = document.createElement("p");
    body.textContent = note.body;

    const editButton = document.createElement("button");
    editButton.className = "secondary-button";
    editButton.type = "button";
    editButton.textContent = "Edit";
    editButton.addEventListener("click", () => showEditor(note));

    card.append(title, body, editButton);
    notesList.append(card);
  }
}

addButton.addEventListener("click", () => showEditor());
cancelButton.addEventListener("click", showList);
searchInput.addEventListener("input", renderNotes);

noteForm.addEventListener("submit", (event) => {
  event.preventDefault();
  store.save({
    id: editingId ?? crypto.randomUUID(),
    title: titleInput.value.trim(),
    body: bodyInput.value.trim(),
  });
  showList();
});

deleteButton.addEventListener("click", () => {
  if (editingId !== null) {
    store.remove(editingId);
  }
  showList();
});

renderNotes();
