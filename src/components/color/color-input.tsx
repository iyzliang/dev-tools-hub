"use client";

import { useState, useCallback, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { COLOR_FORMAT_NAMES, type ColorFormat } from "@/lib/color-utils";

export interface ColorInputProps {
  /** Color format type */
  format: ColorFormat;
  /** Current color value string */
  value: string;
  /** Callback when value changes */
  onChange: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
}

export function ColorInput({
  format,
  value,
  onChange,
  placeholder,
}: ColorInputProps) {
  const [internalValue, setInternalValue] = useState(value);

  // Sync internal value with external value
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInternalValue(newValue);
      onChange(newValue);
    },
    [onChange]
  );

  const handleClear = useCallback(() => {
    setInternalValue("");
    onChange("");
  }, [onChange]);

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-slate-600">
        {COLOR_FORMAT_NAMES[format]}
      </label>
      <div className="relative">
        <Input
          type="text"
          value={internalValue}
          onChange={handleChange}
          placeholder={placeholder}
          className="pr-8 font-mono text-xs"
        />
        {internalValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            aria-label="清除输入"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M8 12h8" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

export default ColorInput;