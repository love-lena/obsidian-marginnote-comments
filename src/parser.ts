import { CommentDefinition } from "./types";

const DEFINITION_RE = /^\[\^c(\d+)\]:\s*(.+)$/;
const FULL_FORMAT_RE = /^(@\w+)\s*-\s*"([^"]+)"\s*—\s*(.+)$/;
const AUTHOR_BODY_RE = /^(@\w+)\s*-\s*(.+)$/;
const QUOTE_BODY_RE = /^"([^"]+)"\s*—\s*(.+)$/;

export function parseDefinitions(content: string): CommentDefinition[] {
  const lines = content.split("\n");
  const definitions: CommentDefinition[] = [];

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i]!.match(DEFINITION_RE);
    if (!match) continue;

    const id = parseInt(match[1]!, 10);
    const rest = match[2]!.trim();

    let author: string | null = null;
    let quote: string | null = null;
    let body: string = rest;

    const fullMatch = rest.match(FULL_FORMAT_RE);
    if (fullMatch) {
      author = fullMatch[1]!;
      quote = fullMatch[2]!;
      body = fullMatch[3]!;
    } else {
      const authorMatch = rest.match(AUTHOR_BODY_RE);
      if (authorMatch) {
        author = authorMatch[1]!;
        body = authorMatch[2]!;
      } else {
        const quoteMatch = rest.match(QUOTE_BODY_RE);
        if (quoteMatch) {
          quote = quoteMatch[1]!;
          body = quoteMatch[2]!;
        }
      }
    }

    definitions.push({ id, author, quote, body, definitionLine: i });
  }

  return definitions;
}
