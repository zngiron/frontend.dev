import { z } from 'zod';

const schema = z.object({
  SITE_URL: z.url(),
  STORAGE_URL: z.url(),
  ANALYTICS_ID: z.string(),
  API_URL: z.url().optional(),
});

export const env = schema.parse({
  SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  STORAGE_URL: process.env.NEXT_PUBLIC_STORAGE_URL,
  ANALYTICS_ID: process.env.NEXT_PUBLIC_ANALYTICS_ID,
  API_URL: process.env.API_URL,
});
