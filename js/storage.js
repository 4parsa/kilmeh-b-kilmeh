const API_URL = "http://localhost:3000";

let words = [];

let lesson = JSON.parse(localStorage.getItem("lessonDraft")) || null;

async function loadWords() {
  const res = await fetch(`${API_URL}/words`);
  words = await res.json();
}

async function apiAddWord(word) {
  await fetch(`${API_URL}/words`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(word)
  });
}

async function apiUpdateWord(word) {
  await fetch(`${API_URL}/words/${word.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(word)
  });
}

async function apiDeleteWord(id) {
  await fetch(`${API_URL}/words/${id}`, { method: "DELETE" });
}

function saveWords() {
  localStorage.setItem("words", JSON.stringify(words));
}

function saveLesson() {
  if (lesson) {
    localStorage.setItem("lessonDraft", JSON.stringify(lesson));
  } else {
    localStorage.removeItem("lessonDraft");
  }
}