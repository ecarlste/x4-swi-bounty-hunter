import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const hook = fileURLToPath(new URL("guard-main.ts", import.meta.url));

function repoOn(branch: string): string {
  const dir = mkdtempSync(join(tmpdir(), "guard-main-"));
  const git = (...args: string[]) => execFileSync("git", ["-C", dir, ...args], { stdio: "ignore" });
  git("init", "-q", "-b", branch);
  writeFileSync(join(dir, "README.md"), "x\n");
  git("add", ".");
  git("-c", "user.name=t", "-c", "user.email=t@t", "commit", "-q", "-m", "init");
  return dir;
}

function runHook(toolInput: Record<string, string>) {
  return spawnSync(process.execPath, [hook], {
    input: JSON.stringify({ tool_name: "Edit", tool_input: toolInput }),
    encoding: "utf8",
  });
}

test("an edit in a checkout on main is blocked, and the message says to use a worktree", () => {
  const result = runHook({ file_path: join(repoOn("main"), "README.md") });

  assert.equal(result.status, 2);
  assert.match(result.stderr, /EnterWorktree/);
});

test("a new file in a new folder of a checkout on main is blocked", () => {
  const result = runHook({ file_path: join(repoOn("main"), "docs", "adr", "0009-new.md") });

  assert.equal(result.status, 2);
});

test("an edit on an issue branch is allowed", () => {
  const result = runHook({ file_path: join(repoOn("issue-17"), "README.md") });

  assert.equal(result.status, 0);
});

test("an edit outside any git repo is allowed", () => {
  const result = runHook({ file_path: join(mkdtempSync(join(tmpdir(), "guard-main-")), "notes.md") });

  assert.equal(result.status, 0);
});

test("a notebook edit on main is blocked too", () => {
  const result = runHook({ notebook_path: join(repoOn("main"), "a.ipynb") });

  assert.equal(result.status, 2);
});
