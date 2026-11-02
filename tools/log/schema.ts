// The log schema (ADR 0001): every log event the swibh extension writes, as
// [swibh] {"v":1,"type":"<event>","t":<player.age>,"hunt":"<hunt key>"?,"data":{...}}
// The MD library (md.ts) and the parser (parse.ts) are both built from it.
//
// Format rules: money is integer ct (100 ct = 1 Cr), game time is raw player.age
// seconds, things are named by ids (macro id, faction id, idcode, mission id). A
// display name is only written after a lossy cleanup (" -> ', \ -> /, newline -> space).
// A field EM can't supply at its hook is dropped and noted here, never guessed.

// `from` is the MD expression a shape field is read with, appended to the shape's
// input ($In), with @ in front when the field is nullable. Without it the input is
// a table and the field is read as $In.$<field>.
type Base = { from?: string };

export type FieldType =
  | (Base & { kind: "int" })
  | (Base & { kind: "money" })
  | (Base & { kind: "number" })
  | (Base & { kind: "bool" })
  | (Base & { kind: "id" })
  | (Base & { kind: "name" })
  | (Base & { kind: "enum"; values: readonly string[] })
  | (Base & { kind: "shape"; shape: Shape })
  | (Base & { kind: "list"; of: FieldType })
  | (Base & { kind: "nullable"; of: FieldType });

export type Fields = Record<string, FieldType>;

export type Shape<F extends Fields = Fields> = { name: string; fields: F };

export type EventDef<H extends boolean = boolean, F extends Fields = Fields> = { hunt: H; data: F };

// Integer, written with ($x)i
export const int = () => ({ kind: "int" }) as const;
// Money as integer ct; the MD value must be money (1Cr, 5ct), which prints as ct
export const money = () => ({ kind: "money" }) as const;
// Any number, written with ($x)f
export const number = () => ({ kind: "number" }) as const;
export const bool = () => ({ kind: "bool" }) as const;
// An id string with no quotes or backslashes: idcode, macro id, faction id, mission id
export const id = () => ({ kind: "id" }) as const;
// Display text, cleaned up before it's written. A hint for people, never a key
export const name = () => ({ kind: "name" }) as const;
// One of a fixed set; the MD value is a string or an enum that prints as one of them
export const oneOf = <const V extends readonly string[]>(...values: V) => ({ kind: "enum", values }) as const;
export const shape = <F extends Fields>(s: Shape<F>) => ({ kind: "shape", shape: s }) as const;
export const list = <T extends FieldType>(of: T) => ({ kind: "list", of }) as const;
export const nullable = <T extends FieldType>(of: T) => ({ kind: "nullable", of }) as const;
// Reads a shape field from its component input instead of a table key
export const from = <T extends FieldType>(expr: string, type: T): T & { from: string } => ({ ...type, from: expr });

const defineShape = <F extends Fields>(name: string, fields: F): Shape<F> => ({ name, fields });
const defineEvent = <const H extends boolean, F extends Fields>(hunt: H, data: F): EventDef<H, F> => ({ hunt, data });

// The size classes a ship's .class prints as
const shipClass = oneOf("ship_xs", "ship_s", "ship_m", "ship_l", "ship_xl");

// ---- Named shapes: each is written by one MD helper, the same way everywhere

// From a ship component, which must still be readable (in a destroyed handler it is)
export const Ship = defineShape("Ship", {
  idcode: from(".idcode", id()),
  macro: from(".macro.id", id()),
  class: from(".class", shipClass),
  owner: from(".owner.id", id()),
  name: from(".knownname", name()),
});

// From a faction
export const FactionRef = defineShape("FactionRef", {
  id: from(".id", id()),
  name: from(".knownname", name()),
});

// From any component: a station, a ship, a turret's ship. Not every object has an idcode
export const Ref = defineShape("Ref", {
  idcode: from(".idcode", nullable(id())),
  macro: from(".macro.id", id()),
  owner: from(".owner.id", id()),
  name: from(".knownname", name()),
});

// From table[$kill, $upTo]: the offer's pay, stashed at accept because EM
// overwrites $BaseRewardData at the Destroy step (EM 5897)
export const Offer = defineShape("Offer", {
  kill: money(),
  upTo: money(),
});

// From table[$kill, $destruction, $total, $capBefore, $capAfter]: what a successful
// hunt paid. kill and destruction are the paid parts after the cap; capBefore and
// capAfter are their sum before and after CapRewardBasedOnMissionTarget (EM 5683-5690)
export const Payout = defineShape("Payout", {
  kill: money(),
  destruction: money(),
  total: money(),
  capBefore: money(),
  capAfter: money(),
});

// From table[$xs, $s, $m, $l, $xl]: a count per ship size class
export const ClassCounts = defineShape("ClassCounts", {
  xs: int(),
  s: int(),
  m: int(),
  l: int(),
  xl: int(),
});

// From table[$idcode, $class, $owner, $damage, $killed]: one ship the player
// engaged, from an entry of EM's $DamageAndKillsList (EM 5664). The entry's
// $faction is a faction, so pass $faction.id as $owner
export const Engagement = defineShape("Engagement", {
  idcode: id(),
  class: shipClass,
  owner: id(),
  damage: number(),
  killed: bool(),
});

// From table[$faction, $amount, $reason]: one relation change the hunt caused
export const RelationChange = defineShape("RelationChange", {
  faction: shape(FactionRef),
  amount: number(),
  // An id for the reason, such as missioncompleted or targetattacked
  reason: id(),
});

// From table[$ship, $repairprice]: a fleet ship's repair price at hunt end
export const Repair = defineShape("Repair", {
  ship: shape(Ship),
  repairprice: money(),
});

// From table[$hunt, $byHuntWing, $sameSector]: a hunt active when a player ship was lost
export const ActiveHunt = defineShape("ActiveHunt", {
  hunt: id(),
  // The killer was the hunt's target or one of its wing
  byHuntWing: bool(),
  // The loss was in the target's sector
  sameSector: bool(),
});

// ---- v1 events. hunt: true means the line carries the hunt key

export const events = {
  // On game start and on every load, so reloads show in the log
  "session.start": defineEvent(false, {
    // A token the logger keeps in the save, so sessions loaded from one save share it
    saveMarker: id(),
    gameVersion: id(),
    // null when SWI's version can't be read from MD
    swiVersion: nullable(id()),
  }),

  // Sets the hunt key <mission id>-<target idcode>-<accept t>
  "hunt.accept": defineEvent(true, {
    missionId: id(),
    faction: shape(FactionRef),
    wharf: shape(Ref),
    // EM's $Difficulty: medium, or hard for L/XL targets
    difficulty: id(),
    target: shape(Ship),
    sizeClass: oneOf("s", "m", "l", "xl"),
    offered: shape(Offer),
    // The target's commander and subordinates at accept
    wing: list(shape(Ship)),
    sanction: oneOf("none", "partial", "full"),
  }),

  "hunt.sanction": defineEvent(true, {
    tier: oneOf("partial", "full"),
    cost: money(),
  }),

  "hunt.kill": defineEvent(true, {
    victim: shape(Ship),
    role: oneOf("target", "escort"),
    byPlayer: bool(),
  }),

  "hunt.end": defineEvent(true, {
    result: oneOf("success", "failed", "aborted"),
    // The step that wasn't done (EM's failure texts 575, 576, 572, 577); null unless failed
    failedStep: nullable(oneOf("find", "identify", "destroy", "damage")),
    // null unless success: EM only computes the pay on its success branch
    payout: nullable(shape(Payout)),
    // null when the target's pilot, which holds $kEM_kills, is gone
    targetKills: nullable(shape(ClassCounts)),
    // null unless success: EM only builds $DamageAndKillsList on its success branch
    engagements: nullable(list(shape(Engagement))),
    relations: list(shape(RelationChange)),
    repairs: list(shape(Repair)),
  }),

  // Every player-owned ship destroyed, hunt or not; extractors decide which hunt it counts against
  "player.loss": defineEvent(false, {
    lost: shape(Ship),
    // .value: hull, upgrades and drones; crew and cargo not included
    value: money(),
    // null when nothing killed it (a collision) or the killer can't be read
    killer: nullable(shape(Ref)),
    // It was the ship the player was flying
    piloted: bool(),
    activeHunts: list(shape(ActiveHunt)),
  }),
};

export const VERSION = 1;
// What starts a log event in the debug log; the test harness keeps [swibh-test]
export const MARKER = "[swibh] ";

// ---- Types inferred from the schema

export type Infer<T> = T extends { kind: "int" | "money" | "number" }
  ? number
  : T extends { kind: "bool" }
    ? boolean
    : T extends { kind: "id" | "name" }
      ? string
      : T extends { kind: "enum"; values: readonly (infer V)[] }
        ? V
        : T extends { kind: "shape"; shape: Shape<infer F> }
          ? InferFields<F>
          : T extends { kind: "list"; of: infer O }
            ? Infer<O>[]
            : T extends { kind: "nullable"; of: infer O }
              ? Infer<O> | null
              : never;

export type InferFields<F extends Fields> = { [K in keyof F]: Infer<F[K]> };

type Events = typeof events;
export type EventType = keyof Events;

export type LogEventOf<K extends EventType> = {
  v: typeof VERSION;
  type: K;
  t: number;
  data: InferFields<Events[K]["data"]>;
} & (Events[K]["hunt"] extends true ? { hunt: HuntKey } : {});

export type LogEvent = { [K in EventType]: LogEventOf<K> }[EventType];
export type HuntEvent = Extract<LogEvent, { hunt: HuntKey }>;
// <mission id>-<target idcode>-<accept t>, set at hunt.accept; SWI's mission id isn't unique on its own
export type HuntKey = string;
