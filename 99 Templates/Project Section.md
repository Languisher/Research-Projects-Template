---
type: index
cssclasses:
  - project-section
---

```dataviewjs
await dv.view("99 Templates/Views/Entity Navigation");
```

# `= this.file.name`

```dataviewjs
const current = dv.current().file;
const projectFolder = current.folder.split("/").slice(0, -1).join("/");
const projectName = projectFolder.split("/").at(-1);

dv.paragraph(dv.fileLink(`${projectFolder}/${projectName}.md`, false, `← ${projectName}`));

dv.table(
  ["文档", "类型", "更新"],
  dv.pages(`"${current.folder}"`)
    .where((page) => page.file.path !== current.path)
    .sort((page) => page.file.mtime, "desc")
    .map((page) => [page.file.link, page.type, page.file.mtime.toFormat("MM/dd HH:mm")])
);
```
