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

## Install from release

1. Download `main.js`, `styles.css`, and `manifest.json` from the [latest release](https://github.com/love-lena/obsidian-marginnote-comments/releases)
2. Create the plugin folder in your vault:
   ```bash
   mkdir -p <vault>/.obsidian/plugins/obsidian-marginnote-comments
   ```
3. Copy the three files into that folder
4. Open Obsidian → Settings → Community plugins → Enable "MarginNote Comments"

## Install from source

```bash
git clone https://github.com/love-lena/obsidian-marginnote-comments.git
cd obsidian-marginnote-comments
npm install
npm run build
```

Then symlink into your vault:

```bash
ln -s "$(pwd)" <vault>/.obsidian/plugins/obsidian-marginnote-comments
```

Enable the plugin in Obsidian → Settings → Community plugins.

## AI agent skill (optional)

This plugin ships a [`comments.skill.md`](comments.skill.md) that teaches AI agents how to read and write comments in the correct format. To install it for Claude Code:

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
npm run lint   # type-check
```
