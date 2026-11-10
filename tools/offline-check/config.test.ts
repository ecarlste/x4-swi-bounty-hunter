import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { configValue } from "./config.ts";

const dir = mkdtempSync(join(tmpdir(), "offline-check-config-"));
writeFileSync(
  join(dir, "test.config"),
  ['# X4_PATH="not this"', 'X4_PATH="E:\\Games\\X4"', "  SWI_UNPACKED = '/plain/path'  ", 'SWI_UNPACKED="/last/wins"', ""].join("\r\n"),
);

test("reads test.config, quotes stripped, a Windows path made a WSL one, the last line winning", () => {
  assert.equal(configValue("X4_PATH", dir, {}), process.platform === "linux" ? "/mnt/e/Games/X4" : "E:\\Games\\X4");
  assert.equal(configValue("SWI_UNPACKED", dir, {}), "/last/wins");
  assert.equal(configValue("X4_UNPACKED", dir, {}), "");
});

test("the environment comes first", () => {
  assert.equal(configValue("X4_PATH", dir, { X4_PATH: "/from/env" }), "/from/env");
});

test("the CLI's --get prints a value and exits 1 when it's unset", () => {
  const cli = fileURLToPath(new URL("../offline-check.ts", import.meta.url));
  const set = spawnSync(process.execPath, [cli, "--get", "SWIBH_TEST_VALUE"], {
    encoding: "utf8",
    env: { ...process.env, SWIBH_TEST_VALUE: "/some/path" },
  });
  assert.deepEqual([set.status, set.stdout], [0, "/some/path\n"]);
  const unset = spawnSync(process.execPath, [cli, "--get", "SWIBH_NO_SUCH_KEY"], { encoding: "utf8" });
  assert.deepEqual([unset.status, unset.stdout], [1, "\n"]);
});

test("the CLI turns away an unknown flag with its usage, without running the checks", () => {
  const cli = fileURLToPath(new URL("../offline-check.ts", import.meta.url));
  const run = spawnSync(process.execPath, [cli, "--nope"], { encoding: "utf8" });
  assert.equal(run.status, 2);
  assert.equal(run.stdout, "");
  assert.match(run.stderr, /Usage: node tools\/offline-check\.ts/);
});
