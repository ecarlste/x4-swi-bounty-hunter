// Prints the M-rung trials' results table (one row per fight) from a debuglog.txt written with
// the trials extension installed (tests/game/swibh_trials, tests/game/trials.md).
// Usage: node tools/trial-log.ts <debuglog.txt>
import { readFileSync } from "node:fs";
import { parseArgs } from "node:util";
import { resultsTable } from "./trial-log/table.ts";
import { readTrials } from "./trial-log/trials.ts";
import { fromWindows } from "./wsl-path.ts";

const { positionals } = parseArgs({ allowPositionals: true, options: {} });
if (positionals.length !== 1) {
  console.error("Usage: node tools/trial-log.ts <debuglog.txt>");
  process.exit(2);
}

const { fights, errors } = readTrials(readFileSync(fromWindows(positionals[0]), "utf8").split(/\r?\n/));
process.stdout.write(fights.length ? resultsTable(fights) : "No fights in this log.\n");
if (errors.length) {
  const list = errors.map((e) => `line ${e.line}: ${e.error}`).join("; ");
  process.stderr.write(`${errors.length} bad [swibh-trial] line${errors.length === 1 ? "" : "s"}: ${list}\n`);
}
