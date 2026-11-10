// make check-deps: every devDependency resolves from tools/ (the way the tools import it, which
// from a worktree with no node_modules of its own finds the main checkout's) at the version
// package-lock.json records. Fails naming each missing or stale package.
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const readJson = (path: string) => JSON.parse(readFileSync(path, "utf8"));

// Node's lookup for a bare specifier: node_modules/<name> in fromDir, then each parent directory
function resolvePackageJson(name: string, fromDir: string): string | undefined {
  for (let dir = fromDir; ; dir = dirname(dir)) {
    const candidate = join(dir, "node_modules", name, "package.json");
    if (existsSync(candidate)) return candidate;
    if (dirname(dir) === dir) return undefined;
  }
}

/** One line per devDependency of repoRoot that is missing or differs from package-lock.json. */
export function checkDeps(repoRoot: string, fromDir: string): string[] {
  const devDependencies: Record<string, string> =
    readJson(join(repoRoot, "package.json")).devDependencies ?? {};
  const locked: Record<string, { version?: string }> =
    readJson(join(repoRoot, "package-lock.json")).packages ?? {};

  return Object.keys(devDependencies).flatMap((name) => {
    const want = locked[`node_modules/${name}`]?.version;
    const resolved = resolvePackageJson(name, fromDir);
    if (!resolved) return [`${name}: not installed (package-lock.json has ${want ?? "no entry"})`];
    const have: string = readJson(resolved).version;
    if (want === undefined) return [`${name}: package-lock.json has no entry (installed ${have})`];
    return have === want ? [] : [`${name}: installed ${have}, package-lock.json has ${want}`];
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const tools = dirname(fileURLToPath(import.meta.url));
  const problems = checkDeps(dirname(tools), tools);
  if (problems.length === 0) {
    console.log("Dependencies: ok");
  } else {
    console.error("node_modules doesn't match package-lock.json:");
    for (const problem of problems) console.error(`  ${problem}`);
    console.error(
      "Run `make setup` in the main checkout (or `npm install` in this worktree if your branch changes package.json).",
    );
    process.exit(1);
  }
}
