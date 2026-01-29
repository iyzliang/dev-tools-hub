"use client";

import { useCallback, useEffect, useState } from "react";
import { JsonEditor } from "@/components/json/json-editor";
import { JsonViewer } from "@/components/json/json-viewer";
import { Button } from "@/components/ui/button";
import { trackEvent, getInputSizeRange } from "@/lib/analytics";
import {
  formatJson,
  minifyJson,
  parseJsonWithLocation,
} from "@/lib/json-utils";
import {
  transformJsonString,
  getTransformTypeLabel,
  type KeyTransformType,
} from "@/lib/key-transform";

const JSON_TOOL_NAME = "json-formatter";

type Mode = "format" | "minify" | "keyTransform";

export default function JsonToolPage() {
  const [mode, setMode] = useState<Mode>("format");
  const [keyTransformType, setKeyTransformType] =
    useState<KeyTransformType>("snakeToCamel");
  const [input, setInput] = useState<string>('{\n  "hello": "world"\n}');
  const [output, setOutput] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);

  const canRun = Boolean(input.trim());

  // 工具页打开时上报 tool_open
  useEffect(() => {
    trackEvent(
      "tool_open",
      { tool_name: JSON_TOOL_NAME },
      { toolName: JSON_TOOL_NAME }
    );
  }, []);

  const handleRun = useCallback(() => {
    setCopyMessage(null);

    const trimmed = input.trim();
    if (!trimmed) {
      setError("请输入 JSON 内容后再执行。");
      setOutput("");
      return;
    }

    const parsed = parseJsonWithLocation(trimmed);
    const sizeRange = getInputSizeRange(trimmed.length);

    if (!parsed.ok) {
      const { message, location } = parsed.error;
      if (location) {
        setError(
          `${message}（约在第 ${location.line} 行，第 ${location.column} 列）`
        );
      } else {
        setError(message);
      }
      setOutput("");
      trackEvent(
        "json_error",
        { error_type: message, input_size_range: sizeRange },
        { toolName: JSON_TOOL_NAME }
      );
      return;
    }

    try {
      let result: string;
      if (mode === "format") {
        result = formatJson(trimmed);
        trackEvent(
          "json_format",
          { success: true, input_size_range: sizeRange },
          { toolName: JSON_TOOL_NAME }
        );
      } else if (mode === "minify") {
        result = minifyJson(trimmed);
        trackEvent(
          "json_minify",
          { success: true, input_size_range: sizeRange },
          { toolName: JSON_TOOL_NAME }
        );
      } else {
        result = transformJsonString(trimmed, keyTransformType);
        trackEvent(
          "json_key_transform",
          {
            success: true,
            transform_type: keyTransformType,
            input_size_range: sizeRange,
          },
          { toolName: JSON_TOOL_NAME }
        );
      }
      setOutput(result);
      setError(null);
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "解析 JSON 时发生未知错误。";
      setError(message);
      setOutput("");
      trackEvent(
        "json_error",
        { error_type: message, input_size_range: sizeRange },
        { toolName: JSON_TOOL_NAME }
      );
    }
  }, [input, mode, keyTransformType]);

  async function handleCopy() {
    setCopyMessage(null);
    if (!output) {
      setCopyMessage("暂无可复制的结果。");
      return;
    }
    try {
      await navigator.clipboard.writeText(output);
      setCopyMessage("已复制到剪贴板。");
      trackEvent("copy_result", {}, { toolName: JSON_TOOL_NAME });
    } catch {
      setCopyMessage("复制失败，请手动选择复制。");
    }
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const isCmdOrCtrl = event.metaKey || event.ctrlKey;
      if (!isCmdOrCtrl || event.key !== "Enter") return;

      event.preventDefault();
      if (canRun) {
        handleRun();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [canRun, handleRun]);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header Section - 固定高度 */}
      <header className="shrink-0 space-y-4 pb-4">
        {/* 标题区域 */}
        <div className="space-y-1.5">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            JSON 工具
          </h1>
          <p className="text-sm leading-relaxed text-slate-500">
            支持格式化、压缩与 Key 命名风格转换。快捷键{" "}
            <kbd className="inline-flex items-center rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-600">
              ⌘/Ctrl + Enter
            </kbd>
          </p>
        </div>

        {/* 工具栏 */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
          {/* 模式切换 */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-medium text-slate-500">模式</span>
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
              <button
                type="button"
                onClick={() => setMode("format")}
                className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-150 ${
                  mode === "format"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                格式化
              </button>
              <button
                type="button"
                onClick={() => setMode("minify")}
                className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-150 ${
                  mode === "minify"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                压缩
              </button>
              <button
                type="button"
                onClick={() => setMode("keyTransform")}
                className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-150 ${
                  mode === "keyTransform"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                Key 转换
              </button>
            </div>

            {/* Key 转换类型子选项 */}
            {mode === "keyTransform" && (
              <>
                <span className="text-xs font-medium text-slate-500">类型</span>
                <select
                  value={keyTransformType}
                  onChange={(e) =>
                    setKeyTransformType(e.target.value as KeyTransformType)
                  }
                  className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition-colors hover:border-slate-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="snakeToCamel">
                    {getTransformTypeLabel("snakeToCamel")}
                  </option>
                  <option value="camelToSnake">
                    {getTransformTypeLabel("camelToSnake")}
                  </option>
                  <option value="snakeToPascal">
                    {getTransformTypeLabel("snakeToPascal")}
                  </option>
                </select>
              </>
            )}
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleRun}
              disabled={!canRun}
              className="gap-1.5"
            >
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 3l14 9-14 9V3z"
                />
              </svg>
              {mode === "format"
                ? "格式化"
                : mode === "minify"
                ? "压缩"
                : "转换"}
            </Button>
            <Button size="sm" variant="secondary" onClick={handleCopy}>
              <svg
                className="mr-1.5 h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              复制
            </Button>
          </div>
        </div>

        {/* 消息提示 */}
        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
            <svg
              className="mt-0.5 h-4 w-4 shrink-0 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="text-xs text-red-700">
              <span className="font-medium">解析错误：</span>
              <span className="ml-1">{error}</span>
            </div>
          </div>
        )}

        {copyMessage && (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5">
            <svg
              className="h-4 w-4 shrink-0 text-emerald-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-xs text-emerald-700">{copyMessage}</span>
          </div>
        )}
      </header>

      {/* Editor Section - 填充剩余空间，内部滚动 */}
      <section className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-2">
        {/* 输入面板 */}
        <div className="flex min-h-0 flex-col">
          <div className="mb-2 flex shrink-0 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              <span className="text-xs font-medium text-slate-700">
                输入 JSON
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              {input.length.toLocaleString()} 字符
            </span>
          </div>
          <div className="min-h-0 flex-1">
            <JsonEditor
              value={input}
              onChange={setInput}
              placeholder='在此粘贴或输入 JSON，例如：{"hello": "world"}'
            />
          </div>
        </div>

        {/* 输出面板 */}
        <div className="flex min-h-0 flex-col">
          <div className="mb-2 flex shrink-0 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-medium text-slate-700">
                输出结果
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              {mode === "format"
                ? "格式化"
                : mode === "minify"
                ? "压缩"
                : getTransformTypeLabel(keyTransformType)}{" "}
              · {output.length.toLocaleString()} 字符
            </span>
          </div>
          <div className="min-h-0 flex-1">
            <JsonViewer value={output} />
          </div>
        </div>
      </section>
    </div>
  );
}
