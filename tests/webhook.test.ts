import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHmac} from 'node:crypto';
import {webhookServer,validSignature} from '../deploy/webhook.mjs';

const secret='test-only-secret-with-at-least-32-characters';
const repository='spacelibres/leopnt';
const sign=(body:string)=>'sha256='+createHmac('sha256',secret).update(body).digest('hex');
test('Webhook 验证原始字节签名，拒绝缺失、畸形、错误及篡改',()=>{
  const body=Buffer.from('{"中文":"低轨导航"}');const signature=sign(body.toString());
  assert.equal(validSignature(body,signature,secret),true);
  for(const candidate of [undefined,'sha1=abc','sha256=invalid','sha256='+'0'.repeat(64)])assert.equal(validSignature(body,candidate,secret),false);
  assert.equal(validSignature(Buffer.concat([body,Buffer.from(' ')]),signature,secret),false);
  assert.equal(validSignature(body,signature,''),false);
});

test('Webhook 仅接受指定仓库 main 推送，拒绝非法签名、超限和重放',async()=>{
  let jobs=0;
  const server=webhookServer({secret,repository,enqueue:()=>{jobs++;},maxBytes:2048});
  await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));
  const address=server.address();assert.ok(address&&typeof address==='object');
  const url=`http://127.0.0.1:${address.port}/_leopnt/github`;
  const payload={repository:{full_name:repository},ref:'refs/heads/main',after:'a'.repeat(40)};
  const post=(data:object|string,extra:Record<string,string>={})=>{
    const body=typeof data==='string'?data:JSON.stringify(data);
    return fetch(url,{method:'POST',headers:{'content-type':'application/json','x-hub-signature-256':sign(body),'x-github-event':'push','x-github-delivery':'test-delivery-1',...extra},body});
  };
  try{
    assert.equal((await post(payload,{'x-hub-signature-256':'sha256='+'0'.repeat(64)})).status,401);
    assert.equal((await post({...payload,repository:{full_name:'someone/other'}})).status,403);
    assert.equal((await post({...payload,ref:'refs/heads/feature'})).status,202);
    assert.equal((await post({...payload,deleted:true})).status,202);
    assert.equal((await post({...payload,after:'$(touch /tmp/x)'})).status,400);
    assert.equal((await post('{')).status,400);
    assert.equal((await post('x'.repeat(2049))).status,413);
    assert.equal(jobs,0);
    assert.equal((await post(payload,{'x-github-event':'ping'})).status,200);
    assert.equal((await post(payload)).status,202);
    assert.equal(jobs,1);
    const repeated=await post(payload);assert.equal(repeated.status,200);assert.equal((await repeated.json()).status,'duplicate');
    assert.equal(jobs,1);
    assert.equal((await post(payload,{'x-github-delivery':'test-delivery-2'})).status,202);
    assert.equal(jobs,2);
    assert.equal((await fetch(url)).status,405);
    assert.equal((await fetch(url+'/wrong')).status,404);
  }finally{await new Promise<void>((resolve,reject)=>server.close(error=>error?reject(error):resolve()));}
});

test('Webhook 未配置高熵密钥时拒绝启动',()=>{
  assert.throws(()=>webhookServer({secret:'',repository,enqueue:()=>{}}),/secret/);
});
