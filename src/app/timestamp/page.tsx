"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  UnitSelector,
  TimezoneSelector,
  TimestampInput,
  DateStringInput,
  ConversionResult,
} from "@/components/timestamp";
import {
  timestampToDate,
  dateToTimestamp,
  parseDateStringInTimezone,
  validateTimestampInput,
  type TimestampUnit,
  type TimezoneOption,
} from "@/lib/timestamp-utils";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

type Mode = "to_date" | "to_timestamp";

const TOOL_NAME = "timestamp-converter";

const DEFAULT_TIMEZONE: TimezoneOption = "local";

export default function TimestampPage() {
  const [mode, setMode] = useState<Mode>("to_date");
  const [unit, setUnit] = useState<TimestampUnit>("seconds");
  const [timestampInput, setTimestampInput] = useState("");
  const [dateInput, setDateInput] = useState("");
  const [timezone, setTimezone] = useState<TimezoneOption>(DEFAULT_TIMEZONE);
  const [dateResult, setDateResult] = useState<Date | null>(null);
  const [timestampResult, setTimestampResult] = useState<{
    seconds: number;
    milliseconds: number;
  } | null>(null);
  const [convertError, setConvertError] = useState<string | null>(null);

  const timezonesToShow: TimezoneOption[] = useMemo(() => {
    const tzSet = new Set<TimezoneOption>(["local", "UTC", timezone]);
    return Array.from(tzSet);
  }, [timezone]);

  const handleConvert = useCallback(() => {
    setConvertError(null);
    if (mode === "to_date") {
      const validation = validateTimestampInput(timestampInput.trim(), unit);
      if (!validation.valid) {
        setConvertError(validation.error ?? "请输入有效时间戳");
        setDateResult(null);
        return;
      }
      const date = timestampToDate(validation.value, unit);
      if (!date) {
        setConvertError("时间戳超出可处理范围");
        setDateResult(null);
        return;
      }
      setDateResult(date);
      setTimestampResult(null);
      trackEvent(
        "timestamp_convert",
        {
          mode: "to_date",
          unit,
          timezone: timezone === "local" ? "local" : timezone,
          success: true,
        },
        { toolName: TOOL_NAME },
      );
    } else {
      const parsed = parseDateStringInTimezone(dateInput.trim(), timezone);
      if (!parsed.ok) {
        setConvertError(parsed.error);
        setTimestampResult(null);
        trackEvent(
          "timestamp_convert",
          {
            mode: "to_timestamp",
            timezone: timezone === "local" ? "local" : timezone,
            success: false,
          },
          { toolName: TOOL_NAME },
        );
        return;
      }
      const result = dateToTimestamp(parsed.value);
      if (!result) {
        setConvertError("无法转换为时间戳");
        setTimestampResult(null);
        return;
      }
      setTimestampResult(result);
      setDateResult(null);
      setConvertError(null);
      trackEvent(
        "timestamp_convert",
        {
          mode: "to_timestamp",
          timezone: timezone === "local" ? "local" : timezone,
          success: true,
        },
        { toolName: TOOL_NAME },
      );
    }
  }, [mode, unit, timestampInput, dateInput, timezone]);

  const handleCopy = useCallback(
    (value: string, target: string) => {
      trackEvent(
        "timestamp_copy",
        { copy_target: target },
        { toolName: TOOL_NAME },
      );
    },
    [],
  );

  const handleCurrentTimeTimestamp = useCallback(() => {
    trackEvent(
      "timestamp_current_time",
      { mode: "to_date" },
      { toolName: TOOL_NAME },
    );
  }, []);

  const handleCurrentTimeDate = useCallback(() => {
    trackEvent(
      "timestamp_current_time",
      { mode: "to_timestamp" },
      { toolName: TOOL_NAME },
    );
  }, []);

  const handleModeSwitch = useCallback((newMode: Mode) => {
    setMode((prev) => {
      if (prev !== newMode) {
        trackEvent(
          "timestamp_mode_switch",
          { from_mode: prev, to_mode: newMode },
          { toolName: TOOL_NAME },
        );
      }
      return newMode;
    });
    setConvertError(null);
  }, []);

  const canConvert =
    mode === "to_date"
      ? timestampInput.trim().length > 0 &&
        validateTimestampInput(timestampInput.trim(), unit).valid
      : dateInput.trim().length > 0;

  useEffect(() => {
    trackEvent(
      "tool_open",
      { tool_name: TOOL_NAME },
      { toolName: TOOL_NAME },
    );
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const isCmdOrCtrl = event.metaKey || event.ctrlKey;
      if (!isCmdOrCtrl || event.key !== "Enter") return;
      event.preventDefault();
      if (canConvert) handleConvert();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [canConvert, handleConvert]);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className="shrink-0 space-y-4 pb-4">
        <div className="space-y-1.5">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            时间戳转换
          </h1>
          <p className="text-sm leading-relaxed text-slate-500">
            时间戳与日期时间互转，支持秒/毫秒、多时区与复制。快捷键{" "}
            <kbd className="inline-flex items-center rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-600">
              ⌘/Ctrl + Enter
            </kbd>
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleModeSwitch("to_date")}
            aria-pressed={mode === "to_date"}
            className={cn(
              "rounded-md border px-3 py-2 text-sm font-medium transition-all",
              mode === "to_date"
                ? "border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-600 ring-offset-2"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50",
            )}
          >
            时间戳 → 日期时间
          </button>
          <button
            type="button"
            onClick={() => handleModeSwitch("to_timestamp")}
            aria-pressed={mode === "to_timestamp"}
            className={cn(
              "rounded-md border px-3 py-2 text-sm font-medium transition-all",
              mode === "to_timestamp"
                ? "border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-600 ring-offset-2"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50",
            )}
          >
            日期时间 → 时间戳
          </button>
        </div>
      </header>

      <section className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex min-h-0 flex-col">
          <div className="mb-2 flex shrink-0 items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            <span className="text-xs font-medium text-slate-700">输入配置</span>
          </div>
          <div className="min-h-0 flex-1 rounded-lg border border-slate-200 bg-slate-50/50 p-4">
            <div className="flex h-full flex-col gap-4 overflow-y-auto">
              {mode === "to_date" ? (
                <>
                  <UnitSelector value={unit} onChange={setUnit} />
                  <TimestampInput
                    unit={unit}
                    value={timestampInput}
                    onChange={setTimestampInput}
                    onCurrentTime={handleCurrentTimeTimestamp}
                    placeholder="输入时间戳"
                  />
                  <TimezoneSelector
                    value={timezone}
                    onChange={setTimezone}
                    label="结果时区"
                  />
                </>
              ) : (
                <>
                  <DateStringInput
                    value={dateInput}
                    onChange={setDateInput}
                    onCurrentTime={handleCurrentTimeDate}
                    placeholder="如 2024-01-30T12:00:00 或 2024-01-30 12:00:00"
                  />
                  <TimezoneSelector
                    value={timezone}
                    onChange={setTimezone}
                    label="输入日期所属时区"
                  />
                </>
              )}
              <div className="mt-auto pt-4">
                <Button
                  onClick={handleConvert}
                  disabled={!canConvert}
                  className="w-full gap-2"
                >
                  转换
                </Button>
                <p className="mt-2 text-center text-[11px] text-slate-400">
                  快捷键：
                  <kbd className="mx-1 inline-flex items-center rounded border border-slate-200 bg-slate-100 px-1 py-0.5 font-mono text-[10px] text-slate-600">
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
            <span className="text-xs font-medium text-slate-700">转换结果</span>
          </div>
          <div className="min-h-0 flex-1 rounded-lg border border-slate-200 bg-white p-4">
            {mode === "to_date" ? (
              <ConversionResult
                mode="to_date"
                date={dateResult}
                timezones={timezonesToShow}
                error={convertError}
                onCopy={handleCopy}
              />
            ) : (
              <ConversionResult
                mode="to_timestamp"
                result={timestampResult}
                error={convertError}
                onCopy={handleCopy}
              />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
