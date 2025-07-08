// --- Data Model ---
const STORAGE_KEY = 'mnta-notes-v1';
let notes = [];
let activeNoteId = null;
let searchTerm = '';
let autoSaveTimeout = null;
let lastSaveTime = null;
let errorState = null;

// --- DOM Elements ---
const sidebar = document.getElementById('sidebar');
const noteEditor = document.getElementById('note-editor');
const searchInput = document.getElementById('search-input');
const newNoteBtn = document.getElementById('new-note-btn');

// --- Utility Functions ---
function saveNotes() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    lastSaveTime = Date.now();
    errorState = null;
    renderAutoSaveIndicator();
  } catch (e) {
    errorState = 'Failed to save note';
    renderAutoSaveIndicator();
  }
}

function loadNotes() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    notes = data ? JSON.parse(data) : [];
  } catch (e) {
    notes = [];
  }
}

function getRelativeTime(ts) {
  const now = Date.now();
  const diff = Math.floor((now - ts) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff/60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)} hours ago`;
  if (diff < 172800) return 'Yesterday';
  const d = new Date(ts);
  return d.toLocaleDateString();
}

function highlight(text, term) {
  if (!term) return text;
  return text.replace(new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'), '<span class="highlight">$1</span>');
}

// --- Rendering Functions ---
function renderSidebar() {
  sidebar.innerHTML = '';
  let filtered = notes;
  if (searchTerm) {
    filtered = notes.filter(n => n.title.toLowerCase().includes(searchTerm) || n.content.toLowerCase().includes(searchTerm));
  }
  if (searchTerm && filtered.length === 0) {
    sidebar.innerHTML = `<div class="empty-state"><div>No results for<br>"${searchTerm}"<br><br>Try different<br>keywords</div></div>`;
    return;
  }
  if (notes.length === 0) {
    sidebar.innerHTML = `<div class="empty-state"><div class="emoji">📝</div>No notes yet<br><br>Click "New Note"<br>to get started</div>`;
    return;
  }
  if (searchTerm) {
    sidebar.innerHTML = `<div class="search-results-count">${filtered.length} result${filtered.length>1?'s':''} for "${searchTerm}"</div>`;
  }
  const ul = document.createElement('ul');
  ul.className = 'notes-list';
  filtered.forEach(note => {
    const li = document.createElement('li');
    li.className = 'note-item' + (note.id === activeNoteId ? ' active' : '');
    li.innerHTML = `
      <div class="note-title">${highlight(escapeHtml(note.title), searchTerm)}</div>
      <div class="note-preview">${highlight(escapeHtml(note.content.slice(0,50)), searchTerm)}</div>
      <div class="note-timestamp">${getRelativeTime(note.updated)}</div>
      <button class="delete-btn" title="Delete note">×</button>
    `;
    li.onclick = (e) => {
      if (e.target.classList.contains('delete-btn')) return;
      setActiveNote(note.id);
    };
    li.querySelector('.delete-btn').onclick = (e) => {
      e.stopPropagation();
      deleteNote(note.id);
    };
    ul.appendChild(li);
  });
  sidebar.appendChild(ul);
}

function renderEditor() {
  noteEditor.innerHTML = '';
  if (!activeNoteId) {
    noteEditor.innerHTML = `<div class="empty-state"><div class="emoji">📝</div>Select a note<br>to start editing<br><br>or create a new one</div>`;
    return;
  }
  const note = notes.find(n => n.id === activeNoteId);
  if (!note) return;
  const titleInput = document.createElement('input');
  titleInput.className = 'note-title-input';
  titleInput.type = 'text';
  titleInput.placeholder = 'Enter note title...';
  titleInput.value = note.title;
  titleInput.oninput = (e) => {
    note.title = e.target.value;
    scheduleAutoSave();
    renderSidebar();
  };
  const contentArea = document.createElement('textarea');
  contentArea.className = 'note-content-textarea';
  contentArea.placeholder = 'Write your note here...';
  contentArea.value = note.content;
  contentArea.oninput = (e) => {
    note.content = e.target.value;
    scheduleAutoSave();
    renderSidebar();
  };
  noteEditor.appendChild(titleInput);
  noteEditor.appendChild(contentArea);
  renderAutoSaveIndicator();
}

function renderAutoSaveIndicator() {
  let indicator = document.querySelector('.auto-save-indicator');
  if (!activeNoteId) {
    if (indicator) indicator.remove();
    return;
  }
  if (!indicator) {
    indicator = document.createElement('div');
    indicator.className = 'auto-save-indicator';
    noteEditor.appendChild(indicator);
  }
  if (errorState) {
    indicator.textContent = errorState;
    indicator.classList.add('error');
  } else if (lastSaveTime) {
    const ago = Math.floor((Date.now() - lastSaveTime)/1000);
    indicator.textContent = `Last saved: ${ago < 2 ? 'just now' : ago + ' seconds ago'}`;
    indicator.classList.remove('error');
  } else {
    indicator.textContent = '';
    indicator.classList.remove('error');
  }
}

// --- Note Operations ---
function setActiveNote(id) {
  activeNoteId = id;
  renderSidebar();
  renderEditor();
}

function createNote() {
  const id = 'n_' + Date.now() + '_' + Math.random().toString(36).slice(2,7);
  const now = Date.now();
  const note = { id, title: '', content: '', created: now, updated: now };
  notes.unshift(note);
  setActiveNote(id);
  saveNotes();
}

function deleteNote(id) {
  notes = notes.filter(n => n.id !== id);
  if (activeNoteId === id) activeNoteId = notes[0]?.id || null;
  saveNotes();
  renderSidebar();
  renderEditor();
}

function scheduleAutoSave() {
  if (autoSaveTimeout) clearTimeout(autoSaveTimeout);
  autoSaveTimeout = setTimeout(() => {
    const note = notes.find(n => n.id === activeNoteId);
    if (note) note.updated = Date.now();
    saveNotes();
    renderSidebar();
    renderAutoSaveIndicator();
  }, 600);
}

// --- Search ---
searchInput.oninput = (e) => {
  searchTerm = e.target.value.trim().toLowerCase();
  renderSidebar();
};

// --- New Note Button ---
newNoteBtn.onclick = () => {
  createNote();
  renderSidebar();
  renderEditor();
};

// --- Helpers ---
function escapeHtml(str) {
  return str.replace(/[&<>"']/g, function(tag) {
    const chars = {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'};
    return chars[tag] || tag;
  });
}

// --- Initialization ---
function init() {
  loadNotes();
  if (notes.length > 0) activeNoteId = notes[0].id;
  renderSidebar();
  renderEditor();
}

document.addEventListener('DOMContentLoaded', init); 