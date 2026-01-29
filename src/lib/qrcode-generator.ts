/**
 * QR Code Generation Utilities
 *
 * Provides functions to generate QR codes in various formats:
 * - DataURL (Base64) for preview
 * - SVG string for vector export
 * - Canvas for PNG/JPEG export
 */

import QRCode from "qrcode";

// ============================================================================
// Types
// ============================================================================

/**
 * Error correction levels for QR codes
 * L: ~7% recovery capacity
 * M: ~15% recovery capacity
 * Q: ~25% recovery capacity
 * H: ~30% recovery capacity
 */
export type ErrorCorrectionLevel = "L" | "M" | "Q" | "H";

/**
 * QR code generation options
 */
export interface QRCodeOptions {
  /** Size of the QR code in pixels (64-2048, default: 256) */
  size?: number;
  /** Error correction level (default: 'M') */
  errorCorrectionLevel?: ErrorCorrectionLevel;
  /** Foreground color in hex format (default: '#000000') */
  foregroundColor?: string;
  /** Background color in hex format (default: '#FFFFFF') */
  backgroundColor?: string;
  /** Margin/quiet zone in modules (default: 4) */
  margin?: number;
}

/**
 * Result of QR code generation
 */
export interface GenerateResult {
  /** Whether generation was successful */
  success: boolean;
  /** Generated data (DataURL, SVG string, or Canvas) */
  data: string | HTMLCanvasElement | null;
  /** Error message if generation failed */
  error?: string;
}

/**
 * Result for DataURL generation
 */
export interface DataURLResult {
  success: boolean;
  dataURL: string;
  error?: string;
}

/**
 * Result for SVG generation
 */
export interface SVGResult {
  success: boolean;
  svg: string;
  error?: string;
}

// ============================================================================
// Constants
// ============================================================================

/** Default QR code options */
export const DEFAULT_OPTIONS: Required<QRCodeOptions> = {
  size: 256,
  errorCorrectionLevel: "M",
  foregroundColor: "#000000",
  backgroundColor: "#FFFFFF",
  margin: 4,
};

/** Minimum QR code size in pixels */
export const MIN_SIZE = 64;

/** Maximum QR code size in pixels */
export const MAX_SIZE = 2048;

/** Maximum content length for QR code (bytes) */
export const MAX_CONTENT_LENGTH = 2953; // QR Code version 40-L limit

/** Error correction level descriptions */
export const ERROR_CORRECTION_LABELS: Record<ErrorCorrectionLevel, string> = {
  L: "低 (7%)",
  M: "中 (15%)",
  Q: "较高 (25%)",
  H: "高 (30%)",
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Validate and normalize QR code options
 */
function normalizeOptions(options?: QRCodeOptions): Required<QRCodeOptions> {
  const normalized = { ...DEFAULT_OPTIONS };

  if (options?.size !== undefined) {
    normalized.size = Math.max(MIN_SIZE, Math.min(MAX_SIZE, options.size));
  }

  if (options?.errorCorrectionLevel !== undefined) {
    normalized.errorCorrectionLevel = options.errorCorrectionLevel;
  }

  if (options?.foregroundColor !== undefined) {
    normalized.foregroundColor = options.foregroundColor;
  }

  if (options?.backgroundColor !== undefined) {
    normalized.backgroundColor = options.backgroundColor;
  }

  if (options?.margin !== undefined) {
    normalized.margin = Math.max(0, Math.min(10, options.margin));
  }

  return normalized;
}

/**
 * Validate content for QR code generation
 */
function validateContent(content: string): { valid: boolean; error?: string } {
  if (!content || content.length === 0) {
    return { valid: false, error: "内容不能为空" };
  }

  // Check content length (approximate, actual depends on encoding)
  const byteLength = new TextEncoder().encode(content).length;
  if (byteLength > MAX_CONTENT_LENGTH) {
    return {
      valid: false,
      error: `内容过长（${byteLength} 字节），超出二维码容量限制（${MAX_CONTENT_LENGTH} 字节）`,
    };
  }

  return { valid: true };
}

/**
 * Convert qrcode library options format
 */
function toQRCodeLibOptions(options: Required<QRCodeOptions>) {
  return {
    errorCorrectionLevel: options.errorCorrectionLevel,
    margin: options.margin,
    width: options.size,
    color: {
      dark: options.foregroundColor,
      light: options.backgroundColor,
    },
  };
}

// ============================================================================
// QR Code Generation Functions
// ============================================================================

/**
 * Generate QR code as DataURL (Base64 encoded image)
 *
 * @param content - Content to encode
 * @param options - Generation options
 * @returns Promise with DataURL result
 */
export async function generateQRCodeDataURL(
  content: string,
  options?: QRCodeOptions
): Promise<DataURLResult> {
  const validation = validateContent(content);
  if (!validation.valid) {
    return {
      success: false,
      dataURL: "",
      error: validation.error,
    };
  }

  try {
    const normalizedOptions = normalizeOptions(options);
    const qrOptions = toQRCodeLibOptions(normalizedOptions);

    const dataURL = await QRCode.toDataURL(content, qrOptions);

    return {
      success: true,
      dataURL,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "生成二维码失败";
    return {
      success: false,
      dataURL: "",
      error: errorMessage,
    };
  }
}

/**
 * Generate QR code as SVG string
 *
 * @param content - Content to encode
 * @param options - Generation options
 * @returns Promise with SVG result
 */
export async function generateQRCodeSVG(
  content: string,
  options?: QRCodeOptions
): Promise<SVGResult> {
  const validation = validateContent(content);
  if (!validation.valid) {
    return {
      success: false,
      svg: "",
      error: validation.error,
    };
  }

  try {
    const normalizedOptions = normalizeOptions(options);
    const qrOptions = {
      ...toQRCodeLibOptions(normalizedOptions),
      type: "svg" as const,
    };

    const svg = await QRCode.toString(content, qrOptions);

    return {
      success: true,
      svg,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "生成二维码失败";
    return {
      success: false,
      svg: "",
      error: errorMessage,
    };
  }
}

/**
 * Generate QR code to a Canvas element (browser only)
 *
 * @param canvas - Canvas element to render to
 * @param content - Content to encode
 * @param options - Generation options
 * @returns Promise with generation result
 */
export async function generateQRCodeToCanvas(
  canvas: HTMLCanvasElement,
  content: string,
  options?: QRCodeOptions
): Promise<GenerateResult> {
  const validation = validateContent(content);
  if (!validation.valid) {
    return {
      success: false,
      data: null,
      error: validation.error,
    };
  }

  try {
    const normalizedOptions = normalizeOptions(options);
    const qrOptions = toQRCodeLibOptions(normalizedOptions);

    await QRCode.toCanvas(canvas, content, qrOptions);

    return {
      success: true,
      data: canvas,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "生成二维码失败";
    return {
      success: false,
      data: null,
      error: errorMessage,
    };
  }
}

/**
 * Generate QR code data matrix (for advanced use cases)
 *
 * @param content - Content to encode
 * @param options - Generation options
 * @returns Promise with QR code matrix data
 */
export async function generateQRCodeMatrix(
  content: string,
  options?: QRCodeOptions
): Promise<{
  success: boolean;
  modules: boolean[][] | null;
  error?: string;
}> {
  const validation = validateContent(content);
  if (!validation.valid) {
    return {
      success: false,
      modules: null,
      error: validation.error,
    };
  }

  try {
    const normalizedOptions = normalizeOptions(options);

    const qrData = QRCode.create(content, {
      errorCorrectionLevel: normalizedOptions.errorCorrectionLevel,
    });

    // Convert modules to boolean array
    const size = qrData.modules.size;
    const modules: boolean[][] = [];

    for (let row = 0; row < size; row++) {
      const rowData: boolean[] = [];
      for (let col = 0; col < size; col++) {
        rowData.push(qrData.modules.get(row, col) === 1);
      }
      modules.push(rowData);
    }

    return {
      success: true,
      modules,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "生成二维码失败";
    return {
      success: false,
      modules: null,
      error: errorMessage,
    };
  }
}

// ============================================================================
// Synchronous Generation (for Server-Side)
// ============================================================================

/**
 * Generate QR code as DataURL synchronously
 * Note: This uses the sync version of the library, suitable for server-side
 *
 * @param content - Content to encode
 * @param options - Generation options
 * @returns DataURL result
 */
export function generateQRCodeDataURLSync(
  content: string,
  options?: QRCodeOptions
): DataURLResult {
  const validation = validateContent(content);
  if (!validation.valid) {
    return {
      success: false,
      dataURL: "",
      error: validation.error,
    };
  }

  try {
    const normalizedOptions = normalizeOptions(options);

    // Using callback-based API synchronously isn't ideal,
    // but for simple cases we can use the sync create + manual rendering
    const qrData = QRCode.create(content, {
      errorCorrectionLevel: normalizedOptions.errorCorrectionLevel,
    });

    // For sync generation, we return a simplified result
    // The actual DataURL generation requires canvas which is async in browser
    const moduleCount = qrData.modules.size;
    const cellSize = Math.floor(normalizedOptions.size / (moduleCount + normalizedOptions.margin * 2));
    const actualSize = cellSize * (moduleCount + normalizedOptions.margin * 2);

    // Generate a simple SVG-based data URL for sync operation
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${actualSize}" height="${actualSize}" viewBox="0 0 ${actualSize} ${actualSize}">`;
    svg += `<rect width="100%" height="100%" fill="${normalizedOptions.backgroundColor}"/>`;

    const offset = normalizedOptions.margin * cellSize;
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        if (qrData.modules.get(row, col)) {
          svg += `<rect x="${offset + col * cellSize}" y="${offset + row * cellSize}" width="${cellSize}" height="${cellSize}" fill="${normalizedOptions.foregroundColor}"/>`;
        }
      }
    }
    svg += "</svg>";

    const dataURL = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;

    return {
      success: true,
      dataURL,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "生成二维码失败";
    return {
      success: false,
      dataURL: "",
      error: errorMessage,
    };
  }
}
