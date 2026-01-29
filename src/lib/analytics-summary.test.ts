import { describe, expect, it } from "vitest";
import {
  type AnalyticsSummaryEvent,
  aggregateAnalyticsEvents,
} from "./analytics-summary";

function makeEvent(
  createdAt: string,
  toolName: string | null,
  eventName: string,
): AnalyticsSummaryEvent {
  return {
    created_at: new Date(createdAt),
    tool_name: toolName,
    event_name: eventName,
  };
}

describe("aggregateAnalyticsEvents", () => {
  it("returns empty summary for no events", () => {
    const result = aggregateAnalyticsEvents([]);

    expect(result.totals.events).toBe(0);
    expect(result.buckets).toEqual([]);
  });

  it("aggregates events by UTC date, tool and event name", () => {
    const events: AnalyticsSummaryEvent[] = [
      makeEvent("2024-01-01T01:00:00.000Z", "json_formatter", "page_view"),
      makeEvent("2024-01-01T02:00:00.000Z", "json_formatter", "json_format"),
      makeEvent("2024-01-01T03:00:00.000Z", null, "json_format"),
      makeEvent("2024-01-02T00:30:00.000Z", "json_formatter", "page_view"),
      makeEvent("2024-01-02T10:00:00.000Z", "other_tool", "page_view"),
    ];

    const result = aggregateAnalyticsEvents(events);

    expect(result.totals.events).toBe(5);
    expect(result.buckets).toHaveLength(2);

    const firstDay = result.buckets[0];
    expect(firstDay.date).toBe("2024-01-01");
    expect(firstDay.total).toBe(3);
    expect(firstDay.byTool).toEqual({
      json_formatter: 2,
      unknown: 1,
    });
    expect(firstDay.byEvent).toEqual({
      page_view: 1,
      json_format: 2,
    });

    const secondDay = result.buckets[1];
    expect(secondDay.date).toBe("2024-01-02");
    expect(secondDay.total).toBe(2);
    expect(secondDay.byTool).toEqual({
      json_formatter: 1,
      other_tool: 1,
    });
    expect(secondDay.byEvent).toEqual({
      page_view: 2,
    });
  });
});

