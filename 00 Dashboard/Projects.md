[[00 Dashboard/Research Home|← 研究主页]] · [[00 Dashboard/Research Questions|研究问题]] · [[00 Dashboard/Ideas|想法]] · [[00 Dashboard/Experiments|实验]] · [[00 Dashboard/Tasks|任务]]

## 进行中的项目

```dataview
TABLE
  research_area AS "研究领域",
  filter(file.inlinks, (link) => contains(meta(link).path, "/Research Questions/")) AS "研究问题",
  filter(file.inlinks, (link) => contains(meta(link).path, "/Ideas/")) AS "想法",
  filter(file.inlinks, (link) => contains(meta(link).path, "/Experiments/")) AS "实验",
  slice(reverse(sort(filter(file.inlinks, (link) => contains(meta(link).path, "03 Meetings/")))), 0, 5) AS "最近会议",
  dateformat(file.mtime, "MM/dd HH:mm") AS "更新"
FROM "02 Projects"
WHERE type = "project"
  AND status = "active"
SORT file.mtime DESC
```

## 受阻项目

```dataview
TABLE
  research_area AS "研究领域",
  filter(file.inlinks, (link) => contains(meta(link).path, "/Research Questions/")) AS "研究问题",
  filter(file.inlinks, (link) => contains(meta(link).path, "/Ideas/")) AS "想法",
  filter(file.inlinks, (link) => contains(meta(link).path, "/Experiments/")) AS "实验",
  slice(reverse(sort(filter(file.inlinks, (link) => contains(meta(link).path, "03 Meetings/")))), 0, 5) AS "最近会议",
  dateformat(file.mtime, "MM/dd HH:mm") AS "更新"
FROM "02 Projects"
WHERE type = "project"
  AND status = "blocked"
SORT file.mtime DESC
```

## 最近完成

```dataview
TABLE
  research_area AS "研究领域",
  dateformat(file.mtime, "MM/dd HH:mm") AS "更新"
FROM "02 Projects"
WHERE type = "project"
  AND status = "completed"
SORT file.mtime DESC
LIMIT 10
```

## 所有项目相关任务

```tasks
not done
path includes 02 Projects
sort by due
sort by priority
```
