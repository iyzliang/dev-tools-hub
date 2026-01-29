import Link from "next/link";
import type { Tool } from "@/config/tools";

interface ToolCardProps {
  tool: Tool;
}

export function ToolCard({ tool }: ToolCardProps) {
  const isPlaceholder = tool.href === "#";

  const cardContent = (
    <div className="group relative flex h-full flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 ease-out hover:border-slate-300 hover:shadow-md sm:p-5">
      {/* 热门标签 */}
      {tool.isHot && (
        <span className="absolute right-3 top-3 inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700 animate-pulse">
          热门
        </span>
      )}

      {/* 图标 */}
      <div className="mb-3 text-2xl sm:text-3xl">{tool.icon}</div>

      {/* 工具名称 */}
      <h3 className="mb-1.5 text-base font-semibold text-slate-900 sm:text-lg">
        {tool.name}
      </h3>

      {/* 描述 */}
      <p className="flex-1 text-xs leading-relaxed text-slate-600 sm:text-sm">
        {tool.description}
      </p>

      {/* 占位提示 */}
      {isPlaceholder && (
        <div className="mt-3 text-[10px] text-slate-400 sm:text-xs">
          即将上线
        </div>
      )}
    </div>
  );

  if (isPlaceholder) {
    return (
      <div className="cursor-not-allowed opacity-60" aria-label={`${tool.name}（即将上线）`}>
        {cardContent}
      </div>
    );
  }

  return (
    <Link
      href={tool.href}
      className="block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
      aria-label={`打开 ${tool.name}`}
    >
      {cardContent}
    </Link>
  );
}
