# 颜色转换器设计文档

## 概述

新增颜色转换工具，支持 Hex、RGB、RGBA、HSL、HSLA 格式之间的双向同步转换。

## 需求确认

| 项目 | 决策 |
|------|------|
| 支持格式 | Hex、RGB、RGBA、HSL、HSLA |
| 交互方式 | 双向同步，任何格式可编辑 |
| 颜色选择器 | 需要，支持透明度 |
| 错误处理 | 静默忽略无效输入 |

## 架构设计

### 文件结构

```
src/
├── app/color-converter/page.tsx      # 页面入口
├── components/color/
│   ├── index.ts                       # 导出
│   ├── color-picker.tsx              # 颜色选择器组件
│   ├── color-input.tsx               # 单个颜色格式输入框
│   └── color-results.tsx             # 所有格式结果展示
└── lib/color-utils.ts                # 颜色转换核心逻辑
```

### 中间格式

使用 `{ r, g, b, a }` 作为内部中间格式：

```typescript
interface RGBA {
  r: number;  // 0-255
  g: number;  // 0-255
  b: number;  // 0-255
  a: number;  // 0-1
}
```

### 核心函数

```typescript
// 解析函数（各格式 → RGBA）
parseHex(hex: string): RGBA | null
parseRgb(rgb: string): RGBA | null
parseRgba(rgba: string): RGBA | null
parseHsl(hsl: string): RGBA | null
parseHsla(hsla: string): RGBA | null

// 输出函数（RGBA → 各格式）
toHex(rgba: RGBA): string
toRgb(rgba: RGBA): string
toRgba(rgba: RGBA): string
toHsl(rgba: RGBA): string
toHsla(rgba: RGBA): string

// 辅助函数
hslToRgb(h: number, s: number, l: number): { r, g, b }
rgbToHsl(r: number, g: number, b: number): { h, s, l }
```

### 自动修复规则

| 输入 | 修复后 |
|------|--------|
| `ff0000` | `#ff0000` |
| `#ff0` | `#ffff00`（3位缩写） |
| `rgb(255, 0, 0)` | 标准解析，忽略空格 |

## UI 设计

### 页面布局

采用项目现有的左右分栏布局：

- 左侧：输入配置（颜色选择器 + 颜色预览 + 透明度滑块 + 格式输入框）
- 右侧：转换结果（5种格式的结果卡片，2列 grid 布局）

### 样式规范

复用现有组件和样式：

- 标签：`text-xs font-medium text-slate-600`
- 输入框：`Input` 组件 + `font-mono` + 清除按钮
- 结果卡片：`Card` 组件，grid 2列布局
- 复制按钮：`Button` 组件，`variant="secondary" size="sm"`
- 分栏标题：圆点标识（蓝色/绿色）

### 组件职责

| 组件 | 职责 |
|------|------|
| `color-picker.tsx` | 颜色预览色块 + 原生选择器 + 透明度滑块 |
| `color-input.tsx` | 单个格式输入框，支持清除按钮 |
| `color-results.tsx` | 汇总展示所有格式，支持一键复制 |

## 埋点事件

参考现有工具的埋点模式：

- `tool_open` - 工具打开
- `color_pick` - 使用颜色选择器
- `color_input` - 输入颜色值
- `color_copy` - 复制颜色值

## 配置注册

在 `src/config/tools.ts` 中添加：

```typescript
{
  id: "color-converter",
  name: "颜色转换器",
  description: "Hex、RGB、HSL 等多种颜色格式互转，支持透明度",
  icon: Palette,
  isHot: false,
  href: "/color-converter",
}
```