/**
 * QR Code Export Utilities
 *
 * Provides functions to export QR codes in various formats:
 * - PNG (with custom size)
 * - JPEG (with custom size and quality)
 * - SVG (with custom dimensions)
 * - Clipboard copy
 */

// ============================================================================
// Types
// ============================================================================

/**
 * Export format types
 */
export type ExportFormat = "png" | "jpeg" | "svg";

/**
 * Export options
 */
export interface ExportOptions {
  /** Export format */
  format: ExportFormat;
  /** Export size in pixels (for raster formats) */
  size?: number;
  /** JPEG quality (0-1, default: 0.92) */
  quality?: number;
  /** File name without extension */
  fileName?: string;
}

/**
 * Export result
 */
export interface ExportResult {
  /** Whether export was successful */
  success: boolean;
  /** Error message if export failed */
  error?: string;
  /** Blob data (for download) */
  blob?: Blob;
}

// ============================================================================
// Constants
// ============================================================================

/** Default file name prefix */
export const DEFAULT_FILE_NAME_PREFIX = "qrcode";

/** Default JPEG quality */
export const DEFAULT_JPEG_QUALITY = 0.92;

/** Minimum export size */
export const MIN_EXPORT_SIZE = 64;

/** Maximum export size */
export const MAX_EXPORT_SIZE = 4096;

/** MIME types for each format */
export const FORMAT_MIME_TYPES: Record<ExportFormat, string> = {
  png: "image/png",
  jpeg: "image/jpeg",
  svg: "image/svg+xml",
};

/** File extensions for each format */
export const FORMAT_EXTENSIONS: Record<ExportFormat, string> = {
  png: "png",
  jpeg: "jpg",
  svg: "svg",
};

// ============================================================================
// Export Functions
// ============================================================================

/**
 * Export QR code as PNG blob
 *
 * @param canvas - Source canvas element
 * @param size - Export size in pixels (optional, uses canvas size if not specified)
 * @returns Promise with export result containing PNG blob
 */
export async function exportAsPNG(
  canvas: HTMLCanvasElement,
  size?: number
): Promise<ExportResult> {
  try {
    const targetCanvas = size ? resizeCanvas(canvas, size) : canvas;

    const blob = await canvasToBlob(targetCanvas, "image/png");

    if (!blob) {
      return {
        success: false,
        error: "导出 PNG 失败",
      };
    }

    return {
      success: true,
      blob,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "导出 PNG 失败";
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Export QR code as JPEG blob
 *
 * @param canvas - Source canvas element
 * @param size - Export size in pixels (optional)
 * @param quality - JPEG quality 0-1 (default: 0.92)
 * @returns Promise with export result containing JPEG blob
 */
export async function exportAsJPEG(
  canvas: HTMLCanvasElement,
  size?: number,
  quality: number = DEFAULT_JPEG_QUALITY
): Promise<ExportResult> {
  try {
    const targetCanvas = size ? resizeCanvas(canvas, size) : canvas;

    // JPEG doesn't support transparency, fill white background
    const jpegCanvas = addWhiteBackground(targetCanvas);

    const blob = await canvasToBlob(jpegCanvas, "image/jpeg", quality);

    if (!blob) {
      return {
        success: false,
        error: "导出 JPEG 失败",
      };
    }

    return {
      success: true,
      blob,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "导出 JPEG 失败";
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Export QR code as SVG blob
 *
 * @param svgString - SVG content string
 * @param size - Optional size to set in viewBox
 * @returns Export result containing SVG blob
 */
export function exportAsSVG(
  svgString: string,
  size?: number
): ExportResult {
  try {
    let svg = svgString;

    // Optionally update SVG size attributes
    if (size) {
      svg = updateSVGSize(svgString, size);
    }

    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });

    return {
      success: true,
      blob,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "导出 SVG 失败";
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Unified export function
 *
 * @param source - Canvas element or SVG string
 * @param options - Export options
 * @returns Promise with export result
 */
export async function exportQRCode(
  source: HTMLCanvasElement | string,
  options: ExportOptions
): Promise<ExportResult> {
  const size = options.size
    ? Math.max(MIN_EXPORT_SIZE, Math.min(MAX_EXPORT_SIZE, options.size))
    : undefined;

  switch (options.format) {
    case "png":
      if (typeof source === "string") {
        return {
          success: false,
          error: "PNG 导出需要 Canvas 元素",
        };
      }
      return exportAsPNG(source, size);

    case "jpeg":
      if (typeof source === "string") {
        return {
          success: false,
          error: "JPEG 导出需要 Canvas 元素",
        };
      }
      return exportAsJPEG(source, size, options.quality);

    case "svg":
      if (typeof source !== "string") {
        return {
          success: false,
          error: "SVG 导出需要 SVG 字符串",
        };
      }
      return exportAsSVG(source, size);

    default:
      return {
        success: false,
        error: "不支持的导出格式",
      };
  }
}

// ============================================================================
// Download Functions
// ============================================================================

/**
 * Download a blob as a file
 *
 * @param blob - Blob to download
 * @param fileName - File name with extension
 */
export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();

  // Cleanup
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
}

/**
 * Export and download QR code
 *
 * @param source - Canvas element or SVG string
 * @param options - Export options
 * @returns Promise with success status
 */
export async function downloadQRCode(
  source: HTMLCanvasElement | string,
  options: ExportOptions
): Promise<{ success: boolean; error?: string }> {
  const result = await exportQRCode(source, options);

  if (!result.success || !result.blob) {
    return {
      success: false,
      error: result.error || "导出失败",
    };
  }

  const fileName = generateFileName(options);
  downloadBlob(result.blob, fileName);

  return { success: true };
}

// ============================================================================
// Clipboard Functions
// ============================================================================

/**
 * Copy QR code image to clipboard
 *
 * @param canvas - Canvas element containing QR code
 * @returns Promise with success status
 */
export async function copyImageToClipboard(
  canvas: HTMLCanvasElement
): Promise<{ success: boolean; error?: string }> {
  // Check Clipboard API support
  if (!navigator.clipboard || !navigator.clipboard.write) {
    return {
      success: false,
      error: "您的浏览器不支持复制图片到剪贴板",
    };
  }

  try {
    const blob = await canvasToBlob(canvas, "image/png");

    if (!blob) {
      return {
        success: false,
        error: "生成图片失败",
      };
    }

    const clipboardItem = new ClipboardItem({
      "image/png": blob,
    });

    await navigator.clipboard.write([clipboardItem]);

    return { success: true };
  } catch (error) {
    // Handle specific error types
    if (error instanceof Error) {
      if (error.name === "NotAllowedError") {
        return {
          success: false,
          error: "没有复制到剪贴板的权限，请允许剪贴板访问",
        };
      }
    }

    const errorMessage =
      error instanceof Error ? error.message : "复制到剪贴板失败";
    return {
      success: false,
      error: errorMessage,
    };
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Convert canvas to blob
 */
function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality?: number
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob),
      type,
      quality
    );
  });
}

/**
 * Resize canvas to target size
 */
function resizeCanvas(
  source: HTMLCanvasElement,
  targetSize: number
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = targetSize;
  canvas.height = targetSize;

  const ctx = canvas.getContext("2d");
  if (ctx) {
    // Use high quality scaling
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(source, 0, 0, targetSize, targetSize);
  }

  return canvas;
}

/**
 * Add white background to canvas (for JPEG export)
 */
function addWhiteBackground(source: HTMLCanvasElement): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = source.width;
  canvas.height = source.height;

  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(source, 0, 0);
  }

  return canvas;
}

/**
 * Update SVG size attributes
 */
function updateSVGSize(svgString: string, size: number): string {
  // Update width and height attributes
  let svg = svgString.replace(
    /width="[^"]*"/,
    `width="${size}"`
  );
  svg = svg.replace(
    /height="[^"]*"/,
    `height="${size}"`
  );

  return svg;
}

/**
 * Generate file name for download
 */
export function generateFileName(options: ExportOptions): string {
  const prefix = options.fileName || DEFAULT_FILE_NAME_PREFIX;
  const timestamp = Date.now();
  const extension = FORMAT_EXTENSIONS[options.format];

  return `${prefix}-${timestamp}.${extension}`;
}

/**
 * Get display label for export format
 */
export function getFormatLabel(format: ExportFormat): string {
  const labels: Record<ExportFormat, string> = {
    png: "PNG",
    jpeg: "JPEG",
    svg: "SVG",
  };
  return labels[format];
}

/**
 * Check if clipboard write is supported
 */
export function isClipboardWriteSupported(): boolean {
  return !!(navigator.clipboard && navigator.clipboard.write);
}
