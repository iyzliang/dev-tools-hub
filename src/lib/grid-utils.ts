export interface GridConfig {
  rows: number;
  cols: number;
  rowGap: number;
  colGap: number;
  rowSizes?: string[];
  colSizes?: string[];
}

export interface Cell {
  row: number;
  col: number;
  rowSpan?: number;
  colSpan?: number;
  areaName?: string;
}

export interface MergedArea {
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
  name?: string;
}

export interface GridAlignment {
  justifyItems?: "start" | "end" | "center" | "stretch";
  alignItems?: "start" | "end" | "center" | "stretch";
  justifyContent?: "start" | "end" | "center" | "stretch" | "space-around" | "space-between" | "space-evenly";
  alignContent?: "start" | "end" | "center" | "stretch" | "space-around" | "space-between" | "space-evenly";
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateGridConfig(config: GridConfig): ValidationResult {
  const errors: string[] = [];

  if (config.rows < 1 || config.rows > 12) {
    errors.push("行数必须在 1-12 之间");
  }

  if (config.cols < 1 || config.cols > 12) {
    errors.push("列数必须在 1-12 之间");
  }

  if (config.rowGap < 0 || config.rowGap > 100) {
    errors.push("行间距必须在 0-100px 之间");
  }

  if (config.colGap < 0 || config.colGap > 100) {
    errors.push("列间距必须在 0-100px 之间");
  }

  if (config.rowSizes && config.rowSizes.length !== config.rows) {
    errors.push("行尺寸数组长度必须与行数匹配");
  }

  if (config.colSizes && config.colSizes.length !== config.cols) {
    errors.push("列尺寸数组长度必须与列数匹配");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function mergeCells(
  cells: Cell[],
  startRow: number,
  startCol: number,
  endRow: number,
  endCol: number,
  name?: string
): { cells: Cell[]; mergedArea: MergedArea } {
  const mergedArea: MergedArea = {
    startRow,
    startCol,
    endRow,
    endCol,
    name,
  };

  const newCells = cells.filter((cell) => {
    const inMergeRange =
      cell.row >= startRow &&
      cell.row <= endRow &&
      cell.col >= startCol &&
      cell.col <= endCol;
    return !inMergeRange;
  });

  newCells.push({
    row: startRow,
    col: startCol,
    rowSpan: endRow - startRow + 1,
    colSpan: endCol - startCol + 1,
    areaName: name,
  });

  return { cells: newCells, mergedArea };
}

export function generateGridTemplateAreas(
  rows: number,
  cols: number,
  mergedAreas: MergedArea[]
): string[][] {
  const grid: string[][] = [];

  for (let i = 0; i < rows; i++) {
    const row: string[] = [];
    for (let j = 0; j < cols; j++) {
      row.push(".");
    }
    grid.push(row);
  }

  mergedAreas.forEach((area, index) => {
    const areaName = area.name || `area-${index + 1}`;
    for (let i = area.startRow; i <= area.endRow; i++) {
      for (let j = area.startCol; j <= area.endCol; j++) {
        if (i < rows && j < cols) {
          grid[i][j] = areaName;
        }
      }
    }
  });

  return grid;
}

export function generateGridCSS(
  config: GridConfig,
  mergedAreas: MergedArea[],
  alignment?: GridAlignment
): string {
  const lines: string[] = [];

  lines.push(".grid-container {");
  lines.push("  display: grid;");

  const colSizes = config.colSizes || Array(config.cols).fill("1fr");
  const rowSizes = config.rowSizes || Array(config.rows).fill("auto");

  lines.push(`  grid-template-columns: ${colSizes.join(" ")};`);
  lines.push(`  grid-template-rows: ${rowSizes.join(" ")};`);

  if (config.rowGap > 0 || config.colGap > 0) {
    lines.push(`  gap: ${config.rowGap}px ${config.colGap}px;`);
  }

  if (mergedAreas.length > 0) {
    const areas = generateGridTemplateAreas(config.rows, config.cols, mergedAreas);
    lines.push("  grid-template-areas:");
    areas.forEach((row) => {
      lines.push(`    "${row.join(" ")}"`);
    });
  }

  if (alignment) {
    if (alignment.justifyItems) {
      lines.push(`  justify-items: ${alignment.justifyItems};`);
    }
    if (alignment.alignItems) {
      lines.push(`  align-items: ${alignment.alignItems};`);
    }
    if (alignment.justifyContent) {
      lines.push(`  justify-content: ${alignment.justifyContent};`);
    }
    if (alignment.alignContent) {
      lines.push(`  align-content: ${alignment.alignContent};`);
    }
  }

  lines.push("}");

  return lines.join("\n");
}

export function generateGridTailwind(
  config: GridConfig,
  mergedAreas: MergedArea[],
  alignment?: GridAlignment
): string {
  const classes: string[] = [];

  classes.push("grid");
  classes.push(`grid-cols-${config.cols}`);
  classes.push(`grid-rows-${config.rows}`);

  if (config.rowGap > 0 || config.colGap > 0) {
    if (config.rowGap === config.colGap) {
      classes.push(`gap-${config.rowGap}`);
    } else {
      if (config.rowGap > 0) classes.push(`gap-y-${config.rowGap}`);
      if (config.colGap > 0) classes.push(`gap-x-${config.colGap}`);
    }
  }

  if (alignment) {
    if (alignment.justifyItems) {
      const justifyMap: Record<string, string> = {
        start: "justify-items-start",
        end: "justify-items-end",
        center: "justify-items-center",
        stretch: "justify-items-stretch",
      };
      classes.push(justifyMap[alignment.justifyItems]);
    }
    if (alignment.alignItems) {
      const alignMap: Record<string, string> = {
        start: "items-start",
        end: "items-end",
        center: "items-center",
        stretch: "items-stretch",
      };
      classes.push(alignMap[alignment.alignItems]);
    }
    if (alignment.justifyContent) {
      const justifyMap: Record<string, string> = {
        start: "justify-start",
        end: "justify-end",
        center: "justify-center",
        stretch: "justify-stretch",
        "space-around": "justify-around",
        "space-between": "justify-between",
        "space-evenly": "justify-evenly",
      };
      classes.push(justifyMap[alignment.justifyContent]);
    }
    if (alignment.alignContent) {
      const alignMap: Record<string, string> = {
        start: "content-start",
        end: "content-end",
        center: "content-center",
        stretch: "content-stretch",
        "space-around": "content-around",
        "space-between": "content-between",
        "space-evenly": "content-evenly",
      };
      classes.push(alignMap[alignment.alignContent]);
    }
  }

  const children: string[] = [];

  if (mergedAreas.length > 0) {
    mergedAreas.forEach((area, index) => {
      const areaName = area.name || `Area ${index + 1}`;
      const childClasses: string[] = [];

      const rowSpan = area.endRow - area.startRow + 1;
      const colSpan = area.endCol - area.startCol + 1;

      if (colSpan > 1) childClasses.push(`col-span-${colSpan}`);
      if (rowSpan > 1) childClasses.push(`row-span-${rowSpan}`);
      if (area.startCol > 0) childClasses.push(`col-start-${area.startCol + 1}`);
      if (area.startRow > 0) childClasses.push(`row-start-${area.startRow + 1}`);

      children.push(`  <div class="${childClasses.join(" ")}">${areaName}</div>`);
    });
  } else {
    for (let i = 0; i < config.rows * config.cols; i++) {
      children.push(`  <div class="">Item ${i + 1}</div>`);
    }
  }

  return `<div class="${classes.join(" ")}">\n${children.join("\n")}\n</div>`;
}

export function parseGridTemplateAreas(areasString: string): string[][] {
  const lines = areasString.trim().split("\n");
  return lines.map((line) => {
    const match = line.match(/"([^"]+)"/);
    if (match && match[1]) {
      return match[1].trim().split(/\s+/);
    }
    return [];
  }).filter((row) => row.length > 0);
}

export function validateMergedAreas(
  mergedAreas: MergedArea[],
  rows: number,
  cols: number
): ValidationResult {
  const errors: string[] = [];
  const grid: boolean[][] = [];

  for (let i = 0; i < rows; i++) {
    grid.push(new Array(cols).fill(false));
  }

  mergedAreas.forEach((area, index) => {
    if (area.startRow < 0 || area.startRow >= rows) {
      errors.push(`区域 ${index + 1} 的起始行超出范围`);
    }
    if (area.endRow < 0 || area.endRow >= rows) {
      errors.push(`区域 ${index + 1} 的结束行超出范围`);
    }
    if (area.startCol < 0 || area.startCol >= cols) {
      errors.push(`区域 ${index + 1} 的起始列超出范围`);
    }
    if (area.endCol < 0 || area.endCol >= cols) {
      errors.push(`区域 ${index + 1} 的结束列超出范围`);
    }

    if (area.startRow > area.endRow) {
      errors.push(`区域 ${index + 1} 的起始行不能大于结束行`);
    }
    if (area.startCol > area.endCol) {
      errors.push(`区域 ${index + 1} 的起始列不能大于结束列`);
    }

    for (let i = area.startRow; i <= area.endRow && i < rows; i++) {
      for (let j = area.startCol; j <= area.endCol && j < cols; j++) {
        if (grid[i] && grid[i][j]) {
          errors.push(`区域 ${index + 1} 与其他区域重叠`);
          return;
        }
        if (grid[i]) {
          grid[i][j] = true;
        }
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}