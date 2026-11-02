// Updates the hunt log in a data folder from one debug log:
// - hunts.csv: finished hunts, added once each (by hunt key) and never changed after;
// - hunts-open.jsonl: the log entries of hunts still open, carried over to the next run;
// - hunts-summary.md: rebuilt from both;
// - hunts-read.txt: the SHA-256 of each log read, so reading one again changes nothing.
import { createHash } from "node:crypto";
import { appendFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { formatCsv, parseCsv } from "./csv.ts";
import { readHunts, type Entry, type Hunts } from "./hunts.ts";
import { renderSummary } from "./summary.ts";

export type Update = {
  // Hunts added to hunts.csv by this run
  added: number;
  // Hunts open after this run
  open: number;
  // This exact log was read before, so nothing was written
  alreadyRead: boolean;
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

  // Hashed as it's read. A log read again would replay its old loads over the
  // carried-over open hunts and undo the newer ones, so it's not applied at all
  const hash = createHash("sha256");
  async function* hashed() {
    for await (const line of lines) {
      hash.update(`${line}\n`);
      yield line;
    }
  }
  const hunts = await readHunts(hashed(), { carried });
  const digest = hash.digest("hex");
  const readPath = join(dataDir, "hunts-read.txt");
  if (readText(readPath).split("\n").includes(digest)) {
    const open = new Set(carried.flatMap((entry) => ("hunt" in entry.event ? [entry.event.hunt] : [])));
    return { added: 0, open: open.size, alreadyRead: true, lossesOutside: [], errors: hunts.errors };
  }

  const added = hunts.rows.filter((row) => !keys.has(row.huntKey));
  const open = hunts.open.filter((hunt) => !keys.has(hunt.huntKey));
  const rows = [...recorded, ...added];

  writeFileSync(csvPath, formatCsv(rows));
  writeFileSync(openPath, open.flatMap((hunt) => hunt.entries.map((entry) => `${JSON.stringify(entry)}\n`)).join(""));
  writeFileSync(join(dataDir, "hunts-summary.md"), renderSummary(rows, open));
  appendFileSync(readPath, `${digest}\n`);

  return {
    added: added.length,
    open: open.length,
    alreadyRead: false,
    lossesOutside: hunts.lossesOutside,
    errors: hunts.errors,
  };
}
