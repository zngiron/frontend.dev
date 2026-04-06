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

Server-only. GraphQL endpoint constructed as `${API_URL}/graphql`. Add to `src/lib/env.ts`:

```ts
const envSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.url().default('http://localhost:3000'),
  API_URL: z.url(),
});

export const env = envSchema.parse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  API_URL: process.env.API_URL,
});
```

## File Placement

```
codegen.ts                     → GraphQL Code Generator config (project root)

src/lib/graphql/
└── client.ts                  → GraphQLClient instance (server-only)

src/data/graphql/
├── posts.graphql              → Queries/mutations for posts domain
├── users.graphql              → Queries/mutations for users domain
└── __generated__/
    └── graphql.ts             → Codegen output: typed SDK + types
```

## New Files

### `src/lib/graphql/client.ts`

```ts
import { GraphQLClient } from 'graphql-request';

import { env } from '@/lib/env';

export const graphqlClient = new GraphQLClient(`${env.API_URL}/graphql`);
```

Server-only. Never import in client components.

### `codegen.ts`

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

### `next.config.ts` modification

Add webpack rule for `.graphql` file imports:

```ts
webpack(config) {
  config.module.rules.push({
    test: /\.(graphql|gql)$/,
    exclude: /node_modules/,
    loader: 'graphql-tag/loader',
  });

  return config;
},
```

### `package.json` script

Add codegen script:

```json
"codegen": "graphql-codegen --config codegen.ts"
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
