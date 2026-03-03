import { describe, it, expect } from "vitest";
import {
  validateShadowParams,
  hexToRgba,
  generateBoxShadowCSS,
  generateTailwindShadow,
  parseBoxShadow,
  generateCSSVariable,
  clamp,
  normalizeShadowParams,
  type ShadowParams,
} from "./shadow-utils";

describe("shadow-utils", () => {
  describe("validateShadowParams", () => {
    it("should validate correct shadow parameters", () => {
      const params: ShadowParams = {
        x: 10,
        y: 10,
        blur: 20,
        spread: 5,
        color: "#000000",
        opacity: 0.5,
        inset: false,
      };
      const result = validateShadowParams(params);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject invalid X offset", () => {
      const params: ShadowParams = {
        x: 150,
        y: 10,
        blur: 20,
        spread: 5,
        color: "#000000",
        opacity: 0.5,
        inset: false,
      };
      const result = validateShadowParams(params);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("X 偏移必须在 -100px 到 100px 之间");
    });

    it("should reject invalid Y offset", () => {
      const params: ShadowParams = {
        x: 10,
        y: -150,
        blur: 20,
        spread: 5,
        color: "#000000",
        opacity: 0.5,
        inset: false,
      };
      const result = validateShadowParams(params);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Y 偏移必须在 -100px 到 100px 之间");
    });

    it("should reject invalid blur", () => {
      const params: ShadowParams = {
        x: 10,
        y: 10,
        blur: -5,
        spread: 5,
        color: "#000000",
        opacity: 0.5,
        inset: false,
      };
      const result = validateShadowParams(params);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("模糊半径必须在 0px 到 100px 之间");
    });

    it("should reject invalid spread", () => {
      const params: ShadowParams = {
        x: 10,
        y: 10,
        blur: 20,
        spread: 100,
        color: "#000000",
        opacity: 0.5,
        inset: false,
      };
      const result = validateShadowParams(params);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("扩散半径必须在 -50px 到 50px 之间");
    });

    it("should reject invalid opacity", () => {
      const params: ShadowParams = {
        x: 10,
        y: 10,
        blur: 20,
        spread: 5,
        color: "#000000",
        opacity: 1.5,
        inset: false,
      };
      const result = validateShadowParams(params);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("透明度必须在 0 到 1 之间");
    });

    it("should accept various color formats", () => {
      const colors = ["#000", "#000000", "rgb(0, 0, 0)", "rgba(0, 0, 0, 0.5)", "black"];
      
      colors.forEach((color) => {
        const params: ShadowParams = {
          x: 0,
          y: 0,
          blur: 0,
          spread: 0,
          color,
          opacity: 1,
          inset: false,
        };
        const result = validateShadowParams(params);
        expect(result.valid).toBe(true);
      });
    });
  });

  describe("hexToRgba", () => {
    it("should convert 6-digit hex to rgba", () => {
      const result = hexToRgba("#ff0000", 0.5);
      expect(result).toBe("rgba(255, 0, 0, 0.5)");
    });

    it("should convert 3-digit hex to rgba", () => {
      const result = hexToRgba("#f00", 0.5);
      expect(result).toBe("rgba(255, 0, 0, 0.5)");
    });

    it("should handle black color", () => {
      const result = hexToRgba("#000000", 1);
      expect(result).toBe("rgba(0, 0, 0, 1)");
    });

    it("should handle white color", () => {
      const result = hexToRgba("#ffffff", 1);
      expect(result).toBe("rgba(255, 255, 255, 1)");
    });
  });

  describe("generateBoxShadowCSS", () => {
    it("should generate basic box-shadow CSS", () => {
      const params: ShadowParams = {
        x: 0,
        y: 4,
        blur: 6,
        spread: -1,
        color: "#000000",
        opacity: 0.1,
        inset: false,
      };

      const result = generateBoxShadowCSS(params);

      expect(result).toContain("box-shadow:");
      expect(result).toContain("0px");
      expect(result).toContain("4px");
      expect(result).toContain("6px");
      expect(result).toContain("-1px");
      expect(result).toContain("rgba(0, 0, 0, 0.1)");
    });

    it("should generate inset box-shadow", () => {
      const params: ShadowParams = {
        x: 0,
        y: 2,
        blur: 4,
        spread: 0,
        color: "#000000",
        opacity: 0.06,
        inset: true,
      };

      const result = generateBoxShadowCSS(params);

      expect(result).toContain("inset");
    });

    it("should handle multiple shadows", () => {
      const params: ShadowParams[] = [
        { x: 0, y: 4, blur: 6, spread: -1, color: "#000000", opacity: 0.1, inset: false },
        { x: 0, y: 2, blur: 4, spread: -1, color: "#000000", opacity: 0.06, inset: false },
      ];

      const result = generateBoxShadowCSS(params);

      expect(result).toContain(",");
    });

    it("should handle rgb color input", () => {
      const params: ShadowParams = {
        x: 0,
        y: 4,
        blur: 6,
        spread: 0,
        color: "rgb(255, 0, 0)",
        opacity: 1,
        inset: false,
      };

      const result = generateBoxShadowCSS(params);

      expect(result).toContain("rgb(255, 0, 0)");
    });
  });

  describe("generateTailwindShadow", () => {
    it("should generate Tailwind arbitrary property class", () => {
      const params: ShadowParams = {
        x: 0,
        y: 4,
        blur: 6,
        spread: -1,
        color: "#000000",
        opacity: 0.1,
        inset: false,
      };

      const result = generateTailwindShadow(params);

      expect(result).toContain("[box-shadow:");
      expect(result).toContain("]");
    });
  });

  describe("parseBoxShadow", () => {
    it("should parse basic box-shadow CSS", () => {
      const css = "box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);";
      const result = parseBoxShadow(css);

      expect(result).toHaveLength(1);
      expect(result[0].x).toBe(0);
      expect(result[0].y).toBe(4);
      expect(result[0].blur).toBe(6);
      expect(result[0].spread).toBe(-1);
      expect(result[0].opacity).toBe(0.1);
    });

    it("should parse inset shadow", () => {
      const css = "box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);";
      const result = parseBoxShadow(css);

      expect(result).toHaveLength(1);
      expect(result[0].inset).toBe(true);
    });

    it("should parse multiple shadows", () => {
      const css = "box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);";
      const result = parseBoxShadow(css);

      expect(result).toHaveLength(2);
    });

    it("should return empty array for invalid input", () => {
      const result = parseBoxShadow("invalid css");
      expect(result).toHaveLength(0);
    });
  });

  describe("generateCSSVariable", () => {
    it("should generate CSS variable for shadow", () => {
      const params: ShadowParams = {
        x: 0,
        y: 4,
        blur: 6,
        spread: 0,
        color: "#000000",
        opacity: 0.1,
        inset: false,
      };

      const result = generateCSSVariable("shadow-sm", params);

      expect(result).toContain("--shadow-sm:");
      expect(result).toContain("rgba(0, 0, 0, 0.1)");
    });
  });

  describe("clamp", () => {
    it("should clamp value within range", () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
    });
  });

  describe("normalizeShadowParams", () => {
    it("should normalize partial parameters", () => {
      const result = normalizeShadowParams({ x: 150 });

      expect(result.x).toBe(100);
      expect(result.y).toBe(0);
      expect(result.blur).toBe(0);
      expect(result.spread).toBe(0);
      expect(result.color).toBe("#000000");
      expect(result.opacity).toBe(1);
      expect(result.inset).toBe(false);
    });

    it("should clamp all values", () => {
      const result = normalizeShadowParams({
        x: -150,
        y: 150,
        blur: 150,
        spread: 100,
        opacity: 2,
      });

      expect(result.x).toBe(-100);
      expect(result.y).toBe(100);
      expect(result.blur).toBe(100);
      expect(result.spread).toBe(50);
      expect(result.opacity).toBe(1);
    });
  });
});