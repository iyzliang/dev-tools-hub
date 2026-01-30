"use client";

import * as React from "react";
import { parseMarkdown } from "@/lib/markdown-utils";
import { cn } from "@/lib/utils";

export interface PreviewPanelProps {
  /** Raw Markdown string to render */
  markdown: string;
  className?: string;
  /** Minimum height (e.g. min-h-[400px]) */
  minHeight?: string;
}

/**
 * Renders Markdown as HTML with Vue-style layout and code highlighting.
 * Uses parseMarkdown (GFM + Vue containers + highlightCode). Apply .md-vue and highlight.js styles in app.
 */
export function PreviewPanel({
  markdown,
  className,
  minHeight = "min-h-[400px]",
}: PreviewPanelProps) {
  const result = React.useMemo(() => parseMarkdown(markdown), [markdown]);

  if (!result.ok) {
    return (
      <div
        className={cn(
          "rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700",
          minHeight,
          className,
        )}
        role="alert"
      >
        <p>解析失败：{result.error.message}</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "md-vue overflow-auto rounded-md border border-slate-200 bg-white p-4 text-slate-700",
        minHeight,
        className,
      )}
      aria-label="Markdown 预览"
    >
      {result.html.trim().length === 0 ? (
        <p className="text-slate-400">暂无内容，输入 Markdown 后即可预览。</p>
      ) : (
        <div
          className="max-w-none"
          dangerouslySetInnerHTML={{ __html: result.html }}
        />
      )}
    </div>
  );
}

PreviewPanel.displayName = "PreviewPanel";
