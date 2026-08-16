---
cssclasses:
  - research-dashboard
---

[[00 Dashboard/Research Home|← 研究主页]] · [[00 Dashboard/Projects|项目]] · [[00 Dashboard/Experiments|实验]] · [[03 Meetings/Meetings|会议]]

## 逾期与今日到期

```dataview
TABLE WITHOUT ID
  regexreplace(task.text, "#task\\s*", "") AS "任务",
  task.due AS "截止日期",
  file.link AS "来源"
FROM ""
FLATTEN file.tasks AS task
WHERE !task.completed
  AND (contains(task.tags, "#task") OR contains(task.text, "#task"))
  AND !contains(task.text, "#waiting")
  AND !contains(task.text, "YYYY-MM-DD")
  AND task.due
  AND task.due <= date(today)
  AND !startswith(file.path, "99 Templates/")
  AND !startswith(file.path, "98 Docs/")
  AND file.path != "README.md"
SORT task.due ASC, file.path ASC
```

## 未设截止日期的任务

```dataview
TABLE WITHOUT ID
  regexreplace(task.text, "#task\\s*", "") AS "任务",
  file.link AS "来源"
FROM ""
FLATTEN file.tasks AS task
WHERE !task.completed
  AND (contains(task.tags, "#task") OR contains(task.text, "#task"))
  AND !contains(task.text, "#waiting")
  AND !contains(task.text, "YYYY-MM-DD")
  AND !task.due
  AND !startswith(file.path, "99 Templates/")
  AND !startswith(file.path, "98 Docs/")
  AND file.path != "README.md"
SORT file.path ASC
```

## 等待外部方

```dataview
TABLE WITHOUT ID
  regexreplace(regexreplace(task.text, "#task\\s*", ""), "#waiting\\s*", "") AS "等待事项",
  file.link AS "来源"
FROM ""
FLATTEN file.tasks AS task
WHERE !task.completed
  AND (contains(task.tags, "#task") OR contains(task.text, "#task"))
  AND (contains(task.tags, "#waiting") OR contains(task.text, "#waiting"))
  AND !contains(task.text, "YYYY-MM-DD")
  AND !startswith(file.path, "99 Templates/")
  AND !startswith(file.path, "98 Docs/")
  AND file.path != "README.md"
SORT file.mtime DESC, file.path ASC
```
