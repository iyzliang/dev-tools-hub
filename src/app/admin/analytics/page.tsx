"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type SummaryBucket = {
  date: string;
  total: number;
  byTool: Record<string, number>;
  byEvent: Record<string, number>;
};

type SummaryResponse = {
  range: {
    preset: "24h" | "7d" | "30d";
    start: string;
    end: string;
  };
  data: {
    totals: {
      events: number;
    };
    buckets: SummaryBucket[];
  };
};

type ViewState = "checking" | "login" | "dashboard";
type RangePreset = "24h" | "7d" | "30d";

export const metadata = {
  title: "管理统计 - Dev Tools Hub",
  description: "仅供站点维护者使用的访问统计页面。",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const [view, setView] = useState<ViewState>("checking");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const [range, setRange] = useState<RangePreset>("7d");
  const [toolFilter, setToolFilter] = useState("");
  const [eventFilter, setEventFilter] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      try {
        const res = await fetch("/api/admin/session", {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
          if (!cancelled) {
            setView("login");
          }
          return;
        }

        const json = (await res.json()) as { authenticated?: boolean };

        if (!cancelled) {
          if (json.authenticated) {
            setView("dashboard");
          } else {
            setView("login");
          }
        }
      } catch {
        if (!cancelled) {
          setView("login");
        }
      }
    }

    checkSession();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (view !== "dashboard") return;

    let cancelled = false;

    async function loadSummary() {
      setIsLoadingSummary(true);
      setSummaryError(null);

      try {
        const params = new URLSearchParams();
        params.set("range", range);
        if (toolFilter.trim()) {
          params.set("tool_name", toolFilter.trim());
        }
        if (eventFilter.trim()) {
          params.set("event_name", eventFilter.trim());
        }

        const res = await fetch(`/api/events/summary?${params.toString()}`, {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
          const json = (await res.json().catch(() => null)) as
            | { error?: string }
            | null;
          throw new Error(json?.error || "加载统计数据失败");
        }

        const json = (await res.json()) as SummaryResponse;

        if (!cancelled) {
          setSummary(json);
        }
      } catch (error) {
        if (!cancelled) {
          const message =
            error instanceof Error ? error.message : "加载统计数据失败";
          setSummaryError(message);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingSummary(false);
        }
      }
    }

    loadSummary();

    return () => {
      cancelled = true;
    };
  }, [view, range, toolFilter, eventFilter]);

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();
    if (!password.trim()) {
      setLoginError("请输入管理密码。");
      return;
    }

    setIsLoggingIn(true);
    setLoginError(null);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const json = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(json?.error || "登录失败，请稍后重试。");
      }

      setView("dashboard");
      setPassword("");
      router.replace("/admin/analytics");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "登录失败，请稍后重试。";
      setLoginError(message);
    } finally {
      setIsLoggingIn(false);
    }
  }

  const totalEvents = summary?.data.totals.events ?? 0;
  const latestBucket = summary?.data.buckets.at(-1);
  const totalDays = summary?.data.buckets.length ?? 0;

  const maxDailyTotal = useMemo(() => {
    const buckets = summary?.data.buckets ?? [];
    if (!buckets.length) return 0;
    return buckets.reduce(
      (max, bucket) => (bucket.total > max ? bucket.total : max),
      0,
    );
  }, [summary]);

  if (view === "checking") {
    return (
      <div className="space-y-4">
        <header className="space-y-1">
          <p className="text-xs font-medium text-emerald-600">
            内部管理页面 · Admin Only
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            访问统计
          </h1>
        </header>

        <Card className="flex items-center justify-center border-dashed border-slate-200 py-12">
          <p className="text-xs text-slate-500">正在检查管理会话状态…</p>
        </Card>
      </div>
    );
  }

  if (view === "login") {
    return (
      <div className="space-y-6">
        <header className="space-y-1">
          <p className="text-xs font-medium text-emerald-600">
            内部管理页面 · Admin Only
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            访问统计登录
          </h1>
          <p className="max-w-2xl text-xs leading-relaxed text-slate-600">
            此页面仅供站点维护者使用，请输入管理密码继续。密码仅保存在服务器端环境变量中，不会在
            UI 中展示。
          </p>
        </header>

        <Card className="max-w-md space-y-4 border-slate-200 bg-white/70 px-4 py-5 shadow-sm sm:px-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="flex flex-col gap-1 text-xs text-slate-700">
                <span className="font-medium">管理密码</span>
                <Input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="请输入管理密码"
                  aria-label="管理密码"
                />
              </label>
              <p className="text-[11px] text-slate-500">
                密码校验失败不会暴露具体信息；连续多次失败可能会触发临时限制。
              </p>
            </div>

            {loginError && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {loginError}
              </div>
            )}

            <div className="flex items-center justify-between gap-3">
              <Button
                type="submit"
                size="sm"
                className="px-4"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? "登录中…" : "登录"}
              </Button>
              <p className="text-[11px] text-slate-400">
                请勿在公共环境泄露本页面地址。
              </p>
            </div>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-xs font-medium text-emerald-600">
          内部管理页面 · Admin Only
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          访问统计仪表盘
        </h1>
        <p className="max-w-2xl text-xs leading-relaxed text-slate-600">
          查看最近一段时间内的访问量与工具使用情况，用于评估 JSON
          工具等核心功能的真实使用频率。
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="space-y-2 px-4 py-3">
          <p className="text-xs text-slate-500">总事件数（当前时间范围）</p>
          <p className="text-2xl font-semibold text-slate-900">
            {isLoadingSummary ? "…" : totalEvents}
          </p>
        </Card>

        <Card className="space-y-2 px-4 py-3">
          <p className="text-xs text-slate-500">最近一天事件数</p>
          <p className="text-2xl font-semibold text-slate-900">
            {isLoadingSummary ? "…" : latestBucket?.total ?? 0}
          </p>
          <p className="text-[11px] text-slate-500">
            {latestBucket ? latestBucket.date : "暂无数据"}
          </p>
        </Card>

        <Card className="space-y-2 px-4 py-3">
          <p className="text-xs text-slate-500">统计天数</p>
          <p className="text-2xl font-semibold text-slate-900">
            {isLoadingSummary ? "…" : totalDays}
          </p>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-slate-900">
              事件趋势与明细
            </h2>
            <p className="text-[11px] text-slate-500">
              使用下方筛选条件查看不同时间范围、工具或事件类型的使用情况。
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
            <span className="text-slate-500">时间范围：</span>
            <div className="inline-flex rounded-md border border-slate-200 bg-slate-50 p-0.5">
              {(["24h", "7d", "30d"] as RangePreset[]).map((value) => (
                <Button
                  key={value}
                  type="button"
                  size="xs"
                  variant={range === value ? "primary" : "ghost"}
                  className="px-2 text-[11px]"
                  onClick={() => setRange(value)}
                >
                  {value === "24h" && "最近 24 小时"}
                  {value === "7d" && "最近 7 天"}
                  {value === "30d" && "最近 30 天"}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-md border border-slate-200 bg-slate-50/60 px-3 py-3 text-[11px] text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-500">筛选条件：</span>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
              时间：{range === "24h" ? "24 小时" : range === "7d" ? "7 天" : "30 天"}
            </span>
            {toolFilter.trim() && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px]">
                工具：{toolFilter.trim()}
              </span>
            )}
            {eventFilter.trim() && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px]">
                事件：{eventFilter.trim()}
              </span>
            )}
            {!toolFilter.trim() && !eventFilter.trim() && (
              <span className="text-[10px] text-slate-400">当前未设置额外过滤条件。</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              className="h-7 min-w-0 rounded-md border border-slate-200 bg-white px-2 text-[11px] text-slate-700 shadow-sm outline-none ring-0 transition duration-150 ease-out focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
              placeholder="按工具名称过滤，如 json-formatter"
              value={toolFilter}
              onChange={(event) => setToolFilter(event.target.value)}
              aria-label="按工具名称过滤"
            />
            <input
              className="h-7 min-w-0 rounded-md border border-slate-200 bg-white px-2 text-[11px] text-slate-700 shadow-sm outline-none ring-0 transition duration-150 ease-out focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
              placeholder="按事件类型过滤，如 json_format"
              value={eventFilter}
              onChange={(event) => setEventFilter(event.target.value)}
              aria-label="按事件类型过滤"
            />
            <Button
              type="button"
              size="xs"
              variant="secondary"
              onClick={() => {
                router.refresh();
              }}
            >
              刷新
            </Button>
          </div>
        </div>

        <Card className="space-y-3 border-slate-200 px-4 py-3">
          <p className="text-[11px] font-medium text-slate-600">
            每日事件数简易趋势图
          </p>

          <div className="h-40 w-full">
            {isLoadingSummary && (
              <div className="flex h-full items-center justify-center text-[11px] text-slate-500">
                正在加载统计数据…
              </div>
            )}

            {!isLoadingSummary &&
              (!summary?.data.buckets.length || !maxDailyTotal) && (
                <div className="flex h-full items-center justify-center text-[11px] text-slate-500">
                  暂无可展示的趋势数据。
                </div>
              )}

            {!isLoadingSummary &&
              summary?.data.buckets.length &&
              maxDailyTotal > 0 && (
                <svg
                  className="h-full w-full"
                  viewBox="0 0 100 40"
                  preserveAspectRatio="none"
                  aria-label="每日事件数趋势图"
                >
                  <defs>
                    <linearGradient
                      id="eventsLine"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#22c55e" stopOpacity="0.9" />
                      <stop
                        offset="100%"
                        stopColor="#22c55e"
                        stopOpacity="0.2"
                      />
                    </linearGradient>
                  </defs>

                  <polyline
                    fill="none"
                    stroke="url(#eventsLine)"
                    strokeWidth={1.5}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    points={summary.data.buckets
                      .map((bucket, index) => {
                        const x =
                          (summary.data.buckets.length === 1
                            ? 50
                            : (index / (summary.data.buckets.length - 1)) *
                              100);
                        const y = 35 - (bucket.total / maxDailyTotal) * 30;
                        return `${x},${y}`;
                      })
                      .join(" ")}
                  />

                  {summary.data.buckets.map((bucket, index) => {
                    const x =
                      (summary.data.buckets.length === 1
                        ? 50
                        : (index / (summary.data.buckets.length - 1)) * 100);
                    const y = 35 - (bucket.total / maxDailyTotal) * 30;

                    return (
                      <circle
                        key={bucket.date}
                        cx={x}
                        cy={y}
                        r={0.9}
                        fill="#16a34a"
                      />
                    );
                  })}
                </svg>
              )}
          </div>
        </Card>

        {summaryError && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {summaryError}
          </div>
        )}

        <Card className="overflow-x-auto border-slate-200">
          <table className="min-w-full border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-left text-[11px] text-slate-500">
                <th className="px-3 py-2 font-medium">日期</th>
                <th className="px-3 py-2 font-medium">总事件数</th>
                <th className="px-3 py-2 font-medium">按工具（Top 3）</th>
                <th className="px-3 py-2 font-medium">按事件类型（Top 3）</th>
              </tr>
            </thead>
            <tbody>
              {isLoadingSummary && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-3 py-6 text-center text-xs text-slate-500"
                  >
                    正在加载统计数据…
                  </td>
                </tr>
              )}

              {!isLoadingSummary &&
                summary?.data.buckets.map((bucket) => {
                  const sortedTools = Object.entries(bucket.byTool).sort(
                    (a, b) => b[1] - a[1],
                  );
                  const sortedEvents = Object.entries(bucket.byEvent).sort(
                    (a, b) => b[1] - a[1],
                  );

                  return (
                    <tr
                      key={bucket.date}
                      className="border-t border-slate-100 text-slate-700"
                    >
                      <td className="px-3 py-2 align-top text-xs">
                        <span className="font-mono text-[11px]">
                          {bucket.date}
                        </span>
                      </td>
                      <td className="px-3 py-2 align-top text-xs">
                        {bucket.total}
                      </td>
                      <td className="px-3 py-2 align-top text-[11px] text-slate-600">
                        {sortedTools.length === 0
                          ? "—"
                          : sortedTools
                              .slice(0, 3)
                              .map(([tool, count]) => `${tool}(${count})`)
                              .join(" · ")}
                      </td>
                      <td className="px-3 py-2 align-top text-[11px] text-slate-600">
                        {sortedEvents.length === 0
                          ? "—"
                          : sortedEvents
                              .slice(0, 3)
                              .map(([event, count]) => `${event}(${count})`)
                              .join(" · ")}
                      </td>
                    </tr>
                  );
                })}

              {!isLoadingSummary &&
                !summaryError &&
                (summary?.data.buckets.length ?? 0) === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-3 py-6 text-center text-xs text-slate-500"
                    >
                      暂无统计数据，待有埋点写入后再查看。
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
        </Card>

        <p className="text-[11px] text-slate-400">
          本页面为内部管理页面，未在导航中展示，并通过 robots 配置避免被搜索引擎收录。
        </p>
      </section>
    </div>
  );
}

