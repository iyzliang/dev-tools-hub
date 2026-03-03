"use client";

import { SHADOW_CATEGORIES } from "@/lib/shadow-presets";
import type { ShadowParams } from "@/lib/shadow-utils";
import { generateBoxShadowCSS } from "@/lib/shadow-utils";
import { useState } from "react";

interface ShadowPresetSelectorProps {
  onSelect: (params: ShadowParams) => void;
}

export function ShadowPresetSelector({ onSelect }: ShadowPresetSelectorProps) {
  const [activeCategory, setActiveCategory] = useState<keyof typeof SHADOW_CATEGORIES>("material");

  const categories = Object.entries(SHADOW_CATEGORIES) as [keyof typeof SHADOW_CATEGORIES, typeof SHADOW_CATEGORIES.material][];

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {categories.map(([key, category]) => (
          <button
            key={key}
            onClick={() => setActiveCategory(key)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium ${
              activeCategory === key
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {SHADOW_CATEGORIES[activeCategory].presets.map((preset) => {
          const shadowStyle = generateBoxShadowCSS(preset.params)
            .replace("box-shadow: ", "")
            .replace(";", "");

          return (
            <button
              key={preset.nameEn}
              onClick={() => onSelect(preset.params)}
              className="group flex flex-col items-center gap-2 rounded-lg border border-slate-200 bg-white p-3 hover:border-blue-300 hover:bg-blue-50"
            >
              <div
                className="h-12 w-full rounded bg-white transition-all group-hover:scale-105"
                style={{ boxShadow: shadowStyle }}
              />
              <div className="text-center">
                <div className="text-xs font-medium text-slate-700">{preset.name}</div>
                <div className="text-[10px] text-slate-500">{preset.description}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}