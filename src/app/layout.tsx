import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

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
        <SiteHeader />

        <main className="app-main">
          <div className="app-container app-main-inner">{children}</div>
        </main>

        <SiteFooter />
      </body>
    </html>
  );
}
