import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dev Tools Hub - 在线开发者工具集",
  description:
    "Dev Tools Hub 是面向开发者的轻量在线工具集，提供 JSON 格式化与校验等常用开发辅助工具。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${geistSans.variable} ${geistMono.variable} app-shell`}>
        <header className="app-header">
          <div className="app-container h-14 sm:h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-slate-900 text-xs font-semibold text-white">
                D
              </span>
              <div className="flex flex-col">
                <span className="text-sm font-semibold tracking-tight text-slate-900">
                  Dev Tools Hub
                </span>
                <span className="hidden text-xs text-slate-500 sm:inline">
                  面向开发者的轻量工具集
                </span>
              </div>
            </div>
            {/* 搜索区域占位，后续功能点中完善 */}
            <div className="hidden w-64 max-w-xs items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-400 shadow-sm sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
              <span>搜索工具名称或描述…</span>
            </div>
          </div>
        </header>

        <main className="app-main">
          <div className="app-container app-main-inner">{children}</div>
        </main>

        <footer className="app-footer">
          <div className="app-container py-4 text-center text-xs text-slate-500 sm:flex sm:items-center sm:justify-between sm:text-left">
            <span>© {new Date().getFullYear()} Dev Tools Hub.</span>
            <span className="mt-1 block sm:mt-0">
              在线开发者工具集 · JSON 工具优先上线
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}
