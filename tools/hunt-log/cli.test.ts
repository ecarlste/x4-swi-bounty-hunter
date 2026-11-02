import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { accept, huntKey, loss, session, ship, success } from "./fixtures.ts";

const cli = fileURLToPath(new URL("../hunt-log.ts", import.meta.url));

test("the CLI reads a debuglog.txt into a data folder and says what it added", () => {
  const dir = mkdtempSync(join(tmpdir(), "hunt-log-cli-"));
  const debugLog = join(dir, "debuglog.txt");
  const a = huntKey(1, "AAA-111", 100);
  writeFileSync(
    debugLog,
    [
      "[General] 0.00 ======================================",
      session(50),
      accept(a, 100),
      success(a, 200, { kill: 100000, destruction: 0 }),
      accept(huntKey(2, "BBB-222", 300), 300),
      loss(350, ship("PLR-001", "player"), 9000),
      session(50).slice(0, 40),
    ].join("\r\n"),
  );
  const data = join(dir, "data");

  const stdout = execFileSync(process.execPath, [cli, debugLog, "--data", data], { encoding: "utf8" });

  assert.equal(
    stdout,
    `Added 1 hunt to ${join(data, "hunts.csv")}; 1 open.
1 ship lost outside any hunt: PLR-001 at 350.
1 bad [swibh] line: line 7: not valid JSON (truncated?)
Summary: ${join(data, "hunts-summary.md")}
`,
  );
  assert.ok(existsSync(join(data, "hunts.csv")));
});
