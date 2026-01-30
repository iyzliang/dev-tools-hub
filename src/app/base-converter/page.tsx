"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { BaseSelector } from "@/components/base-converter/base-selector";
import { NumberInput } from "@/components/base-converter/number-input";
import { ConversionResult } from "@/components/base-converter/conversion-result";
import { trackEvent } from "@/lib/analytics";
import {
  convertAllBases,
  type Base,
  DEFAULT_BASE,
} from "@/lib/base-converter";

const BASE_CONVERTER_TOOL_NAME = "base-converter";

export default function BaseConverterPage() {
  const [selectedBase, setSelectedBase] = useState<Base>(DEFAULT_BASE);
  const [inputValue, setInputValue] = useState("");
  const [conversionResults, setConversionResults] = useState<{
    binary: string | null;
    octal: string | null;
    decimal: string | null;
    hexadecimal: string | null;
  }>({
    binary: null,
    octal: null,
    decimal: null,
    hexadecimal: null,
  });

  const handleConvert = useCallback(() => {
    const trimmedInput = inputValue.trim();
    if (!trimmedInput) {
      setConversionResults({
        binary: null,
        octal: null,
        decimal: null,
        hexadecimal: null,
      });
      return;
    }

    const results = convertAllBases(trimmedInput, selectedBase);
    setConversionResults(results);

    const isSuccess = Object.values(results).some((v) => v !== null);
    trackEvent(
      "base_convert",
      {
        source_base: selectedBase,
        success: isSuccess,
        input_length: trimmedInput.length,
      },
      { toolName: BASE_CONVERTER_TOOL_NAME }
    );
  }, [inputValue, selectedBase]);

  const handleCopy = useCallback((value: string, base: Base) => {
    trackEvent(
      "base_copy_result",
      {
        base,
        result_length: value.length,
      },
      { toolName: BASE_CONVERTER_TOOL_NAME }
    );
  }, []);

  const handleBaseChange = useCallback((base: Base) => {
    setSelectedBase(base);
    setConversionResults({
      binary: null,
      octal: null,
      decimal: null,
      hexadecimal: null,
    });
  }, []);

  const handleInputChange = useCallback((value: string) => {
    setInputValue(value);
  }, []);

  useEffect(() => {
    trackEvent(
      "tool_open",
      { tool_name: BASE_CONVERTER_TOOL_NAME },
      { toolName: BASE_CONVERTER_TOOL_NAME }
    );
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const isCmdOrCtrl = event.metaKey || event.ctrlKey;
      if (!isCmdOrCtrl || event.key !== "Enter") return;

      event.preventDefault();
      handleConvert();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleConvert]);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className="shrink-0 space-y-4 pb-4">
        <div className="space-y-1.5">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            进制转换
          </h1>
          <p className="text-sm leading-relaxed text-slate-500">
            支持二进制、八进制、十进制、十六进制之间的相互转换。支持快捷键{" "}
            <kbd className="inline-flex items-center rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-600">
              ⌘/Ctrl + Enter
            </kbd>
          </p>
        </div>
      </header>

      <section className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex min-h-0 flex-col">
          <div className="mb-2 flex shrink-0 items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            <span className="text-xs font-medium text-slate-700">
              输入配置
            </span>
          </div>
          <div className="min-h-0 flex-1 rounded-lg border border-slate-200 bg-slate-50/50 p-4">
            <div className="flex h-full flex-col gap-4 overflow-y-auto">
              <BaseSelector
                value={selectedBase}
                onChange={handleBaseChange}
              />
              <NumberInput
                selectedBase={selectedBase}
                value={inputValue}
                onChange={handleInputChange}
                placeholder="请输入数字"
              />
              <div className="mt-auto pt-4">
                <Button onClick={handleConvert} className="w-full gap-2">
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
                    <path d="M17 9.5c.25-1.13.25-2.5 0-3.25-.75-3.75-1.5.25-1.25.25-2.5 0-3.5-1.5L9 13V9c0-2.77-2.23-5-5-5S-1 6.23-1 9v4l-3.5-3.5C3.25 9.75 3.25 11 3.5 12.25c-.25.75-.25 2.12 0 3.25.75 1.5 3.75 3.75 3.5 6.25 0 1.13-.25 2.5 0 3.5-1.5L15 11V9c0-2.77 2.23-5 5-5" />
                  </svg>
                  转换
                </Button>
                <p className="mt-2 text-center text-[11px] text-slate-400">
                  快捷键：
                  <kbd className="mx-1 inline-flex items-center rounded border border-slate-200 bg-slate-100 px-1 py-0.5 font-mono text-[10px] text-slate-600">
                    ⌘/Ctrl + Enter
                  </kbd>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex min-h-0 flex-col">
          <div className="mb-2 flex shrink-0 items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-medium text-slate-700">
              转换结果
            </span>
          </div>
          <div className="min-h-0 flex-1 rounded-lg border border-slate-200 bg-white p-4">
            <ConversionResult
              results={conversionResults}
              sourceBase={conversionResults[selectedBase] === inputValue.trim() ? selectedBase : null}
              onCopy={handleCopy}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
