import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const cli = fileURLToPath(new URL("./generate.ts", import.meta.url));
const run = (...args: string[]) => spawnSync(process.execPath, [cli, ...args], { encoding: "utf8" });

test("--check passes on the XML the generator wrote and fails once it's edited", () => {
  const out = join(mkdtempSync(join(tmpdir(), "swibh-log-")), "swibh_log.xml");

  assert.equal(run("--out", out).status, 0);
  const written = readFileSync(out, "utf8");
  assert.match(written, /<mdscript name="SWIBH_Log"/);
  assert.equal(run("--check", "--out", out).status, 0);

  writeFileSync(out, written.replace("Log_HuntKill", "Log_HuntKilled"));
  const stale = run("--check", "--out", out);
  assert.equal(stale.status, 1);
  assert.match(stale.stderr, /out of date/);
});

test("--check fails when the XML is missing", () => {
  const out = join(mkdtempSync(join(tmpdir(), "swibh-log-")), "swibh_log.xml");

  assert.equal(run("--check", "--out", out).status, 1);
});

test("the committed swibh_log.xml matches the schema", () => {
  const result = run("--check");

  assert.equal(result.status, 0, result.stderr);
});
