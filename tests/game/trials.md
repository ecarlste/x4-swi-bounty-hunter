# M-rung trials (hand-flown wing config fights)

Status: **partly tried in game** (2026-11-10, [#63](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/63)). The offline checks pass (`make check`: ids, loadouts, 8.00 XSDs). One entry run on 2026-11-10: the wing spawned assigned to Bobby, the comm menu worked once moved under "More..." (vanilla fills the main menu's top_right), and an Imperial Gozanti + 4 TIEs spawned and fought, with no wingmen lost. Two fixes came out of it and are not yet tried in game: the Gozanti's pilot bailed out, which never fires the destroyed event, so a bail-out now ends the fight as `bailed`; and the R-41's two HM-6 launcher slots were empty, so every launcher slot now gets a launcher and missiles. See "Unverified" below.

The trials extension lets you fly the M rung's [wing configs](../../GLOSSARY.md) by hand against M targets, for the wayfinder ticket "M-rung loadout trials" ([#47](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/47)). It's modelled on the [game-test harness](README.md), but it has **no autostart and no auto-quit**: you start a trial from New Game and play. It's dev only and never loaded in a recorded episode.

## Running

Close X4 first. Then:

```
make trials                          # install, start X4 in the test profile, wait; after you quit: remove, print the table
make trials ARGS=-KeepExtension      # leave it installed after you quit
make trials-uninstall                # remove it (after a killed run, or -KeepExtension)
make trial-log LOG=<debuglog.txt>    # the results table from any copy of the log
```

`make trials` (`tools/run-trials.ps1`) uses the same test profile and `test.config` as `make game-test`, and the profile needs SWI switched on (`make game-test ARGS=-PrepareProfile` once). It switches `swibh_trials` on in the test profile's `content.xml` only, copies `tests/game/swibh_trials` into the game's `extensions\`, and starts X4 with `-debug all -logfile debuglog.txt` so the trial lines get logged. When X4 exits, it removes the extension, copies the log to `tests/game/trials-debuglog.txt` (git-ignored) and prints the table.

If a run is killed and the extension stays installed, nothing changes in other games: its MD only runs in its own gamestarts. Its gamestarts do stay in New Game, in every profile with SWI on, until `make trials-uninstall`.

## In game

1. **New Game**, SWI's utility group: pick an `SWIBH trial M: ...` start. They're in SWI's one-sector showcase galaxy (the `swibh_test` sector), with god and jobs off, so nothing else is there. `nosave`: each trial is a fresh game.

   | Gamestart | Config | Bobby flies | Wing |
   | --- | --- | --- | --- |
   | `swibh_trial_m_entry` | `entry` | HWK-290 | 4 R-41 |
   | `swibh_trial_m_entry_n1` | `entry_n1` | HWK-290 | 4 N-1 Modified |
   | `swibh_trial_m_established` | `established` | HWK-290 | 3 HWK-290, 4 R-41 |
   | `swibh_trial_m_top` | `top` | Firespray | 2 Weequay, 1 C-ROC Corsair, 1 Imperial Gozanti cruiser, 4 HWK-290, 4 R-41 |

   Two seconds in, the wing appears behind Bobby. Every wingman is player-owned, has a pilot (piloting and morale 9 of 15, the same in every config) and is assigned to Bobby's ship (defence). That's a plain wing assignment, not a scripted order, so you can rearrange the sub-wings in game (for example, put the R-41s under the HWKs, or set the HWKs to attack to strip shields). The wing as it stands at each spawn is logged.

2. **Spawn a target:** comm any wingman, then pick **More... > Trials... > Spawn: ...**. The target spawns 15 km from Bobby, its faction is set hostile to you, and its escorts are assigned to it (defence). It gets no orders, so fly to it. Spawning a new target while a fight is on ends that fight as `abandoned` (the old ships stay).

   | Choice | Target | Escorts | SWI job it copies |
   | --- | --- | --- | --- |
   | Black Sun Weequay | `weequay_macro`, blacksun | 3 R-41 | `blacksun_free_plunderer_m` |
   | Hutt pirate C-ROC | `gozanti_croc_raider_macro`, huttpirates | 1 Weequay, 2 R-41 | `huttpirates_corvette_plunderer_m_galaxy` |
   | Imperial Gozanti | `impgozanti_cr_macro`, galempire | 4 TIE fighters | `galempire_gozanti_patrol_m_sector` |
   | New Republic CR-90 | `cr90_01a_macro`, newrepublic | 3 X-wings | `newrepublic_cr90_patrol_m_sector` |
   | New Republic GS-80 | `gs80_macro`, newrepublic | 3 X-wings | `newrepublic_cr90_patrol_m_sector` (its group also flies GS-80s) |

   These come from SWI 0.90's `jobs.xml`, not from the hunt code: hunts pick their targets from the bounty tracker, which records any NPC that kills while on an Attack order, so M hunt targets are the armed M job ships ([research/swi-bounty.md](../../research/swi-bounty.md) section 1). Each gets its job's usual escorts and `level 1.0` loadout. The GS-80 has no job of its own: it appears in New Republic's CR-90 patrol group, so it borrows that job's 3 X-wings. Sources: [research/trials-ships.md](../../research/trials-ships.md) section 2.

   In the top config, the spec's "4 corvettes/corsairs (Weequay, C-ROC, Gozanti)" is read as 2 Weequay, 1 C-ROC and 1 Gozanti; change `$WingSpec` in the MD for another mix.

3. **A fight ends** when the target dies (`killed`, a win, whoever killed it), its crew bails out (`bailed`, also a win: seen 2026-11-10 with a Gozanti, which left it ownerless and never destroyed), or Bobby's ship is destroyed (`ship_lost`). A notification shows the result.

## The log and the table

Every trial line in `debuglog.txt` is `[swibh-trial] <event> key=value ...`, with `t` in game seconds:

| Event | When | Keys |
| --- | --- | --- |
| `session` | A trial gamestart starts | `config`, `t` |
| `fight.start` | A target spawns | `fight` (1, 2, ... per game), `t`, `target` (macro), `faction`, `escorts` (count), `distance` (m), `ship` and `shipmacro` (Bobby's ship) |
| `wingman` | Right after `fight.start`, one per ship under Bobby's at that moment, sub-wings included | `fight`, `ship` (ID code), `macro`, `lead` (its commander's ID code) |
| `wingman.lost` | A wingman from the spawn is destroyed during the fight | `fight`, `t`, `ship`, `macro` |
| `fight.end` | The fight ends | `fight`, `t`, `result` (`killed`, `bailed`, `ship_lost` or `abandoned`) |

**Not log events.** These lines are harness lines, like `[swibh-test]`, so [ADR 0001](../../docs/adr/0001-one-schema-for-log-events.md)'s schema and its one parser don't apply: the format is defined only here, in the comment at the top of `swibh_trials/md/swibh_trials.xml`, and in `tools/trial-log/trials.ts`. Change all three together.

**Words.** A trial *fight* runs from the target's spawn to its death or its crew bailing out, the loss of Bobby's ship, or the next spawn. It is not an [engagement](../../GLOSSARY.md) (that's a stretch of combat ended by a quiet gap) and isn't in the glossary: it only exists in the trials. A trial *session* is one new game, not a `session.start` load. What the trials compare are wing configs; "loadout trials" is just #47's title.

**What counts.** Only wingmen under Bobby at the spawn, lost before the fight ends, count as lost; one that dies after the target (its escorts stay) doesn't. Losing Bobby's ship most likely ends the game, so expect at most one `ship_lost` fight per new game, as the last row.

`tools/trial-log.ts` turns them into one row per fight: session (1 per new game in the log), fight, config, target and escorts, game time of the spawn, result, win, wingmen lost (of how many, by model), time to kill (spawn to the target's death; only for a win) and the wing as it was arranged (who led whom). A fight with no `fight.end` shows as `unfinished`. Bad lines are listed on stderr by line number. Tests: `tools/trial-log/*.test.ts`.

## Files

| Path | What |
| --- | --- |
| `swibh_trials/content.xml` | Extension `swibh_trials`; depends on SWI so it loads after it (as `swibh_tests` does) |
| `swibh_trials/libraries/gamestarts.xml` | The four gamestarts |
| `swibh_trials/libraries/loadouts.xml` | Full loadouts for the player's ships, added to SWI's `<loadouts>`: SWI has none for these ships, and a `level` loadout on a player-owned ship gets no engines |
| `swibh_trials/md/swibh_trials.xml` | The wing, the comm menu, the spawns and the log lines |
| `../../tools/run-trials.ps1` | Install, launch, wait, remove |
| `../../tools/trial-log.ts`, `../../tools/trial-log/` | The table |

`make check` covers the extension too: well-formed XML, every macro, faction, ware and loadout id exists (our own loadouts included), and the 8.00 XSDs.

## Unverified

To check on the first run, and record here:

- The loadouts fit: engines on every player ship, and the weapons, launchers, turrets and shields picked by slot tag (all `optional`, so a wrong pick leaves the slot empty rather than failing). Confirmed 2026-11-10: the R-41's four lasers and engines, and the N-1's Krupx launcher and missiles. Still to check: the R-41's HM-6 launchers, and the HWK, Firespray, Weequay, C-ROC (GNK droids) and Gozanti.
- Back from the "Trials..." menu returns to "More...". (Found 2026-11-10: the main comm menu has no free slot, since vanilla puts "Work somewhere else for me" at `top_right`, so "Trials..." sits at `left` in vanilla's `g_mainmore`.)
- `event_player_owned_destroyed` fires for Bobby's own ship as well as the wingmen, with the ship as `event.param`.
- The target and escorts, with no orders, fight back when the wing arrives, and their faction stays hostile (`set_faction_relation` to -1).
- The wing spawns clear of Bobby's ship (`safepos` 1.5 km behind and to the side).
- ~~A target whose crew bails out logs `result=bailed`~~ Confirmed 2026-11-10: a Hutt C-ROC's crew bailed 2:58 after the spawn (entry_n1, no wingmen lost) and it logged `bailed`.
