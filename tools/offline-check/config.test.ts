import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
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
