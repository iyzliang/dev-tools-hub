"use client";

import { useState } from "react";
import { FootprintProvider as FpProvider } from "@footprint/react";
import { getFootprintInstance } from "@/tracking/instance";

/**
 * 在应用根部注入 Footprint 实例，仅会在客户端初始化一次。
 * 服务端渲染时仅渲染 children，不挂载 Provider，避免在 Node 中执行 SDK。
 */
export function FootprintProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [instance] = useState<ReturnType<typeof getFootprintInstance> | null>(
    () => (typeof window === "undefined" ? null : getFootprintInstance()),
  );

  if (!instance) {
    return <>{children}</>;
  }

  return <FpProvider instance={instance}>{children}</FpProvider>;
}
