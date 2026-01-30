"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { EditorArea, PreviewPanel, Toolbar } from "@/components/markdown-editor";
import { trackEvent } from "@/lib/analytics";
import {
  exportMarkdownAsHtml,
  exportMarkdownAsFile,
  getPreviewHtmlForCopy,
} from "@/lib/markdown-export";
import type { EditorAreaHandle } from "@/components/markdown-editor";
import "@/app/markdown-editor.css";
import "highlight.js/styles/github.css";

const TOOL_NAME = "markdown-editor";

type MobileView = "edit" | "preview";

const DEFAULT_CONTENT = `# 欢迎使用 Markdown 编辑器

支持 **Vue 风格** 排版与 \`代码高亮\`。

## 代码块

\`\`\`js
const hello = "world";
console.log(hello);
\`\`\`

## 自定义容器

::: tip 提示
这是一条提示信息。
:::

::: warning 注意
这是一条警告。
:::
`;

export default function MarkdownEditorPage() {
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [mobileView, setMobileView] = useState<MobileView>("edit");
  const [toast, setToast] = useState<string | null>(null);
  const editorRef = useRef<EditorAreaHandle>(null);

  useEffect(() => {
    trackEvent(
      "tool_open",
      { tool_name: TOOL_NAME },
      { toolName: TOOL_NAME },
    );
  }, []);

  const showToast = useCallback((message: string) => {
    setToast(message);
    const t = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(t);
  }, []);

  const handleInsert = useCallback((text: string) => {
    editorRef.current?.insertAtCursor(text);
    trackEvent(
      "markdown_toolbar_insert",
      { tool_name: TOOL_NAME },
      { toolName: TOOL_NAME },
    );
  }, []);

  const handleWrapSelection = useCallback(
    (before: string, after: string) => {
      editorRef.current?.wrapSelection(before, after);
      trackEvent(
        "markdown_toolbar_insert",
        { tool_name: TOOL_NAME },
        { toolName: TOOL_NAME },
      );
    },
    [],
  );

  const handleExportHtml = useCallback(() => {
    const result = exportMarkdownAsHtml(content);
    if (!result.ok) {
      showToast("解析失败，无法导出");
      trackEvent(
        "markdown_export_html",
        { success: false, tool_name: TOOL_NAME },
        { toolName: TOOL_NAME },
      );
      return;
    }
    const url = URL.createObjectURL(result.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `markdown-export-${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("已导出 HTML");
    trackEvent(
      "markdown_export_html",
      { success: true, tool_name: TOOL_NAME },
      { toolName: TOOL_NAME },
    );
  }, [content, showToast]);

  const handleExportMd = useCallback(() => {
    const result = exportMarkdownAsFile(content);
    if (!result.ok) {
      showToast("导出失败");
      return;
    }
    const url = URL.createObjectURL(result.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `markdown-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("已导出 .md 文件");
    trackEvent(
      "markdown_export_md",
      { success: true, tool_name: TOOL_NAME },
      { toolName: TOOL_NAME },
    );
  }, [content, showToast]);

  const handleCopyHtml = useCallback(async () => {
    const result = getPreviewHtmlForCopy(content);
    if (!result.ok) {
      showToast("解析失败，无法复制");
      trackEvent(
        "markdown_copy_html",
        { success: false, tool_name: TOOL_NAME },
        { toolName: TOOL_NAME },
      );
      return;
    }
    try {
      await navigator.clipboard.writeText(result.html);
      showToast("已复制 HTML");
      trackEvent(
        "markdown_copy_html",
        { success: true, tool_name: TOOL_NAME },
        { toolName: TOOL_NAME },
      );
    } catch {
      showToast("复制失败，请检查浏览器权限");
      trackEvent(
        "markdown_copy_html",
        { success: false, tool_name: TOOL_NAME },
        { toolName: TOOL_NAME },
      );
    }
  }, [content, showToast]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        setMobileView((v) => (v === "edit" ? "preview" : "edit"));
      }
    },
    [],
  );

  return (
    <div className="flex flex-col gap-4" onKeyDown={handleKeyDown}>
      <header>
        <h1 className="text-xl font-semibold text-slate-900">
          Markdown 编辑器
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          支持 Vue 风格排版与代码高亮。快捷键：Cmd/Ctrl + Enter 切换编辑/预览（移动端）。
        </p>
      </header>

      {/* 移动端 Tab：编辑 | 预览 */}
      <div className="flex lg:hidden gap-2">
        <button
          type="button"
          onClick={() => setMobileView("edit")}
          className={`rounded-md px-3 py-2 text-sm font-medium ${
            mobileView === "edit"
              ? "bg-blue-600 text-white"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
          aria-label="编辑"
          aria-pressed={mobileView === "edit"}
        >
          编辑
        </button>
        <button
          type="button"
          onClick={() => setMobileView("preview")}
          className={`rounded-md px-3 py-2 text-sm font-medium ${
            mobileView === "preview"
              ? "bg-blue-600 text-white"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
          aria-label="预览"
          aria-pressed={mobileView === "preview"}
        >
          预览
        </button>
      </div>

      <div className="grid min-h-0 grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
        {/* 左侧：编辑区（桌面常显，移动端按 Tab 显隐） */}
        <div
          className={`flex min-h-[300px] flex-col gap-2 lg:min-w-0 ${mobileView === "preview" ? "hidden lg:flex" : ""}`}
        >
          <div className="min-h-[44px] overflow-x-auto overflow-y-hidden">
            <Toolbar
              onInsert={handleInsert}
              onWrapSelection={handleWrapSelection}
              onExportHtml={handleExportHtml}
              onExportMd={handleExportMd}
              onCopyHtml={handleCopyHtml}
              className="min-h-[44px]"
            />
          </div>
          <EditorArea
            ref={editorRef}
            value={content}
            onChange={setContent}
            placeholder="输入 Markdown…"
            minHeight="min-h-[400px]"
            className="w-full"
          />
        </div>

        {/* 右侧：预览区，桌面最小宽度避免过窄 */}
        <div
          className={`flex min-h-[300px] flex-col lg:min-w-[280px] ${mobileView === "edit" ? "hidden lg:flex" : ""}`}
        >
          <PreviewPanel
            markdown={content}
            minHeight="min-h-[400px]"
            className="w-full"
          />
        </div>
      </div>

      {toast != null && (
        <div
          className="fixed bottom-4 left-1/2 -translate-x-1/2 rounded-md bg-slate-800 px-4 py-2 text-sm text-white shadow-lg"
          role="status"
          aria-live="polite"
        >
          {toast}
        </div>
      )}
    </div>
  );
}
