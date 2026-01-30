import { describe, it, expect } from "vitest";
import {
  validateBaseInput,
  getValidationError,
  convertToDecimal,
  convertFromDecimal,
  convertBase,
  convertAllBases,
  BASE_RADIX_MAP,
  BASE_CHAR_SETS,
  BASE_CHAR_DESCRIPTIONS,
  BASE_NAMES,
  BASE_PREFIXES,
  BASE_TYPES,
  DEFAULT_BASE,
} from "./base-converter";

describe("validateBaseInput", () => {
  it("validates binary input correctly", () => {
    expect(validateBaseInput("1010", "binary")).toBe(true);
    expect(validateBaseInput("0", "binary")).toBe(true);
    expect(validateBaseInput("1", "binary")).toBe(true);
  });

  it("rejects invalid binary input", () => {
    expect(validateBaseInput("1020", "binary")).toBe(false);
    expect(validateBaseInput("2", "binary")).toBe(false);
    expect(validateBaseInput("abc", "binary")).toBe(false);
    expect(validateBaseInput("", "binary")).toBe(false);
  });

  it("validates octal input correctly", () => {
    expect(validateBaseInput("1234", "octal")).toBe(true);
    expect(validateBaseInput("0", "octal")).toBe(true);
    expect(validateBaseInput("7777", "octal")).toBe(true);
  });

  it("rejects invalid octal input", () => {
    expect(validateBaseInput("890", "octal")).toBe(false);
    expect(validateBaseInput("a", "octal")).toBe(false);
    expect(validateBaseInput("", "octal")).toBe(false);
  });

  it("validates decimal input correctly", () => {
    expect(validateBaseInput("1234", "decimal")).toBe(true);
    expect(validateBaseInput("0", "decimal")).toBe(true);
    expect(validateBaseInput("99999", "decimal")).toBe(true);
  });

  it("rejects invalid decimal input", () => {
    expect(validateBaseInput("abc", "decimal")).toBe(false);
    expect(validateBaseInput("12.34", "decimal")).toBe(false);
    expect(validateBaseInput("", "decimal")).toBe(false);
  });

  it("validates hexadecimal input correctly", () => {
    expect(validateBaseInput("1a2b", "hexadecimal")).toBe(true);
    expect(validateBaseInput("1A2B", "hexadecimal")).toBe(true);
    expect(validateBaseInput("0", "hexadecimal")).toBe(true);
    expect(validateBaseInput("FF", "hexadecimal")).toBe(true);
  });

  it("rejects invalid hexadecimal input", () => {
    expect(validateBaseInput("ghi", "hexadecimal")).toBe(false);
    expect(validateBaseInput("", "hexadecimal")).toBe(false);
  });

  it("handles whitespace correctly", () => {
    expect(validateBaseInput("  1010  ", "binary")).toBe(false);
    expect(validateBaseInput("", "decimal")).toBe(false);
  });
});

describe("getValidationError", () => {
  it("returns error for empty input", () => {
    expect(getValidationError("", "decimal")).toBe("请输入数字");
    expect(getValidationError("   ", "binary")).toBe("请输入数字");
  });

  it("returns error for invalid binary input", () => {
    expect(getValidationError("1020", "binary")).toBe("无效的二进制格式，仅支持 0 和 1");
  });

  it("returns error for invalid octal input", () => {
    expect(getValidationError("89", "octal")).toBe("无效的八进制格式，支持 0-7");
  });

  it("returns error for invalid decimal input", () => {
    expect(getValidationError("abc", "decimal")).toBe("无效的十进制格式，支持 0-9");
  });

  it("returns error for invalid hexadecimal input", () => {
    expect(getValidationError("gh", "hexadecimal")).toBe("无效的十六进制格式，支持 0-9, a-f, A-F");
  });

  it("returns null for valid input", () => {
    expect(getValidationError("1010", "binary")).toBe(null);
    expect(getValidationError("1234", "octal")).toBe(null);
    expect(getValidationError("9999", "decimal")).toBe(null);
    expect(getValidationError("1a2b", "hexadecimal")).toBe(null);
  });
});

describe("convertToDecimal", () => {
  it("converts binary to decimal correctly", () => {
    expect(convertToDecimal("1010", "binary")).toBe(10);
    expect(convertToDecimal("1111", "binary")).toBe(15);
    expect(convertToDecimal("0", "binary")).toBe(0);
  });

  it("converts octal to decimal correctly", () => {
    expect(convertToDecimal("10", "octal")).toBe(8);
    expect(convertToDecimal("77", "octal")).toBe(63);
    expect(convertToDecimal("0", "octal")).toBe(0);
  });

  it("converts hexadecimal to decimal correctly", () => {
    expect(convertToDecimal("10", "hexadecimal")).toBe(16);
    expect(convertToDecimal("FF", "hexadecimal")).toBe(255);
    expect(convertToDecimal("1a", "hexadecimal")).toBe(26);
    expect(convertToDecimal("0", "hexadecimal")).toBe(0);
  });

  it("handles decimal input correctly", () => {
    expect(convertToDecimal("10", "decimal")).toBe(10);
    expect(convertToDecimal("255", "decimal")).toBe(255);
  });

  it("returns null for invalid input", () => {
    expect(convertToDecimal("1020", "binary")).toBe(null);
    expect(convertToDecimal("89", "octal")).toBe(null);
    expect(convertToDecimal("abc", "decimal")).toBe(null);
    expect(convertToDecimal("", "decimal")).toBe(null);
  });

  it("trims whitespace from input", () => {
    expect(convertToDecimal("  1010  ", "binary")).toBe(10);
    expect(convertToDecimal("  FF  ", "hexadecimal")).toBe(255);
  });
});

describe("convertFromDecimal", () => {
  it("converts decimal to binary correctly", () => {
    expect(convertFromDecimal(10, "binary")).toBe("1010");
    expect(convertFromDecimal(15, "binary")).toBe("1111");
    expect(convertFromDecimal(0, "binary")).toBe("0");
  });

  it("converts decimal to octal correctly", () => {
    expect(convertFromDecimal(8, "octal")).toBe("10");
    expect(convertFromDecimal(63, "octal")).toBe("77");
    expect(convertFromDecimal(0, "octal")).toBe("0");
  });

  it("converts decimal to hexadecimal correctly", () => {
    expect(convertFromDecimal(16, "hexadecimal")).toBe("10");
    expect(convertFromDecimal(255, "hexadecimal")).toBe("ff");
    expect(convertFromDecimal(26, "hexadecimal")).toBe("1a");
    expect(convertFromDecimal(0, "hexadecimal")).toBe("0");
  });

  it("handles decimal input correctly", () => {
    expect(convertFromDecimal(10, "decimal")).toBe("10");
    expect(convertFromDecimal(255, "decimal")).toBe("255");
  });

  it("returns null for invalid decimal values", () => {
    expect(convertFromDecimal(NaN, "binary")).toBe(null);
    expect(convertFromDecimal(Infinity, "octal")).toBe(null);
    expect(convertFromDecimal(-Infinity, "hexadecimal")).toBe(null);
  });
});

describe("convertBase", () => {
  it("converts binary to octal", () => {
    const result = convertBase("1010", "binary", "octal");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toBe("12");
    }
  });

  it("converts binary to hexadecimal", () => {
    const result = convertBase("1111", "binary", "hexadecimal");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toBe("f");
    }
  });

  it("converts octal to binary", () => {
    const result = convertBase("12", "octal", "binary");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toBe("1010");
    }
  });

  it("converts octal to hexadecimal", () => {
    const result = convertBase("377", "octal", "hexadecimal");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toBe("ff");
    }
  });

  it("converts hexadecimal to binary", () => {
    const result = convertBase("a", "hexadecimal", "binary");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toBe("1010");
    }
  });

  it("converts hexadecimal to octal", () => {
    const result = convertBase("ff", "hexadecimal", "octal");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toBe("377");
    }
  });

  it("converts decimal to all other bases", () => {
    expect(convertBase("10", "decimal", "binary")).toEqual({ success: true, value: "1010" });
    expect(convertBase("10", "decimal", "octal")).toEqual({ success: true, value: "12" });
    expect(convertBase("16", "decimal", "hexadecimal")).toEqual({ success: true, value: "10" });
  });

  it("returns error for invalid input", () => {
    expect(convertBase("1020", "binary", "octal")).toEqual({ success: false, error: "无效的二进制格式，仅支持 0 和 1" });
    expect(convertBase("", "decimal", "binary")).toEqual({ success: false, error: "请输入数字" });
  });
});

describe("convertAllBases", () => {
  it("converts binary to all bases", () => {
    const result = convertAllBases("1010", "binary");
    expect(result.binary).toBe("1010");
    expect(result.octal).toBe("12");
    expect(result.decimal).toBe("10");
    expect(result.hexadecimal).toBe("a");
  });

  it("converts octal to all bases", () => {
    const result = convertAllBases("12", "octal");
    expect(result.binary).toBe("1010");
    expect(result.octal).toBe("12");
    expect(result.decimal).toBe("10");
    expect(result.hexadecimal).toBe("a");
  });

  it("converts decimal to all bases", () => {
    const result = convertAllBases("10", "decimal");
    expect(result.binary).toBe("1010");
    expect(result.octal).toBe("12");
    expect(result.decimal).toBe("10");
    expect(result.hexadecimal).toBe("a");
  });

  it("converts hexadecimal to all bases", () => {
    const result = convertAllBases("a", "hexadecimal");
    expect(result.binary).toBe("1010");
    expect(result.octal).toBe("12");
    expect(result.decimal).toBe("10");
    expect(result.hexadecimal).toBe("a");
  });

  it("returns all null for invalid input", () => {
    const result = convertAllBases("1020", "binary");
    expect(result.binary).toBeNull();
    expect(result.octal).toBeNull();
    expect(result.decimal).toBeNull();
    expect(result.hexadecimal).toBeNull();
  });

  it("handles zero correctly", () => {
    const result = convertAllBases("0", "decimal");
    expect(result.binary).toBe("0");
    expect(result.octal).toBe("0");
    expect(result.decimal).toBe("0");
    expect(result.hexadecimal).toBe("0");
  });

  it("handles large numbers", () => {
    const result = convertAllBases("255", "decimal");
    expect(result.binary).toBe("11111111");
    expect(result.octal).toBe("377");
    expect(result.decimal).toBe("255");
    expect(result.hexadecimal).toBe("ff");
  });
});

describe("constants and types", () => {
  it("has correct radix mappings", () => {
    expect(BASE_RADIX_MAP.binary).toBe(2);
    expect(BASE_RADIX_MAP.octal).toBe(8);
    expect(BASE_RADIX_MAP.decimal).toBe(10);
    expect(BASE_RADIX_MAP.hexadecimal).toBe(16);
  });

  it("has correct character sets", () => {
    expect(BASE_CHAR_SETS.binary.test("1010")).toBe(true);
    expect(BASE_CHAR_SETS.binary.test("1020")).toBe(false);
    expect(BASE_CHAR_SETS.hexadecimal.test("1aF")).toBe(true);
  });

  it("has correct character descriptions", () => {
    expect(BASE_CHAR_DESCRIPTIONS.binary).toBe("仅支持 0 和 1");
    expect(BASE_CHAR_DESCRIPTIONS.octal).toBe("支持 0-7");
    expect(BASE_CHAR_DESCRIPTIONS.decimal).toBe("支持 0-9");
    expect(BASE_CHAR_DESCRIPTIONS.hexadecimal).toBe("支持 0-9, a-f, A-F");
  });

  it("has correct display names", () => {
    expect(BASE_NAMES.binary).toBe("二进制");
    expect(BASE_NAMES.octal).toBe("八进制");
    expect(BASE_NAMES.decimal).toBe("十进制");
    expect(BASE_NAMES.hexadecimal).toBe("十六进制");
  });

  it("has correct prefixes", () => {
    expect(BASE_PREFIXES.binary).toBe("");
    expect(BASE_PREFIXES.octal).toBe("0o");
    expect(BASE_PREFIXES.decimal).toBe("");
    expect(BASE_PREFIXES.hexadecimal).toBe("0x");
  });

  it("has all base types", () => {
    expect(BASE_TYPES).toEqual(["binary", "octal", "decimal", "hexadecimal"]);
  });

  it("has correct default base", () => {
    expect(DEFAULT_BASE).toBe("decimal");
  });
});
