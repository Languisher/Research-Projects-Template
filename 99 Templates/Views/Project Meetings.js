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

const projectPath = normalizePath(current.path);
const projectName = current.name;

function isCurrentProject(value) {
  const path = normalizePath(value);
  if (!path) return false;
  return path === projectPath || path.split("/").at(-1) === projectName;
}

function meetingTitle(meeting) {
  const match = meeting.file.name.match(
    /^MEETING-\d{4}-\d{2}-\d{2}-(.+)$/iu,
  );
  return match?.[1]?.trim() || meeting.file.name;
}

function meetingDate(meeting) {
  if (meeting.date?.toFormat) return meeting.date;
  if (typeof meeting.date === "string") {
    const parsed = dv.date(meeting.date);
    if (parsed?.toFormat) return parsed;
  }
  return null;
}

function validTime(value) {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return /^([01]\d|2[0-3]):[0-5]\d$/u.test(text) ? text : null;
}

function meetingTimestamp(meeting) {
  const date = meetingDate(meeting);
  const time = validTime(meeting.time);
  if (!date) return meeting.file.mtime.toFormat("MM-dd HH:mm");
  return `${date.toFormat("MM-dd")}${time ? ` ${time}` : ""}`;
}

function meetingSortTime(meeting) {
  const date = meetingDate(meeting);
  if (!date) return meeting.file.mtime.toMillis();

  const time = validTime(meeting.time);
  const [hour, minute] = time ? time.split(":").map(Number) : [0, 0];
  return date.set({ hour, minute }).toMillis();
}

const meetings = Array.from(dv.pages('"03 Meetings"'))
  .filter(
    (meeting) =>
      meeting.type === "meeting" &&
      asArray(meeting.project).some(isCurrentProject),
  )
  .sort(
    (left, right) =>
      meetingSortTime(right) - meetingSortTime(left) ||
      left.file.name.localeCompare(right.file.name, "zh-CN", { numeric: true }),
  );

if (meetings.length === 0) {
  dv.paragraph("暂无关联会议。");
} else {
  const list = dv.container.createDiv({
    cls: "project-research-tree project-meeting-list",
  });

  for (const meeting of meetings) {
    const row = list.createDiv({
      cls: "project-research-tree-row project-research-tree-depth-0 project-meeting-row",
    });

    row.createSpan({
      text: "MEETING",
      cls: "project-research-tree-id",
    });

    const link = row.createEl("a", {
      text: meetingTitle(meeting),
      cls: "internal-link project-research-tree-link",
    });
    link.setAttr("data-href", meeting.file.path);
    link.setAttr("href", meeting.file.path);

    row.createSpan({ cls: "project-research-tree-leader" });
    row.createSpan({
      text: meeting.status || "未设置",
      cls: `project-meeting-status project-meeting-status-${meeting.status || "unset"}`,
    });
    row.createSpan({
      text: meetingTimestamp(meeting),
      cls: "project-research-tree-time",
    });
  }
}
