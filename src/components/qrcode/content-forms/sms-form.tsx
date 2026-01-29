"use client";

import { type SmsConfig } from "@/lib/qrcode-content";

// ============================================================================
// Types
// ============================================================================

export interface SmsFormProps {
  /** Form data */
  value: SmsConfig;
  /** Callback when form data changes */
  onChange: (value: SmsConfig) => void;
  /** Disabled state */
  disabled?: boolean;
}

// ============================================================================
// Constants
// ============================================================================

const MAX_MESSAGE_LENGTH = 160;

// ============================================================================
// Component
// ============================================================================

/**
 * SMS form for QR code content
 */
export function SmsForm({ value, onChange, disabled = false }: SmsFormProps) {
  const messageLength = (value.message || "").length;
  const isNearLimit = messageLength > MAX_MESSAGE_LENGTH * 0.8;

  const handleChange = <K extends keyof SmsConfig>(
    key: K,
    newValue: SmsConfig[K]
  ) => {
    onChange({ ...value, [key]: newValue });
  };

  return (
    <div className="space-y-4">
      {/* Phone Number */}
      <div className="space-y-1.5">
        <label htmlFor="sms-number" className="text-xs font-medium text-slate-600">
          电话号码 <span className="text-red-500">*</span>
        </label>
        <input
          id="sms-number"
          type="tel"
          value={value.number}
          onChange={(e) => handleChange("number", e.target.value)}
          disabled={disabled}
          placeholder="+86 138 0000 0000"
          className={`w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
            disabled ? "cursor-not-allowed opacity-50" : ""
          }`}
        />
      </div>

      {/* Message */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="sms-message" className="text-xs font-medium text-slate-600">
            短信内容
          </label>
          <span
            className={`text-[11px] font-mono ${
              isNearLimit ? "text-amber-500" : "text-slate-400"
            }`}
          >
            {messageLength} / {MAX_MESSAGE_LENGTH}
          </span>
        </div>
        <textarea
          id="sms-message"
          value={value.message || ""}
          onChange={(e) => handleChange("message", e.target.value)}
          disabled={disabled}
          placeholder="输入短信内容（可选）"
          rows={3}
          className={`w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
            disabled ? "cursor-not-allowed opacity-50" : ""
          }`}
        />
      </div>

      {/* Info Box */}
      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3">
        <p className="text-[11px] text-slate-500">
          扫描此二维码将打开短信应用并填入收件人和内容
        </p>
      </div>
    </div>
  );
}

export default SmsForm;
