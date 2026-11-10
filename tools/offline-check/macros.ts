// Check 3, macros: each macro named exists in X4 8.00 or SWI. A macro is a "<name>.xml" under a
// macros/ folder of a catalog (.cat) of the install or one of its extensions (a later catalog's
// wins), a <macro name="..."> in a catalog's maps/ files, or one in the unpacked game's libraries
// (character macros). Each found macro prints its class.
import { readFileSync } from "node:fs";
import { basename, dirname, join, relative } from "node:path";
import { catalogs, readCatalog, readEntry } from "./catalog.ts";
import { isDir, list, type Result } from "./files.ts";
import { namedIn, type Names } from "./references.ts";
import { escapeRegExp } from "./regexp.ts";

// Map files bigger than this are skipped: no macro we name lives in one
const MAX_MAP_FILE = 4 * 1024 * 1024;
const macroClass = (text: string, name: string) =>
  new RegExp(`<macro name="${escapeRegExp(name)}" class="([a-z_]+)"`).exec(text)?.[1];

export const checkMacros = (names: Names, install: string, unpacked: string): Result => {
  if (!isDir(install)) return { notes: ["macros not checked: X4_PATH not found"], bad: [] };
  const wanted = [...names.keys()];
  const hits = new Map<string, string>();
  const missing = () => wanted.filter((name) => !hits.has(name));
  for (const cat of catalogs(install)) {
    const where = relative(install, cat);
    for (const entry of readCatalog(cat)) {
      const base = basename(entry.path);
      const name = base.slice(0, -4);
      if (base.endsWith(".xml") && names.has(name) && entry.path.includes("/macros/")) {
        hits.set(name, `${macroClass(readEntry(cat, entry), name) ?? "class unknown"}, ${where}`);
      } else if (entry.path.startsWith("maps/") && entry.path.endsWith(".xml") && entry.size <= MAX_MAP_FILE) {
        const text = readEntry(cat, entry);
        for (const name of missing()) {
          const found = macroClass(text, name);
          if (found) hits.set(name, `${found}, ${where} ${entry.path}`);
        }
      }
    }
  }
  if (isDir(unpacked)) {
    const top = dirname(unpacked);
    const libs = list(top)
      .flatMap((d) => list(join(top, d, "libraries")).filter((n) => n.endsWith(".xml")).map((n) => join(top, d, "libraries", n)))
      .sort();
    for (const lib of libs) {
      const text = readFileSync(lib, "utf8");
      for (const name of missing()) {
        const found = macroClass(text, name);
        if (found) hits.set(name, `${found}, ${relative(top, lib)}`);
      }
    }
  }
  const notes: string[] = [];
  const bad: string[] = [];
  for (const name of wanted.sort()) {
    const hit = hits.get(name);
    if (hit) notes.push(`macro ${name}: ${hit}`);
    else bad.push(`macro ${name} (in ${namedIn(names, name)}) not found in the install or the unpacked libraries`);
  }
  return { notes, bad };
};
