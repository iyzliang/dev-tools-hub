/**
 * Password Generation Utilities
 *
 * Provides cryptographically secure password and passphrase generation
 * using the Web Crypto API (crypto.getRandomValues).
 */

import { EFF_WORDLIST } from "./wordlist";

// ============================================================================
// Types
// ============================================================================

/**
 * Character type options for random password generation
 */
export interface CharacterOptions {
  /** Include uppercase letters (A-Z) */
  uppercase: boolean;
  /** Include lowercase letters (a-z) */
  lowercase: boolean;
  /** Include digits (0-9) */
  digits: boolean;
  /** Include symbols (!@#$%^&*...) */
  symbols: boolean;
}

/**
 * Configuration for random password generation
 */
export interface RandomPasswordConfig {
  /** Password length (8-128) */
  length: number;
  /** Character types to include */
  characters: CharacterOptions;
  /** Enable readable mode (exclude ambiguous characters) */
  readableMode: boolean;
  /** Custom characters to exclude */
  excludeChars: string;
}

/**
 * Separator options for passphrase
 */
export type PassphraseSeparator = "-" | "_" | "." | " ";

/**
 * Configuration for passphrase generation
 */
export interface PassphraseConfig {
  /** Number of words (3-8) */
  wordCount: number;
  /** Separator between words */
  separator: PassphraseSeparator;
  /** Capitalize first letter of each word */
  capitalize: boolean;
}

/**
 * Generated password result with metadata
 */
export interface GeneratedPassword {
  /** The generated password or passphrase */
  value: string;
  /** Generation mode */
  mode: "random" | "passphrase";
  /** Character pool size (for entropy calculation) */
  poolSize: number;
  /** Effective length for entropy (password length or word count) */
  effectiveLength: number;
}

// ============================================================================
// Constants
// ============================================================================

/** Uppercase letters */
const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/** Lowercase letters */
const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";

/** Digits */
const DIGITS = "0123456789";

/** Common symbols */
const SYMBOLS = "!@#$%^&*()_+-=[]{}|;:,.<>?";

/**
 * Ambiguous characters that can be confused visually
 * 0/O, 1/l/I, 5/S, 8/B, etc.
 */
const AMBIGUOUS_CHARS = "0O1lI5S8B2Z";

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get a cryptographically secure random integer in range [0, max)
 */
function getSecureRandomInt(max: number): number {
  if (max <= 0) {
    throw new Error("Max must be positive");
  }

  // Use rejection sampling to avoid modulo bias
  const randomBuffer = new Uint32Array(1);
  const maxUint32 = 0xffffffff;
  const limit = maxUint32 - (maxUint32 % max);

  let randomValue: number;
  do {
    crypto.getRandomValues(randomBuffer);
    randomValue = randomBuffer[0];
  } while (randomValue >= limit);

  return randomValue % max;
}

/**
 * Shuffle array using Fisher-Yates algorithm with secure randomness
 */
function secureShuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = getSecureRandomInt(i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Build character pool based on configuration
 */
function buildCharacterPool(
  options: CharacterOptions,
  readableMode: boolean,
  excludeChars: string
): string {
  let pool = "";

  if (options.uppercase) {
    pool += UPPERCASE;
  }
  if (options.lowercase) {
    pool += LOWERCASE;
  }
  if (options.digits) {
    pool += DIGITS;
  }
  if (options.symbols) {
    pool += SYMBOLS;
  }

  // Remove ambiguous characters in readable mode
  if (readableMode) {
    pool = pool
      .split("")
      .filter((char) => !AMBIGUOUS_CHARS.includes(char))
      .join("");
  }

  // Remove custom excluded characters
  if (excludeChars) {
    const excludeSet = new Set(excludeChars);
    pool = pool
      .split("")
      .filter((char) => !excludeSet.has(char))
      .join("");
  }

  return pool;
}

// ============================================================================
// Password Generation Functions
// ============================================================================

/**
 * Generate a random password with the given configuration
 *
 * @param config - Password generation configuration
 * @returns Generated password with metadata
 * @throws Error if no character types are selected or pool is empty
 */
export function generateRandomPassword(
  config: RandomPasswordConfig
): GeneratedPassword {
  // Validate length
  const length = Math.max(8, Math.min(128, config.length));

  // Build character pool
  const pool = buildCharacterPool(
    config.characters,
    config.readableMode,
    config.excludeChars
  );

  if (pool.length === 0) {
    throw new Error("字符池为空，请至少选择一种字符类型");
  }

  // Generate password ensuring at least one character from each selected type
  const password: string[] = [];
  const requiredChars: string[] = [];

  // Add one character from each required type
  if (config.characters.uppercase) {
    let chars = UPPERCASE;
    if (config.readableMode) {
      chars = chars
        .split("")
        .filter((c) => !AMBIGUOUS_CHARS.includes(c))
        .join("");
    }
    if (config.excludeChars) {
      chars = chars
        .split("")
        .filter((c) => !config.excludeChars.includes(c))
        .join("");
    }
    if (chars.length > 0) {
      requiredChars.push(chars[getSecureRandomInt(chars.length)]);
    }
  }

  if (config.characters.lowercase) {
    let chars = LOWERCASE;
    if (config.readableMode) {
      chars = chars
        .split("")
        .filter((c) => !AMBIGUOUS_CHARS.includes(c))
        .join("");
    }
    if (config.excludeChars) {
      chars = chars
        .split("")
        .filter((c) => !config.excludeChars.includes(c))
        .join("");
    }
    if (chars.length > 0) {
      requiredChars.push(chars[getSecureRandomInt(chars.length)]);
    }
  }

  if (config.characters.digits) {
    let chars = DIGITS;
    if (config.readableMode) {
      chars = chars
        .split("")
        .filter((c) => !AMBIGUOUS_CHARS.includes(c))
        .join("");
    }
    if (config.excludeChars) {
      chars = chars
        .split("")
        .filter((c) => !config.excludeChars.includes(c))
        .join("");
    }
    if (chars.length > 0) {
      requiredChars.push(chars[getSecureRandomInt(chars.length)]);
    }
  }

  if (config.characters.symbols) {
    let chars = SYMBOLS;
    if (config.excludeChars) {
      chars = chars
        .split("")
        .filter((c) => !config.excludeChars.includes(c))
        .join("");
    }
    if (chars.length > 0) {
      requiredChars.push(chars[getSecureRandomInt(chars.length)]);
    }
  }

  // Fill remaining length with random characters from pool
  const remainingLength = length - requiredChars.length;
  for (let i = 0; i < remainingLength; i++) {
    password.push(pool[getSecureRandomInt(pool.length)]);
  }

  // Add required characters and shuffle
  password.push(...requiredChars);
  const shuffled = secureShuffleArray(password);

  return {
    value: shuffled.join(""),
    mode: "random",
    poolSize: pool.length,
    effectiveLength: length,
  };
}

/**
 * Generate a passphrase using EFF Diceware wordlist
 *
 * @param config - Passphrase generation configuration
 * @returns Generated passphrase with metadata
 */
export function generatePassphrase(
  config: PassphraseConfig
): GeneratedPassword {
  // Validate word count
  const wordCount = Math.max(3, Math.min(8, config.wordCount));

  // Select random words
  const words: string[] = [];
  for (let i = 0; i < wordCount; i++) {
    const index = getSecureRandomInt(EFF_WORDLIST.length);
    let word = EFF_WORDLIST[index];

    // Capitalize first letter if enabled
    if (config.capitalize) {
      word = word.charAt(0).toUpperCase() + word.slice(1);
    }

    words.push(word);
  }

  return {
    value: words.join(config.separator),
    mode: "passphrase",
    poolSize: EFF_WORDLIST.length,
    effectiveLength: wordCount,
  };
}

/**
 * Generate multiple passwords or passphrases
 *
 * @param count - Number of passwords to generate (1-10)
 * @param generator - Function to generate a single password
 * @returns Array of generated passwords
 */
export function generateMultiple<T>(
  count: number,
  generator: () => T
): T[] {
  const safeCount = Math.max(1, Math.min(10, count));
  const results: T[] = [];

  for (let i = 0; i < safeCount; i++) {
    results.push(generator());
  }

  return results;
}

// ============================================================================
// Default Configurations
// ============================================================================

/**
 * Default configuration for random password generation
 */
export const DEFAULT_RANDOM_CONFIG: RandomPasswordConfig = {
  length: 16,
  characters: {
    uppercase: true,
    lowercase: true,
    digits: true,
    symbols: false,
  },
  readableMode: false,
  excludeChars: "",
};

/**
 * Default configuration for passphrase generation
 */
export const DEFAULT_PASSPHRASE_CONFIG: PassphraseConfig = {
  wordCount: 4,
  separator: "-",
  capitalize: false,
};
