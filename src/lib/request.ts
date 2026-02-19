import qs from 'qs';

import { env } from '@/lib/env';
import { logger } from '@/lib/logger';

export const RequestMethod = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH',
} as const;

export type RequestMethod = (typeof RequestMethod)[keyof typeof RequestMethod];

export const RequestEndpoint = {} as const;
export type RequestEndpoint = (typeof RequestEndpoint)[keyof typeof RequestEndpoint];

interface RequestParams {
  method: RequestMethod;
  endpoint: RequestEndpoint;
  params?: Record<string, unknown>;
}

export const request = async <T = unknown>({ method, endpoint, params }: RequestParams): Promise<T> => {
  if (!env.API_URL) {
    logger.error({ method, endpoint }, 'API_URL environment variable is not set');
    throw new Error('[Error]: API_URL environment variable is not set');
  }

  try {
    const url = new URL(endpoint, env.API_URL);
    const config: RequestInit = { method };

    if (params) {
      const isQueryMethod = method === RequestMethod.GET || method === RequestMethod.DELETE;

      if (isQueryMethod) {
        const queryString = qs.stringify(params, {
          arrayFormat: 'brackets',
          encodeValuesOnly: true,
        });

        if (queryString) {
          url.search = queryString;
        }
      } else {
        config.headers = { 'Content-Type': 'application/json' };
        config.body = JSON.stringify(params);
      }
    }

    const response = await fetch(url, config);

    if (!response.ok) {
      const message = logger.httpError({ endpoint, method }, response.status, response.statusText);
      throw new Error(message);
    }

    const data: T = await response.json();
    return data;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const formattedMessage = logger.error({ endpoint, method }, message);
    throw new Error(formattedMessage);
  }
};
