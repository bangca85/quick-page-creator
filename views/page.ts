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

    // Apply inline styles to modal elements
    this.applyStyles();
    contentEl.addClass("quick-page-modal");

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
          text.inputEl.classList.add("quick-page-input");
      });

    // Folder Selection Dropdown
    new Setting(contentEl)
      .setName("Folder")
      .addDropdown(dropdown => {
        this.app.vault.getAllLoadedFiles().forEach((file) => {
          if (file instanceof TFolder) {
            dropdown.addOption(file.path, file.path);
          }
        });
        dropdown.onChange((value) => {
          selectedFolder = this.app.vault.getAbstractFileByPath(value) as TFolder;
        });
        dropdown.selectEl.classList.add("quick-page-dropdown");
      });

    // Attempt to locate the template folder, if specified
    const templateFolder = this.templateFolderPath
      ? this.app.vault.getAbstractFileByPath(this.templateFolderPath) as TFolder
      : null;

    // Template Selection Dropdown (includes "Blank Page" option)
    new Setting(contentEl)
      .setName("Template")
      .addDropdown(dropdown => {
        dropdown.addOption("blank", "Blank Page"); 

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
            useBlankPage = true; 
          } else {
            selectedTemplate = this.app.vault.getAbstractFileByPath(value) as TFile;
            useBlankPage = false;
          }
        });
        dropdown.selectEl.classList.add("quick-page-dropdown");
      });

    // "Create Page" Button
    new Setting(contentEl)
      .addButton(button => {
        button.setButtonText("Create Page")
          .onClick(async () => {
            if (selectedFolder) {
              await this.createPage(selectedFolder, selectedTemplate, useBlankPage, fileName);
              this.close();
            } else {
              new Notice("Please select a folder.");
            }
          });
          button.buttonEl.classList.add("quick-page-button");
      });
  }

  applyStyles() {
    const style = document.createElement("style");
    style.textContent = `
      .quick-page-modal {
        width: 100%;
      }
  
      .quick-page-modal .setting-item {
        display: flex;
        align-items: center;
        width: 100%;
        margin-bottom: 10px; 
      }
   
      .quick-page-modal .setting-item-info {
        flex: 0 0 20%; 
        font-weight: bold;
        margin-right: 10px;
        text-align: left;
      }
  
      .quick-page-modal .setting-item-control {
        flex: 1 1 80%;
      }
  
      .quick-page-input, .quick-page-dropdown {
        width: 100% !important;
        max-width: none !important;
        box-sizing: border-box;
        padding: 8px;
        font-size: 14px;
        border: 1px solid #ddd;
        border-radius: 4px;
      }
  
      .quick-page-button {
        width: 100%;
        padding: 10px;
        font-size: 14px;
        background-color: #4CAF50 !important;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        text-align: center;
        margin-top: 10px;
      }
  
      .quick-page-button:hover {
        background-color: #45a049;
      }
    `;
    document.head.appendChild(style);
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
