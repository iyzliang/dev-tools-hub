import { describe, it, expect } from "vitest";
import {
  generateRandomPassword,
  generatePassphrase,
  generateMultiple,
  DEFAULT_RANDOM_CONFIG,
  DEFAULT_PASSPHRASE_CONFIG,
  type RandomPasswordConfig,
  type PassphraseConfig,
} from "./password-utils";

describe("generateRandomPassword", () => {
  it("should generate password with correct length", () => {
    const config: RandomPasswordConfig = {
      ...DEFAULT_RANDOM_CONFIG,
      length: 20,
    };
    const result = generateRandomPassword(config);
    expect(result.value.length).toBe(20);
    expect(result.effectiveLength).toBe(20);
    expect(result.mode).toBe("random");
  });

  it("should respect minimum length of 8", () => {
    const config: RandomPasswordConfig = {
      ...DEFAULT_RANDOM_CONFIG,
      length: 4, // Below minimum
    };
    const result = generateRandomPassword(config);
    expect(result.value.length).toBe(8);
  });

  it("should respect maximum length of 128", () => {
    const config: RandomPasswordConfig = {
      ...DEFAULT_RANDOM_CONFIG,
      length: 200, // Above maximum
    };
    const result = generateRandomPassword(config);
    expect(result.value.length).toBe(128);
  });

  it("should include uppercase when enabled", () => {
    const config: RandomPasswordConfig = {
      length: 50,
      characters: {
        uppercase: true,
        lowercase: false,
        digits: false,
        symbols: false,
      },
      readableMode: false,
      excludeChars: "",
    };
    const result = generateRandomPassword(config);
    expect(result.value).toMatch(/^[A-Z]+$/);
  });

  it("should include lowercase when enabled", () => {
    const config: RandomPasswordConfig = {
      length: 50,
      characters: {
        uppercase: false,
        lowercase: true,
        digits: false,
        symbols: false,
      },
      readableMode: false,
      excludeChars: "",
    };
    const result = generateRandomPassword(config);
    expect(result.value).toMatch(/^[a-z]+$/);
  });

  it("should include digits when enabled", () => {
    const config: RandomPasswordConfig = {
      length: 50,
      characters: {
        uppercase: false,
        lowercase: false,
        digits: true,
        symbols: false,
      },
      readableMode: false,
      excludeChars: "",
    };
    const result = generateRandomPassword(config);
    expect(result.value).toMatch(/^[0-9]+$/);
  });

  it("should include symbols when enabled", () => {
    const config: RandomPasswordConfig = {
      length: 50,
      characters: {
        uppercase: false,
        lowercase: false,
        digits: false,
        symbols: true,
      },
      readableMode: false,
      excludeChars: "",
    };
    const result = generateRandomPassword(config);
    // Check that result contains only symbols
    expect(result.value).toMatch(/^[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]+$/);
  });

  it("should include at least one character from each enabled type", () => {
    const config: RandomPasswordConfig = {
      length: 16,
      characters: {
        uppercase: true,
        lowercase: true,
        digits: true,
        symbols: true,
      },
      readableMode: false,
      excludeChars: "",
    };

    // Run multiple times to ensure consistency
    for (let i = 0; i < 10; i++) {
      const result = generateRandomPassword(config);
      expect(result.value).toMatch(/[A-Z]/); // Has uppercase
      expect(result.value).toMatch(/[a-z]/); // Has lowercase
      expect(result.value).toMatch(/[0-9]/); // Has digit
      expect(result.value).toMatch(/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/); // Has symbol
    }
  });

  it("should exclude ambiguous characters in readable mode", () => {
    const config: RandomPasswordConfig = {
      length: 100,
      characters: {
        uppercase: true,
        lowercase: true,
        digits: true,
        symbols: false,
      },
      readableMode: true,
      excludeChars: "",
    };

    const result = generateRandomPassword(config);
    // Should not contain 0, O, 1, l, I, 5, S, 8, B, 2, Z
    expect(result.value).not.toMatch(/[0O1lI5S8B2Z]/);
  });

  it("should exclude custom characters", () => {
    const config: RandomPasswordConfig = {
      length: 100,
      characters: {
        uppercase: true,
        lowercase: true,
        digits: true,
        symbols: false,
      },
      readableMode: false,
      excludeChars: "ABC123",
    };

    const result = generateRandomPassword(config);
    expect(result.value).not.toMatch(/[ABC123]/);
  });

  it("should throw error when character pool is empty", () => {
    const config: RandomPasswordConfig = {
      length: 16,
      characters: {
        uppercase: false,
        lowercase: false,
        digits: false,
        symbols: false,
      },
      readableMode: false,
      excludeChars: "",
    };

    expect(() => generateRandomPassword(config)).toThrow("字符池为空");
  });

  it("should return correct pool size", () => {
    const config: RandomPasswordConfig = {
      length: 16,
      characters: {
        uppercase: true, // 26
        lowercase: true, // 26
        digits: false,
        symbols: false,
      },
      readableMode: false,
      excludeChars: "",
    };

    const result = generateRandomPassword(config);
    expect(result.poolSize).toBe(52); // 26 + 26
  });

  it("should generate unique passwords", () => {
    const passwords = new Set<string>();
    for (let i = 0; i < 100; i++) {
      const result = generateRandomPassword(DEFAULT_RANDOM_CONFIG);
      passwords.add(result.value);
    }
    // All 100 passwords should be unique
    expect(passwords.size).toBe(100);
  });
});

describe("generatePassphrase", () => {
  it("should generate passphrase with correct word count", () => {
    const config: PassphraseConfig = {
      ...DEFAULT_PASSPHRASE_CONFIG,
      wordCount: 5,
    };
    const result = generatePassphrase(config);
    const words = result.value.split(config.separator);
    expect(words.length).toBe(5);
    expect(result.effectiveLength).toBe(5);
    expect(result.mode).toBe("passphrase");
  });

  it("should respect minimum word count of 3", () => {
    const config: PassphraseConfig = {
      ...DEFAULT_PASSPHRASE_CONFIG,
      wordCount: 1, // Below minimum
    };
    const result = generatePassphrase(config);
    const words = result.value.split(config.separator);
    expect(words.length).toBe(3);
  });

  it("should respect maximum word count of 8", () => {
    const config: PassphraseConfig = {
      ...DEFAULT_PASSPHRASE_CONFIG,
      wordCount: 15, // Above maximum
    };
    const result = generatePassphrase(config);
    const words = result.value.split(config.separator);
    expect(words.length).toBe(8);
  });

  it("should use hyphen separator", () => {
    const config: PassphraseConfig = {
      wordCount: 4,
      separator: "-",
      capitalize: false,
    };
    const result = generatePassphrase(config);
    expect(result.value).toMatch(/^[a-z]+-[a-z]+-[a-z]+-[a-z]+$/);
  });

  it("should use underscore separator", () => {
    const config: PassphraseConfig = {
      wordCount: 4,
      separator: "_",
      capitalize: false,
    };
    const result = generatePassphrase(config);
    expect(result.value).toMatch(/^[a-z]+_[a-z]+_[a-z]+_[a-z]+$/);
  });

  it("should use dot separator", () => {
    const config: PassphraseConfig = {
      wordCount: 4,
      separator: ".",
      capitalize: false,
    };
    const result = generatePassphrase(config);
    expect(result.value).toMatch(/^[a-z]+\.[a-z]+\.[a-z]+\.[a-z]+$/);
  });

  it("should use space separator", () => {
    const config: PassphraseConfig = {
      wordCount: 4,
      separator: " ",
      capitalize: false,
    };
    const result = generatePassphrase(config);
    expect(result.value).toMatch(/^[a-z]+ [a-z]+ [a-z]+ [a-z]+$/);
  });

  it("should capitalize first letter of each word when enabled", () => {
    const config: PassphraseConfig = {
      wordCount: 4,
      separator: "-",
      capitalize: true,
    };
    const result = generatePassphrase(config);
    const words = result.value.split("-");
    words.forEach((word) => {
      expect(word[0]).toMatch(/[A-Z]/); // First letter uppercase
      expect(word.slice(1)).toMatch(/^[a-z]*$/); // Rest lowercase
    });
  });

  it("should return correct pool size (EFF wordlist size)", () => {
    const result = generatePassphrase(DEFAULT_PASSPHRASE_CONFIG);
    expect(result.poolSize).toBe(7776);
  });

  it("should generate unique passphrases", () => {
    const passphrases = new Set<string>();
    for (let i = 0; i < 100; i++) {
      const result = generatePassphrase(DEFAULT_PASSPHRASE_CONFIG);
      passphrases.add(result.value);
    }
    // All 100 passphrases should be unique
    expect(passphrases.size).toBe(100);
  });
});

describe("generateMultiple", () => {
  it("should generate specified number of passwords", () => {
    const results = generateMultiple(5, () =>
      generateRandomPassword(DEFAULT_RANDOM_CONFIG)
    );
    expect(results.length).toBe(5);
  });

  it("should generate specified number of passphrases", () => {
    const results = generateMultiple(5, () =>
      generatePassphrase(DEFAULT_PASSPHRASE_CONFIG)
    );
    expect(results.length).toBe(5);
  });

  it("should respect minimum count of 1", () => {
    const results = generateMultiple(0, () =>
      generateRandomPassword(DEFAULT_RANDOM_CONFIG)
    );
    expect(results.length).toBe(1);
  });

  it("should respect maximum count of 10", () => {
    const results = generateMultiple(20, () =>
      generateRandomPassword(DEFAULT_RANDOM_CONFIG)
    );
    expect(results.length).toBe(10);
  });

  it("should generate unique values", () => {
    const results = generateMultiple(10, () =>
      generateRandomPassword(DEFAULT_RANDOM_CONFIG)
    );
    const values = new Set(results.map((r) => r.value));
    expect(values.size).toBe(10);
  });
});
