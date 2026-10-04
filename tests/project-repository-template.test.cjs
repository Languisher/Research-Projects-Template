const assert = require("node:assert/strict");
const test = require("node:test");
const connect = require("../99 Templates/Scripts/Project Repository.js");

function context(name, desktop = false, mappings = {}, answers = []) {
  let callback;
  const frontmatter = { type: "project", status: "进行中" };
  const config = { owner: "Languisher", suffix: "-Proposal", visibility: "private", projects: mappings };
  const notePath = `02 Projects/${name}/${name}.md`;
  const notices = [];
  return {
    app: {
      vault: {
        adapter: { read: async () => JSON.stringify(config) },
        getAbstractFileByPath: (path) => path === notePath ? { path } : null,
      },
      fileManager: { processFrontMatter: async (_file, modify) => modify(frontmatter) },
    },
    tp: {
      file: { folder: () => `02 Projects/${name}`, path: () => notePath },
      system: { prompt: async () => answers.shift() ?? null },
      hooks: { on_all_templates_executed: (fn) => { callback = fn; } },
      obsidian: { Platform: { isDesktopApp: desktop }, Notice: class { constructor(message) { notices.push(message); } } },
    },
    finish: async () => { if (callback) await callback(); },
    frontmatter, notices,
  };
}

test("English names use one Proposal suffix; shell characters are rejected", () => {
  assert.equal(connect.repoName("New Research"), "New-Research-Proposal");
  assert.equal(connect.repoName("Demo-Proposal"), "Demo-Proposal");
  assert.equal(connect.repoName("$(whoami)"), null);
});
test("mobile creation keeps note metadata and queues desktop provisioning", async () => {
  const c = context("Demo");
  await connect(c);
  assert.equal(c.frontmatter.repository, undefined);
  await c.finish();
  assert.equal(c.frontmatter.repository, "https://github.com/Languisher/Demo-Proposal");
  assert.equal(c.frontmatter.status, "进行中");
  assert.match(c.notices.at(-1), /桌面/);
});
test("Chinese display names get a prompted English repo slug", async () => {
  const c = context("研究项目", false, {}, ["中文", "Research-Demo"]);
  await connect(c); await c.finish();
  assert.equal(c.frontmatter.repository, "https://github.com/Languisher/Research-Demo-Proposal");
});
test("existing custom mapping is reused", async () => {
  const c = context("中文项目", false, { 中文项目: "Existing-Proposal" });
  await connect(c); await c.finish();
  assert.equal(c.frontmatter.repository, "https://github.com/Languisher/Existing-Proposal");
});
test("case-insensitive collisions do not register callbacks or change metadata", async () => {
  const c = context("demo", false, { Other: "Demo-Proposal" });
  await assert.rejects(connect(c), /另一个 Project/);
  await c.finish();
  assert.equal(c.frontmatter.repository, undefined);
});

test("desktop creation invokes the shared CLI after saving project metadata", async () => {
  const childProcess = require("node:child_process");
  const original = childProcess.execFile;
  const c = context("New Research", true);
  c.app.vault.adapter.getBasePath = () => "/tmp/example-vault";
  let invoked;
  childProcess.execFile = (executable, args, options, callback) => {
    assert.equal(c.frontmatter.repository, "https://github.com/Languisher/New-Research-Proposal");
    invoked = { executable, args, options };
    callback(null, "connected", "");
  };
  try {
    await connect(c); await c.finish();
    assert.equal(invoked.executable, "/usr/bin/python3");
    assert.deepEqual(invoked.args.slice(-4), ["ensure", "New Research", "--repo", "New-Research-Proposal"]);
    assert.equal(invoked.options.shell, undefined);
    assert.match(c.notices.at(-1), /已连接/);
  } finally { childProcess.execFile = original; }
});

test("desktop network failure keeps project metadata and reports pending connection", async () => {
  const childProcess = require("node:child_process");
  const original = childProcess.execFile;
  const c = context("Demo", true);
  c.app.vault.adapter.getBasePath = () => "/tmp/example-vault";
  childProcess.execFile = (_exe, _args, _opts, callback) => callback(new Error("offline"), "", "network unavailable");
  try {
    await connect(c); await c.finish();
    assert.equal(c.frontmatter.repository, "https://github.com/Languisher/Demo-Proposal");
    assert.match(c.notices.at(-1), /笔记已保留/);
  } finally { childProcess.execFile = original; }
});
