import { formatProgressPercent, formatRemainingTime, getEventProgress, getPeriodProgress, normalizeEventStart } from "./time.js?v=6";
import { getMealRecommendations } from "./meals.js?v=6";
import { getStorageContext } from "./local-demo.js?v=6";

const { storageKey: STORAGE_KEY, demoToken } = getStorageContext();
const PERIODS = ["today", "month", "year", "life"];
const UNITS = ["years", "months", "days", "hours", "minutes", "seconds"];
const DEFAULT_STATE = {
  profile: {
    name: "", birthday: "", expectedLifespan: 90, zodiac: "", mbti: "",
    diet: "any", cuisine: "any", dislikedIngredients: "",
  },
  events: [],
  preferences: {
    period: "today", unit: "hours", widgetPeriod: "today", widgetUnit: "hours",
    mealSeed: 0, setupComplete: false,
  },
};
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

let toastTimer;
let deferredInstallPrompt = null;
let setupMode = false;
let setupStep = 1;
let lastDay = localDateString();

function cleanString(value, max = 250) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function validDateString(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  if (year < 100) return false;
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

function localDateString(date = new Date()) {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
}

function makeId() {
  return globalThis.crypto?.randomUUID?.() || "moment-" + Date.now() + "-" + Math.random().toString(36).slice(2);
}

function sanitizedState(raw, migratedAt = new Date().toISOString()) {
  const profile = isRecord(raw?.profile) ? raw.profile : {};
  const preferences = isRecord(raw?.preferences) ? raw.preferences : {};
  const allowedDiets = ["any", "vegetarian", "vegan"];
  const allowedCuisines = ["any", "asian", "mediterranean", "american", "mexican"];
  const years = Number(profile.expectedLifespan);
  const birthday = validDateString(profile.birthday) && profile.birthday <= localDateString() ? profile.birthday : "";
  const ids = new Set();
  const events = (Array.isArray(raw?.events) ? raw.events : [])
    .filter((event) => isRecord(event) && validDateString(event.date) && cleanString(event.title, 80))
    .map((event) => {
      let id = cleanString(event.id, 80) || makeId();
      if (ids.has(id)) id = makeId();
      ids.add(id);
      return {
        id, title: cleanString(event.title, 80), date: event.date,
        note: cleanString(event.note, 280),
        createdAt: normalizeEventStart(event.createdAt) || migratedAt,
      };
    });
  const requestedPeriod = cleanString(preferences.period, 100);
  const validPeriod = PERIODS.includes(requestedPeriod)
    || (requestedPeriod.startsWith("event:") && events.some((event) => event.id === requestedPeriod.slice(6)));
  return {
    profile: {
      name: cleanString(profile.name, 40),
      birthday,
      expectedLifespan: Number.isInteger(years) && years >= 1 && years <= 130 ? years : 90,
      zodiac: cleanString(profile.zodiac, 20),
      mbti: cleanString(profile.mbti, 4).toUpperCase(),
      diet: allowedDiets.includes(profile.diet) ? profile.diet : "any",
      cuisine: allowedCuisines.includes(profile.cuisine) ? profile.cuisine : "any",
      dislikedIngredients: cleanString(profile.dislikedIngredients, 250),
    },
    events,
    preferences: {
      period: validPeriod ? requestedPeriod : "today",
      unit: UNITS.includes(preferences.unit) ? preferences.unit : "hours",
      widgetPeriod: PERIODS.includes(preferences.widgetPeriod) ? preferences.widgetPeriod : "today",
      widgetUnit: UNITS.includes(preferences.widgetUnit) ? preferences.widgetUnit : "hours",
      mealSeed: Number.isInteger(preferences.mealSeed) ? preferences.mealSeed : 0,
      // A profile saved before the setup flow is already complete.
      setupComplete: Boolean(birthday) && preferences.setupComplete !== false,
    },
  };
}

function readState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return structuredClone(DEFAULT_STATE);
    const parsed = JSON.parse(saved);
    const migratedAt = new Date().toISOString();
    const normalized = sanitizedState(parsed, migratedAt);
    const hasLegacyEvent = Array.isArray(parsed?.events) && parsed.events.some((event) =>
      isRecord(event) && validDateString(event.date) && cleanString(event.title, 80)
      && !normalizeEventStart(event.createdAt));
    if (hasLegacyEvent) {
      const migrated = {
        ...parsed,
        events: parsed.events.map((event) =>
          isRecord(event) && validDateString(event.date) && cleanString(event.title, 80)
            && !normalizeEventStart(event.createdAt) ? { ...event, createdAt: migratedAt } : event),
      };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated)); } catch { /* Keep the in-memory event. */ }
    }
    return normalized;
  } catch {
    return structuredClone(DEFAULT_STATE);
  }
}

let state = readState();

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("visible"), 3600);
}

function saveState(nextState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
    state = nextState;
    return true;
  } catch {
    showToast("This browser could not save your changes.");
    return false;
  }
}

function updateState(mutator) {
  const draft = structuredClone(state);
  mutator(draft);
  return saveState(sanitizedState(draft));
}

function zodiacFromBirthday(birthday) {
  if (!validDateString(birthday)) return "";
  const [, month, day] = birthday.split("-").map(Number);
  const marker = month * 100 + day;
  if (marker >= 321 && marker <= 419) return "Aries";
  if (marker >= 420 && marker <= 520) return "Taurus";
  if (marker >= 521 && marker <= 620) return "Gemini";
  if (marker >= 621 && marker <= 722) return "Cancer";
  if (marker >= 723 && marker <= 822) return "Leo";
  if (marker >= 823 && marker <= 922) return "Virgo";
  if (marker >= 923 && marker <= 1022) return "Libra";
  if (marker >= 1023 && marker <= 1121) return "Scorpio";
  if (marker >= 1122 && marker <= 1221) return "Sagittarius";
  if (marker >= 1222 || marker <= 119) return "Capricorn";
  if (marker <= 218) return "Aquarius";
  return "Pisces";
}

function effectiveProfile() {
  return { ...state.profile, zodiac: state.profile.zodiac || zodiacFromBirthday(state.profile.birthday) };
}

function eventForPeriod(period) {
  return period.startsWith("event:") ? state.events.find((event) => event.id === period.slice(6)) : null;
}

function renderPeriodOptions() {
  const select = $("#period-select");
  select.querySelector('optgroup[data-events]')?.remove();
  if (state.events.length) {
    const group = document.createElement("optgroup");
    group.label = "Important events";
    group.dataset.events = "";
    for (const event of [...state.events].sort((a, b) => a.date.localeCompare(b.date))) {
      const option = document.createElement("option");
      option.value = "event:" + event.id;
      option.textContent = event.title;
      option.title = "Progress from when tracking began to the start of " + event.date + ".";
      group.append(option);
    }
    select.append(group);
  }
  select.value = state.preferences.period;
  if (!select.value) select.value = "today";
  const selectedEvent = eventForPeriod(select.value);
  select.title = selectedEvent
    ? "Progress from when tracking began to the start of " + selectedEvent.date + "."
    : "";
  select.setAttribute("aria-label", selectedEvent
    ? "Time period: " + selectedEvent.title + ". Progress from when tracking began to the start of the event date."
    : "Time period");
}

function renderProgress(now = new Date()) {
  const period = state.preferences.period;
  const unit = state.preferences.unit;
  const event = eventForPeriod(period);
  const progress = event
    ? getEventProgress(event.date, now, event.createdAt)
    : getPeriodProgress(period, now, state.profile);
  $("#unit-select").value = unit;
  if (!progress) {
    $("#hero-percent").textContent = "—";
    $("#hero-remaining").textContent = "—";
    $("#hero-remaining-unit").textContent = unit;
    $("#hero-progress-fill").style.width = "0%";
    $("#hero-progress-track").setAttribute("aria-valuenow", "0");
    $("#hero-progress-track").setAttribute("aria-valuetext", "Add your birthday to view progress.");
    return;
  }
  const percent = Math.max(0, Math.min(100, progress.percent));
  const remaining = formatRemainingTime(progress.remainingMs, unit);
  const percentText = formatProgressPercent(percent);
  $("#hero-percent").textContent = percentText;
  $("#hero-remaining").textContent = remaining.number;
  $("#hero-remaining-unit").textContent = remaining.label;
  $("#hero-progress-fill").style.width = percent + "%";
  $("#hero-progress-track").setAttribute("aria-valuenow", String(percent));
  if (event && progress.totalMs === 0) {
    $("#hero-progress-track").setAttribute("aria-valuetext",
      "The event date is on or before tracking began; this countdown has ended.");
    return;
  }
  const basis = event
    ? " from when tracking began for " + event.title + " to the start of " + event.date
    : period === "life" ? " through your estimated lifespan" : " of this " + (period === "today" ? "day" : period);
  $("#hero-progress-track").setAttribute("aria-valuetext", percentText + " elapsed" + basis
    + "; " + remaining.number + " " + remaining.label + " remaining.");
}

function renderMeals(now = new Date()) {
  const daySeed = Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86_400_000);
  const ideas = getMealRecommendations(effectiveProfile(), daySeed + state.preferences.mealSeed);
  for (const type of ["breakfast", "lunch", "dinner"]) {
    $("#" + "meal-" + type).textContent = ideas[type]?.name || "No matching idea";
  }
}

function renderMoments() {
  const list = $("#moment-list");
  list.replaceChildren();
  if (!state.events.length) {
    const empty = document.createElement("p");
    empty.className = "moment-empty";
    empty.textContent = "No events yet.";
    list.append(empty);
    return;
  }
  for (const event of [...state.events].sort((a, b) => a.date.localeCompare(b.date))) {
    const row = document.createElement("div");
    row.className = "moment-row";
    const datebox = document.createElement("div");
    datebox.className = "moment-datebox";
    const dateParts = event.date.split("-").map(Number);
    const day = document.createElement("strong");
    day.textContent = String(dateParts[2]);
    const month = document.createElement("span");
    month.textContent = new Intl.DateTimeFormat("en-US", { month: "short" })
      .format(new Date(event.date + "T12:00:00")).toUpperCase();
    datebox.append(day, month);
    const content = document.createElement("div");
    content.className = "moment-main";
    const title = document.createElement("strong");
    title.textContent = event.title;
    const note = document.createElement("p");
    note.textContent = event.note || event.date;
    content.append(title, note);
    const actions = document.createElement("div");
    actions.className = "moment-actions";
    const year = document.createElement("span");
    year.className = "moment-year";
    year.textContent = String(dateParts[0]);
    const edit = document.createElement("button");
    edit.type = "button";
    edit.textContent = "Edit";
    edit.setAttribute("aria-label", "Edit " + event.title);
    edit.addEventListener("click", () => openEventDialog(event.id));
    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "Delete";
    remove.setAttribute("aria-label", "Delete " + event.title);
    remove.addEventListener("click", () => {
      if (!confirm('Delete "' + event.title + '"?')) return;
      if (!updateState((draft) => {
        draft.events = draft.events.filter((item) => item.id !== event.id);
      })) return;
      renderAll();
      showToast("Event deleted.");
    });
    actions.append(year, edit, remove);
    row.append(datebox, content, actions);
    list.append(row);
  }
}

function renderAll(now = new Date()) {
  renderPeriodOptions();
  renderProgress(now);
  renderMeals(now);
  renderMoments();
}

function setStep(step, moveFocus = false) {
  setupStep = Math.max(1, Math.min(3, step));
  $$(".form-step").forEach((section) => {
    const active = !setupMode || Number(section.dataset.step) === setupStep;
    section.classList.toggle("active", active);
    section.hidden = !active;
  });
  $("#setup-progress").textContent = setupMode ? "STEP " + setupStep + " OF 3" : "";
  $("#step-back").hidden = !setupMode || setupStep === 1;
  $("#step-next").hidden = !setupMode || setupStep === 3;
  $("#profile-save").hidden = setupMode && setupStep !== 3;
  $("#profile-save").textContent = setupMode ? "Finish setup" : "Save changes";
  if (moveFocus && setupMode) {
    $("#profile-dialog").scrollTop = 0;
    const target = setupStep === 1 ? $("#profile-name")
      : setupStep === 2 ? $("#profile-zodiac") : $("#add-event-btn");
    requestAnimationFrame(() => target.focus());
  }
}

function openProfileDialog(isSetup = false) {
  setupMode = isSetup;
  const profile = state.profile;
  $("#profile-name").value = profile.name;
  $("#profile-birthday").value = profile.birthday;
  $("#profile-lifespan").value = profile.expectedLifespan;
  $("#profile-zodiac").value = profile.zodiac;
  $("#profile-mbti").value = profile.mbti;
  $("#profile-diet").value = profile.diet;
  $("#profile-cuisine").value = profile.cuisine;
  $("#profile-disliked").value = profile.dislikedIngredients;
  $("#profile-birthday").max = localDateString();
  $("#profile-dialog-title").textContent = isSetup ? "Set up your space" : "Your details";
  $("#profile-dialog").classList.toggle("setup-mode", isSetup);
  $("#profile-dialog").classList.toggle("editing", !isSetup);
  setStep(1);
  if (!$("#profile-dialog").open) $("#profile-dialog").showModal();
}

function validProfileFields() {
  const birthdayField = $("#profile-birthday");
  const yearsField = $("#profile-lifespan");
  const birthday = birthdayField.value;
  const years = Number(yearsField.value);
  birthdayField.setCustomValidity("");
  yearsField.setCustomValidity("");
  if (!validDateString(birthday) || birthday > localDateString()) {
    birthdayField.setCustomValidity("Choose a valid birthday that is not in the future.");
  }
  if (!Number.isInteger(years) || years < 1 || years > 130) {
    yearsField.setCustomValidity("Choose an age between 1 and 130 years.");
  }
  if (birthdayField.validationMessage || yearsField.validationMessage) {
    if (setupMode && setupStep !== 1) setStep(1);
    const invalid = birthdayField.validationMessage ? birthdayField : yearsField;
    invalid.reportValidity();
    invalid.focus();
    return false;
  }
  return true;
}

function saveProfile() {
  if (!validProfileFields()) return;
  const profile = {
    name: cleanString($("#profile-name").value, 40),
    birthday: $("#profile-birthday").value,
    expectedLifespan: Number($("#profile-lifespan").value),
    zodiac: $("#profile-zodiac").value,
    mbti: $("#profile-mbti").value,
    diet: $("#profile-diet").value,
    cuisine: $("#profile-cuisine").value,
    dislikedIngredients: cleanString($("#profile-disliked").value, 250),
  };
  if (!updateState((draft) => {
    draft.profile = profile;
    draft.preferences.setupComplete = true;
  })) return;
  setupMode = false;
  $("#profile-dialog").close();
  renderAll();
  showToast("Profile saved.");
}

function openEventDialog(id = null) {
  const event = state.events.find((item) => item.id === id);
  $("#event-dialog-title").textContent = event ? "Edit event" : "Add event";
  $("#event-id").value = event?.id || "";
  $("#event-title").value = event?.title || "";
  $("#event-date").value = event?.date || localDateString();
  $("#event-note").value = event?.note || "";
  $("#event-dialog").showModal();
}

function exportData() {
  const payload = JSON.stringify({
    version: 1, exportedAt: new Date().toISOString(), ...state,
  }, null, 2);
  const url = URL.createObjectURL(new Blob([payload], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "life-in-progress-" + localDateString() + ".json";
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  showToast("Backup downloaded.");
}

async function importData(file) {
  if (!file || file.size > 1_000_000) {
    showToast("Choose a JSON backup under 1 MB.");
    return;
  }
  try {
    const parsed = JSON.parse(await file.text());
    if (!isRecord(parsed) || parsed.version !== 1 || !isRecord(parsed.profile)
      || !Array.isArray(parsed.events) || (parsed.preferences !== undefined && !isRecord(parsed.preferences))
      || parsed.events.some((event) => !isRecord(event) || !validDateString(event.date) || !cleanString(event.title, 80))) {
      throw new Error("Invalid backup");
    }
    if (!confirm("Import this backup? It will replace the profile, events, and display preferences saved on this device.")) return;
    if (!saveState(sanitizedState(parsed))) return;
    $("#profile-dialog").close();
    renderAll();
    if (!state.preferences.setupComplete) openProfileDialog(true);
    showToast("Backup imported.");
  } catch {
    showToast("This file is not a Life in Progress backup.");
  }
}

function attachEvents() {
  $("#settings-btn").addEventListener("click", () => openProfileDialog(false));
  $("#period-select").addEventListener("change", (event) => {
    const selected = event.target.value;
    if (!updateState((draft) => { draft.preferences.period = selected; })) {
      renderPeriodOptions();
      return;
    }
    renderPeriodOptions();
    renderProgress();
  });
  $("#unit-select").addEventListener("change", (event) => {
    const selected = event.target.value;
    if (!updateState((draft) => { draft.preferences.unit = selected; })) {
      renderProgress();
      return;
    }
    renderProgress();
  });
  $("#refresh-meals-btn").addEventListener("click", () => {
    if (!updateState((draft) => { draft.preferences.mealSeed += 1; })) return;
    renderMeals();
    showToast("New meal ideas.");
  });
  $("#open-widget-btn").addEventListener("click", () => {
    const widgetUrl = demoToken ? "./widget.html?demo=" + encodeURIComponent(demoToken) : "./widget.html";
    const widgetName = demoToken ? "life-progress-compact-" + demoToken : "life-progress-compact";
    const popup = window.open(widgetUrl, widgetName, "width=360,height=320,resizable=yes");
    if (!popup) showToast("Allow pop-ups to open the compact window.");
  });
  $("#add-event-btn").addEventListener("click", () => openEventDialog());
  $$("[data-close]").forEach((button) => button.addEventListener("click", () => {
    if (button.dataset.close === "profile-dialog" && setupMode) return;
    $("#" + button.dataset.close).close();
  }));
  $$(".app-dialog").forEach((dialog) => {
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog && !(dialog.id === "profile-dialog" && setupMode)) dialog.close();
    });
    dialog.addEventListener("cancel", (event) => {
      if (dialog.id === "profile-dialog" && setupMode) event.preventDefault();
    });
  });
  $("#step-back").addEventListener("click", () => setStep(setupStep - 1, true));
  $("#step-next").addEventListener("click", () => {
    if (setupStep === 1 && !validProfileFields()) return;
    setStep(setupStep + 1, true);
  });
  $("#profile-form").addEventListener("submit", (event) => {
    event.preventDefault();
    if (setupMode && setupStep < 3) {
      if (setupStep === 1 && !validProfileFields()) return;
      setStep(setupStep + 1, true);
      return;
    }
    saveProfile();
  });
  $("#profile-birthday").addEventListener("input", () => $("#profile-birthday").setCustomValidity(""));
  $("#profile-lifespan").addEventListener("input", () => $("#profile-lifespan").setCustomValidity(""));
  $("#event-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const title = cleanString($("#event-title").value, 80);
    const date = $("#event-date").value;
    if (!title || !validDateString(date)) {
      $("#event-form").reportValidity();
      return;
    }
    const id = $("#event-id").value || makeId();
    const existing = state.events.find((item) => item.id === id);
    const record = {
      id, title, date, note: cleanString($("#event-note").value, 280),
      createdAt: existing?.createdAt || new Date().toISOString(),
    };
    const wasEditing = Boolean(existing);
    if (!updateState((draft) => {
      const index = draft.events.findIndex((item) => item.id === id);
      if (index >= 0) draft.events[index] = record;
      else draft.events.push(record);
    })) return;
    $("#event-dialog").close();
    renderAll();
    showToast(wasEditing ? "Event updated." : "Event added.");
  });
  $("#export-btn").addEventListener("click", exportData);
  $("#import-btn").addEventListener("click", () => $("#import-file").click());
  $("#import-file").addEventListener("change", async (event) => {
    await importData(event.target.files?.[0]);
    event.target.value = "";
  });
  $("#install-btn").addEventListener("click", async () => {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      await deferredInstallPrompt.userChoice;
      deferredInstallPrompt = null;
    } else {
      showToast("Use your browser menu to install or add to your home screen.");
    }
  });
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
  });
  window.addEventListener("storage", (event) => {
    if (event.key !== STORAGE_KEY) return;
    const nextState = readState();
    const personalDataChanged = JSON.stringify(state.profile) !== JSON.stringify(nextState.profile)
      || JSON.stringify(state.events) !== JSON.stringify(nextState.events);
    state = nextState;
    renderAll();
    if (personalDataChanged && $("#event-dialog").open) {
      $("#event-dialog").close();
      showToast("Saved events changed in another tab. Reopen the event to edit.");
    }
    if (personalDataChanged && $("#profile-dialog").open) {
      $("#profile-dialog").close();
      showToast("Saved data changed in another tab. Reopen settings to edit.");
    }
    if (!state.preferences.setupComplete) openProfileDialog(true);
  });
}

attachEvents();
renderAll();
if (!state.preferences.setupComplete) openProfileDialog(true);

setInterval(() => {
  const now = new Date();
  renderProgress(now);
  const today = localDateString(now);
  if (today !== lastDay) {
    lastDay = today;
    renderMeals(now);
  }
}, 1000);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
}
