# GraphQL Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add typed GraphQL data fetching using `graphql-request`, `.graphql` operation files via `graphql-tag/loader`, and GraphQL Code Generator for type generation.

**Architecture:** Server-only GraphQL client in `lib/graphql/`, `.graphql` files in `data/graphql/`, codegen outputs a typed SDK to `data/graphql/__generated__/`. The `data/api/` layer wraps the SDK — consumers are unaffected. Setup script gains `devDeps` support and a GraphQL entry.

**Tech Stack:** `graphql`, `graphql-request`, `graphql-tag`, `@graphql-codegen/cli`, `@graphql-codegen/typescript`, `@graphql-codegen/typescript-operations`, `@graphql-codegen/typescript-graphql-request`

---

## File Structure

| Action | File | Responsibility |
|---|---|---|
| Modify | `.env.example` | Clean to installed vars only, add `API_URL` |
| Modify | `src/lib/env.ts` | Add `API_URL` to Zod schema |
| Create | `src/lib/graphql/client.ts` | Server-only `GraphQLClient` instance |
| Modify | `next.config.ts` | Add webpack rule for `graphql-tag/loader` |
| Create | `codegen.ts` | GraphQL Code Generator config |
| Modify | `package.json` | Add `codegen` script |
| Create | `src/data/graphql/.gitkeep` | Placeholder for `.graphql` operation files |
| Create | `src/data/graphql/__generated__/.gitkeep` | Placeholder for codegen output |
| Modify | `scripts/setup.ts` | Add `devDeps` support + GraphQL integration entry |
| Create | `docs/integrations/graphql.md` | Integration doc |
| Modify | `CLAUDE.md` | Add GraphQL to Tier 2 table |
| Modify | `docs/ARCHITECTURE.md` | Add `data/graphql/` and `lib/graphql/` directory rules |

---

### Task 1: Install runtime dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install packages**

```bash
bun add graphql graphql-request graphql-tag
```

- [ ] **Step 2: Verify installation**

```bash
bun pm ls | grep -E "graphql|graphql-request|graphql-tag"
```

Expected: all three packages listed with versions.

---

### Task 2: Install dev dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install codegen packages**

```bash
bun add -d @graphql-codegen/cli @graphql-codegen/typescript @graphql-codegen/typescript-operations @graphql-codegen/typescript-graphql-request
```

- [ ] **Step 2: Verify installation**

```bash
bunx graphql-codegen --version
```

Expected: version number printed.

- [ ] **Step 3: Commit**

```bash
git add package.json bun.lock
git commit -m "feat: add graphql and codegen dependencies"
```

---

### Task 3: Clean `.env.example` and add `API_URL` to env

**Files:**
- Modify: `.env.example`
- Modify: `src/lib/env.ts`

- [ ] **Step 1: Replace `.env.example`**

Replace the entire contents of `.env.example` with:

```
# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# GraphQL
API_URL=
```

All commented-out Tier 2 vars removed. They get appended by `bun run setup` when their integration is selected.

- [ ] **Step 2: Update `src/lib/env.ts`**

Replace the entire contents of `src/lib/env.ts` with:

```ts
import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.url().default('http://localhost:3000'),
  API_URL: z.url(),
});

export const env = envSchema.parse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  API_URL: process.env.API_URL,
});
```

- [ ] **Step 3: Verify typecheck**

```bash
bun run typecheck
```

Expected: passes (Zod schema is valid, `env.API_URL` is typed as `string`).

- [ ] **Step 4: Commit**

```bash
git add .env.example src/lib/env.ts
git commit -m "feat: clean env.example and add API_URL to env schema"
```

---

### Task 4: Create GraphQL client

**Files:**
- Create: `src/lib/graphql/client.ts`

- [ ] **Step 1: Create the directory**

```bash
mkdir -p src/lib/graphql
```

- [ ] **Step 2: Create `src/lib/graphql/client.ts`**

```ts
import { GraphQLClient } from 'graphql-request';

import { env } from '@/lib/env';

export const graphqlClient = new GraphQLClient(`${env.API_URL}/graphql`);
```

- [ ] **Step 3: Verify typecheck**

```bash
bun run typecheck
```

Expected: passes.

- [ ] **Step 4: Commit**

```bash
git add src/lib/graphql/client.ts
git commit -m "feat: add server-only GraphQL client"
```

---

### Task 5: Add webpack rule for `.graphql` files

**Files:**
- Modify: `next.config.ts`

- [ ] **Step 1: Update `next.config.ts`**

Replace the entire contents of `next.config.ts` with:

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactCompiler: true,
  webpack(config) {
    config.module.rules.push({
      test: /\.(graphql|gql)$/,
      exclude: /node_modules/,
      loader: 'graphql-tag/loader',
    });

    return config;
  },
};

export default nextConfig;
```

- [ ] **Step 2: Verify typecheck**

```bash
bun run typecheck
```

Expected: passes.

- [ ] **Step 3: Commit**

```bash
git add next.config.ts
git commit -m "feat: add graphql-tag/loader webpack rule"
```

---

### Task 6: Create codegen config and script

**Files:**
- Create: `codegen.ts`
- Modify: `package.json`
- Create: `src/data/graphql/.gitkeep`
- Create: `src/data/graphql/__generated__/.gitkeep`

- [ ] **Step 1: Create `codegen.ts` at project root**

```ts
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: `${process.env.API_URL}/graphql`,
  documents: 'src/data/graphql/**/*.graphql',
  generates: {
    'src/data/graphql/__generated__/graphql.ts': {
      plugins: [
        'typescript',
        'typescript-operations',
        'typescript-graphql-request',
      ],
    },
  },
};

export default config;
```

- [ ] **Step 2: Add codegen script to `package.json`**

Add to the `"scripts"` object in `package.json`:

```json
"codegen": "graphql-codegen --config codegen.ts"
```

Place it after the `"format"` script to keep scripts grouped logically.

- [ ] **Step 3: Create data/graphql directories**

```bash
mkdir -p src/data/graphql/__generated__
touch src/data/graphql/.gitkeep
touch src/data/graphql/__generated__/.gitkeep
```

- [ ] **Step 4: Verify typecheck**

```bash
bun run typecheck
```

Expected: passes.

- [ ] **Step 5: Commit**

```bash
git add codegen.ts package.json src/data/graphql/.gitkeep src/data/graphql/__generated__/.gitkeep
git commit -m "feat: add codegen config, script, and graphql directories"
```

---

### Task 7: Add `devDeps` support to setup script

**Files:**
- Modify: `scripts/setup.ts`

- [ ] **Step 1: Update the `Integration` interface**

In `scripts/setup.ts`, replace:

```ts
interface Integration {
  value: string;
  label: string;
  deps: string[];
  dirs: string[];
  envVars: string[];
}
```

with:

```ts
interface Integration {
  value: string;
  label: string;
  deps: string[];
  devDeps: string[];
  dirs: string[];
  envVars: string[];
}
```

- [ ] **Step 2: Add `devDeps: []` to every existing integration**

Add `devDeps: [],` after the `deps` line in each of the 9 existing integrations. For example, the `auth` entry becomes:

```ts
{
  value: 'auth',
  label: 'Auth — Supabase',
  deps: ['@supabase/ssr', '@supabase/supabase-js'],
  devDeps: [],
  dirs: ['lib/supabase'],
  envVars: [
    '',
    '# Auth (Supabase)',
    'NEXT_PUBLIC_SUPABASE_URL=',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY=',
    'SUPABASE_SERVICE_ROLE_KEY=',
  ],
},
```

Apply the same `devDeps: [],` addition to all 9 entries: `auth`, `state`, `forms`, `payments-stripe`, `payments-paymongo`, `email`, `analytics-vercel`, `analytics-ga`, `sentry`.

- [ ] **Step 3: Add the GraphQL integration entry**

Add this entry at the end of the `integrations` array (after the `sentry` entry):

```ts
{
  value: 'graphql',
  label: 'GraphQL — graphql-request + Codegen',
  deps: ['graphql', 'graphql-request', 'graphql-tag'],
  devDeps: [
    '@graphql-codegen/cli',
    '@graphql-codegen/typescript',
    '@graphql-codegen/typescript-operations',
    '@graphql-codegen/typescript-graphql-request',
  ],
  dirs: ['lib/graphql', 'data/graphql'],
  envVars: ['', '# GraphQL', 'API_URL='],
},
```

- [ ] **Step 4: Add dev dependency installation logic**

In the `main()` function, after the existing runtime dependency installation block:

```ts
// Install dependencies
const allDeps = chosen.flatMap((i) => i.deps);
if (allDeps.length > 0) {
  s.start(`Installing ${allDeps.length} dependencies...`);
  execSync(`bun add ${allDeps.join(' ')}`, { stdio: 'pipe' });
  s.stop(`Installed ${allDeps.length} dependencies.`);
}
```

Add this block immediately after it:

```ts
// Install dev dependencies
const allDevDeps = chosen.flatMap((i) => i.devDeps);
if (allDevDeps.length > 0) {
  s.start(`Installing ${allDevDeps.length} dev dependencies...`);
  execSync(`bun add -d ${allDevDeps.join(' ')}`, { stdio: 'pipe' });
  s.stop(`Installed ${allDevDeps.length} dev dependencies.`);
}
```

- [ ] **Step 5: Verify lint**

```bash
bun run lint
```

Expected: passes with no errors.

- [ ] **Step 6: Commit**

```bash
git add scripts/setup.ts
git commit -m "feat: add devDeps support and GraphQL entry to setup script"
```

---

### Task 8: Create integration doc

**Files:**
- Create: `docs/integrations/graphql.md`

- [ ] **Step 1: Create `docs/integrations/graphql.md`**

```markdown
# GraphQL

**Stack:** `graphql-request` + GraphQL Code Generator

---

## When To Use

**Use for:** typed GraphQL data fetching from any GraphQL API, server-side only.

**Don't use for:** REST APIs (use native `fetch` in `data/api/`), client-side data fetching (use Server Components).

## Dependencies

Runtime:

```bash
bun add graphql graphql-request graphql-tag
```

Dev (codegen):

```bash
bun add -d @graphql-codegen/cli @graphql-codegen/typescript @graphql-codegen/typescript-operations @graphql-codegen/typescript-graphql-request
```

Or use `bun run setup` and select "GraphQL".

## Env Variables

| Variable | Browser | Required |
|---|---|---|
| `API_URL` | No | Yes |

Server-only. GraphQL endpoint constructed as `${API_URL}/graphql`. Update `src/lib/env.ts`.

## File Placement

```
src/lib/graphql/
└── client.ts                  → GraphQLClient instance (server-only)

src/data/graphql/
├── posts.graphql              → Queries/mutations for posts domain
├── users.graphql              → Queries/mutations for users domain
└── __generated__/
    └── graphql.ts             → Codegen output: typed SDK + types

codegen.ts                     → GraphQL Code Generator config (project root)
```

## Conventions

- One `.graphql` file per domain in `data/graphql/`, mirroring `data/api/`.
- Run `bun run codegen` after schema changes or new `.graphql` operations.
- `__generated__/` is committed to git so CI/builds don't need schema access.
- `data/api/` files import the generated SDK and wrap it in `getX` functions. Consumers never import from `__generated__/` directly.
- `lib/graphql/client.ts` is the single GraphQL client instance. No direct instantiation elsewhere.
- Server-only. Never import `graphql-request` or the client in client components.

### Data layer pattern

```ts
// src/data/api/posts.ts
import { getSdk } from '@/data/graphql/__generated__/graphql';
import { graphqlClient } from '@/lib/graphql/client';

const sdk = getSdk(graphqlClient);

export async function getPosts() {
  const { posts } = await sdk.GetPosts();
  return posts;
}
```

Server Components consume via `import { getPosts } from '@/data/api/posts'` — unchanged.

### Adding a new domain

1. Create `src/data/graphql/[domain].graphql` with queries/mutations
2. Run `bun run codegen` to regenerate the SDK
3. Create `src/data/api/[domain].ts` importing `getSdk` and exporting `getX` functions

## References

- graphql-request: https://github.com/jasonkuhrt/graphql-request
- GraphQL Code Generator: https://the-guild.dev/graphql/codegen/docs/getting-started
- graphql-tag/loader: https://github.com/apollographql/graphql-tag#webpack-loading-and-preprocessing

## Verification

1. `API_URL` set in `.env.local` → `bun dev` starts without Zod validation errors
2. `bun run codegen` → `src/data/graphql/__generated__/graphql.ts` generated with types and `getSdk`
3. `data/api/` file imports SDK, calls a query → typed response returned
4. `bun run typecheck` passes with no errors
```

- [ ] **Step 2: Commit**

```bash
git add docs/integrations/graphql.md
git commit -m "docs: add GraphQL integration guide"
```

---

### Task 9: Update CLAUDE.md and ARCHITECTURE.md

**Files:**
- Modify: `CLAUDE.md`
- Modify: `docs/ARCHITECTURE.md`

- [ ] **Step 1: Add GraphQL to Tier 2 table in `CLAUDE.md`**

In `CLAUDE.md`, in the Tier 2 table, add this row after the "Testing" row:

```markdown
| GraphQL | `bun add graphql graphql-request graphql-tag` | @docs/integrations/graphql.md |
```

- [ ] **Step 2: Add `data/graphql/` to structure in `docs/ARCHITECTURE.md`**

In `docs/ARCHITECTURE.md`, in the Structure code block, add `graphql/` under the `data/` section. Replace:

```
├── data/
│   ├── api/                → Fetch functions + domain types (one file per domain)
│   └── static/             → Hard-coded app data (navigation, pricing, features)
```

with:

```
├── data/
│   ├── api/                → Fetch functions + domain types (one file per domain)
│   ├── graphql/            → .graphql operation files + __generated__/ codegen output
│   └── static/             → Hard-coded app data (navigation, pricing, features)
```

- [ ] **Step 3: Add `lib/graphql/` to structure in `docs/ARCHITECTURE.md`**

In the same Structure code block, add `graphql/` under the `lib/` section. Replace:

```
├── lib/
│   ├── supabase/           → client, server, middleware, admin
│   ├── payments/           → stripe, paymongo
│   ├── email/              → resend
│   ├── validators/         → Zod schemas per domain
│   ├── env.ts, utils.ts, constants.ts, types.ts
```

with:

```
├── lib/
│   ├── graphql/            → GraphQL client (server-only)
│   ├── supabase/           → client, server, middleware, admin
│   ├── payments/           → stripe, paymongo
│   ├── email/              → resend
│   ├── validators/         → Zod schemas per domain
│   ├── env.ts, utils.ts, constants.ts, types.ts
```

- [ ] **Step 4: Add directory rules in `docs/ARCHITECTURE.md`**

In the Directory Rules table, add these two rows after the `lib/validators/` row:

```markdown
| `data/graphql/` | `.graphql` operation files, one per domain. `__generated__/` contains codegen output (committed). |
| `lib/graphql/` | GraphQL client singleton. Server-only. No direct instantiation elsewhere. |
```

- [ ] **Step 5: Verify lint**

```bash
bun run lint
```

Expected: passes.

- [ ] **Step 6: Commit**

```bash
git add CLAUDE.md docs/ARCHITECTURE.md
git commit -m "docs: add GraphQL to Tier 2 table and architecture docs"
```

---

### Task 10: Final verification

- [ ] **Step 1: Full lint check**

```bash
bun run lint
```

Expected: no errors.

- [ ] **Step 2: Full typecheck**

```bash
bun run typecheck
```

Expected: no errors.

- [ ] **Step 3: Build**

```bash
bun run build
```

Expected: successful build with no errors.

- [ ] **Step 4: Verify `bun dev` starts**

```bash
bun dev
```

Visit `http://localhost:3000` — page loads normally. Stop the server.
