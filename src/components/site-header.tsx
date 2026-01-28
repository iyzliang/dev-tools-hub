import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="app-header">
      <div className="app-container flex h-14 items-center justify-between sm:h-16">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 rounded-md px-1 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/10 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          aria-label="返回 Dev Tools Hub 首页"
        >
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-slate-900 text-xs font-semibold text-white transition-transform duration-150 ease-out group-hover:scale-105 group-active:scale-95">
            D
          </span>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight text-slate-900">
              Dev Tools Hub
            </span>
            <span className="hidden text-xs text-slate-500 sm:inline">
              面向开发者的轻量工具集
            </span>
          </div>
        </Link>

        {/* 桌面端搜索框 */}
        <div className="hidden w-64 max-w-xs sm:block">
          <label className="group flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-400 shadow-sm transition duration-150 ease-out focus-within:border-slate-300 focus-within:text-slate-500 focus-within:shadow-md">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-300 transition group-focus-within:bg-slate-400" />
            <input
              type="search"
              placeholder="搜索工具名称或描述…"
              className="w-full border-0 bg-transparent text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none"
              aria-label="搜索工具"
            />
            <span className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-slate-400">
              ⌘K
            </span>
          </label>
        </div>

        {/* 移动端搜索入口占位：后续可扩展为实际搜索面板 */}
        <button
          type="button"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-[11px] font-medium text-slate-500 shadow-sm transition-colors duration-150 ease-out hover:bg-slate-50 active:bg-slate-100 sm:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/10 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          aria-label="打开搜索"
        >
          搜
        </button>
      </div>
    </header>
  );
}

