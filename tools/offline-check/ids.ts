// Check 3, factions, wares and loadouts: each id named is in a libraries/<kind>s.xml of the
// unpacked game (vanilla and the DLC folders next to it), of SWI, or of our own extensions.
import { existsSync, readFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { isDir, list, type Result } from "./files.ts";
import { swiExtDirs, swiFile } from "./config.ts";
import { namedIn, type Kind, type Names } from "./references.ts";

// id -> the first library file (in libs' order) that defines it
const libraryIds = (libs: string[], element: string): Map<string, string> => {
  const ids = new Map<string, string>();
  const pattern = new RegExp(`<${element} id="([^"]+)"`, "g");
  for (const lib of libs) {
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
  const filename = `${kind}s.xml`;
  const gameDirs: string[] = [];
  if (isDir(unpacked)) {
    const top = dirname(unpacked);
    gameDirs.push(...list(top).map((d) => join(top, d, "libraries")).filter(isDir).sort());
  }
  if (!gameDirs.length && !swiExtDirs(swi).some((d) => isDir(join(d, "libraries"))))
    return { notes: [`${kind}s not checked: X4_UNPACKED and SWI_UNPACKED not found`], bad: [] };
  const libs = gameDirs.map((d) => join(d, filename));
  // SWI's one file at this path: ext02's replaces ext's
  const swiLib = swiFile(swi, join("libraries", filename));
  if (swiLib) libs.push(swiLib);
  // Our extensions' own libraries (the trials' loadouts) count too
  libs.push(...extensions.map((ext) => join(ext, "libraries", filename)));
  const ids = libraryIds(libs, kind);
  const notes: string[] = [];
  const bad: string[] = [];
  for (const name of [...names.keys()].sort()) {
    const lib = ids.get(name);
    if (lib) notes.push(`${kind} ${name}: ${lib.split("/").at(-3)}/libraries/${basename(lib)}`);
    else bad.push(`${kind} ${name} (in ${namedIn(names, name)}) not found in ${kind}s.xml`);
  }
  return { notes, bad };
};
