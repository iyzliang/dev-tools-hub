/**
 * QR Code Scanning/Parsing Utilities
 *
 * Provides functions to scan and decode QR codes from various sources:
 * - ImageData (raw pixel data)
 * - File (uploaded image file)
 * - URL (remote image)
 */

import jsQR from "jsqr";

// ============================================================================
// Types
// ============================================================================

/**
 * Result of QR code scanning
 */
export interface ScanResult {
  /** Whether scanning was successful */
  success: boolean;
  /** Decoded content from QR code */
  content: string;
  /** Error message if scanning failed */
  error?: string;
  /** Location of QR code in the image (if found) */
  location?: QRLocation;
}

/**
 * Location information of detected QR code
 */
export interface QRLocation {
  /** Top-left corner */
  topLeft: { x: number; y: number };
  /** Top-right corner */
  topRight: { x: number; y: number };
  /** Bottom-left corner */
  bottomLeft: { x: number; y: number };
  /** Bottom-right corner */
  bottomRight: { x: number; y: number };
}

/**
 * Input method for scanning (for analytics)
 */
export type ScanInputMethod = "upload" | "paste" | "drag" | "url";

// ============================================================================
// Constants
// ============================================================================

/** Maximum image size to process (to prevent memory issues) */
export const MAX_IMAGE_SIZE = 4096;

/** Maximum file size in bytes (10MB) */
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

/** Supported image MIME types */
export const SUPPORTED_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/gif",
  "image/webp",
  "image/bmp",
];

// ============================================================================
// Core Scanning Functions
// ============================================================================

/**
 * Scan QR code from ImageData
 *
 * @param imageData - Raw image data (RGBA format)
 * @returns Scan result
 */
export function scanQRCodeFromImageData(imageData: ImageData): ScanResult {
  try {
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "dontInvert",
    });

    if (!code) {
      // Try with inversion for QR codes with inverted colors
      const invertedCode = jsQR(
        imageData.data,
        imageData.width,
        imageData.height,
        {
          inversionAttempts: "attemptBoth",
        }
      );

      if (!invertedCode) {
        return {
          success: false,
          content: "",
          error: "未识别到二维码，请确保图片中包含清晰的二维码",
        };
      }

      return {
        success: true,
        content: invertedCode.data,
        location: {
          topLeft: invertedCode.location.topLeftCorner,
          topRight: invertedCode.location.topRightCorner,
          bottomLeft: invertedCode.location.bottomLeftCorner,
          bottomRight: invertedCode.location.bottomRightCorner,
        },
      };
    }

    return {
      success: true,
      content: code.data,
      location: {
        topLeft: code.location.topLeftCorner,
        topRight: code.location.topRightCorner,
        bottomLeft: code.location.bottomLeftCorner,
        bottomRight: code.location.bottomRightCorner,
      },
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "解析二维码时发生错误";
    return {
      success: false,
      content: "",
      error: errorMessage,
    };
  }
}

/**
 * Scan QR code from File object
 *
 * @param file - Image file to scan
 * @returns Promise with scan result
 */
export async function scanQRCodeFromFile(file: File): Promise<ScanResult> {
  // Validate file type
  if (!SUPPORTED_MIME_TYPES.includes(file.type)) {
    return {
      success: false,
      content: "",
      error: `不支持的文件类型: ${file.type}。支持的格式: PNG, JPEG, GIF, WebP, BMP`,
    };
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    const sizeMB = (file.size / 1024 / 1024).toFixed(2);
    return {
      success: false,
      content: "",
      error: `文件过大 (${sizeMB}MB)，最大支持 10MB`,
    };
  }

  try {
    // Read file as data URL
    const dataURL = await readFileAsDataURL(file);

    // Load image and get ImageData
    const imageData = await loadImageDataFromDataURL(dataURL);

    // Scan QR code
    return scanQRCodeFromImageData(imageData);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "读取文件失败";
    return {
      success: false,
      content: "",
      error: errorMessage,
    };
  }
}

/**
 * Scan QR code from image URL
 *
 * @param url - URL of the image to scan
 * @returns Promise with scan result
 */
export async function scanQRCodeFromURL(url: string): Promise<ScanResult> {
  // Basic URL validation
  if (!url || url.trim().length === 0) {
    return {
      success: false,
      content: "",
      error: "请输入图片 URL",
    };
  }

  try {
    new URL(url);
  } catch {
    return {
      success: false,
      content: "",
      error: "无效的 URL 格式",
    };
  }

  try {
    // Fetch image
    const response = await fetch(url, {
      mode: "cors",
      credentials: "omit",
    });

    if (!response.ok) {
      return {
        success: false,
        content: "",
        error: `加载图片失败: HTTP ${response.status}`,
      };
    }

    // Check content type
    const contentType = response.headers.get("content-type");
    if (contentType && !contentType.startsWith("image/")) {
      return {
        success: false,
        content: "",
        error: "URL 指向的不是图片文件",
      };
    }

    // Get blob and convert to data URL
    const blob = await response.blob();

    // Validate size
    if (blob.size > MAX_FILE_SIZE) {
      const sizeMB = (blob.size / 1024 / 1024).toFixed(2);
      return {
        success: false,
        content: "",
        error: `图片过大 (${sizeMB}MB)，最大支持 10MB`,
      };
    }

    const dataURL = await blobToDataURL(blob);

    // Load image and get ImageData
    const imageData = await loadImageDataFromDataURL(dataURL);

    // Scan QR code
    return scanQRCodeFromImageData(imageData);
  } catch (error) {
    // Handle specific error types
    if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
      return {
        success: false,
        content: "",
        error: "无法加载图片，可能是跨域限制或网络问题",
      };
    }

    const errorMessage =
      error instanceof Error ? error.message : "加载图片失败";
    return {
      success: false,
      content: "",
      error: errorMessage,
    };
  }
}

/**
 * Scan QR code from Blob (e.g., from clipboard)
 *
 * @param blob - Image blob
 * @returns Promise with scan result
 */
export async function scanQRCodeFromBlob(blob: Blob): Promise<ScanResult> {
  // Validate type
  if (!blob.type.startsWith("image/")) {
    return {
      success: false,
      content: "",
      error: "剪贴板内容不是图片",
    };
  }

  // Validate size
  if (blob.size > MAX_FILE_SIZE) {
    const sizeMB = (blob.size / 1024 / 1024).toFixed(2);
    return {
      success: false,
      content: "",
      error: `图片过大 (${sizeMB}MB)，最大支持 10MB`,
    };
  }

  try {
    const dataURL = await blobToDataURL(blob);
    const imageData = await loadImageDataFromDataURL(dataURL);
    return scanQRCodeFromImageData(imageData);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "处理图片失败";
    return {
      success: false,
      content: "",
      error: errorMessage,
    };
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Read a File as DataURL
 */
function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("读取文件失败"));
      }
    };
    reader.onerror = () => reject(new Error("读取文件失败"));
    reader.readAsDataURL(file);
  });
}

/**
 * Convert Blob to DataURL
 */
function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("转换失败"));
      }
    };
    reader.onerror = () => reject(new Error("转换失败"));
    reader.readAsDataURL(blob);
  });
}

/**
 * Load image from DataURL and extract ImageData
 */
function loadImageDataFromDataURL(dataURL: string): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        // Limit image size to prevent memory issues
        let width = img.width;
        let height = img.height;

        if (width > MAX_IMAGE_SIZE || height > MAX_IMAGE_SIZE) {
          const scale = MAX_IMAGE_SIZE / Math.max(width, height);
          width = Math.floor(width * scale);
          height = Math.floor(height * scale);
        }

        // Create canvas and draw image
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("无法创建画布上下文"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Get image data
        const imageData = ctx.getImageData(0, 0, width, height);
        resolve(imageData);
      } catch {
        reject(new Error("处理图片失败"));
      }
    };

    img.onerror = () => reject(new Error("加载图片失败"));
    img.src = dataURL;
  });
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if a file type is supported for scanning
 */
export function isSupportedFileType(mimeType: string): boolean {
  return SUPPORTED_MIME_TYPES.includes(mimeType);
}

/**
 * Get file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  } else {
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  }
}

/**
 * Validate file before scanning
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  if (!isSupportedFileType(file.type)) {
    return {
      valid: false,
      error: `不支持的文件类型: ${file.type}`,
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `文件过大 (${formatFileSize(file.size)})，最大支持 10MB`,
    };
  }

  return { valid: true };
}
