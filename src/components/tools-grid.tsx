"use client";

import { useMemo } from "react";
import { ToolCard } from "./tool-card";
import { tools } from "@/config/tools";

interface ToolsGridProps {
  searchQuery?: string;
}

export function ToolsGrid({ searchQuery = "" }: ToolsGridProps) {
  const filteredTools = useMemo(() => {
    if (!searchQuery.trim()) {
      return tools;
    }

    const query = searchQuery.toLowerCase().trim();
    return tools.filter(
      (tool) =>
        tool.name.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {filteredTools.map((tool) => (
        <ToolCard key={tool.id} tool={tool} />
      ))}

      {/* "持续更新中" 占位卡片 */}
      <div className="group flex h-full flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50/50 p-6 text-center transition-colors duration-200 ease-out hover:border-slate-400 hover:bg-slate-50">
        <div className="mb-2 text-2xl opacity-50">✨</div>
        <p className="text-sm font-medium text-slate-600">持续更新中</p>
        <p className="mt-1 text-xs text-slate-400">敬请期待</p>
      </div>
    </div>
  );
}
