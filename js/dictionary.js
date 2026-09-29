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
const typeSelect = document.getElementById("type");
const extraFields = document.getElementById("extra-fields");
const notesInput = document.getElementById("notes");
const lessonLink = document.getElementById("lesson-link");

let editingId = null;
let currentTab = "words";
let currentFilter = "all";

const formLabels = {
  dual: "Dual",
  soundPlural: "Sound plural",
  brokenPlural: "Broken plural",
  past: "Past (huwwe)",
  present: "Present (huwwe)",
  command: "Command (inta)",
  feminine: "Feminine",
  plural: "Plural"
};

const formsByType = {
  noun: ["dual", "soundPlural", "brokenPlural"],
  verb: ["past", "present", "command"],
  adjective: ["feminine", "plural"]
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

function renderExtraFields(type, forms = {}) {
  const keys = formsByType[type] || [];

  extraFields.innerHTML = keys.map(key => `
    <fieldset class="extra-field">
      <legend>${formLabels[key]}</legend>
      <div class="pair">
        <input data-form="${key}" data-part="arabic" placeholder="Arabic"
               lang="ar" dir="rtl" value="${forms[key]?.arabic || ""}">
        <input data-form="${key}" data-part="translit" placeholder="Transliteration"
               value="${forms[key]?.translit || ""}">
      </div>
    </fieldset>
  `).join("");
}

function readExtraFields() {
  const forms = {};
  const keys = formsByType[typeSelect.value] || [];

  keys.forEach(key => {
    const arabic = extraFields.querySelector(`[data-form="${key}"][data-part="arabic"]`).value.trim();
    const translit = extraFields.querySelector(`[data-form="${key}"][data-part="translit"]`).value.trim();
    forms[key] = (arabic || translit) ? { arabic, translit } : null;
  });

  return forms;
}

function renderWords() {
  const query = searchInput.value.trim().toLowerCase();
  let shown;

  if (query) {
    shown = words.filter(word =>
      word.english.toLowerCase().includes(query) ||
      word.arabic.includes(query) ||
      word.translit.toLowerCase().includes(query) ||
      (word.tags || []).some(tag => tag.toLowerCase().includes(query))
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
      ${word.notes ? `<p class="notes">${word.notes}</p>` : ""}
      <p class="type">${word.type}</p>
      ${word.tags?.length ? `<p class="tags">${word.tags.join(" · ")}</p>` : ""}
      <div class="card-actions">
        <button class="edit-btn" data-id="${word.id}">Edit</button>
        <button class="delete-btn" data-id="${word.id}">Delete</button>
      </div>
    </div>
  `).join("");
}

function openAdd() {
  editingId = null;
  form.reset();
  renderExtraFields(typeSelect.value);
  dialogTitle.textContent = "Add word";
  submitBtn.textContent = "Add word";
  dialog.showModal();
}

function openEdit(id) {
  const word = words.find(word => word.id === id);
  document.getElementById("english").value = word.english;
  document.getElementById("arabic").value = word.arabic;
  document.getElementById("translit").value = word.translit;
  typeSelect.value = word.type;
  notesInput.value = word.notes || "";
  renderExtraFields(word.type, word.forms);

  editingId = id;
  dialogTitle.textContent = "Edit word";
  submitBtn.textContent = "Save changes";
  dialog.showModal();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = {
    type: typeSelect.value,
    english: document.getElementById("english").value.trim(),
    arabic: document.getElementById("arabic").value.trim(),
    translit: document.getElementById("translit").value.trim(),
    forms: readExtraFields(),
    notes: notesInput.value.trim()
  };

  if (editingId) {
    words = words.map(word =>
      word.id === editingId ? { ...word, ...formData } : word
    );
  } else {
    words.unshift({
      id: "w_" + Date.now(),
      ...formData,
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

typeSelect.addEventListener("change", () => renderExtraFields(typeSelect.value));
openAddBtn.addEventListener("click", openAdd);
cancelBtn.addEventListener("click", () => dialog.close());
searchInput.addEventListener("input", renderWords);

// show how many items are waiting in the lesson draft
lessonLink.textContent = lesson?.items.length
  ? `Lesson Mode (${lesson.items.length})`
  : "Lesson Mode";

renderWords();