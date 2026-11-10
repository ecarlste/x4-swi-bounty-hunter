import { test } from "node:test";
import assert from "node:assert/strict";
import { checkIds } from "./ids.ts";
import { ext, refs, swi, swi090, unpacked } from "./fixtures.ts";

test("factions come from the unpacked game, its DLC folders (base first) and SWI", () => {
  assert.deepEqual(checkIds("faction", refs.faction, unpacked, swi, [ext]), {
    notes: [
      "faction argon: base/libraries/factions.xml",
      "faction dlcfaction: ego_dlc_test/libraries/factions.xml",
      "faction galempire: ext/libraries/factions.xml",
      "faction shared: base/libraries/factions.xml",
    ],
    bad: ["faction nosuchfaction (in ext/md/refs.xml) not found in factions.xml"],
  });
});

test("wares", () => {
  assert.deepEqual(checkIds("ware", refs.ware, unpacked, swi, [ext]), {
    notes: ["ware energycells: base/libraries/wares.xml"],
    bad: ["ware nosuchware (in ext/md/refs.xml) not found in wares.xml"],
  });
});

test("loadouts come from SWI's ext02 and our own extensions' libraries too", () => {
  assert.deepEqual(checkIds("loadout", refs.loadout, unpacked, swi, [ext]), {
    notes: ["loadout own_loadout: ext/libraries/loadouts.xml", "loadout swi_loadout: ext02/libraries/loadouts.xml"],
    bad: [],
  });
});

test("SWI's ext02 library replaces ext's file of the same name, so an id only ext's has is gone", () => {
  const names = new Map([["ext01_only_loadout", new Set(["ext/md/refs.xml"])]]);
  assert.deepEqual(checkIds("loadout", names, "", swi, []), {
    notes: [],
    bad: ["loadout ext01_only_loadout (in ext/md/refs.xml) not found in loadouts.xml"],
  });
});

test("SWI 0.90, with only ext/, still has its ids", () => {
  const names = new Map([["ext01_only_loadout", new Set(["ext/md/refs.xml"])]]);
  assert.deepEqual(checkIds("loadout", names, "", swi090, []), {
    notes: ["loadout ext01_only_loadout: ext/libraries/loadouts.xml"],
    bad: [],
  });
});

test("SWI alone is enough to check", () => {
  assert.deepEqual(checkIds("faction", refs.faction, "", swi, [ext]).notes, ["faction galempire: ext/libraries/factions.xml"]);
});

test("is skipped without X4_UNPACKED and SWI_UNPACKED, even with our own libraries", () => {
  assert.deepEqual(checkIds("loadout", refs.loadout, "", "", [ext]), {
    notes: ["loadouts not checked: X4_UNPACKED and SWI_UNPACKED not found"],
    bad: [],
  });
});
