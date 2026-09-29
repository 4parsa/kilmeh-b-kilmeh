   let words = JSON.parse(localStorage.getItem("words")) || [];

let lesson = JSON.parse(localStorage.getItem("lessonDraft")) || null;

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