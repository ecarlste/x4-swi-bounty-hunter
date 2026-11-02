// The hunt-log extractor's rules: turns the log events of a debug log into one row per
// finished hunt, the hunts still open, and the losses outside any hunt.
import { parseLine, type LineError } from "../log/parse.ts";
import type { HuntEvent, HuntKey, LogEvent, LogEventOf } from "../log/schema.ts";

export type HuntRow = {
  huntKey: HuntKey;
  acceptT: number | null;
  endT: number;
  durationS: number | null;
  faction: string | null;
  wharf: string | null;
  target: string | null;
  targetMacro: string | null;
  sizeClass: string | null;
  sanction: string | null;
  sanctionCostCt: number;
  offeredKillCt: number | null;
  offeredUpToCt: number | null;
  paidKillCt: number | null;
  paidDestructionCt: number | null;
  paidTotalCt: number | null;
  capBeforeCt: number | null;
  capAfterCt: number | null;
  result: string;
  failedStep: string | null;
  wingSize: number | null;
  escortsKilled: number;
  relations: string;
  losses: number;
  lossValueCt: number;
  repairsCt: number;
  // paid - losses - repairs
  netCt: number;
};

type Loss = LogEventOf<"player.loss">;

// A log event with the save marker of the session.start before it (null before any)
export type Entry = { saveMarker: string | null; event: LogEvent };

export type OpenHunt = {
  huntKey: HuntKey;
  acceptT: number | null;
  faction: string | null;
  target: string | null;
  losses: number;
  lossValueCt: number;
  // Its events and the losses it's charged with, to carry over to the next log
  entries: Entry[];
};

export type Hunts = {
  rows: HuntRow[];
  open: OpenHunt[];
  // Player losses no active hunt is charged with
  lossesOutside: Loss[];
  // Lines that carry the marker but aren't a valid log event
  errors: LineError[];
};

// The hunt a player loss counts against: the active hunt whose wing made the kill,
// else the first one whose target is in the loss's sector, else none
export function attributeLoss(loss: Loss): HuntKey | null {
  const { activeHunts } = loss.data;
  return (activeHunts.find((hunt) => hunt.byHuntWing) ?? activeHunts.find((hunt) => hunt.sameSector))?.hunt ?? null;
}

const signed = (n: number) => (n > 0 ? `+${n}` : String(n));

function row(key: HuntKey, events: HuntEvent[], losses: Loss[], end: LogEventOf<"hunt.end">): HuntRow {
  const accept = events.find((event) => event.type === "hunt.accept");
  const sanctions = events.filter((event) => event.type === "hunt.sanction");
  const kills = events.filter((event) => event.type === "hunt.kill");
  const { payout, relations, repairs } = end.data;
  const paid = payout?.total ?? 0;
  const repairsCt = repairs.reduce((sum, repair) => sum + repair.repairprice, 0);
  const lossValueCt = losses.reduce((sum, loss) => sum + loss.data.value, 0);
  return {
    huntKey: key,
    acceptT: accept?.t ?? null,
    endT: end.t,
    durationS: accept ? end.t - accept.t : null,
    faction: accept?.data.faction.id ?? null,
    wharf: accept ? (accept.data.wharf.idcode ?? accept.data.wharf.macro) : null,
    target: accept?.data.target.idcode ?? null,
    targetMacro: accept?.data.target.macro ?? null,
    sizeClass: accept?.data.sizeClass ?? null,
    sanction: sanctions.at(-1)?.data.tier ?? accept?.data.sanction ?? null,
    sanctionCostCt: sanctions.reduce((sum, event) => sum + event.data.cost, 0),
    offeredKillCt: accept?.data.offered.kill ?? null,
    offeredUpToCt: accept?.data.offered.upTo ?? null,
    paidKillCt: payout?.kill ?? null,
    paidDestructionCt: payout?.destruction ?? null,
    paidTotalCt: payout?.total ?? null,
    capBeforeCt: payout?.capBefore ?? null,
    capAfterCt: payout?.capAfter ?? null,
    result: end.data.result,
    failedStep: end.data.failedStep,
    wingSize: accept?.data.wing.length ?? null,
    escortsKilled: kills.filter((event) => event.data.role === "escort").length,
    relations: relations.map((r) => `${r.faction.id} ${signed(r.amount)} ${r.reason}`).join("; "),
    losses: losses.length,
    lossValueCt,
    repairsCt,
    netCt: paid - lossValueCt - repairsCt,
  };
}

// The events that still stand once reloads are taken out, after the carried-over
// entries. Loading a save at game time T (a session.start) undoes that save's events
// after T: they were played in a branch the player threw away. A line written again
// with the same JSON counts once.
function timeline(carried: Entry[], events: LogEvent[]): Entry[] {
  let kept = [...carried];
  let saveMarker: string | null = null;
  for (const event of events) {
    if (event.type === "session.start") {
      const marker = event.data.saveMarker;
      kept = kept.filter((entry) => entry.saveMarker !== marker || entry.event.t <= event.t);
      saveMarker = marker;
    } else {
      kept.push({ saveMarker, event });
    }
  }
  const seen = new Set<string>();
  return kept.filter((entry) => {
    const json = JSON.stringify(entry.event);
    if (seen.has(json)) return false;
    seen.add(json);
    return true;
  });
}

function openHunt(key: HuntKey, entries: Entry[]): OpenHunt {
  const accept = entries.map((entry) => entry.event).find((event) => event.type === "hunt.accept");
  const losses = entries.map((entry) => entry.event).filter((event) => event.type === "player.loss");
  return {
    huntKey: key,
    acceptT: accept?.t ?? null,
    faction: accept?.data.faction.id ?? null,
    target: accept?.data.target.idcode ?? null,
    losses: losses.length,
    lossValueCt: losses.reduce((sum, loss) => sum + loss.data.value, 0),
    entries,
  };
}

// Reads a debug log's lines into hunt rows. carried is the entries of the hunts left
// open by earlier logs (OpenHunt.entries), read as if they came before these lines.
export async function readHunts(
  lines: Iterable<string> | AsyncIterable<string>,
  options: { carried?: Entry[] } = {},
): Promise<Hunts> {
  const hunts: Hunts = { rows: [], open: [], lossesOutside: [], errors: [] };
  const logged: LogEvent[] = [];
  let lineNumber = 0;
  for await (const text of lines) {
    lineNumber++;
    const result = parseLine(text);
    if (typeof result === "string") hunts.errors.push({ line: lineNumber, error: result, text });
    else if (result !== null) logged.push(result);
  }
  const byHunt = new Map<HuntKey, Entry[]>();
  const add = (key: HuntKey, entry: Entry) => byHunt.set(key, [...(byHunt.get(key) ?? []), entry]);
  for (const entry of timeline(options.carried ?? [], logged)) {
    const { event } = entry;
    if ("hunt" in event) {
      add(event.hunt, entry);
    } else if (event.type === "player.loss") {
      const key = attributeLoss(event);
      if (key === null) hunts.lossesOutside.push(event);
      else add(key, entry);
    }
  }
  for (const [key, entries] of byHunt) {
    const events = entries.map((entry) => entry.event);
    const huntEvents = events.filter((event): event is HuntEvent => "hunt" in event);
    const losses = events.filter((event): event is Loss => event.type === "player.loss");
    const end = huntEvents.findLast((event) => event.type === "hunt.end");
    if (end) hunts.rows.push(row(key, huntEvents, losses, end));
    else hunts.open.push(openHunt(key, entries));
  }
  return hunts;
}
