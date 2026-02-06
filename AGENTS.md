# AGENTS.md

## Project Overview

BoothHunter — Tauri 2 desktop app for searching and managing VRChat items from Booth.pm.

- **Frontend**: React 19 · TypeScript 5.9 · Vite 7 · Tailwind CSS 4 · TanStack React Query
- **Backend**: Rust (Tauri 2.9.5) · SQLite (rusqlite, WAL mode) · Tokio
- **Routing**: React Router DOM 7
- **Icons**: Lucide React

## Architecture

```mermaid
flowchart LR
    A[React Frontend] -->|fetch via Tauri HTTP plugin| B[Booth.pm]
    B -->|HTML / JSON| A
    A -->|DOMParser| C[booth-parser.ts]
    A -->|invoke IPC| D[Rust Commands]
    D -->|rusqlite| E[SQLite DB]
```

**Data flow**: The frontend fetches Booth.pm directly (bypassing CORS via Tauri's HTTP plugin), parses HTML/JSON in the browser, then persists data to SQLite through Tauri IPC commands.

## Project Structure

- `src/pages/` — route-level page components
- `src/components/{domain}/` — feature-grouped components (search, favorites, layout, common)
- `src/hooks/` — custom hooks wrapping TanStack Query
- `src/lib/` — API layer, types, parsers, constants, utilities
- `src-tauri/src/commands/` — Rust IPC command handlers (db, collections, stats)
- `src-tauri/src/database.rs` — SQLite schema, migrations, seed data

## Commands

### Frontend

- `npm run dev` — start Vite dev server (port 1420)
- `npm run build` — type-check (`tsc`) + production build (`vite build`)
- `npm run preview` — preview production build
- `npm run lint` — run ESLint on the project
- `npm run lint:fix` — run ESLint with auto-fix
- `npm run format` — format all files with Prettier
- `npm run format:check` — check formatting without writing

### Tauri

- `npm run tauri dev` — launch full desktop app in dev mode
- `npm run tauri build` — build distributable desktop app

### Rust (run from `src-tauri/`)

- `cargo fmt` — format Rust code
- `cargo clippy` — lint Rust code
- `cargo check` — type-check Rust code

## After Completing Code Changes

### Frontend changes

1. `npx tsc` — ensure no type errors
2. `npm run lint` — ensure no lint errors
3. `npm run format:check` — ensure consistent formatting
4. `npm run build` — ensure production build succeeds

### Rust changes (run from `src-tauri/`)

1. `cargo fmt` — format code
2. `cargo clippy` — ensure no lint warnings
3. `cargo check` — ensure compilation succeeds

## Git Commits

Never commit unless the user explicitly says to commit. Use conventional commit format.
