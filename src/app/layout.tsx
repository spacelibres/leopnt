import type { Metadata } from 'next';
import { Shell } from '@/components/shell';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'leopnt · 低轨卫星机会导航', template: '%s | leopnt' },
  description: '探索低轨星座的导航潜力。三维轨道可视化、卫星机会窗口分析与本地演示 API。',
  icons: { icon: '/icon.svg' },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="zh-CN"><body><Shell>{children}</Shell></body></html>;
}
