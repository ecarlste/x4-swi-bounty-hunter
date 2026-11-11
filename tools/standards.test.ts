// The mechanical rules for tools/ (CODING_STANDARDS.md points here): caret ranges for
// devDependencies, no hand-read process arguments, and every CLI's answer to an unknown option.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const tools = join(root, "tools");

// devDependencies entries whose range doesn't start with ^
const nonCaret = (pkg: { devDependencies?: Record<string, string> }): string[] =>
  Object.entries(pkg.devDependencies ?? {})
    .filter(([, range]) => !range.startsWith("^"))
    .map(([name, range]) => `${name}: ${range}`);

// Matches the global's property read, but not this file's own source
const ARGV = /\bprocess\s*\.\s*argv\b/;
const readsArgv = (source: string): boolean => ARGV.test(source);

// A CLI uses parseArgs (with the argv rule above, every CLI does), however it imports it
const isCli = (path: string, source: string): boolean => !path.endsWith(".test.ts") && /\bparseArgs\b/.test(source);

// What's wrong with a CLI's answer to --no-such-option; undefined when it exits 2 with Usage: on stderr
function unknownOptionProblem(cli: string): string | undefined {
  const result = spawnSync(process.execPath, [cli, "--no-such-option"], { encoding: "utf8", timeout: 30_000 });
  const problems = [];
  if (result.status !== 2) problems.push(`exits ${result.status ?? result.signal}, not 2`);
  if (!result.stderr.includes("Usage:")) problems.push("prints no Usage: line to stderr");
  return problems.length ? problems.join(", ") : undefined;
}

const tsFiles = (): string[] =>
  readdirSync(tools, { recursive: true, encoding: "utf8" })
    .filter((path) => path.endsWith(".ts") && !path.split("/").includes("node_modules"))
    .map((path) => `tools/${path}`)
    .sort();

const read = (path: string) => readFileSync(join(root, path), "utf8");

test("nonCaret finds a pinned or tilde range", () => {
  assert.deepEqual(nonCaret({ devDependencies: { a: "^1.0.0", b: "1.0.0", c: "~2.0.0" } }), ["b: 1.0.0", "c: ~2.0.0"]);
  assert.deepEqual(nonCaret({}), []);
});

test("every devDependency in package.json uses a ^ range", () => {
  const pkg = JSON.parse(read("package.json"));
  assert.deepEqual(nonCaret(pkg), [], "Use ^ ranges in package.json's devDependencies; package-lock.json pins (CODING_STANDARDS.md).");
});

test("readsArgv finds the global's argv read, however it's spaced", () => {
  const argv = ["process", "argv"].join(".");
  assert.ok(readsArgv(`const [a] = ${argv}.slice(2);`));
  assert.ok(readsArgv(`if (${["process ", "argv"].join(".")}[1]) {}`));
  assert.ok(!readsArgv("parseArgs({ options: {} });"));
});

test("no .ts file under tools/ reads process arguments by hand", () => {
  const offenders = tsFiles().filter((path) => readsArgv(read(path)));
  assert.deepEqual(offenders, [], "Read arguments with parseArgs from node:util (CODING_STANDARDS.md); use import.meta.main to tell a CLI run from an import.");
});

test("isCli takes non-test files that use parseArgs", () => {
  const source = 'import { parseArgs } from "node:util";';
  assert.ok(isCli("tools/a.ts", source));
  assert.ok(isCli("tools/a.ts", 'import * as util from "node:util";\nutil.parseArgs({});'));
  assert.ok(!isCli("tools/a.test.ts", source));
  assert.ok(!isCli("tools/a.ts", 'import { format } from "node:util";'));
});

test("unknownOptionProblem catches a CLI that lets parseArgs throw", () => {
  const dir = mkdtempSync(join(tmpdir(), "standards-"));
  const uncaught = join(dir, "uncaught.ts");
  writeFileSync(uncaught, 'import { parseArgs } from "node:util";\nparseArgs({ options: {} });\n');
  assert.equal(unknownOptionProblem(uncaught), "exits 1, not 2, prints no Usage: line to stderr");

  const caught = join(dir, "caught.ts");
  writeFileSync(
    caught,
    'import { parseArgs } from "node:util";\ntry { parseArgs({ options: {} }); } catch { console.error("Usage: x"); process.exit(2); }\n',
  );
  assert.equal(unknownOptionProblem(caught), undefined);
});

test("every CLI under tools/ exits 2 with a Usage: line on an unknown option", () => {
  const clis = tsFiles().filter((path) => isCli(path, read(path)));
  assert.ok(clis.length > 0, "found no CLIs");
  const problems = clis.flatMap((cli) => {
    const problem = unknownOptionProblem(join(root, cli));
    return problem ? [`${cli}: ${problem}`] : [];
  });
  assert.deepEqual(problems, [], "Catch the error parseArgs throws, print a usage line to stderr and exit 2, as tools/offline-check.ts does.");
});
