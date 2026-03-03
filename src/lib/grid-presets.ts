import type { GridConfig, MergedArea } from "./grid-utils";

export interface GridPreset {
  name: string;
  nameEn: string;
  description: string;
  config: GridConfig;
  mergedAreas: MergedArea[];
}

export const HOLY_GRAIL_PRESET: GridPreset = {
  name: "圣杯布局",
  nameEn: "Holy Grail Layout",
  description: "经典的三栏布局，包含头部、底部、主内容区和两侧边栏",
  config: {
    rows: 3,
    cols: 3,
    rowGap: 0,
    colGap: 0,
    rowSizes: ["auto", "1fr", "auto"],
    colSizes: ["200px", "1fr", "200px"],
  },
  mergedAreas: [
    { startRow: 0, startCol: 0, endRow: 0, endCol: 2, name: "header" },
    { startRow: 1, startCol: 0, endRow: 1, endCol: 0, name: "nav" },
    { startRow: 1, startCol: 1, endRow: 1, endCol: 1, name: "main" },
    { startRow: 1, startCol: 2, endRow: 1, endCol: 2, name: "aside" },
    { startRow: 2, startCol: 0, endRow: 2, endCol: 2, name: "footer" },
  ],
};

export const TWO_COLUMN_PRESET: GridPreset = {
  name: "双栏布局",
  nameEn: "Two Column Layout",
  description: "经典的双栏布局，左侧导航右侧内容",
  config: {
    rows: 1,
    cols: 2,
    rowGap: 0,
    colGap: 16,
    rowSizes: ["auto"],
    colSizes: ["250px", "1fr"],
  },
  mergedAreas: [
    { startRow: 0, startCol: 0, endRow: 0, endCol: 0, name: "sidebar" },
    { startRow: 0, startCol: 1, endRow: 0, endCol: 1, name: "content" },
  ],
};

export const THREE_COLUMN_PRESET: GridPreset = {
  name: "三栏布局",
  nameEn: "Three Column Layout",
  description: "三栏等宽布局，适用于卡片或产品展示",
  config: {
    rows: 1,
    cols: 3,
    rowGap: 0,
    colGap: 16,
    rowSizes: ["auto"],
    colSizes: ["1fr", "1fr", "1fr"],
  },
  mergedAreas: [
    { startRow: 0, startCol: 0, endRow: 0, endCol: 0, name: "column1" },
    { startRow: 0, startCol: 1, endRow: 0, endCol: 1, name: "column2" },
    { startRow: 0, startCol: 2, endRow: 0, endCol: 2, name: "column3" },
  ],
};

export const DASHBOARD_PRESET: GridPreset = {
  name: "仪表板布局",
  nameEn: "Dashboard Layout",
  description: "典型的管理后台仪表板布局",
  config: {
    rows: 4,
    cols: 4,
    rowGap: 16,
    colGap: 16,
    rowSizes: ["auto", "auto", "1fr", "auto"],
    colSizes: ["1fr", "1fr", "1fr", "1fr"],
  },
  mergedAreas: [
    { startRow: 0, startCol: 0, endRow: 0, endCol: 3, name: "header" },
    { startRow: 1, startCol: 0, endRow: 1, endCol: 3, name: "stats" },
    { startRow: 2, startCol: 0, endRow: 2, endCol: 2, name: "chart" },
    { startRow: 2, startCol: 3, endRow: 2, endCol: 3, name: "sidebar" },
    { startRow: 3, startCol: 0, endRow: 3, endCol: 3, name: "footer" },
  ],
};

export const CARD_GRID_PRESET: GridPreset = {
  name: "卡片网格",
  nameEn: "Card Grid",
  description: "响应式卡片网格布局",
  config: {
    rows: 2,
    cols: 3,
    rowGap: 16,
    colGap: 16,
    rowSizes: ["auto", "auto"],
    colSizes: ["1fr", "1fr", "1fr"],
  },
  mergedAreas: [],
};

export const HEADER_SIDEBAR_CONTENT_PRESET: GridPreset = {
  name: "头部侧边栏内容",
  nameEn: "Header Sidebar Content",
  description: "带头部和侧边栏的布局",
  config: {
    rows: 2,
    cols: 2,
    rowGap: 0,
    colGap: 0,
    rowSizes: ["auto", "1fr"],
    colSizes: ["200px", "1fr"],
  },
  mergedAreas: [
    { startRow: 0, startCol: 0, endRow: 0, endCol: 1, name: "header" },
    { startRow: 1, startCol: 0, endRow: 1, endCol: 0, name: "sidebar" },
    { startRow: 1, startCol: 1, endRow: 1, endCol: 1, name: "content" },
  ],
};

export const MAGAZINE_PRESET: GridPreset = {
  name: "杂志布局",
  nameEn: "Magazine Layout",
  description: "杂志风格的多区域布局",
  config: {
    rows: 3,
    cols: 4,
    rowGap: 16,
    colGap: 16,
    rowSizes: ["auto", "auto", "auto"],
    colSizes: ["1fr", "1fr", "1fr", "1fr"],
  },
  mergedAreas: [
    { startRow: 0, startCol: 0, endRow: 0, endCol: 3, name: "featured" },
    { startRow: 1, startCol: 0, endRow: 1, endCol: 1, name: "article1" },
    { startRow: 1, startCol: 1, endRow: 1, endCol: 2, name: "article2" },
    { startRow: 1, startCol: 2, endRow: 2, endCol: 3, name: "sidebar" },
    { startRow: 2, startCol: 0, endRow: 2, endCol: 1, name: "article3" },
    { startRow: 2, startCol: 1, endRow: 2, endCol: 2, name: "article4" },
  ],
};

export const SIMPLE_CENTERED_PRESET: GridPreset = {
  name: "简单居中",
  nameEn: "Simple Centered",
  description: "简单的居中内容布局",
  config: {
    rows: 3,
    cols: 3,
    rowGap: 16,
    colGap: 16,
    rowSizes: ["1fr", "auto", "1fr"],
    colSizes: ["1fr", "auto", "1fr"],
  },
  mergedAreas: [
    { startRow: 1, startCol: 1, endRow: 1, endCol: 1, name: "content" },
  ],
};

export const FOUR_QUADRANT_PRESET: GridPreset = {
  name: "四象限布局",
  nameEn: "Four Quadrant",
  description: "四象限平均分布局",
  config: {
    rows: 2,
    cols: 2,
    rowGap: 16,
    colGap: 16,
    rowSizes: ["1fr", "1fr"],
    colSizes: ["1fr", "1fr"],
  },
  mergedAreas: [
    { startRow: 0, startCol: 0, endRow: 0, endCol: 0, name: "q1" },
    { startRow: 0, startCol: 1, endRow: 0, endCol: 1, name: "q2" },
    { startRow: 1, startCol: 0, endRow: 1, endCol: 0, name: "q3" },
    { startRow: 1, startCol: 1, endRow: 1, endCol: 1, name: "q4" },
  ],
};

export const BLOG_LAYOUT_PRESET: GridPreset = {
  name: "博客布局",
  nameEn: "Blog Layout",
  description: "经典的博客文章布局",
  config: {
    rows: 3,
    cols: 3,
    rowGap: 16,
    colGap: 16,
    rowSizes: ["auto", "auto", "auto"],
    colSizes: ["1fr", "2fr", "1fr"],
  },
  mergedAreas: [
    { startRow: 0, startCol: 0, endRow: 0, endCol: 2, name: "header" },
    { startRow: 1, startCol: 1, endRow: 1, endCol: 1, name: "article" },
    { startRow: 2, startCol: 0, endRow: 2, endCol: 2, name: "footer" },
  ],
};

export const ALL_GRID_PRESETS: GridPreset[] = [
  HOLY_GRAIL_PRESET,
  TWO_COLUMN_PRESET,
  THREE_COLUMN_PRESET,
  DASHBOARD_PRESET,
  CARD_GRID_PRESET,
  HEADER_SIDEBAR_CONTENT_PRESET,
  MAGAZINE_PRESET,
  SIMPLE_CENTERED_PRESET,
  FOUR_QUADRANT_PRESET,
  BLOG_LAYOUT_PRESET,
];

export function getGridPresetByName(name: string): GridPreset | undefined {
  return ALL_GRID_PRESETS.find((preset) => preset.name === name || preset.nameEn === name);
}

export function validateGridPreset(preset: GridPreset): boolean {
  if (!preset.name || !preset.config) {
    return false;
  }

  if (preset.config.rows < 1 || preset.config.rows > 12) {
    return false;
  }

  if (preset.config.cols < 1 || preset.config.cols > 12) {
    return false;
  }

  for (const area of preset.mergedAreas) {
    if (
      area.startRow < 0 ||
      area.startRow >= preset.config.rows ||
      area.endRow < 0 ||
      area.endRow >= preset.config.rows ||
      area.startCol < 0 ||
      area.startCol >= preset.config.cols ||
      area.endCol < 0 ||
      area.endCol >= preset.config.cols
    ) {
      return false;
    }

    if (area.startRow > area.endRow || area.startCol > area.endCol) {
      return false;
    }
  }

  return true;
}