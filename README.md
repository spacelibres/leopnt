# LEOPNT · 低轨卫星机会导航

中文 Next.js + TypeScript + Three.js 网站，正式域名为 https://leopnt.net 。首页介绍低轨导航的未来价值、厘米级定位的实现路径与应用场景；工具仅针对真实 Starlink 轨道根数进行 SGP4 传播与几何分析。厘米级内容描述有条件的研究潜力与未来方向，不代表本站已经交付的定位精度。

## 运行

Node.js ≥22.19，推荐 Node.js 24。

```powershell
cd D:\leopnt
npm ci
npm run dev
```

打开 http://localhost:3000 。生产运行：`npm run build`，然后 `npm start`。站点默认监听所有本机网卡；限定本机可运行 `npx next start --hostname 127.0.0.1`。

## 真实数据接入

主源：[CelesTrak Starlink GP CSV](https://celestrak.org/NORAD/elements/gp.php?GROUP=starlink&FORMAT=csv)。CelesTrak 的 2026 年使用政策说明传统 TLE 下载停止，六位编号应使用现代格式，因此在线同步使用 OMM 字段，原生保留六位 NORAD 编号，仍支持真实 TLE 文件导入。

手动同步时，主源错误可使用 [findstarlink 的 CelesTrak SupGP 镜像](https://github.com/findstarlink/data)，完整性以镜像内容为准，不能保证与 GP 主源同一时刻完全一致。API 和导出保留实际来源、目录指纹、获取时间、历元与源警告。页面不再显示常驻数据状态栏。

随附 `data/starlink-snapshot.json` 为 2026-11-25 实际下载的 OMM JSON 快照：**11,196 颗 Starlink，含 606 个六位 NORAD 编号**。来源为 `https://data.findstarlink.com/celestrak.json`，原始内容 SHA-256 前16位 `e09f11e18570cf40`。获取时间 2026-11-25 11:51:35 UTC，历元范围 2026-11-24 01:12:41 UTC～2026-11-25 06:01:42 UTC。当时 CelesTrak GP 主源返回 HTTP503，未伪称直接主源下载。

```powershell
# 仅在需要更新时手动同步（相邻下载至少间隔两小时），随后重启服务
npm run catalog:sync

# 本机导入真实 TLE、OMM CSV 或 OMM JSON，仅接纳 Starlink
npm run catalog:import -- "C:\data\starlink.tle"

# 同步并更新随附快照（用于维护打包的真实数据）
npm run catalog:sync -- --snapshot
```

导入后重启服务以更新内存目录。导入与同步写入 `.cache/starlink/catalog.json`，不覆写随附快照。TLE 校验成对编号、行长度与校验和，支持 Alpha-5 编号。OMM 过滤其他星座，按 NORAD 去重取较新历元。只提供只读 HTTP API，目录不能从公共 POST 请求覆写。

需要网络代理时，将 `.env.example` 复制为 `.env.local`，设置 `STARLINK_HTTP_PROXY=http://127.0.0.1:你的端口`。Next.js 与同步/导入 CLI 均读取 `.env.local`。`STARLINK_SOURCE=mirror` 可只读取镜像；默认 auto 优先主源。机器专用代理不提交到 Git。

**网站不自动下载星历。** 前端只在页面首次载入时读取本机 API，没有定时刷新；后台只读取磁盘缓存或随附真实快照，缓存到期、打开页面、调用分析 API 和重启服务均不会触发外网下载。没有本地目录时返回明确错误。更新需要主动运行 `npm run catalog:sync`，随后重启服务；手动同步仍保留两小时最小间隔以遵守 [CelesTrak 使用政策](https://celestrak.org/usage-policy.php)。快照会过期，分析保留72小时星历门限，离线可分析快照对应的历史时段。

## 页面与 API

- `/`：面向公众的低轨导航介绍、厘米级定位愿景、三条发展路径、四类应用、实现条件、研究依据与常见问题，附真实 Starlink 三维视图；首页不自动执行窗口分析。
- `/console`：可旋转缩放地球、全量有效卫星点云、搜索与选择 Starlink、选中卫星 SGP4 轨迹、时间轴、播放倍速、方位/仰角/斜距和预测多普勒。搜索下拉仅显示前80个匹配，点云和分析不抽样卫星。
- `/opportunities`：城市或自定义经纬度、WGS84 椭球高、绝对开始时间、时间跨度、最低仰角、研究载频、采样步长；全量 Worker 分析、进度与取消、几何报告、搜索分页、本地任务与 CSV/JSON 导出。保存的是参数；重开用当前目录重算，导出才是当次完整结果。
- `/technology`：智能出行、智慧农业、机器人与低空、测绘与基础设施等未来应用。
- `/docs`：计算链路、公式、来源、局限与可运行 API。
- `/sitemap.xml`、`/robots.txt`：使用正式域名 leopnt.net；各页面包含规范地址与中文分享元信息。
- `GET /api/starlink/catalog`：Starlink 全目录与元数据。无数据503。
- `GET /api/starlink/opportunities?lat=31.2304&lon=121.4737&minutes=15&minElevation=10&frequencyGHz=12&stepSeconds=60`：完整分析。`start` 可为带时区的 ISO8601 时间；省略使用请求时刻。非法参数400、忙429、无数据503。
- 旧 `/api/demo/*` 返回410，不再提供合成轨道。

API 的窗口 `start/end/peakTime` 和几何时间为 **Unix 毫秒**。界面/CSV 为 UTC+8 并保留秒；JSON 同时保存参数、来源、目录版本、窗口和几何时间序列。API 与浏览器使用同一模型；服务端分批让出事件循环，并限制一个在途分析。

## 计算假设与边界

- SGP4 使用 satellite.js **7.2.0** 固定版本。`src/lib/satellite-runtime.ts` 引用其已发布纯JS单元，避免根入口将 Emscripten pthread / Node 模块带入浏览器。升级该依赖须重新跑基准、类型与构建检查。
- WGS84 观测站固定于地固坐标，输入站高为椭球高（米），不是海拔。TEME 传播结果使用恒星时近似转换至 ECEF；真地固速度扣除地球自转。
- `rangeRate = dot(r_sat−r_obs, v_ECEF)/range`，远离为正；`Doppler = −frequency·rangeRate/c`。默认12GHz为可修改的研究假设，不是信道分配或可接收性声明。
- 对任务起止应用 ±72小时星历年龄门限，过期记录计入排除数量；传播失败点不可见。此门限为工程选择，不是轨道误差保证。
- 支持5/10/30/60/120秒采样；窗口边界误差约一个采样间隔，短窗口可能漏检。截断窗口有明确标记。一次最多1200万次传播，超限请缩短时段或增大步长，不删减卫星凑上限。
- 几何 DOP 使用等权独立伪距、单一公共接收机钟差，`H=[LOSx,LOSy,LOSz,1]`，`Q=(HᵀH)⁻¹`。少于4颗或秩不足返回null。GDOP≤10占比按采样左端值时间加权。
- 规则推断可复核数量、窗口与几何条件，没有语言模型猜测或API Key依赖。**伪距几何DOP不能直接当作Starlink多普勒定位精度。** 实际机会导航还需要接收机观测、独立卫星时钟/钟漂、信号和链路模型、波束与接收权限等；本项目不凭星历输出真实用户位置或精度保证。

## 验证

```powershell
npm test
npm run typecheck
npm run build
# 当前快照的全量实际传播/一小时分析验收，快照失效时会报错
npx tsx scripts/verify-starlink.ts
```

覆盖 TLE 校验、OMM六位编号与过滤、Vallado卫星00005 SGP4基准、ECEF距离数值差分/多普勒、DOP退化、参数上限、缓存与故障、旧接口410和同步/异步一致性。最新实际浏览器与API验收记录：`docs/starlink-verification.md`。

## 素材与来源

- [satellite.js](https://github.com/shashwatak/satellite-js)：SGP4与坐标变换，MIT。
- [CelesTrak GP格式说明](https://celestrak.org/NORAD/documentation/gp-data-formats.php)、[findstarlink镜像](https://github.com/findstarlink/data)：真实轨道数据。
- [spacelibre VI](https://github.com/spacelibres/vi)：批准的SVG几何与完整配色角色，白色字标保持单色，产品名称为LEOPNT。
- world-atlas / Natural Earth：公共领域地理轮廓，运行时本地加载；lucide-react：ISC图标。本站不是SpaceX或Starlink官方服务。

## 视觉规范

采用 [spacelibre VI](https://vi.spacelibre.cn/) 官方源仓库 **1.5.34**、六套官方预设的完整16角色配色、批准的图标/单色字标与连续渐隐轨道构图。全站“配色”菜单支持电光蓝、极光薄荷、星云紫、太阳橙、深空青、未来青柠，选择在浏览器持久保存；首页和应用页支持深浅主题，工具区使用所选配色的深色布局；产品名称统一为大写 LEOPNT。

官方素材随项目本地提供，页面运行不请求 VI 网站。维护时可手动运行 `npm run vi:sync`（只接受核对过的 1.5.34 版本），再执行 `npm run vi:prepare` 生成背景适配图标与轨道素材。来源、对比度和渲染检查见 `docs/vi-verification.md`。正式域名已写入代码，DNS、TLS 与公网部署需要在托管环境配置。
