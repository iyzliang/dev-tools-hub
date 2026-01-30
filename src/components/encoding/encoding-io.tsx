"use client";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export interface EncodingIOProps {
  inputValue: string;
  onInputChange: (value: string) => void;
  placeholder?: string;
  result: React.ReactNode;
  onClearInput?: () => void;
  inputLabel?: string;
  resultLabel?: string;
}

export function EncodingIO({
  inputValue,
  onInputChange,
  placeholder = "在此输入或粘贴内容…",
  result,
  onClearInput,
  inputLabel = "输入",
  resultLabel = "结果",
}: EncodingIOProps) {
  return (
    <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="flex min-h-0 flex-col">
        <div className="mb-2 flex shrink-0 items-center justify-between">
          <label className="text-xs font-medium text-slate-600" htmlFor="encoding-input">
            {inputLabel}
          </label>
          {onClearInput && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onClearInput}
              aria-label="清空输入"
              className="h-7 gap-1 px-2 text-xs"
            >
              <Trash2 className="h-3 w-3" />
              清空
            </Button>
          )}
        </div>
        <Textarea
          id="encoding-input"
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder={placeholder}
          className="min-h-[200px] flex-1 resize-y font-mono text-sm"
          aria-label={inputLabel}
        />
      </div>
      <div className="flex min-h-0 flex-col">
        <label className="mb-2 shrink-0 text-xs font-medium text-slate-600">
          {resultLabel}
        </label>
        <div className="min-h-[200px] flex-1 overflow-auto rounded-md border border-slate-200 bg-slate-50/50 p-3">
          {result}
        </div>
      </div>
    </div>
  );
}

export default EncodingIO;
