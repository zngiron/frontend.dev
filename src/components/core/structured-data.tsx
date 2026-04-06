import { SITE } from '@/lib/constants';
import { env } from '@/lib/env';

export function StructuredData() {
  const baseUrl = env.NEXT_PUBLIC_SITE_URL;

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE.TITLE,
      url: baseUrl,
      description: SITE.DESCRIPTION,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: SITE.TITLE,
      url: baseUrl,
      logo: `${baseUrl}${SITE.LOGO}`,
    },
  ];

  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD requires dangerouslySetInnerHTML — no alternative API in React for script content
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
      }}
    />
  );
}
