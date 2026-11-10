import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { xmlFiles } from "./files.ts";
import { fixtures } from "./fixtures.ts";
import { checkWellFormed, wellFormedError } from "./well-formed.ts";

// Each fixtures/malformed file is one kind of error expat (the Python check's parser) rejects
for (const file of xmlFiles(join(fixtures, "malformed"))) {
  test(`rejects malformed/${file.split("/").at(-1)}`, () => {
    assert.notEqual(wellFormedError(readFileSync(file)), null);
  });
}

for (const file of xmlFiles(join(fixtures, "well-formed"))) {
  test(`accepts well-formed/${file.split("/").at(-1)}`, () => {
    assert.equal(wellFormedError(readFileSync(file)), null);
  });
}

test("a bad file fails the check, named relative to the repo, with the parser's reason", () => {
  const dir = join(fixtures, "malformed");
  const result = checkWellFormed([[dir, join(dir, "mismatched_close.xml")], [dir, join(dir, "bad_utf8.xml")]], fixtures);
  assert.deepEqual(result, {
    notes: ["2 XML files well-formed"],
    bad: ["malformed/mismatched_close.xml: 1:7: unexpected close tag.", "malformed/bad_utf8.xml: not valid UTF-8"],
  });
});
