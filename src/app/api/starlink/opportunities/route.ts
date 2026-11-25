import {getCatalog,catalogMetadata} from '@/lib/catalog';
import {analyzeStarlinkAsync,validateAnalysis,type AnalysisSettings} from '@/lib/starlink';
export const runtime='nodejs';
export const dynamic='force-dynamic';
function parseSettings(p:URLSearchParams):AnalysisSettings{
  const num=(key:string,fallback:number)=>{const value=p.get(key);if(value===null)return fallback;if(!value.trim()||!Number.isFinite(Number(value)))throw new Error(`${key} 必须为有效数字`);return Number(value);};
  if(p.has('constellation')&&!['Starlink','starlink','星链'].includes(p.get('constellation')!))throw new Error('本服务只支持 Starlink');
  const start=p.get('start');if(start!==null&&!/(Z|[+-]\d\d:\d\d)$/.test(start))throw new Error('start 必须是带时区的 ISO 时间');return {lat:num('lat',31.2304),lon:num('lon',121.4737),height:num('height',0),start:start===null?Date.now():Date.parse(start),minutes:num('minutes',60),minElevation:num('minElevation',10),frequencyGHz:num('frequencyGHz',12),stepSeconds:num('stepSeconds',60)};
}
let running=false;
export async function GET(request:Request){
  let settings:AnalysisSettings;
  try{settings=parseSettings(new URL(request.url).searchParams);validateAnalysis(settings,0);}catch(e){return Response.json({error:e instanceof Error?e.message:'参数无效'},{status:400});}
  if(running)return Response.json({error:'服务端正在分析，请稍后重试；网页分析在独立 Worker 中运行。'},{status:429,headers:{'Retry-After':'10'}});
  running=true;
  try{const c=await getCatalog();try{validateAnalysis(settings,c.records.length);}catch(e){return Response.json({error:e instanceof Error?e.message:'参数超限'},{status:400});}const report=await analyzeStarlinkAsync(c.records,settings);return Response.json({catalog:catalogMetadata(c),...report},{headers:{'Cache-Control':'no-store'}});}catch(e){return Response.json({error:e instanceof Error?e.message:'计算失败'},{status:503});}finally{running=false;}
}
