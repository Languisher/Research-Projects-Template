---
mapWithTag: true
tagNames:
  - paper
fields:
  - name: status
    type: Select
    options:
      sourceType: ValuesList
      valuesList:
        "0": 未读
        "1": 阅读中
        "2": 已读
    id: research-paper-status
    path: ""
---

论文的 `status` 只能从 `未读`、`阅读中`、`已读` 中选择。
