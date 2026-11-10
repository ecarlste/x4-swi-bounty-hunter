// Paths into tools/offline-check/fixtures for the tests: a fake install (catalogs), unpacked game
// and SWI folders, and a fake extension (ext) that names things in them and diffs their scripts.
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { extensionFiles } from "./files.ts";
import { references } from "./references.ts";

export const fixtures = fileURLToPath(new URL("fixtures", import.meta.url));
export const install = join(fixtures, "install");
export const unpacked = join(fixtures, "unpacked", "base");
export const swi = join(fixtures, "swi");
export const ext = join(fixtures, "ext");
export const extFiles = extensionFiles([ext]);
export const refs = references(extFiles, fixtures);
