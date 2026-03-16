import { CommentDefinition, CommentMarker, CommentThread, ParseResult } from "./types";

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

const INLINE_MARKER_RE = /\[\^c(\d+)\]/g;

export function parseMarkers(content: string): CommentMarker[] {
  const lines = content.split("\n");
  const markers: CommentMarker[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    // Skip definition lines: lines starting with [^cN]:
    if (/^\[\^c\d+\]:/.test(line)) continue;

    let match: RegExpExecArray | null;
    const re = new RegExp(INLINE_MARKER_RE.source, "g");
    while ((match = re.exec(line)) !== null) {
      markers.push({
        id: parseInt(match[1]!, 10),
        markerLine: i,
        markerOffset: match.index,
      });
    }
  }

  return markers;
}

export function groupThreads(
  markers: CommentMarker[],
  definitions: CommentDefinition[]
): { threads: CommentThread[] } {
  const defMap = new Map(definitions.map((d) => [d.id, d]));
  const threads: CommentThread[] = [];
  let i = 0;

  while (i < markers.length) {
    const threadMarkers: CommentMarker[] = [markers[i]!];

    // Check for adjacent markers: same line, no gap between end of one and start of next
    while (i + 1 < markers.length) {
      const current = markers[i]!;
      const next = markers[i + 1]!;
      const currentEnd = current.markerOffset + `[^c${current.id}]`.length;
      if (next.markerLine === current.markerLine && next.markerOffset === currentEnd) {
        threadMarkers.push(next);
        i++;
      } else {
        break;
      }
    }

    const comments = threadMarkers
      .map((m) => defMap.get(m.id))
      .filter((d): d is CommentDefinition => d !== undefined);

    threads.push({ markers: threadMarkers, comments });
    i++;
  }

  return { threads };
}

export function parseComments(content: string): ParseResult {
  const definitions = parseDefinitions(content);
  const markers = parseMarkers(content);
  const { threads } = groupThreads(markers, definitions);
  const maxId = definitions.reduce((max, d) => Math.max(max, d.id), 0);

  return {
    definitions,
    markers,
    threads,
    nextId: maxId + 1,
  };
}

/**
 * Remove a comment by ID from the markdown content.
 * Removes both the inline [^cN] marker and the [^cN]: definition line.
 * Does NOT touch regular footnotes or surrounding text.
 */
export function removeComment(content: string, commentId: number): string {
  // Remove inline marker [^cN] — but NOT definition lines [^cN]:
  const markerRe = new RegExp(`\\[\\^c${commentId}\\](?!:)`, "g");
  content = content.replace(markerRe, "");
  // Remove definition line (and its trailing newline if present)
  const defRe = new RegExp(`^\\[\\^c${commentId}\\]:.*\\n?`, "m");
  content = content.replace(defRe, "");
  return content;
}
