import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Grid 布局生成器 - Dev Tools Hub",
  description: "可视化拖拽创建 CSS Grid 布局，支持单元格合并、区域命名，一键生成 CSS 和 Tailwind 代码",
  keywords: ["Grid布局", "CSS Grid", "布局生成器", "Tailwind CSS", "前端工具", "网格布局"],
};

export default function GridLayoutRoot({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}