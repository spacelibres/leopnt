# 首页轻量动画 · 0.1.10

2026-11-26（Asia/Shanghai）。用户要求首页不再等待Three.js地球启动，改用表达未来低轨导航潜力的酷炫动画。

- 首页使用服务端直出的SVG与CSS动画：三层连续轨道、运动光点/尾迹、信号波纹、导航核心与空间网格。没有模型/纹理下载、WebGL初始化或星历传播依赖。保留官方VI轨道素材与六套配色，装饰不遮挡正文；标注未来愿景示意。
- 移除HomeGlobe组件；CatalogProvider只在console/opportunities/docs加载本地目录，公共页工具链接关闭prefetch。没有改变手动星历下载策略。
- 构建后的首页HTML已有vision-traveler图形；初始脚本检查未包含Three.js WebGLRenderer。没有宣称实测首屏耗时或固定倍数提升。
- 浏览器1280px桌面检查：6个轨道动画元素、animationName为vision-orbit、canvas数量0，原地球加载提示不存在。
- 390×844手机检查：动画处于文案下方、没有文字碰撞，scrollWidth375/innerWidth390，无横向溢出。切换极光薄荷配色后正常。
- 从首页进入控制台后仍加载11,196条真实Starlink目录，canvas数量1。返回首页后使用愿景动画。
- 提供prefers-reduced-motion静态样式；16项既有测试、类型检查和Next.js生产构建通过。
