import { test } from "node:test";
import assert from "node:assert/strict";
import { readLog } from "./parse.ts";

const huntKey = "kEM_Hunt_133-AEL-112-19000.5";
const aelShip = '{"class":"ship_s","idcode":"AEL-112","macro":"ship_nrl_bwing_macro","name":"NRL Patrol B-wing","owner":"newrepublic"}';
const kill = `[swibh] {"v":1,"type":"hunt.kill","t":19480.25,"hunt":"${huntKey}","data":{"byPlayer":true,"role":"target","victim":${aelShip}}}`;

test("a hunt.kill line found after X4's own prefix is a typed event", async () => {
  const log = await readLog([`[General] 19480.25 ${kill}`]);

  assert.deepEqual(log.errors, []);
  assert.deepEqual(log.events, [
    {
      v: 1,
      type: "hunt.kill",
      t: 19480.25,
      hunt: huntKey,
      data: {
        byPlayer: true,
        role: "target",
        victim: {
          class: "ship_s",
          idcode: "AEL-112",
          macro: "ship_nrl_bwing_macro",
          name: "NRL Patrol B-wing",
          owner: "newrepublic",
        },
      },
    },
  ]);
});

const ship = (idcode: string) =>
  `{"class":"ship_m","idcode":"${idcode}","macro":"ship_imp_tie_macro","name":"Patrol","owner":"galempire"}`;
const session = (t: number) =>
  `[swibh] {"v":1,"type":"session.start","t":${t},"data":{"gameVersion":"800","saveMarker":"s1","swiVersion":null}}`;
const accept = (hunt: string, t: number) =>
  `[swibh] {"v":1,"type":"hunt.accept","t":${t},"hunt":"${hunt}","data":{"difficulty":"medium",` +
  `"faction":{"id":"imperialascendancy","name":"Imperial Ascendancy"},"missionId":"${hunt.split("-")[0]}",` +
  `"offered":{"kill":5000000,"upTo":12000000},"sanction":"none","sizeClass":"m","target":${ship("BCD-234")},` +
  `"wharf":{"idcode":"WHF-001","macro":"station_wharf_macro","name":"Wharf","owner":"imperialascendancy"},"wing":[${ship("CDE-345")}]}}`;
const end = (hunt: string, t: number) =>
  `[swibh] {"v":1,"type":"hunt.end","t":${t},"hunt":"${hunt}","data":{"engagements":null,"failedStep":null,` +
  `"payout":{"capAfter":9000000,"capBefore":9000000,"destruction":4000000,"kill":5000000,"total":9000000},` +
  `"relations":[{"amount":5,"faction":{"id":"imperialascendancy","name":"Imperial Ascendancy"},"reason":"missioncompleted"}],` +
  `"repairs":[{"repairprice":150000,"ship":${ship("PLR-001")}}],"result":"success","targetKills":null}}`;

test("a reload drops replayed lines but keeps each session.start", async () => {
  const done = "kEM_Hunt_1-BCD-234-100";
  const log = await readLog([
    session(50),
    accept(done, 100),
    end(done, 400),
    // Loaded the same save again: X4 writes the same lines a second time
    session(50),
    accept(done, 100),
    end(done, 400),
  ]);

  assert.deepEqual(log.errors, []);
  assert.deepEqual(
    log.events.map((event) => [event.type, event.t]),
    [["session.start", 50], ["hunt.accept", 100], ["hunt.end", 400], ["session.start", 50]],
  );
  assert.deepEqual([...log.hunts.keys()], [done]);
  assert.deepEqual(log.hunts.get(done)?.map((event) => event.type), ["hunt.accept", "hunt.end"]);
});

test("a hunt accepted and never ended is an open hunt", async () => {
  const done = "kEM_Hunt_1-BCD-234-100";
  const open = "kEM_Hunt_2-BCD-234-500";
  const log = await readLog([accept(done, 100), end(done, 400), accept(open, 500)]);

  assert.deepEqual(log.openHunts, [open]);
});

test("bad and truncated lines are reported by line number and skipped", async () => {
  const log = await readLog([
    "[Scripts] 1.00 *** Context:md.SWIBH_Tests.Run: [swibh-test] RUN START 2 tests",
    kill.slice(0, 80),
    kill.replace('"role":"target"', '"role":"bystander"'),
    kill.replace('"byPlayer":true,', ""),
    kill.replace('"v":1', '"v":2'),
    kill.replace("hunt.kill", "hunt.wave"),
    kill,
  ]);

  assert.equal(log.events.length, 1);
  assert.deepEqual(
    log.errors.map(({ line, error }) => [line, error]),
    [
      [2, "not valid JSON (truncated?)"],
      [3, "hunt.kill.data.role: expected one of target, escort"],
      [4, "hunt.kill.data.byPlayer: missing"],
      [5, "unknown version v=2"],
      [6, 'unknown event type "hunt.wave"'],
    ],
  );
});
