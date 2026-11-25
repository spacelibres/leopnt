import fs from 'node:fs';
import { feature } from 'topojson-client';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
const world=require('world-atlas/land-110m.json');
const land=feature(world,world.objects.land);
fs.writeFileSync('public/land.json',JSON.stringify(land.features.flatMap(f=>f.geometry.type==='MultiPolygon'?f.geometry.coordinates:[f.geometry.coordinates])));
