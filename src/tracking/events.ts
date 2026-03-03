/**
 * 埋点事件名常量，统一使用 snake_case，遵循「对象 + 动作」结构。
 * 可在业务中配合 useTrack() 使用，例如：track(EVENTS.TOOL_CLICK, { tool_name: 'json' })
 */
export const EVENTS = {
  /** 页面浏览（可由 autoTrack 自动上报，此处仅作常量引用） */
  PAGE_VIEW: "page_view",
  /** 元素点击（可由 autoTrack 自动上报） */
  ELEMENT_CLICK: "element_click",
  /** 页面离开/停留时长（可由 autoTrack 自动上报） */
  PAGE_LEAVE: "page_leave",
  /** Web Vitals 性能指标 */
  WEB_VITALS: "web_vitals",
  /** 工具入口点击 */
  TOOL_CLICK: "tool_click",
  /** 工具内操作（如「复制结果」「格式化」等） */
  TOOL_ACTION: "tool_action",
  /** 搜索/筛选 */
  SEARCH_EXECUTE: "search_execute",
} as const;

export type EventName = (typeof EVENTS)[keyof typeof EVENTS];
