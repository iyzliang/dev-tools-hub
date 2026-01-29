"use client";

import { useRef, useState, useCallback } from "react";
import { validateFile, SUPPORTED_MIME_TYPES } from "@/lib/qrcode-scanner";

// ============================================================================
// Types
// ============================================================================

export interface ImageUploaderProps {
  /** Callback when image is loaded (File or Blob) */
  onImageLoad: (data: File | Blob) => void;
  /** Callback when URL is submitted */
  onUrlSubmit: (url: string) => void;
  /** Current preview URL (dataURL) */
  previewUrl?: string | null;
  /** Callback to clear the current image */
  onClear: () => void;
  /** Whether processing is in progress */
  isProcessing?: boolean;
  /** Disabled state */
  disabled?: boolean;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Image uploader component supporting file upload, drag & drop, paste, and URL input
 */
export function ImageUploader({
  onImageLoad,
  onUrlSubmit,
  previewUrl,
  onClear,
  isProcessing = false,
  disabled = false,
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Handle file selection
  const handleFileSelect = useCallback(
    (file: File) => {
      setError(null);
      const validation = validateFile(file);
      if (!validation.valid) {
        setError(validation.error || "文件验证失败");
        return;
      }
      onImageLoad(file);
    },
    [onImageLoad]
  );

  // Handle input change
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
      // Reset input value to allow selecting the same file again
      e.target.value = "";
    },
    [handleFileSelect]
  );

  // Handle drag events
  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) {
        setIsDragOver(true);
      }
    },
    [disabled]
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
      if (file) {
        handleFileSelect(file);
      }
    },
    [disabled, handleFileSelect]
  );

  // Handle paste
  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      if (disabled) return;

      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          const blob = item.getAsFile();
          if (blob) {
            setError(null);
            onImageLoad(blob);
            return;
          }
        }
      }
    },
    [disabled, onImageLoad]
  );

  // Handle URL submit
  const handleUrlSubmit = useCallback(() => {
    if (!urlInput.trim()) {
      setError("请输入图片 URL");
      return;
    }

    try {
      new URL(urlInput);
    } catch {
      setError("无效的 URL 格式");
      return;
    }

    setError(null);
    onUrlSubmit(urlInput.trim());
    setUrlInput("");
  }, [urlInput, onUrlSubmit]);

  // Handle clear
  const handleClear = useCallback(() => {
    setError(null);
    setUrlInput("");
    onClear();
  }, [onClear]);

  // Click to upload
  const handleClick = useCallback(() => {
    if (!disabled && !previewUrl) {
      fileInputRef.current?.click();
    }
  }, [disabled, previewUrl]);

  const isDisabled = disabled || isProcessing;

  return (
    <div className="flex h-full flex-col space-y-4">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={SUPPORTED_MIME_TYPES.join(",")}
        onChange={handleInputChange}
        className="hidden"
        disabled={isDisabled}
      />

      {/* Main upload area */}
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onPaste={handlePaste}
        tabIndex={0}
        role="button"
        aria-label="上传图片"
        className={`flex flex-1 flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-all ${
          previewUrl
            ? "border-slate-200 bg-white"
            : isDragOver
            ? "border-blue-500 bg-blue-50"
            : "border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-slate-100"
        } ${isDisabled ? "cursor-not-allowed opacity-50" : previewUrl ? "cursor-default" : "cursor-pointer"}`}
      >
        {isProcessing ? (
          // Processing state
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <svg className="h-8 w-8 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-sm">解析中...</span>
          </div>
        ) : previewUrl ? (
          // Preview state
          <div className="flex flex-col items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="上传的图片"
              className="max-h-40 max-w-full rounded border border-slate-200"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="flex cursor-pointer items-center gap-1 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              清除
            </button>
          </div>
        ) : (
          // Empty state
          <>
            <svg className="mb-3 h-10 w-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            <p className="mb-1 text-sm font-medium text-slate-600">
              拖拽图片到此处，或点击选择文件
            </p>
            <p className="text-xs text-slate-500">
              支持 PNG、JPEG、GIF、WebP、BMP
            </p>
            <p className="mt-2 text-xs text-slate-400">
              也可以使用 <kbd className="rounded border border-slate-200 bg-slate-100 px-1 text-[10px]">Ctrl/⌘ + V</kbd> 粘贴图片
            </p>
          </>
        )}
      </div>

      {/* URL input section */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-slate-600">或输入图片 URL</label>
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleUrlSubmit();
              }
            }}
            disabled={isDisabled}
            placeholder="https://example.com/qrcode.png"
            className={`flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
              isDisabled ? "cursor-not-allowed opacity-50" : ""
            }`}
          />
          <button
            type="button"
            onClick={handleUrlSubmit}
            disabled={isDisabled || !urlInput.trim()}
            className={`rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 ${
              isDisabled || !urlInput.trim() ? "cursor-not-allowed opacity-50" : "cursor-pointer"
            }`}
          >
            加载
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
          {error}
        </div>
      )}
    </div>
  );
}

export default ImageUploader;
