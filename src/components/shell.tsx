'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {useCatalog} from './catalog-provider';
import packageInfo from '../../package.json';
import {PublicShell} from './public-shell';
import {useTheme,themeAsset,PalettePicker} from './theme-provider';
import { Orbit, LayoutDashboard, Globe2, ScanLine, Layers3, BookOpen, ArrowUpRight, Menu, X, ChevronRight, Radio } from 'lucide-react';

const navigation = [
  { href: '/', label: '低轨导航首页', icon: LayoutDashboard, en: 'HOME' },
  { href: '/technology', label: '应用与未来', icon: Layers3, en: 'APPLICATIONS' },
  { href: '/console', label: '探索在轨星座', icon: Globe2, en: 'CONSTELLATIONS' },
  { href: '/opportunities', label: '探索导航机会', icon: ScanLine, en: 'OPPORTUNITIES' },
  { href: '/docs', label: '开发者文档', icon: BookOpen, en: 'DEVELOPERS' },
];
export function Shell({ children }: { children: React.ReactNode }) {
  const {version}=packageInfo;
  const {palette}=useTheme();
  const pathname = usePathname();
  const isPublic=pathname==='/'||pathname==='/technology';
  const {catalog,loading}=useCatalog();
  const [open, setOpen] = useState(false);
  const current = navigation.find(n => n.href === pathname) || navigation[0];
  if(isPublic)return <PublicShell>{children}</PublicShell>;
  return <div className="app-shell" data-vi-version="1.5.34" data-vi-palette={palette.name}>
    {open && <button className="mobile-scrim" aria-label="关闭导航" onClick={() => setOpen(false)} />}
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <Link href="/" className="brand" onClick={() => setOpen(false)}><img src={themeAsset(palette.name,'icon-on-dark')} alt="spacelibre 官方轨道标志" /><span>LEO<span className="leopnt-pnt">PNT</span><span className="brand-dot">.</span><small>低轨卫星机会导航</small></span></Link>
      <div className="workspace-label">探索 LEOPNT <span>LEO</span></div>
      <nav aria-label="主导航">{navigation.map(({href,label,icon:Icon}) => <Link key={href} href={href} className={`nav-link ${pathname === href ? 'active' : ''}`} onClick={() => setOpen(false)}><Icon size={19}/><span>{label}</span>{pathname === href && <ChevronRight size={14}/>}</Link>)}</nav>
      <div className="sidebar-bottom"><div className="orbit-mini"><Orbit size={27}/><span>让每一步行动<br/>拥有更精准的坐标。</span></div><Link href="/technology" className="sidebar-help">了解导航未来 <ArrowUpRight size={15}/></Link><div className="system-state"><span className="status-dot"/> Starlink 专用 <span>v{version}</span></div></div>
    </aside>
    <div className="main-frame"><header className="topbar"><div className="breadcrumb"><button className="mobile-menu icon-button" aria-label={open ? '关闭菜单' : '打开菜单'} onClick={() => setOpen(!open)}>{open ? <X size={20}/> : <Menu size={20}/>}</button><span className="crumb-home">LEOPNT</span><ChevronRight size={13}/><strong>{current.label}</strong></div><div className="topbar-right"><PalettePicker/><span className="top-status"><span className="status-dot"/> {catalog?'Starlink 星历已载入':loading?'正在读取星历':'星历不可用'}</span><span className="divider"/><Link href="/docs" className="top-docs">接入指南 <ArrowUpRight size={14}/></Link><span className="avatar" title="Starlink 计算工作空间">L</span></div></header>
      <main id="main-content">{children}</main><footer className="workspace-footer"><div className="workspace-vi-mark"><img src="/brand/spacelibre-white.svg" alt="spacelibre 官方单色标志" width="240" height="54"/></div><span>© {new Date().getFullYear()} LEOPNT <span className="footer-sep">/</span> 探索信号之外的可能</span><span><Radio size={12}/> Starlink · 轨道几何计算</span></footer>
    </div>
  </div>;
}
