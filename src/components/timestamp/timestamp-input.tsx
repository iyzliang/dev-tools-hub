"use client";

import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  validateTimestampInput,
  getCurrentTimestamp,
  type TimestampUnit,
} from "@/lib/timestamp-utils";

export interface TimestampInputProps {
  /** Current unit (seconds or milliseconds) */
  unit: TimestampUnit;
  /** Input value */
  value: string;
  /** Callback when value changes */
  onChange: (value: string) => void;
  /** Callback when "current time" is clicked */
  onCurrentTime?: () => void;
  /** Placeholder */
  placeholder?: string;
  /** Whether disabled */
  disabled?: boolean;
}

export function TimestampInput({
  unit,
  value,
  onChange,
  onCurrentTime,
  placeholder = "输入时间戳",
  disabled = false,
}: TimestampInputProps) {
  const validation = value.trim()
    ? validateTimestampInput(value, unit)
    : null;
  const hasError = validation && !validation.valid;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      if (v !== "" && !/^-?\d*$/.test(v)) return;
      onChange(v);
    },
    [onChange],
  );

  const handleClear = useCallback(() => {
    onChange("");
  }, [onChange]);

  const handleCurrentTime = useCallback(() => {
    const { seconds, milliseconds } = getCurrentTimestamp();
    onChange(unit === "seconds" ? String(seconds) : String(milliseconds));
    onCurrentTime?.();
  }, [unit, onChange, onCurrentTime]);

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type="text"
            inputMode="numeric"
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            disabled={disabled}
            hasError={!!hasError}
            className="pr-8 font-mono"
            aria-invalid={!!hasError}
            aria-describedby={hasError ? "timestamp-input-error" : undefined}
            aria-label="时间戳输入"
          />
          {value && (
            <button
              type="button"
              onClick={handleClear}
              disabled={disabled}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="清除输入"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M8 12h8" />
              </svg>
            </button>
          )}
        </div>
        {onCurrentTime !== undefined && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleCurrentTime}
            disabled={disabled}
            className="shrink-0"
            aria-label="填入当前时间戳"
          >
            当前时间
          </Button>
        )}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-slate-500">
          {unit === "seconds" ? "10 位整数（秒）" : "13 位整数（毫秒）"}
        </span>
        {hasError && validation && !validation.valid && (
          <span
            id="timestamp-input-error"
            className="text-[10px] text-red-500"
            role="alert"
          >
            {validation.error}
          </span>
        )}
      </div>
    </div>
  );
}

TimestampInput.displayName = "TimestampInput";
