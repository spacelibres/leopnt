import {test} from 'node:test';
import assert from 'node:assert/strict';
import {GET} from '../src/app/api/starlink/opportunities/route';
import {GET as oldCatalog} from '../src/app/api/demo/constellations/route';
import {GET as oldOpportunities} from '../src/app/api/demo/opportunities/route';
import {toCsv} from '../src/lib/export';
test('旧演示 API 已停用，不能再输出合成卫星',()=>{assert.equal(oldCatalog().status,410);assert.equal(oldOpportunities().status,410);});
test('Starlink API 拒绝其他星座和非法参数，且不访问网络',async()=>{
  for(const q of ['constellation=OneWeb','lat=91','lat=','frequencyGHz=0','minutes=1441','start=not-a-date','start=2026-11-25T00:00:00','stepSeconds=0']){
    const response=await GET(new Request(`http://localhost/api/starlink/opportunities?${q}`));assert.equal(response.status,400,q);
  }
});
test('CSV 为中文 Excel 提供 BOM 并转义引号',()=>{const csv=toCsv([{name:'a,"b',value:2}],['name','value'],['名称','数值']);assert.ok(csv.startsWith('\uFEFF名称,数值'));assert.ok(csv.includes('"a,""b"'));});
