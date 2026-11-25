import { calculateOpportunities, EPOCH, constellationInfo } from '@/lib/orbits';
export function GET(request:Request){
  try{
    const p=new URL(request.url).searchParams;
    const numeric=(key:string,fallback:number)=>{const v=p.get(key);if(v===null)return fallback;if(!v.trim()||!Number.isFinite(Number(v)))throw new Error(`${key} 必须为有效数字`);return Number(v);};
    const observer={lat:numeric('lat',31.2304),lon:numeric('lon',121.4737)};
    const start=numeric('start',0),minutes=numeric('minutes',360),angle=numeric('minElevation',10);
    if(Math.abs(start)>31536000||minutes<1)throw new Error('start 绝对值须 ≤ 31536000，minutes 须为 1～1440');
    const constellation=p.get('constellation')||'全部';
    if(constellation!=='全部'&&!constellationInfo.some(c=>c.name===constellation))throw new Error('不支持的演示星座');
    const windows=calculateOpportunities(observer,start,minutes,angle,constellation);
    return Response.json({dataMode:'synthetic-demo',epoch:new Date(EPOCH).toISOString(),samplingSeconds:30,observer,count:windows.length,windows});
  }catch(e){return Response.json({error:e instanceof Error?e.message:'参数无效',dataMode:'synthetic-demo'},{status:400});}
}
