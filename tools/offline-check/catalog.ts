// Reading X4's catalogs: NN.cat lists "<path> <size> <timestamp> <md5>" per file, and NN.dat
// holds the files back to back in that order.
import { closeSync, openSync, readFileSync, readSync } from "node:fs";
import { join } from "node:path";
import { list } from "./files.ts";

export type Entry = { path: string; offset: number; size: number };

// The install's NN.cat files, then each extension's, without the _sig.cat signatures
export const catalogs = (install: string): string[] => {
  const cats = list(install)
    .filter((name) => /^[0-9]{2}\.cat$/.test(name))
    .map((name) => join(install, name))
    .sort();
  const extensions = join(install, "extensions");
  const extCats = list(extensions)
    .flatMap((ext) => list(join(extensions, ext)).filter((n) => n.endsWith(".cat")).map((n) => join(extensions, ext, n)))
    .sort();
  return [...cats, ...extCats].filter((cat) => !cat.endsWith("_sig.cat"));
};

// The entries of a .cat. A path can hold spaces, so the last three fields are split off the end
export const readCatalog = (cat: string): Entry[] => {
  const entries: Entry[] = [];
  let offset = 0;
  for (const line of readFileSync(cat, "utf8").split(/\r\n|\r|\n/)) {
    const parts = line.split(" ");
    if (parts.length < 4) continue;
    const size = Number(parts[parts.length - 3]);
    entries.push({ path: parts.slice(0, -3).join(" "), offset, size });
    offset += size;
  }
  return entries;
};

// One entry's text from the .dat next to the .cat
export const readEntry = (cat: string, { offset, size }: Entry): string => {
  const fd = openSync(`${cat.slice(0, -4)}.dat`, "r");
  try {
    const buf = Buffer.alloc(size);
    const read = readSync(fd, buf, 0, size, offset);
    return buf.subarray(0, read).toString("utf8");
  } finally {
    closeSync(fd);
  }
};
