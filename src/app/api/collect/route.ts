import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { JsonValue } from "@/lib/analytics";
import { ensureTrimmedString, isRecord } from "@/lib/api-security";

/** Footprint SDK 上报的单个事件结构 */
type FootprintTrackEvent = {
  eventName?: unknown;
  properties?: unknown;
  timestamp?: unknown;
  sessionId?: unknown;
  userId?: unknown;
  anonymousId?: unknown;
  appId?: unknown;
  page?: unknown;
  device?: unknown;
};

type CollectRequestBody = {
  appId?: unknown;
  events?: FootprintTrackEvent[];
};

function sanitizeProperties(value: unknown): Record<string, JsonValue> | undefined {
  if (!isRecord(value)) return undefined;

  const result: Record<string, JsonValue> = {};

  for (const [key, v] of Object.entries(value)) {
    if (typeof v === "string") {
      result[key] = v.length > 2000 ? (v.slice(0, 2000) as JsonValue) : v;
    } else if (
      typeof v === "number" ||
      typeof v === "boolean" ||
      v === null
    ) {
      result[key] = v;
    } else if (Array.isArray(v)) {
      result[key] = v.slice(0, 100) as JsonValue;
    } else if (isRecord(v)) {
      result[key] = sanitizeProperties(v) ?? {};
    }
  }

  return Object.keys(result).length ? result : undefined;
}

function parseDate(value: unknown): Date | undefined {
  if (typeof value === "number" && !Number.isNaN(value)) {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? undefined : d;
  }
  if (typeof value === "string") {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? undefined : d;
  }
  return undefined;
}

function getNestedString(obj: unknown, key: string, maxLen = 512): string | null {
  if (!isRecord(obj)) return null;
  const v = obj[key];
  return ensureTrimmedString(v, maxLen) ?? null;
}

export async function POST(req: NextRequest) {
  let rawBody: unknown;

  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  if (!isRecord(rawBody) || !Array.isArray((rawBody as CollectRequestBody).events)) {
    return NextResponse.json(
      { error: "Request must be { appId?, events: array }" },
      { status: 400 },
    );
  }

  const incomingEvents = (rawBody as CollectRequestBody).events ?? [];

  if (!incomingEvents.length) {
    return NextResponse.json(
      { error: "No events provided" },
      { status: 400 },
    );
  }

  if (incomingEvents.length > 100) {
    return NextResponse.json(
      { error: "Too many events in a single request" },
      { status: 429 },
    );
  }

  const now = new Date();

  const data = incomingEvents
    .map((event) => {
      const anonymousId = ensureTrimmedString(event.anonymousId, 255);
      const sessionId = ensureTrimmedString(event.sessionId, 255);
      const eventName = ensureTrimmedString(event.eventName, 255);

      if (!anonymousId || !sessionId || !eventName) {
        return null;
      }

      const device = isRecord(event.device) ? event.device : undefined;
      const userAgent = device ? getNestedString(device, "ua", 512) : null;
      const locale = device ? getNestedString(device, "language", 32) : null;

      const properties = sanitizeProperties(event.properties);
      const toolName = properties && typeof properties.tool_name === "string"
        ? ensureTrimmedString(properties.tool_name, 255) ?? null
        : null;
      const timezone = properties && typeof properties.timezone === "string"
        ? ensureTrimmedString(properties.timezone, 64) ?? null
        : null;
      const softFingerprint = properties && typeof properties.soft_fingerprint === "string"
        ? ensureTrimmedString(properties.soft_fingerprint, 64) ?? null
        : null;

      const createdAt = parseDate(event.timestamp) ?? now;

      return {
        anonymous_id: anonymousId,
        session_id: sessionId,
        event_name: eventName,
        tool_name: toolName,
        properties: properties ?? undefined,
        user_agent: userAgent,
        locale,
        timezone,
        soft_fingerprint: softFingerprint,
        created_at: createdAt,
        received_at: now,
        updated_at: now,
        ip_hash: null,
      };
    })
    .filter((e): e is NonNullable<typeof e> => e !== null);

  if (!data.length) {
    return NextResponse.json(
      { error: "No valid events to store" },
      { status: 400 },
    );
  }

  try {
    await prisma.analyticsEvent.createMany({
      data,
    });

    return NextResponse.json(
      { stored: data.length },
      { status: 201 },
    );
  } catch (error) {
    const prismaError = error as { code?: string };
    if (prismaError.code === "P2021") {
      return NextResponse.json(
        {
          error:
            "Database table not found. Run: pnpm prisma:migrate (after setting DATABASE_URL)",
        },
        { status: 503 },
      );
    }

    console.error("[api/collect] Failed to store events", error);

    return NextResponse.json(
      { error: "Failed to store events" },
      { status: 500 },
    );
  }
}
