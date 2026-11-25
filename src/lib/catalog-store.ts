import type {OrbitRecord} from './starlink';
export type Catalog={id:string;fetchedAt:string;source:string;format:string;records:OrbitRecord[];warning?:string;origin?:string};
export const REFRESH_MS=2*3600000;
export class CatalogStore{
  private current:Catalog|null=null;
  private pending:Promise<Catalog>|null=null;
  private lastAttempt=-Infinity;
  constructor(private loader:()=>Promise<Catalog>,private now=()=>Date.now(),seed?:Catalog){this.current=seed??null;}
  async get():Promise<Catalog>{
    if(this.current&&this.now()-Date.parse(this.current.fetchedAt)<REFRESH_MS)return this.current;
    if(this.pending)return this.pending;
    if(this.now()-this.lastAttempt<REFRESH_MS){if(this.current)return this.current;throw new Error('星历源暂不可用，已进入两小时重试冷却；可使用 catalog:import 导入真实数据');}
    this.lastAttempt=this.now();
    this.pending=this.loader().then(c=>{this.current=c;return c;}).catch(error=>{const warning=`星历更新失败，${error instanceof Error?error.message:'未知错误'}`;if(this.current){this.current={...this.current,warning};return this.current;}throw new Error(warning);}).finally(()=>{this.pending=null;});
    return this.pending;
  }
}
