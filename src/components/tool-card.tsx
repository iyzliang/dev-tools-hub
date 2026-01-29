"use client";

import Link from "next/link";
import type { Tool } from "@/config/tools";
import { Card } from "@/components/ui/card";
import { trackEvent } from "@/lib/analytics";

interface ToolCardProps {
  tool: Tool;
}

export function ToolCard({ tool }: ToolCardProps) {
  const isPlaceholder = tool.href === "#";

  const content = (
    <>
      {/* 热门标签 */}
      {tool.isHot && (
        <span className="absolute right-3 top-3 inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700 animate-pulse">
          热门
        </span>
      )}

      {/* 图标 */}
      <div className="mb-3 text-slate-700">
        <tool.icon className="h-7 w-7 sm:h-8 sm:w-8" strokeWidth={1.5} />
      </div>

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
    </>
  );

  if (isPlaceholder) {
    return (
      <Card
        className="group relative flex h-full flex-col cursor-not-allowed opacity-60"
        aria-label={`${tool.name}（即将上线）`}
      >
        {content}
      </Card>
    );
  }

  function handleClick() {
    trackEvent(
      "tool_open",
      { tool_name: tool.id },
      { toolName: tool.id },
    );
  }

  return (
    <Link
      href={tool.href}
      className="block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
      aria-label={`打开 ${tool.name}`}
      onClick={handleClick}
    >
      <Card className="group relative flex h-full flex-col" interactive>
        {content}
      </Card>
    </Link>
  );
}

