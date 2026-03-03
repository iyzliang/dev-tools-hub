"use client";

import { useState, useEffect } from "react";
import { ShadowControls } from "@/components/box-shadow/shadow-controls";
import { ShadowPreview } from "@/components/box-shadow/shadow-preview";
import { ShadowCodeOutput } from "@/components/box-shadow/shadow-code-output";
import { ShadowPresetSelector } from "@/components/box-shadow/shadow-preset-selector";
import { trackEvent } from "@/lib/analytics";
import type { ShadowParams } from "@/lib/shadow-utils";
import { normalizeShadowParams } from "@/lib/shadow-utils";

const BOX_SHADOW_TOOL_NAME = "box-shadow";

const DEFAULT_PARAMS: ShadowParams = {
  x: 0,
  y: 4,
  blur: 6,
  spread: -1,
  color: "#000000",
  opacity: 0.1,
  inset: false,
};

export default function BoxShadowPage() {
  const [params, setParams] = useState<ShadowParams>(DEFAULT_PARAMS);
  const [backgroundColor, setBackgroundColor] = useState("#f3f4f6");

  useEffect(() => {
    trackEvent(
      "tool_open",
      { tool_name: BOX_SHADOW_TOOL_NAME },
      { toolName: BOX_SHADOW_TOOL_NAME }
    );
  }, []);

  const handleParamsChange = (newParams: ShadowParams) => {
    setParams(normalizeShadowParams(newParams));
    trackEvent(
      "shadow_adjust",
      { param_count: Object.keys(newParams).length },
      { toolName: BOX_SHADOW_TOOL_NAME }
    );
  };

  const handlePresetSelect = (presetParams: ShadowParams) => {
    setParams(presetParams);
    trackEvent(
      "shadow_preset",
      { preset_applied: true },
      { toolName: BOX_SHADOW_TOOL_NAME }
    );
  };

  const handleReset = () => {
    setParams(DEFAULT_PARAMS);
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className="shrink-0 space-y-4 pb-4">
        <div className="space-y-1.5">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            Box Shadow 生成器
          </h1>
          <p className="text-sm leading-relaxed text-slate-500">
            在线调整阴影参数，实时预览效果，支持 CSS 和 Tailwind 代码导出
          </p>
        </div>
      </header>

      <section className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex min-h-0 flex-col space-y-4">
          <div className="shrink-0 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-slate-700">预设效果</h2>
            <ShadowPresetSelector onSelect={handlePresetSelect} />
          </div>

          <div className="shrink-0 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-slate-700">参数调整</h2>
            <ShadowControls params={params} onChange={handleParamsChange} onReset={handleReset} />
          </div>
        </div>

        <div className="flex min-h-0 flex-col space-y-4">
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="mb-2 flex shrink-0 items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-medium text-slate-700">预览效果</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">背景色</span>
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="h-6 w-12 cursor-pointer rounded border border-slate-200"
                />
              </div>
            </div>
            <div className="min-h-0 flex-1">
              <ShadowPreview params={params} backgroundColor={backgroundColor} />
            </div>
          </div>

          <div className="shrink-0">
            <div className="mb-2 flex shrink-0 items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              <span className="text-xs font-medium text-slate-700">代码输出</span>
            </div>
            <ShadowCodeOutput params={params} />
          </div>
        </div>
      </section>
    </div>
  );
}