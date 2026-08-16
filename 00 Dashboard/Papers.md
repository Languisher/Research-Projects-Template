[[00 Dashboard/Research Home|← 研究主页]] · [[00 Dashboard/Ideas|想法]]

## 待读论文

```dataview
TABLE
  status AS "状态",
  title AS "标题",
  project AS "项目"
FROM "02 Projects"
WHERE type = "paper"
  AND (status = "unread" OR status = "reading")
SORT status DESC, file.mtime DESC
```

## 已读但尚未提炼知识的论文

```dataview
TABLE
  title AS "标题",
  project AS "项目"
FROM "02 Projects"
WHERE type = "paper"
  AND status = "read"
  AND !knowledge
SORT file.mtime ASC
```
