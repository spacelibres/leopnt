import {readFile} from 'node:fs/promises';
import {analyzeStarlinkAsync,isFresh,stateAt,type OrbitRecord} from '../src/lib/starlink';
async function main(){
  const catalog=JSON.parse(await readFile('data/starlink-snapshot.json','utf8')) as {id:string;source:string;records:OrbitRecord[]};
  const start=Date.now(),began=performance.now();
  if(!catalog.records.every(r=>/^STARLINK[-\s]/.test(r.name)))throw new Error('目录含非 Starlink 卫星');
  const successful=catalog.records.filter(r=>isFresh(r,start)&&stateAt(r,start)).length;
  const report=await analyzeStarlinkAsync(catalog.records,{lat:31.2304,lon:121.4737,height:0,start,minutes:60,minElevation:10,frequencyGHz:12,stepSeconds:60});
  if(!report.usedSatellites||!report.windows.length)throw new Error('当前快照未能产生有效窗口；请检查星历时效');
  console.log(JSON.stringify({catalog:catalog.id,source:catalog.source,records:catalog.records.length,sixDigitIds:catalog.records.filter(r=>r.noradId>=100000).length,successfulAtStart:successful,used:report.usedSatellites,excludedStale:report.excludedStale,propagationFailed:report.propagationFailed,windows:report.windows.length,maxVisible:report.maxVisible,geometryCoverage:report.geometryCoverage,elapsedSeconds:(performance.now()-began)/1000},null,2));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
