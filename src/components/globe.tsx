'use client';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EARTH_RADIUS, satellites, satellitePosition, surfacePosition, orbitalPeriod, type Satellite } from '@/lib/orbits';

type Props = { seconds:number; constellation:string; selected:string; showOrbits:boolean; zoom:number; onSelect:(id:string)=>void; interactive?:boolean };
export function Globe(props: Props) {
  const container = useRef<HTMLDivElement>(null);
  const latest = useRef(props);
  const [state,setState] = useState<'loading'|'ready'|'fallback'>('loading');
  useEffect(()=>{latest.current=props;},[props]);
  useEffect(()=>{
    const host=container.current; if(!host)return;
    let renderer:THREE.WebGLRenderer;
    try {renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});} catch {setState('fallback');return;}
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.8));
    renderer.setClearColor(0x000000,0);
    host.appendChild(renderer.domElement);
    renderer.domElement.setAttribute('aria-label','可拖动旋转和缩放的三维地球与演示卫星轨道');
    const scene=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(40,1,0.1,100);
    camera.position.copy(new THREE.Vector3(...surfacePosition(24,108,3.8)));
    const controls=new OrbitControls(camera,renderer.domElement);
    controls.enableDamping=true; controls.enablePan=false; controls.minDistance=2.5; controls.maxDistance=6.5;
    controls.autoRotate=!latest.current.interactive&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches; controls.autoRotateSpeed=0.18; controls.enableZoom=false;
    scene.add(new THREE.AmbientLight(0x85baff,2.5));
    const light=new THREE.DirectionalLight(0xb9e5ff,3);light.position.set(-3,4,-5);scene.add(light);
    const earthMaterial=new THREE.MeshPhongMaterial({color:0x0a243a,shininess:12,specular:0x104768});
    const earth=new THREE.Mesh(new THREE.SphereGeometry(1,96,64),earthMaterial);scene.add(earth);
    const atmosphere=new THREE.Mesh(new THREE.SphereGeometry(1.035,64,48),new THREE.ShaderMaterial({
      vertexShader:'varying vec3 vNormal; varying vec3 vPosition; void main(){ vNormal=normalize(normalMatrix*normal); vec4 pos=modelViewMatrix*vec4(position,1.); vPosition=pos.xyz; gl_Position=projectionMatrix*pos; }',
      fragmentShader:'varying vec3 vNormal; varying vec3 vPosition; void main(){float glow=pow(1.-abs(dot(normalize(vNormal),normalize(-vPosition))),3.); gl_FragColor=vec4(.08,.48,1.,glow*.65);}',
      transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,
    }));scene.add(atmosphere);
    const grid=new THREE.Group();
    const gridMat=new THREE.LineBasicMaterial({color:0x2b6691,transparent:true,opacity:0.18});
    for(let lat=-60;lat<=60;lat+=30){const points=Array.from({length:181},(_,j)=>new THREE.Vector3(...surfacePosition(lat,j*2,1.003)));grid.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),gridMat));}
    for(let lon=0;lon<360;lon+=30){const points=Array.from({length:181},(_,j)=>new THREE.Vector3(...surfacePosition(j-90,lon,1.003)));grid.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),gridMat));}scene.add(grid);
    const abort=new AbortController();
    let landTexture:THREE.CanvasTexture|undefined;
    fetch('/land.json',{signal:abort.signal}).then(r=>r.json()).then((polygons:number[][][][])=>{
      const canvas=document.createElement('canvas');canvas.width=2048;canvas.height=1024;
      const ctx=canvas.getContext('2d')!;ctx.fillStyle='#061827';ctx.fillRect(0,0,2048,1024);
      const paths=new Path2D();
      for(const polygon of polygons)for(const ring of polygon){
        let prev:number|undefined;
        ring.forEach(([lon,lat],i)=>{const x=(lon+180)/360*2048,y=(90-lat)/180*1024; if(i===0||prev===undefined||Math.abs(x-prev)>1024)paths.moveTo(x,y);else paths.lineTo(x,y);prev=x;});paths.closePath();
      }
      ctx.fillStyle='#164256';ctx.fill(paths,'evenodd');ctx.strokeStyle='#38839a';ctx.lineWidth=0.8;ctx.stroke(paths);
      ctx.save();ctx.clip(paths,'evenodd');ctx.fillStyle='#4693a6';for(let x=0;x<2048;x+=7)for(let y=0;y<1024;y+=7){ctx.globalAlpha=0.32;ctx.fillRect(x,y,1.4,1.4);}ctx.restore();
      landTexture=new THREE.CanvasTexture(canvas);landTexture.colorSpace=THREE.SRGBColorSpace;earthMaterial.map=landTexture;earthMaterial.color.set(0xffffff);earthMaterial.needsUpdate=true;
    }).catch((error)=>{if(error.name!=='AbortError')console.warn('本地地理轮廓未载入，使用网格地球。');});
    const orbitGroup=new THREE.Group();scene.add(orbitGroup);
    const orbitLines: {line:THREE.Line;sat:Satellite}[]=[];
    satellites.filter((_,i)=>i%4===0).forEach(sat=>{
      const points=Array.from({length:181},(_,j)=>new THREE.Vector3(...satellitePosition(sat,j/180*orbitalPeriod(sat.altitude))).divideScalar(EARTH_RADIUS));
      const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color:sat.color,transparent:true,opacity:0.28}));orbitGroup.add(line);orbitLines.push({line,sat});
    });
    const dotGeo=new THREE.SphereGeometry(0.009,8,8);
    const meshes=satellites.map(sat=>{
      const mesh=new THREE.Mesh(dotGeo,new THREE.MeshBasicMaterial({color:sat.color}));mesh.userData.id=sat.id;scene.add(mesh);return {mesh,sat};
    });
    const marker=new THREE.Mesh(new THREE.RingGeometry(.022,.032,32),new THREE.MeshBasicMaterial({color:0xf4f764,side:THREE.DoubleSide}));scene.add(marker);
    const station=new THREE.Mesh(new THREE.SphereGeometry(.011,12,12),new THREE.MeshBasicMaterial({color:0xf4f764}));station.position.set(...surfacePosition(31.23,121.47,1.012));scene.add(station);
    const raycaster=new THREE.Raycaster();const pointer=new THREE.Vector2();let pointerStart=[0,0];
    const down=(event:PointerEvent)=>{pointerStart=[event.clientX,event.clientY];};
    const click=(event:PointerEvent)=>{
      if(Math.hypot(event.clientX-pointerStart[0],event.clientY-pointerStart[1])>5)return;
      const box=host.getBoundingClientRect();pointer.set((event.clientX-box.left)/box.width*2-1,-(event.clientY-box.top)/box.height*2+1);raycaster.setFromCamera(pointer,camera);
      const hit=raycaster.intersectObjects(meshes.filter(m=>m.mesh.visible).map(m=>m.mesh))[0];if(hit)latest.current.onSelect(hit.object.userData.id);
    };
    renderer.domElement.addEventListener('pointerdown',down);renderer.domElement.addEventListener('pointerup',click);
    const resize=new ResizeObserver(()=>{const {width,height}=host.getBoundingClientRect();if(width&&height){renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();}});resize.observe(host);
    let frame=0, previousZoom=latest.current.zoom;let last=0;
    const animate=(now:number)=>{
      frame=requestAnimationFrame(animate);if(now-last<30)return;last=now;
      const p=latest.current;
      if(p.zoom!==previousZoom){camera.position.multiplyScalar(Math.pow(.85,p.zoom-previousZoom));camera.position.clampLength(2.5,6.5);previousZoom=p.zoom;}
      meshes.forEach(({mesh,sat})=>{mesh.position.set(...satellitePosition(sat,p.seconds));mesh.position.divideScalar(EARTH_RADIUS);mesh.visible=p.constellation==='全部'||p.constellation===sat.constellation;mesh.scale.setScalar(p.selected===sat.id?1.9:1);if(p.selected===sat.id){marker.position.copy(mesh.position);marker.lookAt(camera.position);marker.visible=mesh.visible;}});
      orbitGroup.visible=p.showOrbits;orbitGroup.rotation.y=-p.seconds*2*Math.PI/86164;
      orbitLines.forEach(({line,sat})=>{line.visible=p.constellation==='全部'||p.constellation===sat.constellation;});
      controls.update();renderer.render(scene,camera);
    };frame=requestAnimationFrame(animate);setState('ready');
    return ()=>{abort.abort();cancelAnimationFrame(frame);resize.disconnect();controls.dispose();renderer.domElement.removeEventListener('pointerdown',down);renderer.domElement.removeEventListener('pointerup',click);scene.traverse(obj=>{if(obj instanceof THREE.Mesh||obj instanceof THREE.Line){obj.geometry.dispose();const mats=Array.isArray(obj.material)?obj.material:[obj.material];mats.forEach((m:THREE.Material)=>m.dispose());}});landTexture?.dispose();renderer.dispose();renderer.domElement.remove();};
  },[]);
  return <div className="globe-stage" ref={container} data-globe-state={state}>
    {state==='loading'&&<div className="globe-loading" role="status"><div className="loading-orbit"/><span>正在构建轨道视图</span></div>}
    {state==='fallback'&&<div className="globe-fallback"><div className="fallback-planet"/><span>当前设备未启用 WebGL<br/>可继续使用列表、时间轴与机会分析</span></div>}
  </div>;
}
