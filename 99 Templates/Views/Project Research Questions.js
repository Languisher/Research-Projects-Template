const current = dv.current().file;

function normalizePath(value) {
  if (!value) return null;
  const raw = value && typeof value === "object" && value.path
    ? value.path
    : value;
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
const inCurrentProject = (page) =>
  asArray(page.project).some((project) => normalizePath(project) === projectPath);
const questions = Array.from(
  dv.pages('"02 Projects"').where(
    (page) =>
      page.type === "research-question" &&
      inCurrentProject(page),
  ),
).sort((left, right) => left.file.name.localeCompare(
  right.file.name,
  "zh-CN",
  { numeric: true, sensitivity: "base" },
));

const ideas = Array.from(
  dv.pages('"02 Projects"').where(
    (page) =>
      page.type === "idea" &&
      inCurrentProject(page),
  ),
);

if (questions.length === 0) {
  dv.paragraph("暂无 Research Question。");
} else {
  dv.table(
    ["Research Question", "相关 Ideas", "更新"],
    questions.map((question) => {
      const questionPath = normalizePath(question.file.path);
      const relatedIdeas = ideas
        .filter((idea) =>
          asArray(idea.research_questions)
            .map(normalizePath)
            .includes(questionPath),
        )
        .map((idea) => idea.file.link);

      return [
        question.file.link,
        relatedIdeas,
        question.file.mtime.toFormat("MM/dd HH:mm"),
      ];
    }),
  );
}
