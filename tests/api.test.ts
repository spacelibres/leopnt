import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GET as opportunities } from '../src/app/api/demo/opportunities/route';
import { GET as constellations } from '../src/app/api/demo/constellations/route';
test('API 返回72颗合成卫星',async()=>{
  const data=await constellations().json();
  assert.equal(data.satellites.length,72);
  assert.equal(data.dataMode,'synthetic-demo');
});
test('窗口 API 返回结果且遵守星座条件',async()=>{
  const response=opportunities(new Request('http://localhost/api/demo/opportunities?constellation=OneWeb'));
  assert.equal(response.status,200);
  const data=await response.json();
  assert.ok(data.count>0);
  assert.equal(data.count,data.windows.length);
  assert.ok(data.windows.every((w:{constellation:string})=>w.constellation==='OneWeb'));
});
test('API 拒绝空值、越界、非有限值和未知星座',async()=>{
  for(const query of ['lat=','lon=181','lat=Infinity','minutes=1441','minutes=0','minElevation=91','start=31536001','constellation=unknown']){
    const response=opportunities(new Request(`http://localhost/api/demo/opportunities?${query}`));
    assert.equal(response.status,400,query);
    assert.ok((await response.json()).error);
  }
});
