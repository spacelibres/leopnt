export const navigationBenefits=[
  {number:'01',title:'更靠近地球，让信号多一份力量',text:'低轨卫星飞得更近，为更强的接收信号和新的观测机会创造条件。在城市等复杂环境中，这一层天空有望为现有导航增加帮助。'},
  {number:'02',title:'更快变化的视角，让等待有望缩短',text:'卫星快速划过天空，也带来更多变化的观察角度。与现有导航配合时，这种变化有望帮助高精度定位更快进入稳定状态。'},
  {number:'03',title:'多一层空间网络，让定位更有韧性',text:'把低轨卫星与北斗、GPS以及地面感知协同起来，未来的导航可以拥有更多信息来源，努力减少单一信号受阻带来的影响。'},
];
export const navigationScenarios=[
  {id:'mobility',number:'01',title:'让车辆，更懂自己的车道',category:'智能出行',text:'从道路级指引走向更细致的位置感知，为车道保持、精准泊车和道路协同提供新的空间基础。',detail:'未来价值：更细的位置判断，与车载感知共同支持驾驶系统。'},
  {id:'agriculture',number:'02',title:'让每一行作业，都恰到好处',category:'智慧农业',text:'让农机沿着规划路线稳定作业，帮助减少重复覆盖与遗漏，把位置的精度转化为土地上的效率。',detail:'未来价值：重复路线作业、精细播种与精准管理。'},
  {id:'robotics',number:'03',title:'让机器协作，有共同的坐标',category:'机器人与低空',text:'让室外机器人、无人机和自动化设备更清楚彼此的位置，为精细移动与协同作业创造条件。',detail:'未来价值：与视觉、惯性等感知融合，形成更连续的位置认知。'},
  {id:'infrastructure',number:'04',title:'让细微变化，也能被看见',category:'测绘与基础设施',text:'面向工程测量、港口作业和设施监测，探索更容易获取的高精度位置服务，让精细管理有据可依。',detail:'未来价值：结合专业设备和校正服务，支持可复核的位置测量。'},
];
export const precisionQuestions=[
  {question:'厘米级定位，意味着什么？',answer:'它意味着在规定的条件和统计口径下，把位置误差控制在厘米量级。比起只知道“在哪条路”，人和机器有机会更细致地判断自身位置。实际表现还取决于环境、设备、校正服务和持续观测条件。'},
  {question:'低轨卫星会取代北斗和 GPS 吗？',answer:'值得期待的方向是协同。低轨卫星可以为既有导航增加信号、观察角度和服务层，与北斗、GPS、惯性和视觉等信息共同改善定位体验。'},
  {question:'未来的厘米级能力，现在已经普及了吗？',answer:'在适当设备和环境下，现有专业卫星高精度定位已能达到厘米量级。低轨增强与低轨专用导航仍在推进研究、在轨验证和服务建设，不能把特定仿真或实验条件下的结果，理解为所有地点已经具备的能力。'},
  {question:'LEOPNT 现在可以体验什么？',answer:'你可以了解低轨导航的发展方向，查看真实 Starlink 星座，并探索指定位置的卫星可见机会。目前工具提供轨道与观测几何分析；首页的厘米级内容描述未来高精度方向，尚不是本站已交付的定位服务。'},
];
export const researchReferences=[
  {id:'relative',title:'厘米级相对定位的研究依据',publication:'Journal of Geodesy · 2025',url:'https://link.springer.com/article/10.1007/s00190-025-01942-w',note:'可行性仿真表明，短基线、较高等级时钟和适当精度轨道等条件下，低轨载波相位可支持厘米级相对定位。并非无条件单机实测结论。'},
  {id:'convergence',title:'让高精度定位更快可用',publication:'ION Pacific PNT · 2026',url:'https://www.ion.org/publications/abstract.cfm?articleID=20574',note:'将真实 GNSS 观测与模拟低轨观测结合，研究低轨增强对定位收敛的改善。结果依赖研究场景，不能直接当作通用服务指标。'},
  {id:'celeste',title:'从低轨增加导航的韧性',publication:'ESA · Celeste',url:'https://www.esa.int/articles/about-us/directorates/resilience-navigation-and-connectivity/navigation/celeste/celeste-for-resilience',note:'欧洲航天局探索用低轨导航层增加信号与观测几何，为既有导航提供互补能力。'},
  {id:'starlink',title:'通信星座走向导航，还需哪些条件',publication:'IEEE TAES · 2026',url:'https://arxiv.org/abs/2501.05302',note:'Starlink 下行时序研究揭示时钟与信号时序方面的约束，指出校正等机制的重要性。真实星座可见不等于已经获得高精度定位能力。'},
];
