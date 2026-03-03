"use client";

import { useState, useCallback, useRef } from "react";
import type { GridConfig, MergedArea } from "@/lib/grid-utils";

interface Cell {
  row: number;
  col: number;
  isMerged: boolean;
  areaName?: string;
  rowSpan?: number;
  colSpan?: number;
}

interface GridCanvasProps {
  config: GridConfig;
  mergedAreas: MergedArea[];
  onMerge: (startRow: number, startCol: number, endRow: number, endCol: number) => void;
  onAreaNameChange: (index: number, name: string) => void;
  onCellClick?: (row: number, col: number) => void;
}

export function GridCanvas({
  config,
  mergedAreas,
  onMerge,
  onAreaNameChange,
  onCellClick,
}: GridCanvasProps) {
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<{ row: number; col: number } | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<{ row: number; col: number } | null>(null);
  const [editingArea, setEditingArea] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const cellWidth = 80;
  const cellHeight = 60;
  const padding = 20;

  const getCells = useCallback((): Cell[][] => {
    const cells: Cell[][] = [];

    for (let i = 0; i < config.rows; i++) {
      const row: Cell[] = [];
      for (let j = 0; j < config.cols; j++) {
        let isMerged = false;
        let areaName: string | undefined;
        let rowSpan = 1;
        let colSpan = 1;

        for (const area of mergedAreas) {
          if (
            i >= area.startRow &&
            i <= area.endRow &&
            j >= area.startCol &&
            j <= area.endCol
          ) {
            isMerged = true;
            areaName = area.name;
            if (i === area.startRow && j === area.startCol) {
              rowSpan = area.endRow - area.startRow + 1;
              colSpan = area.endCol - area.startCol + 1;
            }
            break;
          }
        }

        row.push({ row: i, col: j, isMerged, areaName, rowSpan, colSpan });
      }
      cells.push(row);
    }

    return cells;
  }, [config.rows, config.cols, mergedAreas]);

  const handleMouseDown = (row: number, col: number) => {
    setIsSelecting(true);
    setSelectionStart({ row, col });
    setSelectionEnd({ row, col });
  };

  const handleMouseEnter = (row: number, col: number) => {
    if (isSelecting && selectionStart) {
      setSelectionEnd({ row, col });
    }
  };

  const handleMouseUp = () => {
    if (isSelecting && selectionStart && selectionEnd) {
      const startRow = Math.min(selectionStart.row, selectionEnd.row);
      const endRow = Math.max(selectionStart.row, selectionEnd.row);
      const startCol = Math.min(selectionStart.col, selectionEnd.col);
      const endCol = Math.max(selectionStart.col, selectionEnd.col);

      if (startRow !== endRow || startCol !== endCol) {
        onMerge(startRow, startCol, endRow, endCol);
      }
    }
    setIsSelecting(false);
    setSelectionStart(null);
    setSelectionEnd(null);
  };

  const handleCellDoubleClick = (row: number, col: number) => {
    const areaIndex = mergedAreas.findIndex(
      (area) =>
        row >= area.startRow &&
        row <= area.endRow &&
        col >= area.startCol &&
        col <= area.endCol
    );

    if (areaIndex !== -1) {
      setEditingArea(areaIndex);
    }
  };

  const handleAreaNameSubmit = (index: number, name: string) => {
    onAreaNameChange(index, name);
    setEditingArea(null);
  };

  const isInSelection = (row: number, col: number): boolean => {
    if (!isSelecting || !selectionStart || !selectionEnd) return false;

    const minRow = Math.min(selectionStart.row, selectionEnd.row);
    const maxRow = Math.max(selectionStart.row, selectionEnd.row);
    const minCol = Math.min(selectionStart.col, selectionEnd.col);
    const maxCol = Math.max(selectionStart.col, selectionEnd.col);

    return row >= minRow && row <= maxRow && col >= minCol && col <= maxCol;
  };

  const cells = getCells();
  const svgWidth = config.cols * cellWidth + padding * 2;
  const svgHeight = config.rows * cellHeight + padding * 2;

  return (
    <div className="overflow-auto rounded-lg border border-slate-200 bg-white p-4">
      <svg
        ref={svgRef}
        width={svgWidth}
        height={svgHeight}
        className="mx-auto"
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <defs>
          <pattern
            id="grid"
            width={cellWidth}
            height={cellHeight}
            patternUnits="userSpaceOnUse"
            x={padding}
            y={padding}
          >
            <path
              d={`M ${cellWidth} 0 L 0 0 0 ${cellHeight}`}
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="1"
            />
          </pattern>
        </defs>

        <rect
          x={padding}
          y={padding}
          width={config.cols * cellWidth}
          height={config.rows * cellHeight}
          fill="url(#grid)"
          stroke="#cbd5e1"
          strokeWidth="2"
        />

        {cells.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            if (cell.isMerged && !(cell.rowSpan && cell.colSpan)) {
              return null;
            }

            const isSelected = isInSelection(rowIndex, colIndex);
            const areaIndex = mergedAreas.findIndex(
              (area) =>
                rowIndex >= area.startRow &&
                rowIndex <= area.endRow &&
                colIndex >= area.startCol &&
                colIndex <= area.endCol
            );

            const x = padding + colIndex * cellWidth;
            const y = padding + rowIndex * cellHeight;
            const width = (cell.colSpan || 1) * cellWidth;
            const height = (cell.rowSpan || 1) * cellHeight;

            return (
              <g key={`${rowIndex}-${colIndex}`}>
                <rect
                  x={x + 2}
                  y={y + 2}
                  width={width - 4}
                  height={height - 4}
                  fill={cell.isMerged ? "#dbeafe" : isSelected ? "#fef3c7" : "white"}
                  stroke={cell.isMerged ? "#3b82f6" : isSelected ? "#f59e0b" : "#cbd5e1"}
                  strokeWidth={cell.isMerged ? 2 : 1}
                  rx={4}
                  className="cursor-pointer transition-colors hover:fill-slate-50"
                  onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                  onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                  onClick={() => onCellClick?.(rowIndex, colIndex)}
                  onDoubleClick={() => handleCellDoubleClick(rowIndex, colIndex)}
                />
                {cell.areaName && editingArea === areaIndex ? (
                  <foreignObject x={x} y={y} width={width} height={height}>
                    <input
                      type="text"
                      defaultValue={cell.areaName}
                      autoFocus
                      className="h-full w-full border-none bg-transparent text-center text-xs outline-none"
                      onBlur={(e) => handleAreaNameSubmit(areaIndex, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleAreaNameSubmit(areaIndex, e.currentTarget.value);
                        } else if (e.key === "Escape") {
                          setEditingArea(null);
                        }
                      }}
                    />
                  </foreignObject>
                ) : (
                  cell.areaName && (
                    <text
                      x={x + width / 2}
                      y={y + height / 2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="pointer-events-none select-none text-xs font-medium text-slate-700"
                    >
                      {cell.areaName}
                    </text>
                  )
                )}
                {!cell.isMerged && !cell.areaName && (
                  <text
                    x={x + width / 2}
                    y={y + height / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="pointer-events-none select-none text-[10px] text-slate-400"
                  >
                    {rowIndex + 1},{colIndex + 1}
                  </text>
                )}
              </g>
            );
          })
        )}

        {config.rowGap > 0 && (
          <text
            x={padding - 10}
            y={padding + config.rows * cellHeight / 2}
            textAnchor="middle"
            transform={`rotate(-90 ${padding - 10} ${padding + config.rows * cellHeight / 2})`}
            className="text-[10px] fill-slate-400"
          >
            Gap: {config.rowGap}px
          </text>
        )}

        {config.colGap > 0 && (
          <text
            x={padding + config.cols * cellWidth / 2}
            y={svgHeight - 5}
            textAnchor="middle"
            className="text-[10px] fill-slate-400"
          >
            Gap: {config.colGap}px
          </text>
        )}
      </svg>

      <div className="mt-3 flex items-center justify-center gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded border-2 border-blue-500 bg-blue-100" />
          <span>已合并</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded border border-amber-400 bg-amber-100" />
          <span>选中</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded border border-slate-300 bg-white" />
          <span>空白</span>
        </div>
      </div>
    </div>
  );
}