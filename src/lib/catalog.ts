import {readFile,writeFile,mkdir,rename} from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fetch,ProxyAgent} from 'undici';
import {parseCatalog} from './catalog-parser';
import {CatalogStore,SYNC_COOLDOWN_MS,type Catalog} from './catalog-store';
export const PRIMARY_SOURCE='https://celestrak.org/NORAD/elements/gp.php?GROUP=starlink&FORMAT=csv';
export const MIRROR_SOURCE='https://data.findstarlink.com/celestrak.json';
const cacheDir=path.join(process.cwd(),'.cache','starlink');
export const cacheFile=path.join(cacheDir,'catalog.json');
const attemptFile=path.join(cacheDir,'attempt.json');
export async function saveCatalog(catalog:Catalog,file=cacheFile){await mkdir(path.dirname(file),{recursive:true});const temp=`${file}.${process.pid}.tmp`;await writeFile(temp,JSON.stringify(catalog));await rename(temp,file);}
export function buildCatalog(text:string,source:string,origin='network'):Catalog{
  const parsed=parseCatalog(text);
  return {id:createHash('sha256').update(text).digest('hex').slice(0,16),fetchedAt:new Date().toISOString(),source,format:parsed.format,records:parsed.records,origin};
}
export async function readCatalog(file:string):Promise<Catalog|null>{
  try{const c=JSON.parse(await readFile(file,'utf8')) as Catalog;if(!c.records?.length||!c.id||!Number.isFinite(Date.parse(c.fetchedAt)))return null;if(c.records.some(r=>!/^STARLINK[-\s]/i.test(r.name)||!Number.isFinite(r.noradId)||!Number.isFinite(Date.parse(r.epoch))||(!r.tle&&!r.omm)))return null;return c;}catch{return null;}
}
async function fetchText(url:string){
  const proxy=process.env.STARLINK_HTTP_PROXY,dispatcher=proxy?new ProxyAgent(proxy):undefined;
  try{
    const response=await fetch(url,{signal:AbortSignal.timeout(url===PRIMARY_SOURCE?25000:90000),redirect:'error',headers:{'User-Agent':'leopnt/0.1.2 (Starlink orbital analysis)','Accept':'text/csv,application/json,text/plain','Accept-Encoding':'gzip, br'},...(dispatcher?{dispatcher}:{})});
    if(!response.ok){await response.body?.cancel();throw new Error(`HTTP ${response.status}`);}
    const chunks:Uint8Array[]=[];let size=0;if(!response.body)throw new Error('上游响应无数据');
    for await(const chunk of response.body){size+=chunk.length;if(size>20*1024*1024)throw new Error('星历文件超过 20 MB');chunks.push(chunk);}
    return Buffer.concat(chunks).toString('utf8');
  }finally{await dispatcher?.close();}
}
export async function fetchCatalog():Promise<Catalog>{
  let lastAttempt=0;try{lastAttempt=JSON.parse(await readFile(attemptFile,'utf8')).at;}catch{}
  if(Date.now()-lastAttempt<SYNC_COOLDOWN_MS)throw new Error('手动同步处于两小时冷却期，保留已有数据');
  await mkdir(cacheDir,{recursive:true});await writeFile(attemptFile,JSON.stringify({at:Date.now()}));
  const sources=process.env.STARLINK_SOURCE==='mirror'?[MIRROR_SOURCE]:[PRIMARY_SOURCE,MIRROR_SOURCE],failures:string[]=[];
  for(const source of sources){try{const c=buildCatalog(await fetchText(source),source);if(source===MIRROR_SOURCE)c.warning='使用 findstarlink 第三方 CelesTrak SupGP 镜像；完整性以该镜像发布内容为准。'+(failures.length?' 主源暂不可用。':'');await saveCatalog(c);return c;}catch(e){failures.push(`${source===PRIMARY_SOURCE?'CelesTrak':'镜像'}：${e instanceof Error?e.message:'获取失败'}`);}}
  throw new Error(failures.join('；'));
}
const localStore=new CatalogStore(async()=>{
  const cached=await readCatalog(cacheFile);if(cached)return cached;
  const bundled=await readCatalog(path.join(process.cwd(),'data','starlink-snapshot.json'));if(bundled)return {...bundled,origin:'bundled'};
  throw new Error('没有可读取的本地 Starlink 星历，请先手动运行 npm run catalog:sync 或 catalog:import，再重启服务。');
});
/** Web requests only read local data. Network access is exclusive to the explicit sync CLI. */
export async function getCatalog(){return localStore.get();}
export function catalogMetadata(c:Catalog){const epochs=c.records.map(r=>Date.parse(r.epoch));return {id:c.id,dataMode:'starlink-gp',source:c.source,format:c.format,fetchedAt:c.fetchedAt,origin:c.origin,count:c.records.length,oldestEpoch:new Date(Math.min(...epochs)).toISOString(),latestEpoch:new Date(Math.max(...epochs)).toISOString(),updateMode:'manual',refreshIntervalSeconds:null,syncCooldownSeconds:SYNC_COOLDOWN_MS/1000,cacheAgeHours:Math.max(0,(Date.now()-Date.parse(c.fetchedAt))/3600000),warning:c.warning??null};}
