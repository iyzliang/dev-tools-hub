import { describe, it, expect } from "vitest";
import {
  calculateRandomPasswordEntropy,
  calculatePassphraseEntropy,
  calculateEntropy,
  getStrengthLevel,
  calculateCrackTimeSeconds,
  formatCrackTime,
  estimateCrackTime,
  analyzePasswordStrength,
} from "./entropy-utils";

describe("calculateRandomPasswordEntropy", () => {
  it("should calculate entropy correctly for lowercase only", () => {
    // 26 lowercase letters, 8 characters
    // entropy = log2(26) * 8 ≈ 4.7 * 8 ≈ 37.6 bits
    const entropy = calculateRandomPasswordEntropy(26, 8);
    expect(entropy).toBeCloseTo(37.6, 1);
  });

  it("should calculate entropy correctly for full charset", () => {
    // 26 upper + 26 lower + 10 digits + 32 symbols = 94 chars
    // entropy = log2(94) * 16 ≈ 6.55 * 16 ≈ 104.9 bits
    const entropy = calculateRandomPasswordEntropy(94, 16);
    expect(entropy).toBeCloseTo(104.9, 1);
  });

  it("should return 0 for invalid inputs", () => {
    expect(calculateRandomPasswordEntropy(0, 10)).toBe(0);
    expect(calculateRandomPasswordEntropy(26, 0)).toBe(0);
    expect(calculateRandomPasswordEntropy(-5, 10)).toBe(0);
  });

  it("should scale linearly with length", () => {
    const entropy8 = calculateRandomPasswordEntropy(26, 8);
    const entropy16 = calculateRandomPasswordEntropy(26, 16);
    expect(entropy16).toBeCloseTo(entropy8 * 2, 5);
  });
});

describe("calculatePassphraseEntropy", () => {
  it("should calculate entropy correctly for 4-word passphrase", () => {
    // EFF wordlist: 7776 words
    // entropy = log2(7776) * 4 ≈ 12.93 * 4 ≈ 51.7 bits
    const entropy = calculatePassphraseEntropy(4);
    expect(entropy).toBeCloseTo(51.7, 1);
  });

  it("should calculate entropy correctly for 6-word passphrase", () => {
    // entropy = log2(7776) * 6 ≈ 12.93 * 6 ≈ 77.5 bits
    const entropy = calculatePassphraseEntropy(6);
    expect(entropy).toBeCloseTo(77.5, 1);
  });

  it("should return 0 for invalid inputs", () => {
    expect(calculatePassphraseEntropy(0)).toBe(0);
    expect(calculatePassphraseEntropy(-3)).toBe(0);
    expect(calculatePassphraseEntropy(4, 0)).toBe(0);
  });

  it("should use custom wordlist size", () => {
    const entropy = calculatePassphraseEntropy(4, 1000);
    expect(entropy).toBeCloseTo(Math.log2(1000) * 4, 5);
  });
});

describe("calculateEntropy", () => {
  it("should delegate to random password calculation", () => {
    const entropy = calculateEntropy("random", 52, 16);
    expect(entropy).toBeCloseTo(calculateRandomPasswordEntropy(52, 16), 5);
  });

  it("should delegate to passphrase calculation", () => {
    const entropy = calculateEntropy("passphrase", 7776, 4);
    expect(entropy).toBeCloseTo(calculatePassphraseEntropy(4, 7776), 5);
  });
});

describe("getStrengthLevel", () => {
  it("should return very-weak for entropy < 28", () => {
    const result = getStrengthLevel(20);
    expect(result.level).toBe("very-weak");
    expect(result.label).toBe("极弱");
    expect(result.color).toBe("text-red-600");
  });

  it("should return weak for entropy 28-35", () => {
    const result = getStrengthLevel(32);
    expect(result.level).toBe("weak");
    expect(result.label).toBe("弱");
    expect(result.color).toBe("text-orange-600");
  });

  it("should return medium for entropy 36-59", () => {
    const result = getStrengthLevel(50);
    expect(result.level).toBe("medium");
    expect(result.label).toBe("中等");
    expect(result.color).toBe("text-yellow-600");
  });

  it("should return strong for entropy 60-127", () => {
    const result = getStrengthLevel(80);
    expect(result.level).toBe("strong");
    expect(result.label).toBe("强");
    expect(result.color).toBe("text-green-600");
  });

  it("should return very-strong for entropy >= 128", () => {
    const result = getStrengthLevel(150);
    expect(result.level).toBe("very-strong");
    expect(result.label).toBe("极强");
    expect(result.color).toBe("text-blue-600");
  });

  it("should include percentage for progress bar", () => {
    expect(getStrengthLevel(20).percentage).toBe(10);
    expect(getStrengthLevel(32).percentage).toBe(30);
    expect(getStrengthLevel(50).percentage).toBe(55);
    expect(getStrengthLevel(80).percentage).toBe(80);
    expect(getStrengthLevel(150).percentage).toBe(100);
  });
});

describe("calculateCrackTimeSeconds", () => {
  it("should return 0 for 0 entropy", () => {
    expect(calculateCrackTimeSeconds(0)).toBe(0);
  });

  it("should return very small time for low entropy", () => {
    // 10 bits = 1024 combinations, 512 on average
    // 512 / 10^10 = 5.12e-8 seconds
    const time = calculateCrackTimeSeconds(10);
    expect(time).toBeLessThan(0.001);
  });

  it("should return larger time for higher entropy", () => {
    const time40 = calculateCrackTimeSeconds(40);
    const time80 = calculateCrackTimeSeconds(80);
    expect(time80).toBeGreaterThan(time40);
  });

  it("should return Infinity for extremely high entropy", () => {
    const time = calculateCrackTimeSeconds(500);
    expect(time).toBe(Infinity);
  });
});

describe("formatCrackTime", () => {
  it("should format instant time", () => {
    expect(formatCrackTime(0.0001)).toBe("瞬间");
  });

  it("should format sub-second time", () => {
    expect(formatCrackTime(0.5)).toBe("不到 1 秒");
  });

  it("should format seconds", () => {
    expect(formatCrackTime(30)).toBe("约 30 秒");
  });

  it("should format minutes", () => {
    expect(formatCrackTime(300)).toBe("约 5 分钟");
  });

  it("should format hours", () => {
    expect(formatCrackTime(7200)).toBe("约 2 小时");
  });

  it("should format days", () => {
    expect(formatCrackTime(86400 * 5)).toBe("约 5 天");
  });

  it("should format months", () => {
    expect(formatCrackTime(86400 * 60)).toBe("约 2 个月");
  });

  it("should format years", () => {
    expect(formatCrackTime(86400 * 365 * 5)).toBe("约 5 年");
  });

  it("should format large years with Chinese units", () => {
    const tenThousandYears = 86400 * 365 * 10000;
    const result = formatCrackTime(tenThousandYears);
    expect(result).toContain("万");
  });

  it("should handle infinity", () => {
    expect(formatCrackTime(Infinity)).toBe("理论不可破解");
  });
});

describe("estimateCrackTime", () => {
  it("should return human-readable estimate", () => {
    const result = estimateCrackTime(50);
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });
});

describe("analyzePasswordStrength", () => {
  it("should return complete analysis for random password", () => {
    // 52 chars (upper + lower), 16 length
    // entropy ≈ 91 bits (strong)
    const result = analyzePasswordStrength("random", 52, 16);

    expect(result.entropy).toBeGreaterThan(0);
    expect(result.strength.level).toBeDefined();
    expect(result.strength.label).toBeDefined();
    expect(result.crackTime).toBeDefined();
    expect(result.crackTimeSeconds).toBeGreaterThan(0);
  });

  it("should return complete analysis for passphrase", () => {
    // 4 words from 7776 wordlist
    // entropy ≈ 51.7 bits (medium)
    const result = analyzePasswordStrength("passphrase", 7776, 4);

    expect(result.entropy).toBeCloseTo(51.7, 1);
    expect(result.strength.level).toBe("medium");
    expect(result.crackTime).toBeDefined();
  });

  it("should show weak for short passwords", () => {
    // 26 chars, 6 length ≈ 28 bits (weak)
    const result = analyzePasswordStrength("random", 26, 6);
    expect(result.strength.level).toBe("weak");
  });

  it("should show strong for long complex passwords", () => {
    // 94 chars, 20 length ≈ 131 bits (very-strong)
    const result = analyzePasswordStrength("random", 94, 20);
    expect(result.strength.level).toBe("very-strong");
  });
});
