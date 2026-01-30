"use client";

import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export interface TestStringInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function TestStringInput({
  value,
  onChange,
  placeholder = "输入或粘贴待匹配的文本",
  disabled = false,
  className,
}: TestStringInputProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <label
        className="text-xs font-medium text-slate-600"
        htmlFor="regex-test-string"
      >
        测试文本
      </label>
      <Textarea
        id="regex-test-string"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        rows={6}
        className="font-mono text-sm"
        aria-label="测试文本"
      />
    </div>
  );
}

TestStringInput.displayName = "TestStringInput";
