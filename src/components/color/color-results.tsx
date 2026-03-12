"use client";

import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  COLOR_FORMAT_NAMES,
  type ColorFormat,
  type RGBA,
} from "@/lib/color-utils";

export interface ColorResultsProps {
  /** Current color value */
  color: RGBA | null;
  /** Color values in all formats */
  formats: Record<ColorFormat, string>;
  /** Callback when copy button is clicked */
  onCopy: (format: ColorFormat, value: string) => void;
}

function ResultCard({
  format,
  value,
  onCopy,
}: {
  format: ColorFormat;
  value: string;
  onCopy: (format: ColorFormat, value: string) => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      onCopy(format, value);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  }, [value, format, onCopy]);

  return (
    <Card interactive={false} className="overflow-hidden">
      <div className="flex h-full flex-col">
        <div className="border-b border-slate-100 px-3 py-2">
          <span className="text-xs font-semibold text-slate-700">
            {COLOR_FORMAT_NAMES[format]}
          </span>
        </div>

        <div className="flex flex-col gap-2 px-3 py-3">
          <code className="block break-all font-mono text-sm text-slate-900">
            {value || "-"}
          </code>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleCopy}
            disabled={!value || copied}
            className="self-start gap-1.5"
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

export function ColorResults({ color, formats, onCopy }: ColorResultsProps) {
  if (!color) {
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
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
          </svg>
          <p className="text-sm text-slate-500">选择或输入颜色值</p>
        </div>
      </div>
    );
  }

  const formatList: ColorFormat[] = ["hex", "rgb", "rgba", "hsl", "hsla"];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {formatList.map((format) => (
        <ResultCard
          key={format}
          format={format}
          value={formats[format]}
          onCopy={onCopy}
        />
      ))}
    </div>
  );
}

export default ColorResults;