export interface CommentDefinition {
  /** The N in [^cN] */
  id: number;
  /** Parsed @handle, or null if not present */
  author: string | null;
  /** Parsed "quoted text", or null if not present */
  quote: string | null;
  /** The comment body text */
  body: string;
  /** Line number of the [^cN]: definition in the source */
  definitionLine: number;
}

export interface CommentMarker {
  /** The N in [^cN] */
  id: number;
  /** Line number where the inline [^cN] marker appears */
  markerLine: number;
  /** Character offset within the line */
  markerOffset: number;
}

export interface CommentThread {
  /** All markers at this position (adjacent [^cN][^cM]) */
  markers: CommentMarker[];
  /** Corresponding definitions, in marker order */
  comments: CommentDefinition[];
}

export interface ParseResult {
  /** All individual comment definitions found */
  definitions: CommentDefinition[];
  /** All inline markers found */
  markers: CommentMarker[];
  /** Grouped threads (adjacent markers) */
  threads: CommentThread[];
  /** Next available comment ID */
  nextId: number;
}

export interface CommentPluginSettings {
  defaultAuthor: string;
  sidebarPosition: "left" | "right";
  authorColors: Record<string, string>;
}

export const DEFAULT_SETTINGS: CommentPluginSettings = {
  defaultAuthor: "@lena",
  sidebarPosition: "right",
  authorColors: {
    "@lena": "#4ecdc4",
    "@claude": "#7b6fde",
  },
};
