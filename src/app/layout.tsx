import type { Metadata } from 'next';
import { Shell } from '@/components/shell';
import {CatalogProvider} from '@/components/catalog-provider';
import {SITE_URL,SITE_DESCRIPTION} from '@/lib/site';
import './globals.css';
import './starlink.css';
import './public-home.css';
import './vi.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'LEOPNT · 低轨卫星机会导航', template: '%s | LEOPNT' },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: 'website', locale: 'zh_CN', siteName: 'LEOPNT',
    title: 'LEOPNT · 低轨卫星机会导航',
    description: '认识低轨导航，探索厘米级定位的未来与应用。',
  },
  icons: { icon: '/icon.svg' },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="zh-CN"><body><CatalogProvider><Shell>{children}</Shell></CatalogProvider></body></html>;
}
