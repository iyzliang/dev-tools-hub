"use client";

import type { ExplainPart } from "@/lib/regex-utils";

export interface ExplainResultViewProps {
  parts: ExplainPart[];
  error?: string;
}

const TYPE_LABELS: Record<string, string> = {
  literal: "字面量",
  escape: "转义",
  characterClass: "字符类",
  group: "分组",
  anchor: "锚点",
  quantifier: "量词",
  alternation: "或",
  any: "任意字符",
};

export function ExplainResultView({ parts, error }: ExplainResultViewProps) {
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

  if (parts.length === 0) {
    return (
      <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-6 text-center text-sm text-slate-500">
        输入正则后执行「解释」，将在此显示各片段说明
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <span className="text-xs font-medium text-slate-600">正则解释</span>
      <ul className="max-h-[400px] space-y-1.5 overflow-y-auto" role="list">
        {parts.map((part, index) => (
          <li
            key={`${index}-${part.raw}`}
            className="flex flex-wrap items-baseline gap-2 rounded border border-slate-100 bg-slate-50/50 px-2.5 py-1.5 text-sm"
          >
            <code className="font-mono text-slate-800">{part.raw}</code>
            <span className="text-xs text-slate-500">
              {TYPE_LABELS[part.type] ?? part.type}
            </span>
            <span className="text-slate-600">{part.description}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

ExplainResultView.displayName = "ExplainResultView";
