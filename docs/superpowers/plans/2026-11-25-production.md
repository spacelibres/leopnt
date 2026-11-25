# LEOPNT VPS、GitHub 与完整 VI 实施计划

**目标**：部署到用户指定 VPS，将完整项目推送至 spacelibres/leopnt，并通过签名校验的 GitHub push Webhook 自动部署。

**约束**：产品名称 LEOPNT；正式域名 leopnt.net；仅 Starlink 计算；星历仍仅手动下载。遵循 spacelibre VI 官方六套16角色配色，保持原始单色标志。

## 配色

- [x] 新增全站配色上下文，支持六套官方预设和深浅主题持久化。
- [x] 为各预设生成原始几何不变的全彩图标与连续轨道；单色字标不染色。
- [x] 首页、应用、工具、图表、地球和 favicon 联动；场景区用辅助色营造更丰富的视觉层次。
- [x] 检查桌面、手机、多套配色及对比度，运行现有测试与构建。

## 发布

- [x] 只读检查 VPS 既有服务，避免占用端口或覆盖现有站点。
- [x] 使用专用低权限用户、systemd、独立发布目录和本地端口，配置反向代理。
- [x] Webhook 校验 HMAC、仓库与默认分支；限制正文大小，合并并发部署；构建与健康检查通过后切换，失败保留上一版。
- [x] Webhook 密钥仅存 VPS 和 GitHub；SSH密码不写入仓库、镜像或项目配置。
- [x] 推送完整 Git 历史至空仓库 main，不强制覆盖远端。
- [x] 验证公网页面、Webhook 拒绝非法请求、GitHub 真实推送交付与自动升级；DNS就绪后配置 HTTPS。
- [x] 更新部署文档，patch升级与提交，核对远端版本。

新增别名：leopnt.cn、www.leopnt.cn已指向VPS；www.leonet.net配置已准备，其DNS仍需域名管理者修改。公网浏览器预览工具超时，界面已在同构建本地验证，公网使用TLS/HTTP/API/静态资源验收。
