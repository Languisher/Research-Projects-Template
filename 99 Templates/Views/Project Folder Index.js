const root = dv.current().file.folder;
const currentFile = dv.current().file.path;

function isFolderNote(page) {
  const parts = page.file.folder.split("/");
  const folderName = parts[parts.length - 1];
  return page.file.name === folderName;
}

const pages = dv
  .pages(`"${root}"`)
  .where((page) => page.file.path !== currentFile)
  .sort((page) => page.file.path, "asc");

const documents = pages.where((page) => !isFolderNote(page));
function formatTime(time) {
  return time.toFormat("MM/dd HH:mm");
}

dv.el("div", `${documents.length} 文档`, { cls: "project-kb-meta" });

const rows = pages.map((page) => {
  const relativePath = page.file.path.substring(root.length + 1);
  const depth = relativePath.split("/").length - 1;
  const folderNote = isFolderNote(page);
  const indent = folderNote ? Math.max(0, depth - 1) : depth;
  const prefix = "　".repeat(indent) + (folderNote ? "⌄ " : "");

  return [
    dv.fileLink(page.file.path, false, prefix + page.file.name),
    formatTime(page.file.mtime),
  ];
});

dv.table(["", ""], rows);
