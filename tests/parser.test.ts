import { describe, it, expect } from "vitest";
import { parseDefinitions } from "../src/parser";

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
});
