import { test } from "node:test";
import assert from "node:assert/strict";
import { refs } from "./fixtures.ts";
import type { Names } from "./references.ts";

const names = (n: Names) => [...n.keys()].sort();

test("finds each kind of reference, but not in comments, variables or properties", () => {
  assert.deepEqual(names(refs.macro), ["character_test_macro", "galaxy_test_macro", "missing_macro", "noclass_macro", "ship_test_macro"]);
  // faction.player is a keyword; $faction.id is a property
  assert.deepEqual(names(refs.faction), ["argon", "dlcfaction", "galempire", "nosuchfaction", "shared"]);
  assert.deepEqual(names(refs.ware), ["energycells", "nosuchware"]);
  assert.deepEqual(names(refs.loadout), ["own_loadout", "swi_loadout"]);
});

test("records every file naming a reference", () => {
  assert.deepEqual([...refs.macro.get("ship_test_macro")!].sort(), ["ext/libraries/loadouts.xml", "ext/md/refs.xml"]);
});
