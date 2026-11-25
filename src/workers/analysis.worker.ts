import {analyzeStarlink,type OrbitRecord,type AnalysisSettings} from '../lib/starlink';
self.onmessage=(event:MessageEvent<{records:OrbitRecord[];settings:AnalysisSettings}>)=>{
  try{const report=analyzeStarlink(event.data.records,event.data.settings,value=>self.postMessage({type:'progress',value}));self.postMessage({type:'result',report});}catch(e){self.postMessage({type:'error',error:e instanceof Error?e.message:'计算失败'});}
};
