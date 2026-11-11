// Adds the hunts in a debuglog.txt to data/hunts.csv and rebuilds data/hunts-summary.md.
// Usage: node tools/hunt-log.ts <debuglog.txt> [--data <folder>]
//
// Run it after each play session: X4 rewrites debuglog.txt at each launch. Hunts
// already in hunts.csv are skipped, so running it twice on one log adds nothing.
import { createReadStream, mkdirSync } from "node:fs";
import { join } from "node:path";
import { createInterface } from "node:readline";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { updateHuntLog } from "./hunt-log/update.ts";
import { fromWindows } from "./wsl-path.ts";

const usage = "Usage: node tools/hunt-log.ts <debuglog.txt> [--data <folder>]";

let parsed;
try {
  parsed = parseArgs({ allowPositionals: true, options: { data: { type: "string" } } });
} catch (e) {
  console.error(`${(e as Error).message}\n${usage}`);
  process.exit(2);
}
const { positionals, values } = parsed;
if (positionals.length !== 1) {
  console.error(usage);
  process.exit(2);
}

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

const logPath = fromWindows(positionals[0]);
const dataDir = values.data !== undefined ? fromWindows(values.data) : fileURLToPath(new URL("../data", import.meta.url));
mkdirSync(dataDir, { recursive: true });

const file = createReadStream(logPath);
const lines = createInterface({ input: file, crlfDelay: Infinity });
try {
  const update = await updateHuntLog(lines, dataDir);
  if (update.alreadyRead) {
    process.stdout.write(`Already read this log; nothing changed. ${update.open} open.\n`);
    process.exit(0);
  }
  const out = [`Added ${plural(update.added, "hunt")} to ${join(dataDir, "hunts.csv")}; ${update.open} open.`];
  if (update.lossesOutside.length) {
    const ships = update.lossesOutside.map((loss) => `${loss.data.lost.idcode} at ${loss.t}`).join(", ");
    out.push(`${plural(update.lossesOutside.length, "ship")} lost outside any hunt: ${ships}.`);
  }
  if (update.errors.length) {
    const errors = update.errors.map(({ line, error }) => `line ${line}: ${error}`).join("; ");
    out.push(`${plural(update.errors.length, "bad [swibh] line")}: ${errors}`);
  }
  out.push(`Summary: ${join(dataDir, "hunts-summary.md")}`);
  process.stdout.write(`${out.join("\n")}\n`);
} finally {
  lines.close();
  file.destroy();
}
