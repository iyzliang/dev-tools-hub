"use client";

import { useCallback, useEffect, useState } from "react";
import { ColorPicker, ColorInput, ColorResults } from "@/components/color";
import {
  parseColor,
  toAllFormats,
  defaultRgba,
  type RGBA,
  type ColorFormat,
} from "@/lib/color-utils";
import { trackEvent } from "@/lib/analytics";

const COLOR_CONVERTER_TOOL_NAME = "color-converter";

export default function ColorConverterPage() {
  const [color, setColor] = useState<RGBA>(defaultRgba());
  const [hexInput, setHexInput] = useState("");
  const [rgbInput, setRgbInput] = useState("");
  const [hslInput, setHslInput] = useState("");
  const [formats, setFormats] = useState<Record<ColorFormat, string>>(() =>
    toAllFormats(defaultRgba())
  );

  // Update all formats when color changes
  const updateFormats = useCallback((rgba: RGBA) => {
    setFormats(toAllFormats(rgba));
    setHexInput(toAllFormats(rgba).hex);
    setRgbInput(toAllFormats(rgba).rgb);
    setHslInput(toAllFormats(rgba).hsl);
  }, []);

  // Handle color picker change
  const handleColorChange = useCallback(
    (rgba: RGBA) => {
      setColor(rgba);
      updateFormats(rgba);
    },
    [updateFormats]
  );

  // Handle input change (parse and update if valid)
  const handleInputChange = useCallback(
    (format: ColorFormat, value: string) => {
      if (format === "hex") {
        setHexInput(value);
      } else if (format === "rgb") {
        setRgbInput(value);
      } else if (format === "hsl") {
        setHslInput(value);
      }

      const parsed = parseColor(value);
      if (parsed) {
        setColor(parsed);
        updateFormats(parsed);

        trackEvent(
          "color_input",
          { format, success: true },
          { toolName: COLOR_CONVERTER_TOOL_NAME }
        );
      }
    },
    [updateFormats]
  );

  // Handle copy
  const handleCopy = useCallback((format: ColorFormat, value: string) => {
    trackEvent(
      "color_copy",
      { format, value_length: value.length },
      { toolName: COLOR_CONVERTER_TOOL_NAME }
    );
  }, []);

  // Track tool open
  useEffect(() => {
    trackEvent(
      "tool_open",
      { tool_name: COLOR_CONVERTER_TOOL_NAME },
      { toolName: COLOR_CONVERTER_TOOL_NAME }
    );
  }, []);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className="shrink-0 space-y-4 pb-4">
        <div className="space-y-1.5">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            颜色转换器
          </h1>
          <p className="text-sm leading-relaxed text-slate-500">
            支持 Hex、RGB、RGBA、HSL、HSLA 等多种颜色格式互转，支持透明度
          </p>
        </div>
      </header>

      <section className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Left: Input */}
        <div className="flex min-h-0 flex-col">
          <div className="mb-2 flex shrink-0 items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            <span className="text-xs font-medium text-slate-700">输入配置</span>
          </div>
          <div className="min-h-0 flex-1 rounded-lg border border-slate-200 bg-slate-50/50 p-4">
            <div className="flex h-full flex-col gap-4 overflow-y-auto">
              {/* Color Picker */}
              <ColorPicker value={color} onChange={handleColorChange} />

              {/* Format Inputs */}
              <div className="space-y-3">
                <ColorInput
                  format="hex"
                  value={hexInput}
                  onChange={(v) => handleInputChange("hex", v)}
                  placeholder="#000000"
                />
                <ColorInput
                  format="rgb"
                  value={rgbInput}
                  onChange={(v) => handleInputChange("rgb", v)}
                  placeholder="rgb(0, 0, 0)"
                />
                <ColorInput
                  format="hsl"
                  value={hslInput}
                  onChange={(v) => handleInputChange("hsl", v)}
                  placeholder="hsl(0, 0%, 0%)"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Results */}
        <div className="flex min-h-0 flex-col">
          <div className="mb-2 flex shrink-0 items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-medium text-slate-700">转换结果</span>
          </div>
          <div className="min-h-0 flex-1 rounded-lg border border-slate-200 bg-white p-4">
            <ColorResults
              color={color}
              formats={formats}
              onCopy={handleCopy}
            />
          </div>
        </div>
      </section>
    </div>
  );
}