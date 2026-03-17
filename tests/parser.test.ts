import { describe, it, expect } from "vitest";
import { parseDefinitions, parseMarkers, groupThreads, parseComments, removeComment } from "../src/parser";

describe("parseDefinitions", () => {
  it("parses full format: @author - \"quote\" — body", () => {
    const content = `Some text.\n\n[^c1]: @claude - "opening paragraph" — Consider adding a hook`;
    const defs = parseDefinitions(content);
    expect(defs).toHaveLength(1);
    expect(defs[0]).toEqual({
      id: 1,
      author: "@claude",
      quote: "opening paragraph",
      body: "Consider adding a hook",
      definitionLine: 2,
    });
  });

  it("parses author + body without quote", () => {
    const content = `[^c2]: @lena - Need Q3 data here`;
    const defs = parseDefinitions(content);
    expect(defs[0]).toEqual({
      id: 2,
      author: "@lena",
      quote: null,
      body: "Need Q3 data here",
      definitionLine: 0,
    });
  });

  it("parses quote + body without author", () => {
    const content = `[^c3]: "weak point" — Needs more evidence`;
    const defs = parseDefinitions(content);
    expect(defs[0]).toEqual({
      id: 3,
      author: null,
      quote: "weak point",
      body: "Needs more evidence",
      definitionLine: 0,
    });
  });

  it("parses fallback: just body text", () => {
    const content = `[^c4]: this is just a plain comment`;
    const defs = parseDefinitions(content);
    expect(defs[0]).toEqual({
      id: 4,
      author: null,
      quote: null,
      body: "this is just a plain comment",
      definitionLine: 0,
    });
  });

  it("ignores regular footnotes", () => {
    const content = `[^1]: This is a normal footnote\n[^note]: Also normal\n[^c1]: @lena - A comment`;
    const defs = parseDefinitions(content);
    expect(defs).toHaveLength(1);
    expect(defs[0]!.id).toBe(1);
  });

  it("handles multiple definitions", () => {
    const content = `Text\n\n[^c1]: @claude - First\n[^c2]: @lena - Second`;
    const defs = parseDefinitions(content);
    expect(defs).toHaveLength(2);
  });

  it("parses multi-line definitions with unindented continuation", () => {
    const content = [
      "[^c20]: @me - important point missing:",
      "the goal is to allow pinned content ids exactly as they are now.",
    ].join("\n");
    const defs = parseDefinitions(content);
    expect(defs).toHaveLength(1);
    expect(defs[0]!.body).toContain("important point missing:");
    expect(defs[0]!.body).toContain("the goal is to allow pinned content ids");
  });

  it("parses multi-line definitions with indented continuation", () => {
    const content = [
      "[^c1]: @me - first comment",
      "    continuation line",
      "[^c2]: @claude - second comment",
    ].join("\n");
    const defs = parseDefinitions(content);
    expect(defs).toHaveLength(2);
    expect(defs[0]!.body).toContain("continuation line");
    expect(defs[1]!.body).toBe("second comment");
  });

  it("multi-line definition stops at blank line", () => {
    const content = [
      "[^c1]: @me - first comment",
      "continuation",
      "",
      "[^c2]: @claude - second comment",
    ].join("\n");
    const defs = parseDefinitions(content);
    expect(defs).toHaveLength(2);
    expect(defs[0]!.body).toContain("continuation");
    expect(defs[1]!.body).toBe("second comment");
  });
});

describe("parseMarkers", () => {
  it("finds inline markers with line and offset", () => {
    const content = `This is text.[^c1]\n\nMore text.[^c2]`;
    const markers = parseMarkers(content);
    expect(markers).toHaveLength(2);
    expect(markers[0]).toEqual({ id: 1, markerLine: 0, markerOffset: 13 });
    expect(markers[1]).toEqual({ id: 2, markerLine: 2, markerOffset: 10 });
  });

  it("finds adjacent markers", () => {
    const content = `Text here.[^c1][^c2]`;
    const markers = parseMarkers(content);
    expect(markers).toHaveLength(2);
    expect(markers[0]!.markerLine).toBe(0);
    expect(markers[1]!.markerLine).toBe(0);
  });

  it("ignores markers in definition lines", () => {
    const content = `Text.[^c1]\n\n[^c1]: @lena - A comment`;
    const markers = parseMarkers(content);
    expect(markers).toHaveLength(1);
  });

  it("ignores regular footnote markers", () => {
    const content = `Text.[^1] More.[^c1]`;
    const markers = parseMarkers(content);
    expect(markers).toHaveLength(1);
    expect(markers[0]!.id).toBe(1);
  });
});

describe("groupThreads", () => {
  it("groups adjacent markers into a thread", () => {
    const content = `Text.[^c1][^c2]\n\n[^c1]: @lena - First\n[^c2]: @claude - Second`;
    const result = groupThreads(
      parseMarkers(content),
      parseDefinitions(content)
    );
    expect(result.threads).toHaveLength(1);
    expect(result.threads[0]!.markers).toHaveLength(2);
    expect(result.threads[0]!.comments).toHaveLength(2);
  });

  it("keeps non-adjacent markers as separate threads", () => {
    const content = `First.[^c1] Second.[^c2]\n\n[^c1]: A\n[^c2]: B`;
    const result = groupThreads(
      parseMarkers(content),
      parseDefinitions(content)
    );
    expect(result.threads).toHaveLength(2);
    expect(result.threads[0]!.markers).toHaveLength(1);
  });

  it("markers with space between are not threaded", () => {
    const content = `Text.[^c1] [^c2]\n\n[^c1]: A\n[^c2]: B`;
    const result = groupThreads(
      parseMarkers(content),
      parseDefinitions(content)
    );
    expect(result.threads).toHaveLength(2);
  });
});

describe("parseComments (full integration)", () => {
  it("parses a complete document", () => {
    const content = [
      "# My Draft",
      "",
      "Opening paragraph.[^c1]",
      "",
      "Weaker point.[^c2][^c3]",
      "",
      "[^c1]: @claude - \"opening\" — Add a hook",
      "[^c2]: @lena - \"weaker\" — Need data",
      "[^c3]: @claude - \"weaker\" — Added data",
    ].join("\n");

    const result = parseComments(content);
    expect(result.definitions).toHaveLength(3);
    expect(result.markers).toHaveLength(3);
    expect(result.threads).toHaveLength(2);
    expect(result.threads[1]!.comments).toHaveLength(2);
    expect(result.nextId).toBe(4);
  });
});

describe("removeComment (delete safety)", () => {
  it("removes only the targeted marker and definition", () => {
    const content = [
      "Opening paragraph.[^c1]",
      "",
      "Second paragraph.[^c2]",
      "",
      "[^c1]: @claude - First comment",
      "[^c2]: @lena - Second comment",
    ].join("\n");

    const result = removeComment(content, 1);
    expect(result).toContain("Opening paragraph.");
    expect(result).not.toContain("[^c1]");
    expect(result).not.toContain("First comment");
    expect(result).toContain("[^c2]");
    expect(result).toContain("Second comment");
  });

  it("does not touch regular footnotes", () => {
    const content = [
      "Text with footnote.[^1] And comment.[^c1]",
      "",
      "[^1]: A regular footnote",
      "[^c1]: @lena - A comment",
    ].join("\n");

    const result = removeComment(content, 1);
    expect(result).toContain("[^1]");
    expect(result).toContain("A regular footnote");
    expect(result).not.toContain("[^c1]");
    expect(result).not.toContain("A comment");
  });

  it("does not alter surrounding text", () => {
    const content = "Some text before[^c1] and after.\n\n[^c1]: @claude - Comment";
    const result = removeComment(content, 1);
    expect(result).toContain("Some text before and after.");
  });

  it("removes one marker from a thread without affecting the other", () => {
    const content = [
      "Text here.[^c1][^c2]",
      "",
      "[^c1]: @lena - First",
      "[^c2]: @claude - Second",
    ].join("\n");

    const result = removeComment(content, 1);
    expect(result).toContain("[^c2]");
    expect(result).toContain("Second");
    expect(result).not.toContain("[^c1]");
    expect(result).not.toContain("First");
  });
});
