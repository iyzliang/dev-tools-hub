"use client";

import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { buildRegex } from "@/lib/regex-utils";

export interface RegexInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function RegexInput({
  value,
  onChange,
  placeholder = "输入正则表达式，如 \\d+",
  disabled = false,
  className,
}: RegexInputProps) {
  const validation = useMemo(() => {
    if (value.trim().length === 0) return null;
    const built = buildRegex(value);
    if (built instanceof RegExp) return null;
    return built.error;
  }, [value]);

  return (
    <div className={cn("space-y-1", className)}>
      <label className="text-xs font-medium text-slate-600" htmlFor="regex-pattern">
        正则表达式
      </label>
      <Input
        id="regex-pattern"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        hasError={!!validation}
        className="font-mono text-sm"
        aria-invalid={!!validation}
        aria-describedby={validation ? "regex-pattern-error" : undefined}
      />
      {validation && (
        <p
          id="regex-pattern-error"
          className="text-xs text-red-600"
          role="alert"
        >
          {validation}
        </p>
      )}
    </div>
  );
}

RegexInput.displayName = "RegexInput";
