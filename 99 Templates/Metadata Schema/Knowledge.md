---
mapWithTag: true
tagNames:
  - knowledge
fields:
  - name: status
    type: Select
    options:
      sourceType: ValuesList
      valuesList:
        "0": 草稿
        "1": 有效
        "2": 已归档
    id: research-knowledge-status
    path: ""
---

知识条目的 `status` 只能从 `草稿`、`有效`、`已归档` 中选择。争议、过时等情况在正文中说明。
