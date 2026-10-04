# Research Projects

这是一个以 Obsidian 为界面的研究工作系统，用于把研究活动、论文阅读、会议反馈、知识沉淀、Ideas、Experiment 计划和 Project 状态连接起来。

这里保存研究文档和决策，不保存具体实现代码。代码可以位于其他仓库；本仓库只通过 repository、commit、config 和 result artifact 链接到外部实现。

## 核心工作流

```text
Inbox
    ↓ 整理来源
Papers / Meetings
    ↓ 提炼可复用认识
Knowledge
    ↓ 支撑
Research Questions ↔ Ideas
    ↓ 设计最小验证
Experiments
    ↓ 产生结果和决定
Knowledge + Research Question + Idea status + Project state
    ↓
决定下一步
```

系统遵循三个原则：

1. 每类信息只有一个权威位置。
2. 其他笔记使用 `[[Wiki Links]]` 关联，不重复维护相同内容。
3. 长期状态和结论必须沉淀到 Project、Idea、Experiment 或 Knowledge。

## 目录

| 目录 | 作用 |
|---|---|
| `00 Dashboard/` | 自动汇总、导航和工作流检查 |
| `01 Inbox/` | 尚未分类的临时捕获 |
| `02 Projects/<Project>/` | Project Folder Note 及其 assets、Docs、Research Questions、Ideas、Experiments |
| `02 Projects/<Project>/Docs/` | Proposal 与其他无类型的普通项目文档 |
| `02 Projects/_Shared/` | 跨项目或暂未确定唯一归属的研究材料 |
| `03 Meetings/` | 独立的会议板块；集中保存会议记录与行动项，通过 `project` 字段关联 Project |
| `04 Knowledge/<Knowledge>/` | Knowledge Folder Note、assets 及其普通知识文档 |
| `05 Papers/` | Zotero Integration 导入的论文笔记；以 citekey 命名，通过关系字段关联其他实体 |
| `08 Misc/` | 行政和生活琐事的背景、材料和跟进记录 |
| `90 Assets/` | Project 与 Knowledge 之外的通用附件，以及 Excalidraw 和 Zotero 资源 |
| `99 Templates/` | 各类笔记模板，不作为研究结论来源 |

## 权威信息位置

| 信息 | 唯一权威位置 |
|---|---|
| 项目的最新状态和下一步 | Project |
| 项目的研究背景、现有不足、预期产物和目标效果 | Proposal |
| Research Question 的问题表述、范围、回答标准和当前认识 | Research Question |
| Idea 的假设、证据和状态 | Idea |
| Experiment 的研究协议和结论 | Experiment |
| 会议讨论原文 | Meeting |
| 可复用研究认识 | Knowledge |
| 某篇论文具体说了什么 | Paper |
| 尚未分类的内容 | Inbox |

例如，会议中决定开展一个 Experiment：

1. Meeting 保存讨论和决定原文。
2. 创建或更新对应 Experiment。
3. 在 Idea 中更新验证计划。
4. 在 Project 的 Key Decisions 和 Current State 中同步这项决定。

不要将完整 Experiment 方案复制到 Meeting 和 Project。

## 快捷键

```
⌘⇧Space   Inbox
⌘⇧R       New Research Question
⌘⇧E       New Experiment
⌘⇧I       New Idea
⌘⇧M       New Meeting
⌘⇧T       Task
⌘⇧P       New Project / Knowledge
⌘⇧K       New Knowledge
⌘⇧A       Tasks: Create or edit task
⌘⇧O       Omnisearch
```



## 第一次使用

### 1. 重新加载 Obsidian

本仓库已经配置以下插件：

- Homepage：启动时打开 `00 Dashboard/Research Home.md`
- QuickAdd：快速捕获和创建结构化笔记
- Templater：渲染日期、标题等模板变量
- Dataview：自动生成 Project、Idea、Experiment 和 Knowledge 视图
- Tasks：自动聚合任务

配置变更后，重新加载一次 Obsidian。随后 Research Home 应自动以阅读模式打开。

Project 首页和同名类型索引已经可以直接使用。若希望“点击文件夹即打开同名首页”，再安装 Folder Notes，并将 Folder Note 位置设为文件夹内部、名称模板设为 `{{folder_name}}`；目录渲染已经由 Dataview 负责，不需要同时启用 Folder Overview。

### 2. 检查入口

打开 [[Research Home|Research Home]]，确认能够看到：

- 当前项目：`进行中` 和 `已暂停` Project
- 所有待办：按截止日期和显式优先级排序的全库开放 `#task`
- 下一步实验：`准备中` 和 `进行中` Experiment
- 通往 Project、Research Question、Paper、Idea、Experiment、Knowledge、Meeting 和 Task Dashboard 的导航

刚开始使用时，大部分表格为空是正常现象。

### 3. 使用 QuickAdd

打开 Obsidian Command Palette，运行 `QuickAdd: Run QuickAdd`。当前提供：

| 命令 | 目标 |
|---|---|
| `Inbox` | 追加到 `01 Inbox/Inbox.md` |
| `Task` | 使用 Task 模板在 `08 Misc/` 创建独立任务笔记，由 Tasks Dashboard 汇总 |
| `New Project / Knowledge` | 先选择类型，再创建对应的同名文件夹、Folder Note 和 `assets/` |
| `New Research Question` | 选择 Project 后创建到其 `Research Questions/` 子目录 |
| `New Idea` | 选择 Project 及其 Research Question 后，自动创建到 `Ideas/` 子目录 |
| `New Experiment` | 选择 Project 及其 Idea 后，自动创建到 `Experiments/` 子目录 |
| `New Project Document` | 选择 Project 后创建无类型的普通文档到其 `Docs/` 子目录 |
| `New Meeting` | 在 `03 Meetings/` 创建并以 `MEETING-` 开头命名；创建后手动填写 `project` 字段 |
| `New Knowledge` | 在 `04 Knowledge/` 下创建独立的同名文件夹、Folder Note、`Docs/` 和 `assets/` |

`New Research Question`、`New Idea` 和 `New Experiment` 在选择 Project 后，会分别提示输入研究问题标题、想法标题或实验标题。它们检查所属 Project 的对应目录，并以 `RQ<n>-标题`、`IDEA<n>-标题`、`EXP<n>-标题` 自动使用当前最大序号加一；日期不会写入最终文件名。

`⌘⇧P` 打开 `New Project / Knowledge`，第一步选择创建 Project 或 Knowledge。`⌘⇧K` 直接进入 Knowledge 创建流程。Knowledge 与 Project 相互独立，创建 Knowledge 时不会要求选择任何归属，也不会自动写入 `parent`、`parent_type` 或 `project`。

`New Idea` 只显示所选 Project 内的 Research Question，并允许连续选择一个或多个，结果自动写入 `research_questions`。`New Experiment` 只显示所选 Project 内的 Idea，并将所选项自动写入 `idea`；如果 Project 内还没有 Idea，则跳过选择并创建 `idea` 留空的 Experiment，之后可再补充关联。Project 内没有 Research Question 时，`New Idea` 会提示先创建一个。

这些命令的 Project 选择器只显示 `02 Projects/<Project>/` 这一层，不显示 `Ideas/`、`Research Questions/`、`Experiments/` 等子目录。列表按各 Project 内最近修改时间从新到旧排列。在 Project 首页点击 Project Files 右侧的 `+` 时，可选择 Research Question、Idea、Experiment 或普通文档，并自动使用当前 Project，不再重复选择。创建普通文档时，如果 `Docs/` 已有子文件夹，还可以直接选择保存层级。

Project Files 会将 DOC 与 `Research Question → Idea → Experiment` 关系树分组显示，并递归镜像 `Docs/` 下的文件夹结构；分组不渲染卡片式外框。可直接在 Obsidian Files 面板中移动、重命名文件和文件夹来调整父子关系；同一文件夹内默认按名称自然排序，也可以在 Project Files 中直接拖拽 DOC 或 DIR 手动排序。拖拽结果自动写入 Folder Note 的 `doc_order`，文件夹行可以点击展开或收起，Project 的 Proposal 始终固定在最前。

Knowledge 首页与 Project 首页共用标题、关键词、To-dos 和 Project Files 样式及文档树交互，但只显示 `Docs/`，不包含甘特时间线、`Research Question → Idea → Experiment` 板块或 Meetings。Knowledge 的普通文档同样可在 Project Files 中创建、折叠和拖拽排序。

Project 关系树直接从文件名中分离编号和文章标题，例如 `RQ1-标题` 会显示为编号徽标 `RQ1` 与标题“标题”。不另行维护 `title` 属性，因此重命名文件后展示会自动同步。

Project 或 Knowledge 内的子页会在顶部显示上下文导航：`↑ 上级目录` 用于在 Files 面板中定位当前文件，`⌂ 项目首页` 或 `⌂ 知识首页` 用于返回当前实体的 Folder Note。按住 `⌘` 点击首页按钮可在新标签页打开。

可以在 Obsidian 设置中为这些命令分配快捷键。

### 4. 附件位置

在 `02 Projects/<Project>/` 或 `04 Knowledge/<Knowledge>/` 内任意层级的笔记中粘贴、拖入或选择插入附件时，附件会自动保存到对应实体根目录的 `assets/`。Project 与 Knowledge 之外的笔记继续使用全局 `90 Assets/`；全局目录中已有的附件不会自动迁移。

### 5. 从 Zotero 导入论文

在命令面板执行 `Zotero Integration: Import Paper`。导入结果固定为 `05 Papers/<citekey>.md`，论文中的图片写入 `90 Assets/Zotero/<citekey>/`；再次导入时，模板中的持久化分析区会保留已写内容。导入后按需填写 `project`、`knowledge` 和 `related_ideas`，用 Wiki Links 关联其他实体。

### 6. 创建第一个 Project

执行 `New Project / Knowledge` 并选择 `Project`，例如创建：

```text
LLM Inference Acceleration
```

QuickAdd 会创建 `02 Projects/LLM Inference Acceleration/LLM Inference Acceleration.md` 和无标签的 `Docs/Proposal.md`，并自动建立 `assets/`、`Docs/`、`Research Questions/`、`Ideas/` 和 `Experiments/`；后三个类型目录还会包含同名 Folder Note。Papers 通过 Zotero Integration 的 `Import Paper` 统一导入 `05 Papers/`，再用 frontmatter 关系字段关联 Project、Knowledge 和 Idea，不在 Project 内复制；Knowledge 独立创建在 `04 Knowledge/`；会议统一放入 `03 Meetings/`，跨项目研究材料放入 `_Shared`。`Docs/Proposal.md` 始终显示在 Project 首页的 Project Files 顶端。

首先只填写：

- `Docs/Proposal.md` 中的 Background & Problem
- `Docs/Proposal.md` 中的 Goal
- 独立的 Research Question 文档
- 与这些问题关联的 Ideas

Project 是每天开始工作的入口，不需要把所有研究内容都写进去。

Project 首页会把独立保存的文档统一呈现为 `Research Question → Idea → Experiment` 关系树；一个 Idea 连接多个 Research Question 时会出现在多个问题分支下。

## 日常工作流

### 开始工作：选择一个状态变化

1. 打开 Research Home。
2. 打开一个 Active Project。
3. 查看该 Project 的 Current State 和 Next Concrete Step。
4. 在相关 Project、Idea 或 Experiment 中写清希望推动的状态变化和下一步行动。

好的下一步行动：

```md
- [[EXP1-KV Cache 位分布分析]] — 完成变量定义和成功标准
```

不好的任务：

```md
- [ ] 研究 LLM 推理加速
```

每天最好只推动一个核心状态变化：

- Project：解决一个 blocker 或完成一个 milestone
- Research Question：澄清范围、回答标准或更新当前认识
- Idea：`构思中 → 验证中`
- Experiment：`准备中 → 进行中` 或 `进行中 → 已结束`
- Knowledge：`草稿 → 有效`

### 工作中：按内容类型归档

遇到新内容时使用这个判断：

| 内容 | 放在哪里 |
|---|---|
| 还说不清楚的念头或链接 | Inbox |
| 某篇论文的具体内容 | Paper |
| 从来源提炼的稳定认识 | Knowledge |
| 项目需要回答的独立问题 | Research Question |
| 可以写成可验证假设的新推断 | Idea |
| 验证 Idea 的研究协议 | Experiment |
| 项目方向和当前状态变化 | Project |
| 讨论、反馈和行动项 | Meeting |

### 阶段结束：按固定顺序沉淀

每次研究阶段结束后依次处理：

1. **Experiment**：更新计划、结果和结论。
2. **Idea**：更新假设、证据与判断，以及 `status`。
3. **Research Question**：更新当前认识和尚未回答的部分。
4. **Knowledge**：提炼可复用认识，填写来源、边界条件和置信度。
5. **Project**：更新当前状态、关键决定、阻塞因素和下一步具体行动。

如果没有产生新结论，也可以在相关 Experiment 或 Idea 中明确记录：

```md
- 当前证据不足；[[EXP-...]] 需要增加一个控制条件
```

“证据不足”比未经验证地创建 Knowledge 更准确。

## Inbox 工作流

Inbox 只负责低摩擦捕获。

建议：

- 工作中随时使用 QuickAdd 的 `Inbox`
- 定期处理新捕获的内容
- 每周 Review 时清空剩余内容

每条 Inbox 内容只能得到以下处理之一：

- 删除：不再重要
- 合并：已有同主题笔记
- 提升为 Paper
- 提升为 Knowledge
- 提升为 Research Question
- 提升为 Idea
- 提升为 Experiment
- 提升为 Project 或 Meeting
- 转为 `08 Misc/` 中的一份 Task 笔记

Inbox 不应成为长期笔记库。

## Paper → Knowledge

Paper 保存来源内容，Knowledge 保存跨来源可复用的认识。

阅读论文时：

1. 完成 Paper 的 My Analysis。
2. 不要把整篇论文重新写成一个 Knowledge。
3. 将重要认识拆成原子节点。
4. 每个 Knowledge 在 `sources` 和 Evidence 中链接 Paper。
5. 写清楚 Boundary Conditions 和 Confidence。

例如：

```text
Paper:
Reducing the GPU Memory Bottleneck...

Knowledge:
PCIe 数据搬运可能成为超出 GPU 内存容量工作负载的瓶颈

Knowledge:
无损压缩只有在节省的传输时间超过 codec 开销时才能加速
```

第二个例子如果只是你的推断，应保持 `草稿`，直到获得充分来源或 Experiment 证据。

## Research Question ↔ Idea

Research Question 是项目需要回答的问题，Idea 是候选解法或可验证推断；两者是同级文档。每个推进中的 Idea 都应通过 `research_questions` 链接它试图回答的一个或多个 Research Question，并可由 Knowledge 提供依据。

一个 Idea 的核心是：

- 假设：条件、机制和可观察结果
- 依据与缺口：已有证据与新增加的推断
- 预测与最小验证：如何最快区分支持、否定或不确定的结果
- 证据与判断：正反证据及当前状态
- 下一步：一个具体推进动作

Idea 生命周期：

```text
构思中 → 验证中 → 已结束
```

规则：

- `构思中`：正在补充假设、依据、机制和可证伪预测
- `验证中`：已具备最小验证方式，准备或正在执行 Experiment
- `已结束`：不再推进；支持、否定或合并等具体结果记录在 Evidence 和 Conclusion 中

被否定的 Idea 不删除，它记录了哪些路径已经被验证过。

## Idea → Experiment

Idea 只有在具备可证伪预测和最小验证方式、并进入 `验证中` 后，才应该创建正式 Experiment。

Experiment 笔记只负责研究协议和结论：

- Research Question
- Hypothesis
- Variables
- Metrics
- Baseline
- Procedure
- Expected Results
- Success / Rejection Criteria
- Risks and Confounders
- Results
- Interpretation
- Conclusion

具体代码位于外部仓库时，在 External Implementation 中记录：

```md
- Repository: https://github.com/example/repo
- Commit: abc1234
- Config: configs/exp-001.yaml
- Result artifact: results/exp-001.json
```

Experiment 生命周期：

```text
准备中 → 进行中 → 已结束
```

`已结束` 同时覆盖正常完成和取消；具体结果、取消原因和同步情况写在 Conclusion 中。

## Meeting 工作流

所有 Meeting 统一保存在 `03 Meetings/`，文件名使用 `MEETING-YYYY-MM-DD-会议主题.md`。在 `project` 字段中链接对应的 Project；Project 首页会据此聚合相关会议。

会议结束后不能只保存会议记录。需要处理四类输出：

1. Decisions → 同步到 Project 的 Key Decisions
2. Feedback → 同步到 Idea 的 Evidence 或 Risks
3. Experiment suggestions → 创建或更新 Experiment
4. Action Items → 指向负责的 Project、Idea 或 Experiment

Meeting 状态：

```text
计划中 → 已完成
        ↘ 已取消
```

完成会议模板中的 Close-out Checklist 后，再设置为 `已完成`。

## 每周 Review

从 [[Research Home|研究主页]] 进入各 Dashboard，依次处理：

1. 清空或分类 Inbox。
2. 检查缺少 Knowledge Basis 的 Ideas。
3. 检查 `验证中` 但没有 Experiment 的 Ideas。
4. 检查缺少 Project 或 Idea 的 Experiments。
5. 为 Knowledge 补充来源、边界条件和置信度。
6. 关闭 Meeting Action Items。
7. 更新每个 `进行中` Project 的 Current State。
8. 每个 `进行中` Project 只保留一个 Next Concrete Step。
9. 将不再推进的 Idea 和 Experiment 标记为 `已结束`，并在正文说明结果或原因。

建议每周只选择少量 `进行中` Project。其他项目使用 `已暂停` 明确暂停。

## Dashboard

| Dashboard | 用途 |
|---|---|
| `Research Home` | 当前 Project、按紧急程度排序的全库待办、下一步 Experiment 和导航 |
| `Projects` | 进行中、已暂停和已完成的 Project |
| `Research Questions` | 查看研究问题、关联 Idea 及尚无 Idea 的问题 |
| `Papers` | 阅读队列和等待提炼 Knowledge 的论文 |
| `Ideas` | 当前 Idea 以及 `验证中` 但尚无 Experiment 的 Idea |
| `Experiments` | 当前 Experiment 以及 `准备中` / `进行中` 队列 |
| `Knowledge` | 未归档与已归档的可复用知识条目 |
| `Meetings` | 位于 `03 Meetings/Meetings.md`，汇总 Upcoming Meetings 和开放行动项 |
| `Tasks` | 分别汇总逾期/今日到期、未排期和 `#waiting` 任务 |

Dashboard 使用 Dataview 和 Tasks 自动生成。不要手工复制列表到 Dashboard。

## 状态约定

只使用以下中文状态，避免产生同义值：

| 类型 | 状态 |
|---|---|
| Project | `进行中`, `已暂停`, `已完成` |
| Idea | `构思中`, `验证中`, `已结束` |
| Experiment | `准备中`, `进行中`, `已结束` |
| Knowledge | `草稿`, `有效`, `已归档` |
| Meeting | `计划中`, `已完成`, `已取消` |
| Paper | `未读`, `阅读中`, `已读` |

在 Obsidian 中，以上 `status` 由 Metadata Menu 按笔记标签显示为下拉选项；在笔记的右键菜单选择 **Field Options → status** 即可更新。不要直接手打新值。选项定义在 `99 Templates/Metadata Schema/`；修改状态集合时，还要同步更新笔记模板的默认值和 Dashboard 查询。

## 任务约定

任务写在产生任务的笔记中，由 Tasks Dashboard 聚合：

```md
- [ ] #task 具体、可执行的动作 📅 2026-07-25
```

不要在 Project 和 Experiment 中复制同一个任务；在产生任务的笔记中维护它即可。

Research Home 的“所有待办”表会显示待办内容、所属 Project、截止时间和紧急程度。排序优先考虑逾期和近期截止日期，再考虑 Tasks 的显式优先级标记；没有 Project 上下文的任务会标记为“未归属”。

Project 首页的 `To-dos` 会自动收集 Project 文件夹内的开放 `#task`，以及关联 Meeting 中的开放 `#task`。单 Project 会议中的任务自动归属；当 Meeting 的 `project` 同时关联多个 Project 时，必须给每条任务添加任务级归属：

```md
- [ ] #task 整理实验结果 [project:: [[LLM Inference Acceleration]]] 📅 2026-07-25
```

一条任务同时属于多个 Project 时，可以重复添加该字段。跨 Project 会议中没有任务级归属的任务不会进入任何 Project 的 `To-dos`，以免误收其他 Project 的行动项。

Task 的单项状态也限定为四种：待办（`[ ]`）、进行中（`[/]`）、完成（`[x]`）、取消（`[-]`）。在命令面板的 Tasks 状态命令中选择，或使用对应的 checkbox 标记；`#waiting` 仍只表示“等待外部方”。

推荐任务描述：

```md
- [ ] #task 为 [[某个 Idea]] 写出三个可证伪预测 📅 2026-07-25
```

避免：

```md
- [ ] 做研究
```

## 文件命名与标题

结构化的 Research Question、Idea 和 Experiment 以文件名作为唯一主标题，并由 Obsidian 的 inline title 显示；正文从 `##` 开始，不为重复文件名添加 YAML `title`。Project、Knowledge、类型索引和 `Docs/` 文档保留可读的一级标题。

Zotero Paper 是例外：文件名保持 citekey，YAML `title` 用于查询，正文保留可读的 `# 论文标题`。README 和 AGENTS 等需要脱离 Obsidian 独立阅读的仓库文档也保留一级标题。

- Project：`02 Projects/项目名称/项目名称.md`（文件夹和 Folder Note 同名）
- Proposal：`02 Projects/项目名称/Docs/Proposal.md`（无 tag）
- 普通项目文档：`02 Projects/项目名称/Docs/文档标题.md`（无 `type`）
- Research Question：`02 Projects/项目名称/Research Questions/RQ<n>-简短标题.md`
- Idea：`02 Projects/项目名称/Ideas/IDEA<n>-简短标题.md`
- Experiment：`02 Projects/项目名称/Experiments/EXP<n>-简短标题.md`
- Meeting：`03 Meetings/MEETING-YYYY-MM-DD-会议主题.md`
- Knowledge：`04 Knowledge/知识标题/知识标题.md`（文件夹和 Folder Note 同名）
- Paper：`05 Papers/<citekey>.md`（由 Zotero Integration 的 `Import Paper` 创建）

## 一个完整例子

假设阅读当前论文后出现一个想法：

1. 在 Paper 中完成 My Analysis。
2. 创建 Knowledge：
   `[[PCIe 数据搬运可能成为推理瓶颈]]`
3. 创建 Research Question：
   `[[RQ1-如何降低 KV Cache 传输开销]]`
4. 创建并关联 Idea：
   `[[IDEA1-KV Cache 无损压缩]]`
5. Idea 的 Knowledge Basis 链接 Paper 和 Knowledge，`research_questions` 链接 `RQ1`。
6. 写出可证伪预测和成功/否定标准，将 Idea 推进为 `验证中`。
7. 创建并关联 Experiment：
   `[[EXP1-KV Cache 位分布分析]]`
8. Experiment 完成后：
   - 更新 Idea 的 Evidence
   - 创建或更新 Knowledge
   - 更新 Project 的 Current State

整个链条最终应该可以双向追踪：

```text
Paper ↔ Knowledge ↔ Idea ↔ Experiment ↔ Project
                   ↑      ↑
                Meeting ──┘
```

## 维护规则

- 新建前先搜索是否已有同主题笔记。
- 使用 Wiki Links，不使用复制粘贴维持关系。
- 修改笔记后更新 `updated`。
- Knowledge 必须有来源，或者保持 `草稿`。
- Experiment 结论必须区分结果和解释。
- Meeting 完成前必须处理 Decisions 和 Action Items。
- 模板和 Dashboard 不作为研究证据来源。
- 大文件、模型、数据集和完整实验产物不要提交到本仓库。

仓库级 AI/Codex 行为约定见 `AGENTS.md`。

## 每个 Project 一个 XX-Proposal 仓库

每个 `02 Projects/<Project>/` 项目是独立私有仓库，通过 Git submodule 纳入 Vault。项目显示名称保持不变；英文仓库名统一以 `-Proposal` 结尾，分支为 `main`。映射见 `project-repositories.json`。

### 新建项目

继续使用 `⌘⇧P → Project`。模板创建默认目录和项目笔记后，自动创建/连接私有仓库，提交初始内容并注册子模块。中文名称会额外询问英文仓库名。需要桌面端安装 Git、Python 3.9+、GitHub CLI，并使用 `gh auth login` 登录有仓库创建权限的账户。

离线、移动端或连接失败时，项目笔记和 `repository` 地址会保留。回到已登录的桌面端，运行 QuickAdd `Connect Project Repository` 选择项目补办；也可以在 Vault 根目录执行：

```bash
python3 tools/project_repositories.py sync
python3 tools/project_repositories.py status
```

单独连接项目可使用 `python3 tools/project_repositories.py ensure "项目名" --repo English-Name-Proposal`。`sync` 只连接尚未注册的项目，不会提交已连接项目的后续笔记修改。迁移前的原始目录备份保存在 `.project-repo-backups/`，不推送到 GitHub。

### 后续编辑与同步

项目内容在各自仓库提交和推送，Vault 再记录新版本，例如：

```bash
git -C "02 Projects/RevFix" add .
git -C "02 Projects/RevFix" commit -m "docs: update research notes"
git -C "02 Projects/RevFix" push
git add "02 Projects/RevFix"
git commit -m "chore: update RevFix project reference"
git push
```

在其他设备恢复固定的项目版本，使用 `git clone --recurse-submodules <Vault仓库地址>`，或在已有 Vault 内使用 `git submodule update --init --recursive`。子模块固定 commit，不会随远端 `main` 自动变化；另一个 Developer checkout 需要通过 Git 同步。模板、Dashboard、论文和跨项目知识继续由 Vault 提供，单独克隆 Proposal 仓库不会附带这些共享资源。

当前桌面自动连接脚本支持 macOS/Linux；移动端可以正常创建笔记，仓库创建由桌面补办。
