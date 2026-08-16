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
const creationProjectName = selectedProject.name;

const ideasFolder = `${selectedProject.folder}/Ideas`;
const ideaChoices = allMarkdownFiles
  .filter((file) => {
    if (file.parent?.path !== ideasFolder) {
      return false;
    }
    const frontmatter = app.metadataCache.getFileCache(file)?.frontmatter;
    return frontmatter?.type === "idea";
  })
  .sort((left, right) =>
    right.stat.mtime - left.stat.mtime ||
    left.basename.localeCompare(right.basename, "zh-CN", {
      numeric: true,
      sensitivity: "base",
    })
  );

let selectedIdeaLink = "";
if (ideaChoices.length > 0) {
  const selectedIdea = await tp.system.suggester(
    ideaChoices.map((file) => {
      const status = app.metadataCache.getFileCache(file)?.frontmatter?.status;
      return status ? `${file.basename}  ·  ${status}` : file.basename;
    }),
    ideaChoices,
    true,
    `选择 ${creationProjectName} 的 Idea`,
  );
  selectedIdeaLink = `[[${selectedIdea.path.replace(/\.md$/i, "")}]]`;
}
const requestedTitle = await tp.system.prompt(
  "请输入实验标题",
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
  throw new Error("实验标题不能为空。");
}

if (creationProjectName) {
  const experimentsFolder = `02 Projects/${creationProjectName}/Experiments`;
  const experimentsIndex = `${experimentsFolder}/Experiments.md`;

  if (!(await app.vault.adapter.exists(experimentsFolder))) {
    await app.vault.createFolder(experimentsFolder);
  }

  if (!(await app.vault.adapter.exists(experimentsIndex))) {
    const sectionTemplate = await app.vault.adapter.read("99 Templates/Project Section.md");
    await app.vault.create(experimentsIndex, sectionTemplate);
  }

  const sequencePattern = /EXP(\d+)(?:[-\s_].*)?$/i;
  const maxSequence = app.vault
    .getMarkdownFiles()
    .filter((file) => file.parent?.path === experimentsFolder)
    .reduce((max, file) => {
      const match = file.basename.match(sequencePattern);
      return match ? Math.max(max, Number(match[1])) : max;
    }, 0);

  let nextSequence = maxSequence + 1;
  let targetName = `EXP${nextSequence}-${safeTitle}`;
  while (await app.vault.adapter.exists(`${experimentsFolder}/${targetName}.md`)) {
    nextSequence += 1;
    targetName = `EXP${nextSequence}-${safeTitle}`;
  }
  await tp.file.move(`${experimentsFolder}/${targetName}`);
}
-%>
---
type: experiment
status: 准备中
created: <% tp.date.now("YYYY-MM-DD") %>
updated: <% tp.date.now("YYYY-MM-DD") %>
project:
<%*
const pathParts = tp.file.folder(true).split("/");
const projectsRootIndex = pathParts.indexOf("02 Projects");
const projectName = projectsRootIndex >= 0 ? pathParts[projectsRootIndex + 1] : "";

if (projectName && projectName !== "_Shared") {
  const projectPath = `02 Projects/${projectName}/${projectName}`;
  tR += `  - ${JSON.stringify(`[[${projectPath}]]`)}`;
}
%>
idea: <%* if (selectedIdeaLink) tR += JSON.stringify(selectedIdeaLink); %>
meetings:
planned_date:
completed_date:
external_repository:
external_commit:
external_artifacts:
tags:
  - experiment
---

```dataviewjs
await dv.view("99 Templates/Views/Entity Navigation");
```
