# LEOPNT 生产部署

正式地址：`https://leopnt.net`，`www.leopnt.net` 跳转到根域名。源仓库：`https://github.com/spacelibres/leopnt`，发布分支 `main`。

别名配置包含 `leopnt.cn`、`www.leopnt.cn`、`www.leopnt.net`，保留路径和查询参数并统一301跳转到正式地址。四个入口均使用HTTPS；每个域名的 DNS 必须指向VPS，HTTPS证书才能签发。

## 服务结构

- VPS 使用 Caddy 提供 HTTPS，保留服务器上的其他虚拟主机；配置见 `deploy/Caddyfile`。
- `leopnt-web.service` 以低权限用户 `leopnt` 运行，Next.js 仅监听 `127.0.0.1:3200`。
- `leopnt-webhook.service` 以 `leopnt-deploy` 运行，仅监听 `127.0.0.1:9880`。接收器用 TypeScript 编写，`npm run webhook:build` 编译为标准 ESM 后安装到 `/opt/leopnt/hooks/webhook.mjs`；无需 Node 原生 TypeScript 支持。
- 根目录 `/opt/leopnt`；`repository.git` 为公开仓库裸克隆，`releases/` 存每次构建，`current` 与 `previous` 为原子切换的版本链接。
- `.cache` 链接至 `/opt/leopnt/shared/cache`。星历只由维护者手动同步；发布、重启或 API 请求不会自动下载星历。
- `/opt/leopnt/assets/_next/static` 保存不同构建的哈希静态资源，避免切换时已打开页面的旧脚本失效。
- Webhook 运行程序放在 `/opt/leopnt/hooks/`，由 root 管理。自动发布会更新网站代码；修改接收器或系统服务需管理员主动安装相应文件。

## 自动更新流程

1. 将代码正常推送到 `main`。
2. GitHub 向 `https://leopnt.net/_leopnt/github` 发送 push。接收器校验原始正文的 HMAC-SHA256、指定仓库、main 分支、commit 与 delivery ID。仅接收 JSON，正文最多2MiB；重复投递去重。签名遵循 [GitHub 官方说明](https://docs.github.com/en/webhooks/using-webhooks/validating-webhook-deliveries)。
3. 接收器立即返回202，部署任务串行运行；构建期间的新推送合并为下一次部署，部署从 GitHub 重新获取当前 `main`。
4. 新版本在独立目录执行 `npm ci --include=dev`、`npm test`、`npm run build`，测试/构建失败时当前版本继续服务。
5. 原子切换 `current`，重启网站服务；`/api/health` 返回的 release 必须与目标提交一致，否则恢复上一版本。保留最近5个构建及回滚目标。

每次发布无须登录VPS，也不需要手工重启。公开 Webhook 不接收 shell 命令，构建子进程不继承签名密钥。

## 密钥与权限

Webhook 随机密钥只存于 VPS `/etc/leopnt/webhook.env` 和 GitHub Webhook 配置，文件 root:root 0600。格式：

```dotenv
WEBHOOK_SECRET=由管理员生成的至少32字符随机密钥
GITHUB_REPOSITORY=spacelibres/leopnt
```

SSH密码、GitHub凭据和Webhook密钥不写入项目或Git历史。Git拉取使用公开HTTPS地址，无需在VPS保存GitHub写入令牌。

部署用户只获准通过 sudo 执行 `/usr/bin/systemctl restart leopnt-web.service`。网站与构建分别使用不同用户。

## 运维命令

```bash
# 检查服务与最近发布
systemctl status leopnt-web leopnt-webhook --no-pager
journalctl -u leopnt-webhook -n 100 --no-pager
curl -fsS https://leopnt.net/api/health
readlink -f /opt/leopnt/current

# 手动发布当前main（与Webhook相同路径）
sudo -u leopnt-deploy /bin/bash /opt/leopnt/hooks/deploy.sh

# 手动同步Starlink；完成后重启网站以清空内存目录
cd /opt/leopnt/current
sudo -u leopnt npm run catalog:sync
sudo systemctl restart leopnt-web
```

部署所需 Node.js ≥22.19；本机与VPS都运行锁定的依赖。构建限制为2个静态生成worker及768MiB V8堆，适配2GiB内存VPS。Next.js 前置反向代理遵循[官方自托管建议](https://nextjs.org/docs/app/guides/self-hosting)。
