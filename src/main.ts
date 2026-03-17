import { MarkdownView, Plugin } from "obsidian";
import { CommentPluginSettings, DEFAULT_SETTINGS } from "./types";
import { CommentSettingTab } from "./settings";
import { CommentSidebarView, VIEW_TYPE_COMMENTS } from "./sidebar-view";
import { registerReadingViewProcessor } from "./reading-view";

export default class CommentPlugin extends Plugin {
  settings: CommentPluginSettings = DEFAULT_SETTINGS;

  async onload() {
    await this.loadSettings();
    this.addSettingTab(new CommentSettingTab(this.app, this));

    this.registerView(VIEW_TYPE_COMMENTS, (leaf) => new CommentSidebarView(leaf, this));

    this.addRibbonIcon("message-square", "Open comments", () => {
      this.activateSidebarView();
    });

    registerReadingViewProcessor(this);

    this.addCommand({
      id: "show-comments-pane",
      name: "Show comments pane",
      callback: () => {
        this.activateSidebarView();
      },
    });

    this.addCommand({
      id: "add-comment",
      name: "Add comment",
      checkCallback: (checking: boolean) => {
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!view) return false;
        if (checking) return true;

        // Ensure sidebar is open
        this.activateSidebarView();

        // In reading view, find the first visible block and simulate a comment button click
        const previewEl = (view as any).previewMode?.containerEl;
        if (previewEl) {
          const btn = previewEl.querySelector(".comment-hover-btn") as HTMLElement | null;
          if (btn) {
            btn.click();
          }
        }
        return true;
      },
    });

    // Restore sidebar if it was open in a previous session
    this.app.workspace.onLayoutReady(() => {
      if (this.app.workspace.getLeavesOfType(VIEW_TYPE_COMMENTS).length === 0) {
        this.activateSidebarView();
      }
    });

    console.log("Comments plugin loaded");
  }

  onunload() {
    console.log("Comments plugin unloaded");
  }

  async activateSidebarView(): Promise<void> {
    const { workspace } = this.app;
    let leaf = workspace.getLeavesOfType(VIEW_TYPE_COMMENTS)[0];
    if (!leaf) {
      leaf = this.settings.sidebarPosition === "left"
        ? workspace.getLeftLeaf(false)!
        : workspace.getRightLeaf(false)!;
      await leaf.setViewState({ type: VIEW_TYPE_COMMENTS, active: true });
    }
    workspace.revealLeaf(leaf);
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
