"use client";

import { useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  type ExportFormat,
  downloadQRCode,
  copyImageToClipboard,
  isClipboardWriteSupported,
  FORMAT_EXTENSIONS,
} from "@/lib/qrcode-export";

// ============================================================================
// Types
// ============================================================================

export interface QRCodePreviewProps {
  /** QR code data URL for display */
  dataURL: string | null;
  /** Original content for display */
  content: string;
  /** SVG string for SVG export */
  svgString?: string;
  /** Whether QR code is being generated */
  isGenerating?: boolean;
  /** Error message if generation failed */
  error?: string;
  /** Callback when download is triggered */
  onDownload?: (format: ExportFormat) => void;
  /** Callback when copy is triggered */
  onCopy?: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const MAX_CONTENT_DISPLAY_LENGTH = 50;

// ============================================================================
// Sub-components
// ============================================================================

interface ExportActionsProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  svgString?: string;
  onDownload?: (format: ExportFormat) => void;
  onCopy?: () => void;
  disabled?: boolean;
  prepareCanvas: () => Promise<boolean>;
}

function ExportActions({
  canvasRef,
  svgString,
  onDownload,
  onCopy,
  disabled,
  prepareCanvas,
}: ExportActionsProps) {
  const [format, setFormat] = useState<ExportFormat>("png");
  const [exportSize, setExportSize] = useState<number | "same">("same");
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const supportsClipboard = isClipboardWriteSupported();

  const handleDownload = useCallback(async () => {
    if (disabled) return;

    setIsDownloading(true);
    try {
      let source: HTMLCanvasElement | string;

      if (format === "svg" && svgString) {
        source = svgString;
      } else {
        // Prepare canvas before export
        const ready = await prepareCanvas();
        if (!ready || !canvasRef.current) return;
        source = canvasRef.current;
      }

      const result = await downloadQRCode(source, {
        format,
        size: exportSize === "same" ? undefined : exportSize,
        fileName: "qrcode",
      });

      if (result.success) {
        onDownload?.(format);
      }
    } finally {
      setIsDownloading(false);
    }
  }, [format, exportSize, canvasRef, svgString, disabled, onDownload, prepareCanvas]);

  const handleCopy = useCallback(async () => {
    if (disabled) return;

    setIsCopying(true);
    try {
      // Prepare canvas before copy
      const ready = await prepareCanvas();
      if (!ready || !canvasRef.current) return;

      const result = await copyImageToClipboard(canvasRef.current);
      if (result.success) {
        setCopySuccess(true);
        onCopy?.();
        setTimeout(() => setCopySuccess(false), 2000);
      }
    } finally {
      setIsCopying(false);
    }
  }, [canvasRef, disabled, onCopy, prepareCanvas]);

  return (
    <div className="space-y-3 border-t border-slate-200 pt-3">
      {/* Format Selection */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-600">格式:</span>
        <div className="flex gap-1">
          {(["png", "jpeg", "svg"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFormat(f)}
              disabled={disabled}
              className={`cursor-pointer rounded px-2.5 py-1 text-xs font-medium uppercase transition-all ${
                format === f
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Export Size (only for raster formats) */}
      {format !== "svg" && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-600">尺寸:</span>
          <select
            value={exportSize}
            onChange={(e) =>
              setExportSize(
                e.target.value === "same" ? "same" : Number(e.target.value)
              )
            }
            disabled={disabled}
            className={`rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:border-blue-500 focus:outline-none ${
              disabled ? "cursor-not-allowed opacity-50" : ""
            }`}
          >
            <option value="same">与预览相同</option>
            <option value={512}>512px</option>
            <option value={1024}>1024px</option>
            <option value={2048}>2048px</option>
            <option value={4096}>4096px</option>
          </select>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          onClick={handleDownload}
          disabled={disabled || isDownloading}
          className="flex-1 gap-1.5"
          size="sm"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          {isDownloading ? "下载中..." : `下载 .${FORMAT_EXTENSIONS[format]}`}
        </Button>

        {supportsClipboard && (
          <Button
            onClick={handleCopy}
            disabled={disabled || isCopying}
            variant="secondary"
            size="sm"
            className="gap-1.5"
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
                复制
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * QR Code preview and export component
 */
export function QRCodePreview({
  dataURL,
  content,
  svgString,
  isGenerating = false,
  error,
  onDownload,
  onCopy,
}: QRCodePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Helper function to draw dataURL to canvas (called before export)
  const drawToCanvas = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!dataURL || !canvasRef.current) {
        resolve(false);
        return;
      }

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(false);
        return;
      }

      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        resolve(true);
      };
      img.onerror = () => resolve(false);
      img.src = dataURL;
    });
  }, [dataURL]);

  // canvasReady is simply based on whether we have a dataURL
  const canvasReady = !!dataURL && !error;

  // Truncate content for display
  const displayContent =
    content.length > MAX_CONTENT_DISPLAY_LENGTH
      ? content.substring(0, MAX_CONTENT_DISPLAY_LENGTH) + "..."
      : content;

  const hasQRCode = dataURL && !error;

  return (
    <div className="flex h-full flex-col">
      {/* Preview Area */}
      <div className="flex flex-1 flex-col items-center justify-center">
        {isGenerating ? (
          // Loading State
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <svg className="h-8 w-8 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-sm">生成中...</span>
          </div>
        ) : error ? (
          // Error State
          <div className="flex flex-col items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-6 text-center">
            <svg className="h-10 w-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        ) : hasQRCode ? (
          // QR Code Display
          <div className="flex flex-col items-center gap-3">
            {/* Hidden canvas for export */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Visible preview - using img because dataURL is dynamically generated */}
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={dataURL}
                alt="Generated QR Code"
                className="h-auto max-w-full"
                style={{ maxHeight: "200px" }}
              />
            </div>

            {/* Content Summary */}
            {content && (
              <p
                className="max-w-full truncate text-center text-xs text-slate-500"
                title={content}
              >
                {displayContent}
              </p>
            )}
          </div>
        ) : (
          // Empty State
          <div className="flex flex-col items-center gap-3 rounded-lg border-2 border-dashed border-slate-200 p-8 text-center">
            <svg className="h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            <p className="text-sm text-slate-400">配置内容后点击生成</p>
          </div>
        )}
      </div>

      {/* Export Actions */}
      {hasQRCode && canvasReady && (
        <ExportActions
          canvasRef={canvasRef}
          svgString={svgString}
          onDownload={onDownload}
          onCopy={onCopy}
          disabled={isGenerating}
          prepareCanvas={drawToCanvas}
        />
      )}
    </div>
  );
}

export default QRCodePreview;
