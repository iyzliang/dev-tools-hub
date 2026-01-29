import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { JsonValue } from "@/lib/analytics";

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

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

function ensureString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function parseDate(value: unknown): Date | undefined {
  if (typeof value !== "string") return undefined;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return undefined;
  return d;
}

export async function POST(req: NextRequest) {
  let json: EventsRequestBody;

  try {
    json = (await req.json()) as EventsRequestBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  let incomingEvents: IncomingEvent[] = [];

  if (Array.isArray(json)) {
    incomingEvents = json;
  } else if (isRecord(json) && Array.isArray(json.events)) {
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
      const anonymousId = ensureString(event.anonymous_id);
      const sessionId = ensureString(event.session_id);
      const eventName = ensureString(event.event_name);

      if (!anonymousId || !sessionId || !eventName) {
        return null;
      }

      const toolName = ensureString(event.tool_name);
      const properties = sanitizeProperties(event.properties);
      const userAgent = ensureString(event.user_agent);
      const locale = ensureString(event.locale);
      const timezone = ensureString(event.timezone);
      const softFingerprint = ensureString(event.soft_fingerprint);
      const createdAt = parseDate(event.created_at) ?? now;

      return {
        anonymous_id: anonymousId,
        session_id: sessionId,
        event_name: eventName,
        tool_name: toolName ?? null,
        properties: properties ?? null,
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
    // 预留错误日志与后续监控集成
    console.error("[api/events] Failed to store events", error);

    return NextResponse.json(
      { error: "Failed to store events" },
      { status: 500 },
    );
  }
}

