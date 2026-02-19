import Link from 'next/link';

import { Button } from '@/components/ui/button';

import { cn } from '@/lib/utils';

export default function NotFound() {
  return (
    <div className={cn('flex flex-col items-center justify-center min-h-[50dvh] gap-4 px-6', 'text-center')}>
      <h1 className="text-2xl font-bold text-foreground">Page not found</h1>
      <p className={cn('max-w-md', 'text-muted-foreground')}>
        The page you are looking for does not exist or has been moved.
      </p>
      <Button asChild>
        <Link href="/">Go home</Link>
      </Button>
    </div>
  );
}
