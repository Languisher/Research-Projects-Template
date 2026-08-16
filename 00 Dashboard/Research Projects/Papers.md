[[Research Home|← 研究主页]] · [[Ideas|想法]]

## 待读论文

```dataview
TABLE
  status AS "状态",
  title AS "标题",
  project AS "项目"
FROM "05 Papers"
WHERE type = "paper"
  AND (status = "未读" OR status = "阅读中")
SORT status DESC, file.mtime DESC
```

## 已读但尚未提炼知识的论文

```dataview
TABLE
  title AS "标题",
  project AS "项目"
FROM "05 Papers"
WHERE type = "paper"
  AND status = "已读"
  AND !knowledge
SORT file.mtime ASC
```
