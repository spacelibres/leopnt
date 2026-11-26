const planes=[{rx:370,ry:126,angle:-28,duration:'18s',delay:'-4s',tone:'primary'},{rx:338,ry:174,angle:32,duration:'24s',delay:'-13s',tone:'secondary'},{rx:300,ry:218,angle:-72,duration:'30s',delay:'-21s',tone:'accent'}];

/** An immediately visible illustration of future navigation, not measured orbits. */
export function NavigationVision(){return <div className="home-globe-wrap navigation-vision" role="img" aria-label="未来低轨导航愿景：流动的卫星轨道与汇聚的位置光点，非真实轨道模拟">
  <svg viewBox="0 0 1000 850" aria-hidden="true" focusable="false">
    <defs>
      <radialGradient id="leopnt-vision-aura"><stop stopColor="var(--primary)" stopOpacity=".28"/><stop offset=".55" stopColor="var(--secondary)" stopOpacity=".07"/><stop offset="1" stopColor="var(--primary)" stopOpacity="0"/></radialGradient>
      <linearGradient id="leopnt-vision-ground" x2="0" y2="1"><stop stopColor="var(--primary)" stopOpacity="0"/><stop offset=".5" stopColor="var(--primary)" stopOpacity=".5"/><stop offset="1" stopColor="var(--secondary)" stopOpacity="0"/></linearGradient>
      <linearGradient id="leopnt-vision-beam" x2="0" y2="1"><stop stopColor="var(--accent)" stopOpacity="0"/><stop offset=".5" stopColor="var(--accent)" stopOpacity=".5"/><stop offset="1" stopColor="var(--primary)" stopOpacity="0"/></linearGradient>
    </defs>
    <ellipse cx="520" cy="425" rx="470" ry="380" fill="url(#leopnt-vision-aura)"/>
    <g className="vision-stars">{Array.from({length:38},(_,i)=><circle key={i} cx={110+(i*137)%790} cy={90+(i*79)%620} r={i%5===0?2:1} fill={i%3===0?'var(--secondary)':'var(--primary)'} opacity={.2+(i%4)*.15}/>)}</g>
    <g className="vision-ground" fill="none" stroke="url(#leopnt-vision-ground)" strokeWidth="1">
      {Array.from({length:13},(_,i)=><path key={i} d={`M ${80+i*74} 790 L ${370+i*24} 530`}/>)}
      {[550,580,620,670,735,800].map((y,i)=><path key={y} d={`M ${340-i*47} ${y} Q 520 ${y-45} ${700+i*47} ${y}`}/>)}
    </g>
    <path d="M520 180 L520 720" stroke="url(#leopnt-vision-beam)" strokeWidth="2"/>
    <g className="vision-signals" fill="none" stroke="var(--primary)">{[0,1,2].map(i=><ellipse key={i} className="vision-pulse" cx="520" cy="540" rx="100" ry="34" style={{animationDelay:`${-i*2}s`}}/>)}</g>
    {planes.map(p=><g key={p.tone} transform={`rotate(${p.angle} 520 410)`} style={{color:`var(--${p.tone})`}}>
      <ellipse cx="520" cy="410" rx={p.rx} ry={p.ry} fill="none" stroke="currentColor" strokeWidth="1" opacity=".38"/>
      <ellipse cx="520" cy="410" rx={p.rx+12} ry={p.ry+8} fill="none" stroke="currentColor" strokeWidth=".6" opacity=".12"/>
      <ellipse className="vision-traveler vision-trail" cx="520" cy="410" rx={p.rx} ry={p.ry} pathLength="100" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="8 92" style={{animationDuration:p.duration,animationDelay:p.delay}}/>
      <ellipse className="vision-traveler" cx="520" cy="410" rx={p.rx} ry={p.ry} pathLength="100" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeDasharray=".1 99.9" style={{animationDuration:p.duration,animationDelay:p.delay}}/>
    </g>)}
    <g className="vision-core" transform="translate(520 410)">
      <circle r="110" fill="url(#leopnt-vision-aura)"/>
      <circle r="48" fill="none" stroke="var(--primary)" strokeWidth="1" opacity=".55"/>
      <path d="M0 -30 L23 14 L0 4 L-23 14 Z" fill="var(--surface)"/>
      <path d="M-70 0H-56 M56 0H70 M0 -70V-56 M0 56V70" stroke="var(--accent)" strokeWidth="2"/>
    </g>
    <g className="vision-coordinate" fill="var(--surface)" fontFamily="Arial, Microsoft YaHei, sans-serif"><text x="520" y="675" textAnchor="middle" fontSize="13" letterSpacing="6">让每一个位置，连接新的可能</text><text x="520" y="701" textAnchor="middle" fontSize="9" letterSpacing="3" opacity=".5">LEO · POSITIONING · NAVIGATION · TIMING</text></g>
  </svg>
</div>;}
