import { Plugin, Notice } from 'obsidian';
import { PageCreationModal } from './views/page'; // Import PageCreationModal from './views/page'; 
import { QuickPageCreatorSettingTab, QuickPageCreatorSettings, DEFAULT_SETTINGS } from './views/settings';

export default class QuickPageCreator extends Plugin {
  settings!: QuickPageCreatorSettings;

  async onload() {
    await this.loadSettings();

    // Add a settings tab for the plugin
    this.addSettingTab(new QuickPageCreatorSettingTab(this.app, this));

    this.addCommand({
      id: 'create-page',
      name: 'Create Page with Template',
      checkCallback: (checking: boolean) => {
        if (!checking) {
          const modal = new PageCreationModal(this.app, this.settings.templateFolderPath);
          modal.open();
        }
        return true;
      },
    });
  }



  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
