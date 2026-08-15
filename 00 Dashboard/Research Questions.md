[[00 Dashboard/Research Home|← 研究主页]] · [[00 Dashboard/Projects|项目]] · [[00 Dashboard/Ideas|想法]] · [[00 Dashboard/Workflow Review|工作流检查]]

## Research Questions

```dataview
TABLE
  project AS "项目",
  filter(file.inlinks, (link) => contains(meta(link).path, "/Ideas/")) AS "相关 Ideas",
  dateformat(file.mtime, "MM/dd HH:mm") AS "更新"
FROM "02 Projects"
WHERE type = "research-question"
SORT project ASC, file.name ASC
```

## 尚无 Idea 的 Research Questions

```dataview
TABLE
  project AS "项目",
  dateformat(file.mtime, "MM/dd HH:mm") AS "更新"
FROM "02 Projects"
WHERE type = "research-question"
  AND length(filter(file.inlinks, (link) => contains(meta(link).path, "/Ideas/"))) = 0
SORT file.mtime ASC
```
