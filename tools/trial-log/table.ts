// The per-fight results table, as markdown: one row per fight in log order.
import type { Fight } from "./trials.ts";

const clock = (seconds: number) => {
  const s = Math.round(seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

const counts = (macros: string[]) => {
  const n = new Map<string, number>();
  for (const macro of macros) n.set(macro, (n.get(macro) ?? 0) + 1);
  return [...n].map(([macro, count]) => `${count} ${macro}`).join(", ");
};

// Who each wingman was assigned to at the spawn, e.g. "HWK-001 (hwk_290_01_macro): 2 r41_macro"
function wing(fight: Fight): string {
  const macroOf = new Map(fight.wingmen.map((w) => [w.ship, w.macro]));
  macroOf.set(fight.ship, fight.shipMacro);
  const leads = new Map<string, string[]>();
  for (const w of fight.wingmen) leads.set(w.lead, [...(leads.get(w.lead) ?? []), w.macro]);
  const parts = [...leads].map(([lead, macros]) => {
    const name = lead === fight.ship ? "Bobby" : lead;
    return `${name} (${macroOf.get(lead) ?? "?"}): ${counts(macros)}`;
  });
  return parts.join("; ") || "-";
}

function row(fight: Fight): string[] {
  const escorts = fight.escorts ? ` + ${fight.escorts} escort${fight.escorts === 1 ? "" : "s"}` : "";
  const lost =
    `${fight.lost.length} of ${fight.wingmen.length}` +
    (fight.lost.length ? `: ${counts(fight.lost.map((l) => l.macro))}` : "");
  return [
    String(fight.session),
    String(fight.fight),
    fight.config,
    `${fight.target} (${fight.faction})${escorts}`,
    clock(fight.start),
    fight.result,
    fight.won ? "yes" : "no",
    lost,
    fight.timeToKill === null ? "-" : clock(fight.timeToKill),
    wing(fight),
  ];
}

const HEADER = ["Session", "Fight", "Config", "Target", "Spawned", "Result", "Win", "Wingmen lost", "Time to kill", "Wing"];

export function resultsTable(fights: Fight[]): string {
  const rows = [HEADER, HEADER.map(() => "---"), ...fights.map(row)];
  return rows.map((cells) => `| ${cells.join(" | ")} |\n`).join("");
}
