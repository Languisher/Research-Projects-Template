[[00 Dashboard/Research Home|← 研究主页]] · [[01 Inbox/Inbox|收件箱]] · [[00 Dashboard/Tasks|任务]]

## 未连接研究问题的想法

```dataview
TABLE
  status AS "状态",
  project AS "项目",
  parent_idea AS "父想法",
  dateformat(file.mtime, "MM/dd HH:mm") AS "更新"
FROM "02 Projects"
WHERE type = "idea"
  AND (!research_questions OR length(research_questions) = 0)
  AND status != "archived"
  AND status != "rejected"
SORT file.mtime ASC
```

## 缺少知识依据的想法

```dataview
TABLE
  status AS "状态",
  project AS "项目",
  dateformat(file.mtime, "MM/dd HH:mm") AS "更新"
FROM "02 Projects"
WHERE type = "idea"
  AND !knowledge
  AND status != "archived"
  AND status != "rejected"
SORT file.mtime ASC
```

## 尚无实验的可检验想法

```dataview
TABLE
  project AS "项目",
  dateformat(file.mtime, "MM/dd HH:mm") AS "更新"
FROM "02 Projects"
WHERE type = "idea"
  AND status = "testable"
  AND !experiments
SORT file.mtime ASC
```

## 缺少项目或想法的实验

```dataview
TABLE
  status AS "状态",
  project AS "项目",
  idea AS "想法",
  dateformat(file.mtime, "MM/dd HH:mm") AS "更新"
FROM "02 Projects"
WHERE type = "experiment"
  AND (!project OR !idea)
SORT file.mtime ASC
```

## 缺少来源的知识

```dataview
TABLE
  kind AS "类型",
  status AS "状态",
  dateformat(file.mtime, "MM/dd HH:mm") AS "更新"
FROM "02 Projects"
WHERE type = "knowledge"
  AND !sources
  AND status != "archived"
SORT file.mtime ASC
```

## 长期未更新的项目

```dataview
TABLE
  status AS "状态",
  research_area AS "研究领域",
  dateformat(file.mtime, "MM/dd HH:mm") AS "更新"
FROM "02 Projects"
WHERE type = "project"
  AND (status = "active" OR status = "blocked")
  AND file.mtime < date(today) - dur(14 days)
SORT file.mtime ASC
```

## 每周检查清单

- [ ] 清空或分类 [[01 Inbox/Inbox|Inbox]]
- [ ] 为每个推进中的 Idea 连接至少一个 Research Question
- [ ] 检查缺少知识依据的想法
- [ ] 为可检验的想法创建实验
- [ ] 处理缺少项目或想法的实验
- [ ] 为知识补充来源、边界条件和置信度
- [ ] 关闭已完成会议的行动项
- [ ] 更新每个进行中项目的当前状态
- [ ] 每个进行中项目只保留一个下一步具体行动
- [ ] 将停止推进的内容标记为 rejected、cancelled、superseded 或 archived
