// Checks the [swibh] lines the hunt_log game test writes (tests/game/swibh_tests/md/swibh_tests.xml)
// against the values it sets up, read from a real debuglog.txt by the real parser (game-check.ts
// runs it). Idcodes are random, so they're checked against each other: a kill's victim is the wing
// or target accepted.
import type { Log } from "./parse.ts";
import type { EventType, HuntEvent, LogEventOf } from "./schema.ts";

// The test's three fake EM hunts, by mission id: A succeeds, B is aborted, C times out
export const MISSIONS = { A: "kEM_Hunt_9001", B: "kEM_Hunt_9002", C: "kEM_Hunt_9003" } as const;
type Hunt = keyof typeof MISSIONS;

const fortitude = (owner: string) => ({ class: "ship_m", macro: "fortitude_macro", owner });
const newRepublic = { id: "newrepublic" };

// What every hunt.accept says: the test's setup in swibh_tests.xml HuntLog
const ACCEPT = {
  difficulty: "medium",
  faction: newRepublic,
  wharf: { macro: "mc40a_macro", owner: "newrepublic" },
  target: fortitude("galempire"),
  sizeClass: "m",
  offered: { kill: 1000000, upTo: 5000000 },
  sanction: "none",
};

const END: Record<Hunt, object> = {
  A: {
    result: "success",
    failedStep: null,
    payout: { kill: 500000, destruction: 1500000, total: 2000000, capBefore: 4000000, capAfter: 2000000 },
    targetKills: null,
    relations: [{ faction: newRepublic, amount: 0.01, reason: "missioncompleted" }],
  },
  B: { result: "aborted", failedStep: null, payout: null, engagements: null, targetKills: null, relations: [] },
  C: { result: "failed", failedStep: "find", payout: null, engagements: null, targetKills: null, relations: [] },
};

// Problems where actual differs from expected; keys expected doesn't name aren't checked
function differences(expected: unknown, actual: unknown, path: string): string[] {
  if (Array.isArray(expected)) {
    if (!Array.isArray(actual) || actual.length !== expected.length) {
      return [`${path} is ${JSON.stringify(actual)}, expected ${expected.length} entries`];
    }
    return expected.flatMap((e, i) => differences(e, actual[i], `${path}[${i}]`));
  }
  if (typeof expected === "object" && expected !== null) {
    if (typeof actual !== "object" || actual === null) return [`${path} is ${JSON.stringify(actual)}, expected an object`];
    return Object.entries(expected).flatMap(([k, e]) => differences(e, (actual as Record<string, unknown>)[k], `${path}.${k}`));
  }
  // MD prints floats with a few decimals
  const same = typeof expected === "number" && typeof actual === "number" ? Math.abs(expected - actual) < 1e-6 : expected === actual;
  return same ? [] : [`${path} is ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`];
}

const ofType = <K extends EventType>(events: readonly { type: string }[], type: K) =>
  events.filter((e): e is LogEventOf<K> => e.type === type);

// What's wrong with the hunt_log test's log events; empty when they all match
export function checkHuntLogTest(log: Log): string[] {
  const problems = log.errors.map((e) => `line ${e.line}: ${e.error}`);

  const sessions = ofType(log.events, "session.start");
  if (!sessions.length) problems.push("no session.start");
  for (const s of sessions) {
    problems.push(...differences({ gameVersion: "800" }, s.data, "session.start: data"));
    if (!/^s\d{14}$/.test(s.data.saveMarker)) problems.push(`session.start: saveMarker ${s.data.saveMarker} isn't s<14 digits>`);
  }

  const keys = new Map<Hunt, string>();
  for (const [name, missionId] of Object.entries(MISSIONS) as [Hunt, string][]) {
    const found = ofType(log.events, "hunt.accept").filter((e) => e.data.missionId === missionId);
    if (found.length !== 1) {
      problems.push(`${missionId}: ${found.length} hunt.accept, expected 1`);
      continue;
    }
    const accept = found[0];
    keys.set(name, accept.hunt);
    const where = (type: string) => `${missionId} ${type}: data`;
    problems.push(...differences(ACCEPT, accept.data, where("hunt.accept")));
    const prefix = `${missionId}-${accept.data.target.idcode}-`;
    if (!accept.hunt.startsWith(prefix) || Number(accept.hunt.slice(prefix.length)) !== accept.t) {
      problems.push(`${missionId}: hunt key ${accept.hunt} isn't ${prefix}<accept t ${accept.t}>`);
    }
    const wing = name === "A" ? [fortitude("galempire")] : [];
    problems.push(...differences(wing, accept.data.wing, `${where("hunt.accept")}.wing`));

    const hunt: HuntEvent[] = log.hunts.get(accept.hunt) ?? [];
    const sanctions = ofType(hunt, "hunt.sanction").map((e) => e.data);
    problems.push(...differences(name === "A" ? [{ tier: "partial", cost: 3970000 }] : [], sanctions, `${missionId} hunt.sanction`));

    const kills = ofType(hunt, "hunt.kill").map((e) => e.data);
    const victims =
      name === "A"
        ? [
            { role: "escort", byPlayer: false, victim: { idcode: accept.data.wing[0]?.idcode } },
            { role: "target", byPlayer: false, victim: { idcode: accept.data.target.idcode } },
          ]
        : [];
    problems.push(...differences(victims, kills, `${missionId} hunt.kill`));

    const ends = ofType(hunt, "hunt.end");
    if (ends.length !== 1) {
      problems.push(`${accept.hunt}: ${ends.length} hunt.end, expected 1`);
      continue;
    }
    const end = ends[0].data;
    problems.push(...differences(END[name], end, where("hunt.end")));
    if (name === "A") {
      const engaged = [{ idcode: accept.data.target.idcode, class: "ship_m", owner: "galempire", damage: 80, killed: true }];
      problems.push(...differences(engaged, end.engagements, `${where("hunt.end")}.engagements`));
    }
    for (const r of end.repairs) {
      if (r.ship.owner !== "player") problems.push(`${where("hunt.end")}.repairs: ${r.ship.idcode} isn't the player's`);
    }
  }

  // The earlier tests' cleanup destroys player-owned ships too, before hunt_log accepts its hunts
  const accepted = Math.min(...[...keys.values()].map((hunt) => log.hunts.get(hunt)?.[0]?.t ?? Infinity));
  const losses = ofType(log.events, "player.loss").filter((e) => e.t >= accepted);
  if (losses.length !== 1) problems.push(`${losses.length} player.loss, expected 1`);
  for (const loss of losses) {
    const active = [...keys.values()].map((hunt) => ({ hunt, byHuntWing: false, sameSector: true }));
    problems.push(...differences({ lost: fortitude("player"), killer: null, piloted: false, activeHunts: active }, loss.data, "player.loss: data"));
    if (!(loss.data.value > 0)) problems.push(`player.loss: value ${loss.data.value}, expected more than 0`);
  }
  return problems;
}
