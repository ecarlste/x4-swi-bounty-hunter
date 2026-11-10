import { test } from "node:test";
import assert from "node:assert/strict";
import { join } from "node:path";
import { fixtures } from "./fixtures.ts";
import { checkTestList } from "./test-list.ts";

const list = (name: string) => checkTestList(join(fixtures, "test-list", `${name}.xml`));

test("$Tests naming each root cue but Run passes; nested cues don't count", () => {
  assert.deepEqual(list("good"), { notes: ["2 tests listed: Alpha, Beta"], bad: [] });
});

test("a listed test that isn't a root cue, and a root cue left out, both fail", () => {
  assert.deepEqual(list("bad").bad, ["$Tests names Gamma, which is not a root cue", "root cue Beta is not in $Tests"]);
});

test("no $Tests at all fails", () => {
  assert.deepEqual(list("none"), { notes: [], bad: ["md/swibh_tests.xml: no $Tests list"] });
});
