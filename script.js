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
const dialog = document.getElementById("word-dialog");
const dialogTitle = document.getElementById("dialog-title");
const openAddBtn = document.getElementById("open-add");
const tabsBox = document.getElementById("tabs");
const filtersBox = document.getElementById("filters");

let editingId = null;
let currentTab = "words";
let currentFilter = "all";

const formLabels = {
  dual: "Dual",
  soundPlural: "Sound plural",
  brokenPlural: "Broken plural"
};

function getCategory(type) {
  if (type === "phrase") return "phrases";
  if (type === "sentence") return "sentences";
  return "words";
}

function renderForms(forms) {
  const rows = Object.entries(forms || {})
    .filter(([key, value]) => value)
    .map(([key, value]) => `
      <li>
        <span class="form-label">${formLabels[key] || key}</span>
        <span class="form-translit">${value.translit}</span>
        <span class="form-arabic" lang="ar" dir="rtl">${value.arabic}</span>
      </li>
    `).join("");

  return rows ? `<ul class="forms">${rows}</ul>` : "";
}

function renderWords() {
  const query = searchInput.value.trim().toLowerCase();
  let shown;

  if (query) {
    shown = words.filter(word =>
      word.english.toLowerCase().includes(query) ||
      word.arabic.includes(query) ||
      word.translit.toLowerCase().includes(query)
    );
  } else {
    shown = words.filter(word => getCategory(word.type) === currentTab);

    if (currentTab === "words" && currentFilter !== "all") {
      shown = shown.filter(word =>
        currentFilter === "other"
          ? !["noun", "verb", "adjective"].includes(word.type)
          : word.type === currentFilter
      );
    }
  }

  tabsBox.hidden = query !== "";
  filtersBox.hidden = query !== "" || currentTab !== "words";

  if (shown.length === 0) {
    list.innerHTML = query
      ? "<p>No results.</p>"
      : `<p>No ${currentTab} yet.</p>`;
    return;
  }

  list.innerHTML = shown.map(word => `
    <div class="word-card">
      <div class="word-top">
        <div>
          <h2>${word.english}</h2>
          <p class="translit">${word.translit}</p>
        </div>
        <p class="arabic" lang="ar" dir="rtl">${word.arabic}</p>
      </div>
      ${renderForms(word.forms)}
      <p class="type">${word.type}</p>
      <div class="card-actions">
        <button class="edit-btn" data-id="${word.id}">Edit</button>
        <button class="delete-btn" data-id="${word.id}">Delete</button>
      </div>
    </div>
  `).join("");
}

function saveWords() {
  localStorage.setItem("words", JSON.stringify(words));
}

function openAdd() {
  editingId = null;
  form.reset();
  dialogTitle.textContent = "Add word";
  submitBtn.textContent = "Add word";
  dialog.showModal();
}

function openEdit(id) {
  const word = words.find(word => word.id === id);
  document.getElementById("english").value = word.english;
  document.getElementById("arabic").value = word.arabic;
  document.getElementById("translit").value = word.translit;
  document.getElementById("type").value = word.type;

  editingId = id;
  dialogTitle.textContent = "Edit word";
  submitBtn.textContent = "Save changes";
  dialog.showModal();
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
  dialog.close();
});

list.addEventListener("click", (event) => {
  const id = event.target.dataset.id;

  if (event.target.classList.contains("delete-btn")) {
    if (!confirm("Delete this word?")) return;
    words = words.filter(word => word.id !== id);
    saveWords();
    renderWords();
  }

  if (event.target.classList.contains("edit-btn")) {
    openEdit(id);
  }
});

tabsBox.addEventListener("click", (event) => {
  const tab = event.target.dataset.tab;
  if (!tab) return;

  currentTab = tab;
  document.querySelectorAll(".tab").forEach(btn =>
    btn.classList.toggle("active", btn.dataset.tab === tab)
  );
  renderWords();
});

filtersBox.addEventListener("click", (event) => {
  const filter = event.target.dataset.filter;
  if (!filter) return;

  currentFilter = filter;
  document.querySelectorAll(".filter").forEach(btn =>
    btn.classList.toggle("active", btn.dataset.filter === filter)
  );
  renderWords();
});

openAddBtn.addEventListener("click", openAdd);
cancelBtn.addEventListener("click", () => dialog.close());
searchInput.addEventListener("input", renderWords);

renderWords();