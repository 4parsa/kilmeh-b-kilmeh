const word = {
  id: "w_1727280000000",
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
};

const list = document.getElementById("word-list");

list.innerHTML = `
  <div class="word-card">
    <h2>${word.english}</h2>
    <p lang="ar" dir="rtl">${word.arabic}</p>
    <p>${word.translit}</p>
  </div>
`;