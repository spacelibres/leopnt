'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useEffect,useState} from 'react';
import {ArrowUpRight,Menu,X,Sun,Moon} from 'lucide-react';
const links=[{href:'/',label:'低轨导航'},{href:'/technology',label:'应用与未来'},{href:'/console',label:'在轨星座'},{href:'/opportunities',label:'导航机会'}];
export function PublicShell({children}:{children:React.ReactNode}){
  const pathname=usePathname();
  const [dark,setDark]=useState(false),[open,setOpen]=useState(false);
  useEffect(()=>{try{setDark(localStorage.getItem('LEOPNT-appearance')==='dark');}catch{}},[]);
  useEffect(()=>{
    const icon=document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if(icon)icon.href=`/brand/icon-on-${dark?'dark':'light'}.svg`;
  },[dark]);
  const changeTheme=()=>setDark(v=>{try{localStorage.setItem('LEOPNT-appearance',v?'light':'dark');}catch{}return !v;});
  return <div className={`vi-site ${dark?'vi-dark':'vi-light'}`} data-vi-version="1.5.34" data-vi-palette="01-electric-orbit"><header className="vi-header"><Link className="vi-product-brand" href="/" onClick={()=>setOpen(false)}><span className="vi-mark-space"><img src={`/brand/icon-on-${dark?'dark':'light'}.svg`} alt="spacelibre 官方轨道标志" width="56" height="56"/></span><span className="vi-product-name">LEOPNT<small>低轨卫星机会导航</small></span></Link><nav className={`vi-navigation ${open?'is-open':''}`} aria-label="网站导航">{links.map(link=><Link key={link.href} href={link.href} className={pathname===link.href?'current':''} onClick={()=>setOpen(false)}>{link.label}</Link>)}</nav><div className="vi-header-actions"><button onClick={changeTheme} className="vi-theme-button" aria-label={dark?'切换浅色主题':'切换深色主题'}>{dark?<Sun size={19}/>:<Moon size={19}/>}</button><Link href="/console" className="vi-explore-link">探索低轨<ArrowUpRight size={15}/></Link><button className="vi-mobile-toggle" aria-label={open?'关闭导航':'打开导航'} aria-expanded={open} onClick={()=>setOpen(v=>!v)}>{open?<X size={21}/>:<Menu size={21}/>}</button></div></header><main id="main-content">{children}</main><footer className="vi-footer"><div className="vi-footer-brand"><img src={`/brand/spacelibre-${dark?'white':'navy'}.svg`} width="240" height="54" alt="spacelibre 官方单色标志"/><p>LEOPNT · 让位置拥有更多可能</p></div><div className="vi-footer-links"><Link href="/technology">应用与未来</Link><Link href="/console">探索在轨星座</Link><Link href="/docs">开发者文档<ArrowUpRight size={12}/></Link><a href="https://vi.spacelibre.cn/" target="_blank" rel="noreferrer">spacelibre 视觉规范<ArrowUpRight size={12}/></a></div><div className="vi-footer-meta"><span>© {new Date().getFullYear()} LEOPNT · leopnt.net</span><span>面向厘米级定位的未来</span></div></footer></div>;
}
