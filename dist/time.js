const MILLISECONDS = Object.freeze({
  seconds: 1_000,
  minutes: 60_000,
  hours: 3_600_000,
  days: 86_400_000,
  months: 86_400_000 * 30.436875,
  years: 86_400_000 * 365.2425,
});

function validBirthday(value) {
  if (typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 100 || month < 1 || month > 12 || day < 1 || day > 31) return null;

  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) return null;

  return date;
}

function lifespanYears(value) {
  const years = Number(value);
  return Number.isInteger(years) && years > 0 && years <= 130 ? years : 90;
}

/**
 * Progress through a local calendar period or an estimated lifetime.
 * `end` is exclusive. A lifetime is an estimate, never a predicted death date.
 */
export function getPeriodProgress(period, now = new Date(), profile = {}) {
  const current = now instanceof Date ? now : new Date(now);
  if (Number.isNaN(current.getTime())) throw new RangeError("Invalid current date");

  let start;
  let end;
  if (period === "today") {
    start = new Date(current.getFullYear(), current.getMonth(), current.getDate());
    end = new Date(current.getFullYear(), current.getMonth(), current.getDate() + 1);
  } else if (period === "month") {
    start = new Date(current.getFullYear(), current.getMonth(), 1);
    end = new Date(current.getFullYear(), current.getMonth() + 1, 1);
  } else if (period === "year") {
    start = new Date(current.getFullYear(), 0, 1);
    end = new Date(current.getFullYear() + 1, 0, 1);
  } else if (period === "life") {
    start = validBirthday(profile.birthday);
    if (!start) return null;

    const targetYear = start.getFullYear() + lifespanYears(profile.expectedLifespan);
    const targetMonth = start.getMonth();
    const lastDay = new Date(targetYear, targetMonth + 1, 0).getDate();
    end = new Date(targetYear, targetMonth, Math.min(start.getDate(), lastDay));
  } else {
    throw new RangeError(`Unknown period: ${period}`);
  }

  const totalMs = end.getTime() - start.getTime();
  const elapsedMs = Math.min(totalMs, Math.max(0, current.getTime() - start.getTime()));
  const remainingMs = totalMs - elapsedMs;

  return {
    start,
    end,
    elapsedMs,
    remainingMs,
    totalMs,
    percent: (elapsedMs / totalMs) * 100,
    isBeyondEstimate: period === "life" && current.getTime() >= end.getTime(),
  };
}

/** Accept only the canonical timestamp format written by this app. */
export function normalizeEventStart(value) {
  if (typeof value !== "string"
    || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) return null;
  const created = new Date(value);
  return Number.isNaN(created.getTime()) || created.toISOString() !== value ? null : value;
}

/** Progress from the moment an event was created to the start of its local target date. */
export function getEventProgress(eventDate, now = new Date(), createdAt) {
  const normalizedStart = normalizeEventStart(createdAt);
  if (!normalizedStart) return null;
  const start = new Date(normalizedStart);
  const end = validBirthday(eventDate);
  const current = now instanceof Date ? now : new Date(now);
  if (Number.isNaN(start.getTime()) || !end || Number.isNaN(current.getTime())) return null;
  if (end.getTime() <= start.getTime()) {
    return { start, end, elapsedMs: 0, remainingMs: 0, totalMs: 0, percent: 100, isPastEvent: true };
  }
  const totalMs = end.getTime() - start.getTime();
  const elapsedMs = Math.min(totalMs, Math.max(0, current.getTime() - start.getTime()));
  return {
    start,
    end,
    elapsedMs,
    remainingMs: totalMs - elapsedMs,
    totalMs,
    percent: elapsedMs / totalMs * 100,
    isPastEvent: current.getTime() >= end.getTime(),
  };
}

/** Month and year quantities use average calendar lengths; other units are exact durations. */
export function getRemainingQuantity(milliseconds, unit) {
  if (!Object.hasOwn(MILLISECONDS, unit)) throw new RangeError(`Unknown time unit: ${unit}`);
  const safeMilliseconds = Number.isFinite(milliseconds) ? Math.max(0, milliseconds) : 0;
  return {
    value: safeMilliseconds / MILLISECONDS[unit],
    approximate: unit === "months" || unit === "years",
    label: unit,
  };
}

/** Keep short periods readable in any selected unit without displaying a positive remainder as zero. */
export function formatRemainingTime(milliseconds, unit) {
  const { value, approximate } = getRemainingQuantity(milliseconds, unit);
  if (value === 0) return { number: "0", label: unit };

  let digits = 0;
  if (unit === "years") digits = value < 1 ? 2 : 1;
  else if (unit === "months") digits = value < 10 ? 1 : 0;
  else if (unit === "days" || unit === "hours") digits = value < 100 ? 1 : 0;
  const threshold = 10 ** -digits;
  if (digits > 0 && value < threshold) {
    return { number: `<${threshold}`, label: unit };
  }

  const rounded = unit === "minutes" || unit === "seconds"
    ? Math.ceil(value) : Number(value.toFixed(digits));
  const number = new Intl.NumberFormat("en-US", { maximumFractionDigits: digits }).format(rounded);
  return {
    number: (approximate ? "≈" : "") + number,
    label: rounded === 1 ? unit.slice(0, -1) : unit,
  };
}

/** Avoid showing a completed percentage while some time still remains. */
export function formatProgressPercent(percent) {
  const safePercent = Number.isFinite(percent) ? Math.max(0, Math.min(100, percent)) : 0;
  if (safePercent > 0 && safePercent < 0.05) return "<0.1%";
  return `${(safePercent < 100 ? Math.min(99.9, safePercent) : 100).toFixed(1)}%`;
}
