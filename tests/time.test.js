import test from "node:test";
import assert from "node:assert/strict";
import {
  formatProgressPercent, formatRemainingTime, getPeriodProgress, getEventProgress, getRemainingQuantity,
  normalizeEventStart,
} from "../dist/time.js";

test("day, month, and year use local calendar boundaries", () => {
  const now = new Date(2026, 10, 6, 12, 0, 0);
  const day = getPeriodProgress("today", now);
  const month = getPeriodProgress("month", now);
  const year = getPeriodProgress("year", now);

  assert.deepEqual(
    [day.start.getFullYear(), day.start.getMonth(), day.start.getDate(), day.start.getHours()],
    [2026, 10, 6, 0],
  );
  assert.deepEqual(
    [day.end.getFullYear(), day.end.getMonth(), day.end.getDate()],
    [2026, 10, 7],
  );
  assert.deepEqual([month.start.getDate(), month.end.getMonth(), month.end.getDate()], [1, 11, 1]);
  assert.deepEqual([year.start.getMonth(), year.end.getFullYear()], [0, 2027]);
  assert.ok(day.percent > 0 && day.percent < 100);
  assert.equal(day.elapsedMs + day.remainingMs, day.totalMs);
});

test("a spring daylight-saving day has 23 hours in New York", () => {
  const originalZone = process.env.TZ;
  process.env.TZ = "America/New_York";
  try {
    const progress = getPeriodProgress("today", new Date(2025, 2, 9, 12));
    assert.equal(progress.totalMs, 23 * 3_600_000);
    assert.equal(progress.start.getHours(), 0);
    assert.equal(progress.end.getHours(), 0);
  } finally {
    if (originalZone === undefined) delete process.env.TZ;
    else process.env.TZ = originalZone;
  }
});

test("a fall daylight-saving day has 25 hours in New York", () => {
  const originalZone = process.env.TZ;
  process.env.TZ = "America/New_York";
  try {
    const progress = getPeriodProgress("today", new Date(2025, 10, 2, 12));
    assert.equal(progress.totalMs, 25 * 3_600_000);
    assert.equal(progress.start.getHours(), 0);
    assert.equal(progress.end.getHours(), 0);
  } finally {
    if (originalZone === undefined) delete process.env.TZ;
    else process.env.TZ = originalZone;
  }
});

test("day, month, and year reset at their next local boundary", () => {
  const before = new Date(2026, 11, 31, 23, 59, 59, 999);
  const after = new Date(2027, 0, 1, 0, 0, 0, 0);
  for (const period of ["today", "month", "year"]) {
    assert.ok(getPeriodProgress(period, before).percent > 99.9);
    const next = getPeriodProgress(period, after);
    assert.equal(next.percent, 0);
    assert.equal(next.remainingMs, next.totalMs);
  }
});

test("leap-day birthday is clamped to February 28 in a non-leap target year", () => {
  const progress = getPeriodProgress("life", new Date(2054, 1, 27), {
    birthday: "2024-02-29",
    expectedLifespan: 30,
  });
  assert.equal(progress.end.getFullYear(), 2054);
  assert.equal(progress.end.getMonth(), 1);
  assert.equal(progress.end.getDate(), 28);
});

test("lifetime clamps progress before birth and beyond the estimate", () => {
  const profile = { birthday: "2000-01-01", expectedLifespan: 90 };
  const before = getPeriodProgress("life", new Date(1999, 11, 31), profile);
  const beyond = getPeriodProgress("life", new Date(2100, 0, 1), profile);
  assert.equal(before.percent, 0);
  assert.equal(before.remainingMs, before.totalMs);
  assert.equal(before.isBeyondEstimate, false);
  assert.equal(beyond.percent, 100);
  assert.equal(beyond.remainingMs, 0);
  assert.equal(beyond.isBeyondEstimate, true);
  assert.equal(getPeriodProgress("life", new Date(), { birthday: "2026-02-30" }), null);
});

test("planned age 80 ends at the 80th birthday", () => {
  const profile = { birthday: "2002-01-26", expectedLifespan: 80 };
  const justBefore = getPeriodProgress("life", new Date(2082, 0, 25, 23, 59, 59, 999), profile);
  const birthday = getPeriodProgress("life", new Date(2082, 0, 26), profile);
  assert.deepEqual(
    [birthday.end.getFullYear(), birthday.end.getMonth(), birthday.end.getDate()],
    [2082, 0, 26],
  );
  assert.equal(justBefore.remainingMs, 1);
  assert.ok(justBefore.percent < 100);
  assert.equal(birthday.percent, 100);
  assert.equal(birthday.remainingMs, 0);
});

test("personal events progress from creation time to the start of the target date", () => {
  const start = new Date(2026, 10, 6, 12, 34, 56);
  const end = new Date(2026, 10, 8);
  const createdAt = start.toISOString();
  const atCreation = getEventProgress("2026-11-08", start, createdAt);
  const halfway = getEventProgress("2026-11-08", new Date((start.getTime() + end.getTime()) / 2), createdAt);
  const arrived = getEventProgress("2026-11-08", end, createdAt);
  assert.equal(atCreation.start.getTime(), start.getTime());
  assert.equal(atCreation.percent, 0);
  assert.equal(atCreation.remainingMs, end.getTime() - start.getTime());
  assert.equal(halfway.percent, 50);
  assert.equal(halfway.elapsedMs + halfway.remainingMs, halfway.totalMs);
  assert.equal(arrived.percent, 100);
  assert.equal(arrived.remainingMs, 0);
  assert.equal(arrived.isPastEvent, true);
  assert.equal(getEventProgress("2026-11-08", start, ""), null);
  assert.equal(normalizeEventStart("2026-02-30T12:00:00.000Z"), null);
  assert.equal(getEventProgress("2026-11-08", start, "2026-02-30T12:00:00.000Z"), null);
  assert.equal(getEventProgress("2026-11-06", start, createdAt).percent, 100);
});

test("event countdown uses the local target midnight across daylight saving", () => {
  const originalZone = process.env.TZ;
  process.env.TZ = "America/New_York";
  try {
    const created = new Date(2025, 2, 8, 12);
    const progress = getEventProgress("2025-03-10", created, created.toISOString());
    assert.equal(progress.end.getHours(), 0);
    assert.equal(progress.totalMs, 35 * 3_600_000);
    assert.equal(progress.remainingMs, progress.totalMs);
  } finally {
    if (originalZone === undefined) delete process.env.TZ;
    else process.env.TZ = originalZone;
  }
});

test("quantity conversion is nonnegative and flags approximate calendar units", () => {
  assert.deepEqual(getRemainingQuantity(2_000, "seconds"), {
    value: 2,
    approximate: false,
    label: "seconds",
  });
  assert.equal(getRemainingQuantity(-100, "minutes").value, 0);
  assert.equal(getRemainingQuantity(48 * 3_600_000, "days").value, 2);
  assert.equal(getRemainingQuantity(90 * 60_000, "hours").value, 1.5);
  assert.equal(getRemainingQuantity(120_000, "minutes").value, 2);
  assert.equal(getRemainingQuantity(1_000, "seconds").value, 1);
  assert.equal(getRemainingQuantity(30.436875 * 86_400_000, "months").value, 1);
  assert.equal(getRemainingQuantity(365.2425 * 86_400_000, "years").approximate, true);
  assert.throws(() => getRemainingQuantity(5, "fortnights"), RangeError);
});

test("remaining time stays readable in all six manually selected units", () => {
  const halfDay = 12 * 3_600_000;
  assert.deepEqual(formatRemainingTime(halfDay, "years"), { number: "<0.01", label: "years" });
  assert.deepEqual(formatRemainingTime(halfDay, "months"), { number: "<0.1", label: "months" });
  assert.deepEqual(formatRemainingTime(halfDay, "days"), { number: "0.5", label: "days" });
  assert.deepEqual(formatRemainingTime(halfDay, "hours"), { number: "12", label: "hours" });
  assert.deepEqual(formatRemainingTime(halfDay, "minutes"), { number: "720", label: "minutes" });
  assert.deepEqual(formatRemainingTime(halfDay, "seconds"), { number: "43,200", label: "seconds" });
  assert.deepEqual(formatRemainingTime(1, "minutes"), { number: "1", label: "minute" });
  assert.deepEqual(formatRemainingTime(0, "years"), { number: "0", label: "years" });
  assert.deepEqual(formatRemainingTime(57.5 * 365.2425 * 86_400_000, "years"), { number: "≈57.5", label: "years" });
});

test("percentage display does not show completion while time remains", () => {
  assert.equal(formatProgressPercent(0), "0.0%");
  assert.equal(formatProgressPercent(0.01), "<0.1%");
  assert.equal(formatProgressPercent(99.96), "99.9%");
  assert.equal(formatProgressPercent(100), "100.0%");
});

test("all periods and events derive percentage and remaining time from one elapsed duration", () => {
  const now = new Date(2026, 10, 6, 12);
  const profile = { birthday: "2002-01-26", expectedLifespan: 80 };
  const periods = ["today", "month", "year", "life"].map((period) => getPeriodProgress(period, now, profile));
  periods.push(getEventProgress("2030-06-01", now, new Date(2026, 10, 6, 10).toISOString()));
  for (const progress of periods) {
    assert.equal(progress.elapsedMs + progress.remainingMs, progress.totalMs);
    assert.ok(Math.abs(progress.percent - progress.elapsedMs / progress.totalMs * 100) < 1e-9);
    assert.ok(progress.remainingMs >= 0);
    assert.ok(progress.percent >= 0 && progress.percent <= 100);
  }
});
