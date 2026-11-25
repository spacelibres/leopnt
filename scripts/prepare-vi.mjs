import fs from 'node:fs';
const palettes=JSON.parse(fs.readFileSync('public/brand/palette-tokens.json','utf8'));
const icon=fs.readFileSync('public/brand/icon-master.svg','utf8');
const master=fs.readFileSync('docs/vi-reference/website-hero.svg','utf8');
const group=master.match(/<g id="application-color-system"[\s\S]*?<\/g>/)?.[0];
const defs=master.slice(master.lastIndexOf('<defs>'),master.lastIndexOf('</defs>')+7);
if(!group||!defs)throw Error('Official orbital composition not found');
for(const preset of palettes){
  const palette=preset.colors,folder=`public/brand/${preset.name}`;
  fs.mkdirSync(folder,{recursive:true});
  for(const context of ['Light','Dark']){
    const output=icon.replace('stroke="#002044"',`stroke="${palette[`planetOn${context}`]}"`).replace('fill="#007bff"',`fill="${palette[`primaryOn${context}`]}"`);
    fs.writeFileSync(`${folder}/icon-on-${context.toLowerCase()}.svg`,output);
  }
  const themeDefs=defs.replace(/stop-color="[^"]+"( stop-opacity="[^"]+")? data-stop-role="(primary|secondary|accent)"/g,(_,opacity,role)=>`stop-color="${palette[role]}"${opacity??''} data-stop-role="${role}"`);
  fs.writeFileSync(`${folder}/orbit-flow.svg`,`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 900" data-source="spacelibres/vi/1.5.34" data-palette="${preset.name}" data-composition="continuous-feathered">${group}${themeDefs}</svg>`);
}
for(const name of ['icon-on-light','icon-on-dark','orbit-flow'])fs.copyFileSync(`public/brand/${palettes[0].name}/${name}.svg`,`public/brand/${name}.svg`);
fs.copyFileSync('public/brand/icon-on-light.svg','public/icon.svg');
