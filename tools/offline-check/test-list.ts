// Check 2: every test named in the test extension's $Tests is a root cue, and every root test cue
// (all but Run) is listed.
import { readFileSync } from "node:fs";
import type { Element } from "@xmldom/xmldom";
import { parseXml, type Result } from "./files.ts";

export const checkTestList = (mdFile: string): Result => {
  let doc;
  try {
    doc = parseXml(readFileSync(mdFile, "utf8"));
  } catch (e) {
    return { notes: [], bad: [`md/swibh_tests.xml: ${(e as Error).message}`] };
  }
  const cues = doc.getElementsByTagName("cues")[0];
  const roots = cues
    ? Array.from(cues.childNodes)
        .filter((n) => n.nodeType === n.ELEMENT_NODE && n.nodeName === "cue")
        .map((n) => (n as Element).getAttribute("name") ?? "")
    : [];
  let tests: string[] | null = null;
  for (const node of Array.from(doc.getElementsByTagName("set_value"))) {
    if (node.getAttribute("name") === "$Tests") {
      tests = (node.getAttribute("exact") ?? "")
        .replace(/^[[\]]+|[[\]]+$/g, "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    }
  }
  if (tests === null) return { notes: [], bad: ["md/swibh_tests.xml: no $Tests list"] };
  const listed = tests;
  const bad = [
    ...listed.filter((t) => !roots.includes(t)).map((t) => `$Tests names ${t}, which is not a root cue`),
    ...roots.filter((c) => !listed.includes(c) && c !== "Run").map((c) => `root cue ${c} is not in $Tests`),
  ];
  return { notes: [`${listed.length} tests listed: ${listed.join(", ")}`], bad };
};
