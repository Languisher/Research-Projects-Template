// Called after the Project template finishes; Knowledge creation does not use it.
function repoName(name) {
  let slug = name.trim().replace(/\s+/gu, "-");
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/u.test(slug)) return null;
  if (!slug.endsWith("-Proposal")) slug += "-Proposal";
  return slug.length <= 100 ? slug : null;
}

async function connect({ app, tp }) {
  const config = JSON.parse(await app.vault.adapter.read("project-repositories.json"));
  if (config.suffix !== "-Proposal" || config.visibility !== "private") {
    throw new Error("项目仓库规则必须为私有 XX-Proposal。");
  }
  const folder = tp.file.folder(true);
  const parts = folder.split("/");
  if (parts.length !== 2 || parts[0] !== "02 Projects" || /^[._]/u.test(parts[1])) {
    throw new Error("只为 02 Projects 下的直接 Project 创建仓库。");
  }
  const name = parts[1];
  let repo = config.projects[name] ?? repoName(name);
  while (!repo) {
    const answer = await tp.system.prompt("GitHub 英文项目名（自动加 -Proposal）");
    if (answer === null) {
      new tp.obsidian.Notice("项目笔记已保留；尚未指定英文仓库名。", 8000);
      return;
    }
    repo = repoName(answer);
  }
  if (Object.entries(config.projects).some(([other, existing]) => other !== name && existing.toLowerCase() === repo.toLowerCase())) {
    throw new Error("该仓库名已属于另一个 Project，请使用不同的英文名。");
  }
  const notePath = tp.file.path(true);
  const url = `https://github.com/${config.owner}/${repo}`;
  tp.hooks.on_all_templates_executed(async () => {
    const note = app.vault.getAbstractFileByPath(notePath);
    if (!note) throw new Error("项目笔记尚未写入，保留笔记后重新连接仓库。");
    await app.fileManager.processFrontMatter(note, (frontmatter) => {
      frontmatter.repository = url;
    });
    const base = app.vault.adapter.getBasePath?.();
    if (!tp.obsidian.Platform.isDesktopApp || !base || typeof require !== "function") {
      new tp.obsidian.Notice("仓库地址已记录。请在桌面执行项目仓库同步完成创建。", 10000);
      return;
    }
    const { execFile } = require("node:child_process");
    const path = require("node:path");
    const script = path.join(base, "tools", "project_repositories.py");
    const env = { ...process.env, PATH: `/opt/homebrew/bin:/usr/local/bin:${process.env.PATH ?? "/usr/bin:/bin"}` };
    new tp.obsidian.Notice(`正在连接 ${repo}…`, 8000);
    await new Promise((resolve) => {
      execFile("/usr/bin/python3", [script, "--vault", base, "ensure", name, "--repo", repo],
        { cwd: base, env, timeout: 900000, maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
          if (error) {
            console.warn("Project repository connection pending:", stderr || error.message);
            new tp.obsidian.Notice("笔记已保留，仓库连接待完成：请检查 GitHub 登录或网络，再运行项目仓库同步。", 12000);
          } else {
            new tp.obsidian.Notice(`${repo} 已连接。`, 8000);
          }
          resolve();
        });
    });
  });
}
module.exports = connect;
module.exports.repoName = repoName;
