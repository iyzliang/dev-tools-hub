# Dev Tools Hub

面向开发者的轻量在线工具集，首版提供 JSON 格式化与校验，后续将扩展正则、编码、Diff 等常用小工具。

## 技术栈

- **前端**：Next.js 16（App Router）、React 19、Tailwind CSS v4、CodeMirror（JSON 编辑）
- **后端**：Next.js Route Handlers、Prisma、PostgreSQL
- **部署**：Docker / Docker Compose

## 环境要求

- Node.js ≥ 20
- pnpm
- Docker / Docker Compose（用于生产部署）

## 本地开发

```bash
# 安装依赖
pnpm install

# 生成 Prisma Client（需已配置 DATABASE_URL）
pnpm prisma:generate

# 首次运行或使用埋点/管理页前：配置 .env 中的 DATABASE_URL 后执行迁移，创建表
pnpm prisma:migrate

# 开发服务器（默认 http://localhost:3000）
pnpm dev
```

**说明**：未配置 `DATABASE_URL` 或未执行迁移时，页面可打开，但访问埋点会报错（表不存在）。请先配置环境变量并执行 `pnpm prisma:migrate`。

### 环境变量

| 变量                       | 说明                                   | 必填                       |
| -------------------------- | -------------------------------------- | -------------------------- |
| `DATABASE_URL`             | PostgreSQL 连接串，供 Prisma 使用      | 使用埋点或管理统计页时必填 |
| `ADMIN_DASHBOARD_PASSWORD` | 管理统计页 `/admin/analytics` 登录密码 | 访问管理页时必填           |

示例（`.env`，勿提交仓库）：

```env
DATABASE_URL="postgresql://user:pass@localhost:5432/devtools"
ADMIN_DASHBOARD_PASSWORD="your-secret-password"
```

首次使用数据库时执行一次：`pnpm prisma:migrate`。

## 脚本说明

| 命令                   | 说明                       |
| ---------------------- | -------------------------- |
| `pnpm dev`             | 启动开发服务器             |
| `pnpm build`           | 生产构建                   |
| `pnpm start`           | 生产模式启动（需先 build） |
| `pnpm lint`            | ESLint 检查                |
| `pnpm test`            | Vitest 单元测试            |
| `pnpm prisma:generate` | 生成 Prisma Client         |
| `pnpm prisma:migrate`  | 执行数据库迁移（开发环境） |

## 部署

### 方式一：Docker Compose（推荐，含数据库）

使用 Docker Compose 统一管理应用和数据库。

#### 环境变量配置

在项目根目录创建 `.env` 文件（**勿提交到仓库**）：

```env
# 数据库配置
POSTGRES_USER=devtools
POSTGRES_PASSWORD=your-db-password
POSTGRES_DB=devtools

# 端口配置（可选，有默认值）
APP_PORT=5505
DB_PORT=5504

# 应用配置
ADMIN_DASHBOARD_PASSWORD=your-admin-password
```

| 变量                       | 说明           | 默认值     |
| -------------------------- | -------------- | ---------- |
| `POSTGRES_USER`            | 数据库用户名   | `devtools` |
| `POSTGRES_PASSWORD`        | 数据库密码     | `devtools` |
| `POSTGRES_DB`              | 数据库名       | `devtools` |
| `APP_PORT`                 | 应用对外端口   | `5505`     |
| `DB_PORT`                  | 数据库对外端口 | `5504`     |
| `ADMIN_DASHBOARD_PASSWORD` | 管理页登录密码 | `changeme` |

#### 部署步骤

```bash
# 1. 启动服务（首次会自动构建镜像）
docker compose up -d

# 2. 首次部署：执行数据库迁移
docker compose exec app npx prisma migrate deploy

# 3. 访问应用
# http://localhost:5505
# 管理页：http://localhost:5505/admin/analytics
```

#### 常用命令

```bash
# 查看日志
docker compose logs -f app
docker compose logs -f db

# 停止服务
docker compose down

# 重新构建并启动（代码更新后）
docker compose up -d --build

# 停止并删除数据卷（⚠️ 会清空数据库）
docker compose down -v
```

---

### 方式二：Docker 单容器（自备数据库）

若已有外部 PostgreSQL，可只部署应用容器。

```bash
# 1. 构建镜像
docker build -t dev-tools-hub .

# 2. 运行容器
docker run -d \
  --name dev-tools-hub \
  -p 5505:5505 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/devtools" \
  -e ADMIN_DASHBOARD_PASSWORD="your-password" \
  dev-tools-hub

# 3. 访问 http://localhost:5505
```

**说明**：

- 若不需要埋点/统计功能，可省略 `DATABASE_URL` 和 `ADMIN_DASHBOARD_PASSWORD`
- 若数据库在本机，`host` 可用 `host.docker.internal`（Mac/Windows）或宿主机 IP

## 埋点与统计

事件名、字段说明与典型查询见 [docs/analytics.md](./docs/analytics.md)。

## 更多

- 项目规格见 `app_spec.txt`
- 功能清单与完成状态见 `feature_list.json`
