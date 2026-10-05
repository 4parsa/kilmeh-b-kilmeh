const API_URL = "https://api.anjoo.org";

let words = [];

let lesson = JSON.parse(localStorage.getItem("lessonDraft")) || null;

function getToken() {
  let token = localStorage.getItem("apiToken");
  if (!token) {
    token = prompt("Enter your Kilmeh password");
    if (token) localStorage.setItem("apiToken", token);
  }
  return token;
}

async function apiRequest(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getToken()}`
    }
  });

  if (res.status === 401) {
    localStorage.removeItem("apiToken");
    alert("Wrong password, try again.");
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    alert("Something went wrong saving that.");
    throw new Error(`Request failed: ${res.status}`);
  }

  return res;
}

async function loadWords() {
  const res = await fetch(`${API_URL}/words`);
  words = await res.json();
}

async function apiAddWord(word) {
  await apiRequest("/words", { method: "POST", body: JSON.stringify(word) });
}

async function apiUpdateWord(word) {
  await apiRequest(`/words/${word.id}`, { method: "PUT", body: JSON.stringify(word) });
}

async function apiDeleteWord(id) {
  await apiRequest(`/words/${id}`, { method: "DELETE" });
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