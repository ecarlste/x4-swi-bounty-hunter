import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { readPlaytestLog } from "./logbook.ts";

const fixture = new URL("../fixtures/save_007-logbook.xml", import.meta.url);
const save007Lines = () => readFileSync(fixture, "utf8").split("\n");

test("a successful hunt in save_007 gives the AEL-112 row", async () => {
  const log = await readPlaytestLog(save007Lines(), { since: 19500 });

  assert.deepEqual(log.hunts, [
    {
      time: 19520.052,
      target: "NRL Patrol B-wing (AEL-112)",
      faction: "Imperial Ascendancy",
      ending: "success",
      paidCt: 22081000,
      killsCt: 12478500,
      destructionCt: 9602500,
      engagements: "1 x S ship (kills: 1)",
    },
  ]);
});

// Logbook lines as EM 0.90 writes a failed hunt ({11513,575} + {11513,496}) and
// vanilla's generic abort ({30001,10}), with a mission-failed reputation entry.
const logbook = (...entries: string[]) => ["</stats>", "<log>", ...entries, "</log>"];

test("hunts that failed or were aborted are rows that paid nothing", async () => {
  const log = await readPlaytestLog(
    logbook(
      '<entry time="100.5" title="Reputation lost: -3" text="Reason: Mission Failed[\\012]Current reputation: 2" faction="{999840,500110}"/>',
      '<entry time="100.5" category="missions" title="Search and destroy: NRL Patrol X-wing (ABC-123)" text="You failed to find NRL Patrol X-wing (ABC-123). Total reward: 0.00 Cr."/>',
      '<entry time="200" category="missions" title="Search and destroy: HTP Pirate Z-95 (DEF-456)" text="Mission aborted."/>',
    ),
  );

  assert.deepEqual(log.hunts, [
    {
      time: 100.5,
      target: "NRL Patrol X-wing (ABC-123)",
      faction: "Galactic Empire",
      ending: "failure",
      paidCt: 0,
      note: "You failed to find NRL Patrol X-wing (ABC-123).",
    },
    { time: 200, target: "HTP Pirate Z-95 (DEF-456)", ending: "abort", paidCt: 0, note: "Mission aborted." },
  ]);
});

test("other logbook entries with a reward are other income", async () => {
  const log = await readPlaytestLog(save007Lines(), { since: 4400 });

  assert.deepEqual(log.otherIncome, [
    { time: 4455.128, source: "Rewarded for station defence", faction: "Hutt Cartel", amountCt: 50000 },
    { time: 4493.932, source: "Mine Disposal Required", amountCt: 4039000 },
    { time: 15925.92, source: "Rescue civilians: BLS Pirate Scrapyard", amountCt: 52356272 },
  ]);
});

test("reputation entries are relation changes, with faction names", async () => {
  const log = await readPlaytestLog(save007Lines(), { since: 18700 });

  assert.deepEqual(log.relations, [
    { time: 18720.196, faction: "New Republic", amount: -2, reason: "Unauthorised Kill", current: -9 },
    { time: 19520.052, faction: "Imperial Ascendancy", amount: 5, reason: "Mission Completed", current: -1 },
  ]);
});

test("a reputation entry without an amount keeps the amount empty", async () => {
  const log = await readPlaytestLog(save007Lines(), { since: 4490 });

  assert.deepEqual(log.relations[0], {
    time: 4493.932,
    faction: "Hutt Cartel",
    amount: null,
    reason: "Mission Completed",
    current: 10,
  });
});

test("pacing counts every hunt that ended over the game time from first to last", async () => {
  const hunt = (time: number, text: string, money = "") =>
    `<entry time="${time}" category="missions" title="Search and destroy: Target ${time}" text="${text}"${money}/>`;
  const log = await readPlaytestLog(
    logbook(
      hunt(1000, "Total reward: 1,000.00 Cr.", ' money="100000"'),
      hunt(2800, "You failed to find Target 2800. Total reward: 0.00 Cr."),
      hunt(8200, "Total reward: 2,500.50 Cr.", ' money="250050"'),
    ),
  );

  assert.deepEqual(log.pacing, { huntsEnded: 3, spanSeconds: 7200, huntsPerHour: 1.5, totalPaidCt: 350050 });
});

test("pacing has no hunts-per-hour rate for a single hunt", async () => {
  const log = await readPlaytestLog(save007Lines(), { since: 19500 });

  assert.deepEqual(log.pacing, { huntsEnded: 1, spanSeconds: 0, huntsPerHour: null, totalPaidCt: 22081000 });
});

test("the offering faction is the mission's reputation entry, not a kill penalty in the same tick", async () => {
  const log = await readPlaytestLog(
    logbook(
      '<entry time="300" title="Reputation lost: -2" text="Reason: Unauthorised Kill[\\012]Current reputation: -9" faction="{999840,502110}"/>',
      '<entry time="300" title="Reputation gained: +5" text="Reason: Mission Completed[\\012]Current reputation: -1" faction="{999840,504110}"/>',
      '<entry time="300" category="missions" title="Search and destroy: T (AAA-111)" text="Total reward: 10.00 Cr." money="1000"/>',
    ),
  );

  assert.equal(log.hunts[0].faction, "Imperial Ascendancy");
});

test("a hunt with EM's failure text is a failure even if it paid something", async () => {
  const log = await readPlaytestLog(
    logbook(
      '<entry time="400" category="missions" title="Search and destroy: T (BBB-222)" text="T (BBB-222) is still operational. Total reward: 5.00 Cr." money="500"/>',
    ),
  );

  assert.equal(log.hunts[0].ending, "failure");
  assert.equal(log.hunts[0].note, "T (BBB-222) is still operational.");
});
