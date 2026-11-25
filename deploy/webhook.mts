import {createHmac,timingSafeEqual} from 'node:crypto';
import {createServer,type IncomingMessage} from 'node:http';
import {spawn} from 'node:child_process';
import {pathToFileURL} from 'node:url';

export function validSignature(body:Buffer,signature:string|undefined,secret:string){
  if(!secret||!signature||!/^sha256=[a-f0-9]{64}$/.test(signature))return false;
  const expected=createHmac('sha256',secret).update(body).digest();
  return timingSafeEqual(expected,Buffer.from(signature.slice(7),'hex'));
}
type Options={secret:string;repository:string;enqueue:()=>void;maxBytes?:number};
const header=(req:IncomingMessage,key:string)=>typeof req.headers[key]==='string'?req.headers[key]:undefined;

export function webhookServer({secret,repository,enqueue,maxBytes=2*1024*1024}:Options){
  if(secret.length<32)throw Error('Webhook secret must contain at least 32 characters');
  const deliveries=new Map<string,number>();
  const server=createServer((req,res)=>{
    const reply=(status:number,data:object)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(data));};
    if(req.url!=='/_leopnt/github'){reply(404,{error:'not found'});req.resume();return;}
    if(req.method!=='POST'){reply(405,{error:'POST required'});req.resume();return;}
    if(!header(req,'content-type')?.startsWith('application/json')){reply(415,{error:'JSON required'});req.resume();return;}
    if(Number(header(req,'content-length'))>maxBytes){reply(413,{error:'payload too large'});req.resume();return;}
    let size=0,tooLarge=false;const chunks:Buffer[]=[];
    req.on('data',(chunk:Buffer)=>{
      size+=chunk.length;
      if(size>maxBytes){if(!tooLarge){tooLarge=true;chunks.length=0;reply(413,{error:'payload too large'});}return;}
      chunks.push(chunk);
    });
    req.on('error',()=>{if(!res.headersSent)reply(400,{error:'request aborted'});});
    req.on('end',()=>{
      if(tooLarge)return;
      const body=Buffer.concat(chunks);
      if(!validSignature(body,header(req,'x-hub-signature-256'),secret)){reply(401,{error:'invalid signature'});return;}
      let payload;
      try{payload=JSON.parse(body.toString('utf8'));}catch{reply(400,{error:'invalid JSON'});return;}
      if(!payload||typeof payload!=='object'||payload.repository?.full_name!==repository){reply(403,{error:'repository rejected'});return;}
      const event=header(req,'x-github-event');
      if(event==='ping'){reply(200,{status:'pong'});return;}
      if(event!=='push'||payload.ref!=='refs/heads/main'||payload.deleted===true){reply(202,{status:'ignored'});return;}
      if(typeof payload.after!=='string'||!/^[a-f0-9]{40}$/.test(payload.after)||/^0+$/.test(payload.after)){reply(400,{error:'invalid commit'});return;}
      const delivery=header(req,'x-github-delivery');
      if(!delivery||!/^[a-zA-Z0-9-]{1,100}$/.test(delivery)){reply(400,{error:'delivery id required'});return;}
      const now=Date.now();for(const [id,time]of deliveries)if(now-time>3600000)deliveries.delete(id);
      if(deliveries.has(delivery)){reply(200,{status:'duplicate'});return;}
      try{enqueue();}catch{reply(503,{error:'deployment queue unavailable'});return;}
      if(deliveries.size>=1000)deliveries.delete(deliveries.keys().next().value!);
      deliveries.set(delivery,now);
      console.log(JSON.stringify({event:'push accepted',delivery,commit:payload.after}));
      reply(202,{status:'queued',commit:payload.after});
    });
  });
  server.maxHeadersCount=50;server.requestTimeout=15000;server.headersTimeout=10000;
  return server;
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  let running=false,pending=false;
  const run=()=>{
    if(running){pending=true;return;}
    running=true;
    const child=spawn('/bin/bash',['/opt/leopnt/hooks/deploy.sh'],{
      stdio:'inherit',env:{PATH:'/usr/local/bin:/usr/bin:/bin',HOME:'/opt/leopnt/deployer',LANG:'C.UTF-8',NODE_ENV:'production',NEXT_TELEMETRY_DISABLED:'1'},
    });
    child.once('error',error=>console.error('Deployment process failed:',error.message));
    child.once('close',code=>{running=false;console.log(JSON.stringify({event:'deployment finished',code}));if(pending){pending=false;run();}});
  };
  webhookServer({secret:process.env.WEBHOOK_SECRET??'',repository:process.env.GITHUB_REPOSITORY??'spacelibres/leopnt',enqueue:run})
    .listen(9880,'127.0.0.1',()=>console.log('LEOPNT signed webhook listening on loopback'));
}
