// Renders a PlaytestLog as markdown for the results sheet in playtests/stock-bounty-loop.md.
import type { PlaytestLog } from "./logbook.ts";

// 22081000 ct -> "220,810.00 Cr"
export const cr = (ct: number) =>
  `${(ct / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Cr`;

// 19520.052 -> "19,520.052"
export const gameTime = (seconds: number) => seconds.toLocaleString("en-US", { maximumFractionDigits: 3 });

// 7200 -> "2:00:00"
export function duration(seconds: number): string {
  const s = Math.round(seconds);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${Math.floor(s / 3600)}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
}

const signed = (n: number) => (n > 0 ? `+${n}` : String(n));

// A table without the columns no row fills, or "None." with no rows.
export function table(headers: string[], rows: (string | undefined)[][]): string {
  if (!rows.length) return "None.";
  const kept = headers.map((_, i) => i).filter((i) => rows.some((row) => row[i]));
  const line = (cells: string[]) => `| ${cells.join(" | ")} |`;
  const cell = (value: string | undefined) => (value ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");
  return [
    line(kept.map((i) => headers[i])),
    line(kept.map(() => "-")),
    ...rows.map((row) => line(kept.map((i) => cell(row[i])))),
  ].join("\n");
}

export function renderMarkdown(log: PlaytestLog, options: { since?: number } = {}): string {
  const { pacing } = log;
  const scope =
    options.since === undefined ? "All logbook entries." : `Logbook entries after game time ${gameTime(options.since)}.`;

  return `## Hunt log

${scope}

${table(
  ["Ended (game time)", "Target", "Offering faction", "Ending", "Paid", "Kills part", "Destruction part", "Engagements", "Note"],
  log.hunts.map((hunt) => [
    gameTime(hunt.time),
    hunt.target,
    hunt.faction,
    hunt.ending,
    cr(hunt.paidCt),
    hunt.killsCt === undefined ? undefined : cr(hunt.killsCt),
    hunt.destructionCt === undefined ? undefined : cr(hunt.destructionCt),
    hunt.engagements,
    hunt.note,
  ]),
)}

## Other income

${table(
  ["When (game time)", "Source", "Faction", "Amount"],
  log.otherIncome.map((income) => [gameTime(income.time), income.source, income.faction, cr(income.amountCt)]),
)}

## Relation changes

${table(
  ["When (game time)", "Faction", "Change", "Reason", "Now"],
  log.relations.map((relation) => [
    gameTime(relation.time),
    relation.faction,
    relation.amount === null ? undefined : signed(relation.amount),
    relation.reason,
    relation.current === null ? undefined : String(relation.current),
  ]),
)}

## Pacing

- Hunts ended: ${pacing.huntsEnded}
- Game time from the first to the last: ${duration(pacing.spanSeconds)}
- Hunts per game hour: ${pacing.huntsPerHour === null ? "n/a (needs two hunts)" : pacing.huntsPerHour.toFixed(2)}
- Total paid: ${cr(pacing.totalPaidCt)}
`;
}
