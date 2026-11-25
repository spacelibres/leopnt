'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {useCatalog} from './catalog-provider';
import packageInfo from '../../package.json';
import { Orbit, LayoutDashboard, Globe2, ScanLine, Layers3, BookOpen, ArrowUpRight, Menu, X, ChevronRight, Radio } from 'lucide-react';

const navigation = [
  { href: '/', label: '总览', icon: LayoutDashboard, en: 'OVERVIEW' },
  { href: '/console', label: '星座控制台', icon: Globe2, en: 'CONSTELLATIONS' },
  { href: '/opportunities', label: '机会窗口分析', icon: ScanLine, en: 'OPPORTUNITIES' },
  { href: '/technology', label: '技术与应用', icon: Layers3, en: 'TECHNOLOGY' },
  { href: '/docs', label: '开发者文档', icon: BookOpen, en: 'DEVELOPERS' },
];
export function Shell({ children }: { children: React.ReactNode }) {
  const {version}=packageInfo;
  const pathname = usePathname();
  const {catalog,loading}=useCatalog();
  const [open, setOpen] = useState(false);
  const current = navigation.find(n => n.href === pathname) || navigation[0];
  return <div className="app-shell">
    {open && <button className="mobile-scrim" aria-label="关闭导航" onClick={() => setOpen(false)} />}
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <Link href="/" className="brand" onClick={() => setOpen(false)}><img src="/icon.svg" alt="spacelibre 官方轨道标志" /><span>LEOPNT<span className="brand-dot">.</span><small>低轨卫星机会导航</small></span></Link>
      <div className="workspace-label">探索工作空间 <span>STARLINK</span></div>
      <nav aria-label="主导航">{navigation.map(({href,label,icon:Icon}) => <Link key={href} href={href} className={`nav-link ${pathname === href ? 'active' : ''}`} onClick={() => setOpen(false)}><Icon size={19}/><span>{label}</span>{pathname === href && <ChevronRight size={14}/>}</Link>)}</nav>
      <div className="sidebar-bottom"><div className="orbit-mini"><Orbit size={27}/><span>让每一次过境<br/>成为导航的可能。</span></div><Link href="/docs" className="sidebar-help">开始探索 <ArrowUpRight size={15}/></Link><div className="system-state"><span className="status-dot"/> Starlink 专用 <span>v{version}</span></div><div className="vi-signature"><img src="/spacelibre-white.svg" alt="spacelibre"/><span>VISUAL SYSTEM</span></div></div>
    </aside>
    <div className="main-frame"><header className="topbar"><div className="breadcrumb"><button className="mobile-menu icon-button" aria-label={open ? '关闭菜单' : '打开菜单'} onClick={() => setOpen(!open)}>{open ? <X size={20}/> : <Menu size={20}/>}</button><span className="crumb-home">工作空间</span><ChevronRight size={13}/><strong>{current.label}</strong></div><div className="topbar-right"><span className="top-status"><span className="status-dot"/> {catalog?'Starlink 星历已载入':loading?'正在读取星历':'星历不可用'}</span><span className="divider"/><Link href="/docs" className="top-docs">接入指南 <ArrowUpRight size={14}/></Link><span className="avatar" title="Starlink 计算工作空间">L</span></div></header>
      <main id="main-content">{children}</main><footer><span>© {new Date().getFullYear()} LEOPNT <span className="footer-sep">/</span> 探索信号之外的可能</span><span><Radio size={12}/> Starlink · 轨道几何计算</span></footer>
    </div>
  </div>;
}
