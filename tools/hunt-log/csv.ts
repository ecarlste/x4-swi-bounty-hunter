// data/hunts.csv: one HuntRow per line, money in integer ct, game time in seconds.
// An empty cell is null.
import type { HuntRow } from "./hunts.ts";

const columns = [
  "huntKey",
  "acceptT",
  "endT",
  "durationS",
  "faction",
  "wharf",
  "target",
  "targetMacro",
  "sizeClass",
  "sanction",
  "sanctionCostCt",
  "offeredKillCt",
  "offeredUpToCt",
  "paidKillCt",
  "paidDestructionCt",
  "paidTotalCt",
  "capBeforeCt",
  "capAfterCt",
  "result",
  "failedStep",
  "wingSize",
  "escortsKilled",
  "relations",
  "losses",
  "lossValueCt",
  "repairsCt",
  "netCt",
] as const satisfies readonly (keyof HuntRow)[];

const text = new Set<keyof HuntRow>([
  "huntKey",
  "faction",
  "wharf",
  "target",
  "targetMacro",
  "sizeClass",
  "sanction",
  "result",
  "failedStep",
  "relations",
]);

const quote = (cell: string) => (/[",\n]/.test(cell) ? `"${cell.replace(/"/g, '""')}"` : cell);

export function formatCsv(rows: HuntRow[]): string {
  const lines = [columns.join(","), ...rows.map((row) => columns.map((key) => quote(String(row[key] ?? ""))).join(","))];
  return `${lines.join("\n")}\n`;
}

// Splits CSV text into rows of cells, with quoted cells as formatCsv writes them
function cells(csv: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < csv.length; i++) {
    const char = csv[i];
    if (quoted) {
      if (char === '"' && csv[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (char === '"') quoted = false;
      else cell += char;
    } else if (char === '"') quoted = true;
    else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n") {
      rows.push([...row, cell]);
      row = [];
      cell = "";
    } else if (char !== "\r") cell += char;
  }
  if (cell || row.length) rows.push([...row, cell]);
  return rows;
}

export function parseCsv(csv: string): HuntRow[] {
  const [header, ...rows] = cells(csv);
  if (!header) return [];
  if (header.join(",") !== columns.join(",")) throw new Error("hunts.csv: the header doesn't match this version of hunt-log");
  return rows.map((row) => {
    const record: Record<string, string | number | null> = {};
    columns.forEach((key, i) => {
      const value = row[i] ?? "";
      record[key] = value === "" ? (key === "relations" ? "" : null) : text.has(key) ? value : Number(value);
    });
    return record as HuntRow;
  });
}
