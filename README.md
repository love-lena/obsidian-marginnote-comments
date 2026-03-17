# MarginNote Comments

Bi-directional markdown comments for Obsidian using footnotes. Add, view, and manage inline comments from reading view and a sidebar panel.

## How it works

Comments are stored as standard markdown footnotes with a `[^cN]` prefix, so they're portable and readable in any markdown editor.

```markdown
This paragraph has a comment.[^c1]

[^c1]: @me - "This paragraph has a comment." — Needs more detail here
```

**Format:** `[^cN]: @author - "quoted text" — comment body`

## Features

- **Reading view** — hover over any block to add a comment via the 💬 button
- **Sidebar panel** — lists all comments, click to jump to the source, reply or delete
- **Threads** — adjacent markers `[^c1][^c2]` are grouped as a conversation
- **Settings** — default author, sidebar position, per-author colors
- **Commands** — "Show comments pane" and "Add comment" in the command palette

## Install

Copy `main.js`, `styles.css`, and `manifest.json` to your vault at `.obsidian/plugins/obsidian-marginnote-comments/`.

## AI agent integration

This plugin ships a [`comments.skill.md`](comments.skill.md) file that teaches AI agents how to read and write comments in the correct format. To use it, reference or copy the skill file into your agent's context (e.g., add a pointer in your vault's `CLAUDE.md`).

## Development

```bash
npm install
npm run dev    # watch mode
npm run build  # production build
npm test       # run parser tests
```
