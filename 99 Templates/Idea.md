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

const researchQuestionsFolder = `${selectedProject.folder}/Research Questions`;
const researchQuestionChoices = allMarkdownFiles
  .filter((file) => {
    if (file.parent?.path !== researchQuestionsFolder) {
      return false;
    }
    const frontmatter = app.metadataCache.getFileCache(file)?.frontmatter;
    return frontmatter?.type === "research-question";
  })
  .sort((left, right) =>
    left.basename.localeCompare(right.basename, "zh-CN", {
      numeric: true,
      sensitivity: "base",
    })
  );

if (researchQuestionChoices.length === 0) {
  throw new Error(
    `${creationProjectName} 中还没有 Research Question，请先创建一个。`,
  );
}

const selectedResearchQuestions = [];
while (selectedResearchQuestions.length < researchQuestionChoices.length) {
  const remainingChoices = researchQuestionChoices.filter(
    (file) => !selectedResearchQuestions.includes(file),
  );
  const finishChoice = { finish: true };
  const choices = selectedResearchQuestions.length > 0
    ? [finishChoice, ...remainingChoices]
    : remainingChoices;
  const selected = await tp.system.suggester(
    choices.map((choice) => {
      if (choice.finish) {
        return `完成选择（已选 ${selectedResearchQuestions.length} 个）`;
      }
      return choice.basename;
    }),
    choices,
    true,
    selectedResearchQuestions.length === 0
      ? `选择 ${creationProjectName} 的 Research Question`
      : "继续选择，或完成",
  );

  if (selected.finish) {
    break;
  }
  selectedResearchQuestions.push(selected);
}

const wikiLinkFor = (file) => `[[${file.path.replace(/\.md$/i, "")}]]`;
const requestedTitle = await tp.system.prompt(
  "请输入想法标题",
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
  throw new Error("想法标题不能为空。");
}

if (creationProjectName) {
  const ideasFolder = `02 Projects/${creationProjectName}/Ideas`;
  const ideasIndex = `${ideasFolder}/Ideas.md`;

  if (!(await app.vault.adapter.exists(ideasFolder))) {
    await app.vault.createFolder(ideasFolder);
  }

  if (!(await app.vault.adapter.exists(ideasIndex))) {
    const sectionTemplate = await app.vault.adapter.read("99 Templates/Project Section.md");
    await app.vault.create(ideasIndex, sectionTemplate);
  }

  const sequencePattern = /IDEA(\d+)(?:[-\s_].*)?$/i;
  const maxSequence = app.vault
    .getMarkdownFiles()
    .filter((file) => file.parent?.path === ideasFolder)
    .reduce((max, file) => {
      const match = file.basename.match(sequencePattern);
      return match ? Math.max(max, Number(match[1])) : max;
    }, 0);

  let nextSequence = maxSequence + 1;
  let targetName = `IDEA${nextSequence}-${safeTitle}`;
  while (await app.vault.adapter.exists(`${ideasFolder}/${targetName}.md`)) {
    nextSequence += 1;
    targetName = `IDEA${nextSequence}-${safeTitle}`;
  }
  await tp.file.move(`${ideasFolder}/${targetName}`);
}
-%>
---
type: idea
status: seed
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
research_questions:
<%* selectedResearchQuestions.forEach((file) => {
  tR += `  - ${JSON.stringify(wikiLinkFor(file))}\n`;
}); -%>
parent_idea:
tags:
  - idea
---
