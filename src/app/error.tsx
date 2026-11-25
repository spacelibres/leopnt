'use client';
export default function ErrorPage({ reset }: {reset:()=>void}) { return <div className="empty-page"><h1>页面遇到了一点问题</h1><p>请重新加载本地工作空间。</p><button className="button primary" onClick={reset}>重新尝试</button></div>; }
