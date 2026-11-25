# leopnt · 低轨卫星机会导航

中文、可独立运行的低轨卫星机会导航产品演示。TypeScript + Next.js App Router + Three.js，无需 API Key、数据库或外部运行服务。

## 启动

需要 Node.js 20.9 或以上版本，推荐 Node.js 24 LTS。

```powershell
cd D:\leopnt
npm ci
npm run dev
```

打开 http://localhost:3000 。生产模式：

```powershell
npm run build
npm start
```

首次安装依赖需要联网；安装完成后，地理数据、标志、图标、字体回退与计算均可离线运行。浏览器需支持 WebGL 才能显示三维视图；未支持时显示降级说明，其余分析功能可继续使用。服务默认监听所有本机网卡，可通过 `npx next start --hostname 127.0.0.1` 限定本机。

## 页面与功能

- `/`：服务总览、三维地球、场景指标、过境窗口与星座筛选。
- `/console`：72 颗合成卫星、三组演示星座、卫星选择、旋转缩放、轨道开关、时间播放、倍速和时间轴。
- `/opportunities`：城市与自定义经纬度、开始时间、1～24 小时时段、最低仰角及星座筛选；结果搜索、分页、CSV/JSON 导出与本地保存任务。
- `/technology`：技术流程、功能能力与研究场景。
- `/docs`：本地接口文档、可运行请求与响应说明。
- `/api/demo/constellations`、`/api/demo/opportunities`：只读演示 JSON API，参数错误返回 HTTP 400。

## 模型与时间

所有轨道均为合成演示，星座名称仅用于说明不同轨道壳层，数量与轨道参数不代表运营商真实部署。两体圆轨道模型包含简化地球自转；球形地球半径 6371 km，以 30 秒采样进行仰角可见性判断。固定场景纪元为 2026-11-25 00:00 UTC，即北京时间 08:00；界面使用 UTC+8，API 窗口值为相对纪元秒数。

窗口边界精度约为采样步长；未计入真实星历、地形、链路、信号可用性、多普勒测量、时钟、定位与授时解算。几何可见不代表导航可用，不能将演示结果用于真实导航决策。任务只保存在当前浏览器 localStorage，最多保留最近 20 条，没有跨设备同步。

## 验证

```powershell
npm test
npm run typecheck
npm run build
```

单元测试覆盖球面坐标、轨道半径与周期、仰角、窗口边界及筛选、参数校验、CSV 转义、秒级时间和 API。浏览器验收记录见 `docs/verification.md`。

## 代码结构

`src/lib/orbits.ts` 是前端和 API 共用的演示轨道模型；`src/components/globe.tsx` 负责 WebGL 场景与资源清理；`dashboard.tsx` 负责首页和控制台；`analysis.tsx` 负责分析表单、任务和导出；`information.tsx` 负责技术和文档页面。

## 素材

- spacelibre 官方 SVG 母版：[spacelibres/vi](https://github.com/spacelibres/vi)。产品名称为 leopnt，官方标志保持原始几何；全彩图标使用 electric-orbit 辅色星球，白色完整字标保持单色。
- 地理轮廓：[world-atlas](https://github.com/topojson/world-atlas) / Natural Earth 公共领域数据。已将轮廓保存为 `public/land.json`，无需运行时联网。`node scripts/prepare-assets.mjs` 可重新生成。
- 图标：lucide-react（ISC）。系统字体：Arial / 中文系统字体，技术数字使用 Consolas。

本项目无虚构用户、支付、邮箱提交或账户服务；真实数据与解算可以通过替换模型和扩展 API 接入。
