# TypeScript first, and as few languages as possible

Date: 2026-11-10. Status: accepted.

Scripts and automated tests are written in TypeScript wherever it's an appropriate choice (Node runs `.ts` directly). Where it isn't, we use the best-fitting language, preferring one the repo already uses over adding another, so that no language is in the repo without a reason. Each language has one job:

| Language | Job | Why not TypeScript |
|---|---|---|
| TypeScript | Tools and tests on the WSL side (`tools/**`) | The default |
| PowerShell | Anything that runs on Windows next to X4: the game-test and trials runners, .NET's XSD validator, the runner's own checks | Node isn't installed on the Windows side |
| Lua, X4 XML (MD, AI scripts, libraries, diffs) | The extensions themselves | X4 decides these |
| Make, shell | Glue only: Makefile targets, `.githooks` | Logic belongs in a TypeScript tool |
| YAML | Glue only: GitHub Actions workflows (`.github/workflows/*.yml`) | GitHub Actions only reads YAML. A workflow sets up the runner and calls a Makefile target, so the step list lives in the Makefile |

`research/` is exempt. Its scripts (Python, awk) are archived evidence that research notes cite, not tooling. If one is needed again, port it to TypeScript before you rerun it.

A test in `make check` fails on any tracked file whose language isn't on this list, outside `research/`. To add a language, amend this ADR and the test's allowlist in the same PR, and say why no listed language fits.

## Consequences

- Python's standard library has a strict XML parser and XPath, and Node has neither. Porting `tools/check_game_tests.py` adds three devDependencies: saxes for well-formedness (it rejects what expat rejects, but `@xmldom/xmldom` alone is laxer), `@xmldom/xmldom` for the DOM, and `xpath` for matching MD-diff `sel`s. XPath also fixes a miscount: ElementTree reads `a[@x='y'][2]` as "matches and is the 2nd `a`", while XPath, and X4, read it as "the 2nd match".
- This replaces design.md's earlier rule that `check_game_tests.py` would stay in Python until its next real change.
- Amended 2026-11-10 (#99): YAML joins the glue row for the CI workflow. GitHub Actions has no other config language, and the workflow holds no logic: it installs Node and Lua and runs `make check-linux`, the same target `make check` runs. The allowlist takes `.yml` only under `.github/workflows/`.
