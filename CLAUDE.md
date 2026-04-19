# Project Status & Guidelines (Joyopi)

## Build & Test Commands
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run verify`: Complete check (Lint + TSC + Tests) - **Run before reporting completion**
- `npx vitest`: Run unit tests
- `npx eslint`: Run linter

## Recent Major Updates (2026-04-19)
- **Profile Avatars**: Implemented Supabase Storage integration with client-side canvas resizing (300x300 WebP).
- **Infinite Scroll**: Replaced bulk fetching with native Intersection Observer-based pagination (10 items/page).
- **UI System Refactoring**:
  - Split `UserAvatar` and `UserNickname` into independent components.
  - Introduced `Identity Bar` layout for posts.
  - Implemented neon-colored (#e2ff00) Floating Action Button (FAB).
- **Type Consolidation**: Unified board data types in `app/actions/board.ts`.

## Tech Stack Notes
- **Next.js 15 (App Router)**: Always use `await` for params/searchParams.
- **Drizzle ORM**: Use relational queries (`db.query...`) for complex joins.
- **Supabase**: Auth for identity, Storage for avatars.

## Styling & Design
- **Theme**: Compact, professional GitHub-like aesthetic with neon accents.
- **Guidelines**: Follow `GEMINI.md` for all engineering tasks.
- **Type Safety**: No `any` allowed. Explicitly handle `null` for DB-derived fields.
