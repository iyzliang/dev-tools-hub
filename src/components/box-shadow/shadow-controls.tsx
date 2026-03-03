"use client";

import type { ShadowParams } from "@/lib/shadow-utils";

interface ShadowControlsProps {
  params: ShadowParams;
  onChange: (params: ShadowParams) => void;
  onReset: () => void;
}

export function ShadowControls({ params, onChange, onReset }: ShadowControlsProps) {
  const handleChange = (key: keyof ShadowParams, value: number | boolean | string) => {
    onChange({ ...params, [key]: value });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-slate-700">X 偏移</label>
            <span className="text-xs text-slate-500">{params.x}px</span>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={params.x}
            onChange={(e) => handleChange("x", Number(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-slate-700">Y 偏移</label>
            <span className="text-xs text-slate-500">{params.y}px</span>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={params.y}
            onChange={(e) => handleChange("y", Number(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-slate-700">模糊半径</label>
            <span className="text-xs text-slate-500">{params.blur}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={params.blur}
            onChange={(e) => handleChange("blur", Number(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-slate-700">扩散半径</label>
            <span className="text-xs text-slate-500">{params.spread}px</span>
          </div>
          <input
            type="range"
            min="-50"
            max="50"
            value={params.spread}
            onChange={(e) => handleChange("spread", Number(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-slate-700">透明度</label>
            <span className="text-xs text-slate-500">{params.opacity.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={params.opacity}
            onChange={(e) => handleChange("opacity", Number(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200"
          />
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-medium text-slate-700">颜色</label>
          <input
            type="color"
            value={params.color.startsWith("#") ? params.color : "#000000"}
            onChange={(e) => handleChange("color", e.target.value)}
            className="h-8 w-16 cursor-pointer rounded border border-slate-200"
          />
          <input
            type="text"
            value={params.color}
            onChange={(e) => handleChange("color", e.target.value)}
            className="flex-1 rounded border border-slate-200 px-2 py-1 text-xs"
            placeholder="#000000"
          />
        </div>

        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={params.inset}
            onChange={(e) => handleChange("inset", e.target.checked)}
            className="h-4 w-4 rounded border-slate-300"
          />
          <span className="text-xs font-medium text-slate-700">内阴影 (inset)</span>
        </label>
      </div>

      <button
        onClick={onReset}
        className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
      >
        重置参数
      </button>
    </div>
  );
}