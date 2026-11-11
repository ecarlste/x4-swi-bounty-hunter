// Writes the MD library for log events from the log schema, or checks it's up to date.
// Usage: node tools/log/generate.ts [--check] [--out <path>]
//   --check  exit 1 if the file differs from what the schema generates; write nothing
//   --out    the file, default extension/swibh/md/swibh_log.xml
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { fromWindows } from "../wsl-path.ts";
import { generateLibrary } from "./md.ts";

const defaultOut = fileURLToPath(new URL("../../extension/swibh/md/swibh_log.xml", import.meta.url));

const usage = "Usage: node tools/log/generate.ts [--check] [--out <path>]";

let values;
try {
  ({ values } = parseArgs({
    options: { check: { type: "boolean", default: false }, out: { type: "string", default: defaultOut } },
  }));
} catch (e) {
  console.error(`${(e as Error).message}\n${usage}`);
  process.exit(2);
}
const out = fromWindows(values.out);
const xml = generateLibrary();

if (values.check) {
  let current: string | undefined;
  try {
    current = readFileSync(out, "utf8");
  } catch {}
  if (current !== xml) {
    console.error(`${out} is out of date with tools/log/schema.ts: run make log-xml`);
    process.exit(1);
  }
} else {
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, xml);
}
