module.exports = async ({ app, quickAddApi, obsidian, abort }) => {
  const entityRoots = new Map([
    ["02 Projects", "Project"],
    ["04 Knowledge", "Knowledge"],
  ]);
  const inbox = {
    folder: "01 Inbox",
    name: "Inbox",
    type: "Inbox",
    isInbox: true,
  };
  const markdownFiles = app.vault.getMarkdownFiles();

  const entities = markdownFiles
    .filter((file) => {
      const parts = file.path.split("/");
      return (
        parts.length === 3 &&
        entityRoots.has(parts[0]) &&
        file.basename === parts[1]
      );
    })
    .map((file) => {
      const folder = file.parent.path;
      const prefix = `${folder}/`;
      const lastUsed = markdownFiles
        .filter((candidate) => candidate.path.startsWith(prefix))
        .reduce(
          (latest, candidate) => Math.max(latest, candidate.stat.mtime),
          file.stat.mtime,
        );

      return {
        folder,
        name: file.basename,
        type: entityRoots.get(file.path.split("/")[0]),
        lastUsed,
      };
    })
    .sort(
      (left, right) =>
        right.lastUsed - left.lastUsed ||
        left.name.localeCompare(right.name, "zh-CN", {
          numeric: true,
          sensitivity: "base",
        }),
    );

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const pad = (value) => String(value).padStart(2, "0");
    return `${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  let entity = inbox;
  if (entities.length > 0) {
    const entityChoices = [inbox, ...entities];
    try {
      entity =
        (await quickAddApi.suggester(
          [
            "Inbox · 默认（不选择时使用）",
            ...entities.map(
              (item) =>
                `${item.type} · ${item.name}  ·  ${formatTime(item.lastUsed)}`,
            ),
          ],
          entityChoices,
          "选择所属位置（Project / Knowledge 按最近使用排序）",
        )) ?? inbox;
    } catch (error) {
      if (!/cancel/i.test(String(error?.message ?? error))) {
        throw error;
      }
      entity = inbox;
    }
  }

  let targetFolder = inbox.folder;
  if (!entity.isInbox) {
    const docsFolder = obsidian.normalizePath(`${entity.folder}/Docs`);
    const subfolders = app.vault
      .getAllLoadedFiles()
      .filter(
        (item) =>
          Array.isArray(item.children) && item.path.startsWith(`${docsFolder}/`),
      )
      .map((folder) => folder.path)
      .sort((left, right) =>
        left.localeCompare(right, "zh-CN", {
          numeric: true,
          sensitivity: "base",
        }),
      );

    const folderChoices = [docsFolder, ...subfolders];
    try {
      targetFolder =
        (await quickAddApi.suggester(
          folderChoices.map((folder, index) =>
            index === 0
              ? "不选择子目录 · Docs/（默认）"
              : `${folder.slice(entity.folder.length + 1)}/`,
          ),
          folderChoices,
          "选择 Docs/ 下的目录",
        )) ?? docsFolder;
    } catch (error) {
      if (!/cancel/i.test(String(error?.message ?? error))) {
        throw error;
      }
      targetFolder = docsFolder;
    }
  }

  const requestedTitle = await quickAddApi.inputPrompt("请输入文档标题");
  const safeTitle = (requestedTitle ?? "")
    .trim()
    .replace(/[\\/:*?"<>|]/g, " ")
    .replace(/\s+/g, " ")
    .replace(/^\.+|\.+$/g, "")
    .trim()
    .slice(0, 100)
    .trim();

  if (!safeTitle) {
    abort("文档标题不能为空。");
  }

  if (!app.vault.getAbstractFileByPath(targetFolder)) {
    await app.vault.createFolder(targetFolder);
  }

  let fileName = safeTitle;
  let suffix = 2;
  let targetPath = obsidian.normalizePath(`${targetFolder}/${fileName}.md`);
  while (app.vault.getAbstractFileByPath(targetPath)) {
    fileName = `${safeTitle}-${suffix}`;
    suffix += 1;
    targetPath = obsidian.normalizePath(`${targetFolder}/${fileName}.md`);
  }

  const file = await app.vault.create(targetPath, "");
  await app.workspace.getLeaf("tab").openFile(file);
};
