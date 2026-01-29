"use client";

import { type QRCodeOptions, type ErrorCorrectionLevel, ERROR_CORRECTION_LABELS } from "@/lib/qrcode-generator";

// ============================================================================
// Types
// ============================================================================

export interface StyleConfigProps {
  /** Current style options */
  value: QRCodeOptions;
  /** Callback when options change */
  onChange: (options: QRCodeOptions) => void;
  /** Disabled state */
  disabled?: boolean;
}

// ============================================================================
// Constants
// ============================================================================

/** Preset sizes */
const SIZE_PRESETS = [128, 256, 512, 1024];

/** Error correction levels */
const ERROR_CORRECTION_LEVELS: ErrorCorrectionLevel[] = ["L", "M", "Q", "H"];

/** Color presets */
const COLOR_PRESETS: { name: string; fg: string; bg: string }[] = [
  { name: "经典黑白", fg: "#000000", bg: "#FFFFFF" },
  { name: "蓝白", fg: "#1D4ED8", bg: "#FFFFFF" },
  { name: "绿白", fg: "#059669", bg: "#FFFFFF" },
  { name: "紫白", fg: "#7C3AED", bg: "#FFFFFF" },
  { name: "红白", fg: "#DC2626", bg: "#FFFFFF" },
  { name: "深色", fg: "#FFFFFF", bg: "#1F2937" },
];

// ============================================================================
// Sub-components
// ============================================================================

interface SizeSelectorProps {
  value: number;
  onChange: (size: number) => void;
  disabled?: boolean;
}

function SizeSelector({ value, onChange, disabled }: SizeSelectorProps) {
  const isCustom = !SIZE_PRESETS.includes(value);

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-slate-600">尺寸</label>
      <div className="flex flex-wrap gap-2">
        {SIZE_PRESETS.map((size) => (
          <button
            key={size}
            type="button"
            onClick={() => onChange(size)}
            disabled={disabled}
            className={`cursor-pointer rounded-md border px-3 py-1.5 text-xs font-medium transition-all ${
              value === size
                ? "border-blue-600 bg-blue-50 text-blue-700"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
            } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
          >
            {size}px
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-slate-500">自定义:</span>
        <input
          type="number"
          min={64}
          max={2048}
          value={isCustom ? value : ""}
          onChange={(e) => {
            const size = parseInt(e.target.value, 10);
            if (!isNaN(size) && size >= 64 && size <= 2048) {
              onChange(size);
            }
          }}
          disabled={disabled}
          placeholder="64-2048"
          className={`w-24 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
            disabled ? "cursor-not-allowed opacity-50" : ""
          }`}
        />
        <span className="text-[11px] text-slate-400">px</span>
      </div>
    </div>
  );
}

interface ErrorCorrectionSelectorProps {
  value: ErrorCorrectionLevel;
  onChange: (level: ErrorCorrectionLevel) => void;
  disabled?: boolean;
}

function ErrorCorrectionSelector({
  value,
  onChange,
  disabled,
}: ErrorCorrectionSelectorProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1">
        <label className="text-xs font-medium text-slate-600">纠错级别</label>
        <span
          className="cursor-help text-slate-400"
          title="纠错级别越高，二维码越复杂，但即使部分损坏也能被识别"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {ERROR_CORRECTION_LEVELS.map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => onChange(level)}
            disabled={disabled}
            className={`cursor-pointer rounded-md border px-2 py-2 text-center transition-all ${
              value === level
                ? "border-blue-600 bg-blue-50 text-blue-700"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
            } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
          >
            <div className="text-sm font-medium">{level}</div>
            <div className="text-[10px] text-slate-500">
              {ERROR_CORRECTION_LABELS[level]}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  disabled?: boolean;
}

function ColorPicker({ label, value, onChange, disabled }: ColorPickerProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-slate-600">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`h-8 w-8 cursor-pointer rounded border border-slate-200 ${
            disabled ? "cursor-not-allowed opacity-50" : ""
          }`}
        />
        <input
          type="text"
          value={value.toUpperCase()}
          onChange={(e) => {
            const color = e.target.value;
            if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
              onChange(color);
            }
          }}
          disabled={disabled}
          placeholder="#000000"
          className={`w-24 rounded-md border border-slate-200 bg-white px-2 py-1.5 font-mono text-xs text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
            disabled ? "cursor-not-allowed opacity-50" : ""
          }`}
        />
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * Style configuration panel for QR code generation
 */
export function StyleConfig({ value, onChange, disabled = false }: StyleConfigProps) {
  const handleChange = <K extends keyof QRCodeOptions>(
    key: K,
    newValue: QRCodeOptions[K]
  ) => {
    onChange({ ...value, [key]: newValue });
  };

  const applyColorPreset = (fg: string, bg: string) => {
    onChange({ ...value, foregroundColor: fg, backgroundColor: bg });
  };

  return (
    <div className="space-y-4">
      {/* Size */}
      <SizeSelector
        value={value.size || 256}
        onChange={(size) => handleChange("size", size)}
        disabled={disabled}
      />

      {/* Error Correction Level */}
      <ErrorCorrectionSelector
        value={value.errorCorrectionLevel || "M"}
        onChange={(level) => handleChange("errorCorrectionLevel", level)}
        disabled={disabled}
      />

      {/* Colors */}
      <div className="space-y-3 border-t border-slate-200 pt-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-600">颜色设置</span>
        </div>

        {/* Color Presets */}
        <div className="flex flex-wrap gap-2">
          {COLOR_PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => applyColorPreset(preset.fg, preset.bg)}
              disabled={disabled}
              className={`flex cursor-pointer items-center gap-1.5 rounded-md border px-2 py-1 transition-all ${
                value.foregroundColor === preset.fg && value.backgroundColor === preset.bg
                  ? "border-blue-600 bg-blue-50"
                  : "border-slate-200 hover:border-slate-300"
              } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
              title={preset.name}
            >
              <span
                className="h-3 w-3 rounded-sm border border-slate-300"
                style={{ backgroundColor: preset.bg }}
              >
                <span
                  className="block h-full w-full rounded-sm"
                  style={{
                    backgroundColor: preset.fg,
                    clipPath: "polygon(0 0, 100% 0, 100% 100%)",
                  }}
                />
              </span>
              <span className="text-[10px] text-slate-600">{preset.name}</span>
            </button>
          ))}
        </div>

        {/* Custom Colors */}
        <div className="grid grid-cols-2 gap-3">
          <ColorPicker
            label="前景色"
            value={value.foregroundColor || "#000000"}
            onChange={(color) => handleChange("foregroundColor", color)}
            disabled={disabled}
          />
          <ColorPicker
            label="背景色"
            value={value.backgroundColor || "#FFFFFF"}
            onChange={(color) => handleChange("backgroundColor", color)}
            disabled={disabled}
          />
        </div>
      </div>

      {/* Margin */}
      <div className="border-t border-slate-200 pt-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-slate-600">边距</label>
            <span className="text-xs font-mono text-slate-500">
              {value.margin ?? 4} 模块
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={10}
            value={value.margin ?? 4}
            onChange={(e) => handleChange("margin", Number(e.target.value))}
            disabled={disabled}
            className={`h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-blue-600 ${
              disabled ? "cursor-not-allowed opacity-50" : ""
            }`}
          />
          <p className="text-[11px] text-slate-500">
            边距越大，扫描成功率越高
          </p>
        </div>
      </div>
    </div>
  );
}

export default StyleConfig;
