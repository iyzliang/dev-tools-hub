"use client";

import {
  Footprint,
  autoTrack,
  webVitals,
  errorTrack,
} from "@footprint/core";

let instance: Footprint | null = null;

/**
 * 获取全局单例 Footprint 实例，仅在浏览器环境调用。
 * 在 Next 中请仅在客户端组件内调用（如 FootprintProvider 的 useState 初始化）。
 */
export function getFootprintInstance(): Footprint {
  if (typeof window === "undefined") {
    throw new Error("getFootprintInstance must be called on the client");
  }
  if (!instance) {
    const appId =
      process.env.NEXT_PUBLIC_FOOTPRINT_APP_ID ?? "dev-tools-hub";
    const serverUrl =
      process.env.NEXT_PUBLIC_FOOTPRINT_SERVER_URL ?? "/api/collect";

    instance = Footprint.init({
      appId,
      serverUrl,
      debug: process.env.NODE_ENV === "development",
      plugins: [autoTrack(), webVitals(), errorTrack()],
    });
  }
  return instance;
}
