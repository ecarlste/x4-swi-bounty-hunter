import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const source = fileURLToPath(new URL("guard-main.ts", import.meta.url));

function tempDir(): string {
  return mkdtempSync(join(tmpdir(), "guard-main-"));
}

// A clone with the hook committed in it and one linked worktree, like the repo with a session's worktree
function cloneWithWorktree() {
  const main = tempDir();
  const git = (...args: string[]) => execFileSync("git", ["-C", main, ...args], { stdio: "ignore" });
  git("init", "-q", "-b", "main");
  mkdirSync(join(main, "tools", "hooks"), { recursive: true });
  copyFileSync(source, join(main, "tools", "hooks", "guard-main.ts"));
  writeFileSync(join(main, "README.md"), "x\n");
  git("add", ".");
  git("-c", "user.name=t", "-c", "user.email=t@t", "commit", "-q", "-m", "init");
  const worktree = join(main, ".claude", "worktrees", "issue-17");
  git("worktree", "add", "-q", "-b", "issue-17", worktree);
  return { main, worktree, git, hook: join(main, "tools", "hooks", "guard-main.ts") };
}

function runHook(hook: string, toolInput: Record<string, string>) {
  return spawnSync(process.execPath, [hook], {
    input: JSON.stringify({ tool_name: "Edit", tool_input: toolInput }),
    encoding: "utf8",
  });
}

test("an edit in the main checkout is blocked, and the message says to use a worktree", () => {
  const { main, hook } = cloneWithWorktree();

  const result = runHook(hook, { file_path: join(main, "README.md") });

  assert.equal(result.status, 2);
  assert.match(result.stderr, /EnterWorktree/);
});

test("an edit in the main checkout is blocked whatever branch it has checked out", () => {
  const { main, git, hook } = cloneWithWorktree();
  git("switch", "-q", "-c", "issue-22");

  const result = runHook(hook, { file_path: join(main, "README.md") });

  assert.equal(result.status, 2);
});

test("a new file in a new folder of the main checkout is blocked", () => {
  const { main, hook } = cloneWithWorktree();

  const result = runHook(hook, { file_path: join(main, "docs", "adr", "0009-new.md") });

  assert.equal(result.status, 2);
});

test("a notebook edit in the main checkout is blocked too", () => {
  const { main, hook } = cloneWithWorktree();

  const result = runHook(hook, { notebook_path: join(main, "a.ipynb") });

  assert.equal(result.status, 2);
});

test("an edit in a session's worktree is allowed", () => {
  const { worktree, hook } = cloneWithWorktree();

  const result = runHook(hook, { file_path: join(worktree, "README.md") });

  assert.equal(result.status, 0);
});

test("an edit outside the repo is allowed", () => {
  const { hook } = cloneWithWorktree();

  const result = runHook(hook, { file_path: join(tempDir(), "notes.md") });

  assert.equal(result.status, 0);
});
