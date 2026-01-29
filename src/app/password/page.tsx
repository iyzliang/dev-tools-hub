"use client";

import { useCallback, useEffect, useState } from "react";
import { PasswordConfig, type PasswordMode } from "@/components/password/password-config";
import { PasswordResult } from "@/components/password/password-result";
import { trackEvent, getInputSizeRange } from "@/lib/analytics";
import {
  generateRandomPassword,
  generatePassphrase,
  generateMultiple,
  DEFAULT_RANDOM_CONFIG,
  DEFAULT_PASSPHRASE_CONFIG,
  type RandomPasswordConfig,
  type PassphraseConfig,
  type GeneratedPassword,
} from "@/lib/password-utils";

const PASSWORD_TOOL_NAME = "password-generator";

export default function PasswordToolPage() {
  // Mode state
  const [mode, setMode] = useState<PasswordMode>("random");

  // Config states
  const [randomConfig, setRandomConfig] =
    useState<RandomPasswordConfig>(DEFAULT_RANDOM_CONFIG);
  const [passphraseConfig, setPassphraseConfig] =
    useState<PassphraseConfig>(DEFAULT_PASSPHRASE_CONFIG);

  // Generation state
  const [count, setCount] = useState(1);
  const [passwords, setPasswords] = useState<GeneratedPassword[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Track tool open
  useEffect(() => {
    trackEvent(
      "tool_open",
      { tool_name: PASSWORD_TOOL_NAME },
      { toolName: PASSWORD_TOOL_NAME }
    );
  }, []);

  // Generate passwords
  const handleGenerate = useCallback(() => {
    setIsGenerating(true);

    try {
      let generated: GeneratedPassword[];

      if (mode === "random") {
        generated = generateMultiple(count, () =>
          generateRandomPassword(randomConfig)
        );

        // Track event
        trackEvent(
          "password_generate",
          {
            mode: "random",
            length: randomConfig.length,
            char_types: {
              uppercase: randomConfig.characters.uppercase,
              lowercase: randomConfig.characters.lowercase,
              digits: randomConfig.characters.digits,
              symbols: randomConfig.characters.symbols,
            },
            readable_mode: randomConfig.readableMode,
            count,
          },
          { toolName: PASSWORD_TOOL_NAME }
        );
      } else {
        generated = generateMultiple(count, () =>
          generatePassphrase(passphraseConfig)
        );

        // Track event
        trackEvent(
          "password_generate",
          {
            mode: "passphrase",
            word_count: passphraseConfig.wordCount,
            separator: passphraseConfig.separator,
            capitalize: passphraseConfig.capitalize,
            count,
          },
          { toolName: PASSWORD_TOOL_NAME }
        );
      }

      setPasswords(generated);
    } catch (error) {
      console.error("Password generation failed:", error);
      // Could add error state/toast here
    } finally {
      setIsGenerating(false);
    }
  }, [mode, count, randomConfig, passphraseConfig]);

  // Handle copy single
  const handleCopy = useCallback((password: GeneratedPassword) => {
    trackEvent(
      "password_copy",
      {
        mode: password.mode,
        strength_level: password.effectiveLength,
      },
      { toolName: PASSWORD_TOOL_NAME }
    );
  }, []);

  // Handle copy all
  const handleCopyAll = useCallback((passwords: GeneratedPassword[]) => {
    trackEvent(
      "password_copy_all",
      {
        count: passwords.length,
      },
      { toolName: PASSWORD_TOOL_NAME }
    );
  }, []);

  // Keyboard shortcut (Cmd/Ctrl + Enter)
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const isCmdOrCtrl = event.metaKey || event.ctrlKey;
      if (!isCmdOrCtrl || event.key !== "Enter") return;

      event.preventDefault();
      handleGenerate();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleGenerate]);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header Section */}
      <header className="shrink-0 space-y-4 pb-4">
        {/* Title */}
        <div className="space-y-1.5">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            密码生成器
          </h1>
          <p className="text-sm leading-relaxed text-slate-500">
            生成安全的随机密码或易记忆的密码短语。支持快捷键{" "}
            <kbd className="inline-flex items-center rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-600">
              ⌘/Ctrl + Enter
            </kbd>
          </p>
        </div>
      </header>

      {/* Main Content - Two Column Layout */}
      <section className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Left Panel - Configuration */}
        <div className="flex min-h-0 flex-col">
          <div className="mb-2 flex shrink-0 items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            <span className="text-xs font-medium text-slate-700">
              配置选项
            </span>
          </div>
          <div className="min-h-0 flex-1 rounded-lg border border-slate-200 bg-slate-50/50 p-4">
            <PasswordConfig
              mode={mode}
              onModeChange={setMode}
              randomConfig={randomConfig}
              onRandomConfigChange={setRandomConfig}
              passphraseConfig={passphraseConfig}
              onPassphraseConfigChange={setPassphraseConfig}
              count={count}
              onCountChange={setCount}
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
            />
          </div>
        </div>

        {/* Right Panel - Results */}
        <div className="flex min-h-0 flex-col">
          <div className="mb-2 flex shrink-0 items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-medium text-slate-700">
              生成结果
            </span>
          </div>
          <div className="min-h-0 flex-1 rounded-lg border border-slate-200 bg-white p-4">
            <PasswordResult
              passwords={passwords}
              onCopy={handleCopy}
              onCopyAll={handleCopyAll}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
