---
cssclasses:
  - research-dashboard
---

[[Research Home|← 研究主页]] · [[Papers|论文]] · [[Projects|项目]] · [[00 Dashboard/Tasks|任务]]

## 知识条目

```dataview
TABLE WITHOUT ID
  file.link AS "知识",
  status AS "状态",
  sources AS "来源",
  dateformat(file.mtime, "MM/dd HH:mm") AS "更新"
FROM "04 Knowledge"
WHERE type = "knowledge"
  AND status != "已归档"
SORT choice(
  status = "草稿", 1,
  choice(status = "有效", 2, 3)
) ASC, file.mtime DESC
```

## 归档知识

```dataview
TABLE WITHOUT ID
  file.link AS "知识",
  status AS "状态",
  sources AS "来源",
  dateformat(file.mtime, "MM/dd HH:mm") AS "更新"
FROM "04 Knowledge"
WHERE type = "knowledge"
  AND status = "已归档"
SORT file.mtime DESC
```
