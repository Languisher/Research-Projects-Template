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
        "0": 计划中
        "1": 已完成
        "2": 已取消
    id: research-meeting-status
    path: ""
---

会议的 `status` 只能从 `计划中`、`已完成`、`已取消` 中选择。
