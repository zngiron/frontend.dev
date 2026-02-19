'use client';

import type { DehydratedState } from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';

import { HydrationBoundary, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';

import { getQueryClient } from '@/lib/client';

interface ProvidersProps extends PropsWithChildren {
  dehydratedState?: DehydratedState;
}

export function Providers({ children, dehydratedState }: ProvidersProps) {
  const client = getQueryClient();

  return (
    <ThemeProvider attribute="class">
      <QueryClientProvider client={client}>
        <HydrationBoundary state={dehydratedState}>{children}</HydrationBoundary>
        <Toaster
          richColors
          closeButton
        />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
