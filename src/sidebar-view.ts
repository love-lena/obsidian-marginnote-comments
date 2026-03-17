import { ItemView, WorkspaceLeaf, MarkdownView, TFile } from "obsidian";
import { parseComments, removeComment } from "./parser";
import { CommentThread } from "./types";
import CommentPlugin from "./main";

export const VIEW_TYPE_COMMENTS = "comments-sidebar";

export class CommentSidebarView extends ItemView {
  plugin: CommentPlugin;
  private lastKnownFile: TFile | null = null;
  private refreshTimeout: ReturnType<typeof setTimeout> | null = null;
  private refreshGeneration = 0;

  constructor(leaf: WorkspaceLeaf, plugin: CommentPlugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType(): string {
    return VIEW_TYPE_COMMENTS;
  }

  getDisplayText(): string {
    return "Comments";
  }

  getIcon(): string {
    return "message-square";
  }

  async onClose(): Promise<void> {
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
      this.refreshTimeout = null;
    }
  }

  async onOpen(): Promise<void> {
    this.registerEvent(
      this.app.vault.on("modify", (file) => {
        if (file === this.getActiveFile()) this.scheduleRefresh();
      })
    );
    this.registerEvent(
      this.app.workspace.on("active-leaf-change", () => this.scheduleRefresh())
    );
    this.refresh();
  }

  private scheduleRefresh(): void {
    if (this.refreshTimeout) clearTimeout(this.refreshTimeout);
    this.refreshTimeout = setTimeout(() => this.refresh(), 100);
  }

  getActiveFile(): TFile | null {
    // Try active view first, but fall back to last known file
    // (clicking the sidebar itself steals focus from the markdown view)
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (view?.file) {
      this.lastKnownFile = view.file;
      return view.file;
    }
    return this.lastKnownFile;
  }

  async refresh(): Promise<void> {
    // Generation counter prevents stale async refreshes from rendering
    const gen = ++this.refreshGeneration;

    const file = this.getActiveFile();

    // Save scroll position before clearing
    const scrollTop = this.contentEl.scrollTop;

    this.contentEl.empty();

    if (!file) {
      this.contentEl.createEl("p", {
        text: "No active note",
        cls: "comment-empty",
      });
      return;
    }

    const content = await this.app.vault.read(file);

    // If a newer refresh started while we were awaiting, bail out
    if (gen !== this.refreshGeneration) return;

    const result = parseComments(content);

    // Header
    const header = this.contentEl.createDiv({ cls: "comment-header" });
    header.createSpan({ text: "Comments", cls: "comment-header-title" });
    const count = result.definitions.length;
    header.createSpan({
      text: `${count} open`,
      cls: "comment-header-count",
    });

    if (result.threads.length === 0) {
      this.contentEl.createEl("p", {
        text: "No comments in this note",
        cls: "comment-empty",
      });
      return;
    }

    // Render threads
    for (const thread of result.threads) {
      this.renderThread(this.contentEl, thread, file);
    }

    // Restore scroll position
    this.contentEl.scrollTop = scrollTop;
  }

  renderThread(
    container: Element,
    thread: CommentThread,
    file: TFile
  ): void {
    const threadContainer = container.createDiv({ cls: "comment-thread" });

    for (let i = 0; i < thread.comments.length; i++) {
      const comment = thread.comments[i]!;
      const isReply = i > 0;

      const card = threadContainer.createDiv({
        cls: `comment-card ${isReply ? "comment-reply" : ""}`,
        attr: { "data-comment-id": String(comment.id) },
      });

      // Click to jump
      card.addEventListener("click", (e) => {
        if ((e.target as HTMLElement).closest(".comment-action")) return;
        const marker = thread.markers[i];
        if (marker) this.jumpToLine(file, marker.markerLine);
      });

      // Top row: author + actions
      const topRow = card.createDiv({ cls: "comment-top-row" });
      const authorColor = comment.author
        ? this.plugin.settings.authorColors[comment.author] ?? "#888"
        : "#888";
      const authorSpan = topRow.createSpan({
        text: comment.author ?? "unknown",
        cls: "comment-author",
      });
      authorSpan.style.color = authorColor;

      const actions = topRow.createDiv({ cls: "comment-actions" });

      if (!isReply) {
        const replyBtn = actions.createEl("button", {
          cls: "comment-action comment-action-reply",
          attr: { title: "Reply" },
        });
        replyBtn.setText("↩");
        replyBtn.addEventListener("click", () => {
          this.handleReply(thread, file);
        });
      }

      const deleteBtn = actions.createEl("button", {
        cls: "comment-action comment-action-delete",
        attr: { title: "Delete comment" },
      });
      deleteBtn.setText("✕");
      deleteBtn.addEventListener("click", () => {
        this.handleDelete(comment.id, file);
      });

      // Quote
      if (comment.quote) {
        card.createDiv({ text: comment.quote, cls: "comment-quote" });
      }

      // Body
      card.createDiv({ text: comment.body, cls: "comment-body" });
    }
  }

  jumpToLine(file: TFile, line: number): void {
    // Find the leaf showing this file — can't use getActiveViewOfType because
    // clicking the sidebar changes focus away from the markdown view
    const leaves = this.app.workspace.getLeavesOfType("markdown");
    const leaf = leaves.find(
      (l) => l.view instanceof MarkdownView && l.view.file?.path === file.path
    );
    if (!leaf) return;
    const view = leaf.view as MarkdownView;
    this.app.workspace.revealLeaf(leaf);
    view.setEphemeralState({ line });
  }

  async handleDelete(commentId: number, file: TFile): Promise<void> {
    await this.app.vault.process(file, (content) => {
      return removeComment(content, commentId);
    });
  }

  async handleReply(thread: CommentThread, file: TFile): Promise<void> {
    const cards = this.contentEl.querySelectorAll(".comment-card");
    const lastThreadCard = cards[
      this.findLastCardIndexForThread(thread)
    ];
    if (!lastThreadCard) return;

    // Don't add multiple inputs
    if (lastThreadCard.parentElement?.querySelector(".comment-input-container")) return;

    const inputContainer = createDiv({ cls: "comment-input-container" });

    inputContainer.createDiv({
      text: `New comment as ${this.plugin.settings.defaultAuthor}`,
      cls: "comment-input-label",
    });

    const textarea = inputContainer.createEl("textarea", {
      cls: "comment-input-textarea",
      attr: { placeholder: "Write a reply...", rows: "2" },
    });

    const buttonRow = inputContainer.createDiv({ cls: "comment-input-buttons" });

    const cancelBtn = buttonRow.createEl("button", {
      text: "Cancel",
      cls: "comment-input-cancel",
    });
    cancelBtn.addEventListener("click", () => inputContainer.remove());

    const submitBtn = buttonRow.createEl("button", {
      text: "Reply",
      cls: "comment-input-submit",
    });

    const submit = async () => {
      const body = textarea.value.trim();
      if (!body) return;

      const author = this.plugin.settings.defaultAuthor;
      const quote = thread.comments[0]?.quote ?? null;
      const lastMarker = thread.markers[thread.markers.length - 1]!;

      await this.app.vault.process(file, (content) => {
        const lines = content.split("\n");
        const result = parseComments(content);
        const newId = result.nextId;

        const line = lines[lastMarker.markerLine]!;
        const insertPos = lastMarker.markerOffset + `[^c${lastMarker.id}]`.length;
        lines[lastMarker.markerLine] =
          line.slice(0, insertPos) + `[^c${newId}]` + line.slice(insertPos);

        const quotePart = quote ? `"${quote}" — ` : "";
        const def = `[^c${newId}]: ${author} - ${quotePart}${body}`;
        lines.push(def);

        return lines.join("\n");
      });

      inputContainer.remove();
    };

    submitBtn.addEventListener("click", submit);
    textarea.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        submit();
      }
    });

    lastThreadCard.after(inputContainer);
    textarea.focus();
  }

  private findLastCardIndexForThread(thread: CommentThread): number {
    const allCards = Array.from(this.contentEl.querySelectorAll(".comment-card"));
    const lastCommentId = thread.comments[thread.comments.length - 1]?.id;
    for (let i = allCards.length - 1; i >= 0; i--) {
      if (allCards[i]?.getAttribute("data-comment-id") === String(lastCommentId)) {
        return i;
      }
    }
    return 0;
  }
}
