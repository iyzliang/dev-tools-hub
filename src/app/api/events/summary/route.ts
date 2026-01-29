import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { aggregateAnalyticsEvents } from "@/lib/analytics-summary";
import { hasValidAdminSessionFromCookie } from "@/lib/admin-auth";

type RangePreset = "24h" | "7d" | "30d";

function parseRangePreset(value: string | null): RangePreset {
  if (value === "24h" || value === "30d") return value;
  return "7d";
}

function parseDateParam(value: string | null): Date | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return undefined;
  return d;
}

function computeDateRange(searchParams: URLSearchParams): {
  start: Date;
  end: Date;
  preset: RangePreset;
} {
  const now = new Date();
  const startParam = parseDateParam(searchParams.get("start"));
  const endParam = parseDateParam(searchParams.get("end"));

  if (startParam && endParam && startParam <= endParam) {
    return {
      start: startParam,
      end: endParam,
      preset: "7d",
    };
  }

  const preset = parseRangePreset(searchParams.get("range"));
  const end = now;
  const start = new Date(end);

  if (preset === "24h") {
    start.setUTCDate(end.getUTCDate());
    start.setUTCHours(end.getUTCHours() - 24, end.getUTCMinutes(), 0, 0);
  } else if (preset === "30d") {
    start.setUTCDate(end.getUTCDate() - 30);
  } else {
    start.setUTCDate(end.getUTCDate() - 7);
  }

  return { start, end, preset };
}

export async function GET(req: NextRequest) {
  const adminCookie = req.cookies.get("dth_admin_session")?.value;

  if (!hasValidAdminSessionFromCookie(adminCookie)) {
    return NextResponse.json(
      { error: "Admin session required" },
      { status: 401 },
    );
  }

  const url = new URL(req.url);
  const params = url.searchParams;

  const { start, end, preset } = computeDateRange(params);
  const toolName = params.get("tool_name") ?? undefined;
  const eventName = params.get("event_name") ?? undefined;

  try {
    const events = await prisma.analyticsEvent.findMany({
      where: {
        created_at: {
          gte: start,
          lte: end,
        },
        ...(toolName ? { tool_name: toolName } : {}),
        ...(eventName ? { event_name: eventName } : {}),
      },
      select: {
        created_at: true,
        tool_name: true,
        event_name: true,
      },
      orderBy: {
        created_at: "asc",
      },
    });

    const summary = aggregateAnalyticsEvents(events);

    return NextResponse.json({
      range: {
        preset,
        start: start.toISOString(),
        end: end.toISOString(),
      },
      filters: {
        tool_name: toolName ?? null,
        event_name: eventName ?? null,
      },
      data: summary,
    });
  } catch (error) {
    console.error("[api/events/summary] Failed to query analytics summary", error);

    return NextResponse.json(
      { error: "Failed to query analytics summary" },
      { status: 500 },
    );
  }
}

