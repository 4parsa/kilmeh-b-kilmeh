const lessonNameInput = document.getElementById("lesson-name");
const lessonForm = document.getElementById("lesson-form");
const lessonEnglish = document.getElementById("l-english");
const lessonArabic = document.getElementById("l-arabic");
const lessonTranslit = document.getElementById("l-translit");
const lessonType = document.getElementById("l-type");
const lessonExtra = document.getElementById("l-extra-fields");
const lessonMore = document.getElementById("l-more");
const lessonCount = document.getElementById("lesson-count");
const lessonList = document.getElementById("lesson-list");
const saveLessonBtn = document.getElementById("save-lesson");
const discardLessonBtn = document.getElementById("discard-lesson");

function defaultLessonName() {
  const date = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  return "Lesson – " + date;
}

function renderLesson() {
  lessonCount.textContent = `This lesson (${lesson.items.length})`;
  saveLessonBtn.disabled = lesson.items.length === 0;

  if (lesson.items.length === 0) {
    lessonList.innerHTML = "<p>Nothing added yet. Start typing above.</p>";
    return;
  }

  lessonList.innerHTML = lesson.items.map(item => `
    <div class="lesson-item">
      <div>
        <strong>${item.english}</strong>
        <span class="translit">${item.translit}</span>
        <span class="type">${item.type}</span>
      </div>
      <span class="arabic" lang="ar" dir="rtl">${item.arabic}</span>
      ${renderForms(item.forms)}
      <div class="card-actions">
        <button class="lesson-edit-btn" data-id="${item.id}">Edit</button>
        <button class="lesson-remove-btn delete-btn" data-id="${item.id}">Remove</button>
      </div>
    </div>
  `).join("");
}

lessonNameInput.addEventListener("input", () => {
  lesson.name = lessonNameInput.value;
  saveLesson();
});

// swap the extra boxes when the type changes
lessonType.addEventListener("change", () => {
  renderExtraFields(lessonExtra, lessonType.value);
});

lessonForm.addEventListener("submit", (event) => {
  event.preventDefault();

  lesson.items.unshift({
    id: "w_" + Date.now(),
    type: lessonType.value,
    english: lessonEnglish.value.trim(),
    arabic: lessonArabic.value.trim(),
    translit: lessonTranslit.value.trim(),
    forms: readExtraFields(lessonExtra, lessonType.value)
  });

  saveLesson();
  renderLesson();

  const keepType = lessonType.value;
  lessonForm.reset();
  lessonType.value = keepType;
  renderExtraFields(lessonExtra, keepType);
  lessonEnglish.focus();
});

lessonList.addEventListener("click", (event) => {
  const id = event.target.dataset.id;
  if (!id) return;

  const isEdit = event.target.classList.contains("lesson-edit-btn");
  const isRemove = event.target.classList.contains("lesson-remove-btn");
  if (!isEdit && !isRemove) return;

  if (isEdit) {
    const item = lesson.items.find(item => item.id === id);
    lessonEnglish.value = item.english;
    lessonArabic.value = item.arabic;
    lessonTranslit.value = item.translit;
    lessonType.value = item.type;
    renderExtraFields(lessonExtra, item.type, item.forms);

    // open "More forms" if the item has any filled in
    lessonMore.open = Object.values(item.forms || {}).some(value => value);
    lessonEnglish.focus();
  }

  lesson.items = lesson.items.filter(item => item.id !== id);
  saveLesson();
  renderLesson();
});

saveLessonBtn.addEventListener("click", async () => {
  const count = lesson.items.length;
  if (!confirm(`Add ${count} item${count === 1 ? "" : "s"} to your dictionary?`)) return;

  const name = lesson.name.trim() || defaultLessonName();
  const now = new Date().toISOString();

  const newWords = lesson.items.map(item => ({
    ...item,
    forms: item.forms || {},
    notes: "",
    tags: [name],
    createdAt: now
  }));

  // send the whole lesson to the API in one go
  await apiAddWords(newWords);

  lesson = null;
  saveLesson();
  window.location.href = "index.html";
});

discardLessonBtn.addEventListener("click", () => {
  if (!confirm("Discard this lesson? Everything in it will be lost.")) return;

  lesson = null;
  saveLesson();
  window.location.href = "index.html";
});

// start a new lesson if there isn't one saved already
if (!lesson) {
  lesson = { name: defaultLessonName(), items: [] };
  saveLesson();
}

lessonNameInput.value = lesson.name;
renderExtraFields(lessonExtra, lessonType.value);
renderLesson();
lessonEnglish.focus();