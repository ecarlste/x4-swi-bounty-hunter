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

## Parallel sessions

Several sessions run at once, one per issue (`/mattpocock-skills:implement <issue>`), so no
session works in the main checkout. Its working tree belongs to nobody, and main only moves by PR.

- **Worktree first:** before the first edit, call `EnterWorktree` with a name like `issue-17`. Or
  start the session with the app's worktree option. This applies to every change, docs and
  research notes included. Switching branches in the main checkout doesn't count.
  `tools/hooks/guard-main.ts` blocks Edit and Write anywhere in the main checkout. It can't see
  shell writes (`sed -i`, `>`), so don't write files there from Bash. `.githooks` blocks
  commits and merge commits on main.
- **In the worktree:** `test.config` is copied in (`.worktreeinclude`), and Node finds the main
  checkout's `node_modules`, so `make check` works as is.
- **One issue per session and branch.** Don't edit another session's worktree or branch. If you
  need something from it, message that session (`ListAgents`, `SendMessage`).
- **PRs:** every change reaches main through a PR. Write the body with `/mattpocock-skills:pr`
  and include `Closes #<issue>`. Rebase on origin/main first. Push and open the PR when the user
  asks.
- **After the merge:** update the main checkout with `git pull --ff-only`, then remove the
  worktree (`ExitWorktree`).
- **Shared files:** HANDOFF.md and test-plan.md are edited by many issues. Keep those edits
  small, and expect to rebase.
- **The game is shared:** one `make game-test` or `make install` at a time. The runner refuses
  while X4 is running. Another session's `make install` replaces the installed extension.
- **New clone:** run `make setup` once. It also points git at `.githooks`, which a clone made
  before these hooks existed still needs.

## Agent skills

### Issue tracker

GitHub Issues on ecarlste/x4-swi-bounty-hunter via `gh`. See `docs/agents/issue-tracker.md`.

### Triage labels

The five default labels: needs-triage, needs-info, ready-for-agent, ready-for-human, wontfix. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `GLOSSARY.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.
