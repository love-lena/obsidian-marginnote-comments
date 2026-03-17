import {
  MarkdownPostProcessorContext,
  MarkdownView,
  TFile,
} from "obsidian";
import { parseComments } from "./parser";
import CommentPlugin from "./main";

export function registerReadingViewProcessor(plugin: CommentPlugin): void {
  plugin.registerMarkdownPostProcessor((el, ctx) => {
    const sectionInfo = ctx.getSectionInfo(el);
    if (!sectionInfo) return;

    const file = plugin.app.workspace.getActiveViewOfType(MarkdownView)?.file;
    if (!file) return;

    // Make the block a positioning context
    el.style.position = "relative";

    // Create the comment button
    const btn = el.createEl("button", {
      cls: "comment-hover-btn",
      attr: { "aria-label": "Add comment" },
    });
    btn.setText("\u{1F4AC}");

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      openCommentInput(plugin, el, sectionInfo, file, ctx);
    });

    // Check if this block has existing comment markers
    const blockLines = sectionInfo.text
      .split("\n")
      .slice(sectionInfo.lineStart, sectionInfo.lineEnd + 1)
      .join("\n");

    if (/\[\^c\d+\]/.test(blockLines)) {
      el.classList.add("comment-has-comments");
    }
  });
}

function openCommentInput(
  plugin: CommentPlugin,
  blockEl: HTMLElement,
  sectionInfo: ReturnType<MarkdownPostProcessorContext["getSectionInfo"]> & {},
  file: TFile,
  ctx: MarkdownPostProcessorContext
): void {
  // Don't add multiple inputs
  if (blockEl.querySelector(".comment-inline-input")) return;

  const container = blockEl.createDiv({ cls: "comment-inline-input" });

  container.createDiv({
    text: `New comment as ${plugin.settings.defaultAuthor}`,
    cls: "comment-input-label",
  });

  const textarea = container.createEl("textarea", {
    cls: "comment-input-textarea",
    attr: { placeholder: "Write a comment...", rows: "2" },
  });

  const buttonRow = container.createDiv({ cls: "comment-input-buttons" });

  const cancelBtn = buttonRow.createEl("button", {
    text: "Cancel",
    cls: "comment-input-cancel",
  });
  cancelBtn.addEventListener("click", () => container.remove());

  const submitBtn = buttonRow.createEl("button", {
    text: "Comment",
    cls: "comment-input-submit",
  });
  submitBtn.addEventListener("click", async () => {
    const body = textarea.value.trim();
    if (!body) return;

    const author = plugin.settings.defaultAuthor;

    // Extract a quote from the block text (first ~50 chars of the block)
    const lines = sectionInfo.text.split("\n");
    const blockLines = lines.slice(sectionInfo.lineStart, sectionInfo.lineEnd + 1);
    const blockText = blockLines.join(" ").replace(/^#+\s*/, "").trim();
    const quote = blockText.length > 50
      ? blockText.slice(0, 50).trim() + "..."
      : blockText;

    await plugin.app.vault.process(file, (content) => {
      const result = parseComments(content);
      const newId = result.nextId;
      const contentLines = content.split("\n");

      // Append marker to end of the last line of this block
      const targetLine = sectionInfo.lineEnd;
      if (targetLine < contentLines.length) {
        contentLines[targetLine] = contentLines[targetLine] + `[^c${newId}]`;
      }

      // Append definition at end of file
      const quotePart = quote ? `"${quote}" — ` : "";
      contentLines.push(`[^c${newId}]: ${author} - ${quotePart}${body}`);

      return contentLines.join("\n");
    });

    container.remove();
  });

  textarea.focus();
}
