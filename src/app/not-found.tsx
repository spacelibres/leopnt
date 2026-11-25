import Link from 'next/link';
export default function NotFound() { return <div className="empty-page"><span className="eyebrow">404 / OUT OF ORBIT</span><h1>这个页面暂未入轨</h1><p>返回工作空间，继续探索低轨导航的可能。</p><Link className="button primary" href="/">返回总览 →</Link></div>; }
