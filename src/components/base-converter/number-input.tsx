"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import {
  BASE_CHAR_DESCRIPTIONS,
  validateBaseInput,
  getValidationError,
  type Base,
} from "@/lib/base-converter";

export interface NumberInputProps {
  /** Current selected base */
  selectedBase: Base;
  /** Input value */
  value: string;
  /** Callback when value changes */
  onChange: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Whether input is disabled */
  disabled?: boolean;
}

export function NumberInput({
  selectedBase,
  value,
  onChange,
  placeholder = "请输入数字",
  disabled = false,
}: NumberInputProps) {
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      onChange(newValue);

      if (newValue.trim() === "") {
        setValidationError(null);
      } else if (!validateBaseInput(newValue, selectedBase)) {
        setValidationError(getValidationError(newValue, selectedBase));
      } else {
        setValidationError(null);
      }
    },
    [onChange, selectedBase]
  );

  const handleClear = useCallback(() => {
    onChange("");
    setValidationError(null);
  }, [onChange]);

  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`pr-8 font-mono ${
            validationError ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
          }`}
          aria-invalid={validationError !== null}
          aria-describedby={validationError ? "input-error" : undefined}
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            disabled={disabled}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
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
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-slate-500">
          {BASE_CHAR_DESCRIPTIONS[selectedBase]}
        </span>
        {validationError && (
          <span
            id="input-error"
            className="text-[10px] text-red-500"
            role="alert"
          >
            {validationError}
          </span>
        )}
      </div>
    </div>
  );
}

export default NumberInput;
