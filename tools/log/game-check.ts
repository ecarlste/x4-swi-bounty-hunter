// Checks a game test's debuglog.txt with the log parser, as an extractor would read it: the
// engagement game test (#23, the Engagement cue in tests/game/swibh_tests/md/swibh_tests.xml)
// fights a hunt's target, then a ship in no hunt, with the player's ship and one wingman. The
// CLI also runs the hunt_log test's check (#19, game-check-hunt.ts).
// Usage: node tools/log/game-check.ts <debuglog.txt>; prints each problem and exits 1 if any.
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { checkHuntLogTest } from "./game-check-hunt.ts";
import { readLog } from "./parse.ts";
import type { LogEventOf } from "./schema.ts";

// The hunt key the game test registers for its first fight's target
export const TEST_HUNT = "swibh-test-hunt";
// What each fight's engagement should carry, in order
const EXPECTED: (string | undefined)[] = [TEST_HUNT, undefined];
// The Engagement cue's first line; engagements that started before it (combat_signals') are skipped
const BEGINS = /\[swibh-test\] INFO engagement: begins at t ([\d.]+)/;

// The problems with the engagement game test's log events in a debuglog's lines; empty when it passed
export async function checkEngagementTest(lines: string[]): Promise<string[]> {
  const log = await readLog(lines);
  const problems = log.errors.map(({ line, error }) => `line ${line}: ${error}`);
  const begins = lines.map((line) => BEGINS.exec(line)).find((match) => match);
  const since = begins ? Number(begins[1]) : 0;
  const ended: LogEventOf<"engagement.end">[] = [];
  let open: LogEventOf<"engagement.start"> | null = null;
  // A start with no end after it, or an end whose start t isn't the open start's
  let unpaired = 0;
  for (const event of log.events) {
    if (event.type === "engagement.start") {
      if (event.t < since) continue;
      if (open) unpaired++;
      open = event;
    } else if (event.type === "engagement.end") {
      if (event.data.start < since) continue;
      if (open && event.data.start === open.t) ended.push(event);
      else unpaired++;
      open = null;
    }
  }
  if (open) unpaired++;
  if (ended.length !== EXPECTED.length || unpaired) {
    problems.push(
      `expected ${EXPECTED.length} engagements (start and end), found ${ended.length} paired and ${unpaired} unpaired`,
    );
  }
  ended.slice(0, EXPECTED.length).forEach((end, i) => {
    const label = `engagement ${i + 1}`;
    if (end.hunt !== EXPECTED[i]) problems.push(`${label}: hunt key ${end.hunt ?? "none"}, expected ${EXPECTED[i] ?? "none"}`);
    if (end.data.reason !== "quiet") problems.push(`${label}: reason ${end.data.reason}, expected quiet`);
    const ships = end.data.ships;
    if (!ships.some((ship) => ship.player && ship.hitsTaken > 0)) problems.push(`${label}: the player's ship took no hit`);
    if (!ships.some((ship) => !ship.player && ship.hitsDealt > 0)) problems.push(`${label}: no wingman dealt a hit`);
  });
  return problems;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const path = process.argv[2];
  if (!path) {
    console.error("usage: node tools/log/game-check.ts <debuglog.txt>");
    process.exit(2);
  }
  const lines = (await readFile(path, "utf8")).split(/\r?\n/);
  const engagement = await checkEngagementTest(lines);
  for (const problem of engagement) console.log(`  FAIL engagement log: ${problem}`);
  if (!engagement.length) console.log("  PASS engagement log: the parser read both engagements, with the hunt key only on the hunt target's");
  const hunts = checkHuntLogTest(await readLog(lines));
  for (const problem of hunts) console.log(`  FAIL hunt_log log: ${problem}`);
  if (!hunts.length) console.log("  PASS hunt_log log: every event type, with the values the test set up and one hunt.end per hunt");
  if (engagement.length || hunts.length) process.exit(1);
}
