import { ItemView, WorkspaceLeaf, MarkdownView, TFile } from "obsidian";
import { parseComments, removeComment } from "./parser";
import { CommentThread } from "./types";
import CommentPlugin from "./main";

export const VIEW_TYPE_COMMENTS = "comments-sidebar";

export class CommentSidebarView extends ItemView {
  plugin: CommentPlugin;

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

  async onOpen(): Promise<void> {
    this.registerEvent(
      this.app.vault.on("modify", (file) => {
        if (file === this.getActiveFile()) this.refresh();
      })
    );
    this.registerEvent(
      this.app.workspace.on("active-leaf-change", () => this.refresh())
    );
    this.refresh();
  }

  getActiveFile(): TFile | null {
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    return view?.file ?? null;
  }

  async refresh(): Promise<void> {
    const container = this.containerEl.children[1]!;
    container.empty();

    const file = this.getActiveFile();
    if (!file) {
      container.createEl("p", {
        text: "No active note",
        cls: "comment-empty",
      });
      return;
    }

    const content = await this.app.vault.read(file);
    const result = parseComments(content);

    // Header
    const header = container.createDiv({ cls: "comment-header" });
    header.createSpan({ text: "Comments", cls: "comment-header-title" });
    const count = result.definitions.length;
    header.createSpan({
      text: `${count} open`,
      cls: "comment-header-count",
    });

    if (result.threads.length === 0) {
      container.createEl("p", {
        text: "No comments in this note",
        cls: "comment-empty",
      });
      return;
    }

    // Render threads
    for (const thread of result.threads) {
      this.renderThread(container, thread, file);
    }
  }

  renderThread(
    container: Element,
    thread: CommentThread,
    file: TFile
  ): void {
    for (let i = 0; i < thread.comments.length; i++) {
      const comment = thread.comments[i]!;
      const isReply = i > 0;

      const card = container.createDiv({
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
      topRow.createSpan({
        text: comment.author ?? "unknown",
        cls: "comment-author",
      });
      topRow.querySelector(".comment-author")?.setAttribute(
        "style",
        `color: ${authorColor}`
      );

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
    const leaf = this.app.workspace.getActiveViewOfType(MarkdownView)?.leaf;
    if (!leaf) return;
    const view = leaf.view;
    if (view instanceof MarkdownView) {
      view.setEphemeralState({ line });
    }
  }

  async handleDelete(commentId: number, file: TFile): Promise<void> {
    await this.app.vault.process(file, (content) => {
      return removeComment(content, commentId);
    });
  }

  async handleReply(thread: CommentThread, file: TFile): Promise<void> {
    // Placeholder — will be implemented in Task 6
  }
}
