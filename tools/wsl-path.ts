// E:\path\debuglog.txt -> /mnt/e/path/debuglog.txt when run from WSL, as test.config allows.
// Other paths, and every path on other platforms, are returned unchanged.
export const fromWindows = (path: string): string =>
  process.platform === "linux" && /^[A-Za-z]:[\\/]/.test(path)
    ? `/mnt/${path[0].toLowerCase()}/${path.slice(3).replace(/\\/g, "/")}`
    : path;
