import { describe, it, expect } from "vitest";
import {
  parseHex,
  toHex,
  parseRgb,
  parseRgba,
  toRgb,
  toRgba,
  parseHsl,
  parseHsla,
  toHsl,
  toHsla,
  hslToRgb,
  rgbToHsl,
  parseColor,
  toAllFormats,
  defaultRgba,
  clampAlpha,
} from "./color-utils";

describe("parseHex", () => {
  it("parses 6-digit hex", () => {
    expect(parseHex("#ff0000")).toEqual({ r: 255, g: 0, b: 0, a: 1 });
    expect(parseHex("#00ff00")).toEqual({ r: 0, g: 255, b: 0, a: 1 });
    expect(parseHex("#0000ff")).toEqual({ r: 0, g: 0, b: 255, a: 1 });
  });

  it("parses 3-digit hex (shorthand)", () => {
    expect(parseHex("#f00")).toEqual({ r: 255, g: 0, b: 0, a: 1 });
    expect(parseHex("#0f0")).toEqual({ r: 0, g: 255, b: 0, a: 1 });
    expect(parseHex("#00f")).toEqual({ r: 0, g: 0, b: 255, a: 1 });
  });

  it("parses 8-digit hex with alpha", () => {
    expect(parseHex("#ff000080")).toEqual({ r: 255, g: 0, b: 0, a: 128 / 255 });
  });

  it("parses 4-digit hex with alpha (shorthand)", () => {
    expect(parseHex("#f008")).toEqual({ r: 255, g: 0, b: 0, a: 136 / 255 });
  });

  it("parses hex without # prefix", () => {
    expect(parseHex("ff0000")).toEqual({ r: 255, g: 0, b: 0, a: 1 });
    expect(parseHex("f00")).toEqual({ r: 255, g: 0, b: 0, a: 1 });
  });

  it("returns null for invalid hex", () => {
    expect(parseHex("")).toBeNull();
    expect(parseHex("#")).toBeNull();
    expect(parseHex("#gggggg")).toBeNull();
    expect(parseHex("#ff")).toBeNull();
  });
});

describe("toHex", () => {
  it("converts RGBA to hex", () => {
    expect(toHex({ r: 255, g: 0, b: 0, a: 1 })).toBe("#ff0000");
    expect(toHex({ r: 0, g: 255, b: 0, a: 1 })).toBe("#00ff00");
    expect(toHex({ r: 0, g: 0, b: 255, a: 1 })).toBe("#0000ff");
  });

  it("includes alpha when includeAlpha is true and alpha < 1", () => {
    expect(toHex({ r: 255, g: 0, b: 0, a: 0.5 }, true)).toBe("#ff000080");
  });

  it("does not include alpha when alpha is 1", () => {
    expect(toHex({ r: 255, g: 0, b: 0, a: 1 }, true)).toBe("#ff0000");
  });
});

describe("parseRgb", () => {
  it("parses rgb() format", () => {
    expect(parseRgb("rgb(255, 0, 0)")).toEqual({ r: 255, g: 0, b: 0, a: 1 });
    expect(parseRgb("rgb(0, 255, 0)")).toEqual({ r: 0, g: 255, b: 0, a: 1 });
    expect(parseRgb("rgb(0, 0, 255)")).toEqual({ r: 0, g: 0, b: 255, a: 1 });
  });

  it("parses rgb() with space-separated values", () => {
    expect(parseRgb("rgb(255 0 0)")).toEqual({ r: 255, g: 0, b: 0, a: 1 });
  });

  it("returns null for invalid rgb", () => {
    expect(parseRgb("rgb(300, 0, 0)")).toBeNull();
    expect(parseRgb("rgb(255, 0)")).toBeNull();
    expect(parseRgb("rgba(255, 0, 0)")).toBeNull();
  });
});

describe("parseRgba", () => {
  it("parses rgba() format", () => {
    expect(parseRgba("rgba(255, 0, 0, 1)")).toEqual({ r: 255, g: 0, b: 0, a: 1 });
    expect(parseRgba("rgba(255, 0, 0, 0.5)")).toEqual({ r: 255, g: 0, b: 0, a: 0.5 });
  });

  it("parses rgba() with percentage alpha", () => {
    expect(parseRgba("rgba(255, 0, 0, 50%)")).toEqual({ r: 255, g: 0, b: 0, a: 0.5 });
  });

  it("parses rgba() with space-separated values", () => {
    expect(parseRgba("rgba(255 0 0 / 0.5)")).toEqual({ r: 255, g: 0, b: 0, a: 0.5 });
  });

  it("returns null for invalid rgba", () => {
    expect(parseRgba("rgba(255, 0, 0, 2)")).toBeNull();
    expect(parseRgba("rgba(255, 0, 0, -0.5)")).toBeNull();
  });
});

describe("toRgb", () => {
  it("converts RGBA to rgb string", () => {
    expect(toRgb({ r: 255, g: 0, b: 0, a: 1 })).toBe("rgb(255, 0, 0)");
    expect(toRgb({ r: 0, g: 255, b: 0, a: 0.5 })).toBe("rgb(0, 255, 0)");
  });
});

describe("toRgba", () => {
  it("converts RGBA to rgba string", () => {
    expect(toRgba({ r: 255, g: 0, b: 0, a: 1 })).toBe("rgba(255, 0, 0, 1)");
    expect(toRgba({ r: 255, g: 0, b: 0, a: 0.5 })).toBe("rgba(255, 0, 0, 0.5)");
  });

  it("removes trailing zeros from alpha", () => {
    expect(toRgba({ r: 255, g: 0, b: 0, a: 0.5 })).toBe("rgba(255, 0, 0, 0.5)");
  });
});

describe("hslToRgb", () => {
  it("converts HSL to RGB", () => {
    // Red
    const red = hslToRgb(0, 100, 50);
    expect(red.r).toBe(255);
    expect(red.g).toBe(0);
    expect(red.b).toBe(0);

    // Green
    const green = hslToRgb(120, 100, 50);
    expect(green.r).toBe(0);
    expect(green.g).toBe(255);
    expect(green.b).toBe(0);

    // Blue
    const blue = hslToRgb(240, 100, 50);
    expect(blue.r).toBe(0);
    expect(blue.g).toBe(0);
    expect(blue.b).toBe(255);
  });

  it("handles gray (0 saturation)", () => {
    const gray = hslToRgb(0, 0, 50);
    expect(gray.r).toBe(128);
    expect(gray.g).toBe(128);
    expect(gray.b).toBe(128);
  });
});

describe("rgbToHsl", () => {
  it("converts RGB to HSL", () => {
    // Red
    const red = rgbToHsl(255, 0, 0);
    expect(red.h).toBe(0);
    expect(red.s).toBe(100);
    expect(red.l).toBe(50);

    // Green
    const green = rgbToHsl(0, 255, 0);
    expect(green.h).toBe(120);
    expect(green.s).toBe(100);
    expect(green.l).toBe(50);

    // Blue
    const blue = rgbToHsl(0, 0, 255);
    expect(blue.h).toBe(240);
    expect(blue.s).toBe(100);
    expect(blue.l).toBe(50);
  });

  it("handles gray", () => {
    const gray = rgbToHsl(128, 128, 128);
    expect(gray.s).toBe(0);
    expect(gray.l).toBe(50);
  });
});

describe("parseHsl", () => {
  it("parses hsl() format", () => {
    expect(parseHsl("hsl(0, 100%, 50%)")).toEqual({ r: 255, g: 0, b: 0, a: 1 });
    expect(parseHsl("hsl(120, 100%, 50%)")).toEqual({ r: 0, g: 255, b: 0, a: 1 });
    expect(parseHsl("hsl(240, 100%, 50%)")).toEqual({ r: 0, g: 0, b: 255, a: 1 });
  });

  it("parses hsl() with space-separated values", () => {
    expect(parseHsl("hsl(0 100% 50%)")).toEqual({ r: 255, g: 0, b: 0, a: 1 });
  });

  it("returns null for invalid hsl", () => {
    expect(parseHsl("hsl(400, 100%, 50%)")).toBeNull();
    expect(parseHsl("hsl(0, 150%, 50%)")).toBeNull();
  });
});

describe("parseHsla", () => {
  it("parses hsla() format", () => {
    expect(parseHsla("hsla(0, 100%, 50%, 1)")).toEqual({ r: 255, g: 0, b: 0, a: 1 });
    expect(parseHsla("hsla(0, 100%, 50%, 0.5)")).toEqual({ r: 255, g: 0, b: 0, a: 0.5 });
  });

  it("parses hsla() with percentage alpha", () => {
    expect(parseHsla("hsla(0, 100%, 50%, 50%)")).toEqual({ r: 255, g: 0, b: 0, a: 0.5 });
  });

  it("returns null for invalid hsla", () => {
    expect(parseHsla("hsla(0, 100%, 50%, 2)")).toBeNull();
  });
});

describe("toHsl", () => {
  it("converts RGBA to hsl string", () => {
    expect(toHsl({ r: 255, g: 0, b: 0, a: 1 })).toBe("hsl(0, 100%, 50%)");
  });
});

describe("toHsla", () => {
  it("converts RGBA to hsla string", () => {
    expect(toHsla({ r: 255, g: 0, b: 0, a: 1 })).toBe("hsla(0, 100%, 50%, 1)");
    expect(toHsla({ r: 255, g: 0, b: 0, a: 0.5 })).toBe("hsla(0, 100%, 50%, 0.5)");
  });
});

describe("parseColor", () => {
  it("parses hex colors", () => {
    expect(parseColor("#ff0000")).toEqual({ r: 255, g: 0, b: 0, a: 1 });
    expect(parseColor("ff0000")).toEqual({ r: 255, g: 0, b: 0, a: 1 });
  });

  it("parses rgb colors", () => {
    expect(parseColor("rgb(255, 0, 0)")).toEqual({ r: 255, g: 0, b: 0, a: 1 });
  });

  it("parses rgba colors", () => {
    expect(parseColor("rgba(255, 0, 0, 0.5)")).toEqual({ r: 255, g: 0, b: 0, a: 0.5 });
  });

  it("parses hsl colors", () => {
    expect(parseColor("hsl(0, 100%, 50%)")).toEqual({ r: 255, g: 0, b: 0, a: 1 });
  });

  it("parses hsla colors", () => {
    expect(parseColor("hsla(0, 100%, 50%, 0.5)")).toEqual({ r: 255, g: 0, b: 0, a: 0.5 });
  });

  it("returns null for empty string", () => {
    expect(parseColor("")).toBeNull();
  });

  it("returns null for invalid format", () => {
    expect(parseColor("invalid")).toBeNull();
  });
});

describe("toAllFormats", () => {
  it("converts RGBA to all formats", () => {
    const formats = toAllFormats({ r: 255, g: 0, b: 0, a: 1 });
    expect(formats.hex).toBe("#ff0000");
    expect(formats.rgb).toBe("rgb(255, 0, 0)");
    expect(formats.rgba).toBe("rgba(255, 0, 0, 1)");
    expect(formats.hsl).toBe("hsl(0, 100%, 50%)");
    expect(formats.hsla).toBe("hsla(0, 100%, 50%, 1)");
  });
});

describe("defaultRgba", () => {
  it("returns black with full opacity", () => {
    expect(defaultRgba()).toEqual({ r: 0, g: 0, b: 0, a: 1 });
  });
});

describe("clampAlpha", () => {
  it("clamps values to 0-1 range", () => {
    expect(clampAlpha(-0.5)).toBe(0);
    expect(clampAlpha(0.5)).toBe(0.5);
    expect(clampAlpha(1.5)).toBe(1);
  });
});