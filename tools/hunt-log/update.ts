// Updates the hunt log in a data folder from one debug log:
// - hunts.csv: finished hunts, added once each (by hunt key) and never changed after;
// - hunts-open.jsonl: the log entries of hunts still open, carried over to the next run;
// - hunts-summary.md: rebuilt from both.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { formatCsv, parseCsv } from "./csv.ts";
import { readHunts, type Entry, type Hunts } from "./hunts.ts";
import { renderSummary } from "./summary.ts";

export type Update = {
  // Hunts added to hunts.csv by this run
  added: number;
  // Hunts open after this run
  open: number;
  lossesOutside: Hunts["lossesOutside"];
  errors: Hunts["errors"];
};

const readText = (path: string) => (existsSync(path) ? readFileSync(path, "utf8") : "");

export async function updateHuntLog(lines: Iterable<string> | AsyncIterable<string>, dataDir: string): Promise<Update> {
  const csvPath = join(dataDir, "hunts.csv");
  const openPath = join(dataDir, "hunts-open.jsonl");

  const recorded = parseCsv(readText(csvPath));
  const keys = new Set(recorded.map((row) => row.huntKey));
  const carried = readText(openPath)
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line) as Entry);

  const hunts = await readHunts(lines, { carried });
  const added = hunts.rows.filter((row) => !keys.has(row.huntKey));
  const open = hunts.open.filter((hunt) => !keys.has(hunt.huntKey));
  const rows = [...recorded, ...added];

  writeFileSync(csvPath, formatCsv(rows));
  writeFileSync(openPath, open.flatMap((hunt) => hunt.entries.map((entry) => `${JSON.stringify(entry)}\n`)).join(""));
  writeFileSync(join(dataDir, "hunts-summary.md"), renderSummary(rows, open));

  return { added: added.length, open: open.length, lossesOutside: hunts.lossesOutside, errors: hunts.errors };
}
