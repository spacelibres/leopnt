import {json2satrec,twoline2satrec,alpha5ToNumber,type OMMJsonObject} from './satellite-runtime';
import type {OrbitRecord} from './starlink';
export function tleChecksum(line:string){if(line.length!==69||!/\d/.test(line[68]))return false;let sum=0;for(const c of line.slice(0,68))sum+=c==='-'?1:/\d/.test(c)?Number(c):0;return sum%10===Number(line[68]);}
function csvRows(text:string){const rows:string[][]=[];let row:string[]=[],field='',quoted=false;for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){field+='"';i++;}else quoted=!quoted;}else if(c===','&&!quoted){row.push(field);field='';}else if(c==='\n'&&!quoted){row.push(field.replace(/\r$/,''));rows.push(row);row=[];field='';}else field+=c;}if(quoted)throw new Error('CSV 引号未闭合');if(field||row.length){row.push(field.replace(/\r$/,''));rows.push(row);}return rows;}
export function parseCatalog(text:string):{records:OrbitRecord[];format:string;rejected:number}{
  const clean=text.trim().replace(/^\uFEFF/,'');if(!clean||clean.startsWith('<'))throw new Error('返回内容不是有效星历');
  const records:OrbitRecord[]= [];let format='',rejected=0;
  if(clean.startsWith('[')||clean.startsWith('{')||clean.startsWith('OBJECT_NAME,')){
    let rows:Record<string,unknown>[];
    if(clean.startsWith('OBJECT_NAME,')){const [head,...data]=csvRows(clean);rows=data.filter(r=>r.length>1).map(r=>Object.fromEntries(head.map((k,i)=>[k,r[i]])));format='OMM CSV';}
    else{const json=JSON.parse(clean);rows=Array.isArray(json)?json:[json];format='OMM JSON';}
    for(const row of rows){
      if(!/^STARLINK[-\s]/i.test(String(row.OBJECT_NAME))){rejected++;continue;}
      const required=['NORAD_CAT_ID','MEAN_MOTION','ECCENTRICITY','INCLINATION','RA_OF_ASC_NODE','ARG_OF_PERICENTER','MEAN_ANOMALY','BSTAR','MEAN_MOTION_DOT','MEAN_MOTION_DDOT'];
      if(required.some(k=>row[k]===undefined||String(row[k]).trim()===''||!Number.isFinite(Number(row[k]))))throw new Error(`Starlink 记录 ${row.OBJECT_NAME} 缺失有效轨道参数`);
      const omm={...row,OBJECT_ID:String(row.OBJECT_ID??''),ELEMENT_SET_NO:row.ELEMENT_SET_NO??0} as OMMJsonObject;
      const epoch=String(row.EPOCH).replace(/Z$/,'')+'Z';
      if(!Number.isFinite(Date.parse(epoch))||Number(row.MEAN_MOTION)<=0||Number(row.ECCENTRICITY)<0||Number(row.ECCENTRICITY)>=1||Number(row.INCLINATION)<0||Number(row.INCLINATION)>180||!Number.isInteger(Number(row.NORAD_CAT_ID))||Number(row.NORAD_CAT_ID)<=0)throw new Error('OMM 轨道参数越界');
      const sr=json2satrec(omm);if(sr.error)throw new Error(`OMM 初始化失败：${row.OBJECT_NAME}`);
      records.push({name:String(row.OBJECT_NAME),noradId:Number(row.NORAD_CAT_ID),epoch:new Date(epoch).toISOString(),inclination:Number(row.INCLINATION),meanMotion:Number(row.MEAN_MOTION),omm});
    }
  }else{
    format='TLE';const lines=clean.split(/\r?\n/).map(l=>l.trimEnd()).filter(Boolean);
    for(let i=0;i<lines.length;){const name=lines[i++].replace(/^0 /,'').trim(),a=lines[i++],b=lines[i++];if(!a||!b)throw new Error('TLE 必须包含卫星名和完整两行根数');if(!/^STARLINK[-\s]/i.test(name)){rejected++;continue;}
      if(!a.startsWith('1 ')||!b.startsWith('2 ')||a.slice(2,7)!==b.slice(2,7)||!tleChecksum(a)||!tleChecksum(b))throw new Error(`${name} 的 TLE 行号、编号或校验和无效`);
      const sr=twoline2satrec(a,b);if(sr.error||!Number.isFinite(sr.jdsatepoch))throw new Error('TLE 初始化失败');
      records.push({name,noradId:alpha5ToNumber(sr.satnum),epoch:new Date((sr.jdsatepoch-2440587.5)*86400000).toISOString(),inclination:sr.inclo*180/Math.PI,meanMotion:sr.no*1440/(2*Math.PI),tle:[a,b]});
    }
  }
  const unique=new Map<number,OrbitRecord>();for(const r of records){const old=unique.get(r.noradId);if(!old||r.epoch>old.epoch)unique.set(r.noradId,r);}
  if(!unique.size)throw new Error('目录中没有有效的 Starlink 卫星');
  return {records:[...unique.values()].sort((a,b)=>a.noradId-b.noradId),format,rejected};
}
