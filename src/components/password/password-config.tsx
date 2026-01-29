"use client";

import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  type RandomPasswordConfig,
  type PassphraseConfig,
  type PassphraseSeparator,
  DEFAULT_RANDOM_CONFIG,
  DEFAULT_PASSPHRASE_CONFIG,
} from "@/lib/password-utils";

// ============================================================================
// Types
// ============================================================================

export type PasswordMode = "random" | "passphrase";

export interface PasswordConfigProps {
  /** Current password generation mode */
  mode: PasswordMode;
  /** Callback when mode changes */
  onModeChange: (mode: PasswordMode) => void;
  /** Random password configuration */
  randomConfig: RandomPasswordConfig;
  /** Callback when random config changes */
  onRandomConfigChange: (config: RandomPasswordConfig) => void;
  /** Passphrase configuration */
  passphraseConfig: PassphraseConfig;
  /** Callback when passphrase config changes */
  onPassphraseConfigChange: (config: PassphraseConfig) => void;
  /** Number of passwords to generate */
  count: number;
  /** Callback when count changes */
  onCountChange: (count: number) => void;
  /** Callback when generate button is clicked */
  onGenerate: () => void;
  /** Whether generation is in progress */
  isGenerating?: boolean;
}

// ============================================================================
// Sub-components
// ============================================================================

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  unit?: string;
}

function Slider({ label, value, min, max, onChange, unit = "" }: SliderProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-slate-600">{label}</label>
        <span className="text-xs font-mono text-slate-500">
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-blue-600"
      />
    </div>
  );
}

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
}

function Checkbox({ label, checked, onChange, description }: CheckboxProps) {
  return (
    <label className="flex cursor-pointer items-start gap-2">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-blue-500"
      />
      <div>
        <span className="text-xs font-medium text-slate-700">{label}</span>
        {description && (
          <p className="text-[11px] text-slate-500">{description}</p>
        )}
      </div>
    </label>
  );
}

interface SeparatorSelectorProps {
  value: PassphraseSeparator;
  onChange: (separator: PassphraseSeparator) => void;
}

function SeparatorSelector({ value, onChange }: SeparatorSelectorProps) {
  const separators: { value: PassphraseSeparator; label: string }[] = [
    { value: "-", label: "连字符 (-)" },
    { value: "_", label: "下划线 (_)" },
    { value: ".", label: "点号 (.)" },
    { value: " ", label: "空格 ( )" },
  ];

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-slate-600">分隔符</label>
      <div className="grid grid-cols-2 gap-2">
        {separators.map((sep) => (
          <button
            key={sep.value}
            type="button"
            onClick={() => onChange(sep.value)}
            className={`cursor-pointer rounded-md border px-3 py-1.5 text-xs font-medium transition-all ${
              value === sep.value
                ? "border-blue-600 bg-blue-50 text-blue-700"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            {sep.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * Password configuration panel component
 *
 * Provides UI for configuring password generation options
 * for both random passwords and passphrases.
 */
export function PasswordConfig({
  mode,
  onModeChange,
  randomConfig,
  onRandomConfigChange,
  passphraseConfig,
  onPassphraseConfigChange,
  count,
  onCountChange,
  onGenerate,
  isGenerating = false,
}: PasswordConfigProps) {
  // Handler for random config character options
  const handleCharacterChange = useCallback(
    (key: keyof RandomPasswordConfig["characters"], checked: boolean) => {
      onRandomConfigChange({
        ...randomConfig,
        characters: {
          ...randomConfig.characters,
          [key]: checked,
        },
      });
    },
    [randomConfig, onRandomConfigChange]
  );

  // Check if at least one character type is selected
  const hasSelectedCharType =
    randomConfig.characters.uppercase ||
    randomConfig.characters.lowercase ||
    randomConfig.characters.digits ||
    randomConfig.characters.symbols;

  return (
    <div className="flex h-full flex-col">
      {/* Mode Toggle */}
      <div className="mb-4">
        <div className="inline-flex w-full rounded-lg border border-slate-200 bg-slate-50 p-0.5">
          <button
            type="button"
            onClick={() => onModeChange("random")}
            className={`flex-1 cursor-pointer rounded-md px-4 py-2 text-xs font-medium transition-all duration-150 ${
              mode === "random"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            随机密码
          </button>
          <button
            type="button"
            onClick={() => onModeChange("passphrase")}
            className={`flex-1 cursor-pointer rounded-md px-4 py-2 text-xs font-medium transition-all duration-150 ${
              mode === "passphrase"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            密码短语
          </button>
        </div>
      </div>

      {/* Scrollable Config Area */}
      <div className="flex-1 space-y-4 overflow-y-auto pr-1">
        {mode === "random" ? (
          /* Random Password Config */
          <>
            {/* Length Slider */}
            <Slider
              label="密码长度"
              value={randomConfig.length}
              min={8}
              max={128}
              onChange={(length) =>
                onRandomConfigChange({ ...randomConfig, length })
              }
              unit=" 位"
            />

            {/* Character Types */}
            <div className="space-y-3">
              <label className="text-xs font-medium text-slate-600">
                字符类型
              </label>
              <div className="space-y-2.5 rounded-lg border border-slate-200 bg-white p-3">
                <Checkbox
                  label="大写字母 (A-Z)"
                  checked={randomConfig.characters.uppercase}
                  onChange={(checked) =>
                    handleCharacterChange("uppercase", checked)
                  }
                />
                <Checkbox
                  label="小写字母 (a-z)"
                  checked={randomConfig.characters.lowercase}
                  onChange={(checked) =>
                    handleCharacterChange("lowercase", checked)
                  }
                />
                <Checkbox
                  label="数字 (0-9)"
                  checked={randomConfig.characters.digits}
                  onChange={(checked) =>
                    handleCharacterChange("digits", checked)
                  }
                />
                <Checkbox
                  label="符号 (!@#$%...)"
                  checked={randomConfig.characters.symbols}
                  onChange={(checked) =>
                    handleCharacterChange("symbols", checked)
                  }
                />
              </div>
              {!hasSelectedCharType && (
                <p className="text-xs text-red-500">请至少选择一种字符类型</p>
              )}
            </div>

            {/* Readable Mode */}
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <Checkbox
                label="可读性模式"
                checked={randomConfig.readableMode}
                onChange={(readableMode) =>
                  onRandomConfigChange({ ...randomConfig, readableMode })
                }
                description="排除易混淆字符 (0/O, 1/l/I, 5/S 等)"
              />
            </div>

            {/* Exclude Characters */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-600">
                排除字符（可选）
              </label>
              <input
                type="text"
                value={randomConfig.excludeChars}
                onChange={(e) =>
                  onRandomConfigChange({
                    ...randomConfig,
                    excludeChars: e.target.value,
                  })
                }
                placeholder="输入要排除的字符"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </>
        ) : (
          /* Passphrase Config */
          <>
            {/* Word Count Slider */}
            <Slider
              label="单词数量"
              value={passphraseConfig.wordCount}
              min={3}
              max={8}
              onChange={(wordCount) =>
                onPassphraseConfigChange({ ...passphraseConfig, wordCount })
              }
              unit=" 个"
            />

            {/* Separator */}
            <SeparatorSelector
              value={passphraseConfig.separator}
              onChange={(separator) =>
                onPassphraseConfigChange({ ...passphraseConfig, separator })
              }
            />

            {/* Capitalize */}
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <Checkbox
                label="首字母大写"
                checked={passphraseConfig.capitalize}
                onChange={(capitalize) =>
                  onPassphraseConfigChange({ ...passphraseConfig, capitalize })
                }
                description="每个单词首字母大写"
              />
            </div>

            {/* Info about EFF wordlist */}
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3">
              <p className="text-[11px] text-slate-500">
                使用 EFF Diceware 词表（7776 个单词）
                <br />
                每个单词提供约 12.9 bits 熵值
              </p>
            </div>
          </>
        )}

        {/* Generation Count */}
        <div className="border-t border-slate-200 pt-4">
          <Slider
            label="生成数量"
            value={count}
            min={1}
            max={10}
            onChange={onCountChange}
            unit=" 个"
          />
        </div>
      </div>

      {/* Generate Button */}
      <div className="mt-4 pt-4 border-t border-slate-200">
        <Button
          onClick={onGenerate}
          disabled={isGenerating || (mode === "random" && !hasSelectedCharType)}
          className="w-full gap-2"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          {isGenerating ? "生成中..." : "生成密码"}
        </Button>
        <p className="mt-2 text-center text-[11px] text-slate-400">
          快捷键：
          <kbd className="mx-1 inline-flex items-center rounded border border-slate-200 bg-slate-100 px-1 py-0.5 font-mono text-[10px] text-slate-600">
            ⌘/Ctrl + Enter
          </kbd>
        </p>
      </div>
    </div>
  );
}

export { DEFAULT_RANDOM_CONFIG, DEFAULT_PASSPHRASE_CONFIG };
export default PasswordConfig;
