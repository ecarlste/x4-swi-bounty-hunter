// The macros, factions, wares and loadouts the extensions name, each with the files naming it.
// Read from the text (comments removed) rather than the DOM: names sit in attribute values and
// in MD expressions alike.
import { readFileSync } from "node:fs";
import { relative } from "node:path";

export type Kind = "macro" | "faction" | "ware" | "loadout";
// name -> the files (relative to the repo) that name it
export type Names = Map<string, Set<string>>;

// Names that look like references but aren't ids to look up
const FACTION_KEYWORDS = new Set(["player", "ownerless"]);

// (?<![$.\w]) skips a variable or property such as $faction.id or $x.ware.id
const PATTERNS: Record<Kind, RegExp[]> = {
  macro: [/\bmacro="([a-z0-9_]+_macro)"/g, /\b(?:galaxy|sector|zone)="([a-z0-9_]+_macro)"/g, /\bmacro\.([a-z0-9_]+_macro)\b/g],
  faction: [/(?<![$.\w])faction\.([a-z0-9_]+)\b/g, /\bfaction="([a-z0-9_]+)"/g],
  ware: [/(?<![$.\w])ware\.([a-z0-9_]+)\b/g, /\bware="([a-z0-9_]+)"/g],
  loadout: [/<loadout ref="([A-Za-z0-9_]+)"/g],
};

export const references = (files: [string, string][], root: string): Record<Kind, Names> => {
  const found: Record<Kind, Names> = { macro: new Map(), faction: new Map(), ware: new Map(), loadout: new Map() };
  for (const [, f] of files) {
    const rel = relative(root, f);
    const text = readFileSync(f, "utf8").replace(/<!--[\s\S]*?-->/g, "");
    for (const kind of Object.keys(PATTERNS) as Kind[]) {
      for (const pattern of PATTERNS[kind]) {
        for (const [, name] of text.matchAll(pattern)) {
          if (kind === "faction" && FACTION_KEYWORDS.has(name)) continue;
          const where = found[kind].get(name) ?? new Set();
          found[kind].set(name, where.add(rel));
        }
      }
    }
  }
  return found;
};

// "a, b" for the files naming a name, for a FAIL line
export const namedIn = (names: Names, name: string) => [...(names.get(name) ?? [])].sort().join(", ");
