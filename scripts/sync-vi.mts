import {fetch,ProxyAgent} from 'undici';
import {mkdir,writeFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
if(existsSync('.env.local'))process.loadEnvFile('.env.local');
const dispatcher=process.env.STARLINK_HTTP_PROXY?new ProxyAgent(process.env.STARLINK_HTTP_PROXY):undefined;
const base='https://raw.githubusercontent.com/spacelibres/vi/main/';
const release=await fetch(base+'VERSION',{signal:AbortSignal.timeout(30000),...(dispatcher?{dispatcher}:{})});
if(!release.ok||(await release.text()).trim()!=='1.5.34')throw Error('VI 上游版本已变化，请先核对角色与素材再升级当前 1.5.34 版本。');
await mkdir('public/brand',{recursive:true});await mkdir('docs/vi-reference',{recursive:true});
const files=[['skills/spacelibre-vi/assets/icon-primary.svg','public/brand/icon-master.svg'],['skills/spacelibre-vi/assets/horizontal-white.svg','public/brand/spacelibre-white.svg'],['skills/spacelibre-vi/assets/horizontal-navy.svg','public/brand/spacelibre-navy.svg'],['skills/spacelibre-vi/assets/palette-tokens.json','public/brand/palette-tokens.json'],['04-applications/website-hero-1440x900.svg','docs/vi-reference/website-hero.svg'],['04-applications/website-header-1440x160.svg','docs/vi-reference/website-header.svg'],['VERSION','docs/vi-reference/VERSION']];
const results=await Promise.allSettled(files.map(async([source,target])=>{const r=await fetch(base+source,{signal:AbortSignal.timeout(30000),...(dispatcher?{dispatcher}:{})});if(!r.ok)throw Error(`${source}: ${r.status}`);const text=await r.text();await writeFile(target,text);console.log(target,text.length);}));
for(const r of results)if(r.status==='rejected'){console.error(r.reason);process.exitCode=1;}
await dispatcher?.close();
