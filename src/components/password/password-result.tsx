"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { StrengthMeter } from "./strength-meter";
import { type GeneratedPassword } from "@/lib/password-utils";

// ============================================================================
// Types
// ============================================================================

export interface PasswordResultProps {
  /** Array of generated passwords */
  passwords: GeneratedPassword[];
  /** Callback when copy event occurs (for analytics) */
  onCopy?: (password: GeneratedPassword) => void;
  /** Callback when copy all event occurs (for analytics) */
  onCopyAll?: (passwords: GeneratedPassword[]) => void;
}

// ============================================================================
// Sub-components
// ============================================================================

interface PasswordCardProps {
  password: GeneratedPassword;
  index: number;
  onCopy?: () => void;
}

function PasswordCard({ password, index, onCopy }: PasswordCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(password.value);
      setCopied(true);
      onCopy?.();
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  }, [password.value, onCopy]);

  return (
    <div className="group rounded-lg border border-slate-200 bg-white p-4 transition-all hover:border-slate-300 hover:shadow-sm">
      {/* Password display */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[10px] font-medium text-slate-500">
              {index + 1}
            </span>
            <span className="text-[11px] text-slate-400">
              {password.mode === "random" ? "随机密码" : "密码短语"}
            </span>
          </div>
          <p
            className="break-all font-mono text-sm leading-relaxed text-slate-800 select-all"
            title={password.value}
          >
            {password.value}
          </p>
        </div>
        <Button
          size="sm"
          variant="secondary"
          onClick={handleCopy}
          className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
        >
          {copied ? (
            <>
              <svg
                className="mr-1 h-3.5 w-3.5 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              已复制
            </>
          ) : (
            <>
              <svg
                className="mr-1 h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              复制
            </>
          )}
        </Button>
      </div>

      {/* Strength meter */}
      <StrengthMeter
        password={password.value}
        mode={password.mode}
        poolSize={password.poolSize}
        effectiveLength={password.effectiveLength}
      />
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * Password result display component
 *
 * Shows a list of generated passwords with strength analysis
 * and copy functionality.
 */
export function PasswordResult({
  passwords,
  onCopy,
  onCopyAll,
}: PasswordResultProps) {
  const [copiedAll, setCopiedAll] = useState(false);

  const handleCopyAll = useCallback(async () => {
    if (passwords.length === 0) return;

    try {
      const text = passwords.map((p) => p.value).join("\n");
      await navigator.clipboard.writeText(text);
      setCopiedAll(true);
      onCopyAll?.(passwords);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch (error) {
      console.error("Failed to copy all:", error);
    }
  }, [passwords, onCopyAll]);

  // Empty state
  if (passwords.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
        <div className="mb-4 rounded-full bg-slate-100 p-4">
          <svg
            className="h-8 w-8 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z"
            />
          </svg>
        </div>
        <h3 className="mb-1 text-sm font-medium text-slate-700">
          还没有生成密码
        </h3>
        <p className="text-xs text-slate-500">
          在左侧配置选项，然后点击「生成密码」按钮
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-xs font-medium text-slate-700">
            生成结果
          </span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
            {passwords.length} 个
          </span>
        </div>
        <Button
          size="sm"
          variant="secondary"
          onClick={handleCopyAll}
          className="gap-1.5"
        >
          {copiedAll ? (
            <>
              <svg
                className="h-3.5 w-3.5 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              已全部复制
            </>
          ) : (
            <>
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
                />
              </svg>
              全部复制
            </>
          )}
        </Button>
      </div>

      {/* Password list */}
      <div className="flex-1 space-y-3 overflow-y-auto pr-1">
        {passwords.map((password, index) => (
          <PasswordCard
            key={`${password.value}-${index}`}
            password={password}
            index={index}
            onCopy={() => onCopy?.(password)}
          />
        ))}
      </div>
    </div>
  );
}

export default PasswordResult;
