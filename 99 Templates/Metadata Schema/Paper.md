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
        "0": unread
        "1": reading
        "2": read
        "3": archived
    id: research-paper-status
    path: ""
---

论文的 `status` 只能从阅读生命周期中选择。
