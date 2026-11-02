import { test } from "node:test";
import assert from "node:assert/strict";
import { readHunts } from "./hunts.ts";
import { accept, failure, huntKey, kill, loss, myShip, sanction, session, ship, success } from "./fixtures.ts";

const ael = huntKey(133, "AEL-112", 19000.5);

test("a hunt accepted and ended is one row with its pay, sanction, wing and relations", async () => {
  const escort = ship("ESC-001");
  const { rows, open } = await readHunts([
    session(18000),
    accept(ael, 19000.5, { wing: [ship("AEL-112"), escort] }),
    sanction(ael, 19100, "partial", 3970000),
    kill(ael, 19480, escort, "escort"),
    kill(ael, 19500, ship("AEL-112"), "target"),
    success(ael, 19520.25, { kill: 12478500, destruction: 9602500 }, {
      relations: [
        { faction: { id: "imperialascendancy", name: "Imperial Ascendancy" }, amount: 5, reason: "missioncompleted" },
        { faction: { id: "newrepublic", name: "New Republic" }, amount: -2, reason: "targetattacked" },
      ],
      repairs: [{ ship: ship("PLR-001", "player"), repairprice: 150000 }],
    }),
  ]);

  assert.deepEqual(open, []);
  assert.deepEqual(rows, [
    {
      huntKey: ael,
      acceptT: 19000.5,
      endT: 19520.25,
      durationS: 519.75,
      faction: "imperialascendancy",
      wharf: "WHF-001",
      target: "AEL-112",
      targetMacro: "ship_nrl_bwing_macro",
      sizeClass: "s",
      sanction: "partial",
      sanctionCostCt: 3970000,
      offeredKillCt: 12478500,
      offeredUpToCt: 9602500,
      paidKillCt: 12478500,
      paidDestructionCt: 9602500,
      paidTotalCt: 22081000,
      capBeforeCt: 22081000,
      capAfterCt: 22081000,
      result: "success",
      failedStep: null,
      wingSize: 2,
      escortsKilled: 1,
      relations: "imperialascendancy +5 missioncompleted; newrepublic -2 targetattacked",
      losses: 0,
      lossValueCt: 0,
      repairsCt: 150000,
      netCt: 22081000 - 150000,
    },
  ]);
});

const a = huntKey(1, "AAA-111", 100);
const b = huntKey(2, "BBB-222", 200);

test("a loss during two active hunts counts against the hunt whose wing made the kill, else the one in its sector", async () => {
  const { rows, lossesOutside } = await readHunts([
    session(50),
    accept(a, 100),
    accept(b, 200),
    // B's wing killed it, though A's target is in the same sector
    loss(300, myShip("PLR-001"), 500000, [
      { hunt: a, byHuntWing: false, sameSector: true },
      { hunt: b, byHuntWing: true, sameSector: false },
    ]),
    // Nobody's wing: the hunt in the same sector
    loss(310, myShip("PLR-002"), 70000, [
      { hunt: a, byHuntWing: false, sameSector: true },
      { hunt: b, byHuntWing: false, sameSector: false },
    ]),
    // Neither: outside any hunt
    loss(320, myShip("PLR-003"), 9000, [
      { hunt: a, byHuntWing: false, sameSector: false },
      { hunt: b, byHuntWing: false, sameSector: false },
    ]),
    success(a, 400, { kill: 1000000, destruction: 0 }),
    success(b, 500, { kill: 200000, destruction: 100000 }),
  ]);

  assert.deepEqual(
    rows.map((row) => [row.huntKey, row.losses, row.lossValueCt, row.netCt]),
    [
      [a, 1, 70000, 1000000 - 70000],
      [b, 1, 500000, 300000 - 500000],
    ],
  );
  assert.deepEqual(lossesOutside.map((event) => event.data.lost.idcode), ["PLR-003"]);
});

test("a failed hunt pays nothing, so its losses and repairs make a net loss", async () => {
  const { rows } = await readHunts([
    accept(a, 100),
    loss(150, myShip("PLR-001"), 400000, [{ hunt: a, byHuntWing: true, sameSector: true }]),
    failure(a, 200, "destroy", { repairs: [{ ship: myShip("PLR-002"), repairprice: 25000 }] }),
  ]);

  assert.deepEqual(
    rows.map((row) => [row.result, row.failedStep, row.paidTotalCt, row.losses, row.repairsCt, row.netCt]),
    [["failed", "destroy", null, 1, 25000, -425000]],
  );
});

test("a reload that writes the same lines again counts the hunt, its kills and its losses once", async () => {
  const played = [
    accept(a, 100, { wing: [ship("AAA-111"), ship("ESC-001")] }),
    kill(a, 150, ship("ESC-001"), "escort"),
    loss(160, myShip("PLR-001"), 500000, [{ hunt: a, byHuntWing: true, sameSector: true }]),
    success(a, 200, { kill: 1000000, destruction: 0 }),
  ];
  const { rows } = await readHunts([session(50), ...played, session(50), ...played]);

  assert.deepEqual(
    rows.map((row) => [row.huntKey, row.escortsKilled, row.losses, row.netCt]),
    [[a, 1, 1, 500000]],
  );
});

test("loading an older save undoes what the log shows after that save's game time", async () => {
  const { rows, open, lossesOutside } = await readHunts([
    session(50),
    accept(a, 100),
    accept(b, 200),
    loss(250, myShip("PLR-001"), 500000, [{ hunt: a, byHuntWing: true, sameSector: true }]),
    loss(260, myShip("PLR-002"), 9000),
    success(a, 300, { kill: 1000000, destruction: 0 }),
    // Loaded the save made at 150: B's accept, both losses and A's ending never happened
    session(150),
    success(a, 320, { kill: 900000, destruction: 0 }),
    // Another save's load doesn't undo this one's events
    session(10, "other"),
  ]);

  assert.deepEqual(
    rows.map((row) => [row.huntKey, row.endT, row.paidTotalCt, row.losses]),
    [[a, 320, 900000, 0]],
  );
  assert.deepEqual(open, []);
  assert.deepEqual(lossesOutside, []);
});

test("a hunt accepted and not ended is open, with its losses so far, and makes no row", async () => {
  const { rows, open } = await readHunts([
    session(50),
    accept(b, 200),
    loss(250, myShip("PLR-001"), 500000, [{ hunt: b, byHuntWing: true, sameSector: true }]),
  ]);

  assert.deepEqual(rows, []);
  assert.deepEqual(
    open.map((hunt) => [hunt.huntKey, hunt.acceptT, hunt.faction, hunt.target, hunt.losses, hunt.lossValueCt]),
    [[b, 200, "imperialascendancy", "BBB-222", 1, 500000]],
  );
});

test("an open hunt carried over ends in the next log with the losses of both", async () => {
  const first = await readHunts([
    session(50),
    accept(b, 200),
    loss(250, myShip("PLR-001"), 500000, [{ hunt: b, byHuntWing: true, sameSector: true }]),
  ]);
  // X4 relaunched: a new debuglog.txt, the game loaded from the save made at 300
  const carried = first.open.flatMap((hunt) => hunt.entries);
  const second = await readHunts(
    [
      session(300),
      loss(350, myShip("PLR-002"), 70000, [{ hunt: b, byHuntWing: true, sameSector: true }]),
      success(b, 400, { kill: 1000000, destruction: 0 }),
    ],
    { carried },
  );

  assert.deepEqual(second.open, []);
  assert.deepEqual(
    second.rows.map((row) => [row.huntKey, row.acceptT, row.durationS, row.losses, row.netCt]),
    [[b, 200, 200, 2, 1000000 - 570000]],
  );
});

test("an open hunt carried over is dropped when the next log loads a save from before its accept", async () => {
  const first = await readHunts([session(50), accept(b, 200)]);
  const second = await readHunts([session(150)], { carried: first.open.flatMap((hunt) => hunt.entries) });

  assert.deepEqual(second.open, []);
});

test("loading a later save after an older one brings back the later save's history, not the older branch's", async () => {
  const { rows } = await readHunts([
    session(10),
    accept(a, 20),
    loss(60, myShip("PLR-001"), 500000, [{ hunt: a, byHuntWing: true, sameSector: true }]),
    // Saved at 90, then played on
    loss(95, myShip("PLR-002"), 70000, [{ hunt: a, byHuntWing: true, sameSector: true }]),
    // Loaded the save made at 50 and played to 70
    session(50),
    loss(70, myShip("PLR-003"), 9000, [{ hunt: a, byHuntWing: true, sameSector: true }]),
    // Loaded the save made at 90: only the first branch reached it
    session(90),
    success(a, 120, { kill: 1000000, destruction: 0 }),
  ]);

  assert.deepEqual(
    rows.map((row) => [row.huntKey, row.losses, row.lossValueCt]),
    [[a, 1, 500000]],
  );
});

test("events of a hunt whose accept isn't in the log make no open hunt, and its losses are outside any hunt", async () => {
  const { rows, open, lossesOutside } = await readHunts([
    session(50),
    kill(b, 150, ship("ESC-001"), "escort"),
    loss(160, myShip("PLR-001"), 500000, [{ hunt: b, byHuntWing: true, sameSector: true }]),
  ]);

  assert.deepEqual([rows, open], [[], []]);
  assert.deepEqual(lossesOutside.map((event) => event.data.lost.idcode), ["PLR-001"]);
});

test("a hunt's duration is rounded to the millisecond", async () => {
  const { rows } = await readHunts([accept(a, 100.1), success(a, 200.3, { kill: 0, destruction: 0 })]);

  assert.equal(rows[0].durationS, 100.2);
});
