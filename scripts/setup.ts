import {
  cancel,
  intro,
  multiselect,
  note,
  outro,
  spinner,
} from '@clack/prompts';

import { execSync } from 'node:child_process';
import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';

const SRC = join(process.cwd(), 'src');
const ENV_EXAMPLE = join(process.cwd(), '.env.example');

interface Integration {
  value: string;
  label: string;
  deps: string[];
  dirs: string[];
  envVars: string[];
}

const integrations: Integration[] = [
  {
    value: 'auth',
    label: 'Auth — Supabase',
    deps: ['@supabase/ssr', '@supabase/supabase-js'],
    dirs: ['lib/supabase'],
    envVars: [
      '',
      '# Auth (Supabase)',
      'NEXT_PUBLIC_SUPABASE_URL=',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY=',
      'SUPABASE_SERVICE_ROLE_KEY=',
    ],
  },
  {
    value: 'state',
    label: 'State Management — Zustand',
    deps: ['zustand'],
    dirs: ['stores'],
    envVars: [],
  },
  {
    value: 'forms',
    label: 'Forms — React Hook Form',
    deps: ['react-hook-form', '@hookform/resolvers'],
    dirs: ['lib/validators', 'components/forms'],
    envVars: [],
  },
  {
    value: 'payments-stripe',
    label: 'Payments — Stripe',
    deps: ['stripe'],
    dirs: ['lib/payments'],
    envVars: [
      '',
      '# Payments — Stripe',
      'STRIPE_SECRET_KEY=',
      'STRIPE_WEBHOOK_SECRET=',
      'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=',
    ],
  },
  {
    value: 'payments-paymongo',
    label: 'Payments — PayMongo',
    deps: ['paymongo-node'],
    dirs: ['lib/payments'],
    envVars: [
      '',
      '# Payments — PayMongo',
      'PAYMONGO_SECRET_KEY=',
      'PAYMONGO_PUBLIC_KEY=',
      'PAYMONGO_WEBHOOK_SECRET=',
    ],
  },
  {
    value: 'email',
    label: 'Email — Resend',
    deps: ['resend'],
    dirs: ['lib/email'],
    envVars: ['', '# Email (Resend)', 'RESEND_API_KEY=', 'RESEND_FROM_EMAIL='],
  },
  {
    value: 'analytics-vercel',
    label: 'Analytics — Vercel Analytics',
    deps: ['@vercel/analytics'],
    dirs: [],
    envVars: [],
  },
  {
    value: 'analytics-ga',
    label: 'Analytics — Google Analytics',
    deps: ['@next/third-parties'],
    dirs: [],
    envVars: ['', '# Analytics (GA4)', 'NEXT_PUBLIC_ANALYTICS_ID='],
  },
  {
    value: 'sentry',
    label: 'Error Monitoring — Sentry',
    deps: ['@sentry/nextjs'],
    dirs: [],
    envVars: [
      '',
      '# Sentry',
      'NEXT_PUBLIC_SENTRY_DSN=',
      'SENTRY_AUTH_TOKEN=',
      'SENTRY_ORG=',
      'SENTRY_PROJECT=',
    ],
  },
];

async function main() {
  intro('Front-End Development Framework — Project Setup');

  const selected = await multiselect({
    message: 'Select integrations to install:',
    options: integrations.map((i) => ({ value: i.value, label: i.label })),
    required: false,
  });

  if (typeof selected === 'symbol') {
    cancel('Setup cancelled.');
    process.exit(0);
  }

  if (selected.length === 0) {
    outro('No integrations selected. Run again when ready.');
    process.exit(0);
  }

  const chosen = integrations.filter((i) => selected.includes(i.value));

  const s = spinner();

  // Install dependencies
  const allDeps = chosen.flatMap((i) => i.deps);
  if (allDeps.length > 0) {
    s.start(`Installing ${allDeps.length} dependencies...`);
    execSync(`bun add ${allDeps.join(' ')}`, { stdio: 'pipe' });
    s.stop(`Installed ${allDeps.length} dependencies.`);
  }

  // Create directories
  const allDirs = chosen.flatMap((i) => i.dirs);
  for (const dir of allDirs) {
    const fullPath = join(SRC, dir);
    if (!existsSync(fullPath)) {
      mkdirSync(fullPath, { recursive: true });
      writeFileSync(join(fullPath, '.gitkeep'), '');
    }
  }

  // Append env vars
  const allEnvVars = chosen.flatMap((i) => i.envVars);
  if (allEnvVars.length > 0) {
    const existing = existsSync(ENV_EXAMPLE)
      ? readFileSync(ENV_EXAMPLE, 'utf8')
      : '';

    const newVars = allEnvVars.filter((line) => {
      if (line === '' || line.startsWith('#')) return true;
      const key = line.split('=')[0];

      return !existing.includes(key);
    });

    if (newVars.length > 0) {
      appendFileSync(ENV_EXAMPLE, `\n${newVars.join('\n')}\n`);
    }
  }

  // Summary
  const summary = chosen.map((i) => `  - ${i.label}`).join('\n');
  const dirSummary =
    allDirs.length > 0
      ? `\nDirectories created:\n${allDirs.map((d) => `  - src/${d}/`).join('\n')}`
      : '';

  note(`Installed:\n${summary}${dirSummary}`, 'Setup complete');

  outro(
    'Run the relevant integration doc in docs/integrations/ for implementation conventions.',
  );
}

main();
