# 部署文档

本文档描述使用 Docker Compose 部署 Dev Tools Hub 的步骤、环境变量与回滚方式。

## 前置条件

- 已安装 Docker 与 Docker Compose
- 服务器开放 3000（应用）与 5432（数据库，可选，仅需内网时可不暴露）

## Docker Compose 配置说明

项目根目录的 `docker-compose.yml` 定义两个服务：

| 服务 | 说明 |
|------|------|
| `db` | PostgreSQL 16（Alpine），数据持久化到卷 `devtools_pg_data` |
| `app` | Next.js 应用，依赖 `db`，默认端口 3000 |

应用通过环境变量 `DATABASE_URL` 连接数据库；管理统计页密码由 `ADMIN_DASHBOARD_PASSWORD` 控制。

**注意**：生产环境务必修改 `ADMIN_DASHBOARD_PASSWORD` 及数据库账号密码，不要使用仓库内示例值。建议通过 `.env` 或编排平台的环境配置注入，勿将真实密码提交到代码库。

## 生产环境部署步骤

1. **克隆代码并进入目录**

   ```bash
   git clone <repo-url> dev-tools-hub && cd dev-tools-hub
   ```

2. **（推荐）创建 `.env` 覆盖默认环境变量**

   ```env
   # 若与 db 服务同机部署，可直接用服务名
   DATABASE_URL=postgresql://devtools:你的数据库密码@db:5432/devtools
   ADMIN_DASHBOARD_PASSWORD=你的管理密码
   ```

   在 `docker-compose.yml` 中为 `app` 服务增加：

   ```yaml
   env_file: .env
   ```

   或在 `environment` 中直接写变量（注意不要提交含密码的 compose 覆盖文件）。

3. **构建并启动**

   ```bash
   docker compose up -d --build
   ```

4. **首次部署：执行数据库迁移**

   应用镜像内已包含 Prisma schema，需在首次部署或 schema 变更后执行迁移：

   ```bash
   docker compose run --rm app node node_modules/.bin/prisma migrate deploy
   ```

   或进入运行中的 app 容器执行：

   ```bash
   docker compose exec app node node_modules/.bin/prisma migrate deploy
   ```

5. **验证**

   - 访问 `http://<服务器IP>:3000` 应看到首页。
   - 访问 `http://<服务器IP>:3000/admin/analytics` 应出现管理登录页，使用 `ADMIN_DASHBOARD_PASSWORD` 登录后可查看统计。

## 回滚策略

- **应用回滚**：使用上一版本镜像或代码重新构建并启动。

  ```bash
  git checkout <上一个稳定 tag 或 commit>
  docker compose up -d --build
  ```

- **数据库**：迁移已应用后不建议随意回滚迁移；若仅回滚应用，保留当前数据库即可。若有迁移回滚需求，需在 Prisma 中通过新增迁移修复，并按流程测试后再部署。

- **数据卷**：PostgreSQL 数据在 `devtools_pg_data` 卷中，删除容器不会删除该卷；仅当执行 `docker compose down -v` 时才会删除卷，请谨慎操作。

## 其他说明

- 日志：`docker compose logs -f app` 查看应用日志，`docker compose logs -f db` 查看数据库日志。
- 仅本地或内网使用数据库时，可在 `docker-compose.yml` 中去掉 `db` 的 `ports` 映射，避免 5432 暴露到公网。
