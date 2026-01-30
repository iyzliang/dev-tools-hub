"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Syntax snippets to insert at cursor (or wrap selection). */
const INSERT_SNIPPETS = {
  h1: "# ",
  h2: "## ",
  h3: "### ",
  bold: "**",
  italic: "_",
  code: "`",
  link: "[链接文字](url)",
  image: "![描述](url)",
  blockquote: "> ",
  ul: "- ",
  ol: "1. ",
  codeBlock: "```\n\n```",
  table:
    "| 列1 | 列2 |\n| --- | --- |\n| 内容 | 内容 |",
  hr: "\n---\n",
} as const;

export interface ToolbarProps {
  /** Insert text at editor cursor. Called when a format button is clicked. */
  onInsert: (text: string) => void;
  /** Wrap current selection with before/after. Used for bold, italic, code. */
  onWrapSelection?: (before: string, after: string) => void;
  /** Export as HTML. Optional; when provided, show Export HTML button. */
  onExportHtml?: () => void;
  /** Export as .md file. Optional; when provided, show Export .md button. */
  onExportMd?: () => void;
  /** Copy preview HTML to clipboard. Optional; when provided, show Copy HTML button. */
  onCopyHtml?: () => void;
  className?: string;
}

/**
 * Toolbar for Markdown editor: format shortcuts (H1–H3, bold, code, list, table, etc.)
 * and export actions (HTML, .md). Parent provides onInsert (e.g. from EditorArea ref).
 */
export function Toolbar({
  onInsert,
  onWrapSelection,
  onExportHtml,
  onExportMd,
  onCopyHtml,
  className,
}: ToolbarProps) {
  const handleInsert = React.useCallback(
    (key: keyof typeof INSERT_SNIPPETS) => {
      onInsert(INSERT_SNIPPETS[key]);
    },
    [onInsert],
  );

  const handleWrap = React.useCallback(
    (before: string, after: string) => {
      if (onWrapSelection) {
        onWrapSelection(before, after);
      } else {
        onInsert(before + after);
      }
    },
    [onInsert, onWrapSelection],
  );

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-md border border-slate-200 bg-slate-50 p-2",
        className,
      )}
      role="toolbar"
      aria-label="Markdown 格式与导出"
    >
      <Button
        type="button"
        variant="secondary"
        size="xs"
        onClick={() => handleInsert("h1")}
        aria-label="一级标题"
      >
        H1
      </Button>
      <Button
        type="button"
        variant="secondary"
        size="xs"
        onClick={() => handleInsert("h2")}
        aria-label="二级标题"
      >
        H2
      </Button>
      <Button
        type="button"
        variant="secondary"
        size="xs"
        onClick={() => handleInsert("h3")}
        aria-label="三级标题"
      >
        H3
      </Button>
      <span className="mx-1 h-4 w-px bg-slate-200" aria-hidden />
      <Button
        type="button"
        variant="secondary"
        size="xs"
        onClick={() => handleWrap("**", "**")}
        aria-label="加粗"
      >
        B
      </Button>
      <Button
        type="button"
        variant="secondary"
        size="xs"
        onClick={() => handleWrap("_", "_")}
        aria-label="斜体"
      >
        I
      </Button>
      <Button
        type="button"
        variant="secondary"
        size="xs"
        onClick={() => handleWrap("`", "`")}
        aria-label="行内代码"
      >
        &lt;/&gt;
      </Button>
      <span className="mx-1 h-4 w-px bg-slate-200" aria-hidden />
      <Button
        type="button"
        variant="secondary"
        size="xs"
        onClick={() => handleInsert("link")}
        aria-label="插入链接"
      >
        链接
      </Button>
      <Button
        type="button"
        variant="secondary"
        size="xs"
        onClick={() => handleInsert("image")}
        aria-label="插入图片"
      >
        图片
      </Button>
      <Button
        type="button"
        variant="secondary"
        size="xs"
        onClick={() => handleInsert("blockquote")}
        aria-label="引用"
      >
        引用
      </Button>
      <Button
        type="button"
        variant="secondary"
        size="xs"
        onClick={() => handleInsert("ul")}
        aria-label="无序列表"
      >
        列表
      </Button>
      <Button
        type="button"
        variant="secondary"
        size="xs"
        onClick={() => handleInsert("ol")}
        aria-label="有序列表"
      >
        1.
      </Button>
      <Button
        type="button"
        variant="secondary"
        size="xs"
        onClick={() => handleInsert("codeBlock")}
        aria-label="代码块"
      >
        代码块
      </Button>
      <Button
        type="button"
        variant="secondary"
        size="xs"
        onClick={() => handleInsert("table")}
        aria-label="插入表格"
      >
        表格
      </Button>
      <Button
        type="button"
        variant="secondary"
        size="xs"
        onClick={() => handleInsert("hr")}
        aria-label="分割线"
      >
        —
      </Button>

      {(onExportHtml != null || onExportMd != null || onCopyHtml != null) && (
        <>
          <span className="mx-1 h-4 w-px bg-slate-200" aria-hidden />
          {onCopyHtml != null && (
            <Button
              type="button"
              variant="secondary"
              size="xs"
              onClick={onCopyHtml}
              aria-label="复制 HTML"
            >
              复制 HTML
            </Button>
          )}
          {onExportHtml != null && (
            <Button
              type="button"
              variant="secondary"
              size="xs"
              onClick={onExportHtml}
              aria-label="导出为 HTML"
            >
              导出 HTML
            </Button>
          )}
          {onExportMd != null && (
            <Button
              type="button"
              variant="secondary"
              size="xs"
              onClick={onExportMd}
              aria-label="导出为 Markdown 文件"
            >
              导出 .md
            </Button>
          )}
        </>
      )}
    </div>
  );
}

Toolbar.displayName = "Toolbar";
