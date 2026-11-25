import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EARTH_RADIUS, satellites, surfacePosition, satellitePosition, elevation, calculateOpportunities, validateObserver, orbitalPeriod, formatTime } from '../src/lib/orbits';
import { toCsv } from '../src/lib/export';

test('地表坐标与圆轨道保持正确半径', () => {
  assert.ok(Math.abs(Math.hypot(...surfacePosition(30, 120)) - EARTH_RADIUS) < 0.001);
  for (const sat of satellites) assert.ok(Math.abs(Math.hypot(...satellitePosition(sat, 1000)) - EARTH_RADIUS - sat.altitude) < 0.001);
});
test('550km 轨道周期约为 95 分钟', () => {
  assert.ok(orbitalPeriod(550) > 90 * 60 && orbitalPeriod(550) < 100 * 60);
});
test('天顶仰角为90度，地球背面为负值', () => {
  assert.ok(Math.abs(elevation([EARTH_RADIUS + 550, 0, 0], {lat:0,lon:0}) - 90) < 0.001);
  assert.ok(elevation([-EARTH_RADIUS - 550, 0, 0], {lat:0,lon:0}) < 0);
});
test('机会窗口尊重时间区间、最低仰角和星座筛选', () => {
  const result = calculateOpportunities({lat:31.23,lon:121.47}, 0, 360, 10, '星链');
  assert.ok(result.length > 0);
  for (const w of result) {
    assert.equal(w.constellation, '星链');
    assert.ok(w.start >= 0 && w.end <= 21600 && w.end > w.start);
    assert.ok(w.maxElevation >= 10);
  }
  assert.deepEqual(calculateOpportunities({lat:31.23,lon:121.47},0,360,90), []);
});
test('无效观测位置、时间与仰角均被拒绝', () => {
  assert.throws(() => validateObserver({lat:91,lon:0}));
  assert.throws(() => validateObserver({lat:0,lon:NaN}));
  assert.throws(() => calculateOpportunities({lat:0,lon:0},0,-1,10));
  assert.throws(() => calculateOpportunities({lat:0,lon:0},0,360,-1));
});
test('CSV 包含中文标头并正确转义内容', () => {
  const csv = toCsv([{name:'a,"b', value:2}], ['name','value'], ['名称','数值']);
  assert.ok(csv.startsWith('\uFEFF名称,数值'));
  assert.ok(csv.includes('"a,""b"'));
});
test('30 秒的机会窗口在时间展示中可区分',()=>{
  assert.notEqual(formatTime(480),formatTime(510));
  assert.match(formatTime(510),/08:08:30/);
});
