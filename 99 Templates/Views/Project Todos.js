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

function linkedPaths(value) {
  return asArray(value).map(normalizePath).filter(Boolean);
}

function unique(values) {
  return Array.from(new Set(values));
}

const projectPath = normalizePath(current.path);
const projectName = current.name;
const projectFolderPrefix = `${current.folder}/`;

function isCurrentProject(value) {
  const path = normalizePath(value);
  if (!path) return false;
  return path === projectPath || path.split("/").at(-1) === projectName;
}

function isOpenProjectTask(task) {
  const tags = asArray(task.tags).map(String);
  const hasTaskTag =
    tags.includes("#task") || /(^|\s)#task(?=\s|$)/u.test(task.text || "");
  return hasTaskTag && !task.completed && task.status !== "-";
}

// Task-level ownership is deliberately parsed from the task text. This keeps it
// separate from a Meeting's page-level `project` frontmatter.
function taskProjectPaths(task) {
  const text = task.text || "";
  const paths = [];
  const linkField = /\[project::\s*\[\[([^\]]+)\]\]\s*\]/giu;
  const plainField = /\[project::\s*([^\[\]]+?)\s*\]/giu;

  for (const match of text.matchAll(linkField)) {
    const path = normalizePath(match[1]);
    if (path) paths.push(path);
  }
  for (const match of text.matchAll(plainField)) {
    const path = normalizePath(match[1]);
    if (path) paths.push(path);
  }

  return unique(paths);
}

function taskSortKey(task) {
  const due = task.due?.toMillis?.() ?? Number.MAX_SAFE_INTEGER;
  return [due, task.path || "", task.line ?? 0];
}

function compareTasks(left, right) {
  const leftKey = taskSortKey(left);
  const rightKey = taskSortKey(right);
  return (
    leftKey[0] - rightKey[0] ||
    leftKey[1].localeCompare(rightKey[1], "zh-CN", { numeric: true }) ||
    leftKey[2] - rightKey[2]
  );
}

const projectTasks = Array.from(dv.pages())
  .filter((page) => page.file.path.startsWith(projectFolderPrefix))
  .flatMap((page) => asArray(page.file.tasks))
  .filter(isOpenProjectTask);

const meetingTasks = [];
const ambiguousMeetingTasks = [];
const meetings = Array.from(dv.pages('"03 Meetings"')).filter(
  (page) => page.type === "meeting",
);

for (const meeting of meetings) {
  const meetingProjects = unique(linkedPaths(meeting.project));
  if (!meetingProjects.some(isCurrentProject)) continue;

  const isMultiProjectMeeting = meetingProjects.length > 1;
  for (const task of asArray(meeting.file.tasks).filter(isOpenProjectTask)) {
    const explicitProjects = taskProjectPaths(task);

    if (explicitProjects.length > 0) {
      if (explicitProjects.some(isCurrentProject)) meetingTasks.push(task);
      continue;
    }

    if (isMultiProjectMeeting) {
      ambiguousMeetingTasks.push(task);
    } else {
      meetingTasks.push(task);
    }
  }
}

const tasks = [...projectTasks, ...meetingTasks].sort(compareTasks);

if (tasks.length > 0) {
  dv.taskList(tasks, true);
} else {
  dv.paragraph("暂无未完成任务。");
}

if (ambiguousMeetingTasks.length > 0) {
  const note = dv.container.createEl("div", {
    cls: "project-todos-warning",
  });
  note.createEl("strong", {
    text: `⚠ ${ambiguousMeetingTasks.length} 条跨 Project 会议任务未归属`,
  });
  note.createEl("div", {
    text: "请在任务中加入 [project:: [[Project 名称]]]；未标记的任务不会显示在任何 Project 的 To-dos 中。",
  });
}
