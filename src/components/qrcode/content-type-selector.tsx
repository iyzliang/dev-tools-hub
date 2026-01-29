"use client";

import { type QRContentType, CONTENT_TYPE_LABELS } from "@/lib/qrcode-content";

// ============================================================================
// Types
// ============================================================================

export interface ContentTypeSelectorProps {
  /** Currently selected content type */
  value: QRContentType;
  /** Callback when content type changes */
  onChange: (type: QRContentType) => void;
  /** Disabled state */
  disabled?: boolean;
}

// ============================================================================
// Content Type Icons
// ============================================================================

const ContentTypeIcons: Record<QRContentType, React.ReactNode> = {
  text: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
    </svg>
  ),
  wifi: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z" />
    </svg>
  ),
  vcard: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  ),
  email: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  ),
  phone: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>
  ),
  sms: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
    </svg>
  ),
};

// ============================================================================
// Content Types Array
// ============================================================================

const CONTENT_TYPES: QRContentType[] = [
  "text",
  "wifi",
  "vcard",
  "email",
  "phone",
  "sms",
];

// ============================================================================
// Component
// ============================================================================

/**
 * Content type selector for QR code generation
 *
 * Displays a grid of buttons for selecting the type of content
 * to encode in the QR code.
 */
export function ContentTypeSelector({
  value,
  onChange,
  disabled = false,
}: ContentTypeSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-slate-600">内容类型</label>
      <div className="grid grid-cols-3 gap-2">
        {CONTENT_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => onChange(type)}
            disabled={disabled}
            className={`flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border p-2.5 text-center transition-all ${
              value === type
                ? "border-blue-600 bg-blue-50 text-blue-700"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
            } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
          >
            <span className={value === type ? "text-blue-600" : "text-slate-500"}>
              {ContentTypeIcons[type]}
            </span>
            <span className="text-[11px] font-medium leading-tight">
              {CONTENT_TYPE_LABELS[type]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default ContentTypeSelector;
