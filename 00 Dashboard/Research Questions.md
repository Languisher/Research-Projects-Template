[[00 Dashboard/Research Home|← 研究主页]] · [[00 Dashboard/Projects|项目]] · [[00 Dashboard/Ideas|想法]] · [[00 Dashboard/Workflow Review|工作流检查]]

## 研究问题

```dataview
TABLE
  project AS "项目",
  filter(file.inlinks, (link) => contains(meta(link).path, "/Ideas/")) AS "相关想法"
FROM "02 Projects"
WHERE type = "research-question"
SORT project ASC, file.name ASC
```

## 尚无想法的问题

```dataview
TABLE
  project AS "项目"
FROM "02 Projects"
WHERE type = "research-question"
  AND length(filter(file.inlinks, (link) => contains(meta(link).path, "/Ideas/"))) = 0
SORT file.mtime ASC
```
