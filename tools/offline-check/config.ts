// test.config values for the offline checks, and the Windows form of a path for the PowerShell checks.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fromWindows } from "../wsl-path.ts";
import { escapeRegExp } from "./regexp.ts";

// Python's str.strip(chars): drop any of chars from both ends
const stripChars = (s: string, chars: string) => {
  let start = 0;
  let end = s.length;
  while (start < end && chars.includes(s[start])) start++;
  while (end > start && chars.includes(s[end - 1])) end--;
  return s.slice(start, end);
};

// A KEY="value" setting from the environment, or else root/test.config (the last line naming it),
// as a WSL path. "" when it's set in neither.
export const configValue = (key: string, root: string, env: NodeJS.ProcessEnv = process.env): string => {
  let value = env[key] ?? "";
  const path = join(root, "test.config");
  if (!value && existsSync(path)) {
    const pattern = new RegExp(`^\\s*${escapeRegExp(key)}\\s*=\\s*(.*)$`);
    for (const line of readFileSync(path, "utf8").split(/\r\n|\r|\n/)) {
      const m = pattern.exec(line);
      if (m) value = stripChars(stripChars(m[1].trim(), '"'), "'");
    }
  }
  return fromWindows(value);
};

// A WSL path as Windows sees it (wslpath -w)
export const windowsPath = (path: string): string =>
  execFileSync("wslpath", ["-w", path], { encoding: "utf8" }).trim();

// SWI's mod folder under extensions/, as X4 names it in a diff's path
export const SWI_FOLDER = "starwarsmod_m1";

// SWI's unpacked catalogs, the one X4 loads last first: 0.91 moved its scripts and libraries from
// ext_01 (ext/) to ext_02 (ext02/), and a later catalog overrides an earlier one
export const swiExtDirs = (swi: string): string[] =>
  swi ? [join(swi, "ext02"), join(swi, "ext")].filter((d) => existsSync(d) && statSync(d).isDirectory()) : [];
