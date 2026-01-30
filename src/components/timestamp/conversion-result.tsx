"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { formatDateInTimezone, type TimezoneOption } from "@/lib/timestamp-utils";
import type { TimestampResult } from "@/lib/timestamp-utils";

export type TimestampResultMode = "to_date" | "to_timestamp";

export interface ConversionResultToDateProps {
  mode: "to_date";
  date: Date | null;
  timezones: TimezoneOption[];
  error?: string | null;
  onCopy?: (value: string, target: string) => void;
}

export interface ConversionResultToTimestampProps {
  mode: "to_timestamp";
  result: TimestampResult | null;
  error?: string | null;
  onCopy?: (value: string, target: "seconds" | "milliseconds") => void;
}

export type ConversionResultProps =
  | ConversionResultToDateProps
  | ConversionResultToTimestampProps;

function getTimezoneLabel(tz: TimezoneOption): string {
  if (tz === "local") return "本地";
  if (tz === "UTC") return "UTC";
  return tz;
}

function ResultRow({
  label,
  value,
  onCopy,
  copyTarget,
}: {
  label: string;
  value: string;
  onCopy?: (value: string, target: string) => void;
  copyTarget: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      onCopy?.(value, copyTarget);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  }, [value, copyTarget, onCopy]);

  return (
    <div className="flex items-center justify-between gap-2 rounded-md border border-slate-200 bg-white px-3 py-2">
      <div className="min-w-0 flex-1">
        <span className="text-[10px] font-medium text-slate-500">{label}</span>
        <p className="truncate font-mono text-sm text-slate-900" title={value}>
          {value}
        </p>
      </div>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={handleCopy}
        disabled={copied}
        className="shrink-0 gap-1.5"
        aria-label={`复制${label}`}
      >
        {copied ? "已复制" : "复制"}
      </Button>
    </div>
  );
}

export function ConversionResult(props: ConversionResultProps) {
  const error = "error" in props ? props.error : null;
  if (error) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed border-amber-200 bg-amber-50/50 p-4">
        <div className="text-center">
          <p className="text-sm font-medium text-amber-800" role="alert">
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (props.mode === "to_date") {
    const { date, timezones, onCopy } = props;
    if (!date) {
      return (
        <div className="flex h-full items-center justify-center border-2 border-dashed border-slate-200 bg-slate-50/50">
          <div className="text-center">
            <p className="text-sm text-slate-500">输入后点击转换</p>
          </div>
        </div>
      );
    }
    return (
      <div className="flex flex-col gap-2 overflow-y-auto">
        {timezones.map((tz) => (
          <ResultRow
            key={tz}
            label={getTimezoneLabel(tz)}
            value={formatDateInTimezone(date, tz)}
            onCopy={onCopy}
            copyTarget={`date_${tz}`}
          />
        ))}
      </div>
    );
  }

  if (props.mode === "to_timestamp") {
    const { result, onCopy } = props;
    if (!result) {
      return (
        <div className="flex h-full items-center justify-center border-2 border-dashed border-slate-200 bg-slate-50/50">
          <div className="text-center">
            <p className="text-sm text-slate-500">输入后点击转换</p>
          </div>
        </div>
      );
    }
    return (
      <div className="flex flex-col gap-2 overflow-y-auto">
        <ResultRow
          label="秒（10 位）"
          value={String(result.seconds)}
          onCopy={onCopy ? (v) => onCopy(v, "seconds") : undefined}
          copyTarget="seconds"
        />
        <ResultRow
          label="毫秒（13 位）"
          value={String(result.milliseconds)}
          onCopy={onCopy ? (v) => onCopy(v, "milliseconds") : undefined}
          copyTarget="milliseconds"
        />
      </div>
    );
  }

  return null;
}

ConversionResult.displayName = "ConversionResult";
