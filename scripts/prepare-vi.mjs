import fs from 'node:fs';
const palette=JSON.parse(fs.readFileSync('public/brand/palette-tokens.json','utf8'))[0].colors;
const icon=fs.readFileSync('public/brand/icon-master.svg','utf8');
for(const context of ['Light','Dark']){
  const output=icon.replace('stroke="#002044"',`stroke="${palette[`planetOn${context}`]}"`).replace('fill="#007bff"',`fill="${palette[`primaryOn${context}`]}"`);
  fs.writeFileSync(`public/brand/icon-on-${context.toLowerCase()}.svg`,output);
}
const master=fs.readFileSync('docs/vi-reference/website-hero.svg','utf8');
const group=master.match(/<g id="application-color-system"[\s\S]*?<\/g>/)?.[0];
const defs=master.slice(master.lastIndexOf('<defs>'),master.lastIndexOf('</defs>')+7);
if(!group||!defs)throw Error('Official orbital composition not found');
fs.writeFileSync('public/brand/orbit-flow.svg',`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 900" data-source="spacelibres/vi/1.5.34" data-composition="continuous-feathered">${group}${defs}</svg>`);
fs.copyFileSync('public/brand/icon-on-light.svg','public/icon.svg');
