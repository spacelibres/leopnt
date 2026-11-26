/** A quiet, immediately visible explanation of low-orbit navigation. */
export function NavigationVision(){return <div className="home-globe-wrap navigation-vision simple-navigation" role="img" aria-label="一颗低轨卫星连接汽车、无人机、飞机与轮船的导航愿景示意">
<svg viewBox="100 100 800 650" aria-hidden="true" focusable="false">
  <defs>    <g id="world-satellite"><path d="M-47 -13L-20 -21 -14 -1 -41 7Z M15 0L42 -8 48 12 21 20Z" fill="var(--primary)" fillOpacity=".38" stroke="var(--primary)" strokeWidth="1.3"/><path d="M-35 -16L-29 4 M-25 -19L-19 1 M24 -3L30 17 M34 -6L40 14" stroke="var(--surface)" opacity=".4"/><path d="M-16 -12L5 -21 22 -4 0 6Z" fill="var(--surface)"/><path d="M-16 -12V6L0 22V6 M0 22L22 12V-4" fill="var(--primary)"/><path d="M-2 12L-8 25 M-13 25Q-8 32 -2 25" fill="none" stroke="var(--accent)" strokeWidth="2"/></g>
    <g id="world-car"><ellipse cx="0" cy="12" rx="31" ry="9" fill="var(--deep)" opacity=".8"/><path d="M-29 2L-15 -7 12 -7 29 1 29 12 -29 12Z" fill="var(--surface)"/><path d="M-15 -7L-8 -19 8 -19 18 -6Z" fill="var(--primary)"/><path d="M-6 -16H6L13 -7H-11Z" fill="var(--deep)"/><path d="M-26 4H-19 M21 4H28" stroke="var(--accent)" strokeWidth="3"/><circle cx="-18" cy="12" r="6" fill="var(--deep)" stroke="var(--muted)" strokeWidth="2"/><circle cx="18" cy="12" r="6" fill="var(--deep)" stroke="var(--muted)" strokeWidth="2"/></g>
    <g id="world-aircraft"><path d="M-67 0L-44 -6 -13 -8 1 -49 15 -51 10 -8 58 -5Q80 0 58 5L10 8 15 51 1 49 -13 8 -44 6 -60 23 -69 23 -61 4Z" fill="var(--surface)"/><path d="M-12 -7L4 -42 10 -43 6 -7 M-12 7L4 42 10 43 6 7" fill="var(--primary)" fillOpacity=".55"/><path d="M45 -4L57 -3 62 0 57 3 45 4" fill="var(--deep)"/><path d="M-10 -30H3 M-10 30H3" stroke="var(--surface)" strokeWidth="8" strokeLinecap="round"/><path d="M-43 -2H35" stroke="var(--deep)" strokeWidth="2" strokeDasharray="2 5"/><path d="M-56 0H-32" stroke="var(--secondary)" strokeWidth="5"/></g>
    <g id="world-ship"><path d="M-72 22Q-34 38 24 22 M-84 36Q-38 49 14 38" stroke="var(--surface)" fill="none" opacity=".16" strokeWidth="2"/><path d="M-61 -16H39L69 0 39 20H-55Z" fill="var(--surface)"/><path d="M-61 1H46L69 0 39 20H-55Z" fill="var(--primary)"/><path d="M-55 -13H-34V12H-55Z" fill="var(--surface)"/><path d="M-54 -22H-39V-12H-54Z" fill="var(--surface)"/><path d="M-52 -20H-41" stroke="var(--deep)" strokeWidth="3"/>{[-27,-8,11,30].map((x,i)=><g key={x}><rect x={x} y="-12" width="16" height="11" fill={i%2?'var(--accent)':'var(--secondary)'}/><rect x={x} y="2" width="16" height="10" fill={i%2?'var(--secondary)':'var(--accent)'} opacity=".7"/></g>)}</g>
    <g id="world-drone"><path d="M-25 -18L25 18 M-25 18L25 -18" stroke="var(--surface)" strokeWidth="5"/>{[[-28,-21],[28,-21],[-28,21],[28,21]].map(([x,y],i)=><g key={i}><ellipse cx={x} cy={y} rx="17" ry="10" fill="var(--primary)" fillOpacity=".12" stroke="var(--primary)"/><path className="world-rotor" d={`M${x-12} ${y}H${x+12}`} stroke="var(--surface)" strokeWidth="2" style={{transformOrigin:`${x}px ${y}px`}}/></g>)}<path d="M-12 -10L5 -14 14 -3 9 13 -7 13 -15 1Z" fill="var(--surface)"/><circle cx="4" cy="3" r="5" fill="var(--deep)"/><path d="M-6 13V22H8V13" stroke="var(--primary)" fill="none" strokeWidth="2"/></g></defs>
  <path d="M215 224 Q500 110 785 224" fill="none" stroke="var(--primary)" strokeWidth="1" opacity=".25"/>
  <use href="#world-satellite" transform="translate(500 192) scale(1.3)"/>
  <text x="500" y="270" textAnchor="middle" fill="var(--surface)" fontFamily="Arial, Microsoft YaHei, sans-serif" fontSize="21" letterSpacing="4">低轨卫星</text>
  <path d="M500 300V388" fill="none" stroke="var(--primary)" strokeWidth="1.5" opacity=".6"/>
  <circle cx="500" cy="388" r="4" fill="var(--accent)"/>
  <g fill="none" stroke="var(--primary)" strokeWidth="1.2" opacity=".4">
    <path d="M500 388C500 420 200 410 200 480 M500 388C500 420 400 410 400 480 M500 388C500 420 600 410 600 480 M500 388C500 420 800 410 800 480"/>
  </g>
  <path className="simple-signal" d="M500 300V388" fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" strokeDasharray="5 95"/>
  <use href="#world-car" transform="translate(200 535) scale(1.15)"/>
  <use href="#world-drone" transform="translate(400 535) scale(.9)"/>
  <use href="#world-aircraft" transform="translate(600 535) scale(.65)"/>
  <use href="#world-ship" transform="translate(800 535) scale(.72)"/>
  <g className="simple-labels" textAnchor="middle" fill="var(--surface)" fontFamily="Arial, Microsoft YaHei, sans-serif" fontSize="18" opacity=".75"><text x="200" y="615">汽车</text><text x="400" y="615">无人机</text><text x="600" y="615">飞机</text><text x="800" y="615">轮船</text></g>
  <g textAnchor="middle" fill="var(--surface)" fontFamily="Arial, Microsoft YaHei, sans-serif" fontSize="20">
    <text x="200" y="611">汽车</text><text x="400" y="611">无人机</text><text x="600" y="611">飞机</text><text x="800" y="611">轮船</text>
  </g>
  <text x="500" y="700" textAnchor="middle" fill="var(--surface)" opacity=".6" fontFamily="Arial, Microsoft YaHei, sans-serif" fontSize="17" letterSpacing="3">让每一次移动，都有更可靠的位置</text>
</svg>
</div>;}
