import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { generateLibrary } from "./md.ts";

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

// The text of one generated library, from its <library> line to its </library>
const libraryXml = (xml: string, name: string) => {
  const start = xml.indexOf(`<library name="${name}"`);
  return xml.slice(start, xml.indexOf("</library>", start));
};

test("an engagement's hunt param defaults to null and is written only when set", () => {
  const start = libraryXml(generateLibrary(), "Log_EngagementStart");

  assert.match(start, /<param name="hunt" default="null"\/>/);
  assert.match(start, /<do_if value="\$hunt != null">\s*<set_value name="\$Line" exact="\$Line \+ ',&quot;hunt&quot;:' \+ '&quot;%s&quot;'\.\[\$hunt\]"\/>\s*<\/do_if>/);
});

test("a hunt event's hunt param is required and always written", () => {
  const kill = libraryXml(generateLibrary(), "Log_HuntKill");

  assert.match(kill, /<param name="hunt"\/>/);
  assert.doesNotMatch(kill, /\$hunt != null/);
});

test("the committed swibh_log.xml matches the schema", () => {
  const result = run("--check");

  assert.equal(result.status, 0, result.stderr);
});
