import { describe, it, expect } from "vitest";
import {
  validateGridConfig,
  mergeCells,
  generateGridTemplateAreas,
  generateGridCSS,
  generateGridTailwind,
  parseGridTemplateAreas,
  validateMergedAreas,
  type GridConfig,
  type Cell,
  type MergedArea,
} from "./grid-utils";

describe("grid-utils", () => {
  describe("validateGridConfig", () => {
    it("should validate a correct grid config", () => {
      const config: GridConfig = {
        rows: 3,
        cols: 4,
        rowGap: 10,
        colGap: 15,
      };
      const result = validateGridConfig(config);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject invalid row count", () => {
      const config: GridConfig = {
        rows: 15,
        cols: 4,
        rowGap: 10,
        colGap: 15,
      };
      const result = validateGridConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("行数必须在 1-12 之间");
    });

    it("should reject invalid column count", () => {
      const config: GridConfig = {
        rows: 3,
        cols: 0,
        rowGap: 10,
        colGap: 15,
      };
      const result = validateGridConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("列数必须在 1-12 之间");
    });

    it("should reject invalid gap values", () => {
      const config: GridConfig = {
        rows: 3,
        cols: 4,
        rowGap: -5,
        colGap: 150,
      };
      const result = validateGridConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("行间距必须在 0-100px 之间");
      expect(result.errors).toContain("列间距必须在 0-100px 之间");
    });

    it("should reject mismatched row sizes", () => {
      const config: GridConfig = {
        rows: 3,
        cols: 4,
        rowGap: 10,
        colGap: 15,
        rowSizes: ["100px", "200px"],
      };
      const result = validateGridConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("行尺寸数组长度必须与行数匹配");
    });

    it("should reject mismatched column sizes", () => {
      const config: GridConfig = {
        rows: 3,
        cols: 4,
        rowGap: 10,
        colGap: 15,
        colSizes: ["1fr", "2fr"],
      };
      const result = validateGridConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("列尺寸数组长度必须与列数匹配");
    });
  });

  describe("mergeCells", () => {
    it("should merge cells correctly", () => {
      const cells: Cell[] = [
        { row: 0, col: 0 },
        { row: 0, col: 1 },
        { row: 1, col: 0 },
        { row: 1, col: 1 },
      ];

      const result = mergeCells(cells, 0, 0, 1, 1, "header");

      expect(result.cells).toHaveLength(1);
      expect(result.cells[0].rowSpan).toBe(2);
      expect(result.cells[0].colSpan).toBe(2);
      expect(result.cells[0].areaName).toBe("header");
      expect(result.mergedArea.startRow).toBe(0);
      expect(result.mergedArea.endCol).toBe(1);
    });

    it("should merge partial cells", () => {
      const cells: Cell[] = [
        { row: 0, col: 0 },
        { row: 0, col: 1 },
        { row: 1, col: 0 },
        { row: 1, col: 1 },
      ];

      const result = mergeCells(cells, 0, 0, 0, 1, "top-row");

      expect(result.cells).toHaveLength(3);
      const mergedCell = result.cells.find((c) => c.rowSpan);
      expect(mergedCell?.rowSpan).toBe(1);
      expect(mergedCell?.colSpan).toBe(2);
    });
  });

  describe("generateGridTemplateAreas", () => {
    it("should generate empty grid", () => {
      const areas = generateGridTemplateAreas(2, 3, []);
      expect(areas).toHaveLength(2);
      expect(areas[0]).toEqual([".", ".", "."]);
      expect(areas[1]).toEqual([".", ".", "."]);
    });

    it("should generate grid with merged areas", () => {
      const mergedAreas: MergedArea[] = [
        { startRow: 0, startCol: 0, endRow: 0, endCol: 1, name: "header" },
        { startRow: 1, startCol: 0, endRow: 1, endCol: 0, name: "sidebar" },
        { startRow: 1, startCol: 1, endRow: 1, endCol: 1, name: "main" },
      ];

      const areas = generateGridTemplateAreas(2, 2, mergedAreas);

      expect(areas).toEqual([
        ["header", "header"],
        ["sidebar", "main"],
      ]);
    });

    it("should use default area name if not provided", () => {
      const mergedAreas: MergedArea[] = [
        { startRow: 0, startCol: 0, endRow: 0, endCol: 0 },
      ];

      const areas = generateGridTemplateAreas(1, 1, mergedAreas);

      expect(areas[0][0]).toBe("area-1");
    });
  });

  describe("generateGridCSS", () => {
    it("should generate basic CSS", () => {
      const config: GridConfig = {
        rows: 2,
        cols: 3,
        rowGap: 10,
        colGap: 20,
      };

      const css = generateGridCSS(config, []);

      expect(css).toContain("display: grid");
      expect(css).toContain("grid-template-columns: 1fr 1fr 1fr");
      expect(css).toContain("grid-template-rows: auto auto");
      expect(css).toContain("gap: 10px 20px");
    });

    it("should generate CSS with custom sizes", () => {
      const config: GridConfig = {
        rows: 2,
        cols: 2,
        rowGap: 0,
        colGap: 0,
        rowSizes: ["100px", "200px"],
        colSizes: ["1fr", "2fr"],
      };

      const css = generateGridCSS(config, []);

      expect(css).toContain("grid-template-columns: 1fr 2fr");
      expect(css).toContain("grid-template-rows: 100px 200px");
    });

    it("should generate CSS with grid-template-areas", () => {
      const config: GridConfig = {
        rows: 2,
        cols: 2,
        rowGap: 10,
        colGap: 10,
      };

      const mergedAreas: MergedArea[] = [
        { startRow: 0, startCol: 0, endRow: 0, endCol: 1, name: "header" },
        { startRow: 1, startCol: 0, endRow: 1, endCol: 1, name: "content" },
      ];

      const css = generateGridCSS(config, mergedAreas);

      expect(css).toContain("grid-template-areas:");
      expect(css).toContain('"header header"');
      expect(css).toContain('"content content"');
    });

    it("should generate CSS with alignment", () => {
      const config: GridConfig = {
        rows: 2,
        cols: 2,
        rowGap: 0,
        colGap: 0,
      };

      const alignment = {
        justifyItems: "center" as const,
        alignItems: "stretch" as const,
      };

      const css = generateGridCSS(config, [], alignment);

      expect(css).toContain("justify-items: center");
      expect(css).toContain("align-items: stretch");
    });
  });

  describe("generateGridTailwind", () => {
    it("should generate basic Tailwind classes", () => {
      const config: GridConfig = {
        rows: 2,
        cols: 3,
        rowGap: 4,
        colGap: 4,
      };

      const html = generateGridTailwind(config, []);

      expect(html).toContain('class="grid');
      expect(html).toContain("grid-cols-3");
      expect(html).toContain("grid-rows-2");
      expect(html).toContain("gap-4");
    });

    it("should generate separate gap classes", () => {
      const config: GridConfig = {
        rows: 2,
        cols: 2,
        rowGap: 8,
        colGap: 4,
      };

      const html = generateGridTailwind(config, []);

      expect(html).toContain("gap-y-8");
      expect(html).toContain("gap-x-4");
    });

    it("should generate alignment classes", () => {
      const config: GridConfig = {
        rows: 2,
        cols: 2,
        rowGap: 0,
        colGap: 0,
      };

      const alignment = {
        justifyItems: "center" as const,
        alignItems: "start" as const,
        justifyContent: "space-between" as const,
      };

      const html = generateGridTailwind(config, [], alignment);

      expect(html).toContain("justify-items-center");
      expect(html).toContain("items-start");
      expect(html).toContain("justify-between");
    });

    it("should generate children with merged areas", () => {
      const config: GridConfig = {
        rows: 2,
        cols: 2,
        rowGap: 0,
        colGap: 0,
      };

      const mergedAreas: MergedArea[] = [
        { startRow: 0, startCol: 0, endRow: 0, endCol: 1, name: "header" },
        { startRow: 1, startCol: 0, endRow: 1, endCol: 0, name: "sidebar" },
        { startRow: 1, startCol: 1, endRow: 1, endCol: 1, name: "main" },
      ];

      const html = generateGridTailwind(config, mergedAreas);

      expect(html).toContain("col-span-2");
      expect(html).toContain("header");
      expect(html).toContain("sidebar");
      expect(html).toContain("main");
    });
  });

  describe("parseGridTemplateAreas", () => {
    it("should parse grid-template-areas string", () => {
      const areasString = `
        "header header header"
        "sidebar main main"
        "sidebar footer footer"
      `;

      const result = parseGridTemplateAreas(areasString);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual(["header", "header", "header"]);
      expect(result[1]).toEqual(["sidebar", "main", "main"]);
      expect(result[2]).toEqual(["sidebar", "footer", "footer"]);
    });

    it("should handle single line", () => {
      const areasString = `"a b c"`;

      const result = parseGridTemplateAreas(areasString);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(["a", "b", "c"]);
    });
  });

  describe("validateMergedAreas", () => {
    it("should validate correct merged areas", () => {
      const mergedAreas: MergedArea[] = [
        { startRow: 0, startCol: 0, endRow: 0, endCol: 1 },
        { startRow: 1, startCol: 0, endRow: 1, endCol: 0 },
        { startRow: 1, startCol: 1, endRow: 1, endCol: 1 },
      ];

      const result = validateMergedAreas(mergedAreas, 2, 2);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should detect overlapping areas", () => {
      const mergedAreas: MergedArea[] = [
        { startRow: 0, startCol: 0, endRow: 1, endCol: 1 },
        { startRow: 0, startCol: 0, endRow: 0, endCol: 1 },
      ];

      const result = validateMergedAreas(mergedAreas, 2, 2);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("重叠"))).toBe(true);
    });

    it("should detect out of range areas", () => {
      const mergedAreas: MergedArea[] = [
        { startRow: 0, startCol: 0, endRow: 3, endCol: 3 },
      ];

      const result = validateMergedAreas(mergedAreas, 2, 2);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("区域 1 的结束行超出范围");
      expect(result.errors).toContain("区域 1 的结束列超出范围");
    });

    it("should detect invalid area boundaries", () => {
      const mergedAreas: MergedArea[] = [
        { startRow: 1, startCol: 1, endRow: 0, endCol: 0 },
      ];

      const result = validateMergedAreas(mergedAreas, 2, 2);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("区域 1 的起始行不能大于结束行");
      expect(result.errors).toContain("区域 1 的起始列不能大于结束列");
    });
  });
});