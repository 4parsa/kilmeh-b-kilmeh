let words = JSON.parse(localStorage.getItem("words")) || [
  {
    id: "w_1",
    type: "noun",
    english: "book",
    arabic: "كتاب",
    translit: "ktaab",
    forms: {
      dual:         { arabic: "كتابين", translit: "ktaabein" },
      soundPlural:  null,
      brokenPlural: { arabic: "كتب",   translit: "kitob" }
    },
    notes: "",
    tags: ["school", "objects"],
    createdAt: "2026-09-25T19:35:00Z"
  },
  {
    id: "w_2",
    type: "noun",
    english: "house",
    arabic: "بيت",
    translit: "beit",
    forms: {
      dual:         { arabic: "بيتين", translit: "beitein" },
      soundPlural:  null,
      brokenPlural: { arabic: "بيوت", translit: "byoot" }
    },
    notes: "",
    tags: ["home", "places"],
    createdAt: "2026-09-25T19:36:00Z"
  },
  {
    id: "w_3",
    type: "noun",
    english: "girl / daughter",
    arabic: "بنت",
    translit: "bint",
    forms: {
      dual:         { arabic: "بنتين", translit: "bintein" },
      soundPlural:  { arabic: "بنات", translit: "banaat" },
      brokenPlural: null
    },
    notes: "",
    tags: ["people", "family"],
    createdAt: "2026-09-25T19:37:00Z"
  }
];

const list = document.getElementById("word-list");
const form = document.getElementById("add-form");
const searchInput = document.getElementById("search");
const submitBtn = document.getElementById("submit-btn");
const cancelBtn = document.getElementById("cancel-edit");

let editingId = null;

function renderWords() {
  const query = searchInput.value.trim().toLowerCase();

  const shown = words.filter(word =>
    word.english.toLowerCase().includes(query) ||
    word.arabic.includes(query) ||
    word.translit.toLowerCase().includes(query)
  );

  if (shown.length === 0) {
    list.innerHTML = "<p>No words found.</p>";
    return;
  }

  list.innerHTML = shown.map(word => `
    <div class="word-card">
      <h2>${word.english}</h2>
      <p lang="ar" dir="rtl">${word.arabic}</p>
      <p>${word.translit}</p>
      <button class="edit-btn" data-id="${word.id}">Edit</button>
      <button class="delete-btn" data-id="${word.id}">Delete</button>
    </div>
  `).join("");
}

function saveWords() {
  localStorage.setItem("words", JSON.stringify(words));
}

function stopEditing() {
  editingId = null;
  form.reset();
  submitBtn.textContent = "Add word";
  cancelBtn.hidden = true;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = {
    type: document.getElementById("type").value,
    english: document.getElementById("english").value,
    arabic: document.getElementById("arabic").value,
    translit: document.getElementById("translit").value
  };

  if (editingId) {
    words = words.map(word =>
      word.id === editingId ? { ...word, ...formData } : word
    );
  } else {
    words.unshift({
      id: "w_" + Date.now(),
      ...formData,
      forms: {},
      notes: "",
      tags: [],
      createdAt: new Date().toISOString()
    });
  }

  saveWords();
  renderWords();
  stopEditing();
});

list.addEventListener("click", (event) => {
  const id = event.target.dataset.id;

  if (event.target.classList.contains("delete-btn")) {
    if (!confirm("Delete this word?")) return;
    words = words.filter(word => word.id !== id);
    if (editingId === id) stopEditing();
    saveWords();
    renderWords();
  }

  if (event.target.classList.contains("edit-btn")) {
    const word = words.find(word => word.id === id);
    document.getElementById("english").value = word.english;
    document.getElementById("arabic").value = word.arabic;
    document.getElementById("translit").value = word.translit;
    document.getElementById("type").value = word.type;

    editingId = id;
    submitBtn.textContent = "Save changes";
    cancelBtn.hidden = false;
    form.scrollIntoView({ behavior: "smooth" });
  }
});

cancelBtn.addEventListener("click", stopEditing);
searchInput.addEventListener("input", renderWords);

renderWords();