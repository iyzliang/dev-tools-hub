"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export interface ReplaceResultViewProps {
  result: string;
  /** When undefined, means not run yet; show placeholder */
  replaceCount?: number;
  error?: string;
  onCopy?: (text: string) => void;
}

export function ReplaceResultView({
  result,
  replaceCount = 0,
  error,
  onCopy,
}: ReplaceResultViewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      onCopy?.(result);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  }, [result, onCopy]);

  if (error) {
    return (
      <div
        className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        role="alert"
      >
        {error}
      </div>
    );
  }

  if (result === "" && replaceCount === undefined) {
    return (
      <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-6 text-center text-sm text-slate-500">
        输入正则、替换字符串与测试文本后执行，将在此显示替换结果
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        {replaceCount >= 0 && (
          <span className="text-xs font-medium text-slate-600">
            共替换 {replaceCount} 处
          </span>
        )}
        <Button
          variant="secondary"
          size="sm"
          onClick={handleCopy}
          aria-label="复制结果"
        >
          {copied ? "已复制" : "复制结果"}
        </Button>
      </div>
      <Textarea
        readOnly
        value={result}
        rows={10}
        className="font-mono text-sm"
        aria-label="替换结果"
      />
    </div>
  );
}

ReplaceResultView.displayName = "ReplaceResultView";
