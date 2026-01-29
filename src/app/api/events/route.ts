import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { JsonValue } from "@/lib/analytics";
import { ensureTrimmedString, isRecord, safeParseJsonBody } from "@/lib/api-security";

type IncomingEvent = {
  anonymous_id?: unknown;
  session_id?: unknown;
  event_name?: unknown;
  tool_name?: unknown;
  properties?: unknown;
  user_agent?: unknown;
  locale?: unknown;
  timezone?: unknown;
  soft_fingerprint?: unknown;
  created_at?: unknown;
};

type EventsRequestBody =
  | { events?: IncomingEvent[] }
  | IncomingEvent
  | IncomingEvent[];

function sanitizeProperties(value: unknown): Record<string, JsonValue> | undefined {
  if (!isRecord(value)) return undefined;

  const result: Record<string, JsonValue> = {};

  for (const [key, v] of Object.entries(value)) {
    if (typeof v === "string") {
      // 避免意外上传超大文本（例如完整 JSON 内容），对字符串做长度限制
      result[key] = v.length > 2000 ? (v.slice(0, 2000) as JsonValue) : v;
    } else if (
      typeof v === "number" ||
      typeof v === "boolean" ||
      v === null
    ) {
      result[key] = v;
    } else if (Array.isArray(v)) {
      // 递归处理数组，深度受限以避免过大嵌套
      result[key] = v.slice(0, 100) as JsonValue;
    } else if (isRecord(v)) {
      result[key] = sanitizeProperties(v) ?? {};
    }
  }

  return Object.keys(result).length ? result : undefined;
}

function parseDate(value: unknown): Date | undefined {
  if (typeof value !== "string") return undefined;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return undefined;
  return d;
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

  const json = safeParseJsonBody<EventsRequestBody>(rawBody);

  if (!json) {
    return NextResponse.json(
      { error: "Invalid request payload" },
      { status: 400 },
    );
  }

  let incomingEvents: IncomingEvent[] = [];

  if (Array.isArray(json)) {
    incomingEvents = json;
  } else if (isRecord(json) && "events" in json && Array.isArray(json.events)) {
    incomingEvents = json.events;
  } else if (isRecord(json)) {
    incomingEvents = [json as IncomingEvent];
  }

  if (!incomingEvents.length) {
    return NextResponse.json(
      { error: "No events provided" },
      { status: 400 },
    );
  }

  // 简单防护：单次请求事件数量过多直接拒绝
  if (incomingEvents.length > 100) {
    return NextResponse.json(
      { error: "Too many events in a single request" },
      { status: 429 },
    );
  }

  const now = new Date();

  const data = incomingEvents
    .map((event) => {
      const anonymousId = ensureTrimmedString(event.anonymous_id, 255);
      const sessionId = ensureTrimmedString(event.session_id, 255);
      const eventName = ensureTrimmedString(event.event_name, 255);

      if (!anonymousId || !sessionId || !eventName) {
        return null;
      }

      const toolName = ensureTrimmedString(event.tool_name, 255);
      const properties = sanitizeProperties(event.properties);
      const userAgent = ensureTrimmedString(event.user_agent, 512);
      const locale = ensureTrimmedString(event.locale, 32);
      const timezone = ensureTrimmedString(event.timezone, 64);
      const softFingerprint = ensureTrimmedString(event.soft_fingerprint, 64);
      const createdAt = parseDate(event.created_at) ?? now;

      return {
        anonymous_id: anonymousId,
        session_id: sessionId,
        event_name: eventName,
        tool_name: toolName ?? null,
        properties: properties ?? undefined,
        user_agent: userAgent ?? null,
        locale: locale ?? null,
        timezone: timezone ?? null,
        soft_fingerprint: softFingerprint ?? null,
        // 根据规范，created_at 为事件产生时间，received_at/updated_at 使用服务器当前时间
        created_at: createdAt,
        received_at: now,
        updated_at: now,
        // ip_hash 暂不启用，后续可基于请求 IP 做不可逆 hash
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

    console.error("[api/events] Failed to store events", error);

    return NextResponse.json(
      { error: "Failed to store events" },
      { status: 500 },
    );
  }
}

