import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readdirSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { updateHuntLog } from "./update.ts";
import { accept, failure, huntKey, loss, session, ship, success } from "./fixtures.ts";

const dataDir = () => mkdtempSync(join(tmpdir(), "hunt-log-"));
const read = (dir: string) => Object.fromEntries(readdirSync(dir).map((file) => [file, readFileSync(join(dir, file), "utf8")]));

const a = huntKey(1, "AAA-111", 100);
const b = huntKey(2, "BBB-222", 200);
const c = huntKey(3, "CCC-333", 300);
const myShip = (idcode: string) => ship(idcode, "player", "ship_m");

const log = [
  session(50),
  accept(a, 100),
  success(a, 1900, { kill: 30000000, destruction: 6000000 }),
  accept(b, 200),
  loss(250, myShip("PLR-001"), 5000000, [{ hunt: b, byHuntWing: true, sameSector: true }]),
  failure(b, 400, "destroy", { repairs: [{ ship: myShip("PLR-002"), repairprice: 250000 }] }),
  accept(c, 3000),
  loss(3100, myShip("PLR-003"), 70000, [{ hunt: c, byHuntWing: true, sameSector: true }]),
];

test("the first run writes the hunts, the open hunt and the summary", async () => {
  const dir = dataDir();
  const result = await updateHuntLog(log, dir);

  assert.deepEqual([result.added, result.open], [2, 1]);
  const files = read(dir);
  assert.deepEqual(Object.keys(files).sort(), ["hunts-open.jsonl", "hunts-summary.md", "hunts.csv"]);
  assert.deepEqual(
    files["hunts.csv"].split("\n").map((line) => line.split(",").slice(0, 3).join(",")),
    ["huntKey,acceptT,endT", `${a},100,1900`, `${b},200,400`, ""],
  );
  assert.equal(
    files["hunts-summary.md"],
    `# Hunt log summary

Built by \`make hunt-log\` from \`data/hunts.csv\`: 2 hunts.

## Hunts by result

| Result | Hunts | Paid |
| - | - | - |
| success | 1 | 360,000.00 Cr |
| failed | 1 | 0.00 Cr |

## Money

- Total paid: 360,000.00 Cr
- Ships lost: 1, worth 50,000.00 Cr
- Repairs: 2,500.00 Cr
- Net: 307,500.00 Cr
- Paid per game hour: 720,000.00 Cr (game time from the first accept to the last end: 0:30:00)

## Hunts with a net loss

| Hunt key | Target | Offering faction | Result | Paid | Losses | Repairs | Net |
| - | - | - | - | - | - | - | - |
| ${b} | BBB-222 | imperialascendancy | failed | 0.00 Cr | 50,000.00 Cr | 2,500.00 Cr | -52,500.00 Cr |

## Open hunts

Accepted and not ended yet, so not in the stats above.

| Hunt key | Accepted (game time) | Target | Offering faction | Losses so far |
| - | - | - | - | - |
| ${c} | 3,000 | CCC-333 | imperialascendancy | 700.00 Cr |
`,
  );
});

test("rerunning on the same log adds nothing", async () => {
  const dir = dataDir();
  await updateHuntLog(log, dir);
  const before = read(dir);

  const result = await updateHuntLog(log, dir);

  assert.equal(result.added, 0);
  assert.deepEqual(read(dir), before);
});

test("an open hunt ends in the next session's log and joins hunts.csv with its accept", async () => {
  const dir = dataDir();
  await updateHuntLog(log, dir);

  // X4 relaunched: debuglog.txt starts over
  const result = await updateHuntLog([session(3050), success(c, 3600, { kill: 100000, destruction: 0 })], dir);

  assert.deepEqual([result.added, result.open], [1, 0]);
  const files = read(dir);
  assert.equal(files["hunts-open.jsonl"], "");
  const rows = files["hunts.csv"].trim().split("\n");
  assert.deepEqual(rows.at(-1)?.split(",").slice(0, 4), [c, "3000", "3600", "600"]);
  assert.match(files["hunts-summary.md"], /from `data\/hunts.csv`: 3 hunts/);
});
