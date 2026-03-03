"use client";

import { useState, useEffect } from "react";
import { GridCanvas } from "@/components/grid-layout/grid-canvas";
import { GridControls } from "@/components/grid-layout/grid-controls";
import { GridCodePreview } from "@/components/grid-layout/grid-code-preview";
import { trackEvent } from "@/lib/analytics";
import type { GridConfig, MergedArea } from "@/lib/grid-utils";
import type { GridPreset } from "@/lib/grid-presets";

const GRID_LAYOUT_TOOL_NAME = "grid-layout";

const DEFAULT_CONFIG: GridConfig = {
  rows: 3,
  cols: 3,
  rowGap: 16,
  colGap: 16,
};

export default function GridLayoutPage() {
  const [config, setConfig] = useState<GridConfig>(DEFAULT_CONFIG);
  const [mergedAreas, setMergedAreas] = useState<MergedArea[]>([]);

  useEffect(() => {
    trackEvent(
      "tool_open",
      { tool_name: GRID_LAYOUT_TOOL_NAME },
      { toolName: GRID_LAYOUT_TOOL_NAME }
    );
  }, []);

  const handleConfigChange = (newConfig: GridConfig) => {
    setConfig(newConfig);
    
    const filteredAreas = mergedAreas.filter(
      (area) =>
        area.startRow < newConfig.rows &&
        area.endRow < newConfig.rows &&
        area.startCol < newConfig.cols &&
        area.endCol < newConfig.cols
    );
    setMergedAreas(filteredAreas);

    trackEvent(
      "grid_create",
      { rows: newConfig.rows, cols: newConfig.cols, has_merge: filteredAreas.length > 0 },
      { toolName: GRID_LAYOUT_TOOL_NAME }
    );
  };

  const handleMerge = (startRow: number, startCol: number, endRow: number, endCol: number) => {
    const hasOverlap = mergedAreas.some((area) => {
      return !(
        endRow < area.startRow ||
        startRow > area.endRow ||
        endCol < area.startCol ||
        startCol > area.endCol
      );
    });

    if (hasOverlap) {
      return;
    }

    const newArea: MergedArea = {
      startRow,
      startCol,
      endRow,
      endCol,
      name: `area-${mergedAreas.length + 1}`,
    };

    setMergedAreas([...mergedAreas, newArea]);

    trackEvent(
      "grid_merge",
      { cells_count: (endRow - startRow + 1) * (endCol - startCol + 1) },
      { toolName: GRID_LAYOUT_TOOL_NAME }
    );
  };

  const handleAreaNameChange = (index: number, name: string) => {
    const updatedAreas = [...mergedAreas];
    updatedAreas[index] = { ...updatedAreas[index], name };
    setMergedAreas(updatedAreas);
  };

  const handleReset = () => {
    setConfig(DEFAULT_CONFIG);
    setMergedAreas([]);
  };

  const handleCodeCopy = (format: "css" | "tailwind") => {
    trackEvent(
      "code_copy",
      { format },
      { toolName: GRID_LAYOUT_TOOL_NAME }
    );
  };

  const handlePresetSelect = (preset: GridPreset) => {
    setConfig(preset.config);
    setMergedAreas(preset.mergedAreas);
    trackEvent(
      "preset_apply",
      { preset_name: preset.name },
      { toolName: GRID_LAYOUT_TOOL_NAME }
    );
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className="shrink-0 space-y-4 pb-4">
        <div className="space-y-1.5">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            Grid 布局生成器
          </h1>
          <p className="text-sm leading-relaxed text-slate-500">
            可视化拖拽创建 CSS Grid 布局，生成 CSS 和 Tailwind 代码
          </p>
        </div>
      </header>

      <section className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="shrink-0 lg:col-span-1">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-slate-700">配置参数</h2>
            <GridControls config={config} onChange={handleConfigChange} onReset={handleReset} onPresetSelect={handlePresetSelect} />
          </div>
        </div>

        <div className="flex min-h-0 flex-col lg:col-span-2">
          <div className="mb-2 flex shrink-0 items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            <span className="text-xs font-medium text-slate-700">网格画布</span>
          </div>
          <div className="min-h-0 flex-1">
            <GridCanvas
              config={config}
              mergedAreas={mergedAreas}
              onMerge={handleMerge}
              onAreaNameChange={handleAreaNameChange}
            />
          </div>
        </div>
      </section>

      <section className="shrink-0 pt-4">
        <div className="mb-2 flex shrink-0 items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-xs font-medium text-slate-700">代码输出</span>
        </div>
        <GridCodePreview config={config} mergedAreas={mergedAreas} onCopy={handleCodeCopy} />
      </section>
    </div>
  );
}