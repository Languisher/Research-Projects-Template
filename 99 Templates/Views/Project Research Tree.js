const current = dv.current().file;

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
  if (page.file.name === "Proposal") {
    return { identifier: "DOC", title: "Proposal" };
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
const proposal = dv.page(`${current.folder}/Proposal`);
const pages = Array.from(dv.pages('"02 Projects"'));
const inCurrentProject = (page) => normalizePath(page.project) === projectPath;
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

questions.sort(sortPages);
ideas.sort(sortPages);
experiments.sort(sortPages);

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

const tree = dv.container.createDiv({ cls: "project-research-tree" });

if (proposal) {
  renderRow(tree, proposal, 0);
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

  renderRow(tree, idea, depth, ancestorIsLast, isLast);

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
      renderRow(tree, child.page, depth + 1, nextAncestors, childIsLast);
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
  renderRow(tree, question, 0);

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
  const warningSection = tree.createDiv({
    cls: "project-research-tree-warning-section",
  });
  const warningEntries = Array.from(warnings.values()).sort((left, right) =>
    sortPages(left.page, right.page)
  );
  for (const { page, reasons } of warningEntries) {
    renderWarningRow(warningSection, page, Array.from(reasons));
  }
}
