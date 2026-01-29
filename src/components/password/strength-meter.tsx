"use client";

import { useMemo } from "react";
import { analyzePasswordStrength, type StrengthAnalysis } from "@/lib/entropy-utils";

// ============================================================================
// Types
// ============================================================================

export interface StrengthMeterProps {
  /** The generated password */
  password: string;
  /** Password generation mode */
  mode: "random" | "passphrase";
  /** Character pool size (for random) or wordlist size (for passphrase) */
  poolSize: number;
  /** Password length (for random) or word count (for passphrase) */
  effectiveLength: number;
  /** Whether to show compact version */
  compact?: boolean;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Password strength meter component
 *
 * Displays entropy, strength level, and estimated crack time
 * with a visual progress bar.
 */
export function StrengthMeter({
  password,
  mode,
  poolSize,
  effectiveLength,
  compact = false,
}: StrengthMeterProps) {
  // Calculate strength analysis
  const analysis: StrengthAnalysis = useMemo(() => {
    if (!password) {
      return {
        entropy: 0,
        strength: {
          level: "very-weak" as const,
          label: "极弱",
          color: "text-red-600",
          bgColor: "bg-red-500",
          percentage: 0,
        },
        crackTime: "瞬间",
        crackTimeSeconds: 0,
      };
    }
    return analyzePasswordStrength(mode, poolSize, effectiveLength);
  }, [password, mode, poolSize, effectiveLength]);

  const { entropy, strength, crackTime } = analysis;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {/* Compact progress bar */}
        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-200">
          <div
            className={`h-full transition-all duration-300 ${strength.bgColor}`}
            style={{ width: `${strength.percentage}%` }}
          />
        </div>
        {/* Strength label */}
        <span className={`text-xs font-medium ${strength.color}`}>
          {strength.label}
        </span>
        {/* Entropy */}
        <span className="text-xs text-slate-500">
          {entropy.toFixed(0)} bits
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Progress bar */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className={`h-full transition-all duration-300 ease-out ${strength.bgColor}`}
          style={{ width: `${strength.percentage}%` }}
        />
      </div>

      {/* Info row */}
      <div className="flex items-center justify-between text-xs">
        {/* Strength and entropy */}
        <div className="flex items-center gap-2">
          <span className={`font-semibold ${strength.color}`}>
            {strength.label}
          </span>
          <span className="text-slate-400">·</span>
          <span className="font-mono text-slate-600">
            {entropy.toFixed(0)} bits
          </span>
        </div>

        {/* Crack time */}
        <div className="text-slate-500">
          预估破解时间：
          <span className="font-medium text-slate-700">{crackTime}</span>
        </div>
      </div>
    </div>
  );
}

export default StrengthMeter;
