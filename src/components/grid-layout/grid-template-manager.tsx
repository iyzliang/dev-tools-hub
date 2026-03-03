"use client";

import { useState } from "react";
import type { GridConfig, MergedArea } from "@/lib/grid-utils";
import {
  getSavedGridLayouts,
  saveGridLayout,
  deleteGridLayout,
  type SavedGridTemplate,
} from "@/lib/grid-storage";
import { cn } from "@/lib/utils";

interface GridTemplateManagerProps {
  currentConfig: GridConfig;
  currentMergedAreas: MergedArea[];
  onLoad: (template: SavedGridTemplate) => void;
  className?: string;
}

export function GridTemplateManager({
  currentConfig,
  currentMergedAreas,
  onLoad,
  className,
}: GridTemplateManagerProps) {
  const [templates, setTemplates] = useState<SavedGridTemplate[]>(() => getSavedGridLayouts());
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleRefresh = () => {
    setTemplates(getSavedGridLayouts());
  };

  const handleSave = () => {
    if (!templateName.trim()) {
      setError("请输入模板名称");
      return;
    }

    try {
      saveGridLayout({
        name: templateName.trim(),
        config: currentConfig,
        mergedAreas: currentMergedAreas,
      });
      setTemplateName("");
      setShowSaveDialog(false);
      setError(null);
      handleRefresh();
    } catch {
      setError("保存失败，请重试");
    }
  };

  const handleLoad = (template: SavedGridTemplate) => {
    onLoad(template);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("确定要删除此模板吗？")) {
      deleteGridLayout(id);
      handleRefresh();
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-slate-600">我的模板</label>
        <button
          onClick={() => setShowSaveDialog(true)}
          className="rounded-md bg-blue-600 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-blue-700"
        >
          保存当前
        </button>
      </div>

      {templates.length === 0 ? (
        <p className="text-xs text-slate-400">暂无保存的模板</p>
      ) : (
        <div className="max-h-48 space-y-2 overflow-y-auto">
          {templates.map((template) => (
            <div
              key={template.id}
              className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-medium text-slate-700">
                  {template.name}
                </div>
                <div className="text-[10px] text-slate-400">
                  {template.config.rows}行 × {template.config.cols}列
                  {template.mergedAreas.length > 0 &&
                    ` · ${template.mergedAreas.length}个合并区域`}
                </div>
              </div>
              <div className="flex shrink-0 gap-1.5">
                <button
                  onClick={() => handleLoad(template)}
                  className="rounded px-2 py-1 text-[10px] font-medium text-blue-600 hover:bg-blue-50"
                >
                  加载
                </button>
                <button
                  onClick={() => handleDelete(template.id)}
                  className="rounded px-2 py-1 text-[10px] font-medium text-red-600 hover:bg-red-50"
                >
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showSaveDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-80 rounded-lg bg-white p-4 shadow-lg">
            <h3 className="mb-3 text-sm font-semibold text-slate-900">保存模板</h3>
            <input
              type="text"
              placeholder="输入模板名称"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="mb-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              autoFocus
            />
            {error && <p className="mb-2 text-xs text-red-600">{error}</p>}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowSaveDialog(false);
                  setTemplateName("");
                  setError(null);
                }}
                className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}