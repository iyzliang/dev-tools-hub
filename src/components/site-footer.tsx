import Link from "next/link";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="app-footer" role="contentinfo">
      <div className="app-container py-6 sm:py-5">
        <div className="flex flex-col gap-4 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <div className="flex flex-col gap-1 text-xs text-slate-500">
            <span>© {year} Dev Tools Hub.</span>
            <span className="text-slate-400">
              在线开发者工具集 · JSON 工具优先上线
            </span>
            {/* 备案信息占位，上线时填入实际备案号 */}
            <span className="mt-1 text-[11px] text-slate-400">
              备案信息预留
            </span>
          </div>

          <nav
            className="flex flex-wrap items-center justify-center gap-4 sm:justify-end"
            aria-label="页脚链接"
          >
            <Link
              href="/"
              className="rounded px-1.5 py-0.5 text-xs text-slate-500 transition-colors duration-150 ease-out hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              aria-label="返回首页"
            >
              首页
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded px-1.5 py-0.5 text-xs text-slate-500 transition-colors duration-150 ease-out hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              aria-label="在 GitHub 上查看项目（新窗口）"
            >
              GitHub
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
