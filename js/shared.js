// used by the dictionary, flashcards and lessons pages

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

// builds the extra boxes (dual, plurals, conjugations...) inside a container
function renderExtraFields(container, type, forms = {}) {
  const keys = formsByType[type] || [];

  container.innerHTML = keys.map(key => `
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

// reads the extra boxes back into a forms object
function readExtraFields(container, type) {
  const forms = {};
  const keys = formsByType[type] || [];

  keys.forEach(key => {
    const arabic = container.querySelector(`[data-form="${key}"][data-part="arabic"]`).value.trim();
    const translit = container.querySelector(`[data-form="${key}"][data-part="translit"]`).value.trim();
    forms[key] = (arabic || translit) ? { arabic, translit } : null;
  });

  return forms;
}