// Check 1: every XML file is well-formed by a strict parser (X4 skips a file it can't parse).
// Strict UTF-8 decoding, then saxes, rejects what expat rejects; xmldom alone is laxer
// (research/xml-parsers-for-typescript.md).
import { readFileSync } from "node:fs";
import { relative } from "node:path";
import { SaxesParser } from "saxes";
import type { Result } from "./files.ts";

// Why the bytes aren't well-formed XML, or null if they are
export const wellFormedError = (bytes: Uint8Array): string | null => {
  let text: string;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return "not valid UTF-8";
  }
  const parser = new SaxesParser({ xmlns: true });
  parser.on("error", (e) => {
    throw e;
  });
  try {
    parser.write(text).close();
  } catch (e) {
    return (e as Error).message;
  }
  return null;
};

export const checkWellFormed = (files: [string, string][], root: string): Result => {
  const bad: string[] = [];
  for (const [, f] of files) {
    const error = wellFormedError(readFileSync(f));
    if (error) bad.push(`${relative(root, f)}: ${error}`);
  }
  return { notes: [`${files.length} XML files well-formed`], bad };
};
