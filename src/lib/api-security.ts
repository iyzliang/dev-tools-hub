import type { NextRequest } from "next/server";

export type JsonRecord = Record<string, unknown>;

export function isRecord(value: unknown): value is JsonRecord {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

export function ensureTrimmedString(
  value: unknown,
  maxLength = 1024,
): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.length > maxLength ? trimmed.slice(0, maxLength) : trimmed;
}

export function safeParseJsonBody<T extends JsonRecord | unknown[]>(
  raw: unknown,
): T | null {
  if (!isRecord(raw) && !Array.isArray(raw)) {
    return null;
  }
  return raw as T;
}

export function getClientIp(req: NextRequest): string {
  const header =
    req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip");
  if (!header) return "unknown-ip";
  return header.split(",")[0]?.trim() || "unknown-ip";
}

