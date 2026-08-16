const current = dv.current().file;

function normalizePath(value) {
  if (!value) return null;

  let raw = value;
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

function addInternalLink(container, page) {
  const link = container.createEl("a", {
    text: page.file.name,
    cls: "internal-link",
  });
  link.setAttr("data-href", page.file.path);
  link.setAttr("href", page.file.path);
}

function addPathLink(container, path, label) {
  const link = container.createEl("a", {
    text: label,
    cls: "internal-link",
  });
  link.setAttr("data-href", path);
  link.setAttr("href", path);
}

const projectPath = normalizePath(current.path);
const inCurrentProject = (page) =>
  asArray(page.project).some((project) => normalizePath(project) === projectPath);
const ideas = Array.from(
  dv
    .pages('"02 Projects"')
    .where(
      (page) =>
        page.type === "idea" &&
        inCurrentProject(page),
    ),
);

const questionsByPath = new Map(
  Array.from(
    dv
      .pages('"02 Projects"')
      .where(
        (page) =>
          page.type === "research-question" &&
          inCurrentProject(page),
      ),
  ).map((page) => [normalizePath(page.file.path), page]),
);

if (ideas.length === 0) {
  dv.paragraph("暂无 Idea。");
}

const collator = new Intl.Collator("zh-CN", {
  numeric: true,
  sensitivity: "base",
});
const byPath = new Map(
  ideas.map((page) => [normalizePath(page.file.path), page]),
);
const children = new Map();
const roots = [];
const warnings = new Set();

for (const page of ideas) {
  const path = normalizePath(page.file.path);
  const parentPath = normalizePath(page.parent_idea);

  if (!parentPath) {
    roots.push(page);
    continue;
  }

  if (parentPath === path) {
    roots.push(page);
    warnings.add(`${page.file.name} 把自己设为了父 Idea。`);
    continue;
  }

  if (!byPath.has(parentPath)) {
    roots.push(page);
    warnings.add(
      `${page.file.name} 的父 Idea 不存在或不属于当前 Project。`,
    );
    continue;
  }

  if (!children.has(parentPath)) children.set(parentPath, []);
  children.get(parentPath).push(page);
}

for (const childPages of children.values()) {
  childPages.sort((left, right) =>
    collator.compare(left.file.name, right.file.name),
  );
}

roots.sort((left, right) =>
  collator.compare(left.file.name, right.file.name),
);

const visited = new Set();

function renderNode(page, list, ancestry) {
  const path = normalizePath(page.file.path);

  if (ancestry.has(path)) {
    const item = list.createEl("li", { text: `↻ ${page.file.name}（检测到循环）` });
    item.addClass("project-kb-warning");
    warnings.add(`Idea 层级中检测到包含 ${page.file.name} 的循环。`);
    return;
  }

  if (visited.has(path)) return;
  visited.add(path);

  const item = list.createEl("li");
  addInternalLink(item, page);
  item.createSpan({ text: ` · ${page.status || "未设置状态"}` });
  item.createSpan({
    text: ` · ${page.file.mtime.toFormat("MM/dd HH:mm")}`,
    cls: "project-kb-meta",
  });

  const questionLinks = asArray(page.research_questions);
  if (questionLinks.length === 0) {
    item.createSpan({ text: " · ⚠ 未连接 RQ", cls: "project-kb-warning" });
    warnings.add(`${page.file.name} 尚未连接 Research Question 文档。`);
  } else {
    item.createSpan({ text: " · RQ: " });
    questionLinks.forEach((value, index) => {
      if (index > 0) item.createSpan({ text: ", " });
      const questionPath = normalizePath(value);
      const question = questionsByPath.get(questionPath);
      const label = question
        ? question.file.name
        : questionPath?.split("/").at(-1) || "无效链接";
      addPathLink(item, questionPath || "", label);

      if (!question) {
        warnings.add(
          `${page.file.name} 连接的 Research Question 不存在或不属于当前 Project：${label}。`,
        );
      }
    });
  }

  if (page.research_question) {
    warnings.add(
      `${page.file.name} 仍在使用旧字段 research_question，请迁移到 research_questions。`,
    );
  }

  const childPages = children.get(path) || [];
  if (childPages.length === 0) return;

  const childList = item.createEl("ul");
  const nextAncestry = new Set(ancestry);
  nextAncestry.add(path);
  for (const child of childPages) {
    renderNode(child, childList, nextAncestry);
  }
}

if (ideas.length > 0) {
  const list = dv.container.createEl("ul");
  for (const root of roots) {
    renderNode(root, list, new Set());
  }
}

const unreachable = ideas.filter(
  (page) => !visited.has(normalizePath(page.file.path)),
);
if (unreachable.length > 0) {
  dv.header(3, "关系异常");
  const list = dv.container.createEl("ul");
  for (const page of unreachable) {
    if (!visited.has(normalizePath(page.file.path))) {
      renderNode(page, list, new Set());
    }
  }
}

if (warnings.size > 0) {
  dv.header(4, "关系检查");
  dv.list(Array.from(warnings));
}
