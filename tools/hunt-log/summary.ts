// data/hunts-summary.md, rebuilt on every run from hunts.csv and the open hunts.
import { cr, duration, gameTime, table } from "../playtest-log/markdown.ts";
import type { HuntRow, OpenHunt } from "./hunts.ts";

const sum = (rows: HuntRow[], value: (row: HuntRow) => number | null) =>
  rows.reduce((total, row) => total + (value(row) ?? 0), 0);

function payPerHour(rows: HuntRow[]): string {
  const accepts = rows.flatMap((row) => (row.acceptT === null ? [] : [row.acceptT]));
  if (!accepts.length) return "n/a (no accept logged)";
  const span = Math.max(...rows.map((row) => row.endT)) - Math.min(...accepts);
  if (span <= 0) return "n/a (no game time between the first accept and the last end)";
  const paid = sum(rows, (row) => row.paidTotalCt);
  return `${cr(Math.round((paid / span) * 3600))} (game time from the first accept to the last end: ${duration(span)})`;
}

export function renderSummary(rows: HuntRow[], open: OpenHunt[]): string {
  const results = ["success", "failed", "aborted"].filter((result) => rows.some((row) => row.result === result));
  const netLosses = rows.filter((row) => row.netCt < 0);

  return `# Hunt log summary

Built by \`make hunt-log\` from \`data/hunts.csv\`: ${rows.length} hunts.

## Hunts by result

${table(
  ["Result", "Hunts", "Paid"],
  results.map((result) => {
    const of = rows.filter((row) => row.result === result);
    return [result, String(of.length), cr(sum(of, (row) => row.paidTotalCt))];
  }),
)}

## Money

- Total paid: ${cr(sum(rows, (row) => row.paidTotalCt))}
- Ships lost: ${sum(rows, (row) => row.losses)}, worth ${cr(sum(rows, (row) => row.lossValueCt))}
- Repairs: ${cr(sum(rows, (row) => row.repairsCt))}
- Net: ${cr(sum(rows, (row) => row.netCt))}
- Paid per game hour: ${payPerHour(rows)}

## Hunts with a net loss

${table(
  ["Hunt key", "Target", "Offering faction", "Result", "Paid", "Losses", "Repairs", "Net"],
  netLosses.map((row) => [
    row.huntKey,
    row.target ?? undefined,
    row.faction ?? undefined,
    row.result,
    cr(row.paidTotalCt ?? 0),
    cr(row.lossValueCt),
    cr(row.repairsCt),
    cr(row.netCt),
  ]),
)}

## Open hunts

Accepted and not ended yet, so not in the stats above.

${table(
  ["Hunt key", "Accepted (game time)", "Target", "Offering faction", "Losses so far"],
  open.map((hunt) => [
    hunt.huntKey,
    gameTime(hunt.acceptT),
    hunt.target,
    hunt.faction,
    cr(hunt.lossValueCt),
  ]),
)}
`;
}
