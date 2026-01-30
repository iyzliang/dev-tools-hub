import { describe, it, expect } from "vitest";
import {
  parseDateString,
  timestampToDate,
  dateToTimestamp,
  formatDateInTimezone,
  parseDateStringInTimezone,
  getCurrentTimestamp,
  getCurrentDateString,
  validateTimestampInput,
} from "./timestamp-utils";

describe("parseDateString", () => {
  it("parses ISO 8601 with T", () => {
    const r = parseDateString("2024-01-30T12:00:00");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.getFullYear()).toBe(2024);
  });

  it("parses ISO 8601 with Z", () => {
    const r = parseDateString("2024-01-30T12:00:00Z");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toISOString()).toContain("2024-01-30");
  });

  it("parses space-separated date time", () => {
    const r = parseDateString("2024-01-30 12:00:00");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.getFullYear()).toBe(2024);
  });

  it("returns error for empty input", () => {
    const r = parseDateString("");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain("请输入");
  });

  it("returns error for invalid format", () => {
    const r = parseDateString("not-a-date");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBeDefined();
  });

  it("trims whitespace", () => {
    const r = parseDateString("  2024-01-30T12:00:00  ");
    expect(r.ok).toBe(true);
  });
});

describe("timestampToDate", () => {
  it("converts seconds to Date", () => {
    const d = timestampToDate(1706592000, "seconds");
    expect(d).not.toBeNull();
    expect(d!.getFullYear()).toBe(2024);
  });

  it("converts milliseconds to Date", () => {
    const d = timestampToDate(1706592000000, "milliseconds");
    expect(d).not.toBeNull();
    expect(d!.getFullYear()).toBe(2024);
  });

  it("returns null for non-finite", () => {
    expect(timestampToDate(Number.NaN, "seconds")).toBeNull();
    expect(timestampToDate(Number.POSITIVE_INFINITY, "milliseconds")).toBeNull();
  });

  it("returns null for out-of-range seconds", () => {
    expect(timestampToDate(1e15, "seconds")).toBeNull();
  });
});

describe("dateToTimestamp", () => {
  it("converts Date to seconds and milliseconds", () => {
    const d = new Date("2024-01-30T12:00:00.000Z");
    const r = dateToTimestamp(d);
    expect(r).not.toBeNull();
    expect(r!.seconds).toBe(Math.floor(d.getTime() / 1000));
    expect(r!.milliseconds).toBe(d.getTime());
  });

  it("returns null for invalid Date", () => {
    expect(dateToTimestamp(new Date("invalid"))).toBeNull();
  });
});

describe("formatDateInTimezone", () => {
  it("formats in UTC", () => {
    const d = new Date("2024-01-30T12:00:00.000Z");
    const s = formatDateInTimezone(d, "UTC");
    expect(s).toContain("2024");
    expect(s).toContain("12");
  });

  it("formats in local", () => {
    const d = new Date("2024-01-30T12:00:00.000Z");
    const s = formatDateInTimezone(d, "local");
    expect(s).toBeDefined();
    expect(s.length).toBeGreaterThan(0);
  });

  it("formats in IANA timezone", () => {
    const d = new Date("2024-01-30T12:00:00.000Z");
    const s = formatDateInTimezone(d, "Asia/Shanghai");
    expect(s).toBeDefined();
    expect(s.length).toBeGreaterThan(0);
  });
});

describe("parseDateStringInTimezone", () => {
  it("parses with local timezone", () => {
    const r = parseDateStringInTimezone("2024-01-30T12:00:00", "local");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.getFullYear()).toBe(2024);
  });

  it("parses with UTC - appends Z", () => {
    const r = parseDateStringInTimezone("2024-01-30 12:00:00", "UTC");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toISOString()).toContain("2024-01-30T12:00:00.000Z");
  });

  it("returns error for empty with timezone", () => {
    const r = parseDateStringInTimezone("", "UTC");
    expect(r.ok).toBe(false);
  });
});

describe("getCurrentTimestamp", () => {
  it("returns seconds and milliseconds", () => {
    const before = Date.now();
    const r = getCurrentTimestamp();
    const after = Date.now();
    expect(r.seconds).toBeGreaterThanOrEqual(Math.floor(before / 1000));
    expect(r.seconds).toBeLessThanOrEqual(Math.ceil(after / 1000));
    expect(r.milliseconds).toBeGreaterThanOrEqual(before);
    expect(r.milliseconds).toBeLessThanOrEqual(after + 1);
  });
});

describe("getCurrentDateString", () => {
  it("returns ISO-like string", () => {
    const s = getCurrentDateString();
    expect(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(s)).toBe(true);
  });
});

describe("validateTimestampInput", () => {
  it("accepts valid seconds", () => {
    const r = validateTimestampInput("1706592000", "seconds");
    expect(r.valid).toBe(true);
    if (r.valid) expect(r.value).toBe(1706592000);
  });

  it("accepts valid milliseconds", () => {
    const r = validateTimestampInput("1706592000000", "milliseconds");
    expect(r.valid).toBe(true);
    if (r.valid) expect(r.value).toBe(1706592000000);
  });

  it("rejects empty", () => {
    const r = validateTimestampInput("", "seconds");
    expect(r.valid).toBe(false);
    if (!r.valid) expect(r.error).toContain("请输入");
  });

  it("rejects non-integer", () => {
    const r = validateTimestampInput("12.34", "seconds");
    expect(r.valid).toBe(false);
  });

  it("rejects non-numeric", () => {
    const r = validateTimestampInput("abc", "seconds");
    expect(r.valid).toBe(false);
  });
});
