import { App, PluginSettingTab, Setting } from "obsidian";
import QuickPageCreator from "../main";

export interface QuickPageCreatorSettings {
  templateFolderPath: string;
}

export const DEFAULT_SETTINGS: QuickPageCreatorSettings = {
  templateFolderPath: "",
};

export class QuickPageCreatorSettingTab extends PluginSettingTab {
  plugin: QuickPageCreator;

  constructor(app: App, plugin: QuickPageCreator) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl('h2', { text: 'Quick Page Creator Settings' });

    new Setting(containerEl)
      .setName('Template Folder Path')
      .setDesc('Path to the folder containing templates.')
      .addText(text => text
        .setPlaceholder('Example: Templates')
        .setValue(this.plugin.settings.templateFolderPath)
        .onChange(async (value) => {
          this.plugin.settings.templateFolderPath = value;
          await this.plugin.saveSettings();
        }));
  }
}
