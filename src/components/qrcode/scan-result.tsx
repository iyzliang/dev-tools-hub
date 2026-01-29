"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";

// ============================================================================
// Types
// ============================================================================

export interface ScanResultProps {
  /** Scan result content (null if not scanned yet) */
  content: string | null;
  /** Whether scanning is in progress */
  isScanning?: boolean;
  /** Error message if scan failed */
  error?: string | null;
  /** Callback when copy is triggered */
  onCopy?: () => void;
}

// ============================================================================
// Component
// ============================================================================

/**
 * QR code scan result display component
 */
export function ScanResult({
  content,
  isScanning = false,
  error,
  onCopy,
}: ScanResultProps) {
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!content) return;

    try {
      await navigator.clipboard.writeText(content);
      setCopySuccess(true);
      onCopy?.();
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      // Fallback for browsers without clipboard API
      const textarea = document.createElement("textarea");
      textarea.value = content;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopySuccess(true);
      onCopy?.();
      setTimeout(() => setCopySuccess(false), 2000);
    }
  }, [content, onCopy]);

  // Determine content type for display hints
  const contentType = content ? detectContentType(content) : null;

  return (
    <div className="flex h-full flex-col">
      {isScanning ? (
        // Scanning state
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-slate-400">
          <svg className="h-8 w-8 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-sm">解析中...</span>
        </div>
      ) : error ? (
        // Error state
        <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <svg className="h-10 w-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <p className="text-sm text-red-600">{error}</p>
        </div>
      ) : content ? (
        // Success state with content
        <div className="flex flex-1 flex-col">
          {/* Content type indicator */}
          {contentType && (
            <div className="mb-3 flex items-center gap-2">
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                {contentType.label}
              </span>
              {contentType.hint && (
                <span className="text-[11px] text-slate-500">{contentType.hint}</span>
              )}
            </div>
          )}

          {/* Content display */}
          <div className="flex-1 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
            <pre className="h-full overflow-auto whitespace-pre-wrap break-all p-4 font-mono text-sm text-slate-700">
              {content}
            </pre>
          </div>

          {/* Copy button */}
          <div className="mt-3">
            <Button
              onClick={handleCopy}
              variant="secondary"
              className="w-full gap-2"
            >
              {copySuccess ? (
                <>
                  <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  已复制
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  复制内容
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        // Empty state
        <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-slate-200 p-8 text-center">
          <svg className="h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
          <p className="text-sm text-slate-400">上传或粘贴二维码图片进行解析</p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Helper Functions
// ============================================================================

interface ContentTypeInfo {
  type: string;
  label: string;
  hint?: string;
}

/**
 * Detect the type of QR code content
 */
function detectContentType(content: string): ContentTypeInfo | null {
  // URL
  if (/^https?:\/\//i.test(content)) {
    return { type: "url", label: "URL", hint: "网址链接" };
  }

  // WiFi
  if (/^WIFI:/i.test(content)) {
    return { type: "wifi", label: "WiFi", hint: "WiFi 连接信息" };
  }

  // vCard
  if (/^BEGIN:VCARD/i.test(content)) {
    return { type: "vcard", label: "vCard", hint: "联系人名片" };
  }

  // Email
  if (/^mailto:/i.test(content)) {
    return { type: "email", label: "邮件", hint: "邮件链接" };
  }

  // Phone
  if (/^tel:/i.test(content)) {
    return { type: "phone", label: "电话", hint: "电话号码" };
  }

  // SMS
  if (/^sms(to)?:/i.test(content)) {
    return { type: "sms", label: "短信", hint: "短信链接" };
  }

  // Geo location
  if (/^geo:/i.test(content)) {
    return { type: "geo", label: "位置", hint: "地理位置" };
  }

  // Calendar event
  if (/^BEGIN:VEVENT/i.test(content)) {
    return { type: "event", label: "事件", hint: "日历事件" };
  }

  // Plain text
  return { type: "text", label: "文本" };
}

export default ScanResult;
