// Checks a game test's debuglog.txt with the log parser, as an extractor would read it: the
// engagement game test (#23, the Engagement cue in tests/game/swibh_tests/md/swibh_tests.xml)
// fights a hunt's target, then a ship in no hunt, with the player's ship and one wingman.
// Usage: node tools/log/game-check.ts <debuglog.txt>; prints each problem and exits 1 if any.
import { createReadStream } from "node:fs";
import { createInterface } from "node:readline";
import { fileURLToPath } from "node:url";
import { readLog, type Log } from "./parse.ts";
import type { LogEventOf } from "./schema.ts";

// The hunt key the game test registers for its first fight's target
export const TEST_HUNT = "swibh-test-hunt";
// What each fight's engagement should carry, in order
const EXPECTED: (string | undefined)[] = [TEST_HUNT, undefined];

// The problems with the engagement game test's log events; empty when it passed
export function checkEngagementTest(log: Log): string[] {
  const problems = log.errors.map(({ line, error }) => `line ${line}: ${error}`);
  const ended: LogEventOf<"engagement.end">[] = [];
  let open: LogEventOf<"engagement.start"> | null = null;
  // A start with no end after it, or an end whose start t isn't the open start's
  let unpaired = 0;
  for (const event of log.events) {
    if (event.type === "engagement.start") {
      if (open) unpaired++;
      open = event;
    } else if (event.type === "engagement.end") {
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
  const lines = createInterface({ input: createReadStream(path), crlfDelay: Infinity });
  const problems = checkEngagementTest(await readLog(lines));
  for (const problem of problems) console.log(`  FAIL engagement log: ${problem}`);
  if (problems.length) process.exit(1);
  console.log("  PASS engagement log: the parser read both engagements, with the hunt key only on the hunt target's");
}
