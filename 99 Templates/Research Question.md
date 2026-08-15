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
const selectedProject = await tp.system.suggester(
  projectChoices.map(
    (project) => `${project.name}  ·  ${formatProjectTime(project.lastUsed)}`,
  ),
  projectChoices,
  true,
  "选择 Project（最近使用优先）",
);
const creationProjectName = selectedProject.name;
const requestedTitle = await tp.system.prompt(
  "请输入研究问题标题",
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
  throw new Error("研究问题标题不能为空。");
}

if (creationProjectName) {
  const questionsFolder = `02 Projects/${creationProjectName}/Research Questions`;
  const questionsIndex = `${questionsFolder}/Research Questions.md`;

  if (!(await app.vault.adapter.exists(questionsFolder))) {
    await app.vault.createFolder(questionsFolder);
  }

  if (!(await app.vault.adapter.exists(questionsIndex))) {
    const sectionTemplate = await app.vault.adapter.read("99 Templates/Project Section.md");
    await app.vault.create(questionsIndex, sectionTemplate);
  }

  const sequencePattern = /RQ(\d+)(?:[-\s_].*)?$/i;
  const maxSequence = app.vault
    .getMarkdownFiles()
    .filter((file) => file.parent?.path === questionsFolder)
    .reduce((max, file) => {
      const match = file.basename.match(sequencePattern);
      return match ? Math.max(max, Number(match[1])) : max;
    }, 0);

  let nextSequence = maxSequence + 1;
  let targetName = `RQ${nextSequence}-${safeTitle}`;
  while (await app.vault.adapter.exists(`${questionsFolder}/${targetName}.md`)) {
    nextSequence += 1;
    targetName = `RQ${nextSequence}-${safeTitle}`;
  }
  await tp.file.move(`${questionsFolder}/${targetName}`);
}
-%>
---
type: research-question
created: <% tp.date.now("YYYY-MM-DD") %>
updated: <% tp.date.now("YYYY-MM-DD") %>
project: <%*
const pathParts = tp.file.folder(true).split("/");
const projectsRootIndex = pathParts.indexOf("02 Projects");
const projectName = projectsRootIndex >= 0 ? pathParts[projectsRootIndex + 1] : "";

if (projectName && projectName !== "_Shared") {
  const projectPath = `02 Projects/${projectName}/${projectName}`;
  tR += JSON.stringify(`[[${projectPath}]]`);
}
%>
tags:
  - research-question
---

## 问题

> 用一句清晰、可研究的问题表述需要回答什么。

## 动机与范围

- 为什么重要：
- 包含：
- 不包含：
- 关键定义与约束：

## 回答标准

- 什么证据能够回答这个问题：
- 什么结果仍不足以回答：

## 当前认识

- 已知事实或证据：
- 尚未解决的部分：
- 当前回答（如有）：

## 相关 Ideas

```dataview
TABLE status AS "状态", parent_idea AS "父想法", dateformat(file.mtime, "MM/dd HH:mm") AS "更新"
FROM "02 Projects"
WHERE type = "idea"
  AND contains(research_questions, this.file.link)
SORT file.mtime DESC
```
