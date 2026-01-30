"use client";

import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DEFAULT_MIME_TYPE,
  detectMimeType,
  estimateBytesFromBase64,
  normalizeBase64Input,
} from "@/lib/base64-utils";
import { cn } from "@/lib/utils";
import { Copy, Eraser, X } from "lucide-react";

type ViewMode = "dataURL" | "base64";

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "-";
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"] as const;
  let value = bytes / 1024;
  for (const unit of units) {
    if (value < 1024) return `${value.toFixed(value < 10 ? 2 : 1)} ${unit}`;
    value /= 1024;
  }
  return `${value.toFixed(1)} TB`;
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // ignore and fallback
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    textarea.style.top = "-9999px";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

export interface Base64TextAreaProps {
  /** 标题（显示在工具栏左侧） */
  label?: string;
  /** 受控值 */
  value: string;
  /** 受控回调 */
  onChange?: (value: string) => void;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否只读（常用于“输出区域”） */
  readOnly?: boolean;
  /** 占位符 */
  placeholder?: string;
  /** 当输入为纯 Base64 时，用于生成 DataURL 的 MIME 提示 */
  mimeTypeHint?: string;
  /** 是否显示 DataURL/纯 Base64 切换 */
  showViewToggle?: boolean;
  /** 是否显示工具栏（复制/清空等） */
  showToolbar?: boolean;
  /** 容器样式 */
  className?: string;
  /** 文本域样式 */
  textareaClassName?: string;
  /** aria-label（当 label 为空时建议提供） */
  ariaLabel?: string;
}

export function Base64TextArea({
  label,
  value,
  onChange,
  disabled = false,
  readOnly = false,
  placeholder,
  mimeTypeHint,
  showViewToggle = true,
  showToolbar = true,
  className,
  textareaClassName,
  ariaLabel,
}: Base64TextAreaProps) {
  const [view, setView] = useState<ViewMode>(() =>
    value.trim().startsWith("data:") ? "dataURL" : "base64",
  );
  const [copied, setCopied] = useState(false);
  const [dismissedErrorKey, setDismissedErrorKey] = useState<string | null>(
    null,
  );

  const normalized = useMemo(() => normalizeBase64Input(value), [value]);
  const resolvedMimeType = useMemo(() => {
    if (normalized.ok) return normalized.mimeType ?? mimeTypeHint;
    const detected = detectMimeType(value.trim());
    return detected ?? mimeTypeHint;
  }, [normalized, mimeTypeHint, value]);

  const errorMessage = useMemo(() => {
    const trimmed = value.trim();
    if (!trimmed) return null;
    if (normalized.ok) return null;
    return normalized.error;
  }, [normalized, value]);

  const errorKey = useMemo(() => {
    if (!errorMessage) return null;
    return `${errorMessage}::${value}`;
  }, [errorMessage, value]);

  const showError = Boolean(errorMessage && errorKey !== dismissedErrorKey);

  const bytesInfo = useMemo(() => {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const r = estimateBytesFromBase64(value);
    if (!r.ok) return null;
    return r.bytes;
  }, [value]);

  const displayValue = useMemo(() => {
    if (view === "dataURL") {
      if (value.trim().startsWith("data:")) return value;
      if (!normalized.ok) return value;

      const mime = resolvedMimeType ?? DEFAULT_MIME_TYPE;
      return `data:${mime};base64,${normalized.base64}`;
    }

    // base64 view
    if (normalized.ok) return normalized.base64;
    // Fallback: if it's a data URL but invalid for base64-utils, try naive split for display only.
    const comma = value.indexOf(",");
    if (value.trim().startsWith("data:") && comma !== -1) {
      return value.slice(comma + 1).replace(/\s+/g, "");
    }
    return value;
  }, [normalized, resolvedMimeType, value, view]);

  const canEdit = !disabled && !readOnly && typeof onChange === "function";

  const setViewAndMaybeTransform = useCallback(
    (next: ViewMode) => {
      setView(next);

      // 让受控值与视图保持一致（主要用于“输出区域”的切换体验，也可用于输入）。
      if (!canEdit) return;
      if (!normalized.ok) return;

      if (next === "base64") {
        onChange(normalized.base64);
        return;
      }

      const mime = (resolvedMimeType ?? DEFAULT_MIME_TYPE).trim();
      onChange(`data:${mime};base64,${normalized.base64}`);
    },
    [canEdit, normalized, onChange, resolvedMimeType],
  );

  const handleCopy = useCallback(async () => {
    const trimmed = displayValue.trim();
    if (!trimmed) return;
    const ok = await copyToClipboard(displayValue);
    if (!ok) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }, [displayValue]);

  const handleClear = useCallback(() => {
    if (!canEdit) return;
    onChange("");
    setDismissedErrorKey(null);
  }, [canEdit, onChange]);

  const handleDismissError = useCallback(() => {
    if (!errorKey) return;
    setDismissedErrorKey(errorKey);
  }, [errorKey]);

  return (
    <div className={cn("flex h-full flex-col gap-2", className)}>
      {showToolbar && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {label ? (
              <span className="text-xs font-medium text-slate-700">{label}</span>
            ) : (
              <span className="text-xs text-slate-500">Base64</span>
            )}

            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <span>长度 {displayValue.length}</span>
              {typeof bytesInfo === "number" && (
                <span>
                  · 约 {bytesInfo} bytes（{formatBytes(bytesInfo)}）
                </span>
              )}
              {resolvedMimeType && <span>· {resolvedMimeType}</span>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {showViewToggle && (
              <div
                className="inline-flex rounded-md border border-slate-200 bg-white p-0.5"
                role="tablist"
                aria-label="Base64 视图切换"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={view === "dataURL"}
                  className={cn(
                    "h-7 rounded-[6px] px-2 text-[11px] font-medium transition-colors duration-150 ease-out",
                    view === "dataURL"
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-600 hover:bg-slate-50",
                  )}
                  onClick={() => setViewAndMaybeTransform("dataURL")}
                  disabled={disabled}
                >
                  DataURL
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={view === "base64"}
                  className={cn(
                    "h-7 rounded-[6px] px-2 text-[11px] font-medium transition-colors duration-150 ease-out",
                    view === "base64"
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-600 hover:bg-slate-50",
                  )}
                  onClick={() => setViewAndMaybeTransform("base64")}
                  disabled={disabled}
                >
                  纯 Base64
                </button>
              </div>
            )}

            <Button
              variant="secondary"
              size="sm"
              onClick={handleCopy}
              disabled={disabled || !displayValue.trim()}
              aria-label="复制"
              className="gap-1.5"
            >
              <Copy className="h-3.5 w-3.5" />
              {copied ? "已复制" : "复制"}
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleClear}
              disabled={!canEdit || !value.trim()}
              aria-label="清空"
              className="gap-1.5"
            >
              <Eraser className="h-3.5 w-3.5" />
              清空
            </Button>
          </div>
        </div>
      )}

      {showError && (
        <div className="flex items-start justify-between gap-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          <div className="min-w-0">
            <div className="text-[11px] font-medium">输入无效</div>
            <div className="mt-0.5 wrap-break-word text-[12px] leading-relaxed">
              {errorMessage}
            </div>
          </div>
          <button
            type="button"
            className="rounded p-1 text-red-700 hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/30"
            onClick={handleDismissError}
            aria-label="关闭错误提示"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <Textarea
        value={displayValue}
        onChange={(e) => {
          if (!canEdit) return;
          const next = e.target.value;
          onChange(next);
          // 用户直接粘贴/输入时，尽量跟随推断视图状态。
          const nextTrimmed = next.trim();
          if (nextTrimmed.startsWith("data:")) setView("dataURL");
        }}
        disabled={disabled}
        readOnly={readOnly || !canEdit}
        placeholder={placeholder}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        className={cn(
          "min-h-44 resize-none font-mono text-xs leading-relaxed",
          textareaClassName,
        )}
        hasError={Boolean(errorMessage)}
        aria-label={ariaLabel ?? label ?? "Base64 输入输出"}
      />
    </div>
  );
}

export default Base64TextArea;

