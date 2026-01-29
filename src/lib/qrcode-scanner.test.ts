/**
 * Unit tests for QR Code Scanning Utilities
 */

import { describe, it, expect } from "vitest";
import {
  scanQRCodeFromImageData,
  isSupportedFileType,
  formatFileSize,
  validateFile,
  SUPPORTED_MIME_TYPES,
  MAX_FILE_SIZE,
  MAX_IMAGE_SIZE,
} from "./qrcode-scanner";

// ============================================================================
// Helper to create mock ImageData
// ============================================================================

/**
 * Create a simple mock ImageData object
 * Note: In Node.js environment, we can't create real ImageData,
 * so we create a compatible mock object
 */
function createMockImageData(
  width: number,
  height: number,
  fillValue = 255
): ImageData {
  const data = new Uint8ClampedArray(width * height * 4);
  data.fill(fillValue);
  return {
    data,
    width,
    height,
    colorSpace: "srgb" as PredefinedColorSpace,
  };
}

// ============================================================================
// scanQRCodeFromImageData Tests
// ============================================================================

describe("scanQRCodeFromImageData", () => {
  it("should return error for empty image", () => {
    const emptyImageData = createMockImageData(100, 100, 255);
    const result = scanQRCodeFromImageData(emptyImageData);

    expect(result.success).toBe(false);
    expect(result.error).toContain("未识别到二维码");
  });

  it("should return error for very small image", () => {
    const smallImageData = createMockImageData(10, 10);
    const result = scanQRCodeFromImageData(smallImageData);

    expect(result.success).toBe(false);
  });

  it("should handle all-white image", () => {
    const whiteImageData = createMockImageData(200, 200, 255);
    const result = scanQRCodeFromImageData(whiteImageData);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("should handle all-black image", () => {
    const blackImageData = createMockImageData(200, 200, 0);
    const result = scanQRCodeFromImageData(blackImageData);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});

// ============================================================================
// isSupportedFileType Tests
// ============================================================================

describe("isSupportedFileType", () => {
  it("should accept PNG", () => {
    expect(isSupportedFileType("image/png")).toBe(true);
  });

  it("should accept JPEG", () => {
    expect(isSupportedFileType("image/jpeg")).toBe(true);
    expect(isSupportedFileType("image/jpg")).toBe(true);
  });

  it("should accept GIF", () => {
    expect(isSupportedFileType("image/gif")).toBe(true);
  });

  it("should accept WebP", () => {
    expect(isSupportedFileType("image/webp")).toBe(true);
  });

  it("should accept BMP", () => {
    expect(isSupportedFileType("image/bmp")).toBe(true);
  });

  it("should reject non-image types", () => {
    expect(isSupportedFileType("application/pdf")).toBe(false);
    expect(isSupportedFileType("text/plain")).toBe(false);
    expect(isSupportedFileType("video/mp4")).toBe(false);
  });

  it("should reject invalid types", () => {
    expect(isSupportedFileType("")).toBe(false);
    expect(isSupportedFileType("image/svg+xml")).toBe(false);
  });
});

// ============================================================================
// formatFileSize Tests
// ============================================================================

describe("formatFileSize", () => {
  it("should format bytes", () => {
    expect(formatFileSize(500)).toBe("500 B");
    expect(formatFileSize(1023)).toBe("1023 B");
  });

  it("should format kilobytes", () => {
    expect(formatFileSize(1024)).toBe("1.0 KB");
    expect(formatFileSize(1536)).toBe("1.5 KB");
    expect(formatFileSize(10240)).toBe("10.0 KB");
  });

  it("should format megabytes", () => {
    expect(formatFileSize(1024 * 1024)).toBe("1.00 MB");
    expect(formatFileSize(1.5 * 1024 * 1024)).toBe("1.50 MB");
    expect(formatFileSize(10 * 1024 * 1024)).toBe("10.00 MB");
  });

  it("should handle zero", () => {
    expect(formatFileSize(0)).toBe("0 B");
  });
});

// ============================================================================
// validateFile Tests
// ============================================================================

describe("validateFile", () => {
  it("should accept valid PNG file", () => {
    const file = new File([""], "test.png", { type: "image/png" });
    const result = validateFile(file);

    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("should accept valid JPEG file", () => {
    const file = new File([""], "test.jpg", { type: "image/jpeg" });
    const result = validateFile(file);

    expect(result.valid).toBe(true);
  });

  it("should reject unsupported file type", () => {
    const file = new File([""], "test.pdf", { type: "application/pdf" });
    const result = validateFile(file);

    expect(result.valid).toBe(false);
    expect(result.error).toContain("不支持的文件类型");
  });

  it("should reject file that is too large", () => {
    // Create a mock large file (larger than MAX_FILE_SIZE)
    const largeContent = new Array(MAX_FILE_SIZE + 1).fill("a").join("");
    const file = new File([largeContent], "large.png", { type: "image/png" });
    const result = validateFile(file);

    expect(result.valid).toBe(false);
    expect(result.error).toContain("文件过大");
  });

  it("should accept file at exactly max size", () => {
    const content = new Array(MAX_FILE_SIZE).fill("a").join("");
    const file = new File([content], "max.png", { type: "image/png" });
    const result = validateFile(file);

    expect(result.valid).toBe(true);
  });
});

// ============================================================================
// Constants Tests
// ============================================================================

describe("Constants", () => {
  it("should have valid supported MIME types", () => {
    expect(SUPPORTED_MIME_TYPES).toContain("image/png");
    expect(SUPPORTED_MIME_TYPES).toContain("image/jpeg");
    expect(SUPPORTED_MIME_TYPES).toContain("image/gif");
    expect(SUPPORTED_MIME_TYPES).toContain("image/webp");
    expect(SUPPORTED_MIME_TYPES.length).toBeGreaterThan(0);
  });

  it("should have valid max file size (10MB)", () => {
    expect(MAX_FILE_SIZE).toBe(10 * 1024 * 1024);
  });

  it("should have valid max image size", () => {
    expect(MAX_IMAGE_SIZE).toBe(4096);
    expect(MAX_IMAGE_SIZE).toBeGreaterThan(0);
  });
});

// ============================================================================
// Edge Cases
// ============================================================================

describe("Edge Cases", () => {
  it("should handle file with empty name", () => {
    const file = new File(["test"], "", { type: "image/png" });
    const result = validateFile(file);

    expect(result.valid).toBe(true);
  });

  it("should handle file with unicode name", () => {
    const file = new File(["test"], "测试图片.png", { type: "image/png" });
    const result = validateFile(file);

    expect(result.valid).toBe(true);
  });

  it("should handle file with special characters in name", () => {
    const file = new File(["test"], "test (1) - copy.png", {
      type: "image/png",
    });
    const result = validateFile(file);

    expect(result.valid).toBe(true);
  });
});

// ============================================================================
// Type Safety Tests
// ============================================================================

describe("Type Safety", () => {
  it("should return proper ScanResult structure on failure", () => {
    const imageData = createMockImageData(100, 100);
    const result = scanQRCodeFromImageData(imageData);

    expect(typeof result.success).toBe("boolean");
    expect(typeof result.content).toBe("string");
    if (!result.success) {
      expect(typeof result.error).toBe("string");
    }
  });

  it("should have content as empty string when scan fails", () => {
    const imageData = createMockImageData(100, 100);
    const result = scanQRCodeFromImageData(imageData);

    if (!result.success) {
      expect(result.content).toBe("");
    }
  });
});
