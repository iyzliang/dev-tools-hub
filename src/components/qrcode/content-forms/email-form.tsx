"use client";

import { type EmailConfig } from "@/lib/qrcode-content";

// ============================================================================
// Types
// ============================================================================

export interface EmailFormProps {
  /** Form data */
  value: EmailConfig;
  /** Callback when form data changes */
  onChange: (value: EmailConfig) => void;
  /** Disabled state */
  disabled?: boolean;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Email form for QR code content
 */
export function EmailForm({ value, onChange, disabled = false }: EmailFormProps) {
  const handleChange = <K extends keyof EmailConfig>(
    key: K,
    newValue: EmailConfig[K]
  ) => {
    onChange({ ...value, [key]: newValue });
  };

  return (
    <div className="space-y-4">
      {/* Recipient */}
      <div className="space-y-1.5">
        <label htmlFor="email-to" className="text-xs font-medium text-slate-600">
          收件人 <span className="text-red-500">*</span>
        </label>
        <input
          id="email-to"
          type="email"
          value={value.to}
          onChange={(e) => handleChange("to", e.target.value)}
          disabled={disabled}
          placeholder="recipient@example.com"
          className={`w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
            disabled ? "cursor-not-allowed opacity-50" : ""
          }`}
        />
      </div>

      {/* Subject */}
      <div className="space-y-1.5">
        <label htmlFor="email-subject" className="text-xs font-medium text-slate-600">
          主题
        </label>
        <input
          id="email-subject"
          type="text"
          value={value.subject || ""}
          onChange={(e) => handleChange("subject", e.target.value)}
          disabled={disabled}
          placeholder="邮件主题"
          className={`w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
            disabled ? "cursor-not-allowed opacity-50" : ""
          }`}
        />
      </div>

      {/* Body */}
      <div className="space-y-1.5">
        <label htmlFor="email-body" className="text-xs font-medium text-slate-600">
          正文
        </label>
        <textarea
          id="email-body"
          value={value.body || ""}
          onChange={(e) => handleChange("body", e.target.value)}
          disabled={disabled}
          placeholder="邮件正文内容"
          rows={4}
          className={`w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
            disabled ? "cursor-not-allowed opacity-50" : ""
          }`}
        />
      </div>

      {/* CC (optional) */}
      <div className="space-y-1.5">
        <label htmlFor="email-cc" className="text-xs font-medium text-slate-600">
          抄送 (CC)
        </label>
        <input
          id="email-cc"
          type="email"
          value={value.cc || ""}
          onChange={(e) => handleChange("cc", e.target.value)}
          disabled={disabled}
          placeholder="cc@example.com"
          className={`w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
            disabled ? "cursor-not-allowed opacity-50" : ""
          }`}
        />
      </div>
    </div>
  );
}

export default EmailForm;
