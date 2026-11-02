// Builds debuglog.txt lines for the hunt-log tests. Each line is typed against the log
// schema, so a schema change that breaks a fixture fails the type check.
import { MARKER, type LogEventOf } from "../log/schema.ts";

type Ship = LogEventOf<"hunt.accept">["data"]["target"];

const line = (event: object) => `[General] ${MARKER}${JSON.stringify(event)}`;

export const ship = (idcode: string, owner = "newrepublic", shipClass: Ship["class"] = "ship_s"): Ship => ({
  idcode,
  macro: "ship_nrl_bwing_macro",
  class: shipClass,
  owner,
  name: "NRL Patrol B-wing",
});

export const huntKey = (mission: number, target: string, t: number) => `kEM_Hunt_${mission}-${target}-${t}`;

export const session = (t: number, saveMarker = "s1") =>
  line({
    v: 1,
    type: "session.start",
    t,
    data: { saveMarker, gameVersion: "800", swiVersion: null },
  } satisfies LogEventOf<"session.start">);

export const accept = (
  hunt: string,
  t: number,
  options: { wing?: Ship[]; sanction?: "none" | "partial" | "full" } = {},
) =>
  line({
    v: 1,
    type: "hunt.accept",
    t,
    hunt,
    data: {
      missionId: hunt.split("-")[0],
      faction: { id: "imperialascendancy", name: "Imperial Ascendancy" },
      wharf: { idcode: "WHF-001", macro: "station_wharf_macro", owner: "imperialascendancy", name: "Wharf" },
      difficulty: "medium",
      target: ship(hunt.split("-").slice(1, 3).join("-")),
      sizeClass: "s",
      offered: { kill: 12478500, upTo: 9602500 },
      wing: options.wing ?? [],
      sanction: options.sanction ?? "none",
    },
  } satisfies LogEventOf<"hunt.accept">);

export const sanction = (hunt: string, t: number, tier: "partial" | "full", cost: number) =>
  line({ v: 1, type: "hunt.sanction", t, hunt, data: { tier, cost } } satisfies LogEventOf<"hunt.sanction">);

export const kill = (hunt: string, t: number, victim: Ship, role: "target" | "escort", byPlayer = true) =>
  line({ v: 1, type: "hunt.kill", t, hunt, data: { victim, role, byPlayer } } satisfies LogEventOf<"hunt.kill">);

type End = LogEventOf<"hunt.end">["data"];

export const success = (hunt: string, t: number, paid: { kill: number; destruction: number }, extra: Partial<End> = {}) =>
  line({
    v: 1,
    type: "hunt.end",
    t,
    hunt,
    data: {
      result: "success",
      failedStep: null,
      payout: {
        kill: paid.kill,
        destruction: paid.destruction,
        total: paid.kill + paid.destruction,
        capBefore: paid.kill + paid.destruction,
        capAfter: paid.kill + paid.destruction,
      },
      targetKills: null,
      engagements: [],
      relations: [],
      repairs: [],
      ...extra,
    },
  } satisfies LogEventOf<"hunt.end">);

export const failure = (hunt: string, t: number, failedStep: End["failedStep"], extra: Partial<End> = {}) =>
  line({
    v: 1,
    type: "hunt.end",
    t,
    hunt,
    data: {
      result: failedStep === null ? "aborted" : "failed",
      failedStep,
      payout: null,
      targetKills: null,
      engagements: null,
      relations: [],
      repairs: [],
      ...extra,
    },
  } satisfies LogEventOf<"hunt.end">);

type ActiveHunt = LogEventOf<"player.loss">["data"]["activeHunts"][number];

export const loss = (t: number, lost: Ship, value: number, activeHunts: ActiveHunt[] = []) =>
  line({
    v: 1,
    type: "player.loss",
    t,
    data: { lost, value, killer: null, piloted: false, activeHunts },
  } satisfies LogEventOf<"player.loss">);
