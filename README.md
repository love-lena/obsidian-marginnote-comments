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

1. Download `main.js`, `styles.css`, and `manifest.json` from the [latest release](https://github.com/love-lena/obsidian-marginnote-comments/releases)
2. Create the plugin folder in your vault:
   ```bash
   mkdir -p <vault>/.obsidian/plugins/obsidian-marginnote-comments
   ```
3. Copy the three files into that folder
4. Open Obsidian → Settings → Community plugins → Enable "MarginNote Comments"

**Optional — AI agent skill:** If you use Claude Code or another AI coding agent, install the comment skill so it knows how to read and write comments:

```bash
mkdir -p <vault>/.claude/skills/comments
curl -o <vault>/.claude/skills/comments/SKILL.md \
  https://raw.githubusercontent.com/love-lena/obsidian-marginnote-comments/main/comments.skill.md
```

## Development

```bash
npm install
npm run dev    # watch mode
npm run build  # production build
npm test       # run parser tests
```
