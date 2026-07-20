import Image from 'next/image';

import { SITE_NAME } from '@/lib/constants';

const LOGO_SIZE = 64;

export default function Home() {
  return (
    <main className="flex min-h-dvh items-center justify-center">
      <Image src="/static/frontend-dev-logo.svg" alt={SITE_NAME} width={LOGO_SIZE} height={LOGO_SIZE} priority />
    </main>
  );
}
