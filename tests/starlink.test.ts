import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parseCatalog, tleChecksum} from '../src/lib/catalog-parser';
import {stateAt,observe,geometryDop,analyzeStarlink,validateAnalysis,type OrbitRecord} from '../src/lib/starlink';
import {CatalogStore} from '../src/lib/catalog-store';
const omm={OBJECT_NAME:'STARLINK-TEST',OBJECT_ID:'2026-001A',NORAD_CAT_ID:100001,EPOCH:'2026-11-25T00:00:00',MEAN_MOTION:15.05,ECCENTRICITY:.0001,INCLINATION:53,RA_OF_ASC_NODE:120,ARG_OF_PERICENTER:10,MEAN_ANOMALY:20,ELEMENT_SET_NO:999,BSTAR:.00001,MEAN_MOTION_DOT:0,MEAN_MOTION_DDOT:0};
const line1='1 00005U 58002B   00179.78495062  .00000023  00000-0  28098-4 0  4753';
const line2='2 00005  34.2682 348.7242 1859667 331.7664  19.3264 10.82419157413667';
test('OMM 保留六位编号，仅接纳 Starlink，去重使用较新历元',()=>{
  const result=parseCatalog(JSON.stringify([omm,{...omm,EPOCH:'2026-11-24T00:00:00'},{...omm,OBJECT_NAME:'ONEWEB-TEST',NORAD_CAT_ID:1}]));
  assert.equal(result.records.length,1);assert.equal(result.records[0].noradId,100001);assert.match(result.records[0].epoch,/2026-11-25/);
});
test('CSV 处理带引号字段，TLE 验证校验和与成对编号',()=>{
  const csv=Object.keys(omm).join(',')+'\n'+Object.values(omm).map(v=>`"${v}"`).join(',');
  assert.equal(parseCatalog(csv).records.length,1);
  assert.equal(tleChecksum(line1),true);assert.equal(tleChecksum(line2),true);
  const parsed=parseCatalog(`STARLINK-UNIT-FIXTURE\n${line1}\n${line2}`);assert.equal(parsed.records.length,1);
  assert.throws(()=>parseCatalog(`STARLINK-UNIT-FIXTURE\n${line1.slice(0,-1)}0\n${line2}`));
  assert.throws(()=>parseCatalog('<html>blocked</html>'));
});
test('SGP4 复现 Vallado 卫星00005在历元时的公开基准坐标',()=>{
  const record:OrbitRecord={name:'SGP4 benchmark',noradId:5,epoch:'2000-06-27T18:50:19.733568Z',inclination:34.2682,meanMotion:10.82419157,tle:[line1,line2]};
  const state=stateAt(record,new Date(record.epoch).getTime())!;
  assert.ok(Math.abs(state.eci.x-7022.46529266)<.01);assert.ok(Math.abs(state.eci.y+1400.08296755)<.01);assert.ok(Math.abs(state.eci.z-.03995155)<.01);
});
test('预测距离变化率与数值差分一致，多普勒符号符合远离为负',()=>{
  const record=parseCatalog(JSON.stringify([omm])).records[0],t=Date.parse(record.epoch),observer={lat:31.23,lon:121.47,height:0};
  const a=observe(record,t,observer,12e9)!,before=observe(record,t-500,observer,12e9)!,after=observe(record,t+500,observer,12e9)!;
  assert.ok(Math.abs(a.rangeRateKmS-(after.rangeKm-before.rangeKm))<.001);
  assert.equal(Math.sign(a.dopplerHz),-Math.sign(a.rangeRateKmS));
});
test('几何矩阵退化或卫星不足时不提供 DOP',()=>{
  assert.equal(geometryDop([[1,0,0],[0,1,0],[0,0,1]]),null);
  assert.equal(geometryDop(Array.from({length:8},()=>[1,0,0])),null);
  const dop=geometryDop([[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]])!;
  assert.ok(Math.abs(dop.pdop-Math.sqrt(1.5))<1e-8);
});
test('窗口分析使用完整目录并返回数据排除情况和推断证据',()=>{
  const records=Array.from({length:6},(_,i)=>({...omm,NORAD_CAT_ID:100001+i,OBJECT_NAME:`STARLINK-UNIT-${i}`,MEAN_ANOMALY:i*60}));
  const catalog=parseCatalog(JSON.stringify(records)).records;
  const ground=stateAt(catalog[0],Date.parse(catalog[0].epoch))!.geodetic;
  const report=analyzeStarlink(catalog,{lat:ground.latitude*180/Math.PI,lon:ground.longitude*180/Math.PI,height:0,start:Date.parse(catalog[0].epoch),minutes:120,minElevation:10,frequencyGHz:12,stepSeconds:30});
  assert.equal(report.totalSatellites,6);assert.ok(report.windows.length>0);assert.ok(report.inference.length>0);
  assert.ok(report.windows.every(w=>w.end>w.start&&w.start>=report.start&&w.end<=report.end));
  const stale=analyzeStarlink(catalog,{lat:0,lon:0,height:0,start:Date.parse('2027-01-01T00:00:00Z'),minutes:5,minElevation:10,frequencyGHz:12,stepSeconds:30});
  assert.equal(stale.excludedStale,6);assert.equal(stale.windows.length,0);
});
test('计算边界校验拒绝过大工作量和无效时间频率',()=>{
  const base={lat:0,lon:0,height:0,start:Date.now(),minutes:60,minElevation:10,frequencyGHz:12,stepSeconds:30};
  for(const change of [{lat:91},{start:NaN},{frequencyGHz:0},{minutes:1441},{stepSeconds:0}])assert.throws(()=>validateAnalysis({...base,...change},100));
  assert.throws(()=>validateAnalysis({...base,minutes:1440,stepSeconds:5},15000));
});
test('本地目录即使超过两小时也不会触发重新加载，合并在途读取',async(t)=>{
  let calls=0,now=Date.now();t.mock.method(Date,'now',()=>now);
  const store=new CatalogStore(async()=>{calls++;return {id:'a',fetchedAt:'2020-01-01T00:00:00Z',source:'test',format:'OMM JSON',records:parseCatalog(JSON.stringify([omm])).records};});
  await Promise.all([store.get(),store.get()]);assert.equal(calls,1);
  now+=7200001;
  const old=await store.get();assert.equal(old.id,'a');assert.equal(calls,1);
});
