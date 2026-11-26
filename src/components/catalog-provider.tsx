'use client';
import {createContext,useContext,useEffect,useState} from 'react';
import type {OrbitRecord} from '@/lib/starlink';
import {usePathname} from 'next/navigation';
export type CatalogPayload={id:string;dataMode:string;source:string;format:string;fetchedAt:string;latestEpoch:string;oldestEpoch:string;count:number;cacheAgeHours:number;warning:string|null;records:OrbitRecord[];updateMode:'manual'};
type Context={catalog:CatalogPayload|null;loading:boolean;error:string};
const CatalogContext=createContext<Context>({catalog:null,loading:true,error:''});
export function CatalogProvider({children}:{children:React.ReactNode}){
  const pathname=usePathname();
  const needsCatalog=['/console','/opportunities','/docs'].includes(pathname);
  const [catalog,setCatalog]=useState<CatalogPayload|null>(null),[loading,setLoading]=useState(true),[error,setError]=useState('');
  useEffect(()=>{
    if(!needsCatalog||catalog)return;
    setLoading(true);setError('');
    const controller=new AbortController();
    async function loadLocal(){try{const response=await fetch('/api/starlink/catalog',{signal:controller.signal,cache:'no-store'});const data=await response.json();if(!response.ok)throw new Error(data.error||'本地星历读取失败');if(!data.records?.length)throw new Error('本地 Starlink 目录为空');if(!controller.signal.aborted)setCatalog(data);}catch(e){if(!controller.signal.aborted)setError(e instanceof Error?e.message:'本地星历读取失败');}finally{if(!controller.signal.aborted)setLoading(false);}}
    void loadLocal();return()=>controller.abort();
  },[needsCatalog]);
  return <CatalogContext.Provider value={{catalog,loading,error}}>{children}</CatalogContext.Provider>;
}
export function useCatalog(){return useContext(CatalogContext);}
/** Only show an actual data problem; no permanent source/download banner. */
export function CatalogNotice(){const {catalog,error}=useCatalog();if(error)return <p className="error-message" role="alert">{error}</p>;if(catalog&&Math.abs(Date.now()-Date.parse(catalog.latestEpoch))>72*3600000)return <p className="error-message" role="alert">本地星历已超出当前时刻的72小时时效范围。请手动同步后重启服务，或分析星历对应的历史时段。</p>;return null;}
