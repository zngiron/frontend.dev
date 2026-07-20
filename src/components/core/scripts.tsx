import { GoogleAnalytics } from '@next/third-parties/google';

import { GOOGLE_ANALYTICS_ID, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/constants';

const schema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  url: SITE_URL,
  name: SITE_NAME,
  description: SITE_DESCRIPTION,
};

export function Scripts() {
  return (
    <>
      <script type="application/ld+json">{JSON.stringify(schema).replace(/</g, '\\u003c')}</script>
      {GOOGLE_ANALYTICS_ID && <GoogleAnalytics gaId={GOOGLE_ANALYTICS_ID} />}
    </>
  );
}
