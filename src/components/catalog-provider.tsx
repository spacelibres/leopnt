'use client';
import {createContext,useCallback,useContext,useEffect,useState} from 'react';
import {RefreshCw,Database,AlertCircle} from 'lucide-react';
import {formatTime,type OrbitRecord} from '@/lib/starlink';
export type CatalogPayload={id:string;dataMode:string;source:string;format:string;fetchedAt:string;latestEpoch:string;oldestEpoch:string;count:number;cacheAgeHours:number;warning:string|null;records:OrbitRecord[]};
type Context={catalog:CatalogPayload|null;loading:boolean;error:string;reload:()=>void};
const CatalogContext=createContext<Context>({catalog:null,loading:true,error:'',reload:()=>{}});
export function CatalogProvider({children}:{children:React.ReactNode}){
  const [catalog,setCatalog]=useState<CatalogPayload|null>(null),[loading,setLoading]=useState(true),[error,setError]=useState('');
  const reload=useCallback(async()=>{setLoading(true);setError('');try{const response=await fetch('/api/starlink/catalog',{signal:AbortSignal.timeout(125000),cache:'no-store'});const data=await response.json();if(!response.ok)throw new Error(data.error||'目录请求失败');if(!data.records?.length)throw new Error('Starlink 目录为空');setCatalog(data);}catch(e){setError(e instanceof Error?e.message:'星历获取失败');}finally{setLoading(false);}},[]);
  useEffect(()=>{void reload();const timer=setInterval(()=>void reload(),7200000);return()=>clearInterval(timer);},[reload]);
  return <CatalogContext.Provider value={{catalog,loading,error,reload}}>{children}</CatalogContext.Provider>;
}
export function useCatalog(){return useContext(CatalogContext);}
export function CatalogStatus(){const {catalog,loading,error,reload}=useCatalog();const outdated=catalog&&Math.abs(Date.now()-Date.parse(catalog.latestEpoch))>72*3600000;return <div className={`catalog-status ${error||outdated?'catalog-error':''}`} role="status"><div><Database size={16}/><strong>{loading?'正在读取 Starlink 星历…':catalog?`${catalog.count.toLocaleString()} 颗 Starlink · ${catalog.format}`:'尚无有效 Starlink 星历'}</strong>{catalog&&<span>获取于 {formatTime(Date.parse(catalog.fetchedAt),true)}</span>}</div><button className="button small secondary" disabled={loading} onClick={reload}><RefreshCw size={13} className={loading?'spinning':''}/>读取最新缓存</button>{(error||catalog?.warning)&&<p><AlertCircle size={13}/>{error||catalog?.warning}</p>}{outdated&&<p><AlertCircle size={13}/>当前目录的最新星历距现在已超过 72 小时，当前时刻预测不可用。请同步更新，或分析目录对应的历史时段。</p>}{catalog&&<details><summary>数据来源与时效</summary><p>来源：{catalog.source}<br/>目录指纹：{catalog.id} · 缓存 {catalog.cacheAgeHours.toFixed(1)} 小时<br/>星历历元：{formatTime(Date.parse(catalog.oldestEpoch),true)} ～ {formatTime(Date.parse(catalog.latestEpoch),true)} CST<br/>每两小时最多同步一次；分析排除距任务时段超过 72 小时的星历。</p></details>}</div>;}
