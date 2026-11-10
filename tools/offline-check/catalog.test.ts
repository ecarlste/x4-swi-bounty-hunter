import { test } from "node:test";
import assert from "node:assert/strict";
import { join } from "node:path";
import { catalogs, readCatalog, readEntry } from "./catalog.ts";
import { install } from "./fixtures.ts";

test("lists the install's NN.cat, then each extension's, without _sig.cat", () => {
  assert.deepEqual(catalogs(install), [join(install, "01.cat"), join(install, "extensions/ego_dlc_test/ext_01.cat")]);
});

test("reads each entry's offset into the .dat, a path with a space included", () => {
  const cat = join(install, "01.cat");
  const entries = readCatalog(cat);
  assert.deepEqual(
    entries.map((e) => e.path),
    [
      "md/filler.xml",
      "assets/units/size_s/macros/ship_test_macro.xml",
      "assets/props/macros/noclass_macro.xml",
      "maps/test universe/galaxy.xml",
    ],
  );
  assert.equal(readEntry(cat, entries[0]), '<mdscript name="Filler"/>\n');
  assert.equal(readEntry(cat, entries[3]), '<macros><macro name="galaxy_test_macro" class="galaxy"/></macros>\n');
});
