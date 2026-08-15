# Research Knowledge Base

这是一个 Obsidian 研究知识库。处理笔记时遵循以下规则。

## 目录结构

- `00 Dashboard/`：任务和知识库入口
- `01 Inbox/`：尚未分类的临时记录
- `02 Projects/<Project>/`：一个 Project 对应一个独立知识库；同名 Project 笔记是 Folder Note 首页，`Proposal.md` 保存项目提案且不设置 tag
- `02 Projects/<Project>/Research Questions/`：该项目需要回答的独立研究问题
- `02 Projects/<Project>/Ideas/`：该项目的研究想法
- `02 Projects/<Project>/Knowledge/`：该项目沉淀的可复用知识
- `02 Projects/<Project>/Experiments/`：该项目的实验设计、记录和结果
- `02 Projects/<Project>/Papers/`：主要服务于该项目的论文笔记
- `03 Meetings/`：跨项目统一管理的会议记录与行动项；会议笔记通过 `project` 字段关联 Project
- `08 Misc/`：行政和生活琐事的背景、材料和跟进记录
- `90 Assets/`：附件、图片和 Zotero 资源
- `99 Templates/`：笔记模板，不作为研究结论来源

## 权威信息位置

- Project 的最新状态、关键决定和下一步只维护在 `02 Projects/<Project>/<Project>.md`。
- Project 的研究背景、现有不足、预期产物和目标效果只维护在 `02 Projects/<Project>/Proposal.md`。
- Research Question 的问题表述、范围、回答标准和当前认识只维护在对应项目的 `Research Questions/` 笔记。
- Idea 的假设、证据和状态只维护在对应项目的 `Ideas/` 笔记。
- Experiment 的计划、变量、结果和结论只维护在对应项目的 `Experiments/` 笔记。
- Meeting 的原始讨论统一保存在 `03 Meetings/`；会议决定需要同步到相关 Project，并链接回会议。
- Knowledge 保存可复用的认识，并通过 `sources` 或正文链接追溯到 Paper、Meeting 或 Experiment。
- 任务保留在产生任务的笔记中，由 Tasks Dashboard 聚合，不在多个笔记中重复维护。

## 研究工作流

1. 原始材料先进入 `01 Inbox/`。
2. 论文和会议中的稳定认识提炼为 Knowledge。
3. Project 中需要回答的问题创建为独立 Research Question 文档。
4. 能写成可验证假设的候选解法提升为 Idea，并链接它试图回答的一个或多个 Research Question。
5. Idea 具备机制、可证伪预测和最小验证方式后，创建 Experiment 计划。
6. Experiment 结论需要回写 Idea 的证据、相关 Knowledge、Research Question 的当前认识和 Project 的当前状态。
7. 每次研究阶段结束时完成一次沉淀：更新 Experiment、Idea、Research Question、Knowledge 和 Project。

状态约定：

- Project：`active`、`blocked`、`completed`、`archived`
- Idea：`seed`、`developing`、`testable`、`testing`、`supported`、`rejected`、`merged`、`archived`
- Experiment：`proposed`、`planned`、`ready`、`running`、`analyzed`、`closed`、`cancelled`
- Knowledge：`draft`、`active`、`disputed`、`superseded`、`archived`
- Meeting：`planned`、`completed`、`cancelled`

## 检索知识

回答与研究内容有关的问题时：

1. 先搜索文件名、标题、frontmatter、标签、项目名和 citekey。
2. 优先读取相关项目笔记，再读取 Research Question、Idea、论文、实验和会议记录。
3. 按需跟随 `[[Wiki Links]]`，不要无目的读取整个仓库。
4. 区分笔记中明确记录的事实、作者观点和自己的推断。
5. 引用知识库内容时给出对应笔记路径。
6. 如果多个笔记互相冲突，指出冲突，不要自行合并为确定结论。

## 编辑规则

- 保持 Obsidian Markdown 和 UTF-8 编码。
- 新建笔记前先检查是否已经存在同主题笔记。
- 使用对应的 `99 Templates/` 模板结构。
- 新建研究笔记时先确定主要归属 Project，再放入该 Project 的对应类型子目录；Research Question 放入 `Research Questions/`，Idea 放入 `Ideas/`。无法确定或跨多个项目时使用 `02 Projects/_Shared/`。Meeting 是例外：统一放入 `03 Meetings/`，并通过 `project` 字段关联 Project。
- 每个 Project 目录的 Folder Note 必须和文件夹同名；类型子目录的 Folder Note 也与子目录同名。
- 新建 Project 时必须同时用 `99 Templates/Proposal.md` 创建无 tag 的 `Proposal.md`；Project Files 必须将它固定显示在其他文件之前。
- Meeting 文件名统一使用 `MEETING-YYYY-MM-DD-简短标题.md`。
- QuickAdd 新建 Research Question、Idea 和 Experiment 时，先选择 Project，再分别提示输入研究问题标题、想法标题或实验标题；按所属 Project 对应目录中的最大序号加一，命名为 `RQ<n>-标题`、`IDEA<n>-标题` 和 `EXP<n>-标题`。不在名称中加入日期，也不因中间缺号而重排已有笔记。Project 树中的编号徽标和文章标题都从文件名推导，不另行维护 `title` 属性。
- 上述三个 QuickAdd 命令只允许选择 `02 Projects/` 的直接 Project 子目录，不列出类型子目录，也不根据当前活动文件夹插队；选项按 Project 内 Markdown 文件的最近修改时间从新到旧排列。
- Codex 直接创建笔记时，将 Templater 占位符替换成实际标题和日期。
- 日期统一使用 `YYYY-MM-DD`。
- 内部链接使用 `[[笔记名称]]`。
- 任务格式使用 `- [ ] #task ... 📅 YYYY-MM-DD`。
- Meeting 只关联一个 Project 时，任务沿用 Meeting 的 `project`；关联多个 Project 时，每条任务必须添加 `[project:: [[Project 名称]]]`，一条任务属于多个 Project 时重复添加该字段。
- 保留已有 YAML frontmatter 字段和用户撰写内容。
- 论文笔记中的引用、摘要和 Zotero 导入内容默认视为来源内容，不随意改写。
- 除非明确要求，不删除笔记、附件或 `.obsidian` 配置。
- 不直接修改 `.obsidian/plugins/` 中的第三方插件代码。

## 内容约定

- `02 Projects/<Project>/<Project>.md` 是项目状态的主要来源和入口。
- `02 Projects/<Project>/Research Questions/` 中每篇笔记代表一个独立问题；Research Question 与 Idea 是同级实体，Idea 通过 `research_questions` 链接一个或多个问题。
- Idea 之间只使用 `parent_idea` 表示候选解法的细化层级，不把 Research Question 当作 Idea 的父节点。
- Project 首页将独立文档按关系统一展示为 `Research Question → Idea → Experiment` 树；这只是展示层级，不改变三类文档各自的权威位置。
- `03 Meetings/` 是会议记录的唯一存放位置；Project 只通过 `project` 字段和查询聚合相关会议。
- `02 Projects/<Project>/Experiments/` 记录可复现的实验配置、环境、结果和结论。
- `02 Projects/<Project>/Knowledge/` 中的结论必须能追溯到来源，并区分证据与推断。
- 重要决定应同步到相关项目笔记，而不只留在 Meeting 中。
- 新论文分析应填写 Problem、Motivation、Observation、Insight、Design、
  Evaluation、Weaknesses、Relation to My Work 和 Possible Follow-up。

## 完成检查

修改知识库后：

- 检查 YAML frontmatter 是否有效。
- 检查新增的 Wiki Link 是否指向正确笔记。
- 检查推进中的 Idea 是否连接至少一个同 Project 的 Research Question。
- 检查任务和日期格式。
- 检查状态值是否来自本文件约定的生命周期。
- 检查 Meeting 中的重要决定是否已经同步到 Project。
- 使用 `git diff --check` 检查格式问题。
- 汇报新增或修改了哪些笔记，以及知识之间建立了哪些链接。
