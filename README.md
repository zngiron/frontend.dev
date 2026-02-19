# frontend.dev

A modern Next.js starter template built with React 19, TypeScript, and Tailwind CSS v4.

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) with App Router
- **React**: 19 with React Compiler enabled
- **TypeScript**: 5.x with strict mode
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) (OKLCH color system)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) (New York style)
- **State Management**:
  - [Zustand](https://zustand-demo.pmnd.rs/) for global UI state
  - [TanStack Query](https://tanstack.com/query) for server state
- **Animation**: [motion/react](https://motion.dev/)
- **Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) (install on demand)
- **Toasts**: [Sonner](https://sonner.emilkowal.dev/)
- **Code Quality**: [Biome](https://biomejs.dev/) for linting and formatting
- **Git Hooks**: [Lefthook](https://github.com/evilmartians/lefthook) with [Commitlint](https://commitlint.js.org/)
- **Testing**: [Playwright](https://playwright.dev/) + [axe-core](https://github.com/dequelabs/axe-core) (install on demand)
- **Package Manager**: [Bun](https://bun.sh/)

## Project Structure

```
src/
├── app/              # Next.js App Router (pages, layouts, loading, error)
├── components/
│   ├── common/       # Shared reusable components
│   ├── core/         # Providers, scripts, error boundaries
│   ├── layout/       # Header, footer, sidebar, navigation
│   └── ui/           # shadcn/ui (never modify directly)
├── data/
│   ├── api/          # API functions + domain types per domain
│   └── stores/       # Zustand stores per domain
├── hooks/            # Custom hooks + React Query hooks
└── lib/              # Utilities (client, env, logger, request, utils)
```

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (recommended) or Node.js 20+
- Git

### Installation

1. Clone the repository:

```bash
git clone https://github.com/zngiron/frontend.dev.git
cd frontend.dev
```

2. Install dependencies:

```bash
bun install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
```

4. Run the development server:

```bash
bun dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `bun dev` — Start the development server
- `bun build` — Build the application for production
- `bun start` — Start the production server
- `bun lint` — Run Biome linter
- `bun format` — Format code with Biome

## Development Guidelines

All coding conventions are defined in `.cursor/rules/` and enforced by the agent skills in `.cursor/skills/`. Key principles:

- **Server Components by default** — add `'use client'` only for interactivity, hooks, or browser APIs
- **Path aliases** — always use `@/` imports (`@/components`, `@/lib`, `@/hooks`, `@/data`)
- **Environment variables** — access exclusively through `@/lib/env` (Zod-validated)
- **Types co-located** — domain types in `@/data/api/`, component props in the component file
- **Semantic tokens** — use Tailwind semantic colors (`bg-background`, `text-foreground`), never hardcoded values
- **Accessibility** — target WCAG 2.1 AAA compliance

## Commit Messages

This project uses [Conventional Commits](https://www.conventionalcommits.org/) with Commitlint. Commit messages are automatically validated via Lefthook git hooks.

## Deployment

The easiest way to deploy is using [Vercel](https://vercel.com):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/zngiron/frontend.dev)

For more deployment options, see the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).

## License

This project is private and proprietary.
