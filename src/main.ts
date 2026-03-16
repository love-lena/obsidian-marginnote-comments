import { Plugin } from "obsidian";
import { CommentPluginSettings, DEFAULT_SETTINGS } from "./types";

export default class CommentPlugin extends Plugin {
  settings: CommentPluginSettings = DEFAULT_SETTINGS;

  async onload() {
    await this.loadSettings();
    console.log("Comments plugin loaded");
  }

  onunload() {
    console.log("Comments plugin unloaded");
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
