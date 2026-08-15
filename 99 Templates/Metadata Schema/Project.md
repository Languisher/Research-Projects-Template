---
mapWithTag: true
tagNames:
  - project
fields:
  - name: status
    type: Select
    options:
      sourceType: ValuesList
      valuesList:
        "0": active
        "1": blocked
        "2": completed
        "3": archived
    id: research-project-status
    path: ""
---

项目的 `status` 只能从 `active`、`blocked`、`completed`、`archived` 中选择。
