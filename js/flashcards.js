const setupBox = document.getElementById("fc-setup");
const playBox = document.getElementById("fc-play");
const summaryBox = document.getElementById("fc-summary");
const setSelect = document.getElementById("fc-set");
const directionBox = document.getElementById("fc-direction");
const startBtn = document.getElementById("fc-start");
const progress = document.getElementById("fc-progress");
const card = document.getElementById("fc-card");
const answerBox = document.getElementById("fc-answer");
const againBtn = document.getElementById("fc-again");
const gotBtn = document.getElementById("fc-got");
const quitBtn = document.getElementById("fc-quit");
const result = document.getElementById("fc-result");
const changeBtn = document.getElementById("fc-change");
const restartBtn = document.getElementById("fc-restart");

let direction = "en-ar";
let deck = [];
let current = null;
let flipped = false;
let total = 0;
let firstTry = 0;
let missed = new Set();

// which words go in the chosen set
function getSet(value) {
  if (value === "all") return words;
  if (value.startsWith("tag:")) {
    const tag = value.slice(4);
    return words.filter(word => (word.tags || []).includes(tag));
  }
  return words.filter(word => getCategory(word.type) === value);
}

function buildSetOptions() {
  const sets = [
    ["all", "All"],
    ["words", "Words"],
    ["phrases", "Phrases"],
    ["sentences", "Sentences"]
  ];

  const main = sets.map(([value, label]) =>
    `<option value="${value}">${label} (${getSet(value).length})</option>`
  ).join("");

  const tags = [...new Set(words.flatMap(word => word.tags || []))];
  const lessons = tags.map(tag =>
    `<option value="tag:${tag}">${tag} (${getSet("tag:" + tag).length})</option>`
  ).join("");

  setSelect.innerHTML = main + (lessons ? `<optgroup label="Lessons">${lessons}</optgroup>` : "");
}

// shuffles a copy of the list (Fisher–Yates)
function shuffle(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function showScreen(name) {
  setupBox.hidden = name !== "setup";
  playBox.hidden = name !== "play";
  summaryBox.hidden = name !== "summary";
}

function start() {
  const set = getSet(setSelect.value);
  if (set.length === 0) {
    alert("No cards in this set yet.");
    return;
  }

  deck = shuffle(set);
  total = deck.length;
  firstTry = 0;
  missed = new Set();
  showScreen("play");
  showNext();
}

function showNext() {
  if (deck.length === 0) {
    showSummary();
    return;
  }
  current = deck.shift();
  flipped = false;
  renderCard();
}

function renderCard() {
  progress.textContent = `${deck.length + 1} left`;

  const english = `<p class="fc-english">${current.english}</p>`;
  const arabic = `
    <p class="fc-arabic" lang="ar" dir="rtl">${current.arabic}</p>
    <p class="fc-translit">${current.translit}</p>
  `;

  const front = direction === "en-ar" ? english : arabic;
  const back = direction === "en-ar" ? arabic : english;

  card.innerHTML = flipped
    ? `${front}<hr>${back}${renderForms(current.forms)}`
    : `${front}<p class="fc-hint">Tap to flip</p>`;

  answerBox.hidden = !flipped;
}

function flip() {
  if (flipped) return;
  flipped = true;
  renderCard();
}

function gotIt() {
  if (!missed.has(current.id)) firstTry++;
  showNext();
}

function again() {
  missed.add(current.id);
  // put it back a few cards later so it comes round again
  deck.splice(Math.min(3, deck.length), 0, current);
  showNext();
}

function showSummary() {
  result.textContent = `${total} card${total === 1 ? "" : "s"} · ${firstTry} first try`;
  showScreen("summary");
}

directionBox.addEventListener("click", (event) => {
  const choice = event.target.dataset.direction;
  if (!choice) return;

  direction = choice;
  directionBox.querySelectorAll(".tab").forEach(btn =>
    btn.classList.toggle("active", btn.dataset.direction === choice)
  );
});

startBtn.addEventListener("click", start);
card.addEventListener("click", flip);
gotBtn.addEventListener("click", gotIt);
againBtn.addEventListener("click", again);
quitBtn.addEventListener("click", showSummary);
restartBtn.addEventListener("click", start);
changeBtn.addEventListener("click", () => showScreen("setup"));

// keyboard on PC: space/enter to flip, ← again, → got it
document.addEventListener("keydown", (event) => {
  if (playBox.hidden) return;

  if (!flipped && (event.key === " " || event.key === "Enter")) {
    event.preventDefault();
    flip();
  } else if (flipped && event.key === "ArrowLeft") {
    again();
  } else if (flipped && event.key === "ArrowRight") {
    gotIt();
  }
});

buildSetOptions();