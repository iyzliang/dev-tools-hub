"use client";

import { type TextConfig } from "@/lib/qrcode-content";

// ============================================================================
// Types
// ============================================================================

export interface TextUrlFormProps {
  /** Form data */
  value: TextConfig;
  /** Callback when form data changes */
  onChange: (value: TextConfig) => void;
  /** Disabled state */
  disabled?: boolean;
}

// ============================================================================
// Constants
// ============================================================================

const MAX_CONTENT_LENGTH = 2000;

// ============================================================================
// Component
// ============================================================================

/**
 * Text/URL input form for QR code content
 */
export function TextUrlForm({ value, onChange, disabled = false }: TextUrlFormProps) {
  const contentLength = value.content.length;
  const isNearLimit = contentLength > MAX_CONTENT_LENGTH * 0.8;
  const isOverLimit = contentLength > MAX_CONTENT_LENGTH;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor="qr-text-content" className="text-xs font-medium text-slate-600">
          文本或 URL
        </label>
        <span
          className={`text-[11px] font-mono ${
            isOverLimit
              ? "text-red-500"
              : isNearLimit
              ? "text-amber-500"
              : "text-slate-400"
          }`}
        >
          {contentLength} / {MAX_CONTENT_LENGTH}
        </span>
      </div>
      <textarea
        id="qr-text-content"
        value={value.content}
        onChange={(e) => onChange({ content: e.target.value })}
        disabled={disabled}
        placeholder="输入文本内容或 URL&#10;例如：https://example.com"
        rows={6}
        className={`w-full resize-none rounded-lg border bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 ${
          isOverLimit
            ? "border-red-300 focus:border-red-500 focus:ring-red-500"
            : "border-slate-200 focus:border-blue-500 focus:ring-blue-500"
        } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
      />
      {isOverLimit && (
        <p className="text-xs text-red-500">
          内容过长，可能导致二维码无法正常识别
        </p>
      )}
    </div>
  );
}

export default TextUrlForm;
