"use client";

import { ALL_GRID_PRESETS } from "@/lib/grid-presets";
import type { GridPreset } from "@/lib/grid-presets";
import { cn } from "@/lib/utils";

export interface GridPresetSelectorProps {
  onSelect: (preset: GridPreset) => void;
  disabled?: boolean;
  className?: string;
}

export function GridPresetSelector({
  onSelect,
  disabled = false,
  className,
}: GridPresetSelectorProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-xs font-medium text-slate-600">预设模板</label>
      <select
        className="w-full cursor-pointer rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
        disabled={disabled}
        aria-label="选择网格布局预设模板"
        defaultValue=""
        onChange={(e) => {
          const name = e.target.value;
          if (!name) return;
          const preset = ALL_GRID_PRESETS.find((p) => p.name === name);
          if (preset) onSelect(preset);
          e.target.value = "";
        }}
      >
        <option value="">选择预设模板…</option>
        {ALL_GRID_PRESETS.map((p) => (
          <option key={p.name} value={p.name} title={p.description}>
            {p.name} — {p.description}
          </option>
        ))}
      </select>
    </div>
  );
}