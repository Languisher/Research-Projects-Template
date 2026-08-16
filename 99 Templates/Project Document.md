<%*
const allMarkdownFiles = app.vault.getMarkdownFiles();
const projectChoices = allMarkdownFiles
  .filter((file) => {
    const pathParts = file.path.split("/");
    if (pathParts.length !== 3 || pathParts[0] !== "02 Projects") {
      return false;
    }
    const projectFolderName = pathParts[1];
    const frontmatter = app.metadataCache.getFileCache(file)?.frontmatter;
    return frontmatter?.type === "project" || file.basename === projectFolderName;
  })
  .map((file) => {
    const folder = file.parent.path;
    const folderPrefix = `${folder}/`;
    const lastUsed = allMarkdownFiles
      .filter((candidate) => candidate.path.startsWith(folderPrefix))
      .reduce(
        (latest, candidate) => Math.max(latest, candidate.stat.mtime),
        file.stat.mtime,
      );
    return { folder, name: folder.split("/").at(-1), lastUsed };
  })
  .sort((left, right) =>
    right.lastUsed - left.lastUsed ||
    left.name.localeCompare(right.name, "zh-CN", {
      numeric: true,
      sensitivity: "base",
    })
  );

if (projectChoices.length === 0) {
  throw new Error("02 Projects 下没有可用的 Project。");
}

const formatProjectTime = (timestamp) => {
  const date = new Date(timestamp);
  const pad = (value) => String(value).padStart(2, "0");
  return `${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

let selectedProject;
const contextKey = "project-kb-quickadd-context";
try {
  const context = JSON.parse(sessionStorage.getItem(contextKey) || "null");
  sessionStorage.removeItem(contextKey);
  if (context && Date.now() - context.createdAt < 60_000) {
    selectedProject = projectChoices.find(
      (project) => `${project.folder}/${project.name}.md` === context.projectPath,
    );
  }
} catch (error) {
  sessionStorage.removeItem(contextKey);
}

if (!selectedProject) {
  selectedProject = await tp.system.suggester(
    projectChoices.map(
      (project) => `${project.name}  ·  ${formatProjectTime(project.lastUsed)}`,
    ),
    projectChoices,
    true,
    "选择 Project（最近使用优先）",
  );
}

const requestedTitle = await tp.system.prompt(
  "请输入文档标题",
  "",
  true,
  false,
);
const safeTitle = requestedTitle
  .trim()
  .replace(/[\\/:*?"<>|]/g, " ")
  .replace(/\s+/g, " ")
  .trim()
  .slice(0, 100)
  .trim();

if (!safeTitle) {
  throw new Error("文档标题不能为空。");
}

const docsFolder = `${selectedProject.folder}/Docs`;
if (!(await app.vault.adapter.exists(docsFolder))) {
  await app.vault.createFolder(docsFolder);
}

let targetName = safeTitle;
let suffix = 2;
while (await app.vault.adapter.exists(`${docsFolder}/${targetName}.md`)) {
  targetName = `${safeTitle}-${suffix}`;
  suffix += 1;
}

await tp.file.move(`${docsFolder}/${targetName}`);
const documentTitle = targetName;
-%>
```dataviewjs
await dv.view("99 Templates/Views/Entity Navigation");
```

# <% documentTitle %>
