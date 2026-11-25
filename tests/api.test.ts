import {test} from 'node:test';
import assert from 'node:assert/strict';
import {GET} from '../src/app/api/starlink/opportunities/route';
import {GET as oldCatalog} from '../src/app/api/demo/constellations/route';
import {GET as oldOpportunities} from '../src/app/api/demo/opportunities/route';
import {toCsv} from '../src/lib/export';
import {GET as catalog} from '../src/app/api/starlink/catalog/route';
import {MockAgent,getGlobalDispatcher,setGlobalDispatcher} from 'undici';
import {readFile} from 'node:fs/promises';
test('旧演示 API 已停用，不能再输出合成卫星',()=>{assert.equal(oldCatalog().status,410);assert.equal(oldOpportunities().status,410);});
test('Starlink API 拒绝其他星座和非法参数，且不访问网络',async()=>{
  for(const q of ['constellation=OneWeb','lat=91','lat=','frequencyGHz=0','minutes=1441','start=not-a-date','start=2026-11-25T00:00:00','stepSeconds=0']){
    const response=await GET(new Request(`http://localhost/api/starlink/opportunities?${q}`));assert.equal(response.status,400,q);
  }
});
test('CSV 为中文 Excel 提供 BOM 并转义引号',()=>{const csv=toCsv([{name:'a,"b',value:2}],['name','value'],['名称','数值']);assert.ok(csv.startsWith('\uFEFF名称,数值'));assert.ok(csv.includes('"a,""b"'));});
test('网站即使读取过期目录也只访问本地，不产生下载尝试',async(t)=>{
  const previous=getGlobalDispatcher(),network=new MockAgent();network.disableNetConnect();setGlobalDispatcher(network);
  t.after(async()=>{setGlobalDispatcher(previous);await network.close();});
  t.mock.method(Date,'now',()=>Date.parse('2030-01-01T00:00:00Z'));
  const attempt=()=>readFile('.cache/starlink/attempt.json','utf8').catch(()=>'');
  const before=await attempt();
  const response=await catalog(),data=await response.json();
  assert.equal(response.status,200);assert.equal(data.updateMode,'manual');assert.equal(data.refreshIntervalSeconds,null);assert.ok(data.records.length>1000);
  assert.equal(await attempt(),before);
});
