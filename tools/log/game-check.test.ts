import { test } from "node:test";
import assert from "node:assert/strict";
import { checkEngagementTest, TEST_HUNT } from "./game-check.ts";

const HUNT = TEST_HUNT;
const ref = (idcode: string, owner: string) =>
  `{"idcode":"${idcode}","macro":"tie_fighter_macro","name":"TIE","owner":"${owner}"}`;
const player = `{"class":"ship_s","idcode":"PLR-001","macro":"fortitude_macro","name":"Fortitude","owner":"player"}`;
const stats = (idcode: string, isPlayer: boolean, hitsTaken: number, hitsDealt: number) =>
  `{"class":"ship_s","damageDealt":${hitsDealt * 150},"damageTaken":${hitsTaken * 150},"destroyed":false,"hitsDealt":${hitsDealt},"hitsTaken":${hitsTaken},"idcode":"${idcode}",` +
  `"kills":0,"macro":"t65b_xwing_macro","name":"Wing","player":${isPlayer},"sectors":["sws_clustercoruscant_sector001_macro"]}`;
const huntPart = (hunt?: string) => (hunt ? `"hunt":"${hunt}",` : "");
const start = (t: number, hunt?: string) =>
  `[General] ${t} [swibh] {"v":1,"type":"engagement.start","t":${t},${huntPart(hunt)}"data":{` +
  `"attacked":${ref("PLR-001", "player")},"attacker":${ref("TIE-001", "galempire")},"firstHit":"taken","ship":${player},"wingmen":1}}`;
const end = (begun: number, t: number, { hunt, reason = "quiet", ships }: { hunt?: string; reason?: string; ships?: string[] } = {}) =>
  `[General] ${t} [swibh] {"v":1,"type":"engagement.end","t":${t},${huntPart(hunt)}"data":{"lastHit":${t - 10},` +
  `"opponents":[],"opponentsSeen":1,"reason":"${reason}",` +
  `"ships":[${(ships ?? [stats("PLR-001", true, 8, 0), stats("XWG-002", false, 1, 30)]).join(",")}],"start":${begun}}}`;

const check = checkEngagementTest;

test("a hunt engagement then a plain one, both with hits for the player and the wingman, pass", async () => {
  assert.deepEqual(await check([start(100, HUNT), end(100, 140, { hunt: HUNT }), start(150), end(150, 190)]), []);
});

test("the hunt key on the wrong engagement fails", async () => {
  assert.deepEqual(await check([start(100), end(100, 140), start(150, HUNT), end(150, 190, { hunt: HUNT })]), [
    `engagement 1: hunt key none, expected ${HUNT}`,
    `engagement 2: hunt key ${HUNT}, expected none`,
  ]);
});

test("an engagement without the wingman's hits, or not ended by the quiet gap, fails", async () => {
  assert.deepEqual(
    await check([
      start(100, HUNT),
      end(100, 140, { hunt: HUNT, reason: "shipLost", ships: [stats("PLR-001", true, 8, 0)] }),
      start(150),
      end(150, 190),
    ]),
    ["engagement 1: reason shipLost, expected quiet", "engagement 1: no wingman dealt a hit"],
  );
});

test("an engagement.start without its end, or a bad engagement line, fails", async () => {
  assert.deepEqual(await check([start(100, HUNT), end(100, 140, { hunt: HUNT }), start(150), "[swibh] {\"v\":1,\"type\":\"engagement.end\""]), [
    "line 4: not valid JSON (truncated?)",
    "expected 2 engagements (start and end), found 1 paired and 1 unpaired",
  ]);
});

test("engagements that started before the engagement test began, such as combat_signals', are skipped", async () => {
  const begins = "[General] 145 *** Context:md.SWIBH_Tests.Engagement: [swibh-test] INFO engagement: begins at t 145";
  assert.deepEqual(await check([start(40), begins, end(40, 160), start(170, HUNT), end(170, 200, { hunt: HUNT }), start(210), end(210, 240)]), []);
});
