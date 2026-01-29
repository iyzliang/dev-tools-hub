"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { trackEvent } from "@/lib/analytics";

/**
 * 在应用布局中挂载，于路由变化时上报 page_view 事件。
 * 同时确保 anonymous_id 与 session_id 在首次访问时被初始化（由 trackEvent 内部完成）。
 */
export function AnalyticsPageView() {
  const pathname = usePathname();
  const initialRef = useRef(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const path = pathname ?? window.location.pathname;
    trackEvent("page_view", { path }, {});
    initialRef.current = false;
  }, [pathname]);

  return null;
}
