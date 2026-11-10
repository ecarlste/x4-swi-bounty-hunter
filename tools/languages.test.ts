// ADR 0003 (docs/adr/0003-typescript-first-fewest-languages.md): no tracked file outside research/
// is in a language the ADR doesn't list. To add one, amend the ADR and this allowlist in one PR.
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { basename, extname } from "node:path";
import { fileURLToPath } from "node:url";

// The ADR's languages, by extension
const CODE = new Set([".ts", ".ps1", ".lua", ".xml", ".sh"]);
// Not code: docs, config, data and images
const NOT_CODE = new Set([".md", ".json", ".png", ".webp", ".csv", ".txt", ".cat", ".dat", ".example", ".gitignore", ".worktreeinclude"]);
// Make and git-hook glue, which have no extension
const GLUE = (path: string) => basename(path) === "Makefile" || path.startsWith(".githooks/");

export const allowed = (path: string): boolean => {
  if (path.startsWith("research/") || GLUE(path)) return true;
  const ext = extname(path) || basename(path); // .gitignore has no extname
  return CODE.has(ext) || NOT_CODE.has(ext);
};

test("the allowlist takes the ADR's languages and turns away others", () => {
  for (const path of ["tools/a.ts", "tools/x.ps1", "tests/game/x/ui/a.lua", "extension/swibh/md/a.xml", "Makefile", ".githooks/pre-commit", "README.md", "research/old.py"])
    assert.ok(allowed(path), path);
  for (const path of ["tools/check.py", "tools/a.js", "tools/a.awk", "scripts/build.rb", "tools/no-extension"])
    assert.ok(!allowed(path), path);
});

test("every tracked file outside research/ is in a language ADR 0003 lists", () => {
  const root = fileURLToPath(new URL("..", import.meta.url));
  const files = execFileSync("git", ["ls-files", "-z"], { cwd: root, encoding: "utf8" }).split("\0").filter(Boolean);
  const others = files.filter((f) => !allowed(f));
  assert.deepEqual(
    others,
    [],
    `These files are in a language ADR 0003 doesn't list (docs/adr/0003-typescript-first-fewest-languages.md). ` +
      "Port them to TypeScript, or amend the ADR and the allowlist in tools/languages.test.ts in the same PR.",
  );
});
