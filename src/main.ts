import { MarkdownView, Notice, Plugin } from "obsidian";
import { CommentPluginSettings, DEFAULT_SETTINGS } from "./types";
import { CommentSettingTab } from "./settings";
import { CommentSidebarView, VIEW_TYPE_COMMENTS } from "./sidebar-view";
import { registerReadingViewProcessor } from "./reading-view";
import { removeOrphanedMarkers } from "./parser";

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
      id: "cleanup-orphaned-markers",
      name: "Clean up orphaned comment markers",
      checkCallback: (checking: boolean) => {
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!view?.file) return false;
        if (checking) return true;

        const file = view.file;
        this.app.vault.process(file, (content) => {
          const cleaned = removeOrphanedMarkers(content);
          if (cleaned !== content) {
            new Notice("Removed orphaned comment markers");
          } else {
            new Notice("No orphaned markers found");
          }
          return cleaned;
        });
        return true;
      },
    });

    // Restore sidebar if it was open in a previous session
    this.app.workspace.onLayoutReady(() => {
      if (this.app.workspace.getLeavesOfType(VIEW_TYPE_COMMENTS).length === 0) {
        this.activateSidebarView();
      }
    });

  }

  onunload() {
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
