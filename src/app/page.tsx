"use client";

import { useSearch } from "@/contexts/search-context";
import { ToolsGrid } from "@/components/tools-grid";

export default function Home() {
  const { searchQuery } = useSearch();

  return (
    <div className="space-y-8">
      <section className="group hero-animate space-y-3 rounded-xl border border-slate-200/80 bg-white/60 px-4 py-5 shadow-sm transition-all duration-300 ease-out hover:border-slate-300 hover:bg-white/80 hover:shadow-md sm:px-6 sm:py-6">
        <h1 className="bg-gradient-to-r from-blue-600 via-blue-500 to-emerald-600 bg-clip-text text-2xl font-semibold tracking-tight text-transparent sm:text-3xl">
          欢迎使用 Dev Tools Hub
        </h1>
        <p className="max-w-2xl border-l-2 border-slate-200 pl-3 text-sm leading-relaxed text-slate-600 transition-colors duration-200 group-hover:border-blue-400 group-hover:text-slate-700 sm:pl-4">
          这是一个为开发者打造的轻量在线工具集。首个版本专注于 JSON
          格式化与校验，后续将持续扩展更多常用调试工具。
        </p>
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
