import type {CSSProperties} from 'react';

const motion=(path:string,duration:string,delay:string):CSSProperties=>({offsetPath:`path('${path}')`,animationDuration:duration,animationDelay:delay});
const carRoute='M180 599 L380 496 Q402 484 427 497 L625 598';
const airRoute='M350 342 C470 245 625 250 846 348';
const seaRoute='M630 748 C715 714 805 655 922 593';
function Building({x,y,h,w=42}:{x:number;y:number;h:number;w?:number}){return <g transform={`translate(${x} ${y})`} className="world-building">
  <path d={`M-8 7 L${w} 32 L${w+40} 11 L0 -14Z`} fill="var(--deep)" opacity=".4"/>
  <path d={`M0 0 L${w} 21 V${21-h} L0 ${-h}Z`} fill="color-mix(in srgb,var(--primary) 25%,var(--deep))"/>
  <path d={`M${w} 21 L${w+29} 5 V${5-h} L${w} ${21-h}Z`} fill="color-mix(in srgb,var(--primary) 12%,var(--deep))"/>
  <path d={`M0 ${-h} L29 ${-h-16} L${w+29} ${5-h} L${w} ${21-h}Z`} fill="color-mix(in srgb,var(--primary) 45%,var(--surface))" opacity=".8"/>
  {Array.from({length:Math.floor(h/16)},(_,i)=><path key={i} d={`M7 ${-h+12+i*16} L${w-7} ${-h+26+i*16}`} stroke="var(--surface)" strokeWidth="3" opacity={i%3===0?'.55':'.15'}/>)}
</g>;}

/** A concrete future mobility scene; these are illustrative routes, not measurements. */
export function NavigationVision(){return <div className="home-globe-wrap navigation-vision mobility-world" role="img" aria-label="未来低轨卫星为空天地海的汽车、无人机、飞机、轮船、列车和机器人提供协同导航的场景示意">
<svg viewBox="0 0 1000 850" aria-hidden="true" focusable="false">
  <defs>
    <radialGradient id="world-atmosphere"><stop stopColor="var(--primary)" stopOpacity=".2"/><stop offset="1" stopColor="var(--primary)" stopOpacity="0"/></radialGradient>
    <linearGradient id="world-water" x2=".7" y2="1"><stop stopColor="var(--primary)" stopOpacity=".2"/><stop offset="1" stopColor="var(--primary)" stopOpacity=".03"/></linearGradient>
    <linearGradient id="world-land" x2=".6" y2="1"><stop stopColor="var(--primary)" stopOpacity=".16"/><stop offset="1" stopColor="var(--surface)" stopOpacity=".05"/></linearGradient>
    <linearGradient id="world-signal" x2="0" y2="1"><stop stopColor="var(--accent)" stopOpacity=".2"/><stop offset="1" stopColor="var(--primary)" stopOpacity="0"/></linearGradient>
    <g id="world-satellite"><path d="M-47 -13L-20 -21 -14 -1 -41 7Z M15 0L42 -8 48 12 21 20Z" fill="var(--primary)" fillOpacity=".38" stroke="var(--primary)" strokeWidth="1.3"/><path d="M-35 -16L-29 4 M-25 -19L-19 1 M24 -3L30 17 M34 -6L40 14" stroke="var(--surface)" opacity=".4"/><path d="M-16 -12L5 -21 22 -4 0 6Z" fill="var(--surface)"/><path d="M-16 -12V6L0 22V6 M0 22L22 12V-4" fill="var(--primary)"/><path d="M-2 12L-8 25 M-13 25Q-8 32 -2 25" fill="none" stroke="var(--accent)" strokeWidth="2"/></g>
    <g id="world-car"><ellipse cx="0" cy="12" rx="31" ry="9" fill="var(--deep)" opacity=".8"/><path d="M-29 2L-15 -7 12 -7 29 1 29 12 -29 12Z" fill="var(--surface)"/><path d="M-15 -7L-8 -19 8 -19 18 -6Z" fill="var(--primary)"/><path d="M-6 -16H6L13 -7H-11Z" fill="var(--deep)"/><path d="M-26 4H-19 M21 4H28" stroke="var(--accent)" strokeWidth="3"/><circle cx="-18" cy="12" r="6" fill="var(--deep)" stroke="var(--muted)" strokeWidth="2"/><circle cx="18" cy="12" r="6" fill="var(--deep)" stroke="var(--muted)" strokeWidth="2"/></g>
    <g id="world-aircraft"><path d="M-67 0L-44 -6 -13 -8 1 -49 15 -51 10 -8 58 -5Q80 0 58 5L10 8 15 51 1 49 -13 8 -44 6 -60 23 -69 23 -61 4Z" fill="var(--surface)"/><path d="M-12 -7L4 -42 10 -43 6 -7 M-12 7L4 42 10 43 6 7" fill="var(--primary)" fillOpacity=".55"/><path d="M45 -4L57 -3 62 0 57 3 45 4" fill="var(--deep)"/><path d="M-10 -30H3 M-10 30H3" stroke="var(--surface)" strokeWidth="8" strokeLinecap="round"/><path d="M-43 -2H35" stroke="var(--deep)" strokeWidth="2" strokeDasharray="2 5"/><path d="M-56 0H-32" stroke="var(--secondary)" strokeWidth="5"/></g>
    <g id="world-ship"><path d="M-72 22Q-34 38 24 22 M-84 36Q-38 49 14 38" stroke="var(--surface)" fill="none" opacity=".16" strokeWidth="2"/><path d="M-61 -16H39L69 0 39 20H-55Z" fill="var(--surface)"/><path d="M-61 1H46L69 0 39 20H-55Z" fill="var(--primary)"/><path d="M-55 -13H-34V12H-55Z" fill="var(--surface)"/><path d="M-54 -22H-39V-12H-54Z" fill="var(--surface)"/><path d="M-52 -20H-41" stroke="var(--deep)" strokeWidth="3"/>{[-27,-8,11,30].map((x,i)=><g key={x}><rect x={x} y="-12" width="16" height="11" fill={i%2?'var(--accent)':'var(--secondary)'}/><rect x={x} y="2" width="16" height="10" fill={i%2?'var(--secondary)':'var(--accent)'} opacity=".7"/></g>)}</g>
    <g id="world-drone"><path d="M-25 -18L25 18 M-25 18L25 -18" stroke="var(--surface)" strokeWidth="5"/>{[[-28,-21],[28,-21],[-28,21],[28,21]].map(([x,y],i)=><g key={i}><ellipse cx={x} cy={y} rx="17" ry="10" fill="var(--primary)" fillOpacity=".12" stroke="var(--primary)"/><path className="world-rotor" d={`M${x-12} ${y}H${x+12}`} stroke="var(--surface)" strokeWidth="2" style={{transformOrigin:`${x}px ${y}px`}}/></g>)}<path d="M-12 -10L5 -14 14 -3 9 13 -7 13 -15 1Z" fill="var(--surface)"/><circle cx="4" cy="3" r="5" fill="var(--deep)"/><path d="M-6 13V22H8V13" stroke="var(--primary)" fill="none" strokeWidth="2"/></g>
  </defs>
  <ellipse cx="560" cy="395" rx="450" ry="385" fill="url(#world-atmosphere)"/>
  <g fill="var(--surface)" opacity=".3">{Array.from({length:20},(_,i)=><circle key={i} cx={180+(i*149)%740} cy={65+(i*47)%250} r="1"/>)}</g>
  <g fill="none" stroke="var(--primary)"><path d="M175 210Q510 -25 954 236" opacity=".35"/><path d="M240 265Q580 60 985 320" opacity=".16"/><path className="world-flow" d="M175 210Q510 -25 954 236" strokeDasharray="20 340" strokeWidth="2" opacity=".7"/></g>
  <path d="M110 572L542 354 972 571 539 826 110 667Z" fill="url(#world-water)" stroke="var(--primary)" strokeOpacity=".25"/>
  <path d="M110 572L542 354 783 480 694 534 741 573 605 658 638 688 393 797 110 667Z" fill="url(#world-land)"/>
  <path d="M783 480L694 534 741 573 605 658 638 688 393 797" fill="none" stroke="var(--primary)" strokeWidth="2" opacity=".7"/>
  <g stroke="var(--primary)" fill="none" opacity=".15">{[0,1,2,3,4].map(i=><path key={i} d={`M${681+i*31} ${655+i*14}l76 -41`}/>)}</g>
  <g fill="none"><path d={carRoute} stroke="var(--deep)" strokeWidth="42"/><path d={carRoute} stroke="var(--surface)" strokeOpacity=".15" strokeWidth="42"/><path d={carRoute} stroke="var(--surface)" strokeDasharray="10 12" strokeOpacity=".4"/><path d="M245 698L507 556" stroke="var(--surface)" strokeOpacity=".14" strokeWidth="23"/><path d="M245 698L507 556" stroke="var(--primary)" strokeWidth="1"/><path d="M454 398L658 500" stroke="var(--surface)" strokeOpacity=".13" strokeWidth="36"/><path d="M454 398L658 500" stroke="var(--surface)" strokeDasharray="12 7" strokeWidth="2" opacity=".35"/></g>
  <g>{[{x:222,y:557,h:57},{x:294,y:520,h:100},{x:365,y:482,h:65},{x:298,y:602,h:73},{x:375,y:559,h:121},{x:448,y:590,h:67}].map((b,i)=><Building key={i} {...b}/>)}</g>
  <g className="world-links" fill="none" strokeWidth="1.3"><path d="M399 159L395 505 M399 159L609 414 M742 192L795 663 M742 192L659 305" stroke="var(--accent)" strokeDasharray="4 8" opacity=".45"/></g>
  <path d="M399 159L318 548 492 566Z M742 192L727 695 868 636Z" fill="url(#world-signal)"/>
  <g className="world-spacecraft"><use href="#world-satellite" transform="translate(399 159) rotate(-12)"/><use href="#world-satellite" transform="translate(742 192) rotate(15) scale(.85)"/></g>
  <g fill="none" strokeWidth="2"><path d={carRoute} stroke="var(--primary)" opacity=".8"/><path className="world-flow" d={airRoute} stroke="var(--accent)" strokeDasharray="6 10" opacity=".5"/><path className="world-flow" d={seaRoute} stroke="var(--secondary)" strokeDasharray="6 10" opacity=".8"/></g>
  <g className="world-mobile world-car" style={motion(carRoute,'24s','-8s')}><use href="#world-car"/></g>
  <g className="world-mobile world-aircraft" style={motion(airRoute,'34s','-17s')}><use href="#world-aircraft" transform="scale(.8)"/></g>
  <g className="world-mobile world-ship" style={motion(seaRoute,'40s','-23s')}><use href="#world-ship" transform="scale(.8)"/></g>
  <g transform="translate(609 414)"><ellipse cy="77" rx="39" ry="13" fill="var(--primary)" opacity=".1"/><g className="world-hover"><use href="#world-drone"/></g></g>
  <g transform="translate(335 649) rotate(-28)"><rect x="-46" y="-10" width="92" height="20" rx="9" fill="var(--surface)"/><path d="M-34 -5H32" stroke="var(--primary)" strokeWidth="7" strokeDasharray="14 5"/><path d="M-17 -10V10 M17 -10V10" stroke="var(--deep)" strokeOpacity=".5"/></g>
  <g transform="translate(488 601)"><ellipse cy="15" rx="14" ry="5" fill="var(--deep)"/><rect x="-11" y="-12" width="22" height="25" rx="5" fill="var(--surface)"/><path d="M-7 -5H7" stroke="var(--primary)" strokeWidth="7"/><circle cx="-9" cy="13" r="4" fill="var(--deep)"/><circle cx="9" cy="13" r="4" fill="var(--deep)"/></g>
  <g className="world-labels" fill="var(--surface)" fontFamily="Arial, Microsoft YaHei, sans-serif" fontSize="18"><text x="355" y="115" fontSize="15" letterSpacing="3" fill="var(--accent)">低轨卫星 · 协同导航</text><text x="692" y="265">航空航线</text><text x="646" y="414">无人机</text><text x="207" y="626">道路出行</text><text x="781" y="729">海上航行</text><text x="302" y="712" fontSize="13" opacity=".65">轨道交通 · 自主机器人</text></g>
  <g className="world-static" fill="var(--surface)"><use href="#world-car" transform="translate(400 493)"/><use href="#world-aircraft" transform="translate(670 285) scale(.8)"/><use href="#world-ship" transform="translate(790 660) scale(.8)"/></g>
</svg>
</div>;}
