import {json2satrec,twoline2satrec,propagate,gstime,eciToEcf,eciToEcfVelocity,eciToGeodetic,ecfToLookAngles,geodeticToEcf,type SatRec,type OMMJsonObject} from './satellite-runtime';
export type OrbitRecord={name:string;noradId:number;epoch:string;inclination:number;meanMotion:number;omm?:OMMJsonObject;tle?:[string,string]};
export type Vec3=[number,number,number];
export type Observer={lat:number;lon:number;height:number};
export type AnalysisSettings=Observer&{start:number;minutes:number;minElevation:number;frequencyGHz:number;stepSeconds:number};
export type Opportunity={id:string;satellite:string;noradId:number;start:number;end:number;maxElevation:number;duration:number;peakTime:number;rangeKm:number;dopplerHz:number;clippedStart:boolean;clippedEnd:boolean};
export type GeometrySample={time:number;visible:number;gdop:number|null;pdop:number|null};
export type AnalysisReport={start:number;end:number;settings:AnalysisSettings;totalSatellites:number;usedSatellites:number;excludedStale:number;propagationFailed:number;stepSeconds:number;windows:Opportunity[];geometry:GeometrySample[];maxVisible:number;geometryCoverage:number;inference:string[];model:string};
export const EARTH_RADIUS=6378.137;
export const MAX_AGE_HOURS=72;
export const MAX_EVALUATIONS=12_000_000;
const RAD=Math.PI/180;
const satrecs=new WeakMap<OrbitRecord,SatRec>();
export function getSatrec(record:OrbitRecord){let sr=satrecs.get(record);if(!sr){sr=record.tle?twoline2satrec(...record.tle):json2satrec(record.omm!);satrecs.set(record,sr);}return sr;}
export function stateAt(record:OrbitRecord,time:number){
  try{const date=new Date(time),state=propagate(getSatrec(record),date);if(!state)return null;const gmst=gstime(date),ecf=eciToEcf(state.position,gmst),velocity=eciToEcfVelocity(state.position,state.velocity,gmst);if(!Number.isFinite(ecf.x)||!Number.isFinite(velocity.x))return null;return {eci:state.position,ecf,velocity,geodetic:eciToGeodetic(state.position,gmst)};}catch{return null;}
}
export function toScene(position:{x:number;y:number;z:number}):Vec3{return [position.x,position.z,-position.y];}
export function scenePosition(record:OrbitRecord,time:number):Vec3|null{const state=stateAt(record,time);return state?toScene(state.ecf):null;}
export function surfacePosition(lat:number,lon:number,radius=EARTH_RADIUS):Vec3{return [radius*Math.cos(lat*RAD)*Math.cos(lon*RAD),radius*Math.sin(lat*RAD),-radius*Math.cos(lat*RAD)*Math.sin(lon*RAD)];}
export function observerGeodetic(o:Observer){return {latitude:o.lat*RAD,longitude:o.lon*RAD,height:o.height/1000};}
export function observe(record:OrbitRecord,time:number,observer:Observer,frequencyHz=12e9){
  const state=stateAt(record,time);if(!state)return null;
  const gd=observerGeodetic(observer),look=ecfToLookAngles(gd,state.ecf),ground=geodeticToEcf(gd),d={x:state.ecf.x-ground.x,y:state.ecf.y-ground.y,z:state.ecf.z-ground.z};
  const rangeRateKmS=(d.x*state.velocity.x+d.y*state.velocity.y+d.z*state.velocity.z)/look.rangeSat;
  return {elevation:look.elevation/RAD,azimuth:(look.azimuth/RAD+360)%360,rangeKm:look.rangeSat,rangeRateKmS,dopplerHz:-rangeRateKmS/299792.458*frequencyHz,altitudeKm:state.geodetic.height,position:toScene(state.ecf),lineOfSight:[d.x/look.rangeSat,d.y/look.rangeSat,d.z/look.rangeSat] as Vec3};
}
/** Equal independent pseudorange errors, common receiver clock only; not a Doppler-positioning accuracy estimate. */
export function geometryDop(lines:number[][]):{gdop:number;pdop:number}|null{
  if(lines.length<4)return null;
  const normal=Array.from({length:4},()=>Array(4).fill(0) as number[]);
  for(const line of lines){const row=[...line,1];for(let i=0;i<4;i++)for(let j=0;j<4;j++)normal[i][j]+=row[i]*row[j];}
  const aug=normal.map((row,i)=>[...row,...Array.from({length:4},(_,j)=>i===j?1:0)]);
  for(let i=0;i<4;i++){let pivot=i;for(let j=i+1;j<4;j++)if(Math.abs(aug[j][i])>Math.abs(aug[pivot][i]))pivot=j;if(Math.abs(aug[pivot][i])<1e-9)return null;[aug[i],aug[pivot]]=[aug[pivot],aug[i]];const scale=aug[i][i];for(let j=0;j<8;j++)aug[i][j]/=scale;for(let k=0;k<4;k++){if(k===i)continue;const factor=aug[k][i];for(let j=0;j<8;j++)aug[k][j]-=factor*aug[i][j];}}
  const pdop2=aug[0][4]+aug[1][5]+aug[2][6],gdop2=pdop2+aug[3][7];if(pdop2<0||gdop2<0)return null;return {pdop:Math.sqrt(pdop2),gdop:Math.sqrt(gdop2)};
}
export function validateAnalysis(s:AnalysisSettings,count:number){
  if(Object.values(s).some(v=>!Number.isFinite(v)))throw new Error('所有计算参数须为有效数字');
  if(Math.abs(s.lat)>90||Math.abs(s.lon)>180||s.height< -500||s.height>10000)throw new Error('经纬度或站高超出范围（站高 -500～10000 m）');
  if(!Number.isFinite(new Date(s.start).getTime())||s.start<Date.UTC(1957,0,1)||s.start>Date.UTC(2100,0,1))throw new Error('开始时间须位于 1957～2100 年');
  if(s.minutes<1||s.minutes>1440||s.minElevation<0||s.minElevation>90||s.frequencyGHz<=0||s.frequencyGHz>100||![5,10,30,60,120].includes(s.stepSeconds))throw new Error('时长 1～1440 分钟；仰角 0～90°；频率 0～100 GHz；采样步长 5/10/30/60/120 秒');
  if((Math.ceil(s.minutes*60/s.stepSeconds)+1)*count>MAX_EVALUATIONS)throw new Error('计算量超过 1200 万次传播，请缩短时间或增大采样步长');
}
export function isFresh(record:OrbitRecord,time:number){return Math.abs(time-Date.parse(record.epoch))<=MAX_AGE_HOURS*3600000;}
function* analyzeSteps(records:OrbitRecord[],settings:AnalysisSettings):Generator<number,AnalysisReport,void>{
  validateAnalysis(settings,records.length);
  const {start,minutes,minElevation,frequencyGHz,stepSeconds}=settings,end=start+minutes*60000;
  const valid=records.filter(r=>isFresh(r,start)&&isFresh(r,end));
  const windows:Opportunity[]=[],times:number[]=[];for(let t=start;t<end;t+=stepSeconds*1000)times.push(t);times.push(end);
  const sightLines:Vec3[][]=times.map(()=>[]),counts=times.map(()=>0);let failed=0;
  for(const [index,record] of valid.entries()){
    let opened:number|null=null,peak:ReturnType<typeof observe>=null,peakTime=start,hasFailure=false;
    times.forEach((t,ti)=>{
      const o=observe(record,t,settings,frequencyGHz*1e9);if(!o)hasFailure=true;
      const visible=o!==null&&o.elevation>=minElevation;
      if(visible&&o){counts[ti]++;sightLines[ti].push(o.lineOfSight);if(opened===null)opened=t;if(!peak||o.elevation>peak.elevation){peak=o;peakTime=t;}}
      if((!visible||t===end)&&opened!==null){if(t>opened&&peak)windows.push({id:`${record.noradId}-${opened}`,satellite:record.name,noradId:record.noradId,start:opened,end:t,maxElevation:Math.round(peak.elevation*100)/100,duration:(t-opened)/1000,peakTime,rangeKm:peak.rangeKm,dopplerHz:peak.dopplerHz,clippedStart:opened===start,clippedEnd:visible&&t===end});opened=null;peak=null;}
    });if(hasFailure)failed++;if(index%50===0)yield Math.round((index+1)/valid.length*100);
  }
  const geometry=times.map((t,i)=>{const dop=geometryDop(sightLines[i]);return {time:t,visible:counts[i],gdop:dop?.gdop??null,pdop:dop?.pdop??null};});
  // Time-weighted left-endpoint coverage, excluding the final zero-duration sample.
  let coveredMs=0;geometry.slice(0,-1).forEach((g,i)=>{if(g.gdop!==null&&g.gdop<=10)coveredMs+=times[i+1]-times[i];});
  const geometryCoverage=coveredMs/(end-start)*100,maxVisible=Math.max(0,...counts);
  const inference=[`目录 ${records.length} 颗 Starlink；时段内满足 ±${MAX_AGE_HOURS} 小时星历门限 ${valid.length} 颗，排除 ${records.length-valid.length} 颗。`,
    `以 ${stepSeconds} 秒采样得到 ${windows.length} 个几何可见窗口，峰值同时可见 ${maxVisible} 颗。短于采样间隔的过境可能漏检，窗口边界误差约一个采样步长。`,
    valid.length===0?'无满足星历年龄要求的卫星，不能形成有效预测；请同步更新数据。':`在等权伪距和公共接收机钟差假设下，GDOP ≤ 10 的时段占比 ${geometryCoverage.toFixed(1)}%。这只是几何参考，不适用于直接宣称 Starlink 多普勒定位精度。`,
    '预测多普勒由距离变化率与设定载频计算，未包含卫星/接收机钟漂、波束调度、信号可解调性或真实观测；无法仅凭星历推断实际定位精度。'];
  if(failed)inference.push(`${failed} 颗卫星至少一次 SGP4 传播失败，相关时间点已排除，不作为可见。`);
  yield 100;
  return {start,end,settings,totalSatellites:records.length,usedSatellites:valid.length,excludedStale:records.length-valid.length,propagationFailed:failed,stepSeconds,windows:windows.sort((a,b)=>a.start-b.start||a.noradId-b.noradId),geometry,maxVisible,geometryCoverage,inference,model:'SGP4 / WGS84 / geometric-only'};
}
export function analyzeStarlink(records:OrbitRecord[],settings:AnalysisSettings,onProgress?:(value:number)=>void):AnalysisReport{const steps=analyzeSteps(records,settings);let result=steps.next();while(!result.done){onProgress?.(result.value);result=steps.next();}return result.value;}
export async function analyzeStarlinkAsync(records:OrbitRecord[],settings:AnalysisSettings):Promise<AnalysisReport>{const steps=analyzeSteps(records,settings);let result=steps.next();while(!result.done){await new Promise<void>(resolve=>setTimeout(resolve,0));result=steps.next();}return result.value;}
export function formatTime(time:number,date=false){return new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',hour12:false,hour:'2-digit',minute:'2-digit',second:'2-digit',...(date?{year:'numeric',month:'2-digit',day:'2-digit'}:{})}).format(new Date(time));}
export function formatDuration(seconds:number){return `${Math.floor(seconds/60)}分${Math.round(seconds%60)?`${Math.round(seconds%60)}秒`:''}`;}
export function localDateInput(time:number){return new Date(time+8*3600000).toISOString().slice(0,16);}
