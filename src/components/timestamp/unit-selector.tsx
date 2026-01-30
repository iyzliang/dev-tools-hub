"use client";

import type { TimestampUnit } from "@/lib/timestamp-utils";

export interface UnitSelectorProps {
  /** Current selected unit */
  value: TimestampUnit;
  /** Callback when unit changes */
  onChange: (unit: TimestampUnit) => void;
  /** Whether the control is disabled */
  disabled?: boolean;
}

const UNIT_OPTIONS: { value: TimestampUnit; label: string; description: string }[] = [
  { value: "seconds", label: "秒", description: "10 位" },
  { value: "milliseconds", label: "毫秒", description: "13 位" },
];

export function UnitSelector({ value, onChange, disabled }: UnitSelectorProps) {
  return (
    <div className="space-y-2">
      <label
        className="text-xs font-medium text-slate-600"
        htmlFor="timestamp-unit-selector"
      >
        时间戳单位
      </label>
      <div
        id="timestamp-unit-selector"
        role="radiogroup"
        aria-label="选择时间戳单位"
        className="grid grid-cols-2 gap-2"
      >
        {UNIT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={value === opt.value}
            aria-label={`选择${opt.label}`}
            disabled={disabled}
            onClick={() => onChange(opt.value)}
            className={`cursor-pointer rounded-md border px-3 py-2 text-xs font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
              value === opt.value
                ? "border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-600 ring-offset-2"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <div className="flex flex-col items-center gap-1">
              <span className="font-semibold">{opt.label}</span>
              <span className="text-[10px] text-slate-500">
                ({opt.description})
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

UnitSelector.displayName = "UnitSelector";
