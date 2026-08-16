function asArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return Array.from(value);
  if (typeof value !== "string" && value[Symbol.iterator]) {
    return Array.from(value);
  }
  return [value];
}

function normalizePath(value) {
  if (!value) return null;

  let raw = value;
  if (raw && typeof raw === "object" && raw.path) raw = raw.path;
  if (typeof raw !== "string") return null;

  return raw
    .trim()
    .replace(/^\[\[/u, "")
    .replace(/\]\]$/u, "")
    .split("|")[0]
    .replace(/\.md$/u, "")
    .trim();
}

function unique(values) {
  return Array.from(new Set(values.filter(Boolean)));
}

function frontmatterValue(page, key) {
  const file = app.vault.getAbstractFileByPath(page.file.path);
  return file
    ? app.metadataCache.getFileCache(file)?.frontmatter?.[key]
    : null;
}

function taskProjectPaths(task) {
  const text = task.text || "";
  const paths = [];
  const linkField = /\[project::\s*\[\[([^\]]+)\]\]\s*\]/giu;
  const plainField = /\[project::\s*([^\[\]]+?)\s*\]/giu;

  for (const match of text.matchAll(linkField)) {
    paths.push(normalizePath(match[1]));
  }
  for (const match of text.matchAll(plainField)) {
    paths.push(normalizePath(match[1]));
  }

  return unique(paths);
}

function projectRootPath(project) {
  const path = normalizePath(project);
  if (!path) return null;
  if (path.includes("/")) return path;

  const directProject = `02 Projects/${path}/${path}`;
  return dv.page(directProject) ? directProject : path;
}

function projectLinks(page, task) {
  const explicitProjects = taskProjectPaths(task);
  if (explicitProjects.length > 0) {
    return explicitProjects.map(projectRootPath).map((path) =>
      dv.fileLink(path, false, path.split("/").at(-1)),
    );
  }

  const pageProjects = unique(
    asArray(frontmatterValue(page, "project"))
      .map(normalizePath)
      .map(projectRootPath),
  );
  if (page.type === "meeting" && pageProjects.length > 1) {
    return "未明确归属";
  }
  if (pageProjects.length > 0) {
    return pageProjects.map((path) =>
      dv.fileLink(path, false, path.split("/").at(-1)),
    );
  }

  const parts = page.file.path.split("/");
  if (parts[0] === "02 Projects" && parts[1] && parts[1] !== "_Shared") {
    const projectPath = `02 Projects/${parts[1]}/${parts[1]}`;
    return [dv.fileLink(projectPath, false, parts[1])];
  }

  return "未归属";
}

function cleanTaskText(task) {
  return (task.text || "")
    .replace(/(^|\s)#task(?=\s|$)/giu, " ")
    .replace(/\[project::\s*\[\[[^\]]+\]\]\s*\]/giu, " ")
    .replace(/\[project::\s*[^\[\]]+?\s*\]/giu, " ")
    .replace(/[\ud83d\udcc5\ud83d\udeeB\u23f3\u2705\u2795\u274c]\s*\d{4}-\d{2}-\d{2}/gu, " ")
    .replace(/[\u23eb\ud83d\udd3c\ud83d\udd3a\ud83d\udd3d\u23ec]/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
}

function explicitPriority(task) {
  const text = task.text || "";
  if (text.includes("⏫")) return 3;
  if (text.includes("🔼") || text.includes("🔺")) return 2;
  if (text.includes("⏬")) return -2;
  if (text.includes("🔽")) return -1;
  return 0;
}

const today = dv.date("today").startOf("day");

function urgency(task) {
  const due = task.due?.startOf?.("day") || null;
  const days = due ? Math.round(due.diff(today, "days").days) : null;
  const priority = explicitPriority(task);

  if (days !== null && days < 0) {
    return { label: "已逾期", marker: "_UI-Urgency-Overdue", rank: 0 };
  }
  if (days === 0) {
    return { label: "今天到期", marker: "_UI-Urgency-Strong", rank: 1 };
  }
  if (days === 1) {
    return { label: "明天到期", marker: "_UI-Urgency-Medium", rank: 2 };
  }
  if (days !== null && days <= 3) {
    return { label: "3 天内", marker: "_UI-Urgency-Soft", rank: 3 };
  }
  if (days !== null && days <= 7) {
    return { label: "7 天内", marker: "_UI-Urgency-Soft", rank: 4 };
  }
  if (priority >= 3) {
    return { label: "最高优先级", marker: "_UI-Priority-High", rank: 5 };
  }
  if (priority >= 2) {
    return { label: "高优先级", marker: "_UI-Priority-Medium", rank: 6 };
  }
  if (due) {
    return { label: "普通", marker: "_UI-Priority-Normal", rank: 7 };
  }
  if (priority < 0) {
    return { label: "低优先级", marker: "_UI-Priority-Low", rank: 9 };
  }
  return { label: "未排期", marker: "_UI-Priority-Normal", rank: 8 };
}

function isOpenTask(task) {
  const tags = asArray(task.tags).map(String);
  const hasTaskTag =
    tags.includes("#task") || /(^|\s)#task(?=\s|$)/u.test(task.text || "");
  return hasTaskTag && !task.completed && task.status !== "-";
}

const excludedPaths = new Set(["README.md", "AGENTS.md"]);
const rows = Array.from(dv.pages())
  .filter((page) =>
    !page.file.path.startsWith("99 Templates/") &&
    !page.file.path.startsWith("98 Docs/") &&
    !excludedPaths.has(page.file.path),
  )
  .flatMap((page) =>
    asArray(page.file.tasks)
      .filter(isOpenTask)
      .map((task) => {
        const level = urgency(task);
        return {
          task,
          level,
          values: [
            dv.fileLink(task.path, false, cleanTaskText(task)),
            projectLinks(page, task),
            task.due ? task.due.toFormat("yyyy-MM-dd") : "—",
            level.label,
            dv.fileLink(level.marker, false, level.label),
          ],
        };
      }),
  )
  .sort((left, right) => {
    const leftDue = left.task.due?.toMillis?.() ?? Number.MAX_SAFE_INTEGER;
    const rightDue = right.task.due?.toMillis?.() ?? Number.MAX_SAFE_INTEGER;
    return (
      left.level.rank - right.level.rank ||
      leftDue - rightDue ||
      left.task.path.localeCompare(right.task.path, "zh-CN", { numeric: true }) ||
      (left.task.line ?? 0) - (right.task.line ?? 0)
    );
  });

if (rows.length > 0) {
  dv.table(
    ["待办内容", "所属项目", "截止时间", "紧急程度", "_紧急程度"],
    rows.map((row) => row.values),
  );
} else {
  dv.paragraph("暂无未完成的待办。");
}
