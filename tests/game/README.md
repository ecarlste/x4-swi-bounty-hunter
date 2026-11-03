# Automated in-game tests

Status: **runs in game** (2026-11-02): `make game-test` passes 4 of 4 in about 1 min 40 s (8.00 HF4 + SWI 0.90), T12's diff on EM included. The "Unverified" list below predates the first runs.

`make game-test` plays short scripted scenarios in the real game (X4 8.00 HF4 NoSteam + SWI 0.90) and reports PASS/FAIL, with no clicks. It's a copy of [A Pirate's Life's harness](https://github.com/ecarlste/x4-pirates-life-mod/blob/main/docs/research/automated-game-testing.md), adapted for the 8.00 NoSteam copy and SWI. Dev only: never loaded in a recorded episode.

[Back to the test plan](../../test-plan.md)

## How it works

1. `tools/run-game-tests.ps1` checks the test profile has SWI on, copies the test extension (`swibh_tests/`) into the game's `extensions\swibh_tests`, and starts `X4_nonsteam.exe` directly with `-skipintro -debug all -logfile debuglog.txt -scriptlogfiles -personalfolderid <id>`.
2. The extension's Lua (`ui/swibh_tests_autostart.lua`) calls `NewGame("swibh_test")` 1 s into the main menu.
3. MD (`md/swibh_tests.xml`) runs the tests one after another, logs `[swibh-test]` lines and quits the game.
4. The runner follows `<profile>\debuglog.txt`, closes the game if it hangs, removes the extension, and writes `tests/game/results.xml` (JUnit) and `tests/game/report.md`.

| Path | What |
| --- | --- |
| `swibh_tests/content.xml` | Extension `swibh_tests`; depends on game version 800 and `SW Interworlds`, so it loads after SWI (SWI's `<replace sel="//gamestarts">` would wipe a gamestart added earlier) |
| `swibh_tests/libraries/gamestarts.xml` | Adds the `swibh_test` gamestart (below) |
| `swibh_tests/ui.xml`, `ui/swibh_tests_autostart.lua` | The autostart |
| `swibh_tests/md/swibh_tests.xml` | The harness and the tests |
| `swibh_tests/extensions/starwarsmod_m1/md/kuertee_emergent_missions.xml` | T12's diff on SWI's Emergent Missions script (H12): two `HOOK T12` log lines, no behaviour change |
| `swibh_tests/md/swibh_hooks.xml` | H13: `HOOK H13` lines on `event_universe_generated` and on every load; on load it also calls EM's patched cap library |
| `../../extension/swibh/md/*.xml` | The `swibh` extension's MD (log libraries, engagements). The runner copies it into the installed test extension's `md/`, so tests run against it without installing `swibh` |
| `../../tools/log/game-check.ts` | After the run, `make game-test` reads the engagement test's log events from `tests/game/debuglog.txt` (the runner's copy) with the log parser |
| `../../tools/run-game-tests.ps1` | The runner |
| `../../tools/check_game_tests.py`, `../../tools/validate-xml.ps1`, `../GameTests.Check.ps1` | Offline checks (`make check`) |
| `../../test.config` | Paths and test profile id (copy `test.config.example`) |

### The test gamestart

`swibh_test`: SWI's one-sector showcase galaxy (`sws_galaxy_macro`, sector `sws_clustercoruscant_sector001_macro`, where SWI's own showcase and battle starts run), with god and jobs off, `nosave`, in SWI's "utility" group 9 (so it can also be started by hand from New Game).

- **Why this galaxy:** it's the leanest SWI map: one cluster, one sector, one empty zone, so it builds far quicker than `swi_galaxy_macro`. Emergent Missions doesn't care which galaxy: its start cues (`kEMissions`, `UserSettings`) run on `md.Setup.GameStart` for any gamestart that isn't a Timelines scenario (`kuertee_emergent_missions.xml` 135-222), and its libraries can be called from any script.
- **Why god and jobs off:** T01 spawns its own targets and calls EM's library directly, so it needs no stations or traffic. Without them every run starts the same, and no NPC fight puts pilots into EM's tracker by chance. The cost: vanilla and SWI setup cues that look for stations will log errors; the runner ignores errors that don't mention `swibh` (as A Pirate's Life's does). A test that needs a live universe (EM's tracker, named hunters, T15) needs its own gamestart on `swi_galaxy_macro` with jobs on.
- **Player:** the Bankrupt Bounty Hunter start's character (`character_player_pirate_gamestart1_macro`, vanilla Tides of Avarice) and ship (SWI `fortitude_macro`, the BHG loadout), 10,000 Cr, SETA in the inventory.

### T12 on an existing save

`make game-test` proves the diff on a new game. For the existing-save half (needed before a release):

```
make game-test ARGS=-Manual
```

It installs the test extension without the autostart and starts X4 in the test profile. Load a save made without the extension (copy one into `Documents\Egosoft\X4\90000201\save\` first), wait until it has loaded, then quit. The first time a profile loads a save, X4 shows "Modified game detected" (mods turn off online features): tick "Do not show again" and press OK, or the load waits behind it. The runner prints the `HOOK` lines and `EXISTING SAVE PASS` when EM's patched cap library ran after the load (H13's load hook calls it on the player's ship, or any ship when on foot), and whether `event_universe_generated` fired. It writes no report. Saves made in the test profile while the extension is on don't depend on it (`save="false"`).

## Setting up the test profile (once)

The test profile is `Documents\Egosoft\X4\90000201\` (`X4_PROFILE_ID` in `test.config`). It must be numeric: anything else falls back to the root profile, the real playthrough's. 90000001 and 90000002 are from an earlier spike; 90000101 is the manual test profile in the [test plan](../../test-plan.md#test-environment).

1. `make setup`, then check `test.config` (X4 path, exe, profile id).
2. `make game-test ARGS=-PrepareProfile` for the first run. It creates the profile folder, copies the root profile's `content.xml` and `config.xml` into it if it has none (it only reads the root profile), and switches `SW Interworlds` and `swibh_tests` on in its `content.xml`. **SWI must be on:** SWI's own `content.xml` says `enabled="0"`, so a new profile starts with SWI off, and then the test extension is off too (missing dependency) and nothing starts.
3. **UIX:** the root profile's `content.xml` also has `kuerteeUIExtensionsAndHUD` on, but kuertee's UI Extensions isn't installed in the 8.00 `extensions\` (only the DLCs and SWI, [mods.md](../../mods.md)), so the entry does nothing; SWI has its own UIX-hooked menus. Keep the test profile's extensions the same as the playthrough's: when a mod gets installed (UIX or a candidate), switch it on or off in the test profile too. The report lists the extensions that were on.
4. Without `-PrepareProfile`, the runner refuses to start if SWI isn't on in the test profile, or if the test extension is switched off there.

By hand instead: launch `X4_nonsteam.exe -personalfolderid 90000201` once, quit, copy the root `content.xml` and `config.xml` into `90000201\`, and check SWI is on in the Extensions menu.

## Running

```
make check                               # offline: XML, test list, ids, Lua, 8.00 XSDs, runner, TypeScript tools (no game)
make game-test                           # or: .\tools\run-game-tests.ps1 (PowerShell)
make game-test ARGS="-KeepExtension"     # leave the extension installed, e.g. to start swibh_test by hand
```

Close X4 first. A run takes as long as X4 takes to load SWI plus a few seconds of tests; the timeout is 1200 s (`-TimeoutSeconds`). Results print as they arrive; the full report, with every `INFO` and `VERDICT` line, is in `tests/game/report.md`. The previous log is kept as `debuglog.previous.txt`.

**If a run is killed** (PowerShell closed mid-run), `extensions\swibh_tests` may stay in the game folder: delete it before playing, or the main menu of any profile with SWI on will start the test game.

`make check` needs the unpacked vanilla 8.00 game files (`X4_UNPACKED`, the folder with `libraries\md.xsd`) and SWI's unpacked reference (`SWI_UNPACKED`). XSD validation uses the .NET validator in Windows PowerShell. The TypeScript check (`make check-tools`: `tsc` and `node --test` on `tools/**/*.test.ts`) needs `npm install` once (`make setup` runs it).

## Playtest logbook extractor

After a playtest, `tools/playtest-log.ts` reads the end save's logbook and prints the money and relation columns of the results sheet in `playtests/stock-bounty-loop.md` as markdown:

```
cp <X4 save folder>/save_NNN.xml.gz <scratch folder>/
node tools/playtest-log.ts <scratch folder>/save_NNN.xml.gz --since <game time at the session start>
```

Saves are untrusted data: copy the save out first; the tool only reads it, streams it line by line (flat memory, about 130 MB peak and 6 s on save_007's 800 MB) and stops at the end of the logbook. `--since` keeps only entries after that game time, to leave out earlier play in the same save. Plain `.xml` saves work too.

It prints four sections:

- **Hunt log:** one row per Search and Destroy hunt that ended: game time, target, offering faction, ending, paid, its kills and destruction parts, engagements, and the logbook's words for a hunt that paid nothing. Columns no row fills are left out.
- **Other income:** every other logbook entry with a reward (vanilla missions, "Rewarded for station defence").
- **Relation changes:** every "Reputation gained/lost" entry, with SWI's faction names (the logbook writes text ids such as `{999840,504110}`).
- **Pacing:** hunts ended, game time from the first to the last, hunts per game hour, total paid.

What it reads, and what it can't:

- A hunt's ending comes from EM's debrief text (`Mission_Hunt_GetMissionTexts` in SWI's `ext/md/kuertee_emergent_missions.xml`): a payout is success; "You failed to find/confirm/damage …" or "… is still operational" with "Total reward: 0.00 Cr." is failure; "Mission aborted." is abort. EM writes no logbook entry when a hunt is aborted and cleaned up, so an abort may not show at all: note aborts by hand.
- The offering faction is the faction of the "Reputation gained/lost" entry written at the same game time as the hunt's entry; the hunt entry itself has none.
- Not in the logbook, so still by hand: board offers, L/XL offers, the real-time split, sanctions, and the ticker's "Payment received" lines (loot sales).
- The faction names are SWI 0.90's (`tools/playtest-log/logbook.ts`); an unknown text id prints as is.

Tests: `tools/playtest-log/*.test.ts`, against `tools/fixtures/save_007-logbook.xml`, a cut of save_007 ("Bankrupt Bounty Hunter Test 1") with the logbook and a few lines either side.

## Hunt log (`make hunt-log`)

With the `swibh` extension installed, every hunt writes **log events** to `debuglog.txt` ([tools/log/README.md](../../tools/log/README.md)). After each play session, copy `debuglog.txt` out (X4 rewrites it at each launch), then:

```
make hunt-log LOG=<copy of debuglog.txt>    # or: node tools/hunt-log.ts <log> [--data <folder>]
```

A Windows path (`E:\...`) works from WSL. It updates four files in `data/`; commit them:

- **`hunts.csv`:** one row per finished hunt, added once by **hunt key**, so rerunning on the same log adds nothing. Money is integer ct, game time is seconds. Columns: hunt key, accept and end game time, duration, offering faction, wharf, target (idcode, macro, size class), sanction (last tier, total cost of `hunt.sanction` events), offered pay (kill, up to), paid (kill, destruction, total, cap before and after), result and failed step, wing size at accept, escorts killed, relation changes, losses (count, value), repairs, and **net = paid - losses - repairs** (the sanction cost isn't taken off).
- **`hunts-open.jsonl`:** the log events of **open hunts** (accepted, not ended), carried over so a hunt that ends in the next session's log gets its accept data and earlier losses. Open hunts are never in `hunts.csv` or the stats.
- **`hunts-summary.md`:** rebuilt each run: hunts by result, total paid, losses, repairs and net, pay per game hour (from the first accept to the last end, over every playthrough in the file), the hunts with a net loss, and the open hunts.
- **`hunts-read.txt`:** the SHA-256 of every log read. A log read before changes nothing, even after newer logs: replaying its old loads would undo the newer open hunts. A log read while X4 still runs and read again later has new lines, so it's read again, and its hunts already in `hunts.csv` are skipped.

The rules (`tools/hunt-log/hunts.ts`):

- **Losses:** a `player.loss` counts against the active hunt whose wing made the kill, else the first active hunt whose target is in the loss's sector (`attributeLoss`). Others are printed as losses outside any hunt and kept out of the files.
- **Reloads:** each `session.start` at game time T starts a new branch of play from that save's history: the events up to T of the latest branch with the same `saveMarker` that reached T (a save can only be made in a branch that got there). What the other branches did after T is thrown away, including open hunts carried over from an earlier log. A line written twice with the same JSON counts once. A hunt with two `hunt.end` left after that keeps the last.
- **Open hunts** need their `hunt.accept`: a hunt with neither accept nor end in the log (accepted before the extension or the log) is dropped, and its losses count as outside any hunt. A hunt with an end and no accept is a row with the accept columns empty.
- A hunt already in `hunts.csv` is never changed, even if a later log loads a save from before its end.
- Bad `[swibh]` lines (truncated, not in the schema) are printed by line number and skipped.

Tests: `tools/hunt-log/*.test.ts`, on fixture logs built by `tools/hunt-log/fixtures.ts` (typed against the log schema) and read through the log parser's `parseLine`.

## Log markers

Every harness line in `debuglog.txt` starts with `[swibh-test]`.

| Marker | Meaning |
| --- | --- |
| `autostart: starting gamestart swibh_test` | The Lua saw the main menu and started the test game (logged as `[=ERROR=]`: Lua's only logger is `DebugError`; not an error) |
| `autostart: module is '…', nothing to do` | The Lua loaded in the test game itself; normal |
| `RUN START <n> tests` | MD started; `<n>` tests should report |
| `INFO <test>: …` | Numbers a test measured (copied into the report's "Measured") |
| `VERDICT <test>: …` | The test's answer to its test plan question (copied into "Verdicts") |
| `PASS <test>: …` / `FAIL <test>: …` | A result and its detail |
| `DONE passed=<n> failed=<n>` | All tests ran; MD quits the game 2 s later |
| `HOOK <text>` | A line from the test extension's hooks outside its tests: `HOOK T12 kEMissions …` and `HOOK T12 CapRewardBasedOnMissionTarget …` from the diff on EM, `HOOK H13 …` from `md/swibh_hooks.xml`. Listed under "Measured" as `hook` |

Plain `[swibh]` lines are the `swibh` extension's JSON log events ([ADR 0001](../../docs/adr/0001-one-schema-for-log-events.md)), never the harness's. After the runner, `make game-test` runs `tools/log/game-check.ts` on them, which prints `PASS engagement log` or a `FAIL engagement log` line per problem and fails the make target.

A run fails if a test fails, fewer than `<n>` results arrive, `DONE` never comes (game exited or timed out), or the log has errors mentioning `swibh` (signature warnings excluded). Errors in EM's `CapRewardBasedOnMissionTarget` are listed in the report separately: they are T01 data, not a harness failure.

## Tests

| Test | Covers | Passes when |
| --- | --- | --- |
| `smoke` | The run is on `swibh_test`, SWI is loaded (`faction.galempire` and `ware.tie_fighter` exist), and Emergent Missions ran its start cue in SWI mode (`md.kuertee_emergent_missions.kEMissions` complete, `$IsSWIExists` true) | All of these hold |
| `t01_pay_cap` | [T01](../../test-plan.md#t01-lxl-search-and-destroy-pay-cap)'s question: does SWI's cap shrink an L/XL hunt reward to a few credits? | Both targets were spawned and measured, and the numbers were logged. The cap's answer is in the `VERDICT` line, not the PASS |
| `t12_diff_patch` | [T12](../../test-plan.md#t12-our-diff-patch-on-swis-em-file-applies): does a diff from our extension apply to SWI's EM script? Judged by the runner, not MD: added after `DONE` | Both `HOOK T12` lines are in the log (kEMissions runs at game start, the library runs in the T01 tests) and no error names `kuertee_emergent_missions`. The detail also gives H13's line |
| `t01_knw904` | The real KNW-904 contract: its target's class and `size`, and what the cap pays for its reward | `mc40a_macro` was spawned and measured, and EM's library returned both cases. The pay is in the `VERDICT` line |
| `combat_signals` | #23 diagnostic ([research/combat-hooks.md](../../research/combat-hooks.md#game-test-2026-11-02-third-run-combat_signals)): which MD signal fires per hit. The same three ships fight for 40 s; every combat event on them is counted per event and ship, the first 60 are logged, and shield, hull, `lastattacktime`, `lastattacker` and order are sampled every second | All three ships were created. The counts are in the `VERDICT` line |
| `engagement` | [T20](../../test-plan.md#t20-engagement-log-events-for-the-players-wing): `engagement.start`/`engagement.end` for the player's wing (#23). Gives the player a `t65b_xwing_macro` wingman, makes galempire hostile, and sends a `tie_advanced_macro` at the player's ship twice, with the wingman attacking it (both kept on their Attack orders by `KeepFighting`): first registered as a hunt's target (`HuntStarted`, key `swibh-test-hunt`), then in no hunt. Quiet gap 30 s in the test, so the AI's passes stay one engagement; min hulls keep everyone alive | Each fight closes one engagement with reason `quiet`, a hit taken by the player's ship and one dealt by the wingman, and the hunt key only on the first. INFO lines give each ship's hits and the duration. Then the log check must pass too |

**How T01 works.** It spawns an L target (`hapan_nova_macro`, SWI's Hapan Nova-class Battle Cruiser, the ship in the 2026-10-31 offers, owner `hapes`) and an XL target (`isd_2_macro`, Imperial Star Destroyer II, owner `galempire`), 30 km away, with no loadout, crew or pilot. Two seconds later, for each, it logs macro, owner, class, `isclass.ship_l/xl` and `size`, then calls EM's own library the way `Mission_Hunt_Resolve` does (EM 5684-5694):

```xml
<run_actions ref="md.kuertee_emergent_missions.CapRewardBasedOnMissionTarget" result="$Capped">
  <param name="Cue_Mission" value="this"/>
  <param name="MissionTarget" value="$Ship"/>
  <param name="RewardForTarget" value="500000Cr"/>      <!-- reward_forTargetKills -->
  <param name="RewardForPlayerKills" value="500000Cr"/> <!-- the player's damage reward -->
</run_actions>
```

and computes the pay with EM's own expression, `(($Capped.$RewardForTarget)f + ($Capped.$RewardForPlayerKills)f) * 1ct` (EM 5694). As a cross-check it also runs a copy of the library's cap expression (EM 7340-7375) and logs both; if the library call returns nothing, the copy's numbers are used and the log says so. The `VERDICT` line says **cap bites** (pay below the 1,000,000 Cr put in), **cap doesn't bite**, or that it bites for one target only.

**`t01_knw904`** spawns `mc40a_macro` (MC40A Light Cruiser, owner `newrepublic`, the KNW-904 contract's target, [save check](../../research/save-check-knw-904.md)) and calls the same library with the offer's numbers: `RewardForTarget` 35,835 Cr, and `RewardForPlayerKills` 1,141,130 × 1.25 Cr (100% damage, player kill) or 114,113 Cr (10% damage, another ship's kill).

`smoke`, `t01_pay_cap`, `t01_knw904`, `combat_signals` and `engagement` are listed in `$Tests` in `md/swibh_tests.xml`. To add a test: a root cue named after it that fires on `event_cue_signalled`, sets up its scenario, and signals `Report` once with `table[$name, $ok, $detail]`; then add it to `$Tests`, and clean up what it spawned. `make check` fails if `$Tests` and the root cues don't match. A diff on a game script goes in `md/` under its file name; a diff on another extension's script goes in `extensions/<its folder>/md/` (8.00 patches those by path: a diff in our `md/` named after SWI's script is loaded as a new script and ignored). `make check` checks each `sel` matches exactly one node in SWI's (or the game's) unpacked copy, and validates it against `diff.xsd`.

## Unverified

To check on the first run, and record here:

- `X4_nonsteam.exe` keeps running as the game process (doesn't hand over to another process), and accepts the arguments when started by the runner rather than the shortcut. A run that ends "the game exited early" at once points here.
- `-personalfolderid 90000201` makes a new profile folder with `debuglog.txt` in it, as `90000001` did on 2026-10-28.
- `sws_galaxy_macro` starts with god and jobs off (SWI's own showcase starts do, but they're in a group players rarely use), and the player spawns at (-1000, 0, -8000) without hitting anything.
- `NewGame()` and `C.GetGameStartName()` behave on 8.00 as on 9.00 (8.00's menus use both).
- A library nested in EM's `kEMissions` cue can be called from another script as `md.kuertee_emergent_missions.CapRewardBasedOnMissionTarget`, and its `UserSettings.$debugChance` reads resolve in EM's script.
- A spawned ship's `size` is set 2 s after `create_ship`, with no pilot or loadout.
- The "Starting new game … in 8.00 (…)" line, which the report reads the version from, has the same format as 9.00's.
