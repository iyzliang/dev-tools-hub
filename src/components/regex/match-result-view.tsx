"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { MatchResult } from "@/lib/regex-utils";

export interface MatchResultViewProps {
  matches: MatchResult[];
  input: string;
  error?: string;
  onCopy?: (text: string) => void;
}

export function MatchResultView({
  matches,
  input,
  error,
  onCopy,
}: MatchResultViewProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | "all" | null>(null);

  const handleCopyOne = useCallback(
    async (item: MatchResult) => {
      try {
        await navigator.clipboard.writeText(item.match);
        setCopiedIndex(matches.indexOf(item));
        onCopy?.(item.match);
        setTimeout(() => setCopiedIndex(null), 2000);
      } catch (err) {
        console.error("Copy failed:", err);
      }
    },
    [matches, onCopy],
  );

  const handleCopyAll = useCallback(async () => {
    const text = matches.map((m) => m.match).join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex("all");
      onCopy?.(text);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  }, [matches, onCopy]);

  if (error) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
        {error}
      </div>
    );
  }

  if (matches.length === 0 && input.length > 0) {
    return (
      <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-6 text-center text-sm text-slate-500">
        无匹配
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-6 text-center text-sm text-slate-500">
        输入正则与测试文本后执行，将在此显示匹配结果
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-600">
          共 {matches.length} 处匹配
        </span>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleCopyAll}
          aria-label="复制全部匹配"
        >
          {copiedIndex === "all" ? "已复制" : "复制全部"}
        </Button>
      </div>
      <ul className="space-y-2" role="list">
        {matches.map((item, index) => (
          <li key={`${item.index}-${index}`}>
            <Card interactive={false} className="border-slate-200 p-3">
              <div className="flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <code className="flex-1 break-all font-mono text-sm text-slate-800">
                    {item.match}
                  </code>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => handleCopyOne(item)}
                    aria-label={`复制第 ${index + 1} 条匹配`}
                  >
                    {copiedIndex === index ? "已复制" : "复制"}
                  </Button>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span>索引: {item.index}</span>
                  {Object.keys(item.groups).length > 0 && (
                    <span>
                      捕获组:{" "}
                      {Object.entries(item.groups)
                        .filter(([, v]) => v !== undefined)
                        .map(([k, v]) => `$${Number(k) + 1}=${v}`)
                        .join(", ")}
                    </span>
                  )}
                </div>
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}

MatchResultView.displayName = "MatchResultView";
