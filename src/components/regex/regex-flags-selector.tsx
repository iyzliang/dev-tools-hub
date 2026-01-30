"use client";

import { cn } from "@/lib/utils";
import type { RegexFlagsInput } from "@/lib/regex-utils";

export interface RegexFlagsSelectorProps {
  value: RegexFlagsInput;
  onChange: (flags: RegexFlagsInput) => void;
  disabled?: boolean;
}

const FLAG_OPTIONS: {
  key: keyof RegexFlagsInput;
  label: string;
  title: string;
}[] = [
  { key: "g", label: "g", title: "全局匹配" },
  { key: "i", label: "i", title: "忽略大小写" },
  { key: "m", label: "m", title: "多行模式（^$ 匹配行首行尾）" },
  { key: "s", label: "s", title: "dotAll（. 匹配换行）" },
  { key: "u", label: "u", title: "Unicode 模式" },
  { key: "y", label: "y", title: "粘性匹配（从 lastIndex 开始）" },
];

export function RegexFlagsSelector({
  value,
  onChange,
  disabled = false,
}: RegexFlagsSelectorProps) {
  const handleToggle = (key: keyof RegexFlagsInput) => {
    if (disabled) return;
    const next = { ...value, [key]: !value[key] };
    onChange(next);
  };

  return (
    <div className="space-y-2">
      <label
        className="text-xs font-medium text-slate-600"
        htmlFor="regex-flags"
      >
        标志位
      </label>
      <div
        id="regex-flags"
        role="group"
        aria-label="正则标志位"
        className="flex flex-wrap gap-2"
      >
        {FLAG_OPTIONS.map(({ key, label, title }) => (
          <button
            key={key}
            type="button"
            title={title}
            aria-label={title}
            aria-pressed={value[key] === true}
            disabled={disabled}
            onClick={() => handleToggle(key)}
            className={cn(
              "cursor-pointer rounded-md border px-2.5 py-1.5 text-xs font-medium transition-all",
              value[key]
                ? "border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600 ring-offset-1"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50",
              disabled && "cursor-not-allowed opacity-60",
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

RegexFlagsSelector.displayName = "RegexFlagsSelector";
