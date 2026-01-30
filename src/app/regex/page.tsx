"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  getMatchResults,
  replaceByRegex,
  explainRegex,
  buildRegex,
} from "@/lib/regex-utils";
import type { RegexFlagsInput, MatchResult, ExplainPart } from "@/lib/regex-utils";
import type { RegexPreset } from "@/lib/regex-utils";
import { trackEvent } from "@/lib/analytics";
import {
  RegexFlagsSelector,
  RegexInput,
  TestStringInput,
  MatchResultView,
  ReplaceResultView,
  ExplainResultView,
  RegexPresetSelector,
} from "@/components/regex";
import { Play } from "lucide-react";

const TOOL_NAME = "regex-tool";

export type RegexMode = "test" | "replace" | "explain";

const DEFAULT_FLAGS: RegexFlagsInput = { g: true };

export default function RegexPage() {
  const [mode, setMode] = useState<RegexMode>("test");
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState<RegexFlagsInput>(DEFAULT_FLAGS);
  const [testString, setTestString] = useState("");
  const [replaceString, setReplaceString] = useState("");
  const [matchResult, setMatchResult] = useState<MatchResult[] | null>(null);
  const [replaceResult, setReplaceResult] = useState<string>("");
  const [replaceCount, setReplaceCount] = useState<number | undefined>(undefined);
  const [explainParts, setExplainParts] = useState<ExplainPart[]>([]);
  const [error, setError] = useState<string | undefined>();
  const [copyToast, setCopyToast] = useState(false);

  const isPatternValid = pattern.trim().length > 0 && buildRegex(pattern) instanceof RegExp;
  const canRunTest =
    isPatternValid && (mode !== "explain" ? testString.length >= 0 : true);
  const canRunReplace = isPatternValid && testString.length >= 0;

  const runTest = useCallback(() => {
    setError(undefined);
    const result = getMatchResults(pattern, flags, testString);
    if (result.ok) {
      setMatchResult(result.matches);
      trackEvent(
        "regex_test",
        {
          has_match: result.matches.length > 0,
          match_count: result.matches.length,
          success: true,
        },
        { toolName: TOOL_NAME },
      );
    } else {
      setMatchResult(null);
      setError(result.error);
      trackEvent("regex_test", { success: false }, { toolName: TOOL_NAME });
    }
  }, [pattern, flags, testString]);

  const runReplace = useCallback(() => {
    setError(undefined);
    const result = replaceByRegex(
      pattern,
      flags,
      testString,
      replaceString,
    );
    if (result.ok) {
      setReplaceResult(result.result);
      setReplaceCount(result.replaceCount);
      trackEvent(
        "regex_replace",
        { replace_count: result.replaceCount, success: true },
        { toolName: TOOL_NAME },
      );
    } else {
      setReplaceResult("");
      setReplaceCount(undefined);
      setError(result.error);
      trackEvent("regex_replace", { success: false }, { toolName: TOOL_NAME });
    }
  }, [pattern, flags, testString, replaceString]);

  const runExplain = useCallback(() => {
    setError(undefined);
    const result = explainRegex(pattern, flags);
    if (result.ok) {
      setExplainParts(result.parts);
      trackEvent("regex_explain", { success: true }, { toolName: TOOL_NAME });
    } else {
      setExplainParts([]);
      setError(result.error);
      trackEvent("regex_explain", { success: false }, { toolName: TOOL_NAME });
    }
  }, [pattern, flags]);

  const handleRun = useCallback(() => {
    if (mode === "test") {
      runTest();
    } else if (mode === "replace") {
      runReplace();
    } else {
      runExplain();
    }
  }, [mode, runTest, runReplace, runExplain]);

  const handlePresetSelect = useCallback((preset: RegexPreset) => {
    setPattern(preset.pattern);
    if (preset.flags) setFlags((f) => ({ ...f, ...preset.flags }));
    trackEvent(
      "regex_preset_use",
      { preset_id: preset.id },
      { toolName: TOOL_NAME },
    );
  }, []);

  const handleCopy = useCallback(() => {
    setCopyToast(true);
    trackEvent(
      "regex_copy",
      {
        result_type:
          mode === "test"
            ? "match_list"
            : mode === "replace"
              ? "replace_result"
              : "explain",
      },
      { toolName: TOOL_NAME },
    );
    setTimeout(() => setCopyToast(false), 2000);
  }, [mode]);

  const handleModeChange = useCallback((m: RegexMode) => {
    if (m !== mode) {
      trackEvent(
        "regex_mode_switch",
        { from_mode: mode, to_mode: m },
        { toolName: TOOL_NAME },
      );
      setMode(m);
      setError(undefined);
    }
  }, [mode]);

  useEffect(() => {
    trackEvent("tool_open", { tool_name: TOOL_NAME }, { toolName: TOOL_NAME });
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const isCmdOrCtrl = event.metaKey || event.ctrlKey;
      if (!isCmdOrCtrl || event.key !== "Enter") return;
      event.preventDefault();
      if (mode === "explain" ? isPatternValid : canRunTest) handleRun();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mode, canRunTest, isPatternValid, handleRun]);

  const runDisabled =
    mode === "explain"
      ? !isPatternValid
      : mode === "replace"
        ? !canRunReplace
        : !canRunTest;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className="shrink-0 space-y-4 pb-4">
        <div className="space-y-1.5">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            正则表达式工具
          </h1>
          <p className="text-sm leading-relaxed text-slate-500">
            测试匹配、替换与解释正则，支持标志位与常用预设。快捷键{" "}
            <kbd className="inline-flex items-center rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-600">
              ⌘/Ctrl + Enter
            </kbd>
          </p>
        </div>
      </header>

      <section className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex min-h-0 flex-col">
          <div className="mb-2 flex shrink-0 items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            <span className="text-xs font-medium text-slate-700">配置与输入</span>
          </div>
          <div className="min-h-0 flex-1 rounded-lg border border-slate-200 bg-slate-50/50 p-4">
            <div className="flex h-full flex-col gap-4 overflow-y-auto">
              <div className="flex gap-2" role="radiogroup" aria-label="模式">
                {(
                  [
                    { value: "test" as const, label: "测试匹配" },
                    { value: "replace" as const, label: "替换" },
                    { value: "explain" as const, label: "解释" },
                  ] as const
                ).map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={mode === value}
                    aria-label={label}
                    onClick={() => handleModeChange(value)}
                    className={cn(
                      "rounded-md border px-3 py-2 text-sm font-medium transition-all",
                      mode === value
                        ? "border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-600 ring-offset-2"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <RegexPresetSelector onSelect={handlePresetSelect} />
              <RegexInput value={pattern} onChange={setPattern} />
              <RegexFlagsSelector value={flags} onChange={setFlags} />

              {(mode === "test" || mode === "replace") && (
                <>
                  <TestStringInput
                    value={testString}
                    onChange={setTestString}
                    placeholder={
                      mode === "replace"
                        ? "输入待替换的文本"
                        : "输入或粘贴待匹配的文本"
                    }
                  />
                  {mode === "replace" && (
                    <div className="space-y-1">
                      <label
                        className="text-xs font-medium text-slate-600"
                        htmlFor="replace-string"
                      >
                        替换字符串（支持 $1、$& 等）
                      </label>
                      <Input
                        id="replace-string"
                        type="text"
                        value={replaceString}
                        onChange={(e) => setReplaceString(e.target.value)}
                        placeholder="替换为…"
                        className="font-mono text-sm"
                      />
                    </div>
                  )}
                </>
              )}

              <div className="mt-auto pt-4">
                <Button
                  onClick={handleRun}
                  disabled={runDisabled}
                  className="w-full gap-2"
                  aria-label="执行"
                >
                  <Play className="h-4 w-4" />
                  执行
                </Button>
                <p className="mt-2 text-center text-[11px] text-slate-400">
                  快捷键：{" "}
                  <kbd className="inline-flex items-center rounded border border-slate-200 bg-slate-100 px-1 py-0.5 font-mono text-[10px] text-slate-600">
                    ⌘/Ctrl + Enter
                  </kbd>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex min-h-0 flex-col">
          <div className="mb-2 flex shrink-0 items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-medium text-slate-700">结果</span>
            {copyToast && (
              <span className="text-xs text-emerald-600">已复制</span>
            )}
          </div>
          <div className="min-h-0 flex-1 overflow-auto rounded-lg border border-slate-200 bg-white p-4">
            {mode === "test" && (
              <MatchResultView
                matches={matchResult ?? []}
                input={testString}
                error={error}
                onCopy={handleCopy}
              />
            )}
            {mode === "replace" && (
              <ReplaceResultView
                result={replaceResult}
                replaceCount={replaceCount}
                error={error}
                onCopy={handleCopy}
              />
            )}
            {mode === "explain" && (
              <ExplainResultView
                parts={explainParts}
                error={error}
              />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
