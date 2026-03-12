"use client";

import { useCallback } from "react";
import { toHex } from "@/lib/color-utils";
import type { RGBA } from "@/lib/color-utils";

export interface ColorPickerProps {
  /** Current color value */
  value: RGBA;
  /** Callback when color changes */
  onChange: (rgba: RGBA) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const handleColorChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const hex = e.target.value;
      // Parse hex to get r, g, b
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      onChange({ r, g, b, a: value.a });
    },
    [onChange, value.a]
  );

  const handleAlphaChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const alpha = parseFloat(e.target.value);
      onChange({ ...value, a: alpha / 100 });
    },
    [onChange, value]
  );

  const hexColor = toHex(value);
  const alphaPercent = Math.round(value.a * 100);

  return (
    <div className="space-y-3">
      {/* Color preview with checkerboard background for transparency */}
      <div className="flex items-center gap-3">
        <div
          className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-slate-200"
          style={{
            backgroundImage: `linear-gradient(45deg, #e5e7eb 25%, transparent 25%),
                              linear-gradient(-45deg, #e5e7eb 25%, transparent 25%),
                              linear-gradient(45deg, transparent 75%, #e5e7eb 75%),
                              linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)`,
            backgroundSize: "12px 12px",
            backgroundPosition: "0 0, 0 6px, 6px -6px, -6px 0px",
          }}
        >
          <div
            className="absolute inset-0"
            style={{ backgroundColor: `rgba(${value.r}, ${value.g}, ${value.b}, ${value.a})` }}
          />
        </div>

        {/* Native color picker */}
        <div className="flex-1">
          <input
            type="color"
            value={hexColor}
            onChange={handleColorChange}
            className="h-10 w-full cursor-pointer rounded-md border border-slate-200 p-1"
          />
        </div>
      </div>

      {/* Alpha slider */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-slate-600">透明度</label>
          <span className="text-xs text-slate-500">{alphaPercent}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={alphaPercent}
          onChange={handleAlphaChange}
          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200"
          style={{
            background: `linear-gradient(to right, transparent, ${hexColor})`,
          }}
        />
      </div>
    </div>
  );
}

export default ColorPicker;