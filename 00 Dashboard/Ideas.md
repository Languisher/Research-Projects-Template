[[00 Dashboard/Research Home|← 研究主页]] · [[00 Dashboard/Research Questions|研究问题]] · [[00 Dashboard/Experiments|实验]] · [[00 Dashboard/Workflow Review|工作流检查]]

## 进行中的想法

```dataview
TABLE
  status AS "状态",
  project AS "项目",
  research_questions AS "研究问题",
  parent_idea AS "父想法",
  dateformat(file.mtime, "MM/dd HH:mm") AS "更新"
FROM "02 Projects"
WHERE type = "idea"
  AND status != "rejected"
  AND status != "archived"
SORT file.mtime DESC
```

## 缺少知识依据的想法

```dataview
TABLE
  status AS "状态",
  dateformat(file.mtime, "MM/dd HH:mm") AS "更新"
FROM "02 Projects"
WHERE type = "idea"
  AND !knowledge
SORT file.mtime DESC
```

## 可开展实验的想法

```dataview
TABLE
  project AS "项目",
  experiments AS "实验",
  dateformat(file.mtime, "MM/dd HH:mm") AS "更新"
FROM "02 Projects"
WHERE type = "idea"
  AND status = "testable"
SORT file.mtime DESC
```

## 尚无实验的可检验想法

```dataview
TABLE
  project AS "项目",
  knowledge AS "知识",
  dateformat(file.mtime, "MM/dd HH:mm") AS "更新"
FROM "02 Projects"
WHERE type = "idea"
  AND status = "testable"
  AND !experiments
SORT file.mtime DESC
```

## 最近否定的想法

```dataview
TABLE
  project AS "项目",
  dateformat(file.mtime, "MM/dd HH:mm") AS "更新"
FROM "02 Projects"
WHERE type = "idea"
  AND status = "rejected"
SORT file.mtime DESC
```
