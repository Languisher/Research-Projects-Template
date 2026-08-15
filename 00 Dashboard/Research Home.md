---
cssclasses:
  - research-home
---

# 研究主页

## 研究主题

```dataview
TABLE WITHOUT ID
  file.link AS "项目",
  research_area AS "研究领域",
  status AS "状态",
  dateformat(file.mtime, "MM/dd HH:mm") AS "更新"
FROM "02 Projects"
WHERE type = "project"
  AND (status = "active" OR status = "blocked")
SORT status ASC, file.mtime DESC
```

## 进行中的实验

```dataview
TABLE WITHOUT ID
  file.link AS "实验",
  project AS "项目",
  status AS "状态",
  dateformat(file.mtime, "MM/dd HH:mm") AS "更新"
FROM "02 Projects"
WHERE type = "experiment"
  AND (status = "planned" OR status = "ready" OR status = "running")
SORT file.mtime DESC
```

## 最近更新的研究问题

```dataview
TABLE WITHOUT ID
  file.link AS "研究问题",
  project AS "项目",
  filter(file.inlinks, (link) => contains(meta(link).path, "/Ideas/")) AS "相关 Ideas",
  dateformat(file.mtime, "MM/dd HH:mm") AS "更新"
FROM "02 Projects"
WHERE type = "research-question"
SORT file.mtime DESC
LIMIT 8
```

## 可检验的想法

```dataview
TABLE WITHOUT ID
  file.link AS "想法",
  project AS "项目",
  research_questions AS "研究问题",
  experiments AS "实验",
  dateformat(file.mtime, "MM/dd HH:mm") AS "更新"
FROM "02 Projects"
WHERE type = "idea"
  AND status = "testable"
SORT file.mtime DESC
```

## 最近证据

### 论文

```dataview
TABLE WITHOUT ID
  file.link AS "论文",
  status AS "状态",
  project AS "项目",
  dateformat(file.mtime, "MM/dd HH:mm") AS "更新"
FROM "02 Projects"
WHERE type = "paper"
SORT file.mtime DESC
LIMIT 6
```

### 知识

```dataview
TABLE WITHOUT ID
  file.link AS "知识",
  status AS "状态",
  sources AS "来源",
  dateformat(file.mtime, "MM/dd HH:mm") AS "更新"
FROM "02 Projects"
WHERE type = "knowledge"
SORT file.mtime DESC
LIMIT 6
```

## 导航

[[00 Dashboard/Projects|项目]] · [[00 Dashboard/Research Questions|研究问题]] · [[00 Dashboard/Papers|论文]] · [[00 Dashboard/Ideas|想法]] · [[00 Dashboard/Experiments|实验]] · [[03 Meetings/Meetings|会议]] · [[00 Dashboard/Tasks|任务]] · [[00 Dashboard/Workflow Review|工作流检查]]
