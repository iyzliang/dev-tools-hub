"use client";

import type { TimezoneOption } from "@/lib/timestamp-utils";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface TimezoneSelectorProps {
  /** Current selected timezone */
  value: TimezoneOption;
  /** Callback when timezone changes */
  onChange: (tz: TimezoneOption) => void;
  /** Whether the control is disabled */
  disabled?: boolean;
  /** Label override */
  label?: string;
}

const PRESET_TIMEZONES: { value: TimezoneOption; label: string }[] = [
  { value: "local", label: "本地" },
  { value: "UTC", label: "UTC" },
  { value: "Asia/Shanghai", label: "Asia/Shanghai" },
  { value: "Asia/Tokyo", label: "Asia/Tokyo" },
  { value: "America/New_York", label: "America/New_York" },
  { value: "America/Los_Angeles", label: "America/Los_Angeles" },
  { value: "Europe/London", label: "Europe/London" },
  { value: "Europe/Paris", label: "Europe/Paris" },
];

function getTimezoneLabel(tz: TimezoneOption): string {
  if (tz === "local") return "本地";
  if (tz === "UTC") return "UTC";
  const found = PRESET_TIMEZONES.find((p) => p.value === tz);
  return found ? found.label : tz;
}

export function TimezoneSelector({
  value,
  onChange,
  disabled,
  label = "时区",
}: TimezoneSelectorProps) {
  const isCustom =
    value !== "local" &&
    value !== "UTC" &&
    !PRESET_TIMEZONES.some((p) => p.value === value);

  return (
    <div className="space-y-2">
      <label
        className="text-xs font-medium text-slate-600"
        htmlFor="timezone-selector"
      >
        {label}
      </label>
      <div className="flex flex-col gap-2">
        <div
          id="timezone-selector"
          role="listbox"
          aria-label="选择时区"
          className="flex flex-wrap gap-2"
        >
          {PRESET_TIMEZONES.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="option"
              aria-selected={value === opt.value}
              aria-label={`选择${opt.label}`}
              disabled={disabled}
              onClick={() => onChange(opt.value)}
              className={cn(
                "cursor-pointer rounded-md border px-2.5 py-1.5 text-xs font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50",
                value === opt.value
                  ? "border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-600 ring-offset-2"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Input
            id="timezone-custom"
            type="text"
            placeholder="或输入 IANA 时区，如 Asia/Shanghai"
            value={isCustom ? value : ""}
            onChange={(e) => {
              const v = e.target.value.trim();
              if (v) onChange(v as TimezoneOption);
            }}
            disabled={disabled}
            className="flex-1 font-mono text-xs"
            aria-label="自定义时区"
          />
        </div>
        {value && (
          <p className="text-[10px] text-slate-500" aria-live="polite">
            当前: {getTimezoneLabel(value)}
          </p>
        )}
      </div>
    </div>
  );
}

TimezoneSelector.displayName = "TimezoneSelector";
