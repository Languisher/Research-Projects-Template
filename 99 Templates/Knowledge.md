<%*
const knowledgeFolder = tp.file.folder(true);
const docsFolder = `${knowledgeFolder}/Docs`;
const assetsFolder = `${knowledgeFolder}/assets`;

if (!(await app.vault.adapter.exists(assetsFolder))) {
  await app.vault.createFolder(assetsFolder);
}

if (!(await app.vault.adapter.exists(docsFolder))) {
  await app.vault.createFolder(docsFolder);
}

const today = tp.date.now("YYYY-MM-DD");
tR += `---
type: knowledge
cssclasses:
  - project-kb
status: draft
created: ${today}
updated: ${today}
doc_order:
sources:
tags:
  - knowledge
---
`;
-%>
# <% tp.file.title %>

**Keywords**：...

## To-dos

```dataviewjs
await dv.view("99 Templates/Views/Project Todos");
```

```dataviewjs
await dv.view("99 Templates/Views/Project Research Tree");
```
