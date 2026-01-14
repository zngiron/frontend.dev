import type { Metadata, Viewport } from 'next';

import { Geist, Geist_Mono } from 'next/font/google';

import { dehydrate } from '@tanstack/react-query';

import { Providers } from '@/components/core/providers';
import { Scripts } from '@/components/core/scripts';
import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';

import { getQueryClient } from '@/lib/client';
import { env } from '@/lib/env';
import { cn } from '@/lib/utils';

import '@/app/globals.css';

const sans = Geist({
  display: 'swap',
  variable: '--font-sans',
  weight: ['500', '700'],
  subsets: ['latin'],
});

const mono = Geist_Mono({
  display: 'swap',
  variable: '--font-mono',
  weight: ['500', '700'],
  subsets: ['latin'],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  metadataBase: new URL(env.SITE_URL),
  title: {
    default: 'Front-End Development',
    template: '%s | Front-End Development',
  },
  description: 'Front-End Development',
  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'Frontend Development',
    images: [
      {
        url: '/static/frontend-dev-thumbnail.png',
        width: 1200,
        height: 630,
        alt: 'Front-End Development',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
  },
  icons: {
    icon: '/static/frontend-dev-icon.png',
  },
};

function RootLayout({ children }: LayoutProps<'/'>) {
  const client = getQueryClient();
  const dehydratedState = dehydrate(client);

  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <body className={cn(sans.variable, mono.variable, 'flex flex-col min-h-dvh', 'font-sans antialiased')}>
        <Providers dehydratedState={dehydratedState}>
          <Header />
          <main className="grow">{children}</main>
          <Footer />
          <Scripts />
        </Providers>
      </body>
    </html>
  );
}

export default RootLayout;
