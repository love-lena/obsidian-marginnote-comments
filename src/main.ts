import { Plugin } from "obsidian";
import { CommentPluginSettings, DEFAULT_SETTINGS } from "./types";
import { CommentSettingTab } from "./settings";
import { CommentSidebarView, VIEW_TYPE_COMMENTS } from "./sidebar-view";

export default class CommentPlugin extends Plugin {
  settings: CommentPluginSettings = DEFAULT_SETTINGS;

  async onload() {
    await this.loadSettings();
    this.addSettingTab(new CommentSettingTab(this.app, this));

    this.registerView(VIEW_TYPE_COMMENTS, (leaf) => new CommentSidebarView(leaf, this));

    this.addRibbonIcon("message-square", "Open comments", () => {
      this.activateSidebarView();
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
