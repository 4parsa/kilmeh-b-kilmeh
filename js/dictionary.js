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
  renderExtraFields(extraFields, typeSelect.value);
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
  renderExtraFields(extraFields, word.type, word.forms);

  editingId = id;
  dialogTitle.textContent = "Edit word";
  submitBtn.textContent = "Save changes";
  dialog.showModal();
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = {
    type: typeSelect.value,
    english: document.getElementById("english").value.trim(),
    arabic: document.getElementById("arabic").value.trim(),
    translit: document.getElementById("translit").value.trim(),
    forms: readExtraFields(extraFields, typeSelect.value),
    notes: notesInput.value.trim()
  };

  if (editingId) {
    const existing = words.find(word => word.id === editingId);
    const updated = { ...existing, ...formData };
    await apiUpdateWord(updated);
    words = words.map(word => word.id === editingId ? updated : word);
  } else {
    const newWord = {
      id: "w_" + Date.now(),
      ...formData,
      tags: [],
      createdAt: new Date().toISOString()
    };
    await apiAddWord(newWord);
    words.unshift(newWord);
  }

  renderWords();
  dialog.close();
});

list.addEventListener("click", async (event) => {
  const id = event.target.dataset.id;

  if (event.target.classList.contains("delete-btn")) {
    if (!confirm("Delete this word?")) return;
    await apiDeleteWord(id);
    words = words.filter(word => word.id !== id);
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

typeSelect.addEventListener("change", () => renderExtraFields(extraFields, typeSelect.value));
openAddBtn.addEventListener("click", openAdd);
cancelBtn.addEventListener("click", () => dialog.close());
searchInput.addEventListener("input", renderWords);

// show how many items are waiting in the lesson draft
lessonLink.textContent = lesson?.items.length
  ? `Lesson Mode (${lesson.items.length})`
  : "Lesson Mode";

loadWords().then(renderWords);