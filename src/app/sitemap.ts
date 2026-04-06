import type { MetadataRoute } from 'next';

import { env } from '@/lib/env';
import { readdir, stat } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

const APP_DIR = join(process.cwd(), 'src', 'app');

const EXCLUDED_SEGMENTS = new Set(['api', 'error', 'not-found', 'loading']);

function isExcluded(segments: string[]): boolean {
  return segments.some((s) => EXCLUDED_SEGMENTS.has(s));
}

function stripRouteGroups(urlPath: string): string {
  return urlPath.replace(/\([^)]+\)\//g, '');
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = await readdir(APP_DIR, {
    recursive: true,
    withFileTypes: true,
  });

  const pages = entries.filter(
    (entry) => entry.isFile() && entry.name === 'page.tsx',
  );

  const routes: MetadataRoute.Sitemap = [];

  for (const page of pages) {
    const dir = page.parentPath;
    const relDir = relative(APP_DIR, dir);
    const segments = relDir ? relDir.split(sep) : [];

    if (isExcluded(segments)) continue;
    if (segments.some((s) => s.startsWith('['))) continue;

    const rawPath = segments.length === 0 ? '/' : `/${segments.join('/')}/`;
    const urlPath = stripRouteGroups(rawPath);
    const filePath = join(dir, page.name);
    const fileStat = await stat(filePath);

    routes.push({
      url: `${env.NEXT_PUBLIC_SITE_URL}${urlPath === '/' ? '' : urlPath}`,
      lastModified: fileStat.mtime,
      changeFrequency: 'weekly',
      priority: urlPath === '/' ? 1.0 : 0.7,
    });
  }

  return routes;
}
