"use strict";

const { Plugin, TFolder, normalizePath } = require("obsidian");
const {
  KNOWLEDGE_ROOT,
  PROJECTS_ROOT,
  getAssetsFolderForEntityFolder,
  getEntityAssetsFolder,
  splitFilename,
} = require("./router");

module.exports = class EntityAssetsRouterPlugin extends Plugin {
  async onload() {
    this.restoreCallbacks = [];
    this.patchAttachmentPathResolvers();

    this.registerEvent(
      this.app.vault.on("create", (item) => {
        if (!(item instanceof TFolder)) return;
        const assetsFolder = getAssetsFolderForEntityFolder(item);
        if (assetsFolder) void this.ensureFolder(assetsFolder);
      }),
    );

    this.app.workspace.onLayoutReady(() => {
      void this.ensureExistingEntityAssetsFolders();
    });
  }

  onunload() {
    for (const restore of this.restoreCallbacks.reverse()) restore();
    this.restoreCallbacks = [];
  }

  patchAttachmentPathResolvers() {
    const vault = this.app.vault;

    if (typeof vault.getAvailablePathForAttachments === "function") {
      const original = vault.getAvailablePathForAttachments;
      const plugin = this;
      const wrapped = async function (filename, extension, source) {
        const assetsFolder = getEntityAssetsFolder(
          source || plugin.app.workspace.getActiveFile(),
        );
        if (!assetsFolder) {
          return original.call(this, filename, extension, source);
        }

        return plugin.getAvailablePath(assetsFolder, filename, extension);
      };

      vault.getAvailablePathForAttachments = wrapped;
      this.restoreCallbacks.push(() => {
        if (vault.getAvailablePathForAttachments === wrapped) {
          vault.getAvailablePathForAttachments = original;
        }
      });
    }

    const fileManager = this.app.fileManager;
    if (typeof fileManager.getAvailablePathForAttachment === "function") {
      const original = fileManager.getAvailablePathForAttachment;
      const plugin = this;
      const wrapped = async function (filename, sourcePath) {
        const assetsFolder = getEntityAssetsFolder(
          sourcePath || plugin.app.workspace.getActiveFile(),
        );
        if (!assetsFolder) return original.call(this, filename, sourcePath);

        const { stem, extension } = splitFilename(filename);
        return plugin.getAvailablePath(assetsFolder, stem, extension);
      };

      fileManager.getAvailablePathForAttachment = wrapped;
      this.restoreCallbacks.push(() => {
        if (fileManager.getAvailablePathForAttachment === wrapped) {
          fileManager.getAvailablePathForAttachment = original;
        }
      });
    }
  }

  async getAvailablePath(folder, filename, extension) {
    await this.ensureFolder(folder);

    const safeStem = String(filename || "Attachment").replace(/[\\/]/g, "-");
    const safeExtension = String(extension || "").replace(/^\.+/, "");
    const suffix = safeExtension ? `.${safeExtension}` : "";
    let index = 0;

    while (true) {
      const numberedStem = index === 0 ? safeStem : `${safeStem} ${index}`;
      const candidate = normalizePath(`${folder}/${numberedStem}${suffix}`);
      if (!(await this.app.vault.adapter.exists(candidate))) return candidate;
      index += 1;
    }
  }

  async ensureFolder(path) {
    const normalized = normalizePath(path);
    if (await this.app.vault.adapter.exists(normalized)) return;

    try {
      await this.app.vault.createFolder(normalized);
    } catch (error) {
      if (!(await this.app.vault.adapter.exists(normalized))) throw error;
    }
  }

  async ensureExistingEntityAssetsFolders() {
    for (const rootPath of [PROJECTS_ROOT, KNOWLEDGE_ROOT]) {
      const root = this.app.vault.getAbstractFileByPath(rootPath);
      if (!(root instanceof TFolder)) continue;

      for (const child of root.children) {
        const assetsFolder = getAssetsFolderForEntityFolder(child);
        if (assetsFolder) await this.ensureFolder(assetsFolder);
      }
    }
  }
};
