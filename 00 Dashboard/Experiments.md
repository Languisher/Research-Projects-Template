[[00 Dashboard/Research Home|← 研究主页]] · [[00 Dashboard/Projects|项目]] · [[00 Dashboard/Ideas|想法]]

## 当前实验

```dataview
TABLE
  status AS "状态",
  project AS "项目",
  idea AS "想法",
  planned_date AS "计划日期"
FROM "02 Projects"
WHERE type = "experiment"
  AND status != "closed"
  AND status != "cancelled"
SORT status ASC, file.mtime DESC
```

## 准备执行与运行中

```dataview
TABLE
  project AS "项目",
  idea AS "想法",
  planned_date AS "计划日期"
FROM "02 Projects"
WHERE type = "experiment"
  AND (status = "ready" OR status = "running")
SORT planned_date ASC
```
