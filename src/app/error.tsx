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
  useEffect(() => {
    toast.error(error.message || 'Something went wrong. Please try again.');
  }, [error]);

  return (
    <div className="flex flex-col items-center gap-4">
      <h1 className="text-2xl font-semibold">Something Went Wrong</h1>
      <button
        type="button"
        onClick={unstable_retry}
        className="rounded-lg px-4 py-2 bg-primary text-sm text-primary-foreground transition-colors hover:bg-primary/80"
      >
        Try Again
      </button>
    </div>
  );
}
