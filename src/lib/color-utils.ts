/**
 * Color Conversion Utilities
 *
 * Provides conversion functions between Hex, RGB, RGBA, HSL, HSLA color formats.
 * Uses RGBA as the internal intermediate format for all conversions.
 */

// ============================================================================
// Types
// ============================================================================

/**
 * RGBA color representation (internal intermediate format)
 */
export interface RGBA {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
  a: number; // 0-1
}

/**
 * RGB color representation
 */
export interface RGB {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
}

/**
 * HSL color representation
 */
export interface HSL {
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
}

/**
 * HSLA color representation
 */
export interface HSLA {
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
  a: number; // 0-1
}

/**
 * Supported color format types
 */
export type ColorFormat = "hex" | "rgb" | "rgba" | "hsl" | "hsla";

/**
 * Display names for each format
 */
export const COLOR_FORMAT_NAMES: Record<ColorFormat, string> = {
  hex: "HEX",
  rgb: "RGB",
  rgba: "RGBA",
  hsl: "HSL",
  hsla: "HSLA",
};

// ============================================================================
// Hex Parsing and Conversion
// ============================================================================

/**
 * Parses a hex color string to RGBA
 * Supports: #RGB, #RRGGBB, #RRGGBBAA, RGB, RRGGBB, RRGGBBAA
 *
 * @param hex - The hex color string
 * @returns RGBA object or null if invalid
 */
export function parseHex(hex: string): RGBA | null {
  try {
    let cleaned = hex.trim();

    // Add # if missing
    if (!cleaned.startsWith("#")) {
      cleaned = "#" + cleaned;
    }

    // Remove #
    cleaned = cleaned.slice(1);

    // Validate hex characters
    if (!/^[0-9a-fA-F]+$/.test(cleaned)) {
      return null;
    }

    let r: number, g: number, b: number, a: number = 1;

    if (cleaned.length === 3) {
      // #RGB -> #RRGGBB
      r = parseInt(cleaned[0] + cleaned[0], 16);
      g = parseInt(cleaned[1] + cleaned[1], 16);
      b = parseInt(cleaned[2] + cleaned[2], 16);
    } else if (cleaned.length === 4) {
      // #RGBA -> #RRGGBBAA
      r = parseInt(cleaned[0] + cleaned[0], 16);
      g = parseInt(cleaned[1] + cleaned[1], 16);
      b = parseInt(cleaned[2] + cleaned[2], 16);
      a = parseInt(cleaned[3] + cleaned[3], 16) / 255;
    } else if (cleaned.length === 6) {
      // #RRGGBB
      r = parseInt(cleaned.slice(0, 2), 16);
      g = parseInt(cleaned.slice(2, 4), 16);
      b = parseInt(cleaned.slice(4, 6), 16);
    } else if (cleaned.length === 8) {
      // #RRGGBBAA
      r = parseInt(cleaned.slice(0, 2), 16);
      g = parseInt(cleaned.slice(2, 4), 16);
      b = parseInt(cleaned.slice(4, 6), 16);
      a = parseInt(cleaned.slice(6, 8), 16) / 255;
    } else {
      return null;
    }

    // Validate values
    if (isNaN(r) || isNaN(g) || isNaN(b) || isNaN(a)) {
      return null;
    }

    return { r, g, b, a };
  } catch {
    return null;
  }
}

/**
 * Converts RGBA to hex string
 *
 * @param rgba - The RGBA color
 * @param includeAlpha - Whether to include alpha channel
 * @returns Hex color string
 */
export function toHex(rgba: RGBA, includeAlpha = false): string {
  const toHexPart = (n: number) => Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, "0");

  const hex = "#" + toHexPart(rgba.r) + toHexPart(rgba.g) + toHexPart(rgba.b);

  if (includeAlpha && rgba.a < 1) {
    return hex + toHexPart(Math.round(rgba.a * 255));
  }

  return hex;
}

// ============================================================================
// RGB Parsing and Conversion
// ============================================================================

/**
 * Parses an RGB string to RGBA
 * Supports: rgb(r, g, b), rgb(r g b)
 *
 * @param rgb - The RGB color string
 * @returns RGBA object or null if invalid
 */
export function parseRgb(rgb: string): RGBA | null {
  try {
    const cleaned = rgb.trim().toLowerCase();

    // Match rgb(r, g, b) or rgb(r g b)
    const match = cleaned.match(/^rgb\s*\(\s*(\d+(?:\.\d+)?)\s*[,\s]\s*(\d+(?:\.\d+)?)\s*[,\s]\s*(\d+(?:\.\d+)?)\s*\)$/);

    if (!match) {
      return null;
    }

    const r = parseFloat(match[1]);
    const g = parseFloat(match[2]);
    const b = parseFloat(match[3]);

    if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
      return null;
    }

    return { r, g, b, a: 1 };
  } catch {
    return null;
  }
}

/**
 * Parses an RGBA string to RGBA
 * Supports: rgba(r, g, b, a), rgba(r g b / a)
 *
 * @param rgba - The RGBA color string
 * @returns RGBA object or null if invalid
 */
export function parseRgba(rgba: string): RGBA | null {
  try {
    const cleaned = rgba.trim().toLowerCase();

    // Match rgba(r, g, b, a) or rgba(r g b / a)
    const match = cleaned.match(/^rgba\s*\(\s*(\d+(?:\.\d+)?)\s*[,\s]\s*(\d+(?:\.\d+)?)\s*[,\s]\s*(\d+(?:\.\d+)?)\s*[,\s/]\s*(\d*\.?\d+%?)\s*\)$/);

    if (!match) {
      return null;
    }

    const r = parseFloat(match[1]);
    const g = parseFloat(match[2]);
    const b = parseFloat(match[3]);

    let a: number;
    const alphaStr = match[4];
    if (alphaStr.endsWith("%")) {
      a = parseFloat(alphaStr) / 100;
    } else {
      a = parseFloat(alphaStr);
    }

    if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255 || a < 0 || a > 1) {
      return null;
    }

    return { r, g, b, a };
  } catch {
    return null;
  }
}

/**
 * Converts RGBA to RGB string
 *
 * @param rgba - The RGBA color
 * @returns RGB string
 */
export function toRgb(rgba: RGBA): string {
  const r = Math.round(Math.max(0, Math.min(255, rgba.r)));
  const g = Math.round(Math.max(0, Math.min(255, rgba.g)));
  const b = Math.round(Math.max(0, Math.min(255, rgba.b)));
  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Converts RGBA to RGBA string
 *
 * @param rgba - The RGBA color
 * @returns RGBA string
 */
export function toRgba(rgba: RGBA): string {
  const r = Math.round(Math.max(0, Math.min(255, rgba.r)));
  const g = Math.round(Math.max(0, Math.min(255, rgba.g)));
  const b = Math.round(Math.max(0, Math.min(255, rgba.b)));
  const a = Math.max(0, Math.min(1, rgba.a)).toFixed(2).replace(/\.?0+$/, "");
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

// ============================================================================
// HSL Parsing and Conversion
// ============================================================================

/**
 * Parses an HSL string to RGBA
 * Supports: hsl(h, s%, l%), hsl(h s% l%)
 *
 * @param hsl - The HSL color string
 * @returns RGBA object or null if invalid
 */
export function parseHsl(hsl: string): RGBA | null {
  try {
    const cleaned = hsl.trim().toLowerCase();

    // Match hsl(h, s%, l%) or hsl(h s% l%)
    const match = cleaned.match(/^hsl\s*\(\s*(\d+(?:\.\d+)?)\s*[,\s]\s*(\d+(?:\.\d+)?)%\s*[,\s]\s*(\d+(?:\.\d+)?)%\s*\)$/);

    if (!match) {
      return null;
    }

    const h = parseFloat(match[1]);
    const s = parseFloat(match[2]);
    const l = parseFloat(match[3]);

    if (h < 0 || h > 360 || s < 0 || s > 100 || l < 0 || l > 100) {
      return null;
    }

    const rgb = hslToRgb(h, s, l);
    return { ...rgb, a: 1 };
  } catch {
    return null;
  }
}

/**
 * Parses an HSLA string to RGBA
 * Supports: hsla(h, s%, l%, a), hsla(h s% l% / a)
 *
 * @param hsla - The HSLA color string
 * @returns RGBA object or null if invalid
 */
export function parseHsla(hsla: string): RGBA | null {
  try {
    const cleaned = hsla.trim().toLowerCase();

    // Match hsla(h, s%, l%, a) or hsla(h s% l% / a)
    const match = cleaned.match(/^hsla\s*\(\s*(\d+(?:\.\d+)?)\s*[,\s]\s*(\d+(?:\.\d+)?)%\s*[,\s]\s*(\d+(?:\.\d+)?)%\s*[,\s/]\s*(\d*\.?\d+%?)\s*\)$/);

    if (!match) {
      return null;
    }

    const h = parseFloat(match[1]);
    const s = parseFloat(match[2]);
    const l = parseFloat(match[3]);

    let a: number;
    const alphaStr = match[4];
    if (alphaStr.endsWith("%")) {
      a = parseFloat(alphaStr) / 100;
    } else {
      a = parseFloat(alphaStr);
    }

    if (h < 0 || h > 360 || s < 0 || s > 100 || l < 0 || l > 100 || a < 0 || a > 1) {
      return null;
    }

    const rgb = hslToRgb(h, s, l);
    return { ...rgb, a };
  } catch {
    return null;
  }
}

/**
 * Converts HSL to RGB
 *
 * @param h - Hue (0-360)
 * @param s - Saturation (0-100)
 * @param l - Lightness (0-100)
 * @returns RGB object
 */
export function hslToRgb(h: number, s: number, l: number): RGB {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0, g = 0, b = 0;

  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0;
  } else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x;
  } else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c;
  } else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c;
  } else {
    r = c; g = 0; b = x;
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

/**
 * Converts RGB to HSL
 *
 * @param r - Red (0-255)
 * @param g - Green (0-255)
 * @param b - Blue (0-255)
 * @returns HSL object
 */
export function rgbToHsl(r: number, g: number, b: number): HSL {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;

  let h = 0;
  let s = 0;

  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Converts RGBA to HSL string
 *
 * @param rgba - The RGBA color
 * @returns HSL string
 */
export function toHsl(rgba: RGBA): string {
  const hsl = rgbToHsl(rgba.r, rgba.g, rgba.b);
  return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
}

/**
 * Converts RGBA to HSLA string
 *
 * @param rgba - The RGBA color
 * @returns HSLA string
 */
export function toHsla(rgba: RGBA): string {
  const hsl = rgbToHsl(rgba.r, rgba.g, rgba.b);
  const a = Math.max(0, Math.min(1, rgba.a)).toFixed(2).replace(/\.?0+$/, "");
  return `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${a})`;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Parses any supported color string to RGBA
 *
 * @param color - The color string
 * @returns RGBA object or null if invalid
 */
export function parseColor(color: string): RGBA | null {
  const trimmed = color.trim();
  if (!trimmed) return null;

  // Try hex first
  if (trimmed.startsWith("#") || /^[0-9a-fA-F]+$/.test(trimmed)) {
    return parseHex(trimmed);
  }

  // Try rgba
  if (trimmed.toLowerCase().startsWith("rgba")) {
    return parseRgba(trimmed);
  }

  // Try rgb
  if (trimmed.toLowerCase().startsWith("rgb")) {
    return parseRgb(trimmed);
  }

  // Try hsla
  if (trimmed.toLowerCase().startsWith("hsla")) {
    return parseHsla(trimmed);
  }

  // Try hsl
  if (trimmed.toLowerCase().startsWith("hsl")) {
    return parseHsl(trimmed);
  }

  return null;
}

/**
 * Converts RGBA to all color formats
 *
 * @param rgba - The RGBA color
 * @returns Object containing all format strings
 */
export function toAllFormats(rgba: RGBA): Record<ColorFormat, string> {
  return {
    hex: toHex(rgba),
    rgb: toRgb(rgba),
    rgba: toRgba(rgba),
    hsl: toHsl(rgba),
    hsla: toHsla(rgba),
  };
}

/**
 * Creates a default RGBA color
 *
 * @returns Default RGBA color (black with full opacity)
 */
export function defaultRgba(): RGBA {
  return { r: 0, g: 0, b: 0, a: 1 };
}

/**
 * Clamps alpha value to valid range
 *
 * @param a - Alpha value
 * @returns Clamped alpha (0-1)
 */
export function clampAlpha(a: number): number {
  return Math.max(0, Math.min(1, a));
}