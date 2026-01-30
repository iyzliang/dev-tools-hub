"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ClipboardPaste,
  ImagePlus,
  RefreshCw,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";

const DEFAULT_MAX_BYTES = 10 * 1024 * 1024; // 10MB

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

function validateImageFile(
  file: File,
  maxBytes: number,
): { ok: true } | { ok: false; error: string } {
  if (!file.type || !file.type.startsWith("image/")) {
    return { ok: false, error: "仅支持图片文件（image/*）" };
  }
  if (file.size > maxBytes) {
    return {
      ok: false,
      error: `图片过大（${formatBytes(file.size)}），请使用不超过 ${formatBytes(maxBytes)} 的图片`,
    };
  }
  return { ok: true };
}

export interface ImagePickerProps {
  /** 当前选中的图片文件 */
  value: File | null;
  /** 选中/清除回调（组件保持无业务耦合） */
  onChange: (file: File | null) => void;
  /** 禁用状态 */
  disabled?: boolean;
  /** 最大允许文件大小（默认 10MB） */
  maxBytes?: number;
  /** 容器样式 */
  className?: string;
  /** 可访问性 label */
  ariaLabel?: string;
}

export function ImagePicker({
  value,
  onChange,
  disabled = false,
  maxBytes = DEFAULT_MAX_BYTES,
  className,
  ariaLabel,
}: ImagePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dismissedErrorKey, setDismissedErrorKey] = useState<string | null>(
    null,
  );

  const previewUrl = useMemo(() => {
    if (!value) return null;
    return URL.createObjectURL(value);
  }, [value]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const errorKey = useMemo(() => {
    if (!error) return null;
    return `${error}::${value?.name ?? ""}::${value?.size ?? 0}`;
  }, [error, value]);

  const showError = Boolean(error && errorKey !== dismissedErrorKey);

  const openFileDialog = useCallback(() => {
    if (disabled) return;
    inputRef.current?.click();
  }, [disabled]);

  const handleSetFile = useCallback(
    (file: File) => {
      setError(null);
      setDismissedErrorKey(null);

      const v = validateImageFile(file, maxBytes);
      if (!v.ok) {
        setError(v.error);
        return;
      }
      onChange(file);
    },
    [maxBytes, onChange],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleSetFile(file);
      // reset to allow selecting the same file again
      e.target.value = "";
    },
    [handleSetFile],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (disabled) return;
      setIsDragOver(true);
    },
    [disabled],
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      if (disabled) return;

      const file = e.dataTransfer.files?.[0];
      if (file) handleSetFile(file);
    },
    [disabled, handleSetFile],
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      if (disabled) return;
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of Array.from(items)) {
        if (!item.type.startsWith("image/")) continue;
        const file = item.getAsFile();
        if (file) {
          handleSetFile(file);
          return;
        }
      }

      setError("剪贴板中未检测到图片");
    },
    [disabled, handleSetFile],
  );

  const handleRemove = useCallback(() => {
    if (disabled) return;
    setError(null);
    setDismissedErrorKey(null);
    onChange(null);
  }, [disabled, onChange]);

  const handleDismissError = useCallback(() => {
    if (!errorKey) return;
    setDismissedErrorKey(errorKey);
  }, [errorKey]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openFileDialog();
      }
    },
    [disabled, openFileDialog],
  );

  return (
    <div className={cn("flex h-full flex-col gap-2", className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        disabled={disabled}
        onChange={handleInputChange}
      />

      <div
        tabIndex={disabled ? -1 : 0}
        role="button"
        aria-label={ariaLabel ?? "选择图片"}
        onKeyDown={onKeyDown}
        onClick={() => {
          if (!value) openFileDialog();
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onPaste={handlePaste}
        className={cn(
          "flex min-h-0 flex-1 flex-col items-center justify-center rounded-lg border-2 border-dashed p-5 transition-all duration-150 ease-out outline-none",
          "focus-visible:ring-2 focus-visible:ring-blue-500/20",
          disabled && "cursor-not-allowed opacity-60",
          value
            ? "border-slate-200 bg-white"
            : isDragOver
              ? "border-blue-500 bg-blue-50"
              : "border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-slate-100",
          !disabled && !value && "cursor-pointer",
        )}
      >
        {value && previewUrl ? (
          <div className="flex w-full flex-col items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt={value.name || "已选择的图片"}
              className="max-h-44 max-w-full rounded-md border border-slate-200 bg-white shadow-sm"
            />

            <div className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="font-medium text-slate-800">已选择</span>
                <span className="wrap-break-word text-slate-700">
                  {value.name}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-600">
                <span>{value.type || "image/*"}</span>
                <span>· {formatBytes(value.size)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  openFileDialog();
                }}
                disabled={disabled}
                aria-label="重新选择图片"
                className="gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                重选
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                disabled={disabled}
                aria-label="移除图片"
                className="gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" />
                移除
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center">
            <div className="mb-3 rounded-full bg-white p-3 shadow-sm ring-1 ring-slate-200">
              {isDragOver ? (
                <UploadCloud className="h-6 w-6 text-blue-600" />
              ) : (
                <ImagePlus className="h-6 w-6 text-slate-500" />
              )}
            </div>
            <div className="text-sm font-medium text-slate-700">
              拖拽图片到此处，或点击选择文件
            </div>
            <div className="mt-1 text-xs text-slate-500">
              仅支持图片（image/*），最大 {formatBytes(maxBytes)}
            </div>
            <div className="mt-2 flex items-center gap-1 text-[11px] text-slate-500">
              <ClipboardPaste className="h-3.5 w-3.5" />
              点击后可用{" "}
              <kbd className="rounded border border-slate-200 bg-slate-100 px-1 text-[10px] text-slate-600">
                Ctrl/⌘ + V
              </kbd>{" "}
              粘贴
            </div>
          </div>
        )}
      </div>

      {showError && (
        <div className="flex items-start justify-between gap-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          <div className="min-w-0">
            <div className="text-[11px] font-medium">提示</div>
            <div className="mt-0.5 wrap-break-word text-[12px] leading-relaxed">
              {error}
            </div>
          </div>
          <button
            type="button"
            className="rounded p-1 text-red-700 hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/30"
            onClick={handleDismissError}
            aria-label="关闭提示"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default ImagePicker;

