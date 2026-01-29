"use client";

import { useSearch } from "@/contexts/search-context";
import { ToolsGrid } from "@/components/tools-grid";

export default function Home() {
  const { searchQuery } = useSearch();

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="hero-animate relative overflow-hidden rounded-2xl border border-slate-200/50 bg-linear-to-br from-slate-50 via-white to-blue-50/30 px-6 py-8 shadow-lg sm:px-8 sm:py-10">
        {/* 装饰性背景光晕 */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-linear-to-br from-blue-400/20 via-cyan-300/15 to-transparent blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-linear-to-tr from-emerald-400/15 via-teal-300/10 to-transparent blur-3xl" />

        {/* 内容区域 */}
        <div className="relative z-10 space-y-4">
          {/* 标签 */}
          <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/60 bg-blue-50/80 px-3 py-1 text-xs font-medium text-blue-700 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
            </span>
            开发者工具集
          </div>

          {/* 标题 */}
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            <span className="bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent">
              欢迎使用{" "}
            </span>
            <span className="relative">
              <span className="bg-linear-to-r from-blue-600 via-indigo-500 to-violet-600 bg-clip-text text-transparent">
                Dev Tools Hub
              </span>
              <svg
                className="absolute -bottom-1 left-0 h-2 w-full text-blue-500/30"
                viewBox="0 0 100 8"
                preserveAspectRatio="none"
              >
                <path
                  d="M0 7 Q25 0 50 4 T100 2"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          {/* 描述 */}
          <p className="max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
            为开发者打造的
            <span className="mx-1 inline-block rounded-md bg-linear-to-r from-amber-100 to-orange-100 px-1.5 py-0.5 font-medium text-amber-700">
              轻量在线工具集
            </span>
            ，提供 JSON 处理、密码生成、二维码等实用功能，持续扩展中。
          </p>

          {/* 特性标签 */}
          <div className="flex flex-wrap gap-2 pt-2">
            {["快速响应", "无需登录", "隐私安全", "持续更新"].map((tag) => (
              <span
                key={tag}
                className="rounded-lg border border-slate-200/80 bg-white/60 px-2.5 py-1 text-xs font-medium text-slate-600 shadow-sm backdrop-blur-sm transition-colors hover:border-slate-300 hover:bg-white"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">
            可用工具
          </h2>
          {searchQuery && (
            <p className="text-xs text-slate-500">
              找到 {searchQuery ? "相关" : "所有"} 工具
            </p>
          )}
        </div>
        <ToolsGrid searchQuery={searchQuery} />
      </section>
    </div>
  );
}
