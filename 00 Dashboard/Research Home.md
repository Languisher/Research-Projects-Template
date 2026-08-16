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
  AND (status = "进行中" OR status = "已暂停")
SORT status ASC, file.mtime DESC
```

## 所有待办

```dataviewjs
await dv.view("99 Templates/Views/Dashboard Todos");
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
  AND (status = "准备中" OR status = "进行中")
SORT status DESC, file.mtime DESC
```

## 导航

[[Projects|项目]] · [[Research Questions|研究问题]] · [[Papers|论文]] · [[Ideas|想法]] · [[Experiments|实验]] · [[00 Dashboard/Knowledge|知识]] · [[Meetings|会议]] · [[00 Dashboard/Tasks|任务]]
