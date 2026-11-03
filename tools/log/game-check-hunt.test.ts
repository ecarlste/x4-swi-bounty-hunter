import { test } from "node:test";
import assert from "node:assert/strict";
import { checkHuntLogTest } from "./game-check-hunt.ts";
import { readLog } from "./parse.ts";

// The [swibh] lines a correct hunt_log run writes (tests/game/swibh_tests/md/swibh_tests.xml)
const ship = (idcode: string, owner = "galempire") =>
  ({ class: "ship_m", idcode, macro: "fortitude_macro", name: "Fortitude", owner }) as const;
const wharf = { idcode: "WHF-001", macro: "mc40a_macro", name: "MC40A", owner: "newrepublic" };
const newRepublic = { id: "newrepublic", name: "New Republic" };
const key = (n: string, idcode: string) => `kEM_Hunt_900${n}-${idcode}-40.5`;
const [A, B, C] = [key("1", "AAA-001"), key("2", "BBB-002"), key("3", "CCC-003")];

const line = (type: string, t: number, data: object, hunt?: string) =>
  `[General] ${t} [swibh] ` + JSON.stringify({ v: 1, type, t, ...(hunt ? { hunt } : {}), data });

const accept = (hunt: string, target: string, wing: object[]) =>
  line(
    "hunt.accept",
    40.5,
    {
      difficulty: "medium",
      faction: newRepublic,
      missionId: hunt.split("-")[0],
      offered: { kill: 1000000, upTo: 5000000 },
      sanction: "none",
      sizeClass: "m",
      target: ship(target),
      wharf,
      wing,
    },
    hunt,
  );

const end = (hunt: string, data: object) =>
  line(
    "hunt.end",
    44.5,
    { engagements: null, failedStep: null, payout: null, relations: [], repairs: [], targetKills: null, ...data },
    hunt,
  );

const goodLog = () => [
  line("session.start", 0.5, { gameVersion: "800", saveMarker: "s20261102120000", swiVersion: null }),
  accept(A, "AAA-001", [ship("ESC-001")]),
  accept(B, "BBB-002", []),
  accept(C, "CCC-003", []),
  line("hunt.sanction", 40.5, { cost: 3970000, tier: "partial" }, A),
  line("player.loss", 41.5, {
    activeHunts: [A, B, C].map((hunt) => ({ byHuntWing: false, hunt, sameSector: true })),
    killer: null,
    lost: ship("LOS-001", "player"),
    piloted: false,
    value: 123456,
  }),
  line("hunt.kill", 41.5, { byPlayer: false, role: "escort", victim: ship("ESC-001") }, A),
  line("hunt.kill", 42.5, { byPlayer: false, role: "target", victim: ship("AAA-001") }, A),
  end(A, {
    engagements: [{ class: "ship_m", damage: 80, idcode: "AAA-001", killed: true, owner: "galempire" }],
    payout: { capAfter: 2000000, capBefore: 4000000, destruction: 1500000, kill: 500000, total: 2000000 },
    relations: [{ amount: 0.01, faction: newRepublic, reason: "missioncompleted" }],
    repairs: [{ repairprice: 0, ship: ship("PLY-001", "player") }],
    result: "success",
  }),
  end(B, { result: "aborted" }),
  end(C, { failedStep: "find", result: "failed" }),
];

test("a correct hunt_log run has no problems", async () => {
  assert.deepEqual(checkHuntLogTest(await readLog(goodLog())), []);
});

test("a value the test didn't set up is reported with where it is", async () => {
  const lines = goodLog().map((l) =>
    l.includes("hunt.end") && l.includes(A) ? l.replace('"capBefore":4000000', '"capBefore":2000000') : l,
  );

  assert.deepEqual(checkHuntLogTest(await readLog(lines)), [
    "kEM_Hunt_9001 hunt.end: data.payout.capBefore is 2000000, expected 4000000",
  ]);
});

test("a player.loss from an earlier test, before the hunts, isn't counted", async () => {
  const earlier = line("player.loss", 30.5, {
    activeHunts: [],
    killer: null,
    lost: { ...ship("XWG-001", "player"), macro: "t65b_xwing_macro", class: "ship_s" },
    piloted: false,
    value: 92028100,
  });
  const lines = goodLog();
  lines.splice(1, 0, earlier);

  assert.deepEqual(checkHuntLogTest(await readLog(lines)), []);
});

test("every hunt needs exactly one hunt.end", async () => {
  const lines = goodLog().filter((l) => !(l.includes("hunt.end") && l.includes(C)));
  // Not a replay: a later t
  lines.push(line("hunt.end", 45.5, JSON.parse(end(B, { result: "aborted" }).split("[swibh] ")[1]).data, B));

  assert.deepEqual(checkHuntLogTest(await readLog(lines)), [
    `${B}: 2 hunt.end, expected 1`,
    `${C}: 0 hunt.end, expected 1`,
  ]);
});
