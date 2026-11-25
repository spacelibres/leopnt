'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import type {AnalysisReport,AnalysisSettings,OrbitRecord} from '@/lib/starlink';
export function useAnalysis(){
  const worker=useRef<Worker|null>(null),[report,setReport]=useState<AnalysisReport|null>(null),[busy,setBusy]=useState(false),[progress,setProgress]=useState(0),[error,setError]=useState('');
  const cancel=useCallback(()=>{worker.current?.terminate();worker.current=null;setBusy(false);},[]);
  useEffect(()=>()=>{worker.current?.terminate();},[]);
  const run=useCallback((records:OrbitRecord[],settings:AnalysisSettings)=>{
    worker.current?.terminate();setReport(null);setBusy(true);setProgress(0);setError('');
    try{const task=new Worker(new URL('../workers/analysis.worker.ts',import.meta.url));worker.current=task;
      task.onmessage=(event)=>{const data=event.data;if(data.type==='progress')setProgress(data.value);else{if(data.type==='result')setReport(data.report);else setError(data.error);setBusy(false);task.terminate();worker.current=null;}};
      task.onerror=(e)=>{setError(e.message||'计算线程无法启动，请使用文档中的服务端 API。');setBusy(false);task.terminate();worker.current=null;};
      task.postMessage({records,settings});
    }catch(e){setError(e instanceof Error?e.message:'计算线程不可用');setBusy(false);}
  },[]);
  return {report,busy,progress,error,run,cancel};
}
