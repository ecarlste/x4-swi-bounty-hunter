// Check 4: every MD diff (an md/*.xml with a <diff> root) targets a script that exists, and each
// sel matches exactly one node there (X4 skips an operation whose sel matches nothing). X4 patches
// by path: md/<name> patches the game's md/<name>; extensions/<folder>/md/<name> patches that
// extension's (SWI's is unpacked at SWI_UNPACKED/ext02, then /ext; a DLC folder sits next to
// X4_UNPACKED). sels are counted with XPath, as X4 reads them: a[@x='y'][2] is the 2nd match.
import type { Document, Element } from "@xmldom/xmldom";
import { existsSync, readFileSync } from "node:fs";
import { basename, dirname, join, relative, sep } from "node:path";
import * as xpath from "xpath";
import { SWI_FOLDER, swiExtDirs } from "./config.ts";
import { parseXml, type Result } from "./files.ts";

// The unpacked MD script the diff at rel (relative to its extension) patches, or null.
// An MD diff in our own md/ only reaches the game's scripts: 8.00 loads a diff named after
// another extension's script as a new script and ignores its <diff> root (T12, 2026-11-02).
export const mdDiffTarget = (rel: string, unpacked: string, swi: string): string | null => {
  const parts = rel.split(sep);
  let bases: string[];
  if (parts.length === 2 && unpacked) bases = [unpacked];
  else if (parts.length === 4 && parts[0] === "extensions")
    bases = parts[1] === SWI_FOLDER ? swiExtDirs(swi) : unpacked ? [join(dirname(unpacked), parts[1])] : [];
  else return null;
  return bases.map((b) => join(b, "md", parts.at(-1)!)).find(existsSync) ?? null;
};

// How many nodes sel selects in doc, or why it can't be counted
export const countSel = (sel: string, doc: Document): number | string => {
  let selected;
  try {
    selected = xpath.select(sel, doc as unknown as Node);
  } catch (e) {
    return `not a valid XPath (${(e as Error).message})`;
  }
  return Array.isArray(selected) ? selected.length : "not a node set";
};

const elementChildren = (el: Element) =>
  Array.from(el.childNodes).filter((n) => n.nodeType === n.ELEMENT_NODE) as Element[];

export const checkMdDiffs = (files: [string, string][], root: string, unpacked: string, swi: string): Result => {
  const notes: string[] = [];
  const bad: string[] = [];
  const targets = new Map<string, Document | string>();
  for (const [ext, f] of files) {
    if (basename(dirname(f)) !== "md") continue;
    let diff;
    try {
      diff = parseXml(readFileSync(f, "utf8")).documentElement!;
    } catch {
      continue; // the well-formed check fails it
    }
    if (diff.tagName !== "diff") continue;
    const rel = relative(root, f);
    const target = mdDiffTarget(relative(ext, f), unpacked, swi);
    if (!target) {
      if (swi || unpacked)
        bad.push(
          `${rel}: no script at this path to patch (an MD diff in md/ only patches the game's own scripts; ` +
            "another extension's goes in extensions/<its folder>/md/)",
        );
      else notes.push(`${rel} not checked: SWI_UNPACKED and X4_UNPACKED not found`);
      continue;
    }
    if (!targets.has(target)) {
      try {
        targets.set(target, parseXml(readFileSync(target, "utf8")));
      } catch (e) {
        targets.set(target, (e as Error).message);
      }
    }
    const doc = targets.get(target)!;
    if (typeof doc === "string") {
      bad.push(`${rel}: ${target} doesn't parse: ${doc}`);
      continue;
    }
    for (const op of elementChildren(diff)) {
      const sel = op.getAttribute("sel") ?? "";
      const count = countSel(sel, doc);
      if (typeof count === "string") {
        bad.push(`${rel}: <${op.tagName} sel="${sel}">: ${count}`);
        continue;
      }
      const line = `${rel}: <${op.tagName} sel="${sel}"> matches ${count} node${count === 1 ? "" : "s"} in ${target}`;
      (count === 1 ? notes : bad).push(line);
    }
  }
  return { notes, bad };
};
