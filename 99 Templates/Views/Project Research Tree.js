const current = dv.current().file;
const quickAddContextKey = "project-kb-quickadd-context";
const isProjectPage = dv.current().type === "project";

const createChoices = [
  ...(isProjectPage
    ? [
        {
          label: "Research Question",
          commandId: "quickadd:choice:f1c3c792-2e1f-4ac8-8b1e-0bbd01af6c91",
        },
        {
          label: "Idea",
          commandId: "quickadd:choice:89d4178b-4b93-4b80-8216-2ab95bfd283f",
        },
        {
          label: "Experiment",
          commandId: "quickadd:choice:eae0ac42-3e58-453e-acab-1fefba8bc0fd",
        },
      ]
    : []),
  {
    label: "普通文档",
    kind: "document",
  },
];

const header = dv.container.createDiv({ cls: "project-files-header" });
header.createEl("h2", { text: "Project Files" });
const addButton = header.createEl("button", {
  text: "+",
  cls: "project-files-add-button clickable-icon",
  attr: {
    "aria-label": "添加文件",
    title: "添加文件",
  },
});

async function createProjectDocument(quickAddApi) {
  const docsFolder = `${current.folder}/Docs`;
  if (!app.vault.getAbstractFileByPath(docsFolder)) {
    await app.vault.createFolder(docsFolder);
  }

  const targetFolders = app.vault
    .getAllLoadedFiles()
    .filter(
      (file) =>
        Array.isArray(file.children) &&
        (file.path === docsFolder || file.path.startsWith(`${docsFolder}/`)),
    )
    .sort((left, right) =>
      left.path.localeCompare(right.path, "zh-CN", {
        numeric: true,
        sensitivity: "base",
      })
    );
  let targetFolder = docsFolder;
  if (targetFolders.length > 1) {
    targetFolder = await quickAddApi.suggester(
      targetFolders.map((folder) =>
        folder.path === docsFolder
          ? "Docs/"
          : `Docs/${folder.path.substring(docsFolder.length + 1)}/`
      ),
      targetFolders.map((folder) => folder.path),
      "选择普通文档的保存位置",
    );
    if (!targetFolder) return;
  }

  const requestedTitle = await quickAddApi.inputPrompt("请输入文档标题");
  if (requestedTitle === null || requestedTitle === undefined) return;
  const safeTitle = requestedTitle
    .trim()
    .replace(/[\\/:*?"<>|]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 100)
    .trim();
  if (!safeTitle) return;

  let targetName = safeTitle;
  let suffix = 2;
  while (app.vault.getAbstractFileByPath(`${targetFolder}/${targetName}.md`)) {
    targetName = `${safeTitle}-${suffix}`;
    suffix += 1;
  }

  const file = await app.vault.create(
    `${targetFolder}/${targetName}.md`,
    `\`\`\`dataviewjs\nawait dv.view("99 Templates/Views/Entity Navigation");\n\`\`\`\n\n# ${targetName}\n`,
  );
  await app.workspace.getLeaf("tab").openFile(file);
}

addButton.addEventListener("click", async () => {
  const quickAddApi = app.plugins.plugins.quickadd?.api;
  if (!quickAddApi?.suggester) {
    addButton.setAttr("title", "QuickAdd 尚未启用");
    return;
  }

  try {
    const selected = await quickAddApi.suggester(
      createChoices.map((choice) => choice.label),
      createChoices,
    );
    if (!selected) return;

    if (selected.kind === "document") {
      await createProjectDocument(quickAddApi);
      return;
    }

    sessionStorage.setItem(
      quickAddContextKey,
      JSON.stringify({ projectPath: current.path, createdAt: Date.now() }),
    );
    const executed = app.commands.executeCommandById(selected.commandId);
    if (!executed) {
      sessionStorage.removeItem(quickAddContextKey);
      addButton.setAttr("title", "对应的 QuickAdd 命令尚未加载");
    }
  } catch (error) {
    sessionStorage.removeItem(quickAddContextKey);
    console.debug("Project 文件创建已取消。", error);
  }
});

function normalizePath(value) {
  if (!value) return null;

  let raw = value;
  if (Array.isArray(raw)) raw = raw[0];
  if (raw && typeof raw === "object" && raw.path) raw = raw.path;
  if (typeof raw !== "string") return null;

  return raw
    .trim()
    .replace(/^\[\[/, "")
    .replace(/\]\]$/, "")
    .split("|")[0]
    .replace(/\.md$/, "")
    .trim();
}

function asArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value !== "string" && value[Symbol.iterator]) {
    return Array.from(value);
  }
  return [value];
}

function linkedPaths(value) {
  return asArray(value).map(normalizePath).filter(Boolean);
}

function identityFor(page) {
  if (!page.type) {
    return { identifier: "DOC", title: page.file.name };
  }

  const prefixByType = {
    "research-question": "RQ",
    idea: "IDEA",
    experiment: "EXP",
  };
  const prefix = prefixByType[page.type] || "DOC";
  const pattern = new RegExp(`^(${prefix}\\d+)(?:[-\\s_]+(.+))?$`, "i");
  const match = page.file.name.match(pattern);
  const identifier = match ? match[1].toUpperCase() : prefix;
  const filenameTitle = match?.[2]?.trim() || "";

  return {
    identifier,
    title: filenameTitle || "未命名",
  };
}

function addIdentityAndLink(container, page) {
  const identity = identityFor(page);
  container.createSpan({
    text: identity.identifier,
    cls: "project-research-tree-id",
  });
  const link = container.createEl("a", {
    text: identity.title,
    cls: "internal-link project-research-tree-link",
  });
  link.setAttr("data-href", page.file.path);
  link.setAttr("href", page.file.path);
}

function prefixFor(ancestorIsLast, isLast) {
  const ancestors = ancestorIsLast
    .map((ancestorLast) => ancestorLast ? "    " : "│   ")
    .join("");
  return `${ancestors}${isLast ? "└── " : "├── "}`;
}

function renderRow(tree, page, depth, ancestorIsLast = [], isLast = true) {
  const row = tree.createDiv({
    cls: `project-research-tree-row project-research-tree-depth-${depth}`,
  });

  if (depth > 0) {
    row.createSpan({
      text: prefixFor(ancestorIsLast, isLast),
      cls: "project-research-tree-prefix",
    });
  }

  addIdentityAndLink(row, page);
  row.createSpan({ cls: "project-research-tree-leader" });
  row.createSpan({
    text: page.file.mtime.toFormat("MM-dd HH:mm"),
    cls: "project-research-tree-time",
  });
  return row;
}

function renderSectionLabel(container, label) {
  const section = container.createDiv({ cls: "project-files-section-label" });
  section.createSpan({ text: label });
  section.createSpan({ cls: "project-files-section-line" });
}

function descendantDocumentCount(folderNode) {
  return folderNode.children.reduce(
    (count, child) =>
      count + (child.kind === "document" ? 1 : descendantDocumentCount(child)),
    0,
  );
}

let draggedDocumentOrder = null;

async function persistDocumentSiblingOrder(parentOrderKey, siblingOrder) {
  const projectFile = app.vault.getAbstractFileByPath(current.path);
  if (!projectFile) return;

  const siblingKeys = new Set(
    documentSiblingsByParent.get(parentOrderKey) || [],
  );
  await app.fileManager.processFrontMatter(projectFile, (frontmatter) => {
    const existing = Array.isArray(frontmatter.doc_order)
      ? frontmatter.doc_order.map(String)
      : frontmatter.doc_order
        ? [String(frontmatter.doc_order)]
        : [];
    frontmatter.doc_order = [
      ...existing.filter((path) => !siblingKeys.has(path)),
      ...siblingOrder,
    ];
  });
  documentSiblingsByParent.set(parentOrderKey, siblingOrder);
}

function makeDocumentRowDraggable(row, node, parentOrderKey) {
  row.setAttr("draggable", "true");
  row.setAttr("title", "拖动以调整同一文件夹内的显示顺序");
  row.addClass("project-doc-order-row");

  row.addEventListener("dragstart", (event) => {
    draggedDocumentOrder = { key: node.orderKey, parentOrderKey };
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", node.orderKey);
    row.addClass("is-dragging");
  });

  row.addEventListener("dragend", () => {
    draggedDocumentOrder = null;
    row.removeClass("is-dragging");
    row.removeClass("is-drop-before");
    row.removeClass("is-drop-after");
  });

  row.addEventListener("dragover", (event) => {
    if (
      !draggedDocumentOrder ||
      draggedDocumentOrder.parentOrderKey !== parentOrderKey ||
      draggedDocumentOrder.key === node.orderKey
    ) {
      return;
    }
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    const belowMiddle =
      event.clientY > row.getBoundingClientRect().top + row.offsetHeight / 2;
    row.toggleClass("is-drop-before", !belowMiddle);
    row.toggleClass("is-drop-after", belowMiddle);
  });

  row.addEventListener("dragleave", () => {
    row.removeClass("is-drop-before");
    row.removeClass("is-drop-after");
  });

  row.addEventListener("drop", async (event) => {
    event.preventDefault();
    row.removeClass("is-drop-before");
    row.removeClass("is-drop-after");

    if (
      !draggedDocumentOrder ||
      draggedDocumentOrder.parentOrderKey !== parentOrderKey ||
      draggedDocumentOrder.key === node.orderKey
    ) {
      return;
    }

    const currentOrder = [
      ...(documentSiblingsByParent.get(parentOrderKey) || []),
    ];
    const sourceKey = draggedDocumentOrder.key;
    const reordered = currentOrder.filter((key) => key !== sourceKey);
    let targetIndex = reordered.indexOf(node.orderKey);
    if (targetIndex < 0) return;
    const belowMiddle =
      event.clientY > row.getBoundingClientRect().top + row.offsetHeight / 2;
    if (belowMiddle) targetIndex += 1;
    reordered.splice(targetIndex, 0, sourceKey);
    await persistDocumentSiblingOrder(parentOrderKey, reordered);
  });
}

function renderDocumentNode(
  container,
  node,
  depth,
  ancestorIsLast = [],
  isLast = true,
  parentOrderKey = "Docs",
) {
  if (node.kind === "document") {
    const row = renderRow(container, node.page, depth, ancestorIsLast, isLast);
    makeDocumentRowDraggable(row, node, parentOrderKey);
    return;
  }

  const group = container.createDiv({ cls: "project-doc-folder-group" });
  const row = group.createDiv({
    cls: `project-research-tree-row project-doc-folder-row project-research-tree-depth-${depth}`,
  });
  if (depth > 0) {
    row.createSpan({
      text: prefixFor(ancestorIsLast, isLast),
      cls: "project-research-tree-prefix",
    });
  }
  row.createSpan({ text: "DIR", cls: "project-research-tree-id" });
  const toggle = row.createEl("button", {
    text: node.name,
    cls: "project-doc-folder-toggle",
  });
  row.createSpan({ cls: "project-research-tree-leader" });
  row.createSpan({
    text: `${descendantDocumentCount(node)} 文档`,
    cls: "project-research-tree-time",
  });
  makeDocumentRowDraggable(row, node, parentOrderKey);

  const children = group.createDiv({ cls: "project-doc-folder-children" });
  const collapseKey = `project-doc-folder:${node.path}`;
  let collapsed = sessionStorage.getItem(collapseKey) === "collapsed";
  const updateCollapsedState = () => {
    group.toggleClass("is-collapsed", collapsed);
    toggle.setAttr("aria-expanded", String(!collapsed));
    toggle.setAttr("title", collapsed ? "展开文件夹" : "收起文件夹");
  };
  updateCollapsedState();

  toggle.addEventListener("click", () => {
    collapsed = !collapsed;
    if (collapsed) {
      sessionStorage.setItem(collapseKey, "collapsed");
    } else {
      sessionStorage.removeItem(collapseKey);
    }
    updateCollapsedState();
  });

  const nextAncestors = [...ancestorIsLast, isLast];
  node.children.forEach((child, index) => {
    renderDocumentNode(
      children,
      child,
      depth + 1,
      nextAncestors,
      index === node.children.length - 1,
      node.orderKey,
    );
  });
}

function renderWarningRow(container, page, reasons) {
  const row = container.createDiv({
    cls: "project-research-tree-row project-research-tree-warning-row",
  });
  row.setAttr("title", reasons.join("\n"));
  row.createSpan({
    text: "⚠",
    cls: "project-research-tree-warning-icon",
  });
  addIdentityAndLink(row, page);
  row.createSpan({ cls: "project-research-tree-leader" });
  row.createSpan({
    text: page.file.mtime.toFormat("MM-dd HH:mm"),
    cls: "project-research-tree-time",
  });
}

const projectPath = normalizePath(current.path);
const docsFolder = `${current.folder}/Docs`;
const proposal = isProjectPage ? dv.page(`${docsFolder}/Proposal`) : null;
const folderPages = Array.from(dv.pages(`"${current.folder}"`));
const pages = isProjectPage ? Array.from(dv.pages('"02 Projects"')) : [];
const documents = folderPages.filter(
  (page) =>
    page.file.path.startsWith(`${docsFolder}/`) &&
    page.file.path !== `${docsFolder}/Proposal.md` &&
    !page.type,
);
const inCurrentProject = (page) =>
  asArray(page.project).some((project) => normalizePath(project) === projectPath);
const questions = pages.filter(
  (page) => page.type === "research-question" && inCurrentProject(page),
);
const ideas = pages.filter(
  (page) => page.type === "idea" && inCurrentProject(page),
);
const experiments = pages.filter(
  (page) => page.type === "experiment" && inCurrentProject(page),
);

const collator = new Intl.Collator("zh-CN", {
  numeric: true,
  sensitivity: "base",
});
const sortPages = (left, right) =>
  collator.compare(left.file.name, right.file.name);
const configuredDocOrder = Array.from(asArray(dv.current().doc_order))
  .map((value) => String(value).trim())
  .filter(Boolean);
const configuredDocOrderIndex = new Map(
  configuredDocOrder.map((path, index) => [path, index]),
);
const documentSiblingsByParent = new Map();

function projectRelativePath(path) {
  return path.substring(current.folder.length + 1);
}

function buildDocumentTree(documentPages) {
  const root = {
    kind: "folder",
    name: "Docs",
    path: docsFolder,
    orderKey: "Docs",
    children: [],
    folders: new Map(),
  };

  for (const page of documentPages) {
    const relativePath = page.file.path.substring(docsFolder.length + 1);
    const segments = relativePath.split("/");
    let parent = root;
    let folderPath = docsFolder;

    for (const folderName of segments.slice(0, -1)) {
      folderPath = `${folderPath}/${folderName}`;
      if (!parent.folders.has(folderName)) {
        const folderNode = {
          kind: "folder",
          name: folderName,
          path: folderPath,
          orderKey: projectRelativePath(folderPath),
          children: [],
          folders: new Map(),
        };
        parent.folders.set(folderName, folderNode);
        parent.children.push(folderNode);
      }
      parent = parent.folders.get(folderName);
    }

    parent.children.push({
      kind: "document",
      page,
      orderKey: projectRelativePath(page.file.path),
    });
  }

  const sortChildren = (folderNode) => {
    folderNode.children.sort((left, right) => {
      const leftOrder = configuredDocOrderIndex.get(left.orderKey);
      const rightOrder = configuredDocOrderIndex.get(right.orderKey);
      if (leftOrder !== undefined || rightOrder !== undefined) {
        if (leftOrder === undefined) return 1;
        if (rightOrder === undefined) return -1;
        if (leftOrder !== rightOrder) return leftOrder - rightOrder;
      }
      const leftName = left.kind === "folder" ? left.name : left.page.file.name;
      const rightName = right.kind === "folder" ? right.name : right.page.file.name;
      return (
        collator.compare(leftName, rightName) ||
        (left.kind === right.kind ? 0 : left.kind === "folder" ? -1 : 1)
      );
    });
    documentSiblingsByParent.set(
      folderNode.orderKey,
      folderNode.children.map((child) => child.orderKey),
    );
    for (const child of folderNode.children) {
      if (child.kind === "folder") sortChildren(child);
    }
  };
  sortChildren(root);
  return root;
}

questions.sort(sortPages);
ideas.sort(sortPages);
experiments.sort(sortPages);
documents.sort(sortPages);
const documentTree = buildDocumentTree(documents);

const questionsByPath = new Map(
  questions.map((page) => [normalizePath(page.file.path), page]),
);
const ideasByPath = new Map(
  ideas.map((page) => [normalizePath(page.file.path), page]),
);
const childIdeas = new Map();
const experimentsByIdea = new Map();
const warnings = new Map();

function addWarning(page, message) {
  const path = normalizePath(page.file.path);
  if (!warnings.has(path)) {
    warnings.set(path, { page, reasons: new Set() });
  }
  warnings.get(path).reasons.add(message);
}

for (const idea of ideas) {
  const ideaPath = normalizePath(idea.file.path);
  const parentPath = normalizePath(idea.parent_idea);
  const questionPaths = linkedPaths(idea.research_questions);

  if (idea.research_question) {
    addWarning(
      idea,
      "仍在使用旧字段 research_question，请迁移到 research_questions。",
    );
  }

  if (questionPaths.length === 0) {
    addWarning(idea, "尚未连接 Research Question。");
  }

  for (const questionPath of questionPaths) {
    if (!questionsByPath.has(questionPath)) {
      const label = questionPath.split("/").at(-1);
      addWarning(
        idea,
        `连接的 Research Question 不存在或不属于当前 Project：${label}。`,
      );
    }
  }

  if (!parentPath) continue;
  if (parentPath === ideaPath) {
    addWarning(idea, "把自己设为了父 Idea。");
    continue;
  }
  if (!ideasByPath.has(parentPath)) {
    addWarning(
      idea,
      "父 Idea 不存在或不属于当前 Project。",
    );
  }
}

const visitState = new Map();
const ancestry = [];

function detectIdeaCycle(ideaPath) {
  if (visitState.get(ideaPath) === 2) return;
  if (visitState.get(ideaPath) === 1) {
    const cycleStart = ancestry.indexOf(ideaPath);
    for (const cyclePath of ancestry.slice(cycleStart)) {
      addWarning(ideasByPath.get(cyclePath), "Idea 层级中存在循环。");
    }
    return;
  }

  visitState.set(ideaPath, 1);
  ancestry.push(ideaPath);
  const parentPath = normalizePath(ideasByPath.get(ideaPath).parent_idea);
  if (parentPath && ideasByPath.has(parentPath)) {
    detectIdeaCycle(parentPath);
  }
  ancestry.pop();
  visitState.set(ideaPath, 2);
}

for (const ideaPath of ideasByPath.keys()) detectIdeaCycle(ideaPath);

let propagatedWarning = true;
while (propagatedWarning) {
  propagatedWarning = false;
  for (const idea of ideas) {
    const ideaPath = normalizePath(idea.file.path);
    const parentPath = normalizePath(idea.parent_idea);
    if (!warnings.has(ideaPath) && parentPath && warnings.has(parentPath)) {
      addWarning(
        idea,
        `父 Idea 存在关系问题：${ideasByPath.get(parentPath).file.name}。`,
      );
      propagatedWarning = true;
    }
  }
}

for (const idea of ideas) {
  const ideaPath = normalizePath(idea.file.path);
  const parentPath = normalizePath(idea.parent_idea);
  if (warnings.has(ideaPath) || !parentPath) continue;
  if (!childIdeas.has(parentPath)) childIdeas.set(parentPath, []);
  childIdeas.get(parentPath).push(idea);
}

for (const children of childIdeas.values()) children.sort(sortPages);

for (const experiment of experiments) {
  const experimentPath = normalizePath(experiment.file.path);
  const ideaPaths = linkedPaths(experiment.idea);

  if (ideaPaths.length === 0) {
    addWarning(experiment, "尚未连接 Idea。");
  }

  for (const ideaPath of ideaPaths) {
    if (!ideasByPath.has(ideaPath)) {
      const label = ideaPath.split("/").at(-1);
      addWarning(
        experiment,
        `连接的 Idea 不存在或不属于当前 Project：${label}。`,
      );
      continue;
    }

    if (warnings.has(ideaPath)) {
      addWarning(
        experiment,
        `连接的 Idea 存在关系问题：${ideasByPath.get(ideaPath).file.name}。`,
      );
    }
  }

  if (warnings.has(experimentPath)) continue;
  for (const ideaPath of ideaPaths) {
    if (!experimentsByIdea.has(ideaPath)) experimentsByIdea.set(ideaPath, []);
    experimentsByIdea.get(ideaPath).push(experiment);
  }
}

for (const relatedExperiments of experimentsByIdea.values()) {
  relatedExperiments.sort(sortPages);
}

const tree = dv.container.createDiv({
  cls: "project-research-tree project-files-tree",
});

const docsGroup = tree.createDiv({
  cls: "project-files-group project-files-docs-group",
});

renderSectionLabel(docsGroup, "DOCS");

if (proposal) {
  renderRow(docsGroup, proposal, 0);
}

documentTree.children.forEach((node, index) => {
  renderDocumentNode(
    docsGroup,
    node,
    0,
    [],
    index === documentTree.children.length - 1,
  );
});

const researchGroup = isProjectPage
  ? tree.createDiv({
      cls: "project-files-group project-files-research-group",
    })
  : null;

if (researchGroup) {
  renderSectionLabel(researchGroup, "RESEARCH · RQ → IDEA → EXP");
}

function renderIdea(
  idea,
  questionPath,
  depth,
  ancestorIsLast,
  isLast,
  ancestry,
  rendered,
) {
  const ideaPath = normalizePath(idea.file.path);

  if (ancestry.has(ideaPath)) return;
  if (rendered.has(ideaPath)) return;
  rendered.add(ideaPath);

  renderRow(researchGroup, idea, depth, ancestorIsLast, isLast);

  const nextAncestry = new Set(ancestry);
  nextAncestry.add(ideaPath);
  const nextAncestors = [...ancestorIsLast, isLast];
  const nestedIdeas = (childIdeas.get(ideaPath) || []).filter((child) =>
    linkedPaths(child.research_questions).includes(questionPath),
  );
  const relatedExperiments = experimentsByIdea.get(ideaPath) || [];
  const children = [
    ...relatedExperiments.map((page) => ({ kind: "experiment", page })),
    ...nestedIdeas.map((page) => ({ kind: "idea", page })),
  ];

  children.forEach((child, index) => {
    const childIsLast = index === children.length - 1;
    if (child.kind === "experiment") {
      renderRow(
        researchGroup,
        child.page,
        depth + 1,
        nextAncestors,
        childIsLast,
      );
    } else {
      renderIdea(
        child.page,
        questionPath,
        depth + 1,
        nextAncestors,
        childIsLast,
        nextAncestry,
        rendered,
      );
    }
  });
}

questions.forEach((question) => {
  const questionPath = normalizePath(question.file.path);
  renderRow(researchGroup, question, 0);

  const questionIdeas = ideas.filter(
    (idea) =>
      !warnings.has(normalizePath(idea.file.path)) &&
      linkedPaths(idea.research_questions).includes(questionPath),
  );
  const questionIdeaPaths = new Set(
    questionIdeas.map((idea) => normalizePath(idea.file.path)),
  );
  const roots = questionIdeas.filter((idea) => {
    const parentPath = normalizePath(idea.parent_idea);
    return !parentPath || !questionIdeaPaths.has(parentPath) ||
      parentPath === normalizePath(idea.file.path);
  });
  roots.sort(sortPages);

  const rendered = new Set();
  roots.forEach((idea, index) => {
    renderIdea(
      idea,
      questionPath,
      1,
      [],
      index === roots.length - 1,
      new Set(),
      rendered,
    );
  });
});

if (warnings.size > 0) {
  const warningSection = researchGroup.createDiv({
    cls: "project-research-tree-warning-section",
  });
  const warningEntries = Array.from(warnings.values()).sort((left, right) =>
    sortPages(left.page, right.page)
  );
  for (const { page, reasons } of warningEntries) {
    renderWarningRow(warningSection, page, Array.from(reasons));
  }
}
