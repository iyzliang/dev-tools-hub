"use client";

import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BASE_NAMES, BASE_PREFIXES, type Base } from "@/lib/base-converter";

export interface ConversionResultProps {
  /** Conversion results for all bases */
  results: {
    binary: string | null;
    octal: string | null;
    decimal: string | null;
    hexadecimal: string | null;
  };
  /** The base that was used as input source */
  sourceBase: Base | null;
  /** Callback when copy button is clicked */
  onCopy: (value: string, base: Base) => void;
}

const MAX_DISPLAY_LENGTH = 30;

function ResultCard({
  base,
  value,
  isSource,
  onCopy,
}: {
  base: Base;
  value: string | null;
  isSource: boolean;
  onCopy: (value: string, base: Base) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const shouldTruncate = value !== null && value.length > MAX_DISPLAY_LENGTH;
  const displayValue =
    value === null
      ? ""
      : shouldTruncate && !expanded
      ? `${value.substring(0, MAX_DISPLAY_LENGTH)}...`
      : value;

  const handleCopy = useCallback(async () => {
    if (value === null) return;

    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      onCopy(value, base);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  }, [value, base, onCopy]);

  return (
    <Card
      interactive={false}
      className={`relative overflow-hidden ${
        isSource
          ? "border-blue-500 bg-blue-50/50 ring-2 ring-blue-500 ring-offset-2"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex h-full flex-col">
        <div className="border-b border-slate-100 px-3 py-2">
          <span
            className={`text-xs font-semibold ${
              isSource ? "text-blue-700" : "text-slate-700"
            }`}
          >
            {isSource ? (
              <span className="inline-flex items-center gap-1.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-blue-600"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5" />
                </svg>
                {BASE_NAMES[base]}
              </span>
            ) : (
              BASE_NAMES[base]
            )}
          </span>
        </div>

        <div className="flex min-h-[80px] flex-1 items-center justify-between px-3 py-4">
          <div className="min-w-0 flex-1">
            {value === null ? (
              <span className="text-xs text-slate-400">-</span>
            ) : (
              <div className="flex flex-col gap-1">
                <code className="truncate font-mono text-sm text-slate-900">
                  {BASE_PREFIXES[base]}
                  {displayValue}
                </code>
                {shouldTruncate && (
                  <button
                    type="button"
                    onClick={() => setExpanded(!expanded)}
                    className="self-start text-[10px] text-blue-600 hover:text-blue-700"
                  >
                    {expanded ? "收起" : "展开全部"}
                  </button>
                )}
              </div>
            )}
          </div>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleCopy}
            disabled={value === null || copied}
            className="shrink-0 gap-1.5"
          >
            {copied ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                已复制
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                </svg>
                复制
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}

export function ConversionResult({
  results,
  sourceBase,
  onCopy,
}: ConversionResultProps) {
  const hasResults = Object.values(results).some((v) => v !== null);

  if (!hasResults) {
    return (
      <div className="flex h-full items-center justify-center border-2 border-dashed border-slate-200 bg-slate-50/50">
        <div className="text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mx-auto mb-2 text-slate-300"
          >
            <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <p className="text-sm text-slate-500">输入数字后点击转换</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {(["binary", "octal", "decimal", "hexadecimal"] as Base[]).map(
        (base) => (
          <ResultCard
            key={base}
            base={base}
            value={results[base]}
            isSource={base === sourceBase}
            onCopy={onCopy}
          />
        )
      )}
    </div>
  );
}

export default ConversionResult;
