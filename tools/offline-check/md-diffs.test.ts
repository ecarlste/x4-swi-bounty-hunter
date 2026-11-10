import { test } from "node:test";
import assert from "node:assert/strict";
import { join } from "node:path";
import { extFiles, fixtures, swi, unpacked } from "./fixtures.ts";
import { checkMdDiffs } from "./md-diffs.ts";

const swiTarget = join(swi, "ext02/md/swi_script.xml");
const swiDiff = "ext/extensions/starwarsmod_m1/md/swi_script.xml";

test("each sel must match one node in the script its path patches", () => {
  const { notes, bad } = checkMdDiffs(extFiles, fixtures, unpacked, swi);
  assert.deepEqual(notes, [
    `ext/extensions/ego_dlc_test/md/dlc_script.xml: <add sel="/mdscript/cues/cue[@name='DlcStart']"> matches 1 node in ${join(fixtures, "unpacked/ego_dlc_test/md/dlc_script.xml")}`,
    // SWI's ext02 overrides ext: only ext02's script has this cue
    `${swiDiff}: <add sel="/mdscript/cues/cue[@name='Ext02Only']/actions/x[@v='b']"> matches 1 node in ${swiTarget}`,
    // Any XPath is followed, an attribute or a // included
    `${swiDiff}: <remove sel="//cue[@name='Second']/@name"> matches 1 node in ${swiTarget}`,
    // A relative sel is read from the document
    `${swiDiff}: <add sel="mdscript/cues"> matches 1 node in ${swiTarget}`,
    `ext/md/vanilla_script.xml: <add sel="/mdscript/cues/cue[@name='Start']/actions"> matches 1 node in ${join(unpacked, "md/vanilla_script.xml")}`,
  ]);
  assert.deepEqual(bad, [
    // XPath, as X4 reads it: the 2nd a in each cue. ElementTree counted 1 here
    `${swiDiff}: <add sel="/mdscript/cues/cue/actions/x[@v='a'][2]"> matches 2 nodes in ${swiTarget}`,
    `${swiDiff}: <add sel="/mdscript/cues/cue[@name='Old']"> matches 0 nodes in ${swiTarget}`,
    `${swiDiff}: <add sel="/mdscript/cues/cue[@name='Second'">: not a valid XPath (XPath parse error)`,
    `${swiDiff}: <add sel="count(//x)">: not a node set`,
    "ext/md/no_such_script.xml: no script at this path to patch (an MD diff in md/ only patches the game's own scripts; another extension's goes in extensions/<its folder>/md/)",
  ]);
});

test("without SWI_UNPACKED, a diff of SWI's script has nothing to patch", () => {
  const { bad } = checkMdDiffs(extFiles, fixtures, unpacked, "");
  assert.ok(bad.includes(`${swiDiff}: no script at this path to patch (an MD diff in md/ only patches the game's own scripts; another extension's goes in extensions/<its folder>/md/)`));
});

test("without either unpacked path, diffs are noted as not checked", () => {
  const { notes, bad } = checkMdDiffs(extFiles, fixtures, "", "");
  assert.deepEqual(bad, []);
  assert.ok(notes.includes("ext/md/vanilla_script.xml not checked: SWI_UNPACKED and X4_UNPACKED not found"));
  assert.equal(notes.length, 4);
});
