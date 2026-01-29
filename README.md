# Dev Tools Hub

面向开发者的轻量在线工具集，首版提供 JSON 格式化与校验，后续将扩展正则、编码、Diff 等常用小工具。

## 技术栈

- **前端**：Next.js 16（App Router）、React 19、Tailwind CSS v4、CodeMirror（JSON 编辑）
- **后端**：Next.js Route Handlers、Prisma、PostgreSQL
- **部署**：Docker / Docker Compose

## 环境要求

- Node.js ≥ 20
- pnpm
- Docker / Docker Compose（用于生产或本地全栈运行）

## 本地开发

```bash
# 安装依赖
pnpm install

# 生成 Prisma Client（需已配置 DATABASE_URL）
pnpm prisma:generate

# 开发服务器（默认 http://localhost:3000）
pnpm dev
```

### 环境变量

| 变量 | 说明 | 必填 |
|------|------|------|
| `DATABASE_URL` | PostgreSQL 连接串，供 Prisma 使用 | 本地开发若不用埋点可暂不配置 |
| `ADMIN_DASHBOARD_PASSWORD` | 管理统计页 `/admin/analytics` 登录密码 | 访问管理页时必填 |

示例（`.env`，勿提交仓库）：

```env
DATABASE_URL="postgresql://user:pass@localhost:5432/devtools"
ADMIN_DASHBOARD_PASSWORD="your-secret-password"
```

首次使用数据库时执行：

```bash
pnpm prisma:migrate
```

## 脚本说明

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动开发服务器 |
| `pnpm build` | 生产构建 |
| `pnpm start` | 生产模式启动（需先 build） |
| `pnpm lint` | ESLint 检查 |
| `pnpm test` | Vitest 单元测试 |
| `pnpm prisma:generate` | 生成 Prisma Client |
| `pnpm prisma:migrate` | 执行数据库迁移（开发环境） |

## 部署

详见 [docs/deployment.md](./docs/deployment.md)：Docker Compose 配置、生产部署步骤与回滚说明。

## 埋点与统计

事件名、字段说明与典型查询见 [docs/analytics.md](./docs/analytics.md)。

## 更多

- 项目规格见 `app_spec.txt`
- 功能清单与完成状态见 `feature_list.json`
