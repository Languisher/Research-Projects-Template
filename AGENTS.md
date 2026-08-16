# Research Knowledge Base

这是一个 Obsidian 研究知识库。处理笔记时遵循以下规则。

## 目录结构

- `00 Dashboard/`：自动汇总、导航和工作流检查；不在 Dashboard 中重复维护实体内容
- `01 Inbox/Inbox.md`：尚未分类的临时捕获
- `02 Projects/<Project>/`：一个 Project 对应一个独立研究知识库；`<Project>.md` 是同名 Folder Note 和项目入口
- `02 Projects/_Shared/`：跨项目或暂时无法确定唯一 Project 归属的研究材料
- `03 Meetings/`：跨项目统一管理的会议记录与行动项；`Meetings.md` 是汇总页，会议实体通过 `project` 字段关联 Project
- `04 Knowledge/<Knowledge>/`：一个 Knowledge 对应一个独立知识目录；`<Knowledge>.md` 是同名 Folder Note 和知识入口
- `08 Misc/`：行政、生活琐事和不属于研究实体的独立 Task 笔记
- `90 Assets/`：Project 与 Knowledge 之外的通用附件和图片；`Excalidraw/` 与 `Zotero/` 分别保存对应资源
- `99 Templates/`：笔记模板、Metadata Schema 和 Dataview Views；不作为研究结论来源

每个常规 Project 使用以下内部结构：

```text
02 Projects/<Project>/
├── <Project>.md
├── assets/                        # 当前 Project 的附件
├── Docs/
│   ├── Proposal.md
│   └── ...                    # 无 type 的普通项目文档，允许多级子目录
├── Research Questions/
│   ├── Research Questions.md  # type: index
│   └── RQ<n>-标题.md
├── Ideas/
│   ├── Ideas.md               # type: index
│   └── IDEA<n>-标题.md
├── Experiments/
│   ├── Experiments.md         # type: index
│   └── EXP<n>-标题.md
└── Papers/                        # 按需创建
```

`New Project` 默认创建 `assets/`、`Docs/`、`Research Questions/`、`Ideas/` 和 `Experiments/`。只有后三个默认包含同名索引笔记；`Docs/`、`assets/` 和 `Papers/` 不要为了对称而额外创建 Folder Note。

每个 Knowledge 使用以下结构：

```text
04 Knowledge/<Knowledge>/
├── <Knowledge>.md
├── assets/                        # 当前 Knowledge 的附件
└── Docs/                          # 无 type 的普通知识文档，允许多级子目录
```

Knowledge 首页复用 Project 首页的 To-dos 和 Project Files 视觉与文档树交互，但不显示时间线、Research 关系树或 Meetings。Project 与 Knowledge 的 Project Files 分组都不渲染卡片式外框。

## 权威信息位置

- Project 的最新状态、关键决定和下一步只维护在 `02 Projects/<Project>/<Project>.md`。
- Project 的研究背景、现有不足、预期产物和目标效果只维护在 `02 Projects/<Project>/Docs/Proposal.md`。
- Research Question 的问题表述、范围、回答标准和当前认识只维护在对应项目的 `Research Questions/` 笔记。
- Idea 的假设、证据和状态只维护在对应项目的 `Ideas/` 笔记。
- Experiment 的计划、变量、结果和结论只维护在对应项目的 `Experiments/` 笔记。
- Meeting 的原始讨论统一保存在 `03 Meetings/`；会议决定需要同步到相关 Project，并链接回会议。
- Knowledge 的可复用认识维护在 `04 Knowledge/<Knowledge>/<Knowledge>.md`，并通过 `sources` 或正文链接追溯到 Paper、Meeting 或 Experiment；补充材料放在同目录的 `Docs/`。
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
- Paper：`unread`、`reading`、`read`、`archived`

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
- 新建 Project 内实体时先确定主要归属 Project：Research Question、Idea、Experiment 和 Paper 放入对应 Project 的类型子目录。Knowledge 不选择 Project 或其他 Knowledge 作为归属，独立使用 `04 Knowledge/<Knowledge>/<Knowledge>.md` Folder Note，补充文档放入其 `Docs/`。其他无法确定或跨多个项目的研究材料使用 `02 Projects/_Shared/`。Meeting 是例外：统一放入 `03 Meetings/`，并通过 `project` 字段关联 Project。
- Project 与 Knowledge 的 Folder Note 必须与各自文件夹同名。`Research Questions/`、`Ideas/` 和 `Experiments/` 的索引笔记也必须与子目录同名，并使用 `99 Templates/Project Section.md`。
- 新建 Project 时必须同时创建上述默认目录、`assets/` 和索引，并用 `99 Templates/Proposal.md` 创建无 frontmatter、无 tag 的 `Docs/Proposal.md`。
- 普通项目文档只放入 `Docs/`，不设置 `type`；`Docs/` 下允许多级子目录。Project Files 镜像实际目录层级，将 Proposal 固定在最前，并将 DOC 与 Research 关系树分组显示且不渲染卡片式外框。
- `Docs/` 同层的 DOC 和 DIR 默认按名称自然排序。在 Project Files 中拖拽后，顺序以当前 Project 或 Knowledge 目录的相对路径写入其 Folder Note frontmatter 的 `doc_order`；未列入的项目仍按名称排列。调整 `doc_order` 不代表移动文件。
- Meeting 文件名统一使用 `MEETING-YYYY-MM-DD-简短标题.md`。
- QuickAdd 新建 Research Question、Idea 和 Experiment 时，先选择 Project，再分别提示输入标题；按所属 Project 对应目录中的最大序号加一，命名为 `RQ<n>-标题.md`、`IDEA<n>-标题.md` 和 `EXP<n>-标题.md`。不在文件名中加入日期，也不因中间缺号而重排已有笔记。Project 树中的编号徽标和标题都从文件名推导，不另行维护 `title` 属性。
- 上述三个 QuickAdd 命令只允许选择 `02 Projects/` 的直接 Project 子目录，不列出类型子目录，也不根据当前活动文件夹插队；选项按 Project 内 Markdown 文件的最近修改时间从新到旧排列。从 Project Files 的 `+` 创建时，当前 Project 作为显式上下文。
- `New Idea` 必须选择同 Project 的一个或多个 Research Question。`New Experiment` 优先选择同 Project 的 Idea；如果当时没有 Idea，允许创建 `idea` 留空的 Experiment，但必须在后续推进前补齐关联。
- `New Project Document` 创建的笔记放入所选 Project 的 `Docs/`；从 Project 或 Knowledge 首页的 Project Files 创建时，可选择当前实体已有的 `Docs/` 子目录。
- `⌘⇧P` 对应 `New Project / Knowledge`，第一步必须选择创建 Project 还是 Knowledge；Project 与 Knowledge 都使用同名文件夹和 Folder Note。
- `⌘⇧K` 对应直接创建 Knowledge，不显示归属选择器。
- `New Knowledge` 在 `04 Knowledge/` 下创建独立的同名文件夹和 Folder Note，并默认创建 `Docs/` 和 `assets/`；Knowledge 与 Project 相互独立，不写入 `parent`、`parent_type` 或 `project`。Knowledge 首页不包含时间线、Research 或 Meetings。
- 在 Project 或 Knowledge 内任意层级笔记中插入附件时，附件统一保存到对应实体根目录的 `assets/`；其他位置的附件继续保存到全局 `90 Assets/`。
- Codex 直接创建笔记时，将 Templater 占位符替换成实际标题和日期。
- 日期统一使用 `YYYY-MM-DD`。
- 内部关系使用 `[[Wiki Links]]`。当存在同名笔记或关系字段需稳定解析时，使用从 vault 根开始、不带 `.md` 的完整路径，例如 `[[02 Projects/<Project>/<Project>]]`。
- 任务格式使用 `- [ ] #task ... 📅 YYYY-MM-DD`。
- Meeting 只关联一个 Project 时，任务沿用 Meeting 的 `project`；关联多个 Project 时，每条任务必须添加 `[project:: [[Project 名称]]]`，一条任务属于多个 Project 时重复添加该字段。
- 保留已有 YAML frontmatter 字段和用户撰写内容。
- 论文笔记中的引用、摘要和 Zotero 导入内容默认视为来源内容，不随意改写。
- 除非明确要求，不删除笔记、附件或 `.obsidian` 配置。
- 不直接修改 `.obsidian/plugins/` 中的第三方插件代码。

## 内容约定

- `02 Projects/<Project>/<Project>.md` 是项目状态的主要来源和入口。
- `02 Projects/<Project>/Docs/Proposal.md` 只维护研究背景、现有不足、预期产物和目标效果；其他无类型项目文档不冒充 Project、Idea、Experiment 或 Knowledge 的权威位置。
- `02 Projects/<Project>/Research Questions/` 中每篇笔记代表一个独立问题；Research Question 与 Idea 是同级实体，Idea 通过 `research_questions` 链接一个或多个问题。
- Idea 之间只使用 `parent_idea` 表示候选解法的细化层级，不把 Research Question 当作 Idea 的父节点。
- Project 首页将独立文档按关系统一展示为 `Research Question → Idea → Experiment` 树；这只是展示层级，不改变三类文档各自的权威位置。
- `03 Meetings/` 是会议记录的唯一存放位置；Project 只通过 `project` 字段和查询聚合相关会议。
- `02 Projects/<Project>/Experiments/` 记录可复现的实验配置、环境、结果和结论。
- `04 Knowledge/<Knowledge>/<Knowledge>.md` 中的结论必须能追溯到来源，并区分证据与推断。
- 重要决定应同步到相关项目笔记，而不只留在 Meeting 中。
- 新论文分析应遵循 `99 Templates/Zotero Paper.md` 的当前结构：摘要、核心思路、证据、局限性、与我的工作关系 / 后续跟进。

## 完成检查

修改知识库后：

- 检查 YAML frontmatter 是否有效。
- 检查新增的 Wiki Link 是否指向正确笔记。
- 检查文件的实际目录、`type` 与实体类型是否一致；普通 `Docs/` 文档不应设置 `type`。
- 检查推进中的 Idea 是否连接至少一个同 Project 的 Research Question。
- 检查任务和日期格式。
- 检查状态值是否来自本文件约定的生命周期。
- 检查 Meeting 中的重要决定是否已经同步到 Project。
- 使用 `git diff --check` 检查格式问题。
- 汇报新增或修改了哪些笔记，以及知识之间建立了哪些链接。
