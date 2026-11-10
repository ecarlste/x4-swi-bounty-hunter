// Check 3, factions, wares and loadouts: each id named is in a libraries/<kind>s.xml of the
// unpacked game (vanilla and the DLC folders next to it), of SWI, or of our own extensions.
import { existsSync, readFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { isDir, list, type Result } from "./files.ts";
import { swiExtDirs } from "./config.ts";
import { namedIn, type Kind, type Names } from "./references.ts";

// id -> the first library file (in dirs' order) that defines it
const libraryIds = (dirs: string[], filename: string, element: string): Map<string, string> => {
  const ids = new Map<string, string>();
  const pattern = new RegExp(`<${element} id="([^"]+)"`, "g");
  for (const d of dirs) {
    const lib = join(d, filename);
    if (!existsSync(lib)) continue;
    for (const [, id] of readFileSync(lib, "utf8").matchAll(pattern)) if (!ids.has(id)) ids.set(id, lib);
  }
  return ids;
};

export const checkIds = (
  kind: Exclude<Kind, "macro">,
  names: Names,
  unpacked: string,
  swi: string,
  extensions: string[],
): Result => {
  const dirs: string[] = [];
  if (isDir(unpacked)) {
    const top = dirname(unpacked);
    dirs.push(...list(top).map((d) => join(top, d, "libraries")).filter(isDir).sort());
  }
  dirs.push(...swiExtDirs(swi).map((d) => join(d, "libraries")).filter(isDir));
  if (!dirs.length) return { notes: [`${kind}s not checked: X4_UNPACKED and SWI_UNPACKED not found`], bad: [] };
  // Our extensions' own libraries (the trials' loadouts) count too
  dirs.push(...extensions.map((ext) => join(ext, "libraries")).filter(isDir));
  const ids = libraryIds(dirs, `${kind}s.xml`, kind);
  const notes: string[] = [];
  const bad: string[] = [];
  for (const name of [...names.keys()].sort()) {
    const lib = ids.get(name);
    if (lib) notes.push(`${kind} ${name}: ${lib.split("/").at(-3)}/libraries/${basename(lib)}`);
    else bad.push(`${kind} ${name} (in ${namedIn(names, name)}) not found in ${kind}s.xml`);
  }
  return { notes, bad };
};
