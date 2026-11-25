# 生产验收记录

日期：2026-11-25（Asia/Shanghai）。VPS：176.122.167.230。

## GitHub与真实自动发布

- 完整项目和Git历史已推送至 `spacelibres/leopnt`，默认分支 `main`。
- VI六套配色版本：0.1.6，提交 `e120561502164b29b059c3400562cb50508fdbad`。
- 部署版本：0.1.7，提交 `5b1450450091970d94e79ab6a18f501721e23fbb`。
- GitHub Webhook ID 716697209，ping返回200，真实main推送返回202。
- 该推送自动触发VPS执行安装、16项测试和Next.js生产构建。journal记录 `Deployed 5b1450450091970d94e79ab6a18f501721e23fbb`，部署进程退出0。
- 公网 `https://leopnt.net/api/health` 返回200、version 0.1.7、release与GitHub提交完全一致；不是手工替换文件后的状态。

## 网络与运行

- 正式首页 HTTPS 返回200，证书校验成功；www.net返回301到根域名。
- 公网Webhook GET返回405，无签名JSON POST返回401。
- 网站仅监听127.0.0.1:3200，Webhook仅监听127.0.0.1:9880，Caddy负责公网TLS。
- 现有SpaceEyes与Caddy服务保持active；原Caddy配置仅增加LEOPNT独立配置的import，原文件备份保留。
- systemd已设置网站与Webhook开机启动。运行与部署使用不同低权限用户，部署用户sudo权限仅限重启本站服务。
- VPS Ubuntu系统Node.js未编译TypeScript支持，接收器已通过独立tsconfig编译成标准ESM运行，避免修改其他网站共用的Node.js。
- 临时本地Webhook密钥文件已删除；正式密钥仅在VPS与GitHub配置中，未写入Git。

## 界面与计算

- 官方六套配色已核对16角色、图标行星色、轨道渐变和关键对比度；1280px桌面与390px手机检查通过，详情见vi-verification.md。
- 浏览器公网远程预览接口反复超时；公网HTML、静态资源、API与TLS通过直接HTTP验证，未把预览工具超时当作站点故障。
- 现有13项轨道/目录测试及新增3项Webhook测试通过，生产环境变量下也通过；类型检查、接收器编译、生产构建通过。
- 仍只使用Starlink真实目录，未恢复网页或后台自动下载。

## 后续自动发布与别名

0.1.8提交f58b1a1505cd28482bd84c1ba954fc4647ad7b18再次通过真实push触发，GitHub返回202，VPS完成16项测试/构建并退出0，公网健康接口报告相同release。leopnt.cn与www.leopnt.cn证书验证成功，HTTPS路径 `/technology?from=alias` 均返回301至 `https://leopnt.net/technology?from=alias`。用户更正域名拼写后，配置只保留.net/.cn及各自www四个入口。
