import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const cli = fileURLToPath(new URL("../playtest-log.ts", import.meta.url));
const fixture = new URL("../fixtures/save_007-logbook.xml", import.meta.url);

test("the CLI prints save_007's AEL-112 hunt as markdown from a gzipped save", () => {
  const save = join(mkdtempSync(join(tmpdir(), "playtest-log-")), "save_007.xml.gz");
  writeFileSync(save, gzipSync(readFileSync(fixture)));

  const stdout = execFileSync(process.execPath, [cli, save, "--since", "19500"], { encoding: "utf8" });

  assert.equal(
    stdout,
    `## Hunt log

Logbook entries after game time 19,500.

| Ended (game time) | Target | Offering faction | Ending | Paid | Kills part | Destruction part | Engagements |
| - | - | - | - | - | - | - | - |
| 19,520.052 | NRL Patrol B-wing (AEL-112) | Imperial Ascendancy | success | 220,810.00 Cr | 124,785.00 Cr | 96,025.00 Cr | 1 x S ship (kills: 1) |

## Other income

None.

## Relation changes

| When (game time) | Faction | Change | Reason | Now |
| - | - | - | - | - |
| 19,520.052 | Imperial Ascendancy | +5 | Mission Completed | -1 |

## Pacing

- Hunts ended: 1
- Game time from the first to the last: 0:00:00
- Hunts per game hour: n/a (needs two hunts)
- Total paid: 220,810.00 Cr
`,
  );
});
