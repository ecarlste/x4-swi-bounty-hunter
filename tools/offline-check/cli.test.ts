import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, readdirSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const tools = fileURLToPath(new URL("..", import.meta.url));
const cli = join(tools, "offline-check.ts");
// The node_modules the real tools load from (the main checkout's, from a worktree)
const xmldom = fileURLToPath(import.meta.resolve("@xmldom/xmldom"));
const nodeModules = xmldom.slice(0, xmldom.lastIndexOf("/node_modules/") + "/node_modules".length);
const usage = "Usage: node tools/offline-check.ts [--get KEY | --get-windows KEY]\n";
// No game or SWI paths, so the checks that need them skip
const noPaths = { ...process.env, X4_PATH: "", X4_UNPACKED: "", SWI_UNPACKED: "" };

// A repo with the real CLI and modules in its tools/, no test.config, and a test extension
// whose test list is the test-list fixture, plus one more XML file with the given text
function fakeRepo(extraXml: string): string {
  const root = mkdtempSync(join(tmpdir(), "offline-check-cli-"));
  mkdirSync(join(root, "tools", "offline-check"), { recursive: true });
  for (const file of ["offline-check.ts", "wsl-path.ts"]) copyFileSync(join(tools, file), join(root, "tools", file));
  for (const file of readdirSync(join(tools, "offline-check")).filter((f) => f.endsWith(".ts") && !f.endsWith(".test.ts")))
    copyFileSync(join(tools, "offline-check", file), join(root, "tools", "offline-check", file));
  symlinkSync(nodeModules, join(root, "node_modules"), "dir");
  writeFileSync(join(root, "package.json"), JSON.stringify({ type: "module" }));
  const md = join(root, "tests", "game", "swibh_tests", "md");
  mkdirSync(md, { recursive: true });
  copyFileSync(join(tools, "offline-check", "fixtures", "test-list", "good.xml"), join(md, "swibh_tests.xml"));
  writeFileSync(join(md, "extra.xml"), extraXml);
  return root;
}

const run = (cliPath: string, args: string[], env: NodeJS.ProcessEnv = noPaths) =>
  spawnSync(process.execPath, [cliPath, ...args], { encoding: "utf8", env });

test("the CLI passes and exits 0 when every check that can run passes", () => {
  const root = fakeRepo("<mdscript/>\n");
  const result = run(join(root, "tools", "offline-check.ts"), []);

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /^Well-formed XML: ok\n/);
  assert.match(result.stdout, /\nTest list: ok\n/);
  assert.match(result.stdout, /\nOffline checks passed\n$/);
});

test("the CLI names a failing check and exits 1", () => {
  const root = fakeRepo("<mdscript>\n");
  const result = run(join(root, "tools", "offline-check.ts"), []);

  assert.equal(result.status, 1);
  assert.match(result.stdout, /^Well-formed XML: FAIL\n(  .*\n)*  FAIL tests\/game\/swibh_tests\/md\/extra\.xml: /);
  assert.match(result.stdout, /\nOffline checks FAILED\n$/);
});

test("--get prints a value and exits 0, or prints an empty line and exits 1 when it's unset", () => {
  const set = run(cli, ["--get", "SWIBH_TEST_VALUE"], { ...process.env, SWIBH_TEST_VALUE: "/some/path" });
  assert.deepEqual([set.status, set.stdout], [0, "/some/path\n"]);

  const unset = run(cli, ["--get", "SWIBH_NO_SUCH_KEY"]);
  assert.deepEqual([unset.status, unset.stdout], [1, "\n"]);
});

test("--get and --get-windows together exit 2 with the usage line", () => {
  const result = run(cli, ["--get", "X4_PATH", "--get-windows", "X4_PATH"]);

  assert.deepEqual([result.status, result.stdout, result.stderr], [2, "", usage]);
});

test("--get with no key exits 2 with the usage line, without running the checks", () => {
  const result = run(cli, ["--get"]);

  assert.deepEqual([result.status, result.stdout], [2, ""]);
  assert.ok(result.stderr.endsWith(usage), result.stderr);
});

test("an unknown option exits 2 with the usage line, without running the checks", () => {
  const result = run(cli, ["--nope"]);

  assert.deepEqual([result.status, result.stdout], [2, ""]);
  assert.ok(result.stderr.endsWith(usage), result.stderr);
});
