# 埋点与统计说明

Dev Tools Hub 通过前端埋点 SDK 将匿名事件上报到后端，写入 PostgreSQL，供管理统计页 `/admin/analytics` 使用。

## 事件名称

| 事件名 | 说明 |
|--------|------|
| `page_view` | 页面访问（含首页、工具页等） |
| `tool_open` | 打开某个工具页 |
| `json_format` | JSON 格式化成功 |
| `json_minify` | JSON 压缩成功 |
| `json_error` | JSON 解析失败 |
| `copy_result` | 复制结果到剪贴板 |

## 上报字段（请求体）

单条事件会包含以下字段（由前端 SDK 自动附带，部分可选）：

| 字段 | 类型 | 说明 |
|------|------|------|
| `anonymous_id` | string | 匿名访客 ID（localStorage 持久化） |
| `session_id` | string | 当前会话 ID |
| `event_name` | string | 事件名称，见上表 |
| `tool_name` | string | 可选，工具标识，如 `json-formatter` |
| `properties` | object | 可选，如 `success`、`input_size_range`、`error_type` 等 |
| `user_agent` | string | 浏览器 UA |
| `locale` | string | 语言，如 `zh-CN` |
| `timezone` | string | 时区，如 `Asia/Shanghai` |
| `created_at` | string | ISO 8601 时间，事件发生时间 |

服务端会写入表 `analytics_events`，并可能补充 `received_at`、`updated_at` 等。不收集 PII，不存储用户输入的 JSON 内容，仅可存储元信息（如长度区间）。

## API

- **上报**：`POST /api/events`  
  - Body：`{ "events": [ { ... } ] }` 或单条对象/数组。  
  - 单次请求建议不超过 100 条。

- **汇总（仅管理端）**：`GET /api/events/summary`  
  - 需有效管理 Cookie（先通过 `/api/admin/login` 登录）。  
  - 查询参数：`range=24h|7d|30d`、`tool_name`、`event_name` 等。  
  - 返回按日期与工具/事件类型的聚合数据，供仪表盘与图表使用。

## 典型查询示例（SQL）

在已连接 PostgreSQL 的情况下，可直接查询 `analytics_events` 表（表名映射为 `analytics_events`）：

```sql
-- 最近 7 天按事件类型统计
SELECT event_name, COUNT(*) AS cnt
FROM analytics_events
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY event_name
ORDER BY cnt DESC;

-- 最近 7 天按工具统计
SELECT tool_name, COUNT(*) AS cnt
FROM analytics_events
WHERE created_at >= NOW() - INTERVAL '7 days'
  AND tool_name IS NOT NULL
GROUP BY tool_name
ORDER BY cnt DESC;

-- 按天汇总
SELECT DATE(created_at) AS day, COUNT(*) AS cnt
FROM analytics_events
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY day;
```

## 管理统计页

- 地址：`/admin/analytics`（不在公开导航中展示）。  
- 访问前需通过页面登录，密码与后端环境变量 `ADMIN_DASHBOARD_PASSWORD` 一致。  
- 登录后可查看总事件数、按日趋势、按工具/事件类型筛选等，数据来自 `GET /api/events/summary`。
