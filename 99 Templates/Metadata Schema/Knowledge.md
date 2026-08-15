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
        "0": draft
        "1": active
        "2": disputed
        "3": superseded
        "4": archived
    id: research-knowledge-status
    path: ""
---

知识条目的 `status` 只能从既定生命周期中选择。
