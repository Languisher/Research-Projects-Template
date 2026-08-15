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
        "0": proposed
        "1": planned
        "2": ready
        "3": running
        "4": analyzed
        "5": closed
        "6": cancelled
    id: research-experiment-status
    path: ""
---

实验的 `status` 只能从既定生命周期中选择。
