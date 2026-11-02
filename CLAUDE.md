# SWI Bounty Hunter

## Start here

Read HANDOFF.md first, then the docs it links (concept.md, design.md, mods.md,
bounty-research.md, test-plan.md, tests/game/README.md). Read research/ only as needed.

- Keep the main session's context low: send heavy reading, research and test runs to
  background subagents that write findings into repo files and reply with short summaries.
- Record every finding in the repo docs so work survives a session handoff.
- Ask before `make game-test` or `make install`: X4 must be closed.
- Commit or push only when the user asks. The repo is public: https://github.com/ecarlste/x4-swi-bounty-hunter
- New scripts in TypeScript (Node runs `.ts` directly) unless there's a real reason not to.

## Agent skills

### Issue tracker

GitHub Issues on ecarlste/x4-swi-bounty-hunter via `gh`. See `docs/agents/issue-tracker.md`.

### Triage labels

The five default labels: needs-triage, needs-info, ready-for-agent, ready-for-human, wontfix. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `GLOSSARY.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.
