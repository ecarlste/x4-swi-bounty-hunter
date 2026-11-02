// Claude Code PreToolUse hook (.claude/settings.json): blocks Edit, Write and NotebookEdit on
// any file in the repo's main checkout, whatever branch it has checked out. Sessions share the
// main checkout, so each session works in its own worktree (CLAUDE.md, Parallel sessions).
// Reads the hook's JSON on stdin; exit 2 blocks the tool call and shows stderr to Claude.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

function git(dir: string, ...args: string[]): string | undefined {
  try {
    return execFileSync("git", ["-C", dir, ...args], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return undefined; // not in a git repo
  }
}

const { tool_input: input } = JSON.parse(readFileSync(0, "utf8"));
const path: string | undefined = input?.file_path ?? input?.notebook_path;
if (!path) process.exit(0);

// The main checkout holds the repo's shared .git folder, wherever this hook runs from
const hookDir = dirname(fileURLToPath(import.meta.url));
const commonDir = git(hookDir, "rev-parse", "--path-format=absolute", "--git-common-dir");
if (!commonDir) process.exit(0);
const mainCheckout = dirname(commonDir);

// A new file can sit in folders that don't exist yet: ask git from the nearest one that does
let dir = dirname(path);
while (!existsSync(dir) && dirname(dir) !== dir) dir = dirname(dir);

if (git(dir, "rev-parse", "--path-format=absolute", "--show-toplevel") === mainCheckout) {
  console.error(
    `${path} is in the main checkout, which other sessions share. ` +
      "Call EnterWorktree first, so this session works on its own branch, then make the edit there " +
      "(CLAUDE.md, Parallel sessions).",
  );
  process.exit(2);
}
