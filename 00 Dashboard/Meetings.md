---
cssclasses:
  - research-dashboard
---

[[Research Home|← 研究主页]] · [[Projects|项目]] · [[00 Dashboard/Tasks|任务]]

```dataviewjs
await dv.view("99 Templates/Views/Meeting Status Sync");
```

## 即将召开

```dataview
TABLE
  date AS "日期",
  time AS "时间",
  project AS "项目",
  meeting_type AS "会议类型",
  participants AS "参与者",
  choice(
    date <= date(today) + dur(3 days),
    link("_UI-Urgency-Strong", "3 天内"),
    choice(
      date <= date(today) + dur(7 days),
      link("_UI-Urgency-Medium", "7 天内"),
      choice(
        date <= date(today) + dur(30 days),
        link("_UI-Urgency-Soft", "1 个月内"),
        link("_UI-Urgency-Normal", "稍后")
      )
    )
  ) AS "_紧急程度"
FROM "03 Meetings"
WHERE type = "meeting"
  AND status != "已取消"
  AND (
    date > date(today)
    OR (
      date = date(today)
      AND (
        number(split(string(time), ":")[0]) > date(now).hour
        OR (
          number(split(string(time), ":")[0]) = date(now).hour
          AND number(split(string(time), ":")[1]) > date(now).minute
        )
      )
    )
  )
SORT date ASC,
  number(split(string(time), ":")[0]) ASC,
  number(split(string(time), ":")[1]) ASC
```

## 最近会议

```dataview
TABLE
  date AS "日期",
  time AS "时间",
  project AS "项目",
  meeting_type AS "会议类型",
  participants AS "参与者",
  choice(
    date >= date(today) - dur(3 days),
    link("_UI-Urgency-Strong", "3 天内"),
    choice(
      date >= date(today) - dur(7 days),
      link("_UI-Urgency-Medium", "7 天内"),
      choice(
        date >= date(today) - dur(30 days),
        link("_UI-Urgency-Soft", "1 个月内"),
        link("_UI-Urgency-Normal", "更早")
      )
    )
  ) AS "_紧急程度"
FROM "03 Meetings"
WHERE type = "meeting"
  AND status != "已取消"
  AND (
    date < date(today)
    OR (
      date = date(today)
      AND (
        number(split(string(time), ":")[0]) < date(now).hour
        OR (
          number(split(string(time), ":")[0]) = date(now).hour
          AND number(split(string(time), ":")[1]) <= date(now).minute
        )
      )
    )
  )
SORT date DESC,
  number(split(string(time), ":")[0]) DESC,
  number(split(string(time), ":")[1]) DESC
```

## 未完成的会议行动项

```tasks
not done
path includes 03 Meetings
path does not include 98 Docs
sort by due
sort by priority
```
