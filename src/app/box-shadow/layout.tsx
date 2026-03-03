import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Box Shadow 生成器 - Dev Tools Hub",
  description: "在线调整阴影参数，实时预览效果，支持 Material Design、Neumorphism 预设，一键生成 CSS 代码",
  keywords: ["Box Shadow", "CSS阴影", "阴影生成器", "Material Design", "Neumorphism", "前端工具"],
};

export default function BoxShadowRoot({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}