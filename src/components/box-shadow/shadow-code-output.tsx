"use client";

import type { ShadowParams } from "@/lib/shadow-utils";
import { generateBoxShadowCSS, generateTailwindShadow } from "@/lib/shadow-utils";
import { useState } from "react";

interface ShadowCodeOutputProps {
  params: ShadowParams;
  onCopy?: (format: "css" | "tailwind") => void;
}

export function ShadowCodeOutput({ params, onCopy }: ShadowCodeOutputProps) {
  const [format, setFormat] = useState<"css" | "tailwind">("css");
  const [copied, setCopied] = useState(false);

  const cssCode = generateBoxShadowCSS(params);
  const tailwindCode = generateTailwindShadow(params);

  const currentCode = format === "css" ? cssCode : tailwindCode;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onCopy?.(format);
    } catch {
      console.error("复制失败");
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFormat("css")}
          className={`rounded-md px-3 py-1.5 text-xs font-medium ${
            format === "css"
              ? "bg-blue-600 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          CSS
        </button>
        <button
          onClick={() => setFormat("tailwind")}
          className={`rounded-md px-3 py-1.5 text-xs font-medium ${
            format === "tailwind"
              ? "bg-blue-600 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Tailwind
        </button>
        <div className="flex-1" />
        <button
          onClick={handleCopy}
          className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
        >
          {copied ? "已复制" : "复制"}
        </button>
      </div>
      <pre className="overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
        <code>{currentCode}</code>
      </pre>
    </div>
  );
}