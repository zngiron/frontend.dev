import Script from 'next/script';

import { GoogleAnalytics } from '@next/third-parties/google';

import { env } from '@/lib/env';

export function Scripts() {
  return (
    <>
      <GoogleAnalytics gaId={env.ANALYTICS_ID} />
      <Script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          url: env.SITE_URL,
          name: 'Front-End Development',
          description: 'Front-End Development',
          image: `${env.SITE_URL}/static/frontend-dev-thumbnail.png`,
        })}
      </Script>
    </>
  );
}
