import { test } from "node:test";
import assert from "node:assert/strict";
import { install, refs, unpacked } from "./fixtures.ts";
import { checkMacros } from "./macros.ts";

test("finds macros in catalogs (a later one wins), map files and unpacked libraries", () => {
  assert.deepEqual(checkMacros(refs.macro, install, unpacked), {
    notes: [
      "macro character_test_macro: npc, base/libraries/character_macros.xml",
      "macro galaxy_test_macro: galaxy, 01.cat maps/test universe/galaxy.xml",
      "macro noclass_macro: class unknown, 01.cat",
      "macro ship_test_macro: ship_m, extensions/ego_dlc_test/ext_01.cat",
    ],
    bad: ["macro missing_macro (in ext/md/refs.xml) not found in the install or the unpacked libraries"],
  });
});

test("without the unpacked libraries, a character macro isn't found", () => {
  assert.ok(checkMacros(refs.macro, install, "").bad.some((line) => line.startsWith("macro character_test_macro ")));
});

test("is skipped without X4_PATH", () => {
  assert.deepEqual(checkMacros(refs.macro, "", unpacked), { notes: ["macros not checked: X4_PATH not found"], bad: [] });
});
