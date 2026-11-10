// What every check returns, and the file listings and XML parsing they share.
import { DOMParser, type Document } from "@xmldom/xmldom";
import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

// Lines to print under a check's title: notes are fine, bad ones fail the check
export type Result = { notes: string[]; bad: string[] };

export const isDir = (path: string) => !!path && existsSync(path) && statSync(path).isDirectory();

// Names in a folder, without hidden ones (as a shell glob lists them); [] if it isn't a folder
export const list = (dir: string): string[] =>
  isDir(dir) ? readdirSync(dir).filter((name) => !name.startsWith(".")) : [];

// Every *.xml under dir, at any depth, sorted by path
export const xmlFiles = (dir: string): string[] => {
  const found: string[] = [];
  const walk = (d: string) => {
    for (const name of list(d)) {
      const path = join(d, name);
      if (isDir(path)) walk(path);
      else if (name.endsWith(".xml")) found.push(path);
    }
  };
  walk(dir);
  return found.sort();
};

// [extension folder, file] for each XML file in each extension
export const extensionFiles = (extensions: string[]): [string, string][] =>
  extensions.flatMap((ext) => xmlFiles(ext).map((f): [string, string] => [ext, f]));

// A DOM of text, throwing on any parse error or warning. It's laxer than the well-formed check,
// so use it on files that check has passed or on the game's own files.
export const parseXml = (text: string): Document => {
  const doc = new DOMParser({
    onError: (level, message) => {
      throw new Error(`${level}: ${message}`);
    },
  }).parseFromString(text, "text/xml");
  if (!doc.documentElement) throw new Error("no root element");
  return doc;
};
