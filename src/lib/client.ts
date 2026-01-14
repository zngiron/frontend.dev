import { cache } from 'react';

import { isServer, QueryClient } from '@tanstack/react-query';

const getDefaultOptions = () => ({
  queries: {
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  },
});

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: getDefaultOptions(),
  });

const getServerQueryClient = cache(createQueryClient);

let browserQueryClient: QueryClient | undefined;

export const getQueryClient = () => {
  if (isServer) {
    return getServerQueryClient();
  }

  if (!browserQueryClient) {
    browserQueryClient = createQueryClient();
  }

  return browserQueryClient;
};
