import { App, Modal, Setting, TFolder, TFile, Notice } from "obsidian";

export class PageCreationModal extends Modal {
  templateFolderPath: string;

  constructor(app: App, templateFolderPath: string) {
    super(app);
    this.templateFolderPath = templateFolderPath;
  }

  async onOpen() {
    const { contentEl } = this;
    contentEl.empty();

    let selectedFolder: TFolder | null = null;
    let selectedTemplate: TFile | null = null;
    let useBlankPage = true; // Flag to indicate whether to use a blank page
    let fileName = "NewPage"; // Default file name

    // File Name Textbox
    new Setting(contentEl)
      .setName("File Name")
      .addText(text => {
        text.setPlaceholder("Enter file name (default: NewPage)")
          .onChange(value => {
            fileName = value.trim() || "NewPage"; // Default to "NewPage" if input is empty
          });
      });

    // Folder Selection Dropdown
    new Setting(contentEl)
      .setName("Select Folder")
      .addDropdown(dropdown => {
        this.app.vault.getAllLoadedFiles().forEach((file) => {
          if (file instanceof TFolder) {
            dropdown.addOption(file.path, file.path);
          }
        });
        dropdown.onChange((value) => {
          selectedFolder = this.app.vault.getAbstractFileByPath(value) as TFolder;
        });
      });

    // Attempt to locate the template folder, if specified
    const templateFolder = this.templateFolderPath
      ? this.app.vault.getAbstractFileByPath(this.templateFolderPath) as TFolder
      : null;

    // Template Selection Dropdown (includes "Blank Page" option)
    new Setting(contentEl)
      .setName("Select Template")
      .addDropdown(dropdown => {
        dropdown.addOption("blank", "Blank Page"); // Default option for a blank page

        if (templateFolder) {
          templateFolder.children.forEach(file => {
            if (file instanceof TFile && file.extension === "md") {
              dropdown.addOption(file.path, file.basename);
            }
          });
        }

        dropdown.onChange((value) => {
          if (value === "blank") {
            selectedTemplate = null;
            useBlankPage = true; // Set flag to use blank page content
          } else {
            selectedTemplate = this.app.vault.getAbstractFileByPath(value) as TFile;
            useBlankPage = false; // Set flag to use template content
          }
        });
      });

    // "Create Page" Button
    new Setting(contentEl)
      .addButton(button => {
        button.setButtonText("Create Page").onClick(async () => {
          if (selectedFolder) {
            await this.createPage(selectedFolder, selectedTemplate, useBlankPage, fileName);
            this.close();
          } else {
            new Notice("Please select a folder.");
          }
        });
      });
  }

  async createPage(folder: TFolder, template: TFile | null, useBlankPage: boolean, fileName: string) {
    const content = useBlankPage || !template ? "" : await this.app.vault.read(template);
    const newPagePath = `${folder.path}/${fileName}.md`;
    await this.app.vault.create(newPagePath, content);
    new Notice(`Page created: ${newPagePath}`);
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}
