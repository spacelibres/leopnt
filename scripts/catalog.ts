import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {existsSync} from 'node:fs';
import {buildCatalog,fetchCatalog,saveCatalog,catalogMetadata} from '../src/lib/catalog';
async function main(){
  if(existsSync('.env.local'))process.loadEnvFile('.env.local');
  if(process.argv[2]==='import'){
    const file=process.argv[3];if(!file)throw new Error('用法：npm run catalog:import -- 文件路径');
    const text=await readFile(path.resolve(file),'utf8');if(Buffer.byteLength(text)>20*1024*1024)throw new Error('文件超过 20 MB');
    const c=buildCatalog(text,`本地导入 / ${path.basename(file)}`,'import');await saveCatalog(c);console.log(JSON.stringify(catalogMetadata(c),null,2));
  }else{const c=await fetchCatalog();if(process.argv.includes('--snapshot'))await saveCatalog(c,path.join(process.cwd(),'data','starlink-snapshot.json'));console.log(JSON.stringify(catalogMetadata(c),null,2));}
}
main().catch(e=>{console.error(e instanceof Error?e.message:e);process.exitCode=1;});
