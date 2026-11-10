// Offline checks for the in-game test extension (tests/game/swibh_tests), the swibh extension
// (extension/swibh) and the trials extension (tests/game/swibh_trials), no game needed. The test
// list is the test extension's; the other checks cover all three:
//
// - every XML file is well-formed (offline-check/well-formed.ts);
// - every test in $Tests is a root cue and the other way round (offline-check/test-list.ts);
// - every macro, faction, ware and loadout named exists in X4 8.00, SWI or our own libraries
//   (offline-check/macros.ts, offline-check/ids.ts);
// - every MD diff targets a script that exists, and each sel matches one node (offline-check/md-diffs.ts).
//
// Reads the game's and SWI's files as data only. Paths come from the environment or test.config:
// X4_PATH (the 8.00 install), X4_UNPACKED (unpacked vanilla 8.00, the folder with libraries/md.xsd;
// DLC folders next to it are read too), SWI_UNPACKED (SWI's unpacked reference, with ext02/ or ext/).
// Each part is skipped with a note when its path isn't available.
//
//   node tools/offline-check.ts                     # run the checks
//   node tools/offline-check.ts --get KEY           # print a test.config value as a WSL path
//   node tools/offline-check.ts --get-windows KEY   # ...and as Windows sees it
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { configValue, windowsPath } from "./offline-check/config.ts";
import { extensionFiles, type Result } from "./offline-check/files.ts";
import { checkIds } from "./offline-check/ids.ts";
import { checkMacros } from "./offline-check/macros.ts";
import { checkMdDiffs } from "./offline-check/md-diffs.ts";
import { references } from "./offline-check/references.ts";
import { checkTestList } from "./offline-check/test-list.ts";
import { checkWellFormed } from "./offline-check/well-formed.ts";

const root = fileURLToPath(new URL("..", import.meta.url)).replace(/\/$/, "");
const testExtension = join(root, "tests", "game", "swibh_tests");
const extensions = [testExtension, join(root, "extension", "swibh"), join(root, "tests", "game", "swibh_trials")];

const args = process.argv.slice(2);
if (args.length === 2 && (args[0] === "--get" || args[0] === "--get-windows")) {
  const value = configValue(args[1], root);
  console.log(value && args[0] === "--get-windows" ? windowsPath(value) : value);
  process.exit(value ? 0 : 1);
}

const [install, unpacked, swi] = ["X4_PATH", "X4_UNPACKED", "SWI_UNPACKED"].map((key) => configValue(key, root));
const files = extensionFiles(extensions);
const refs = references(files, root);
const checks: [string, () => Result][] = [
  ["Well-formed XML", () => checkWellFormed(files, root)],
  ["Test list", () => checkTestList(join(testExtension, "md", "swibh_tests.xml"))],
  ["Macros", () => checkMacros(refs.macro, install, unpacked)],
  ["Factions", () => checkIds("faction", refs.faction, unpacked, swi, extensions)],
  ["Wares", () => checkIds("ware", refs.ware, unpacked, swi, extensions)],
  ["Loadouts", () => checkIds("loadout", refs.loadout, unpacked, swi, extensions)],
  ["MD diffs", () => checkMdDiffs(files, root, unpacked, swi)],
];
let failed = false;
for (const [title, check] of checks) {
  const { notes, bad } = check();
  console.log(`${title}: ${bad.length ? "FAIL" : "ok"}`);
  for (const line of notes) console.log(`  ${line}`);
  for (const line of bad) console.log(`  FAIL ${line}`);
  failed ||= bad.length > 0;
}
console.log(`Offline checks ${failed ? "FAILED" : "passed"}`);
process.exitCode = failed ? 1 : 0;
