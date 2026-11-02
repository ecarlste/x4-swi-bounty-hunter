// Claude Code PreToolUse hook (.claude/settings.json): blocks Edit, Write and NotebookEdit on
// any file in a checkout that has main checked out. Sessions share the main checkout, so each
// session works in its own worktree and branch (CLAUDE.md, Parallel sessions).
// Reads the hook's JSON on stdin; exit 2 blocks the tool call and shows stderr to Claude.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname } from "node:path";

const { tool_input: input } = JSON.parse(readFileSync(0, "utf8"));
const path: string | undefined = input?.file_path ?? input?.notebook_path;
if (!path) process.exit(0);

// A new file can sit in folders that don't exist yet: ask git from the nearest one that does
let dir = dirname(path);
while (!existsSync(dir) && dirname(dir) !== dir) dir = dirname(dir);

let branch: string;
try {
  branch = execFileSync("git", ["-C", dir, "branch", "--show-current"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  }).trim();
} catch {
  process.exit(0); // not in a git repo
}

if (branch === "main") {
  console.error(
    `${path} is in a checkout on main, which other sessions share. ` +
      "Call EnterWorktree first, so this session works on its own branch, then make the edit there " +
      "(CLAUDE.md, Parallel sessions).",
  );
  process.exit(2);
}
