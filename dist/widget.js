import { formatProgressPercent, formatRemainingTime, getPeriodProgress } from "./time.js?v=6";
import { getStorageContext } from "./local-demo.js?v=6";

const { storageKey: STORAGE_KEY, demoToken } = getStorageContext();
const PERIODS = ["today", "month", "year", "life"];
const UNITS = ["years", "months", "days", "hours", "minutes", "seconds"];
const LABELS = { today: "TODAY", month: "THIS MONTH", year: "THIS YEAR", life: "MY LIFE" };
const $ = (selector) => document.querySelector(selector);
if (demoToken) $(".full-link").href = "./index.html?demo=" + encodeURIComponent(demoToken);
let currentState = readState();

function readState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function selectedPeriod() {
  const value = currentState.preferences?.widgetPeriod;
  return PERIODS.includes(value) ? value : "today";
}

function selectedUnit() {
  const value = currentState.preferences?.widgetUnit;
  return UNITS.includes(value) ? value : "hours";
}

function render() {
  const period = selectedPeriod();
  const unit = selectedUnit();
  const progress = getPeriodProgress(period, new Date(), currentState.profile || {});
  $("#period-select").value = period;
  $("#unit-select").value = unit;
  $("#period-name").textContent = LABELS[period];

  if (!progress) {
    $("#remaining").textContent = "—";
    $("#remaining-label").textContent = "Add your birthday in the full app";
    $("#progress-percent").textContent = "—";
    $("#progress-fill").style.width = "0%";
    $("#progress-track").setAttribute("aria-valuenow", "0");
    $("#progress-track").setAttribute("aria-valuetext", "Add a birthday to view life progress");
    return;
  }

  const percent = Math.max(0, Math.min(100, progress.percent));
  const remaining = formatRemainingTime(progress.remainingMs, unit);
  const percentText = formatProgressPercent(percent);
  $("#remaining").textContent = `${remaining.number} ${remaining.label}`;
  $("#remaining-label").textContent = progress.isBeyondEstimate ? "beyond your estimate" : "remaining";
  $("#progress-percent").textContent = percentText;
  $("#progress-fill").style.width = `${percent}%`;
  $("#progress-track").setAttribute("aria-valuenow", String(percent));
  $("#progress-track").setAttribute("aria-valuetext", `${percentText} elapsed`);
}

function savePreference(key, value) {
  const previousState = readState();
  const nextState = {
    ...previousState,
    preferences: { ...(previousState.preferences || {}), [key]: value },
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
    currentState = nextState;
    $("#status").textContent = "";
  } catch {
    currentState = previousState;
    $("#status").textContent = "This browser could not save your choice.";
  }
  render();
}

$("#period-select").addEventListener("change", (event) => savePreference("widgetPeriod", event.target.value));
$("#unit-select").addEventListener("change", (event) => savePreference("widgetUnit", event.target.value));
window.addEventListener("storage", (event) => {
  if (event.key === STORAGE_KEY) {
    currentState = readState();
    render();
  }
});
document.addEventListener("visibilitychange", () => { if (!document.hidden) render(); });
render();
setInterval(render, 1000);
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
}
