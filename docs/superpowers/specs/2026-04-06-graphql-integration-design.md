# GraphQL Integration

Adds typed GraphQL data fetching using `graphql-request`, `.graphql` operation files, and GraphQL Code Generator.

---

## 1. GraphQL Client

### Goal

Provide a server-only GraphQL client that all `data/api/` fetch functions use for reads. The endpoint is derived from a server-only `API_URL` env var with `/graphql` appended.

### New dependencies

- `graphql` — core library, peer dep for all GraphQL tooling
- `graphql-request` — lightweight GraphQL client
- `graphql-tag` — provides `graphql-tag/loader` for webpack `.graphql` file imports

### New files

**`src/lib/graphql/client.ts`** (server-only):

```ts
import { GraphQLClient } from 'graphql-request'
import { env } from '@/lib/env'

export const graphqlClient = new GraphQLClient(`${env.API_URL}/graphql`)
```

Single client instance. Server-only — never imported in client components. All `data/api/` files use this client through the generated SDK.

---

## 2. `.graphql` Operation Files

### Goal

Store GraphQL queries and mutations as `.graphql` files, one per domain, loaded via `graphql-tag/loader` through Next.js webpack config.

### File placement

```
src/data/graphql/
├── posts.graphql          → Queries/mutations for posts domain
├── users.graphql          → Queries/mutations for users domain
└── __generated__/         → Codegen output (committed)
    └── graphql.ts         → Typed SDK + all operation types
```

One `.graphql` file per domain, mirroring `data/api/`. Each file contains all queries and mutations for that domain.

### Modified files

**`next.config.ts`** — add webpack rule for `.graphql` files:

```ts
webpack(config) {
  config.module.rules.push({
    test: /\.(graphql|gql)$/,
    exclude: /node_modules/,
    loader: 'graphql-tag/loader',
  })
  return config
}
```

Enables direct `.graphql` imports outside of codegen when needed.

---

## 3. Type Generation

### Goal

Auto-generate TypeScript types and a typed SDK from the remote schema and `.graphql` operation files using GraphQL Code Generator.

### New dev dependencies

- `@graphql-codegen/cli` — codegen runner
- `@graphql-codegen/typescript` — generates base types from schema
- `@graphql-codegen/typescript-operations` — generates types for `.graphql` operations
- `@graphql-codegen/typescript-graphql-request` — generates a typed SDK for `graphql-request`

### New files

**`codegen.ts`** (project root):

```ts
import type { CodegenConfig } from '@graphql-codegen/cli'

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
}

export default config
```

- Schema introspected from the live `API_URL` endpoint
- Documents sourced from all `.graphql` files in `data/graphql/`
- Single output file with base types, operation types, and a `getSdk` function
- `__generated__/` committed to git so CI/builds don't need schema access

### Modified files

**`package.json`** — add codegen script:

```json
"codegen": "graphql-codegen --config codegen.ts"
```

Run `bun run codegen` after schema changes or new `.graphql` operations.

---

## 4. Data Layer Usage

### Goal

Keep `data/api/` as the public interface for Server Components. GraphQL is an implementation detail behind the existing `getX` pattern.

### Pattern

```ts
// src/data/api/posts.ts
import { getSdk } from '@/data/graphql/__generated__/graphql'
import { graphqlClient } from '@/lib/graphql/client'

const sdk = getSdk(graphqlClient)

export async function getPosts() {
  const { posts } = await sdk.GetPosts()
  return posts
}
```

- Server Components still do `import { getPosts } from '@/data/api/posts'` — no change to consumers
- Domain types come from codegen output, re-exported from `data/api/` if needed externally
- `data/api/` files remain the boundary. No component imports from `__generated__/` directly.

---

## 5. Environment Variables

### New variable

| Variable | Browser | Required |
|---|---|---|
| `API_URL` | No | Yes |

Server-only. GraphQL endpoint constructed as `${API_URL}/graphql`.

### Modified files

**`src/lib/env.ts`** — add `API_URL` to Zod schema:

```ts
const envSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.url().default('http://localhost:3000'),
  API_URL: z.url(),
})

export const env = envSchema.parse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  API_URL: process.env.API_URL,
})
```

**`.env.example`** — cleaned to only installed vars:

```
NEXT_PUBLIC_SITE_URL=http://localhost:3000
API_URL=
```

All commented-out Tier 2 vars removed. They appear when their integration is added.

---

## 6. Setup Script

### Goal

Add GraphQL as a selectable integration in `bun run setup` so it installs deps, creates directories, and appends env vars like every other Tier 2 integration.

### Modified files

**`scripts/setup.ts`** — add GraphQL entry to the `integrations` array:

```ts
{
  value: 'graphql',
  label: 'GraphQL — graphql-request + Codegen',
  deps: ['graphql', 'graphql-request', 'graphql-tag'],
  devDeps: ['@graphql-codegen/cli', '@graphql-codegen/typescript', '@graphql-codegen/typescript-operations', '@graphql-codegen/typescript-graphql-request'],
  dirs: ['lib/graphql', 'data/graphql'],
  envVars: ['', '# GraphQL', 'API_URL='],
}
```

Note: the setup script currently only handles `deps` (runtime). The script needs a small update to also support a `devDeps` field that installs with `bun add -d`. This is a targeted structural fix to the setup script, not a refactor.

---

## 7. Documentation Updates

### New files

**`docs/integrations/graphql.md`** — integration doc following existing format (When To Use, Dependencies, Env Variables, File Placement, Conventions, References, Verification).

### Modified files

**`CLAUDE.md`** — add GraphQL to Tier 2 table:

| Need | Install | Guide |
|---|---|---|
| GraphQL | `bun add graphql graphql-request graphql-tag` | `docs/integrations/graphql.md` |

**`docs/ARCHITECTURE.md`** — add to directory rules:

| Directory | Rule |
|---|---|
| `data/graphql/` | `.graphql` operation files, one per domain. `__generated__/` contains codegen output. |
| `lib/graphql/` | GraphQL client singleton. Server-only. No direct instantiation elsewhere. |

---

## Files summary

| Action | File |
|---|---|
| Create | `src/lib/graphql/client.ts` |
| Create | `codegen.ts` |
| Create | `src/data/graphql/__generated__/` (via codegen) |
| Create | `docs/integrations/graphql.md` |
| Modify | `next.config.ts` |
| Modify | `package.json` |
| Modify | `src/lib/env.ts` |
| Modify | `.env.example` |
| Modify | `scripts/setup.ts` |
| Modify | `CLAUDE.md` |
| Modify | `docs/ARCHITECTURE.md` |

## Dependencies summary

| Package | Type | Purpose |
|---|---|---|
| `graphql` | Runtime | Core GraphQL library |
| `graphql-request` | Runtime | Lightweight GraphQL client |
| `graphql-tag` | Runtime | `graphql-tag/loader` for `.graphql` webpack imports |
| `@graphql-codegen/cli` | Dev | Codegen runner |
| `@graphql-codegen/typescript` | Dev | Base type generation from schema |
| `@graphql-codegen/typescript-operations` | Dev | Operation type generation from `.graphql` files |
| `@graphql-codegen/typescript-graphql-request` | Dev | Typed SDK generation for `graphql-request` |

## Verification

1. **Env:** `API_URL` set in `.env.local` → `bun dev` starts without Zod validation errors.
2. **Codegen:** `bun run codegen` → `src/data/graphql/__generated__/graphql.ts` generated with types and `getSdk`.
3. **Client:** `data/api/` file imports SDK, calls a query → typed response returned.
4. **Webpack:** `.graphql` file importable directly in TypeScript without errors.
5. **Typecheck:** `bun run typecheck` passes with no errors.
