"use client";

import { useCallback, useMemo } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { parseDateString, getCurrentDateString } from "@/lib/timestamp-utils";

export interface DateStringInputProps {
  /** Input value (date string) */
  value: string;
  /** Callback when value changes */
  onChange: (value: string) => void;
  /** Callback when "current time" is clicked */
  onCurrentTime?: () => void;
  /** Placeholder */
  placeholder?: string;
  /** Whether disabled */
  disabled?: boolean;
  /** Whether to validate on change (show error) */
  validateOnChange?: boolean;
}

export function DateStringInput({
  value,
  onChange,
  onCurrentTime,
  placeholder = "如 2024-01-30T12:00:00 或 2024-01-30 12:00:00",
  disabled = false,
  validateOnChange = true,
}: DateStringInputProps) {
  const parseResult = useMemo(
    () => (value.trim() ? parseDateString(value) : null),
    [value],
  );
  const hasError =
    validateOnChange && value.trim() && parseResult && !parseResult.ok;
  const errorMessage = hasError && !parseResult?.ok ? parseResult.error : null;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value);
    },
    [onChange],
  );

  const handleClear = useCallback(() => {
    onChange("");
  }, [onChange]);

  const handleCurrentTime = useCallback(() => {
    onChange(getCurrentDateString());
    onCurrentTime?.();
  }, [onChange, onCurrentTime]);

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Textarea
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            disabled={disabled}
            hasError={!!hasError}
            className="min-h-[80px] resize-y pr-8 font-mono text-sm"
            aria-invalid={!!hasError}
            aria-describedby={hasError ? "date-input-error" : undefined}
            aria-label="日期时间输入"
            rows={3}
          />
          {value && (
            <button
              type="button"
              onClick={handleClear}
              disabled={disabled}
              className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
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
            className="shrink-0 self-start"
            aria-label="填入当前日期时间"
          >
            当前时间
          </Button>
        )}
      </div>
      {errorMessage && (
        <div
          id="date-input-error"
          className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-2 py-1.5 text-[10px] text-amber-800"
          role="alert"
        >
          {errorMessage}
        </div>
      )}
    </div>
  );
}

DateStringInput.displayName = "DateStringInput";
