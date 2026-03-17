# MarginNote Comments — Agent Skill

Use this skill to read and write inline comments in Obsidian markdown files. Comments are stored as footnotes with a `[^cN]` prefix and rendered by the MarginNote Comments plugin.

## Comment format

A comment has two parts: an **inline marker** and a **definition**.

**Inline marker** — placed at the end of the paragraph being commented on:

```
This paragraph needs work.[^c1]
```

**Definition** — placed at the bottom of the file:

```
[^c1]: @me - "This paragraph needs work." — Can we add supporting evidence?
```

### Definition format

```
[^cN]: @author - "quoted text" — comment body
```

All parts except the comment body are optional:

| Format | Example |
|--------|---------|
| Full | `[^c1]: @claude - "paragraph text" — Your comment` |
| No quote | `[^c1]: @claude - Your comment` |
| No author | `[^c1]: "paragraph text" — Your comment` |
| Body only | `[^c1]: Your comment` |

## How to add a comment

1. **Find the next available ID.** Scan the file for all `[^cN]` patterns. Pick the next integer after the highest N found. If no comments exist, start at 1.

2. **Add the inline marker.** Append `[^cN]` to the end of the last line of the paragraph you're commenting on. Do NOT put a space before it.

3. **Add the definition.** Append a new line at the end of the file:
   ```
   [^cN]: @yourname - "first ~50 chars of paragraph" — Your comment here
   ```

### Example

Before:
```markdown
The results were inconclusive.
```

After adding comment c1:
```markdown
The results were inconclusive.[^c1]

[^c1]: @claude - "The results were inconclusive." — Should we include the confidence intervals?
```

## How to reply to a comment

Replies are **adjacent markers** — place the new marker immediately after the last marker in the thread (no space between them).

Before:
```markdown
The results were inconclusive.[^c1]

[^c1]: @me - "The results were inconclusive." — Add confidence intervals
```

After replying:
```markdown
The results were inconclusive.[^c1][^c2]

[^c1]: @me - "The results were inconclusive." — Add confidence intervals
[^c2]: @claude - "The results were inconclusive." — Done, added 95% CI to Table 2
```

## How to delete a comment

1. Remove the `[^cN]` marker from the paragraph (do NOT remove surrounding text)
2. Remove the entire `[^cN]: ...` definition line

## Rules

- **Never modify regular footnotes.** Only touch `[^cN]` patterns (lowercase c followed by a number). Leave `[^1]`, `[^note]`, etc. untouched.
- **IDs must be unique** within a file. Always scan for the highest existing ID first.
- **No spaces between threaded markers.** `[^c1][^c2]` is a thread. `[^c1] [^c2]` is two separate comments.
- **Definitions go at the end of the file**, one per line.
- **Don't renumber existing comments.** Other markers reference these IDs.
