# Front-End Development Framework

AI-guarded front-end development framework built on Next.js 16, Tailwind CSS 4, and TypeScript.

---

## Quick Start

```bash
# 1. Clone the repository
git clone <repo-url> && cd frontend.dev

# 2. Install dependencies and configure environment
bun setup

# 3. Start the development server
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Stack

| Technology    | Purpose                        |
| ------------- | ------------------------------ |
| Next.js 16    | App framework (App Router)     |
| TypeScript    | Type safety                    |
| Tailwind CSS 4| Utility-first styling          |
| Biome         | Linting and formatting         |
| shadcn/ui     | Accessible UI components       |
| Zod           | Schema validation              |
| Sonner        | Toast notifications            |

---

## Project Structure

```
.
├── src/          # Application source code
├── docs/         # Architecture, conventions, and design docs
├── tests/        # Unit and integration tests
└── scripts/      # Developer automation scripts
```

---

## Documentation

| Document                     | Description                          |
| ---------------------------- | ------------------------------------ |
| `docs/ARCHITECTURE.md`       | System design and layer boundaries   |
| `docs/CONVENTIONS.md`        | Coding standards and naming rules    |
| `docs/DECISIONS.md`          | Architectural decision records       |
| `docs/DESIGN.md`             | UI/UX guidelines and design tokens   |

11 topic-specific guides are available in `docs/guides/`.

---

## Scripts

| Command          | Description                              |
| ---------------- | ---------------------------------------- |
| `bun dev`        | Start the development server             |
| `bun build`      | Build for production                     |
| `bun start`      | Start the production server              |
| `bun lint`       | Run Biome linter                         |
| `bun format`     | Format source files with Biome           |
| `bun typecheck`  | Run TypeScript type checking             |
| `bun test`       | Run unit and integration tests           |
| `bun test:watch` | Run tests in watch mode                  |
| `bun test:e2e`   | Run end-to-end tests                     |
| `bun setup`      | Install dependencies and configure env   |

---

## License

MIT
