[[00 Dashboard/Research Home|← 研究主页]] · [[00 Dashboard/Research Questions|研究问题]] · [[00 Dashboard/Experiments|实验]] · [[00 Dashboard/Workflow Review|工作流检查]]

## 当前想法

```dataview
TABLE
  status AS "状态",
  project AS "项目",
  research_questions AS "研究问题",
  dateformat(file.mtime, "MM/dd HH:mm") AS "更新"
FROM "02 Projects"
WHERE type = "idea"
  AND status != "rejected"
  AND status != "archived"
SORT file.mtime DESC
```

## 待创建实验

```dataview
TABLE
  project AS "项目",
  research_questions AS "研究问题"
FROM "02 Projects"
WHERE type = "idea"
  AND status = "testable"
  AND !experiments
SORT file.mtime DESC
```
