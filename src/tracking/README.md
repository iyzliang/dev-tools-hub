# 埋点接入说明（Footprint）

本目录与根布局中的 `FootprintProvider`、`/api/collect` 共同构成基于 **@footprint/core** 与 **@footprint/react** 的埋点方案。

## 配置

- **NEXT_PUBLIC_FOOTPRINT_APP_ID**（可选）：项目标识，默认 `dev-tools-hub`。
- **NEXT_PUBLIC_FOOTPRINT_SERVER_URL**（可选）：采集接口，默认 `/api/collect`。

## 使用方式

- **自动采集**：已在 `instance.ts` 中启用 `autoTrack`（PV、点击、页面停留）、`webVitals`、`errorTrack`，无需额外代码。
- **业务埋点**：在任意被 `FootprintProvider` 包裹的组件内使用 `useTrack()` 或 `useFootprint()`，例如：

```tsx
import { useTrack } from "@footprint/react";
import { EVENTS } from "@/tracking/events";

function MyButton() {
  const track = useTrack();
  return (
    <button onClick={() => track(EVENTS.TOOL_CLICK, { tool_name: "json" })}>
      打开工具
    </button>
  );
}
```

- **事件名**：建议使用 `tracking/events.ts` 中的常量，或保持 `snake_case`（如 `tool_click`、`copy_result`）。
- **旧版**：`lib/analytics` 的 `trackEvent` 仍可用，会发往 `/api/events`；新逻辑推荐统一走 Footprint + `useTrack()`。
