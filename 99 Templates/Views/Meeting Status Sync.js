function frontmatterFor(page) {
  const file = app.vault.getAbstractFileByPath(page.file.path);
  if (!file) return null;
  return app.metadataCache.getFileCache(file)?.frontmatter || null;
}

function meetingDate(value) {
  if (!value) return null;
  if (value?.toFormat) return value;

  const parsed = dv.date(String(value));
  return parsed?.toFormat ? parsed : null;
}

function validTime(value) {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return /^([01]\d|2[0-3]):[0-5]\d$/u.test(text) ? text : null;
}

function scheduledTime(frontmatter) {
  const date = meetingDate(frontmatter?.date);
  const time = validTime(frontmatter?.time);
  if (!date || !time) return null;

  const [hour, minute] = time.split(":").map(Number);
  return date.set({ hour, minute, second: 0, millisecond: 0 });
}

const now = Date.now();
const meetings = Array.from(dv.pages('"03 Meetings"'));

for (const meeting of meetings) {
  const frontmatter = frontmatterFor(meeting);
  if (frontmatter?.type !== "meeting" || frontmatter.status !== "计划中") {
    continue;
  }

  const scheduled = scheduledTime(frontmatter);
  if (!scheduled || scheduled.toMillis() > now) continue;

  const file = app.vault.getAbstractFileByPath(meeting.file.path);
  if (!file) continue;

  await app.fileManager.processFrontMatter(file, (latest) => {
    if (latest.status === "计划中") latest.status = "已完成";
  });
}
