"use client";

import type { GridConfig } from "@/lib/grid-utils";

interface GridControlsProps {
  config: GridConfig;
  onChange: (config: GridConfig) => void;
  onReset: () => void;
}

export function GridControls({ config, onChange, onReset }: GridControlsProps) {
  const handleChange = (key: keyof GridConfig, value: number) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-700">行数</label>
          <input
            type="number"
            min="1"
            max="12"
            value={config.rows}
            onChange={(e) => handleChange("rows", Math.min(12, Math.max(1, Number(e.target.value))))}
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-700">列数</label>
          <input
            type="number"
            min="1"
            max="12"
            value={config.cols}
            onChange={(e) => handleChange("cols", Math.min(12, Math.max(1, Number(e.target.value))))}
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-slate-700">行间距</label>
            <span className="text-xs text-slate-500">{config.rowGap}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={config.rowGap}
            onChange={(e) => handleChange("rowGap", Number(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-slate-700">列间距</label>
            <span className="text-xs text-slate-500">{config.colGap}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={config.colGap}
            onChange={(e) => handleChange("colGap", Number(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200"
          />
        </div>
      </div>

      <button
        onClick={onReset}
        className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
      >
        重置配置
      </button>
    </div>
  );
}