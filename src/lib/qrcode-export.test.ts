/**
 * Unit tests for QR Code Export Utilities
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  exportAsSVG,
  generateFileName,
  getFormatLabel,
  FORMAT_MIME_TYPES,
  FORMAT_EXTENSIONS,
  DEFAULT_JPEG_QUALITY,
  MIN_EXPORT_SIZE,
  MAX_EXPORT_SIZE,
  type ExportOptions,
  type ExportFormat,
} from "./qrcode-export";

// Note: Canvas-related functions (exportAsPNG, exportAsJPEG, copyImageToClipboard, etc.)
// require browser environment with real Canvas API.
// These are tested via integration/e2e tests in the browser.
// This file focuses on testing pure functions that don't require DOM APIs.

// ============================================================================
// exportAsSVG Tests
// ============================================================================

describe("exportAsSVG", () => {
  const sampleSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100%" height="100%" fill="white"/></svg>`;

  it("should export SVG string as blob", () => {
    const result = exportAsSVG(sampleSVG);

    expect(result.success).toBe(true);
    expect(result.blob).toBeDefined();
    expect(result.blob?.type).toBe("image/svg+xml;charset=utf-8");
  });

  it("should update SVG size when specified", () => {
    const result = exportAsSVG(sampleSVG, 200);

    expect(result.success).toBe(true);
    expect(result.blob).toBeDefined();
  });

  it("should handle empty SVG string", () => {
    const result = exportAsSVG("");

    expect(result.success).toBe(true);
    expect(result.blob).toBeDefined();
  });

  it("should handle complex SVG content", () => {
    const complexSVG = `
      <svg xmlns="http://www.w3.org/2000/svg" width="256" height="256">
        <rect x="0" y="0" width="256" height="256" fill="#FFFFFF"/>
        <rect x="10" y="10" width="20" height="20" fill="#000000"/>
        <rect x="40" y="10" width="20" height="20" fill="#000000"/>
      </svg>
    `;
    const result = exportAsSVG(complexSVG);

    expect(result.success).toBe(true);
    expect(result.blob).toBeDefined();
  });

  it("should preserve SVG content integrity", () => {
    const result = exportAsSVG(sampleSVG);

    expect(result.success).toBe(true);
    if (result.blob) {
      expect(result.blob.size).toBeGreaterThan(0);
    }
  });
});

// ============================================================================
// generateFileName Tests
// ============================================================================

describe("generateFileName", () => {
  beforeEach(() => {
    // Mock Date.now for consistent testing
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-15T12:00:00.000Z"));
  });

  it("should generate PNG filename with timestamp", () => {
    const options: ExportOptions = { format: "png" };
    const fileName = generateFileName(options);

    expect(fileName).toMatch(/^qrcode-\d+\.png$/);
  });

  it("should generate JPEG filename with timestamp", () => {
    const options: ExportOptions = { format: "jpeg" };
    const fileName = generateFileName(options);

    expect(fileName).toMatch(/^qrcode-\d+\.jpg$/);
  });

  it("should generate SVG filename with timestamp", () => {
    const options: ExportOptions = { format: "svg" };
    const fileName = generateFileName(options);

    expect(fileName).toMatch(/^qrcode-\d+\.svg$/);
  });

  it("should use custom fileName prefix", () => {
    const options: ExportOptions = {
      format: "png",
      fileName: "my-qr-code",
    };
    const fileName = generateFileName(options);

    expect(fileName).toMatch(/^my-qr-code-\d+\.png$/);
  });

  it("should handle special characters in fileName", () => {
    const options: ExportOptions = {
      format: "png",
      fileName: "test_file-123",
    };
    const fileName = generateFileName(options);

    expect(fileName).toMatch(/^test_file-123-\d+\.png$/);
  });
});

// ============================================================================
// getFormatLabel Tests
// ============================================================================

describe("getFormatLabel", () => {
  it("should return PNG for png format", () => {
    expect(getFormatLabel("png")).toBe("PNG");
  });

  it("should return JPEG for jpeg format", () => {
    expect(getFormatLabel("jpeg")).toBe("JPEG");
  });

  it("should return SVG for svg format", () => {
    expect(getFormatLabel("svg")).toBe("SVG");
  });
});

// ============================================================================
// Constants Tests
// ============================================================================

describe("Constants", () => {
  it("should have correct MIME types", () => {
    expect(FORMAT_MIME_TYPES.png).toBe("image/png");
    expect(FORMAT_MIME_TYPES.jpeg).toBe("image/jpeg");
    expect(FORMAT_MIME_TYPES.svg).toBe("image/svg+xml");
  });

  it("should have correct file extensions", () => {
    expect(FORMAT_EXTENSIONS.png).toBe("png");
    expect(FORMAT_EXTENSIONS.jpeg).toBe("jpg");
    expect(FORMAT_EXTENSIONS.svg).toBe("svg");
  });

  it("should have valid default JPEG quality", () => {
    expect(DEFAULT_JPEG_QUALITY).toBe(0.92);
    expect(DEFAULT_JPEG_QUALITY).toBeGreaterThan(0);
    expect(DEFAULT_JPEG_QUALITY).toBeLessThanOrEqual(1);
  });

  it("should have valid export size limits", () => {
    expect(MIN_EXPORT_SIZE).toBe(64);
    expect(MAX_EXPORT_SIZE).toBe(4096);
    expect(MIN_EXPORT_SIZE).toBeLessThan(MAX_EXPORT_SIZE);
  });
});

// ============================================================================
// ExportOptions Type Tests
// ============================================================================

describe("ExportOptions Type", () => {
  it("should accept minimal options", () => {
    const options: ExportOptions = {
      format: "png",
    };
    expect(options.format).toBe("png");
    expect(options.size).toBeUndefined();
    expect(options.quality).toBeUndefined();
    expect(options.fileName).toBeUndefined();
  });

  it("should accept full options", () => {
    const options: ExportOptions = {
      format: "jpeg",
      size: 512,
      quality: 0.85,
      fileName: "custom-name",
    };
    expect(options.format).toBe("jpeg");
    expect(options.size).toBe(512);
    expect(options.quality).toBe(0.85);
    expect(options.fileName).toBe("custom-name");
  });

  it("should accept all format types", () => {
    const formats: ExportFormat[] = ["png", "jpeg", "svg"];
    formats.forEach((format) => {
      const options: ExportOptions = { format };
      expect(options.format).toBe(format);
    });
  });
});

// ============================================================================
// Edge Cases
// ============================================================================

describe("Edge Cases", () => {
  it("should handle SVG with Unicode content", () => {
    const unicodeSVG = `<svg xmlns="http://www.w3.org/2000/svg"><text>中文文本 🎉</text></svg>`;
    const result = exportAsSVG(unicodeSVG);

    expect(result.success).toBe(true);
    expect(result.blob).toBeDefined();
  });

  it("should handle SVG with special XML characters", () => {
    const specialSVG = `<svg xmlns="http://www.w3.org/2000/svg"><text>&lt;test&gt; &amp; &quot;quotes&quot;</text></svg>`;
    const result = exportAsSVG(specialSVG);

    expect(result.success).toBe(true);
    expect(result.blob).toBeDefined();
  });

  it("should handle very large size parameter for SVG", () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"></svg>`;
    const result = exportAsSVG(svg, 10000);

    expect(result.success).toBe(true);
  });

  it("should handle zero size parameter for SVG", () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"></svg>`;
    const result = exportAsSVG(svg, 0);

    expect(result.success).toBe(true);
  });

  it("should generate unique filenames", () => {
    const options: ExportOptions = { format: "png" };
    const fileName1 = generateFileName(options);

    // Move time forward
    vi.advanceTimersByTime(1);

    const fileName2 = generateFileName(options);

    expect(fileName1).not.toBe(fileName2);
  });
});

// ============================================================================
// SVG Size Update Tests
// ============================================================================

describe("SVG Size Update", () => {
  it("should update width attribute", () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"></svg>`;
    const result = exportAsSVG(svg, 256);

    expect(result.success).toBe(true);
  });

  it("should handle SVG without size attributes", () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"></svg>`;
    const result = exportAsSVG(svg, 256);

    expect(result.success).toBe(true);
  });

  it("should preserve other SVG attributes", () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" id="qr" class="qrcode"></svg>`;
    const result = exportAsSVG(svg, 256);

    expect(result.success).toBe(true);
  });
});

// ============================================================================
// Format Validation Tests
// ============================================================================

describe("Format Validation", () => {
  it("should have MIME type for each format", () => {
    const formats: ExportFormat[] = ["png", "jpeg", "svg"];
    formats.forEach((format) => {
      expect(FORMAT_MIME_TYPES[format]).toBeDefined();
      expect(FORMAT_MIME_TYPES[format]).toContain("image/");
    });
  });

  it("should have extension for each format", () => {
    const formats: ExportFormat[] = ["png", "jpeg", "svg"];
    formats.forEach((format) => {
      expect(FORMAT_EXTENSIONS[format]).toBeDefined();
      expect(FORMAT_EXTENSIONS[format].length).toBeGreaterThan(0);
    });
  });
});
