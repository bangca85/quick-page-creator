import { App, PluginSettingTab, Setting, TFolder } from "obsidian";
import QuickPageCreator from "../main";

export interface QuickPageCreatorSettings {
  templateFolderPath: string;
}

export const DEFAULT_SETTINGS: QuickPageCreatorSettings = {
  templateFolderPath: "/",
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
      .setName('Template Folder')
      .setDesc('Select a folder to use for templates (default: /)')
      .addDropdown(dropdown => {
        dropdown.addOption("/", "/"); // Root option

        // Populate dropdown with all folders in the vault
        this.app.vault.getAllLoadedFiles().forEach(file => {
          if (file instanceof TFolder) {
            dropdown.addOption(file.path, file.path);
          }
        });

        // Set the current value
        dropdown.setValue(this.plugin.settings.templateFolderPath || "/");

        // Update setting when changed
        dropdown.onChange(async (value) => {
          this.plugin.settings.templateFolderPath = value;
          await this.plugin.saveSettings();
        });
      });
  }
}
