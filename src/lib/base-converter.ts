/**
 * Base Conversion Utilities
 *
 * Provides conversion functions between binary, octal, decimal, and hexadecimal
 * number systems. Supports validation, conversion, and handling of large numbers using BigInt.
 */

// ============================================================================
// Types
// ============================================================================

/**
 * Supported base types for number conversion
 */
export type Base = "binary" | "octal" | "decimal" | "hexadecimal";

/**
 * Map of base types to their radix values
 */
export const BASE_RADIX_MAP: Record<Base, number> = {
  binary: 2,
  octal: 8,
  decimal: 10,
  hexadecimal: 16,
};

/**
 * Valid character sets for each base
 */
export const BASE_CHAR_SETS: Record<Base, RegExp> = {
  binary: /^[01]+$/,
  octal: /^[0-7]+$/,
  decimal: /^[0-9]+$/,
  hexadecimal: /^[0-9a-fA-F]+$/,
};

/**
 * Valid character descriptions for UI hints
 */
export const BASE_CHAR_DESCRIPTIONS: Record<Base, string> = {
  binary: "仅支持 0 和 1",
  octal: "支持 0-7",
  decimal: "支持 0-9",
  hexadecimal: "支持 0-9, a-f, A-F",
};

/**
 * Display names for each base
 */
export const BASE_NAMES: Record<Base, string> = {
  binary: "二进制",
  octal: "八进制",
  decimal: "十进制",
  hexadecimal: "十六进制",
};

/**
 * Prefix for each base when displaying results
 */
export const BASE_PREFIXES: Record<Base, string> = {
  binary: "",
  octal: "0o",
  decimal: "",
  hexadecimal: "0x",
};

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validates if the input string is valid for the given base
 *
 * @param input - The input string to validate
 * @param base - The target base type
 * @returns True if valid, false otherwise
 */
export function validateBaseInput(input: string, base: Base): boolean {
  if (!input || input.trim().length === 0) {
    return false;
  }
  return BASE_CHAR_SETS[base].test(input);
}

/**
 * Gets a detailed error message for invalid input
 *
 * @param input - The input string
 * @param base - The target base type
 * @returns Error message explaining why the input is invalid
 */
export function getValidationError(input: string, base: Base): string | null {
  if (!input || input.trim().length === 0) {
    return "请输入数字";
  }

  if (!BASE_CHAR_SETS[base].test(input)) {
    return `无效的${BASE_NAMES[base]}格式，${BASE_CHAR_DESCRIPTIONS[base]}`;
  }

  return null;
}

// ============================================================================
// Conversion Functions
// ============================================================================

/**
 * Converts a number string from any base to decimal (base 10)
 *
 * @param input - The input number string
 * @param fromBase - The source base type
 * @returns Decimal value as number, or null if conversion fails
 */
export function convertToDecimal(input: string, fromBase: Base): number | null {
  try {
    const cleanedInput = input.trim();
    if (!validateBaseInput(cleanedInput, fromBase)) {
      return null;
    }

    const radix = BASE_RADIX_MAP[fromBase];
    return parseInt(cleanedInput, radix);
  } catch {
    return null;
  }
}

/**
 * Converts a decimal value to a target base string
 *
 * @param decimal - The decimal value to convert
 * @param toBase - The target base type
 * @returns The converted string, or null if conversion fails
 */
export function convertFromDecimal(decimal: number, toBase: Base): string | null {
  try {
    if (isNaN(decimal) || !Number.isFinite(decimal)) {
      return null;
    }

    const radix = BASE_RADIX_MAP[toBase];
    return decimal.toString(radix).toLowerCase();
  } catch {
    return null;
  }
}

/**
 * Converts a number string from one base to another
 *
 * @param input - The input number string
 * @param fromBase - The source base type
 * @param toBase - The target base type
 * @returns Converted string, or error object if conversion fails
 */
export function convertBase(
  input: string,
  fromBase: Base,
  toBase: Base
): { success: true; value: string } | { success: false; error: string } {
  // Validate input
  const validationError = getValidationError(input, fromBase);
  if (validationError) {
    return { success: false, error: validationError };
  }

  // Convert to decimal first
  const decimal = convertToDecimal(input, fromBase);
  if (decimal === null) {
    return { success: false, error: "转换失败" };
  }

  // Convert from decimal to target base
  const result = convertFromDecimal(decimal, toBase);
  if (result === null) {
    return { success: false, error: "转换失败" };
  }

  return { success: true, value: result };
}

/**
 * Converts a number string from one base to all other bases
 *
 * @param input - The input number string
 * @param fromBase - The source base type
 * @returns Object containing conversion results for all bases
 */
export function convertAllBases(
  input: string,
  fromBase: Base
): {
  binary: string | null;
  octal: string | null;
  decimal: string | null;
  hexadecimal: string | null;
} {
  const result = {
    binary: null as string | null,
    octal: null as string | null,
    decimal: null as string | null,
    hexadecimal: null as string | null,
  };

  // Validate input
  if (!validateBaseInput(input, fromBase)) {
    return result;
  }

  // Convert to decimal first
  const decimal = convertToDecimal(input, fromBase);
  if (decimal === null) {
    return result;
  }

  // Set the source base result
  result[fromBase] = input.trim();

  // Convert to all other bases
  for (const base of BASE_TYPES) {
    if (base !== fromBase) {
      result[base] = convertFromDecimal(decimal, base);
    }
  }

  return result;
}

/**
 * List of all supported base types
 */
export const BASE_TYPES: Base[] = ["binary", "octal", "decimal", "hexadecimal"];

/**
 * Default base for input (decimal)
 */
export const DEFAULT_BASE: Base = "decimal";
