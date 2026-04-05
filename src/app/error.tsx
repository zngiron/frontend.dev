'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';

export default function ErrorPage({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  // biome-ignore lint/correctness/useExhaustiveDependencies: re-toast whenever the error instance changes
  useEffect(() => {
    toast.error('Something went wrong. Please try again.');
  }, [error]);

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-semibold">Something Went Wrong</h1>
      <button
        type="button"
        onClick={unstable_retry}
        className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground transition-colors hover:bg-primary/80"
      >
        Try Again
      </button>
    </main>
  );
}
