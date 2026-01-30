"use client";

import { getRegexPresets } from "@/lib/regex-utils";
import type { RegexPreset } from "@/lib/regex-utils";
import { cn } from "@/lib/utils";

export interface RegexPresetSelectorProps {
  onSelect: (preset: RegexPreset) => void;
  disabled?: boolean;
  className?: string;
}

const presets = getRegexPresets();

export function RegexPresetSelector({
  onSelect,
  disabled = false,
  className,
}: RegexPresetSelectorProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-xs font-medium text-slate-600">
        常用预设
      </label>
      <select
        className="w-full cursor-pointer rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
        disabled={disabled}
        aria-label="选择常用正则预设"
        defaultValue=""
        onChange={(e) => {
          const id = e.target.value;
          if (!id) return;
          const preset = presets.find((p) => p.id === id);
          if (preset) onSelect(preset);
          e.target.value = "";
        }}
      >
        <option value="">选择预设插入正则…</option>
        {presets.map((p) => (
          <option key={p.id} value={p.id} title={p.description}>
            {p.name} — {p.description}
          </option>
        ))}
      </select>
    </div>
  );
}

RegexPresetSelector.displayName = "RegexPresetSelector";
