"use client";

import { useCallback, useEffect, useState } from "react";
import { JsonEditor } from "@/components/json/json-editor";
import { JsonViewer } from "@/components/json/json-viewer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  formatJson,
  minifyJson,
  parseJsonWithLocation,
} from "@/lib/json-utils";

type Mode = "format" | "minify";

export default function JsonToolPage() {
  const [mode, setMode] = useState<Mode>("format");
  const [input, setInput] = useState<string>("{\n  \"hello\": \"world\"\n}");
  const [output, setOutput] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);

  const canRun = Boolean(input.trim());

  const handleRun = useCallback(() => {
    setCopyMessage(null);

    const trimmed = input.trim();
    if (!trimmed) {
      setError("请输入 JSON 内容后再执行。");
      setOutput("");
      return;
    }

    const parsed = parseJsonWithLocation(trimmed);

    if (!parsed.ok) {
      const { message, location } = parsed.error;
      if (location) {
        setError(
          `${message}（约在第 ${location.line} 行，第 ${location.column} 列）`,
        );
      } else {
        setError(message);
      }
      setOutput("");
      return;
    }

    try {
      const result =
        mode === "format" ? formatJson(trimmed) : minifyJson(trimmed);
      setOutput(result);
      setError(null);
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "解析 JSON 时发生未知错误。";
      setError(message);
      setOutput("");
    }
  }, [input, mode]);

  async function handleCopy() {
    setCopyMessage(null);
    if (!output) {
      setCopyMessage("暂无可复制的结果。");
      return;
    }
    try {
      await navigator.clipboard.writeText(output);
      setCopyMessage("已复制到剪贴板。");
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
    <div className="space-y-6">
      <section className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          JSON 格式化与压缩
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-slate-600">
          在左侧输入原始 JSON 文本，选择格式化或压缩模式后点击执行，结果会显示在右侧区域。
        </p>
      </section>

      <section className="space-y-3">
        <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <span className="font-medium">模式：</span>
              <div className="inline-flex rounded-md border border-slate-200 bg-slate-50 p-0.5">
                <Button
                  variant={mode === "format" ? "primary" : "ghost"}
                  size="sm"
                  className="px-3 text-xs"
                  onClick={() => setMode("format")}
                >
                  格式化
                </Button>
                <Button
                  variant={mode === "minify" ? "primary" : "ghost"}
                  size="sm"
                  className="px-3 text-xs"
                  onClick={() => setMode("minify")}
                >
                  压缩
                </Button>
              </div>
            </div>
            <p className="text-xs text-slate-500">
              支持快捷键 <span className="font-mono">Cmd/Ctrl + Enter</span>{" "}
              触发当前操作。
            </p>
          </div>

          <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
            <Button size="sm" onClick={handleRun} disabled={!canRun}>
              {mode === "format" ? "格式化 JSON" : "压缩 JSON"}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleCopy}
            >
              复制结果
            </Button>
          </div>
        </Card>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            <span className="font-medium">解析错误：</span>
            <span className="ml-1">{error}</span>
          </div>
        )}

        {copyMessage && (
          <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
            {copyMessage}
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium text-slate-700">原始 JSON</span>
          </div>
          <JsonEditor
            value={input}
            onChange={setInput}
            placeholder='在此粘贴或输入 JSON，例如：{"hello": "world"}'
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium text-slate-700">结果</span>
            <span className="text-[11px]">
              {mode === "format" ? "已格式化输出" : "已压缩输出"}
            </span>
          </div>
          <JsonViewer value={output} />
        </div>
      </section>
    </div>
  );
}

