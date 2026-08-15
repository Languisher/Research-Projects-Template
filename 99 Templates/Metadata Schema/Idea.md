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
        "0": seed
        "1": developing
        "2": testable
        "3": testing
        "4": supported
        "5": rejected
        "6": merged
        "7": archived
    id: research-idea-status
    path: ""
---

想法的 `status` 只能从既定生命周期中选择。

- `research_questions`：链接这个 Idea 尝试回答的一个或多个 Research Question 文档。
- `parent_idea`：只链接一个直接父 Idea；顶层 Idea 留空，层级深度由父链推导。
