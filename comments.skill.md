---
name: writing-marginnote-comments
description: Use when reading or editing markdown files that use the MarginNote Comments plugin, or when asked to leave inline comments, review feedback, or suggestions on a document
---

# MarginNote Comments

## Overview

Add inline comments to Obsidian markdown files using footnotes with a `[^cN]` prefix. Comments are rendered by the MarginNote Comments plugin in a sidebar panel.

## When to Use

- Leaving review feedback, suggestions, or questions on a markdown document
- Replying to existing `[^cN]` comments in a file
- Removing resolved comments
- Any time you see `[^cN]` markers in a markdown file — this is the comment format

**When NOT to use:**
- Regular footnotes (`[^1]`, `[^note]`) — those are content, not comments
- Files that don't use this plugin — use whatever comment convention the project specifies

## Quick Reference

### Format

```
[^cN]: @author - "quoted text" — comment body
```

| Format | Example |
|--------|---------|
| Full | `[^c1]: @claude - "paragraph text" — Your comment` |
| No quote | `[^c1]: @claude - Your comment` |
| No author | `[^c1]: "paragraph text" — Your comment` |
| Body only | `[^c1]: Your comment` |

### Adding a comment

1. Scan file for all `[^cN]` — pick next integer after highest N (start at 1 if none)
2. Append `[^cN]` to end of the paragraph's last line (no space before it)
3. Append definition at end of file: `[^cN]: @yourname - "first ~50 chars" — Comment`

```markdown
The results were inconclusive.[^c1]

[^c1]: @claude - "The results were inconclusive." — Should we include the confidence intervals?
```

### Replying

Place new marker immediately adjacent to the last marker (no space):

```markdown
The results were inconclusive.[^c1][^c2]

[^c1]: @me - "The results were inconclusive." — Add confidence intervals
[^c2]: @claude - "The results were inconclusive." — Done, added 95% CI to Table 2
```

### Deleting

1. Remove `[^cN]` marker from the paragraph (keep surrounding text intact)
2. Remove the `[^cN]: ...` definition line

## Rules

- **Never modify regular footnotes.** Only touch `[^cN]` (lowercase c + number). Leave `[^1]`, `[^note]`, etc. untouched.
- **IDs must be unique** within a file. Always scan for highest existing ID first.
- **No spaces between threaded markers.** `[^c1][^c2]` = thread. `[^c1] [^c2]` = two separate comments.
- **Definitions go at the end of the file**, one per line.
- **Don't renumber existing comments.** Other markers reference these IDs.

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Space before marker: `text. [^c1]` | No space: `text.[^c1]` |
| Using regular footnote: `[^1]` | Use comment prefix: `[^c1]` |
| Hardcoding ID without scanning | Always find max existing ID first |
| Space between thread markers: `[^c1] [^c2]` | Adjacent: `[^c1][^c2]` |
| Modifying a regular footnote `[^1]:` | Only touch `[^cN]:` definitions |
| Putting definition mid-file | Definitions always at end of file |
