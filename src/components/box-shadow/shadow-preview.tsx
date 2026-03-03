"use client";

import type { ShadowParams } from "@/lib/shadow-utils";
import { generateBoxShadowCSS } from "@/lib/shadow-utils";

interface ShadowPreviewProps {
  params: ShadowParams;
  backgroundColor?: string;
}

export function ShadowPreview({ params, backgroundColor = "#f3f4f6" }: ShadowPreviewProps) {
  const shadowCSS = generateBoxShadowCSS(params);
  const shadowStyle = shadowCSS.replace("box-shadow: ", "").replace(";", "");

  return (
    <div
      className="flex min-h-[300px] items-center justify-center rounded-lg border border-slate-200 p-8"
      style={{ backgroundColor }}
    >
      <div
        className="h-32 w-48 rounded-lg bg-white transition-all duration-200"
        style={{
          boxShadow: shadowStyle,
        }}
      />
    </div>
  );
}