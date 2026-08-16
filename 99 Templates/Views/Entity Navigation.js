const current = dv.current().file;
const pathParts = current.path.split("/");
const rootFolder = pathParts[0];
const entityName = pathParts[1];
const entityType = rootFolder === "02 Projects"
  ? "project"
  : rootFolder === "04 Knowledge"
    ? "knowledge"
    : null;

if (entityType && entityName && entityName !== "_Shared") {
  const homePath = `${rootFolder}/${entityName}/${entityName}.md`;

  if (current.path !== homePath) {
    const currentFile = app.vault.getAbstractFileByPath(current.path);
    const homeFile = app.vault.getAbstractFileByPath(homePath);
    const navigation = dv.container.createDiv({
      cls: "project-context-navigation",
    });

    const parentButton = navigation.createEl("button", {
      text: "↑ 上级目录",
      cls: "project-context-navigation-button",
      attr: {
        title: `在文件列表中打开 ${currentFile?.parent?.path || "上级目录"}`,
        "aria-label": "在文件列表中打开上级目录",
      },
    });

    parentButton.addEventListener("click", async () => {
      const explorerLeaf = app.workspace.getLeavesOfType("file-explorer")[0];
      const revealInFolder = explorerLeaf?.view?.revealInFolder;

      if (explorerLeaf && typeof revealInFolder === "function" && currentFile) {
        await app.workspace.revealLeaf(explorerLeaf);
        await revealInFolder.call(explorerLeaf.view, currentFile);
        return;
      }

      app.commands.executeCommandById("file-explorer:reveal-active-file");
    });

    const homeButton = navigation.createEl("button", {
      text: entityType === "project" ? "⌂ 项目首页" : "⌂ 知识首页",
      cls: "project-context-navigation-button",
      attr: {
        title: `打开 ${entityName} 首页`,
        "aria-label": `打开 ${entityName} 首页`,
      },
    });

    homeButton.toggleClass("is-disabled", !homeFile);
    homeButton.disabled = !homeFile;
    homeButton.addEventListener("click", async (event) => {
      if (!homeFile) return;
      const openInNewTab = event.metaKey || event.ctrlKey;
      await app.workspace.getLeaf(openInNewTab ? "tab" : false).openFile(homeFile);
    });
  }
}
