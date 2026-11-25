import type { Metadata } from 'next';
import { Shell } from '@/components/shell';
import {CatalogProvider} from '@/components/catalog-provider';
import './globals.css';
import './starlink.css';

export const metadata: Metadata = {
  title: { default: 'LEOPNT · 低轨卫星机会导航', template: '%s | LEOPNT' },
  description: '使用真实 Starlink GP/TLE 星历、SGP4 传播和 WGS84 观测模型，分析可见窗口、几何多普勒与多星几何条件。',
  icons: { icon: '/icon.svg' },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="zh-CN"><body><CatalogProvider><Shell>{children}</Shell></CatalogProvider></body></html>;
}
