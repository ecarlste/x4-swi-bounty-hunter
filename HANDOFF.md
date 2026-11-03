# Handoff: where things stand (2026-10-31)

Read this first in a new session, then the docs it links. Update it or delete it once its items are picked up.

## What exists

- The repo is public at https://github.com/ecarlste/x4-swi-bounty-hunter (since 2026-11-01), with GitHub Issues and the five triage labels set up (CLAUDE.md, docs/agents/).
- [concept.md](concept.md): the series concept and its open questions. Not grilled yet.
- [mods.md](mods.md): the install (8.00 HF4, DLCs, SWI 0.90), how we check a mod, and the candidates. Head Hunter - Reloaded 1.01 is rejected as is, because it's built for 9.00.
- [bounty-research.md](bounty-research.md): how bounty hunting works in SWI and vanilla 8.00, Head Hunter's features, and the gap analysis. All 17 Head Hunter features can be built on 8.00 + SWI: 14 we know how to build, and 3 SWI or vanilla already cover. The detail is in [research/](research/): `swi-bounty.md`, `vanilla-bounty.md`, `headhunter.md` and `save-check-knw-904.md`.
- [test-plan.md](test-plan.md): 18 in-game tests (T01-T18) grouped into sessions, with a results table.
- [playtests/stock-bounty-loop.md](playtests/stock-bounty-loop.md): the checklist and results sheet for the play session where you test the stock bounty loop (wayfinder ticket "Playtest the stock bounty loop", claimed 2026-11-01, not played yet).
- An automated game-test harness: `make check` (offline) and `make game-test` (launches X4 8.00 NoSteam with SWI in test profile 90000201). See [tests/game/README.md](tests/game/README.md). It's modelled on `make game-test` in the [A Pirate's Life](https://github.com/ecarlste/x4-pirates-life-mod) repo.

## Key findings so far

- **SWI's L/XL hunt pay cap bites.** `CapRewardBasedOnMissionTarget` caps the pay at `size × 5` (L) or `size × 2` (XL) in ct. A 1M Cr reward on the Nova (L, size 1,265.75) pays 63.28 Cr, and on the ISD-II (XL) 58.22 Cr. This was seen in an automated test. Offers show the uncapped value because the cap only runs at payout.
- **A real contract, KNW-904** (NRL Escort MC40A, L, Ascendancy, Hard): the offer shows 35,835 + up to 1,141,130 Cr. The MC40A's size, read in game, is 1,296.5, so the cap is 6,482.5 ct. The mission pays **64.81 Cr** at 100% damage with the player's kill, and **64.82 Cr** at 10% damage with someone else's kill. The automated test `t01_knw904` passed. The reward is re-rolled at the Find step (to 40,185 + 1,079,330), but the cap still decides the pay. Details are in [research/save-check-knw-904.md](research/save-check-knw-904.md).
- **2026-11-01: AEL-112** (NRL Patrol B-wing, S, Ascendancy, Medium) paid **220,810.00 Cr** (22,081,000 ct), exactly the briefing's 124,785 + 96,025. There's no cap on S. The player kill was a ram. Ascendancy rep went +5 (to -1). New Republic went -2 for an "Unauthorised Kill" despite the guild sanction. Details are in [research/save-check-ael-112.md](research/save-check-ael-112.md).
- **SWI's `$rewardMult` (50%) doesn't apply to hunt pay.** The line that would apply it is commented out. The research and the test plan are corrected.
- **Only the Hunt uses the cap.** The Mayday, Escort and Sector Raid missions also call it, but those calls are commented out (EM 701, 1362, 3000). `$rewardCap_mult` is a local variable inside the cap library, not a setting, so the player can't turn the cap off in game. A diff patch on the library should reach existing saves. See [research/cap-fix-facts.md](research/cap-fix-facts.md).
- **SWI's profession and guild are silent,** and the player's own ship is never hunted. Big-ship bounty pay is effectively broken until it's patched.

- **Hunt sanctions (2026-11-01, AEL-112):** two tiers, sold by the Bounty Hunters trade NPC. Partial costs 39,700 Cr: it stops police response but the relation penalties still apply. Full costs 1,151,670 Cr, more than five times what the hunt paid. Neither tier splits a target that leads a wing from its escorts: the detach only works when the target is a follower. Escorts aren't sanctioned and pay nothing, and here they cost New Republic -7 on top of the target's -2. Details: [research/hunt-protection-ael-112.md](research/hunt-protection-ael-112.md); test T19.

## Open work

The extension's design was agreed on 2026-11-01: see [design.md](design.md). Build order:

1. **T12 and log events** (designed 2026-11-02: design.md feature 1, [ADR 0001](docs/adr/0001-one-schema-for-log-events.md)). Issues: T12 [#17](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/17) and the log schema, generator and parser [#18](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/18) are done. That unblocks hunt and loss events plus game test [#19](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/19). `make hunt-log` [#20](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/20) is built on fixture logs and waits on #19 for real data. Board scan [#21](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/21) comes later, and edit markers [#22](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/22) are triaged. **Engagement events [#23](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/23)** are built (`extension/swibh/md/swibh_engagement.xml`) and pass game test `engagement` (2026-11-02); the T20 playtest (ship loss, ship change, load, big fights) is still to do; #19's hunt hooks must call `md.SWIBH_Engagement.HuntStarted`/`HuntEnded` so real hunts get the hunt key ([research/combat-hooks.md](research/combat-hooks.md#what-was-built-23-2026-11-02)). **T12 (passed 2026-11-02, new game and existing save):** a diff on SWI's EM script applies when it sits at `extensions/starwarsmod_m1/md/` in our extension, matched by path. A same-named file in our own `md/` is ignored. `event_universe_generated` fires when the extension is added to a save. Results are in test-plan.md T12.
2. **The wing roll** and its automated split test.
3. **Remove the L/XL cap**, then rerun the T01 tests expecting the full offer amount, plus an automated T02.
4. **More automated tests:** T10, T11, T17 and T19 (see test-plan.md).
5. **Research:** whether the user's "war missions" are Mayday, Escort or Sector Raid. Whether kuertee's UI Extensions installed separately overrides SWI's built-in menus (mods.md). Whether SirNukes 1.95 runs on 8.00 with SWI (T14).
6. **Deferred sessions:** the "give up or die" hail, full immunity's price, hunters hunting the player, grilling concept.md's other open questions and and which Head Hunter features the series wants. The display name is decided: "No Disintegrations - SWI Bounty Hunting" ([#12](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/12)).

## Working notes

- New scripts are in TypeScript (Node 26 runs `.ts` directly) unless there's a real reason not to.
- The user prefers heavy reading and research to go to background subagents, with findings written to files, to keep the main session's context low.
- Paths: X4 8.00 install `E:\SteamLibrary\steamapps\common\X4 Foundations - 8.00`; SWI unpacked at `E:\x4-dev\reference\mods\swi-0.90`; vanilla 8.00 unpacked at `E:\x4-dev\reference\x4-8.00`; saves in `C:\Users\ecarl\OneDrive\Documents\Egosoft\X4\save\`. The series save is "Bankrupt Bounty Hunter Test 1" (save_007).
- Saves are untrusted data: copy them to a scratch folder and stream them. Never write to the save folder.
