# MarginNote Comments — Developer Guide

Obsidian plugin for bi-directional markdown comments using footnotes.

## Commands

```bash
npm install          # install dependencies
npm run dev          # watch mode
npm run build        # production build (tsc + esbuild)
npm test             # run parser tests (vitest)
npm run lint         # type-check (tsc --noEmit)
```

## Architecture

```
src/
  main.ts           # Plugin entry — registers views, commands, settings
  parser.ts         # Pure comment parser — no Obsidian deps, fully tested
  reading-view.ts   # MarkdownPostProcessor — hover buttons + inline comment input
  sidebar-view.ts   # ItemView — comment list, delete, reply, jump-to
  settings.ts       # PluginSettingTab — author, colors, sidebar position
  types.ts          # Shared types and DEFAULT_SETTINGS
tests/
  parser.test.ts    # Unit tests for the parser (vitest)
```

## Key patterns

- All comment data lives in standard markdown footnotes (`[^cN]`). No separate data store.
- File mutations use `vault.process()` for atomic read-modify-write.
- The sidebar caches `lastKnownFile` because clicking the sidebar steals focus from the markdown view.
- Async `refresh()` uses a generation counter to prevent stale renders from doubling content.

## Safety rules

- **Never modify regular footnotes** — only `[^cN]` prefixed markers and definitions.
- **Never delete whole files** automatically.
- **Delete operations** remove only the targeted `[^cN]` marker and its definition line.
- **IDs are never renumbered** — new comments always use `nextId` (max existing + 1).
