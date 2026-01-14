# frontend.dev

A modern Next.js application built with React 19, TypeScript, and Tailwind CSS v4.

## 🚀 Tech Stack

- **Framework**: [Next.js 16.1.1](https://nextjs.org/) with App Router
- **React**: 19.2.3 with React Compiler enabled
- **TypeScript**: 5.x with strict mode
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) (New York style)
- **State Management**: 
  - [Zustand](https://zustand-demo.pmnd.rs/) for global UI state
  - [TanStack Query](https://tanstack.com/query) for server state
- **Code Quality**: [Biome](https://biomejs.dev/) for linting and formatting
- **Git Hooks**: [Lefthook](https://github.com/evilmartians/lefthook) with [Commitlint](https://commitlint.js.org/)
- **Package Manager**: [Bun](https://bun.sh/)

## ✨ Features

- ⚡ Server Components by default for optimal performance
- 🎨 Modern UI with shadcn/ui components
- 🌙 Theme support with `next-themes`
- 📦 Optimized bundle size with code splitting
- 🔒 Type-safe environment variables with Zod validation
- 🧪 React Compiler for automatic optimizations
- 🎯 Path aliases for clean imports (`@/components`, `@/lib`, etc.)

## 📁 Project Structure

```
frontend.dev/
├── src/
│   ├── app/              # Next.js App Router pages and layouts
│   ├── components/       # React components
│   │   ├── common/      # Shared/common components
│   │   ├── core/        # Core providers and scripts
│   │   ├── layout/      # Layout components (header, footer)
│   │   └── ui/          # shadcn/ui components
│   ├── data/
│   │   ├── api/         # API utilities
│   │   └── stores/      # Zustand stores
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility functions
│   └── types/           # TypeScript type definitions
├── public/              # Static assets
└── ...config files
```

## 🛠️ Getting Started

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
# Copy .env.example to .env.local (if exists)
# Configure your environment variables
```

4. Run the development server:
```bash
bun dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📜 Available Scripts

- `bun dev` - Start the development server
- `bun build` - Build the application for production
- `bun start` - Start the production server
- `bun lint` - Run Biome linter
- `bun format` - Format code with Biome

## 🏗️ Development Guidelines

### Server vs Client Components

- **Default to Server Components** - Use `"use client"` sparingly
- **Client Components only when needed:**
  - Interactivity (onClick, onChange, etc.)
  - React hooks (useState, useEffect, etc.)
  - Browser APIs (localStorage, window, etc.)
  - Context providers that need client-side state

### Path Aliases

Use path aliases consistently:
- `@/components` for components
- `@/lib` for utilities
- `@/hooks` for custom hooks
- `@/types` for type definitions
- `@/data/stores` for Zustand stores
- `@/data/api` for API utilities

### Environment Variables

- Use environment variables from `@/lib/env` (validated with Zod)
- Never access `process.env` directly
- Always validate environment variables with Zod schemas

### Code Style

- Follow TypeScript strict mode guidelines
- Use Biome for formatting and linting
- Follow the project's component patterns (see `.cursor/rules/`)

## 🧪 Testing

Testing setup coming soon. The project is configured with Vitest (see `.cursor/rules/testing.mdc`).

## 📝 Commit Messages

This project uses [Conventional Commits](https://www.conventionalcommits.org/) with Commitlint. Commit messages are automatically validated via Lefthook.

## 🚢 Deployment

The easiest way to deploy is using [Vercel](https://vercel.com):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/zngiron/frontend.dev)

For more deployment options, see the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).

## 📄 License

This project is private and proprietary.

## 🤝 Contributing

This is a private project. Contributions are not currently accepted.

---

Built with ❤️ using Next.js and React
