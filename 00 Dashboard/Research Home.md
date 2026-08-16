---
cssclasses:
  - research-home
---

# 研究主页

## 当前项目

```dataview
TABLE WITHOUT ID
  file.link AS "项目",
  status AS "状态",
  dateformat(file.mtime, "MM/dd HH:mm") AS "更新"
FROM "02 Projects"
WHERE type = "project"
  AND (status = "active" OR status = "blocked")
SORT status ASC, file.mtime DESC
```

## 下一步实验

```dataview
TABLE WITHOUT ID
  file.link AS "实验",
  project AS "项目",
  status AS "状态",
  dateformat(file.mtime, "MM/dd HH:mm") AS "更新"
FROM "02 Projects"
WHERE type = "experiment"
  AND (status = "ready" OR status = "running")
SORT status DESC, file.mtime DESC
```

## 导航

[[00 Dashboard/Projects|项目]] · [[00 Dashboard/Research Questions|研究问题]] · [[00 Dashboard/Papers|论文]] · [[00 Dashboard/Ideas|想法]] · [[00 Dashboard/Experiments|实验]] · [[03 Meetings/Meetings|会议]] · [[00 Dashboard/Tasks|任务]] · [[00 Dashboard/Workflow Review|工作流检查]]
