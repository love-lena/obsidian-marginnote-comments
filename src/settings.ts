import { App, PluginSettingTab, Setting } from "obsidian";
import CommentPlugin from "./main";

export class CommentSettingTab extends PluginSettingTab {
  plugin: CommentPlugin;

  constructor(app: App, plugin: CommentPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName("Default author")
      .setDesc("Pre-filled when adding comments (e.g. @lena)")
      .addText((text) =>
        text
          .setPlaceholder("@lena")
          .setValue(this.plugin.settings.defaultAuthor)
          .onChange(async (value) => {
            this.plugin.settings.defaultAuthor = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Sidebar position")
      .setDesc("Which side to show the comments panel")
      .addDropdown((dropdown) =>
        dropdown
          .addOption("right", "Right")
          .addOption("left", "Left")
          .setValue(this.plugin.settings.sidebarPosition)
          .onChange(async (value: string) => {
            this.plugin.settings.sidebarPosition = value as "left" | "right";
            await this.plugin.saveSettings();
          })
      );

    containerEl.createEl("h3", { text: "Author Colors" });
    containerEl.createEl("p", {
      text: "Map author handles to colors for the sidebar display.",
      cls: "setting-item-description",
    });

    for (const [author, color] of Object.entries(
      this.plugin.settings.authorColors
    )) {
      new Setting(containerEl)
        .setName(author)
        .addColorPicker((picker) =>
          picker.setValue(color).onChange(async (value) => {
            this.plugin.settings.authorColors[author] = value;
            await this.plugin.saveSettings();
          })
        )
        .addExtraButton((button) =>
          button.setIcon("trash").onClick(async () => {
            delete this.plugin.settings.authorColors[author];
            await this.plugin.saveSettings();
            this.display(); // re-render
          })
        );
    }

    new Setting(containerEl).setName("Add author color").addButton((button) =>
      button.setButtonText("Add").onClick(async () => {
        this.plugin.settings.authorColors["@new"] = "#888888";
        await this.plugin.saveSettings();
        this.display();
      })
    );
  }
}
