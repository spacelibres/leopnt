import type {OrbitRecord} from './starlink';
export type Catalog={id:string;fetchedAt:string;source:string;format:string;records:OrbitRecord[];warning?:string;origin?:string};
export const SYNC_COOLDOWN_MS=2*3600000;
export class CatalogStore{
  private current:Catalog|null=null;
  private pending:Promise<Catalog>|null=null;
  constructor(private loader:()=>Promise<Catalog>){}
  async get():Promise<Catalog>{
    if(this.current)return this.current;
    if(this.pending)return this.pending;
    this.pending=this.loader().then(c=>{this.current=c;return c;}).finally(()=>{this.pending=null;});
    return this.pending;
  }
}
