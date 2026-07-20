import type { Metadata } from 'next';

import { Providers } from '@/components/core/providers';
import { Scripts } from '@/components/core/scripts';
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/constants';
import { display, mono, sans } from '@/lib/fonts';
import { cn } from '@/lib/utils';

import '@/app/globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [
      '/static/frontend-dev-thumbnail.png',
    ],
  },
  icons: {
    icon: [
      {
        url: '/static/frontend-dev-icon-light.svg',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/static/frontend-dev-icon-dark.svg',
        media: '(prefers-color-scheme: dark)',
      },
    ],
  },
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={cn(display.variable, sans.variable, mono.variable)} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
        <Scripts />
      </body>
    </html>
  );
}
