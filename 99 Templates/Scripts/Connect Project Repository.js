module.exports = async ({ app, quickAddApi, obsidian }) => {
  const projects = app.vault.getMarkdownFiles().filter((file) => {
    const parts = file.path.split("/");
    return parts.length === 3 && parts[0] === "02 Projects" && !/^[._]/u.test(parts[1]) &&
      file.basename === parts[1] && app.metadataCache.getFileCache(file)?.frontmatter?.type === "project";
  }).sort((a, b) => a.basename.localeCompare(b.basename));
  const file = await quickAddApi.suggester(projects.map((p) => p.basename), projects, "选择要连接或补办仓库的 Project");
  if (!file) return;
  const source = await app.vault.adapter.read("99 Templates/Scripts/Project Repository.js");
  const helper = { exports: {} };
  new Function("module", "require", source)(helper, typeof require === "function" ? require : undefined);
  let finish;
  await helper.exports({ app, tp: {
    file: { folder: () => file.parent.path, path: () => file.path },
    system: { prompt: (message) => quickAddApi.inputPrompt(message) },
    obsidian,
    hooks: { on_all_templates_executed: (callback) => { finish = callback; } },
  } });
  if (finish) await finish();
};
