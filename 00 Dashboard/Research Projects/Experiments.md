[[Research Home|← 研究主页]] · [[Projects|项目]] · [[Ideas|想法]]

## 当前实验

```dataview
TABLE
  status AS "状态",
  project AS "项目",
  idea AS "想法",
  planned_date AS "计划日期"
FROM "02 Projects"
WHERE type = "experiment"
  AND status != "已结束"
SORT status ASC, file.mtime DESC
```

## 下一步实验

```dataview
TABLE
  project AS "项目",
  idea AS "想法",
  planned_date AS "计划日期"
FROM "02 Projects"
WHERE type = "experiment"
  AND (status = "准备中" OR status = "进行中")
SORT planned_date ASC
```
