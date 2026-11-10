import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const cli = fileURLToPath(new URL("../trial-log.ts", import.meta.url));
const line = (t: number, text: string) => `[General] ${t} [swibh-trial] ${text}`;

test("the CLI prints one results-table row per fight, and bad lines on stderr", () => {
  const dir = mkdtempSync(join(tmpdir(), "trial-log-cli-"));
  const debugLog = join(dir, "debuglog.txt");
  writeFileSync(
    debugLog,
    [
      "[General] 0.00 ======================================",
      line(5, "session config=established t=5"),
      line(100, "fight.start fight=1 t=100 target=gs80_macro faction=hutt escorts=2 distance=15000 ship=BOB-001 shipmacro=hwk_290_01_macro"),
      line(100, "wingman fight=1 ship=HWK-001 macro=hwk_290_01_macro lead=BOB-001"),
      line(100, "wingman fight=1 ship=RRR-001 macro=r41_macro lead=HWK-001"),
      line(100, "wingman fight=1 ship=RRR-002 macro=r41_macro lead=HWK-001"),
      line(160, "wingman.lost fight=1 t=160 ship=RRR-002 macro=r41_macro"),
      line(342, "fight.end fight=1 t=342 result=killed"),
      line(400, "fight.start fight=2 t=400 target=cr90_macro faction=pirates escorts=0 distance=15000 ship=BOB-001 shipmacro=hwk_290_01_macro"),
      line(475, "fight.end fight=2 t=475 result=ship_lost"),
      line(480, "fight.end fight=9 t=480 result=killed"),
    ].join("\r\n"),
  );

  const run = spawnSync(process.execPath, [cli, debugLog], { encoding: "utf8" });

  assert.equal(run.status, 0);
  assert.equal(
    run.stdout,
    `| Session | Fight | Config | Target | Spawned | Result | Win | Wingmen lost | Time to kill | Wing |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | established | gs80_macro (hutt) + 2 escorts | 1:40 | killed | yes | 1 of 3: 1 r41_macro | 4:02 | Bobby (hwk_290_01_macro): 1 hwk_290_01_macro; HWK-001 (hwk_290_01_macro): 2 r41_macro |
| 1 | 2 | established | cr90_macro (pirates) | 6:40 | ship_lost | no | 0 of 0 | - | - |
`,
  );
  assert.equal(run.stderr, "1 bad [swibh-trial] line: line 11: fight 9: no fight.start in this session\n");
});
