---
type: project
cssclasses:
  - project-kb
status: active
created: <% tp.date.now("YYYY-MM-DD") %>
updated: <% tp.date.now("YYYY-MM-DD") %>
deadline:
research_area:
tags:
  - project
---
<%*
const projectFolder = tp.file.folder(true);
const ideasFolder = `${projectFolder}/Ideas`;
const ideasIndex = `${ideasFolder}/Ideas.md`;
const questionsFolder = `${projectFolder}/Research Questions`;
const questionsIndex = `${questionsFolder}/Research Questions.md`;
const experimentsFolder = `${projectFolder}/Experiments`;
const experimentsIndex = `${experimentsFolder}/Experiments.md`;
const proposalPath = `${projectFolder}/Proposal.md`;

if (!(await app.vault.adapter.exists(proposalPath))) {
  const proposalTemplate = await app.vault.adapter.read("99 Templates/Proposal.md");
  await app.vault.create(proposalPath, proposalTemplate);
}

if (!(await app.vault.adapter.exists(ideasFolder))) {
  await app.vault.createFolder(ideasFolder);
}

if (!(await app.vault.adapter.exists(ideasIndex))) {
  const sectionTemplate = await app.vault.adapter.read("99 Templates/Project Section.md");
  await app.vault.create(ideasIndex, sectionTemplate);
}

if (!(await app.vault.adapter.exists(questionsFolder))) {
  await app.vault.createFolder(questionsFolder);
}

if (!(await app.vault.adapter.exists(questionsIndex))) {
  const sectionTemplate = await app.vault.adapter.read("99 Templates/Project Section.md");
  await app.vault.create(questionsIndex, sectionTemplate);
}

if (!(await app.vault.adapter.exists(experimentsFolder))) {
  await app.vault.createFolder(experimentsFolder);
}

if (!(await app.vault.adapter.exists(experimentsIndex))) {
  const sectionTemplate = await app.vault.adapter.read("99 Templates/Project Section.md");
  await app.vault.create(experimentsIndex, sectionTemplate);
}
-%>
# <% tp.file.title %>

**Keywords**：...

```mermaid
gantt
    dateFormat YYYY-MM-DD
    axisFormat %m/%d
    tickInterval 2week

    section 示例模块
    I1.示例项目       :active, i1, 2026-06-01, 18d
```

## To-dos

```dataviewjs
await dv.view("99 Templates/Views/Project Todos");
```

## Project Files

```dataviewjs
await dv.view("99 Templates/Views/Project Research Tree");
```

## Meetings

```dataviewjs
await dv.view("99 Templates/Views/Project Meetings");
```
