import type { Metadata, Viewport } from 'next';

import { Geist, Geist_Mono } from 'next/font/google';

import { Providers } from '@/components/core/providers';
import { StructuredData } from '@/components/core/structured-data';
import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { SITE } from '@/lib/constants';
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
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#252525' },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
  title: {
    default: SITE.TITLE,
    template: `%s | ${SITE.TITLE}`,
  },
  description: SITE.DESCRIPTION,
  openGraph: {
    type: 'website',
    siteName: SITE.TITLE,
    title: SITE.TITLE,
    description: SITE.DESCRIPTION,
    images: [
      {
        url: '/static/frontend-dev-thumbnail.png',
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
  },
  icons: {
    icon: '/static/frontend-dev-icon.png',
    apple: '/static/frontend-dev-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: SITE.TITLE,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(sans.className, mono.className)}
    >
      <body className="flex flex-col min-h-dvh antialiased">
        <Providers>
          <Header />
          <main
            id="main"
            className="flex grow flex-col items-center justify-center"
          >
            {children}
          </main>
          <Footer />
        </Providers>
        <StructuredData />
      </body>
    </html>
  );
}
