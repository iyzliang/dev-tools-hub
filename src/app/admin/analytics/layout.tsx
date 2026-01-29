import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "管理统计 - Dev Tools Hub",
  description: "仅供站点维护者使用的访问统计页面。",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminAnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
