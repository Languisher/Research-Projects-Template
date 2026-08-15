---
mapWithTag: true
tagNames:
  - meeting
fields:
  - name: status
    type: Select
    options:
      sourceType: ValuesList
      valuesList:
        "0": planned
        "1": completed
        "2": cancelled
    id: research-meeting-status
    path: ""
---

会议的 `status` 只能从既定生命周期中选择。
