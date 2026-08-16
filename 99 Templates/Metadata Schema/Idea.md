---
mapWithTag: true
tagNames:
  - idea
fields:
  - name: status
    type: Select
    options:
      sourceType: ValuesList
      valuesList:
        "0": 构思中
        "1": 验证中
        "2": 已结束
    id: research-idea-status
    path: ""
---

想法的 `status` 只能从 `构思中`、`验证中`、`已结束` 中选择。支持、否定或合并等具体结果记录在正文的证据与判断中。

- `research_questions`：链接这个 Idea 尝试回答的一个或多个 Research Question 文档。
- `parent_idea`：只链接一个直接父 Idea；顶层 Idea 留空，层级深度由父链推导。
