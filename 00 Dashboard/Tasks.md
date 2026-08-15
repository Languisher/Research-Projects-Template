---
cssclasses:
  - research-dashboard
---

[[00 Dashboard/Research Home|← 研究主页]] · [[00 Dashboard/Projects|项目]] · [[00 Dashboard/Experiments|实验]] · [[03 Meetings/Meetings|会议]]

## 逾期与到期任务（按日期）

```dataview
TABLE WITHOUT ID
  regexreplace(regexreplace(task.text, "#task\\s*", ""), "\\s*(🔺|⏫|🔼|🔽|⏬)\\s*", "") AS "任务",
  task.due AS "截止日期",
  choice(
    priority_rank = 5,
    "最高",
    choice(
      priority_rank = 4,
      "高",
      choice(
        priority_rank = 3,
        "中",
        choice(priority_rank = 1, "低", choice(priority_rank = 0, "最低", "普通"))
      )
    )
  ) AS "优先级",
  file.link AS "来源",
  choice(
    task.due < date(today),
    link("_UI-Urgency-Overdue", "逾期"),
    link("_UI-Urgency-Strong", "今天")
  ) AS "_紧急程度"
FROM ""
FLATTEN file.tasks AS task
FLATTEN choice(
  contains(task.text, "🔺"),
  5,
  choice(
    contains(task.text, "⏫"),
    4,
    choice(contains(task.text, "🔼"), 3, choice(contains(task.text, "🔽"), 1, choice(contains(task.text, "⏬"), 0, 2)))
  )
) AS priority_rank
WHERE !task.completed
  AND (contains(task.tags, "#task") OR contains(task.text, "#task"))
  AND !contains(task.text, "#waiting")
  AND !contains(task.text, "YYYY-MM-DD")
  AND task.due
  AND task.due <= date(today)
  AND !startswith(file.path, "99 Templates/")
  AND !startswith(file.path, "98 Docs/")
  AND file.path != "README.md"
SORT task.due ASC, priority_rank DESC, file.path ASC
```

## 逾期与到期任务（按优先级）

```dataview
TABLE WITHOUT ID
  regexreplace(regexreplace(task.text, "#task\\s*", ""), "\\s*(🔺|⏫|🔼|🔽|⏬)\\s*", "") AS "任务",
  choice(
    priority_rank = 5,
    "最高",
    choice(
      priority_rank = 4,
      "高",
      choice(
        priority_rank = 3,
        "中",
        choice(priority_rank = 1, "低", choice(priority_rank = 0, "最低", "普通"))
      )
    )
  ) AS "优先级",
  task.due AS "截止日期",
  file.link AS "来源",
  choice(
    priority_rank >= 4,
    link("_UI-Priority-High", "高"),
    choice(
      priority_rank = 3,
      link("_UI-Priority-Medium", "中"),
      choice(priority_rank <= 1, link("_UI-Priority-Low", "低"), link("_UI-Priority-Normal", "普通"))
    )
  ) AS "_优先级"
FROM ""
FLATTEN file.tasks AS task
FLATTEN choice(
  contains(task.text, "🔺"),
  5,
  choice(
    contains(task.text, "⏫"),
    4,
    choice(contains(task.text, "🔼"), 3, choice(contains(task.text, "🔽"), 1, choice(contains(task.text, "⏬"), 0, 2)))
  )
) AS priority_rank
WHERE !task.completed
  AND (contains(task.tags, "#task") OR contains(task.text, "#task"))
  AND !contains(task.text, "#waiting")
  AND !contains(task.text, "YYYY-MM-DD")
  AND task.due
  AND task.due <= date(today)
  AND !startswith(file.path, "99 Templates/")
  AND !startswith(file.path, "98 Docs/")
  AND file.path != "README.md"
SORT priority_rank DESC, task.due ASC, file.path ASC
```

## 未设截止日期的任务

```dataview
TABLE WITHOUT ID
  regexreplace(regexreplace(task.text, "#task\\s*", ""), "\\s*(🔺|⏫|🔼|🔽|⏬)\\s*", "") AS "任务",
  choice(
    priority_rank = 5,
    "最高",
    choice(
      priority_rank = 4,
      "高",
      choice(
        priority_rank = 3,
        "中",
        choice(priority_rank = 1, "低", choice(priority_rank = 0, "最低", "普通"))
      )
    )
  ) AS "优先级",
  file.link AS "来源",
  choice(
    priority_rank >= 4,
    link("_UI-Priority-High", "高"),
    choice(
      priority_rank = 3,
      link("_UI-Priority-Medium", "中"),
      choice(priority_rank <= 1, link("_UI-Priority-Low", "低"), link("_UI-Priority-Normal", "普通"))
    )
  ) AS "_优先级"
FROM ""
FLATTEN file.tasks AS task
FLATTEN choice(
  contains(task.text, "🔺"),
  5,
  choice(
    contains(task.text, "⏫"),
    4,
    choice(contains(task.text, "🔼"), 3, choice(contains(task.text, "🔽"), 1, choice(contains(task.text, "⏬"), 0, 2)))
  )
) AS priority_rank
WHERE !task.completed
  AND (contains(task.tags, "#task") OR contains(task.text, "#task"))
  AND !contains(task.text, "#waiting")
  AND !contains(task.text, "YYYY-MM-DD")
  AND !task.due
  AND !startswith(file.path, "99 Templates/")
  AND !startswith(file.path, "98 Docs/")
  AND file.path != "README.md"
SORT priority_rank DESC, file.path ASC
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

## 最近完成

```dataview
TABLE WITHOUT ID
  regexreplace(regexreplace(task.text, "#task\\s*", ""), "\\s*(🔺|⏫|🔼|🔽|⏬)\\s*", "") AS "任务",
  task.completion AS "完成日期",
  file.link AS "来源"
FROM ""
FLATTEN file.tasks AS task
WHERE task.completed
  AND (contains(task.tags, "#task") OR contains(task.text, "#task"))
  AND !contains(task.text, "YYYY-MM-DD")
  AND task.completion >= date(today) - dur(7 days)
  AND !startswith(file.path, "99 Templates/")
  AND !startswith(file.path, "98 Docs/")
  AND file.path != "README.md"
SORT task.completion DESC, file.path ASC
```
