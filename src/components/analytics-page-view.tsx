"use client";

import { useContext, useEffect } from "react";
import { usePathname } from "next/navigation";
import { FootprintContext } from "@footprint/react";

/**
 * 在应用布局中挂载，于路由变化时更新 Footprint 全局属性（如 routePath），
 * 便于后续上报的 page_view / element_click 等事件携带路由信息。
 * PV 由 @footprint/core 的 autoTrack 自动上报，此处仅补充业务维度。
 * 若未在 FootprintProvider 内（如 SSR 或未就绪），则静默不渲染。
 */
export function AnalyticsPageView() {
  const pathname = usePathname();
  const fp = useContext(FootprintContext);

  useEffect(() => {
    if (!fp) return;

    const path = pathname ?? (typeof window !== "undefined" ? window.location.pathname : "");
    fp.setGlobalProps({
      routePath: path,
    });
  }, [fp, pathname]);

  return null;
}
