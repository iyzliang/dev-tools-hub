"use client";

import { type Base } from "@/lib/base-converter";

export interface BaseSelectorProps {
  /** Current selected base */
  value: Base;
  /** Callback when base changes */
  onChange: (base: Base) => void;
}

const BASE_OPTIONS: { value: Base; label: string; description: string }[] = [
  { value: "binary", label: "二进制", description: "0/1" },
  { value: "octal", label: "八进制", description: "0-7" },
  { value: "decimal", label: "十进制", description: "0-9" },
  {
    value: "hexadecimal",
    label: "十六进制",
    description: "0-9, a-f",
  },
];

export function BaseSelector({ value, onChange }: BaseSelectorProps) {
  return (
    <div className="space-y-2">
      <label
        className="text-xs font-medium text-slate-600"
        htmlFor="base-selector"
      >
        选择进制
      </label>
      <div className="grid grid-cols-2 gap-2" id="base-selector" role="radiogroup">
        {BASE_OPTIONS.map((base) => (
          <button
            key={base.value}
            type="button"
            role="radio"
            aria-checked={value === base.value}
            aria-label={`选择${base.label}`}
            onClick={() => onChange(base.value)}
            className={`cursor-pointer rounded-md border px-3 py-2 text-xs font-medium transition-all ${
              value === base.value
                ? "border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-600 ring-offset-2"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <div className="flex flex-col items-center gap-1">
              <span className="font-semibold">{base.label}</span>
              <span className="text-[10px] text-slate-500">
                ({base.description})
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default BaseSelector;
