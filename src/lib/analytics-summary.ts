export interface AnalyticsSummaryEvent {
  created_at: Date;
  tool_name: string | null;
  event_name: string;
}

export interface AnalyticsSummaryBucket {
  /**
   * 统计日期（UTC），格式为 YYYY-MM-DD
   */
  date: string;
  /**
   * 当天所有事件总数
   */
  total: number;
  /**
   * 按工具名称统计的事件数量
   */
  byTool: Record<string, number>;
  /**
   * 按事件名称统计的事件数量
   */
  byEvent: Record<string, number>;
}

export interface AnalyticsSummary {
  totals: {
    events: number;
  };
  buckets: AnalyticsSummaryBucket[];
}

/**
 * 将 Date 归一化为 UTC 日期字符串（YYYY-MM-DD）。
 */
function toUtcDateString(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * 根据原始事件列表聚合出按天、按工具、按事件的统计数据。
 *
 * 注意：聚合完全在内存中完成，适用于当前数据量较小的场景；
 * 若未来数据量增大，可改为使用数据库分组查询或预聚合表。
 */
export function aggregateAnalyticsEvents(
  events: AnalyticsSummaryEvent[],
): AnalyticsSummary {
  const bucketsMap = new Map<string, AnalyticsSummaryBucket>();

  for (const event of events) {
    const dateKey = toUtcDateString(event.created_at);

    let bucket = bucketsMap.get(dateKey);
    if (!bucket) {
      bucket = {
        date: dateKey,
        total: 0,
        byTool: {},
        byEvent: {},
      };
      bucketsMap.set(dateKey, bucket);
    }

    bucket.total += 1;

    const toolName = event.tool_name ?? "unknown";
    bucket.byTool[toolName] = (bucket.byTool[toolName] ?? 0) + 1;

    const eventName = event.event_name;
    bucket.byEvent[eventName] = (bucket.byEvent[eventName] ?? 0) + 1;
  }

  const buckets = Array.from(bucketsMap.values()).sort((a, b) =>
    a.date.localeCompare(b.date),
  );

  const totalEvents = events.length;

  return {
    totals: {
      events: totalEvents,
    },
    buckets,
  };
}

