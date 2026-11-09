import { test } from "node:test";
import assert from "node:assert/strict";
import { readTrials } from "./trials.ts";

// MD debug_text lines with context="false", as X4 writes them to debuglog.txt
const line = (t: number, text: string) => `[General] ${t} [swibh-trial] ${text}`;

test("a fight the wing wins: wingmen lost and time to kill", () => {
  const { fights, errors } = readTrials([
    "[General] 0.00 ======================================",
    line(5, "session config=entry t=5"),
    line(100, "fight.start fight=1 t=100 target=gs80_macro faction=hutt escorts=2 distance=15000 ship=BOB-001 shipmacro=hwk_290_01_macro"),
    line(100, "wingman fight=1 ship=AAA-111 macro=r41_macro lead=BOB-001"),
    line(100, "wingman fight=1 ship=AAA-222 macro=r41_macro lead=BOB-001"),
    line(150, "wingman.lost fight=1 t=150 ship=AAA-222 macro=r41_macro"),
    line(342.5, "fight.end fight=1 t=342.5 result=killed"),
  ]);

  assert.deepEqual(errors, []);
  assert.equal(fights.length, 1);
  const [fight] = fights;
  assert.equal(fight.session, 1);
  assert.equal(fight.fight, 1);
  assert.equal(fight.config, "entry");
  assert.equal(fight.target, "gs80_macro");
  assert.equal(fight.escorts, 2);
  assert.equal(fight.start, 100);
  assert.equal(fight.result, "killed");
  assert.equal(fight.won, true);
  assert.equal(fight.timeToKill, 242.5);
  assert.equal(fight.wingmen.length, 2);
  assert.deepEqual(fight.lost, [{ ship: "AAA-222", macro: "r41_macro", t: 150 }]);
});

test("losing the player's ship is no win and has no time to kill", () => {
  const { fights } = readTrials([
    line(5, "session config=top t=5"),
    line(10, "fight.start fight=1 t=10 target=cr90_macro faction=pirates escorts=0 distance=15000 ship=BOB-001 shipmacro=firespray_macro"),
    line(90, "fight.end fight=1 t=90 result=ship_lost"),
  ]);

  assert.equal(fights[0].result, "ship_lost");
  assert.equal(fights[0].won, false);
  assert.equal(fights[0].timeToKill, null);
  assert.equal(fights[0].end, 90);
});

test("a fight with no end line is unfinished", () => {
  const { fights } = readTrials([
    line(5, "session config=entry t=5"),
    line(10, "fight.start fight=1 t=10 target=cr90_macro faction=pirates escorts=0 distance=15000 ship=BOB-001 shipmacro=hwk_290_01_macro"),
  ]);

  assert.equal(fights[0].result, "unfinished");
  assert.equal(fights[0].end, null);
});

test("each new game is its own session, with its own config and fight numbers", () => {
  const start = (t: number) =>
    line(t, `fight.start fight=1 t=${t} target=gs80_macro faction=hutt escorts=0 distance=15000 ship=BOB-001 shipmacro=hwk_290_01_macro`);
  const { fights, errors } = readTrials([
    line(5, "session config=entry t=5"),
    start(10),
    line(5, "session config=established t=5"),
    start(20),
    line(60, "fight.end fight=1 t=60 result=killed"),
  ]);

  assert.deepEqual(errors, []);
  assert.deepEqual(
    fights.map((f) => [f.session, f.fight, f.config, f.result]),
    [
      [1, 1, "entry", "unfinished"],
      [2, 1, "established", "killed"],
    ],
  );
  assert.equal(fights[1].timeToKill, 40);
});

test("bad lines are reported by line number and skipped", () => {
  const { fights, errors } = readTrials([
    line(5, "session config=entry t=5"),
    line(10, "fight.start fight=1 t=10 target=gs80_macro"),
    line(20, "wingman.lost fight=7 t=20 ship=AAA-111 macro=r41_macro"),
    line(30, "fight.end fight=1 t=30 result=fled"),
  ]);

  assert.equal(fights.length, 0);
  assert.deepEqual(
    errors.map((e) => [e.line, e.error]),
    [
      [2, "faction: missing"],
      [3, "fight 7: no fight.start in this session"],
      [4, "fight 1: no fight.start in this session"],
    ],
  );
});
