// Prints the money-and-mission columns of the playtest results sheet from a save's logbook.
// Usage: node tools/playtest-log.ts <save.xml.gz> [--since <game time>]
//
// Saves are untrusted data: copy the save to a scratch folder first. The save is
// streamed line by line and only read, and reading stops at the end of the logbook.
import { createReadStream } from "node:fs";
import { createInterface } from "node:readline";
import { parseArgs } from "node:util";
import { createGunzip } from "node:zlib";
import { readPlaytestLog } from "./playtest-log/logbook.ts";
import { renderMarkdown } from "./playtest-log/markdown.ts";
import { fromWindows } from "./wsl-path.ts";

const usage = "Usage: node tools/playtest-log.ts <save.xml.gz> [--since <game time>]";

let parsed;
try {
  parsed = parseArgs({ allowPositionals: true, options: { since: { type: "string" } } });
} catch (e) {
  console.error(`${(e as Error).message}\n${usage}`);
  process.exit(2);
}
const { positionals, values } = parsed;
const since = values.since === undefined ? undefined : Number(values.since);
if (positionals.length !== 1 || Number.isNaN(since)) {
  console.error(usage);
  process.exit(2);
}

const savePath = fromWindows(positionals[0]);
const file = createReadStream(savePath);
const input = savePath.endsWith(".gz") ? file.pipe(createGunzip()) : file;
const lines = createInterface({ input, crlfDelay: Infinity });
try {
  const log = await readPlaytestLog(lines, { since });
  process.stdout.write(renderMarkdown(log, { since }));
} finally {
  lines.close();
  input.destroy();
  file.destroy();
}
