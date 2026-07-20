import { Geist, Geist_Mono } from 'next/font/google';

export const display = Geist({
  display: 'swap',
  subsets: [
    'latin',
  ],
  variable: '--font-display',
});

export const sans = Geist({
  display: 'swap',
  subsets: [
    'latin',
  ],
  variable: '--font-sans',
});

export const mono = Geist_Mono({
  display: 'swap',
  subsets: [
    'latin',
  ],
  variable: '--font-mono',
});
