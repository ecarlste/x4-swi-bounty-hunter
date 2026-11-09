// Prints the M-rung loadout trials' results table (one row per fight) from a debuglog.txt
// written with the trials extension installed (tests/game/swibh_trials, tests/game/trials.md).
// Usage: node tools/trial-log.ts <debuglog.txt>
import { readFileSync } from "node:fs";
import { resultsTable } from "./trial-log/table.ts";
import { readTrials } from "./trial-log/trials.ts";

if (process.argv.length !== 3) {
  console.error("Usage: node tools/trial-log.ts <debuglog.txt>");
  process.exit(2);
}

// E:\path\debuglog.txt -> /mnt/e/path/debuglog.txt when run from WSL, as test.config allows
const arg = process.argv[2];
const path =
  process.platform === "linux" && /^[A-Za-z]:[\\/]/.test(arg)
    ? `/mnt/${arg[0].toLowerCase()}/${arg.slice(3).replace(/\\/g, "/")}`
    : arg;

const { fights, errors } = readTrials(readFileSync(path, "utf8").split(/\r?\n/));
process.stdout.write(fights.length ? resultsTable(fights) : "No fights in this log.\n");
if (errors.length) {
  const list = errors.map((e) => `line ${e.line}: ${e.error}`).join("; ");
  process.stderr.write(`${errors.length} bad [swibh-trial] line${errors.length === 1 ? "" : "s"}: ${list}\n`);
}
