---
mapWithTag: true
tagNames:
  - experiment
fields:
  - name: status
    type: Select
    options:
      sourceType: ValuesList
      valuesList:
        "0": 准备中
        "1": 进行中
        "2": 已结束
    id: research-experiment-status
    path: ""
---

实验的 `status` 只能从 `准备中`、`进行中`、`已结束` 中选择。取消或正常完成的原因记录在结论中。
