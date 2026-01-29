"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  BarChart3,
  Calendar,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Lock,
  Filter,
  Search,
} from "lucide-react";

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
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

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
          const json = (await res.json().catch(() => null)) as {
            error?: string;
          } | null;
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
        const json = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
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
  const previousBucket = summary?.data.buckets.at(-2);
  const totalDays = summary?.data.buckets.length ?? 0;

  // 计算趋势
  const trend = useMemo(() => {
    if (!latestBucket || !previousBucket) return 0;
    if (previousBucket.total === 0) return latestBucket.total > 0 ? 100 : 0;
    return Math.round(
      ((latestBucket.total - previousBucket.total) / previousBucket.total) * 100
    );
  }, [latestBucket, previousBucket]);

  const maxDailyTotal = useMemo(() => {
    const buckets = summary?.data.buckets ?? [];
    if (!buckets.length) return 0;
    return buckets.reduce(
      (max, bucket) => (bucket.total > max ? bucket.total : max),
      0
    );
  }, [summary]);

  // 计算平均值
  const avgDaily = useMemo(() => {
    const buckets = summary?.data.buckets ?? [];
    if (!buckets.length) return 0;
    return Math.round(totalEvents / buckets.length);
  }, [summary, totalEvents]);

  if (view === "checking") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center space-y-4">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
          <p className="text-sm text-slate-500">正在验证管理会话...</p>
        </div>
      </div>
    );
  }

  if (view === "login") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* 登录卡片 */}
          <Card className="relative overflow-hidden border-slate-200 bg-white shadow-xl">
            {/* 装饰性顶部条 */}
            <div className="h-1.5 bg-linear-to-r from-blue-600 via-indigo-600 to-violet-600" />

            <div className="p-6 sm:p-8">
              {/* 图标和标题 */}
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-br from-blue-100 to-indigo-100">
                  <Lock className="h-6 w-6 text-blue-600" />
                </div>
                <h1 className="text-xl font-semibold text-slate-900">
                  访问统计后台
                </h1>
                <p className="mt-1.5 text-sm text-slate-500">
                  请输入管理密码以继续
                </p>
              </div>

              {/* 登录表单 */}
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    管理密码
                  </label>
                  <Input
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="请输入管理密码"
                    aria-label="管理密码"
                    className="h-11"
                  />
                </div>

                {loginError && (
                  <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                    <svg
                      className="h-4 w-4 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {loginError}
                  </div>
                )}

                <Button
                  type="submit"
                  className="h-11 w-full"
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      验证中...
                    </>
                  ) : (
                    "登录"
                  )}
                </Button>
              </form>

              {/* 提示 */}
              <p className="mt-4 text-center text-xs text-slate-400">
                此页面仅供站点管理员使用
              </p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              内部管理
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            访问统计仪表盘
          </h1>
          <p className="text-sm text-slate-500">
            实时监控网站访问量与工具使用情况
          </p>
        </div>

        {/* 时间范围选择 */}
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
            {(["24h", "7d", "30d"] as RangePreset[]).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRange(value)}
                className={`cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-150 ${
                  range === value
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {value === "24h" && "24小时"}
                {value === "7d" && "7天"}
                {value === "30d" && "30天"}
              </button>
            ))}
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.refresh()}
            className="gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            刷新
          </Button>
        </div>
      </header>

      {/* 统计卡片 */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* 总事件数 */}
        <Card className="relative overflow-hidden border-slate-200 bg-white p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-500">总事件数</p>
              <p className="text-3xl font-bold text-slate-900">
                {isLoadingSummary ? (
                  <span className="inline-block h-9 w-20 animate-pulse rounded bg-slate-200" />
                ) : (
                  totalEvents.toLocaleString()
                )}
              </p>
              <p className="text-xs text-slate-400">
                {range === "24h"
                  ? "最近 24 小时"
                  : range === "7d"
                  ? "最近 7 天"
                  : "最近 30 天"}
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25">
              <BarChart3 className="h-5 w-5" />
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-blue-500/5" />
        </Card>

        {/* 最近一天 */}
        <Card className="relative overflow-hidden border-slate-200 bg-white p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-500">今日事件</p>
              <p className="text-3xl font-bold text-slate-900">
                {isLoadingSummary ? (
                  <span className="inline-block h-9 w-16 animate-pulse rounded bg-slate-200" />
                ) : (
                  (latestBucket?.total ?? 0).toLocaleString()
                )}
              </p>
              <div className="flex items-center gap-1.5">
                {trend > 0 ? (
                  <span className="flex items-center gap-0.5 text-xs font-medium text-emerald-600">
                    <TrendingUp className="h-3.5 w-3.5" />+{trend}%
                  </span>
                ) : trend < 0 ? (
                  <span className="flex items-center gap-0.5 text-xs font-medium text-red-600">
                    <TrendingDown className="h-3.5 w-3.5" />
                    {trend}%
                  </span>
                ) : (
                  <span className="flex items-center gap-0.5 text-xs font-medium text-slate-400">
                    <Minus className="h-3.5 w-3.5" />
                    0%
                  </span>
                )}
                <span className="text-xs text-slate-400">vs 昨日</span>
              </div>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25">
              <Activity className="h-5 w-5" />
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-emerald-500/5" />
        </Card>

        {/* 日均值 */}
        <Card className="relative overflow-hidden border-slate-200 bg-white p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-500">日均事件</p>
              <p className="text-3xl font-bold text-slate-900">
                {isLoadingSummary ? (
                  <span className="inline-block h-9 w-16 animate-pulse rounded bg-slate-200" />
                ) : (
                  avgDaily.toLocaleString()
                )}
              </p>
              <p className="text-xs text-slate-400">平均每日</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br from-violet-500 to-violet-600 text-white shadow-lg shadow-violet-500/25">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-violet-500/5" />
        </Card>

        {/* 统计天数 */}
        <Card className="relative overflow-hidden border-slate-200 bg-white p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-500">统计天数</p>
              <p className="text-3xl font-bold text-slate-900">
                {isLoadingSummary ? (
                  <span className="inline-block h-9 w-12 animate-pulse rounded bg-slate-200" />
                ) : (
                  totalDays
                )}
              </p>
              <p className="text-xs text-slate-400">有数据记录</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25">
              <Calendar className="h-5 w-5" />
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-amber-500/5" />
        </Card>
      </section>

      {/* 趋势图 */}
      <Card className="border-slate-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">事件趋势</h2>
            <p className="text-xs text-slate-500">每日事件数变化趋势</p>
          </div>
          {!isLoadingSummary && maxDailyTotal > 0 && (
            <div className="text-right">
              <p className="text-xs text-slate-500">峰值</p>
              <p className="text-sm font-semibold text-slate-900">
                {maxDailyTotal.toLocaleString()}
              </p>
            </div>
          )}
        </div>

        <div className="relative h-64">
          {isLoadingSummary && (
            <div className="flex h-full items-center justify-center">
              <div className="text-center space-y-2">
                <RefreshCw className="mx-auto h-6 w-6 animate-spin text-slate-400" />
                <p className="text-sm text-slate-500">加载中...</p>
              </div>
            </div>
          )}

          {!isLoadingSummary &&
            (!summary?.data.buckets.length || !maxDailyTotal) && (
              <div className="flex h-full items-center justify-center">
                <div className="text-center space-y-2">
                  <BarChart3 className="mx-auto h-10 w-10 text-slate-300" />
                  <p className="text-sm text-slate-500">暂无趋势数据</p>
                </div>
              </div>
            )}

          {!isLoadingSummary &&
            summary?.data.buckets.length &&
            maxDailyTotal > 0 && (
              <div className="relative h-full">
                {/* Y轴标签 */}
                <div className="absolute left-0 top-0 flex h-full w-10 flex-col justify-between py-2 text-right text-xs text-slate-400">
                  <span>{maxDailyTotal}</span>
                  <span>{Math.round(maxDailyTotal / 2)}</span>
                  <span>0</span>
                </div>

                {/* 图表区域 */}
                <div className="ml-12 h-full">
                  <svg
                    className="h-full w-full"
                    viewBox="0 0 100 50"
                    preserveAspectRatio="none"
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    <defs>
                      {/* 面积填充渐变 */}
                      <linearGradient
                        id="areaGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#3b82f6"
                          stopOpacity="0.3"
                        />
                        <stop
                          offset="100%"
                          stopColor="#3b82f6"
                          stopOpacity="0.02"
                        />
                      </linearGradient>
                      {/* 线条渐变 */}
                      <linearGradient
                        id="lineGradient"
                        x1="0"
                        y1="0"
                        x2="1"
                        y2="0"
                      >
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="50%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>

                    {/* 网格线 */}
                    <g className="text-slate-200">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <line
                          key={i}
                          x1="0"
                          y1={i * 12.5}
                          x2="100"
                          y2={i * 12.5}
                          stroke="currentColor"
                          strokeWidth="0.2"
                          strokeDasharray="2,2"
                        />
                      ))}
                    </g>

                    {/* 面积填充 */}
                    <path
                      fill="url(#areaGradient)"
                      d={`
                        M 0,50
                        ${summary.data.buckets
                          .map((bucket, index) => {
                            const x =
                              summary.data.buckets.length === 1
                                ? 50
                                : (index / (summary.data.buckets.length - 1)) *
                                  100;
                            const y = 50 - (bucket.total / maxDailyTotal) * 45;
                            return `L ${x},${y}`;
                          })
                          .join(" ")}
                        L 100,50
                        Z
                      `}
                    />

                    {/* 线条 */}
                    <polyline
                      fill="none"
                      stroke="url(#lineGradient)"
                      strokeWidth={0.8}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      points={summary.data.buckets
                        .map((bucket, index) => {
                          const x =
                            summary.data.buckets.length === 1
                              ? 50
                              : (index / (summary.data.buckets.length - 1)) *
                                100;
                          const y = 50 - (bucket.total / maxDailyTotal) * 45;
                          return `${x},${y}`;
                        })
                        .join(" ")}
                    />

                    {/* 数据点 */}
                    {summary.data.buckets.map((bucket, index) => {
                      const x =
                        summary.data.buckets.length === 1
                          ? 50
                          : (index / (summary.data.buckets.length - 1)) * 100;
                      const y = 50 - (bucket.total / maxDailyTotal) * 45;
                      const isHovered = hoveredIndex === index;

                      return (
                        <g key={bucket.date}>
                          {/* 悬停区域 */}
                          <rect
                            x={x - 5}
                            y={0}
                            width={10}
                            height={50}
                            fill="transparent"
                            className="cursor-pointer"
                            onMouseEnter={() => setHoveredIndex(index)}
                          />
                          {/* 悬停时的垂直线 */}
                          {isHovered && (
                            <line
                              x1={x}
                              y1={0}
                              x2={x}
                              y2={50}
                              stroke="#3b82f6"
                              strokeWidth="0.3"
                              strokeDasharray="1,1"
                            />
                          )}
                          {/* 数据点 */}
                          <circle
                            cx={x}
                            cy={y}
                            r={isHovered ? 1.5 : 0.8}
                            fill={isHovered ? "#3b82f6" : "#6366f1"}
                            className="transition-all duration-150"
                          />
                          {isHovered && (
                            <circle
                              cx={x}
                              cy={y}
                              r={2.5}
                              fill="none"
                              stroke="#3b82f6"
                              strokeWidth="0.3"
                              opacity="0.5"
                            />
                          )}
                        </g>
                      );
                    })}
                  </svg>

                  {/* 悬停提示 */}
                  {hoveredIndex !== null &&
                    summary.data.buckets[hoveredIndex] && (
                      <div
                        className="pointer-events-none absolute z-10 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg"
                        style={{
                          left: `${
                            (hoveredIndex / (summary.data.buckets.length - 1)) *
                            100
                          }%`,
                          top: "10%",
                          transform: "translateX(-50%)",
                        }}
                      >
                        <p className="text-xs font-medium text-slate-900">
                          {summary.data.buckets[
                            hoveredIndex
                          ].total.toLocaleString()}{" "}
                          事件
                        </p>
                        <p className="text-xs text-slate-500">
                          {summary.data.buckets[hoveredIndex].date}
                        </p>
                      </div>
                    )}
                </div>

                {/* X轴标签 */}
                <div className="ml-12 mt-2 flex justify-between text-xs text-slate-400">
                  {summary.data.buckets.length > 0 && (
                    <>
                      <span>{summary.data.buckets[0]?.date.slice(5)}</span>
                      {summary.data.buckets.length > 2 && (
                        <span>
                          {summary.data.buckets[
                            Math.floor(summary.data.buckets.length / 2)
                          ]?.date.slice(5)}
                        </span>
                      )}
                      <span>
                        {summary.data.buckets[
                          summary.data.buckets.length - 1
                        ]?.date.slice(5)}
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}
        </div>
      </Card>

      {/* 筛选和数据表格 */}
      <Card className="border-slate-200 bg-white">
        {/* 筛选栏 */}
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-700">数据筛选</span>
            {(toolFilter.trim() || eventFilter.trim()) && (
              <button
                onClick={() => {
                  setToolFilter("");
                  setEventFilter("");
                }}
                className="cursor-pointer rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 transition-colors hover:bg-slate-200"
              >
                清除筛选
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                className="h-8 w-40 rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-xs text-slate-700 shadow-sm outline-none transition duration-150 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                placeholder="工具名称"
                value={toolFilter}
                onChange={(event) => setToolFilter(event.target.value)}
                aria-label="按工具名称过滤"
              />
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                className="h-8 w-40 rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-xs text-slate-700 shadow-sm outline-none transition duration-150 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                placeholder="事件类型"
                value={eventFilter}
                onChange={(event) => setEventFilter(event.target.value)}
                aria-label="按事件类型过滤"
              />
            </div>
          </div>
        </div>

        {/* 错误提示 */}
        {summaryError && (
          <div className="mx-4 mt-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
            <svg
              className="h-4 w-4 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {summaryError}
          </div>
        )}

        {/* 数据表格 */}
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">
                  日期
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">
                  总事件数
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">
                  热门工具
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">
                  热门事件
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoadingSummary && (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center">
                    <RefreshCw className="mx-auto h-5 w-5 animate-spin text-slate-400" />
                    <p className="mt-2 text-sm text-slate-500">
                      加载统计数据中...
                    </p>
                  </td>
                </tr>
              )}

              {!isLoadingSummary &&
                summary?.data.buckets.map((bucket, index) => {
                  const sortedTools = Object.entries(bucket.byTool).sort(
                    (a, b) => b[1] - a[1]
                  );
                  const sortedEvents = Object.entries(bucket.byEvent).sort(
                    (a, b) => b[1] - a[1]
                  );
                  const isLatest =
                    index === (summary?.data.buckets.length ?? 0) - 1;

                  return (
                    <tr
                      key={bucket.date}
                      className={`transition-colors hover:bg-slate-50 ${
                        isLatest ? "bg-blue-50/30" : ""
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm text-slate-900">
                            {bucket.date}
                          </span>
                          {isLatest && (
                            <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-700">
                              今日
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-900">
                            {bucket.total.toLocaleString()}
                          </span>
                          {/* 迷你柱状图 */}
                          <div className="h-2 w-16 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-linear-to-r from-blue-500 to-indigo-500"
                              style={{
                                width: `${
                                  (bucket.total / maxDailyTotal) * 100
                                }%`,
                              }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {sortedTools.length === 0 ? (
                            <span className="text-xs text-slate-400">—</span>
                          ) : (
                            sortedTools.slice(0, 3).map(([tool, count]) => (
                              <span
                                key={tool}
                                className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs"
                              >
                                <span className="font-medium text-slate-700">
                                  {tool}
                                </span>
                                <span className="text-slate-500">
                                  ({count})
                                </span>
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {sortedEvents.length === 0 ? (
                            <span className="text-xs text-slate-400">—</span>
                          ) : (
                            sortedEvents.slice(0, 3).map(([event, count]) => (
                              <span
                                key={event}
                                className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs"
                              >
                                <span className="font-medium text-emerald-700">
                                  {event}
                                </span>
                                <span className="text-emerald-600">
                                  ({count})
                                </span>
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

              {!isLoadingSummary &&
                !summaryError &&
                (summary?.data.buckets.length ?? 0) === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center">
                      <BarChart3 className="mx-auto h-8 w-8 text-slate-300" />
                      <p className="mt-2 text-sm text-slate-500">
                        暂无统计数据
                      </p>
                      <p className="text-xs text-slate-400">
                        待有埋点写入后再查看
                      </p>
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 页脚提示 */}
      <p className="text-center text-xs text-slate-400">
        此页面为内部管理页面，未在导航中展示，并通过 robots
        配置避免被搜索引擎收录
      </p>
    </div>
  );
}
