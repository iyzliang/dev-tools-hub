/**
 * Timestamp Conversion Utilities
 *
 * Provides conversion between Unix timestamp (seconds/milliseconds) and
 * human-readable date/time strings, with timezone formatting via Intl.
 */

// ============================================================================
// Types
// ============================================================================

export type TimestampUnit = "seconds" | "milliseconds";

export type TimezoneOption = "UTC" | "local" | string;

export interface TimestampResult {
  seconds: number;
  milliseconds: number;
}

export interface ParseDateSuccess {
  ok: true;
  value: Date;
}

export interface ParseDateFailure {
  ok: false;
  error: string;
}

export type ParseDateResult = ParseDateSuccess | ParseDateFailure;

const MIN_SAFE_TIMESTAMP_MS = -864000000000000; // Date min
const MAX_SAFE_TIMESTAMP_MS = 864000000000000; // Date max

// ============================================================================
// Normalize & Parse
// ============================================================================

/**
 * Normalizes date string: trim, replace space before time with 'T' for ISO-like parsing
 */
function normalizeDateString(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return trimmed;
  return trimmed.replace(/^\s*(\d{4}-\d{2}-\d{2})\s+(\d)/, "$1T$2");
}

/**
 * Parses a date string (ISO 8601 or common formats like YYYY-MM-DD HH:mm:ss).
 * Returns Date or error message.
 *
 * @param input - Date string to parse
 * @returns ParseDateResult with Date or error message
 */
export function parseDateString(input: string): ParseDateResult {
  const normalized = normalizeDateString(input);
  if (!normalized) {
    return { ok: false, error: "请输入日期时间字符串" };
  }

  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) {
    return { ok: false, error: "无法解析该日期时间格式，请使用 ISO 8601 或 YYYY-MM-DD HH:mm:ss" };
  }

  if (parsed.getTime() < MIN_SAFE_TIMESTAMP_MS || parsed.getTime() > MAX_SAFE_TIMESTAMP_MS) {
    return { ok: false, error: "日期时间超出可处理范围" };
  }

  return { ok: true, value: parsed };
}

// ============================================================================
// Timestamp <-> Date
// ============================================================================

/**
 * Converts a numeric timestamp to a Date.
 *
 * @param value - Numeric timestamp (seconds or milliseconds per unit)
 * @param unit - 'seconds' or 'milliseconds'
 * @returns Date or null if out of range
 */
export function timestampToDate(value: number, unit: TimestampUnit): Date | null {
  if (!Number.isFinite(value)) return null;
  const ms = unit === "seconds" ? value * 1000 : value;
  if (ms < MIN_SAFE_TIMESTAMP_MS || ms > MAX_SAFE_TIMESTAMP_MS) return null;
  const date = new Date(ms);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

/**
 * Converts a Date to seconds and milliseconds.
 *
 * @param date - Date instance
 * @returns { seconds, milliseconds } or null if invalid
 */
export function dateToTimestamp(date: Date): TimestampResult | null {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return null;
  const ms = date.getTime();
  return {
    seconds: Math.floor(ms / 1000),
    milliseconds: ms,
  };
}

// ============================================================================
// Timezone formatting
// ============================================================================

function getTimezoneOffsetMs(timeZone: string, date: Date): number {
  if (timeZone === "UTC") return 0;
  if (timeZone === "local") {
    return -date.getTimezoneOffset() * 60 * 1000;
  }
  try {
    const formatter = new Intl.DateTimeFormat("en-GB", {
      timeZone,
      timeZoneName: "longOffset",
    });
    const parts = formatter.formatToParts(date);
    const tzPart = parts.find((p) => p.type === "timeZoneName");
    const value = tzPart?.value ?? "";
    const match = value.match(/GMT([+-])(\d+)(?::(\d+))?/);
    if (!match) return 0;
    const sign = match[1] === "+" ? 1 : -1;
    const hours = Number.parseInt(match[2] ?? "0", 10);
    const minutes = Number.parseInt(match[3] ?? "0", 10);
    return sign * (hours * 3600 + minutes * 60) * 1000;
  } catch {
    return 0;
  }
}

/**
 * Formats a Date in the given timezone as a readable string.
 *
 * @param date - Date to format
 * @param timeZone - 'UTC', 'local', or IANA timezone (e.g. Asia/Shanghai)
 * @returns Formatted string
 */
export function formatDateInTimezone(
  date: Date,
  timeZone: TimezoneOption
): string {
  const tz = timeZone === "local" ? undefined : timeZone === "UTC" ? "UTC" : timeZone;
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: tz ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
  return new Intl.DateTimeFormat("sv-SE", options).format(date).replace(" ", "T");
}

/**
 * Parses a date string and interprets it in the given timezone, returning UTC Date.
 * For "local", uses browser local. For "UTC", appends Z if no offset. For IANA, applies offset.
 *
 * @param input - Date string (ISO 8601 or YYYY-MM-DD HH:mm:ss)
 * @param timeZone - 'UTC', 'local', or IANA timezone
 * @returns ParseDateResult; value is the UTC Date
 */
export function parseDateStringInTimezone(
  input: string,
  timeZone: TimezoneOption
): ParseDateResult {
  const normalized = normalizeDateString(input);
  if (!normalized) {
    return { ok: false, error: "请输入日期时间字符串" };
  }

  if (timeZone === "local") {
    return parseDateString(input);
  }

  if (timeZone === "UTC") {
    let toParse = normalized.replace(/\s+/, "T");
    if (!/Z|[+-]\d{2}:?\d{2}$/.test(toParse)) {
      toParse = toParse.endsWith("Z") ? toParse : `${toParse}Z`;
    }
    const parsed = new Date(toParse);
    if (Number.isNaN(parsed.getTime())) {
      return { ok: false, error: "无法解析该日期时间格式" };
    }
    return { ok: true, value: parsed };
  }

  const normalizedForParse = normalized.replace(/\s+/, "T");
  const parseAsUtc = normalizedForParse.endsWith("Z") || /[+-]\d{2}:?\d{2}$/.test(normalizedForParse)
    ? normalizedForParse
    : `${normalizedForParse}Z`;
  const parsedAsUtc = new Date(parseAsUtc);
  if (Number.isNaN(parsedAsUtc.getTime())) {
    return { ok: false, error: "无法解析该日期时间格式" };
  }
  const offsetMs = getTimezoneOffsetMs(timeZone, parsedAsUtc);
  const utcMs = parsedAsUtc.getTime() - offsetMs;
  const date = new Date(utcMs);
  if (date.getTime() < MIN_SAFE_TIMESTAMP_MS || date.getTime() > MAX_SAFE_TIMESTAMP_MS) {
    return { ok: false, error: "日期时间超出可处理范围" };
  }
  return { ok: true, value: date };
}

// ============================================================================
// Current time helpers
// ============================================================================

/**
 * Returns current time as { seconds, milliseconds }.
 */
export function getCurrentTimestamp(): TimestampResult {
  const ms = Date.now();
  return { seconds: Math.floor(ms / 1000), milliseconds: ms };
}

/**
 * Returns current time as ISO 8601 string (local).
 */
export function getCurrentDateString(): string {
  const d = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

// ============================================================================
// Validation
// ============================================================================

/**
 * Validates numeric timestamp input for the given unit.
 * Rejects empty, non-numeric, or out-of-safe-range values.
 */
export function validateTimestampInput(
  input: string,
  unit: TimestampUnit
): { valid: true; value: number } | { valid: false; error: string } {
  const trimmed = input.trim();
  if (!trimmed) {
    return { valid: false, error: "请输入时间戳" };
  }
  const num = Number(trimmed);
  if (!Number.isFinite(num) || !Number.isInteger(num)) {
    return { valid: false, error: "时间戳须为整数" };
  }
  const ms = unit === "seconds" ? num * 1000 : num;
  if (ms < MIN_SAFE_TIMESTAMP_MS || ms > MAX_SAFE_TIMESTAMP_MS) {
    return { valid: false, error: "时间戳超出可处理范围" };
  }
  return { valid: true, value: num };
}
