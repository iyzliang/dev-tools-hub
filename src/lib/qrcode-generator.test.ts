/**
 * Unit tests for QR Code Generation Utilities
 */

import { describe, it, expect } from "vitest";
import {
  generateQRCodeDataURL,
  generateQRCodeSVG,
  generateQRCodeMatrix,
  generateQRCodeDataURLSync,
  DEFAULT_OPTIONS,
  MIN_SIZE,
  MAX_SIZE,
  MAX_CONTENT_LENGTH,
  type QRCodeOptions,
} from "./qrcode-generator";

// ============================================================================
// generateQRCodeDataURL Tests
// ============================================================================

describe("generateQRCodeDataURL", () => {
  it("should generate DataURL for simple text", async () => {
    const result = await generateQRCodeDataURL("Hello World");

    expect(result.success).toBe(true);
    expect(result.dataURL).toMatch(/^data:image\/png;base64,/);
    expect(result.error).toBeUndefined();
  });

  it("should generate DataURL for URL content", async () => {
    const result = await generateQRCodeDataURL("https://example.com");

    expect(result.success).toBe(true);
    expect(result.dataURL).toMatch(/^data:image\/png;base64,/);
  });

  it("should generate DataURL with custom size", async () => {
    const result = await generateQRCodeDataURL("Test", { size: 512 });

    expect(result.success).toBe(true);
    expect(result.dataURL).toMatch(/^data:image\/png;base64,/);
  });

  it("should generate DataURL with custom colors", async () => {
    const options: QRCodeOptions = {
      foregroundColor: "#FF0000",
      backgroundColor: "#0000FF",
    };
    const result = await generateQRCodeDataURL("Test", options);

    expect(result.success).toBe(true);
    expect(result.dataURL).toMatch(/^data:image\/png;base64,/);
  });

  it("should generate DataURL with all error correction levels", async () => {
    const levels = ["L", "M", "Q", "H"] as const;

    for (const level of levels) {
      const result = await generateQRCodeDataURL("Test", {
        errorCorrectionLevel: level,
      });
      expect(result.success).toBe(true);
    }
  });

  it("should fail with empty content", async () => {
    const result = await generateQRCodeDataURL("");

    expect(result.success).toBe(false);
    expect(result.dataURL).toBe("");
    expect(result.error).toBe("内容不能为空");
  });

  it("should clamp size to minimum", async () => {
    const result = await generateQRCodeDataURL("Test", { size: 10 });

    expect(result.success).toBe(true);
    // Size should be clamped to MIN_SIZE
  });

  it("should clamp size to maximum", async () => {
    const result = await generateQRCodeDataURL("Test", { size: 10000 });

    expect(result.success).toBe(true);
    // Size should be clamped to MAX_SIZE
  });
});

// ============================================================================
// generateQRCodeSVG Tests
// ============================================================================

describe("generateQRCodeSVG", () => {
  it("should generate valid SVG for simple text", async () => {
    const result = await generateQRCodeSVG("Hello World");

    expect(result.success).toBe(true);
    expect(result.svg).toContain("<svg");
    expect(result.svg).toContain("</svg>");
    expect(result.error).toBeUndefined();
  });

  it("should generate SVG with custom colors", async () => {
    const options: QRCodeOptions = {
      foregroundColor: "#FF0000",
      backgroundColor: "#FFFFFF",
    };
    const result = await generateQRCodeSVG("Test", options);

    expect(result.success).toBe(true);
    expect(result.svg).toContain("<svg");
  });

  it("should generate SVG with different error correction levels", async () => {
    const result = await generateQRCodeSVG("Test", {
      errorCorrectionLevel: "H",
    });

    expect(result.success).toBe(true);
    expect(result.svg).toContain("<svg");
  });

  it("should fail with empty content", async () => {
    const result = await generateQRCodeSVG("");

    expect(result.success).toBe(false);
    expect(result.svg).toBe("");
    expect(result.error).toBe("内容不能为空");
  });

  it("should handle Unicode content", async () => {
    const result = await generateQRCodeSVG("你好世界 👋");

    expect(result.success).toBe(true);
    expect(result.svg).toContain("<svg");
  });

  it("should handle long URLs", async () => {
    const longUrl = "https://example.com/path?" + "param=value&".repeat(50);
    const result = await generateQRCodeSVG(longUrl);

    expect(result.success).toBe(true);
    expect(result.svg).toContain("<svg");
  });
});

// ============================================================================
// generateQRCodeMatrix Tests
// ============================================================================

describe("generateQRCodeMatrix", () => {
  it("should generate matrix for simple text", async () => {
    const result = await generateQRCodeMatrix("Hello");

    expect(result.success).toBe(true);
    expect(result.modules).not.toBeNull();
    expect(Array.isArray(result.modules)).toBe(true);
  });

  it("should return square matrix", async () => {
    const result = await generateQRCodeMatrix("Test");

    expect(result.success).toBe(true);
    expect(result.modules).not.toBeNull();

    if (result.modules) {
      const size = result.modules.length;
      expect(size).toBeGreaterThan(0);

      // Check all rows have same length
      for (const row of result.modules) {
        expect(row.length).toBe(size);
      }
    }
  });

  it("should contain boolean values", async () => {
    const result = await generateQRCodeMatrix("Test");

    expect(result.success).toBe(true);

    if (result.modules) {
      for (const row of result.modules) {
        for (const cell of row) {
          expect(typeof cell).toBe("boolean");
        }
      }
    }
  });

  it("should have finder patterns in corners", async () => {
    const result = await generateQRCodeMatrix("Test");

    expect(result.success).toBe(true);

    if (result.modules) {
      // Top-left corner should have finder pattern (7x7 area with specific pattern)
      // First row and column should be dark
      expect(result.modules[0][0]).toBe(true);
      expect(result.modules[0][6]).toBe(true);
      expect(result.modules[6][0]).toBe(true);
    }
  });

  it("should fail with empty content", async () => {
    const result = await generateQRCodeMatrix("");

    expect(result.success).toBe(false);
    expect(result.modules).toBeNull();
    expect(result.error).toBe("内容不能为空");
  });

  it("should generate larger matrix for longer content", async () => {
    const shortResult = await generateQRCodeMatrix("Hi");
    const longResult = await generateQRCodeMatrix(
      "This is a much longer content that will require more modules"
    );

    expect(shortResult.success).toBe(true);
    expect(longResult.success).toBe(true);

    if (shortResult.modules && longResult.modules) {
      expect(longResult.modules.length).toBeGreaterThanOrEqual(
        shortResult.modules.length
      );
    }
  });
});

// ============================================================================
// generateQRCodeDataURLSync Tests
// ============================================================================

describe("generateQRCodeDataURLSync", () => {
  it("should generate DataURL synchronously", () => {
    const result = generateQRCodeDataURLSync("Hello World");

    expect(result.success).toBe(true);
    expect(result.dataURL).toMatch(/^data:image\/svg\+xml;base64,/);
  });

  it("should work with custom options", () => {
    const options: QRCodeOptions = {
      size: 300,
      foregroundColor: "#333333",
      backgroundColor: "#EEEEEE",
      errorCorrectionLevel: "H",
    };
    const result = generateQRCodeDataURLSync("Test", options);

    expect(result.success).toBe(true);
    expect(result.dataURL).toMatch(/^data:image\/svg\+xml;base64,/);
  });

  it("should fail with empty content", () => {
    const result = generateQRCodeDataURLSync("");

    expect(result.success).toBe(false);
    expect(result.dataURL).toBe("");
    expect(result.error).toBe("内容不能为空");
  });

  it("should handle Unicode content", () => {
    const result = generateQRCodeDataURLSync("中文测试 🎉");

    expect(result.success).toBe(true);
    expect(result.dataURL).toMatch(/^data:image\/svg\+xml;base64,/);
  });
});

// ============================================================================
// Constants Tests
// ============================================================================

describe("Constants", () => {
  it("should have valid default options", () => {
    expect(DEFAULT_OPTIONS.size).toBe(256);
    expect(DEFAULT_OPTIONS.errorCorrectionLevel).toBe("M");
    expect(DEFAULT_OPTIONS.foregroundColor).toBe("#000000");
    expect(DEFAULT_OPTIONS.backgroundColor).toBe("#FFFFFF");
    expect(DEFAULT_OPTIONS.margin).toBe(4);
  });

  it("should have valid size limits", () => {
    expect(MIN_SIZE).toBe(64);
    expect(MAX_SIZE).toBe(2048);
    expect(MIN_SIZE).toBeLessThan(MAX_SIZE);
  });

  it("should have valid content length limit", () => {
    expect(MAX_CONTENT_LENGTH).toBe(2953);
    expect(MAX_CONTENT_LENGTH).toBeGreaterThan(0);
  });
});

// ============================================================================
// Edge Cases and Error Handling
// ============================================================================

describe("Edge Cases", () => {
  it("should handle very long content (within limit)", async () => {
    const longContent = "A".repeat(1000);
    const result = await generateQRCodeDataURL(longContent);

    expect(result.success).toBe(true);
  });

  it("should fail with content exceeding limit", async () => {
    const tooLongContent = "A".repeat(3000);
    const result = await generateQRCodeDataURL(tooLongContent);

    expect(result.success).toBe(false);
    expect(result.error).toContain("内容过长");
  });

  it("should handle special characters", async () => {
    const specialContent = '!@#$%^&*()_+-=[]{}|;:",.<>?/\\';
    const result = await generateQRCodeDataURL(specialContent);

    expect(result.success).toBe(true);
  });

  it("should handle newlines and whitespace", async () => {
    const content = "Line 1\nLine 2\r\nLine 3\tTabbed";
    const result = await generateQRCodeDataURL(content);

    expect(result.success).toBe(true);
  });

  it("should handle emoji content", async () => {
    const emojiContent = "Hello 👋 World 🌍 Test 🎉";
    const result = await generateQRCodeDataURL(emojiContent);

    expect(result.success).toBe(true);
  });

  it("should handle WiFi format content", async () => {
    const wifiContent = "WIFI:T:WPA;S:MyNetwork;P:mypassword123;;";
    const result = await generateQRCodeDataURL(wifiContent);

    expect(result.success).toBe(true);
  });

  it("should handle vCard format content", async () => {
    const vcardContent = `BEGIN:VCARD
VERSION:3.0
FN:John Doe
TEL:+1234567890
EMAIL:john@example.com
END:VCARD`;
    const result = await generateQRCodeDataURL(vcardContent);

    expect(result.success).toBe(true);
  });

  it("should handle margin option", async () => {
    const results = await Promise.all([
      generateQRCodeDataURL("Test", { margin: 0 }),
      generateQRCodeDataURL("Test", { margin: 4 }),
      generateQRCodeDataURL("Test", { margin: 10 }),
    ]);

    for (const result of results) {
      expect(result.success).toBe(true);
    }
  });
});

// ============================================================================
// Color Validation Tests
// ============================================================================

describe("Color Options", () => {
  it("should accept hex color codes", async () => {
    const result = await generateQRCodeDataURL("Test", {
      foregroundColor: "#FF5733",
      backgroundColor: "#C0C0C0",
    });

    expect(result.success).toBe(true);
  });

  it("should accept short hex color codes", async () => {
    const result = await generateQRCodeDataURL("Test", {
      foregroundColor: "#F00",
      backgroundColor: "#0F0",
    });

    expect(result.success).toBe(true);
  });

  it("should accept lowercase hex color codes", async () => {
    const result = await generateQRCodeDataURL("Test", {
      foregroundColor: "#ff0000",
      backgroundColor: "#ffffff",
    });

    expect(result.success).toBe(true);
  });

  it("should handle transparent-like colors", async () => {
    const result = await generateQRCodeDataURL("Test", {
      foregroundColor: "#000000",
      backgroundColor: "#FFFFFF00", // With alpha if supported
    });

    // Should still generate something, even if alpha is ignored
    expect(result.success).toBe(true);
  });
});
