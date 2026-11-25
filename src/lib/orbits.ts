/** Deterministic circular-orbit demonstration, not TLE propagation or navigation solution. */
export const EARTH_RADIUS = 6371;
const RAD = Math.PI / 180;
export const EPOCH = Date.UTC(2026, 10, 25, 0, 0, 0);
export type Vec3 = [number, number, number];
export type Constellation = '星链' | 'OneWeb' | '铱星';
export type Observer = { lat: number; lon: number };
export type Satellite = { id: string; constellation: Constellation; altitude: number; inclination: number; raan: number; phase: number; color: string };
export type Opportunity = { id: string; satellite: string; constellation: Constellation; start: number; end: number; maxElevation: number; duration: number };
export const constellationInfo = [
  { name: '星链' as const, en: 'STARLINK', altitude: 550, inclination: 53, color: '#58a6ff', prefix: 'SL' },
  { name: 'OneWeb' as const, en: 'ONEWEB', altitude: 1200, inclination: 87.9, color: '#F4F764', prefix: 'OW' },
  { name: '铱星' as const, en: 'IRIDIUM', altitude: 780, inclination: 86.4, color: '#FF807A', prefix: 'IR' },
];
export const satellites: Satellite[] = constellationInfo.flatMap((c, group) => Array.from({length:24}, (_, i) => ({
  id: `${c.prefix}-${String(1001 + i)}`, constellation:c.name, altitude:c.altitude,
  inclination:c.inclination, raan:(i % 6) * 60 + group * 17,
  phase:Math.floor(i / 6) * 90 + (i % 6) * 17 + group * 33, color:c.color,
})));
export function orbitalPeriod(altitude: number) { return 2 * Math.PI * Math.sqrt((EARTH_RADIUS + altitude) ** 3 / 398600.4418); }
export function surfacePosition(lat: number, lon: number, radius = EARTH_RADIUS): Vec3 {
  return [radius*Math.cos(lat*RAD)*Math.cos(lon*RAD), radius*Math.sin(lat*RAD), -radius*Math.cos(lat*RAD)*Math.sin(lon*RAD)];
}
export function satellitePosition(sat: Satellite, seconds: number): Vec3 {
  const u = sat.phase*RAD + seconds*2*Math.PI/orbitalPeriod(sat.altitude);
  const node = sat.raan*RAD - seconds*2*Math.PI/86164;
  const i = sat.inclination*RAD, r = EARTH_RADIUS+sat.altitude;
  return [r*(Math.cos(node)*Math.cos(u)-Math.sin(node)*Math.sin(u)*Math.cos(i)), r*Math.sin(u)*Math.sin(i), -r*(Math.sin(node)*Math.cos(u)+Math.cos(node)*Math.sin(u)*Math.cos(i))];
}
export function elevation(position: Vec3, observer: Observer): number {
  const ground = surfacePosition(observer.lat,observer.lon);
  const d = position.map((v,i)=>v-ground[i]);
  const dot = d.reduce((sum,v,i)=>sum+v*ground[i],0)/(Math.hypot(...d)*EARTH_RADIUS);
  return Math.asin(Math.max(-1,Math.min(1,dot)))/RAD;
}
export function validateObserver(observer: Observer) {
  if (!Number.isFinite(observer.lat)||!Number.isFinite(observer.lon)||Math.abs(observer.lat)>90||Math.abs(observer.lon)>180) throw new Error('纬度须为 -90～90，经度须为 -180～180 的有效数字');
}
export function calculateOpportunities(observer: Observer, startSeconds: number, durationMinutes = 360, minElevation = 10, constellation = '全部'): Opportunity[] {
  validateObserver(observer);
  if (!Number.isFinite(startSeconds)||!Number.isFinite(durationMinutes)||durationMinutes<=0||durationMinutes>1440||!Number.isFinite(minElevation)||minElevation<0||minElevation>90) throw new Error('时间跨度须为 1～1440 分钟，最低仰角须为 0～90°');
  const end = startSeconds+durationMinutes*60;
  const windows: Opportunity[] = [];
  for (const sat of satellites.filter(s=>constellation==='全部'||s.constellation===constellation)) {
    let opened: number|null = null, max = 0;
    for (let t = startSeconds; t <= end; t = Math.min(end,t+30)) {
      const el = elevation(satellitePosition(sat,t),observer);
      if (el>=minElevation) { if(opened===null) opened=t; max=Math.max(max,el); }
      if ((el<minElevation||t===end)&&opened!==null) {
        if(t>opened) windows.push({id:`${sat.id}-${opened}`,satellite:sat.id,constellation:sat.constellation,start:opened,end:t,maxElevation:Math.round(max*10)/10,duration:t-opened});
        opened=null; max=0;
      }
      if(t===end) break;
    }
  }
  return windows.sort((a,b)=>a.start-b.start||a.satellite.localeCompare(b.satellite));
}
export function formatTime(seconds: number, date = false) {
  return new Intl.DateTimeFormat('zh-CN', {timeZone:'Asia/Shanghai',hour12:false,hour:'2-digit',minute:'2-digit',second:'2-digit',...(date?{year:'numeric',month:'2-digit',day:'2-digit'}:{})}).format(new Date(EPOCH+seconds*1000));
}
export function formatDuration(seconds: number) { return `${Math.floor(seconds/60)}分${seconds%60 ? `${seconds%60}秒` : ''}`; }
