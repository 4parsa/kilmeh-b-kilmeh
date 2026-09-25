const words = [
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

function renderWords() {
  list.innerHTML = words.map(word => `
    <div class="word-card">
      <h2>${word.english}</h2>
      <p lang="ar" dir="rtl">${word.arabic}</p>
      <p>${word.translit}</p>
    </div>
  `).join("");
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const newWord = {
    id: "w_" + Date.now(),
    type: document.getElementById("type").value,
    english: document.getElementById("english").value,
    arabic: document.getElementById("arabic").value,
    translit: document.getElementById("translit").value,
    forms: {},
    notes: "",
    tags: [],
    createdAt: new Date().toISOString()
  };

  words.unshift(newWord);
  renderWords();
  form.reset();
});

renderWords();