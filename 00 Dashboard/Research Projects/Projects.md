[[Research Home|← 研究主页]] · [[Research Questions|研究问题]] · [[Ideas|想法]] · [[Experiments|实验]] · [[00 Dashboard/Tasks|任务]]

## 当前项目

```dataview
TABLE
  status AS "状态",
  research_area AS "研究领域",
  dateformat(file.mtime, "MM/dd HH:mm") AS "更新"
FROM "02 Projects"
WHERE type = "project"
  AND (status = "进行中" OR status = "已暂停")
SORT status ASC, file.mtime DESC
```
