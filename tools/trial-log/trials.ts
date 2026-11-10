// Reads the trials extension's "[swibh-trial]" lines (tests/game/swibh_trials) from a
// debuglog.txt into one record per fight. Each line is "<event> key=value ...", values
// without spaces; tests/game/trials.md lists the events.

export const MARKER = "[swibh-trial]";

// bailed: the target's crew abandoned it, which ends the fight like a kill
export type Result = "killed" | "bailed" | "ship_lost" | "abandoned" | "unfinished";

export type Wingman = { ship: string; macro: string; lead: string };

export type Fight = {
  // 1 for the first new game in the log, 2 for the next, ...
  session: number;
  // Numbered from 1 in each session
  fight: number;
  config: string;
  target: string;
  faction: string;
  escorts: number;
  distance: number;
  // Game time (s) the target was spawned
  start: number;
  end: number | null;
  // The player's ship at the start
  ship: string;
  shipMacro: string;
  // The player's wing at the start
  wingmen: Wingman[];
  lost: { ship: string; macro: string; t: number }[];
  result: Result;
  won: boolean;
  // Seconds from spawn to the target's death or abandonment; null unless won
  timeToKill: number | null;
};

export type LineError = { line: number; error: string; text: string };

const fields = (text: string): Record<string, string> =>
  Object.fromEntries(
    text
      .split(/\s+/)
      .filter((part) => part.includes("="))
      .map((part) => [part.slice(0, part.indexOf("=")), part.slice(part.indexOf("=") + 1)]),
  );

const results: readonly string[] = ["killed", "bailed", "ship_lost", "abandoned"];
const wins: readonly string[] = ["killed", "bailed"];

export function readTrials(lines: Iterable<string>): { fights: Fight[]; errors: LineError[] } {
  const fights: Fight[] = [];
  const errors: LineError[] = [];
  let session = 0;
  let config = "";
  // This session's fights by number
  let current = new Map<number, Fight>();

  let number = 0;
  for (const text of lines) {
    number++;
    const at = text.indexOf(MARKER);
    if (at < 0) continue;
    const body = text.slice(at + MARKER.length).trim();
    const event = body.split(/\s+/, 1)[0];
    const f = fields(body);
    const fail = (error: string) => errors.push({ line: number, error, text });
    const num = (key: string) => {
      const value = Number(f[key]);
      if (f[key] === undefined || !Number.isFinite(value)) throw new Error(`${key}: expected a number`);
      return value;
    };
    const str = (key: string) => {
      if (!f[key]) throw new Error(`${key}: missing`);
      return f[key];
    };
    try {
      if (event === "session") {
        session++;
        config = str("config");
        current = new Map();
        continue;
      }
      if (!session) throw new Error("before any session line");
      const id = num("fight");
      if (event === "fight.start") {
        const fight: Fight = {
          session,
          fight: id,
          config,
          target: str("target"),
          faction: str("faction"),
          escorts: num("escorts"),
          distance: num("distance"),
          start: num("t"),
          end: null,
          ship: str("ship"),
          shipMacro: str("shipmacro"),
          wingmen: [],
          lost: [],
          result: "unfinished",
          won: false,
          timeToKill: null,
        };
        current.set(id, fight);
        fights.push(fight);
        continue;
      }
      const fight = current.get(id);
      if (!fight) throw new Error(`fight ${id}: no fight.start in this session`);
      if (event === "wingman") {
        fight.wingmen.push({ ship: str("ship"), macro: str("macro"), lead: str("lead") });
      } else if (event === "wingman.lost") {
        fight.lost.push({ ship: str("ship"), macro: str("macro"), t: num("t") });
      } else if (event === "fight.end") {
        const result = str("result");
        if (!results.includes(result)) throw new Error(`result: expected one of ${results.join(", ")}`);
        fight.result = result as Result;
        fight.end = num("t");
        fight.won = wins.includes(result);
        fight.timeToKill = fight.won ? fight.end - fight.start : null;
      } else {
        throw new Error(`unknown event ${event}`);
      }
    } catch (e) {
      fail((e as Error).message);
    }
  }
  return { fights, errors };
}
