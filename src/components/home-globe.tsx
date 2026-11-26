'use client';
import dynamic from 'next/dynamic';
import {useEffect,useState} from 'react';
import {useCatalog} from './catalog-provider';
const Globe=dynamic(()=>import('./globe').then(m=>m.Globe),{ssr:false});
export function HomeGlobe(){
  const {catalog}=useCatalog();
  const [time,setTime]=useState<number|null>(null);
  const [selected,setSelected]=useState<number|null>(null);
  useEffect(()=>{setTime(Date.now());},[]);
  return <div className="home-globe-wrap" aria-label="低轨星座与地球三维视图">{catalog&&time!==null?<Globe records={catalog.records} time={time} selected={selected??catalog.records[0]?.noradId??null} showOrbits zoom={0} onSelect={setSelected}/>:<div className="globe-loading"><div className="loading-orbit"/><span>正在展开低轨视野</span></div>}</div>;
}
