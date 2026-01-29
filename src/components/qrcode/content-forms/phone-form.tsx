"use client";

import { type PhoneConfig } from "@/lib/qrcode-content";

// ============================================================================
// Types
// ============================================================================

export interface PhoneFormProps {
  /** Form data */
  value: PhoneConfig;
  /** Callback when form data changes */
  onChange: (value: PhoneConfig) => void;
  /** Disabled state */
  disabled?: boolean;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Phone number form for QR code content
 */
export function PhoneForm({ value, onChange, disabled = false }: PhoneFormProps) {
  return (
    <div className="space-y-4">
      {/* Phone Number */}
      <div className="space-y-1.5">
        <label htmlFor="phone-number" className="text-xs font-medium text-slate-600">
          电话号码 <span className="text-red-500">*</span>
        </label>
        <input
          id="phone-number"
          type="tel"
          value={value.number}
          onChange={(e) => onChange({ number: e.target.value })}
          disabled={disabled}
          placeholder="+86 138 0000 0000"
          className={`w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
            disabled ? "cursor-not-allowed opacity-50" : ""
          }`}
        />
        <p className="text-[11px] text-slate-500">
          支持国际格式，例如：+86 138 0000 0000
        </p>
      </div>

      {/* Info Box */}
      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3">
        <p className="text-[11px] text-slate-500">
          扫描此二维码将打开拨号界面并填入电话号码
        </p>
      </div>
    </div>
  );
}

export default PhoneForm;
