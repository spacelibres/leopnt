import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {analyzeStarlink,analyzeStarlinkAsync,stateAt,type OrbitRecord} from '../src/lib/starlink';
test('随附真实快照为全量 Starlink 并包括六位目录编号',async()=>{
  const catalog=JSON.parse(await readFile('data/starlink-snapshot.json','utf8')) as {id:string;source:string;records:OrbitRecord[]};
  assert.ok(catalog.records.length>1000);assert.ok(catalog.records.every(r=>/^STARLINK[-\s]/.test(r.name)));assert.ok(catalog.records.some(r=>r.noradId>=100000));
  assert.ok(catalog.source.startsWith('https://'));assert.ok(catalog.id.length>=16);
  const time=Date.parse('2026-11-25T12:08:00Z');
  const selected=catalog.records.find(r=>r.noradId===100001)!;assert.equal(selected.name,'STARLINK-38128');assert.ok(stateAt(selected,time));
  const settings={lat:39.9042,lon:116.4074,height:0,start:time,minutes:15,minElevation:10,frequencyGHz:12,stepSeconds:60};
  const sync=analyzeStarlink(catalog.records.slice(0,80),settings),asyncReport=await analyzeStarlinkAsync(catalog.records.slice(0,80),settings);
  assert.deepEqual(sync,asyncReport);
});
