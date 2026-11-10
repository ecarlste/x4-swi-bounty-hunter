# Coding standards: `tools/`

Judgement calls for the TypeScript under `tools/`. Anything mechanical belongs in a check in
`make check`, not here. For how the tooling fits together see [design.md](design.md)
"Repo and tooling"; for decisions see [docs/adr/](docs/adr/).

Out of scope: the X4 XML, Lua and PowerShell sides.

## Languages

TypeScript first, PowerShell only for the Windows side: see
[ADR 0003](docs/adr/0003-typescript-first-fewest-languages.md).

## CLIs (`tools/<name>.ts`)

These rules cover every script a person or `make` runs, including ones inside a module folder,
like `tools/log/generate.ts`.

- Read arguments with `parseArgs` from `node:util`. Don't parse `process.argv` by hand.
- On bad arguments, print a usage line to stderr and exit 2. That includes the error
  `parseArgs` throws for an unknown option (catch it, as `tools/offline-check.ts` does).
- Keep logic in modules under `tools/<name>/`. The CLI file is thin glue: read arguments,
  call the modules, print, set the exit code.

## Paths

A path from `test.config` or the command line goes through `fromWindows`
(`tools/wsl-path.ts`), so a Windows path like `E:\...` works from WSL.

## Modules and tests

- One module per concern (for example one per check in `tools/offline-check/`).
- Tests (`*.test.ts`) and fixtures sit beside the modules they test.
- A CLI with behaviour of its own (argument handling, exit codes, output it assembles) gets a
  CLI-level test that runs it, like `tools/<name>/cli.test.ts`.

## Dependencies

- devDependencies use `^` ranges in `package.json`; `package-lock.json` does the pinning.
  npm only changes locked versions when `package.json` changes, and CI's `npm ci` installs
  exactly the locked versions. On a 0.x version `^` is narrow: `^0.9.12` stays in 0.9.x and
  `^0.0.36` allows only 0.0.36.
- Commit `package-lock.json` with any change to `package.json`.
