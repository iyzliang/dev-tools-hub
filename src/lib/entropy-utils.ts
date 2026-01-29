/**
 * Entropy Calculation and Password Strength Evaluation Utilities
 *
 * Provides functions to calculate password entropy (in bits) and
 * estimate the time required to crack a password through brute force.
 */

import { EFF_WORDLIST_SIZE } from "./wordlist";

// ============================================================================
// Types
// ============================================================================

/**
 * Password strength levels
 */
export type StrengthLevel =
  | "very-weak"
  | "weak"
  | "medium"
  | "strong"
  | "very-strong";

/**
 * Strength level information with display properties
 */
export interface StrengthInfo {
  /** Strength level identifier */
  level: StrengthLevel;
  /** Display label in Chinese */
  label: string;
  /** Color for UI display (Tailwind color class) */
  color: string;
  /** Background color for progress bar */
  bgColor: string;
  /** Percentage for progress bar (0-100) */
  percentage: number;
}

/**
 * Complete password strength analysis result
 */
export interface StrengthAnalysis {
  /** Entropy in bits */
  entropy: number;
  /** Strength level information */
  strength: StrengthInfo;
  /** Estimated crack time in human-readable format */
  crackTime: string;
  /** Estimated crack time in seconds */
  crackTimeSeconds: number;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Assumed attack speed: 10 billion (10^10) attempts per second
 * This represents a modern GPU cluster or specialized hardware
 */
const ATTEMPTS_PER_SECOND = 10_000_000_000;

/**
 * Entropy thresholds for strength levels (in bits)
 *
 * - < 28 bits: Very Weak (crackable in seconds to minutes)
 * - 28-35 bits: Weak (crackable in minutes to hours)
 * - 36-59 bits: Medium (crackable in days to weeks)
 * - 60-127 bits: Strong (crackable in years to millennia)
 * - >= 128 bits: Very Strong (theoretically uncrackable)
 */
const ENTROPY_THRESHOLDS = {
  veryWeak: 28,
  weak: 36,
  medium: 60,
  strong: 128,
};

// ============================================================================
// Entropy Calculation Functions
// ============================================================================

/**
 * Calculate the entropy of a random password
 *
 * Formula: entropy = log2(poolSize) × length
 *
 * @param poolSize - Size of the character pool
 * @param length - Password length
 * @returns Entropy in bits
 */
export function calculateRandomPasswordEntropy(
  poolSize: number,
  length: number
): number {
  if (poolSize <= 0 || length <= 0) {
    return 0;
  }
  return Math.log2(poolSize) * length;
}

/**
 * Calculate the entropy of a passphrase
 *
 * Formula: entropy = log2(wordlistSize) × wordCount
 *
 * @param wordCount - Number of words in the passphrase
 * @param wordlistSize - Size of the wordlist (default: EFF wordlist)
 * @returns Entropy in bits
 */
export function calculatePassphraseEntropy(
  wordCount: number,
  wordlistSize: number = EFF_WORDLIST_SIZE
): number {
  if (wordlistSize <= 0 || wordCount <= 0) {
    return 0;
  }
  return Math.log2(wordlistSize) * wordCount;
}

/**
 * Calculate entropy based on password mode and parameters
 *
 * @param mode - Password generation mode
 * @param poolSize - Character pool size (for random) or wordlist size (for passphrase)
 * @param effectiveLength - Password length (for random) or word count (for passphrase)
 * @returns Entropy in bits
 */
export function calculateEntropy(
  mode: "random" | "passphrase",
  poolSize: number,
  effectiveLength: number
): number {
  if (mode === "random") {
    return calculateRandomPasswordEntropy(poolSize, effectiveLength);
  }
  return calculatePassphraseEntropy(effectiveLength, poolSize);
}

// ============================================================================
// Strength Level Functions
// ============================================================================

/**
 * Get strength level information based on entropy
 *
 * @param entropy - Entropy in bits
 * @returns Strength level information
 */
export function getStrengthLevel(entropy: number): StrengthInfo {
  if (entropy < ENTROPY_THRESHOLDS.veryWeak) {
    return {
      level: "very-weak",
      label: "极弱",
      color: "text-red-600",
      bgColor: "bg-red-500",
      percentage: 10,
    };
  }

  if (entropy < ENTROPY_THRESHOLDS.weak) {
    return {
      level: "weak",
      label: "弱",
      color: "text-orange-600",
      bgColor: "bg-orange-500",
      percentage: 30,
    };
  }

  if (entropy < ENTROPY_THRESHOLDS.medium) {
    return {
      level: "medium",
      label: "中等",
      color: "text-yellow-600",
      bgColor: "bg-yellow-500",
      percentage: 55,
    };
  }

  if (entropy < ENTROPY_THRESHOLDS.strong) {
    return {
      level: "strong",
      label: "强",
      color: "text-green-600",
      bgColor: "bg-green-500",
      percentage: 80,
    };
  }

  return {
    level: "very-strong",
    label: "极强",
    color: "text-blue-600",
    bgColor: "bg-blue-500",
    percentage: 100,
  };
}

// ============================================================================
// Crack Time Estimation Functions
// ============================================================================

/**
 * Calculate estimated crack time in seconds based on entropy
 *
 * Formula: time = 2^entropy / (2 × attemptsPerSecond)
 * The division by 2 accounts for average case (finding on 50% of keyspace)
 *
 * @param entropy - Entropy in bits
 * @param attemptsPerSecond - Attack speed (default: 10 billion/s)
 * @returns Estimated time in seconds
 */
export function calculateCrackTimeSeconds(
  entropy: number,
  attemptsPerSecond: number = ATTEMPTS_PER_SECOND
): number {
  if (entropy <= 0) {
    return 0;
  }

  // 2^entropy possible combinations
  // Average case: need to try half of them
  // Time = (2^entropy / 2) / attemptsPerSecond
  // = 2^(entropy-1) / attemptsPerSecond

  // For very large entropy values, use logarithmic calculation
  // to avoid overflow
  const logSeconds = (entropy - 1) * Math.LN2 - Math.log(attemptsPerSecond);

  if (logSeconds < 0) {
    return Math.exp(logSeconds);
  }

  // For extremely large values, cap at a large number
  if (logSeconds > 100) {
    return Infinity;
  }

  return Math.exp(logSeconds);
}

/**
 * Format crack time to human-readable Chinese string
 *
 * @param seconds - Time in seconds
 * @returns Human-readable time string
 */
export function formatCrackTime(seconds: number): string {
  if (seconds === Infinity) {
    return "理论不可破解";
  }

  if (seconds < 0.001) {
    return "瞬间";
  }

  if (seconds < 1) {
    return "不到 1 秒";
  }

  if (seconds < 60) {
    return `约 ${Math.ceil(seconds)} 秒`;
  }

  const minutes = seconds / 60;
  if (minutes < 60) {
    return `约 ${Math.ceil(minutes)} 分钟`;
  }

  const hours = minutes / 60;
  if (hours < 24) {
    return `约 ${Math.ceil(hours)} 小时`;
  }

  const days = hours / 24;
  if (days < 30) {
    return `约 ${Math.ceil(days)} 天`;
  }

  const months = days / 30;
  if (months < 12) {
    return `约 ${Math.ceil(months)} 个月`;
  }

  const years = days / 365;
  if (years < 100) {
    return `约 ${Math.ceil(years)} 年`;
  }

  if (years < 1000) {
    return `约 ${Math.ceil(years)} 年`;
  }

  if (years < 10000) {
    return `约 ${formatLargeNumber(Math.ceil(years))} 年`;
  }

  if (years < 1000000) {
    return `约 ${formatLargeNumber(Math.ceil(years))} 年`;
  }

  if (years < 1000000000) {
    return `约 ${formatLargeNumber(Math.ceil(years))} 年`;
  }

  return "数十亿年以上";
}

/**
 * Format large numbers with Chinese units
 */
function formatLargeNumber(n: number): string {
  if (n >= 100000000) {
    return `${(n / 100000000).toFixed(1)} 亿`;
  }
  if (n >= 10000) {
    return `${(n / 10000).toFixed(1)} 万`;
  }
  if (n >= 1000) {
    return `${(n / 1000).toFixed(1)} 千`;
  }
  return n.toString();
}

/**
 * Estimate crack time and return human-readable string
 *
 * @param entropy - Entropy in bits
 * @returns Human-readable crack time estimate
 */
export function estimateCrackTime(entropy: number): string {
  const seconds = calculateCrackTimeSeconds(entropy);
  return formatCrackTime(seconds);
}

// ============================================================================
// Combined Analysis Function
// ============================================================================

/**
 * Perform complete strength analysis on a password
 *
 * @param mode - Password generation mode
 * @param poolSize - Character pool size or wordlist size
 * @param effectiveLength - Password length or word count
 * @returns Complete strength analysis
 */
export function analyzePasswordStrength(
  mode: "random" | "passphrase",
  poolSize: number,
  effectiveLength: number
): StrengthAnalysis {
  const entropy = calculateEntropy(mode, poolSize, effectiveLength);
  const strength = getStrengthLevel(entropy);
  const crackTimeSeconds = calculateCrackTimeSeconds(entropy);
  const crackTime = formatCrackTime(crackTimeSeconds);

  return {
    entropy,
    strength,
    crackTime,
    crackTimeSeconds,
  };
}
