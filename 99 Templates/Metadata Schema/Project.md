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
        "0": 进行中
        "1": 已暂停
        "2": 已完成
    id: research-project-status
    path: ""
---

项目的 `status` 只能从 `进行中`、`已暂停`、`已完成` 中选择。
