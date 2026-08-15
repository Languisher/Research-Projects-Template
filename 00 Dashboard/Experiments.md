[[00 Dashboard/Research Home|← 研究主页]] · [[00 Dashboard/Projects|项目]] · [[00 Dashboard/Ideas|想法]]

## 实验流程

```dataview
TABLE
  status AS "状态",
  project AS "项目",
  idea AS "想法",
  planned_date AS "计划日期",
  dateformat(file.mtime, "MM/dd HH:mm") AS "更新"
FROM "02 Projects"
WHERE type = "experiment"
  AND status != "closed"
  AND status != "cancelled"
SORT status ASC, file.mtime DESC
```

## 准备执行

```dataview
TABLE
  project AS "项目",
  idea AS "想法",
  planned_date AS "计划日期"
FROM "02 Projects"
WHERE type = "experiment"
  AND status = "ready"
SORT planned_date ASC
```

## 信息缺失

```dataview
TABLE
  status AS "状态",
  project AS "项目",
  idea AS "想法",
  dateformat(file.mtime, "MM/dd HH:mm") AS "更新"
FROM "02 Projects"
WHERE type = "experiment"
  AND (!project OR !idea)
SORT file.mtime DESC
```

## 最近完成分析或关闭

```dataview
TABLE
  status AS "状态",
  project AS "项目",
  idea AS "想法",
  completed_date AS "完成日期",
  dateformat(file.mtime, "MM/dd HH:mm") AS "更新"
FROM "02 Projects"
WHERE type = "experiment"
  AND (status = "analyzed" OR status = "closed")
SORT file.mtime DESC
LIMIT 10
```

## 实验任务

```tasks
not done
path includes 02 Projects
path includes Experiments
sort by due
sort by priority
```
