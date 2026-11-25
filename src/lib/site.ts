import type { Metadata } from 'next';

export const SITE_URL = 'https://leopnt.net';
export const SITE_DESCRIPTION = '认识低轨卫星如何连接下一代导航，探索厘米级定位的未来潜力、应用场景与实现路径，并亲眼看见在轨 Starlink 星座。';

export function pageMetadata(path: string, title?: string): Metadata {
  return {
    ...(title ? { title } : {}),
    alternates: { canonical: path },
    openGraph: {
      type: 'website', locale: 'zh_CN', siteName: 'LEOPNT', url: path,
      title: title ? `${title} | LEOPNT` : 'LEOPNT · 低轨卫星机会导航',
      description: SITE_DESCRIPTION,
    },
  };
}
