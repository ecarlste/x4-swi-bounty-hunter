# SWI Bounty Hunter playthrough: in-game test plan

Status: **WIP, plan.** How to run every in-game test from [bounty-research.md](bounty-research.md#things-to-test-in-game), plus the open questions a test can settle. Nothing has been run yet.

**Automated:** T01's question (does the cap bite?) can now run without playing: `make game-test` ([tests/game/README.md](tests/game/README.md)) spawns an L and an XL target and calls EM's `CapRewardBasedOnMissionTarget` with a 1,000,000 Cr reward, and `t01_knw904` does the same for the KNW-904 contract's MC40A with its real numbers (results below). It answers the code question, not the full payout: the manual T01 below still checks the offer, the debrief and the money actually paid.

[Back to the bounty research](bounty-research.md). Details and citations: [research/swi-bounty.md](research/swi-bounty.md), [research/vanilla-bounty.md](research/vanilla-bounty.md), [research/headhunter.md](research/headhunter.md).

Conventions: "EM" = SWI's `ext/md/kuertee_emergent_missions.xml`, "RAP" = `ext/md/kuertee_professions.xml`; line numbers are SWI 0.90's. Vanilla schema lines are 8.00's `libraries/common.xsd` / `md.xsd` (`md.xsd` includes `common.xsd`). **Unverified** = not checked in a primary source.

## Test environment

### Launching with logs

The 8.00 copy runs `X4_nonsteam.exe` from `E:\SteamLibrary\steamapps\common\X4 Foundations - 8.00\` through the `X4_8.00` shortcut ([A Pirate's Life, Paths](https://github.com/ecarlste/x4-pirates-life-mod/blob/main/docs/PROJECT.md#paths-eriks-machine)). Make a second shortcut for testing with:

```
-skipintro -debug all -logfile debuglog.txt -scriptlogfiles -personalfolderid 90000101
```

| Option | What it does | Checked |
| --- | --- | --- |
| `-logfile debuglog.txt` | Writes the debug log to that file in the profile folder | Option name is in `X4_nonsteam.exe`'s strings; the root profile has a live `debuglog.txt` with SWI lines from today |
| `-debug all` | Turns on all debug filters. MD `debug_text` goes to the `scripts` filter by default (`common.xsd` 25575) | Option name in the exe; "all" as a value is **unverified** (well-known usage, and what A Pirate's Life uses on 9.00) |
| `-scriptlogfiles` | Lets `debug_to_file` write files; without it nothing is written (`common.xsd` 25600) | Read |
| `-personalfolderid <number>` | Uses `…\Egosoft\X4\<number>\` as the profile. Only a numeric ID works; anything else falls back to the root folder | Tested on 2026-10-28 in A Pirate's Life's NoSteam spike (made `90000001\`) |
| `-skipintro` | Skips the intro videos | In the exe |
| `-enablexmlvalidation`, `-nosoundthrottle`, `-nocputhrottle` | Other options found in the exe's strings; XML validation might help while writing the helper | **Unverified** what they do |

The exe also holds debug commands (`refreshmd`, `reloadui`, `exportlogbook <file>.txt`). They'd save restarts while writing the helper, but where to type them on 8.00 (chat window?) is **unverified**.

### Where things land

| What | Path (profile = `C:\Users\ecarl\OneDrive\Documents\Egosoft\X4\<folder>\`) |
| --- | --- |
| Real playthrough profile | The root folder `…\Egosoft\X4\` (NoSteam's default): `save\`, `content.xml`, `config.xml`, `debuglog.txt` |
| Test profile | `…\Egosoft\X4\90000101\` |
| `debuglog.txt` | `<profile>\debuglog.txt`, overwritten at each launch |
| `debug_to_file` output | `<profile>\logs\<directory>\<name>`; the root profile already has `logs\BetterPiracy.txt`, `logs\god\` and others from older mods |
| Saves | `<profile>\save\` |

### Keeping tests away from the real saves

1. Back up the root profile first (as in `E:\x4-dev\backups\x4-root-profile-…`).
2. Launch the test shortcut once so it creates `90000101\`, quit, then copy the root `config.xml` (graphics) and `content.xml` (extension on/off) into it. SWI's own `content.xml` says `enabled="0"`, so a new profile without the copy starts with SWI off. Check the Extensions menu shows SWI on.
3. Test-only extensions (the helper and the UI spikes below) go in `90000101\extensions\` if X4 loads extensions from the profile folder (**unverified**; the root profile has an empty `extensions\`). Otherwise put them in the game's `extensions\` folder and switch them off in the root profile's Extensions menu before the next playthrough session.
4. Test saves are named `test-<session>-<state>` and never get copied to the root profile.

### Recording a run

For each run, make a folder `E:\x4-dev\test-runs\<date>-<test ID>\` and put in it:

- `debuglog.txt` (copy it before relaunching; it's overwritten) and any `logs\` files;
- the test profile's `content.xml`, and the [mods.md](mods.md) "Installed" state the run used, plus which test-only extensions and versions were on;
- screenshots (X4 saves them in the profile's `screenshots\` folder; **unverified** on NoSteam) and the logbook entries (photo, or `exportlogbook` if it works);
- a short notes file. Then fill in a row of the [results table](#results).

## Reaching test conditions quickly

X4 has no console, so there are three ways to set things up.

| Way | What it gives | Limits |
| --- | --- | --- |
| **(a) Normal play** + SETA and saves | The real thing: stock starts, stock timings. SWI gives every main-galaxy start a SETA in inventory (`ext/md/setup_swmod.xml` `SetupThingsForSWmod`, 7-19). SWI's game options add nothing for testing (`sw_gameoptions.lua` only hides Timelines and Tutorials) | Slow: the BHG start has 500 Cr and a shuttle; hunters wake at 20-30 min; SETA needs no enemies nearby and tops out at 6x |
| **(b) SWI's Custom Game start** (`custom_creative`, "Shape Your Own Future", `ext/libraries/gamestarts.xml` 3173-3287, group "custom", `tags="customeditor"`) | Vanilla 8.00's Custom Game Editor (Creative) on the SWI galaxy: choose sector, money, ship and loadout, owned ships (`playerproperty`), faction relations (`universefactionrelations`), known space, research and inventory (the `<custom>` items, same list as vanilla's `custom_creative`, `libraries/gamestarts.xml` 2899+). Runs on `swi_galaxy_macro`, so SWI's setup, EM, RAP and the named hunters all run | Not the BHG start: no R-41 wave, no Bobby. SWI replaces the whole gamestart list, so vanilla's Budgeted start and debug test starts (`group="100"`) are gone. Saves are marked "modified" (no effect on NoSteam). Presets can be kept in the profile's `customgamestart\` folder (**unverified** how) |
| **(c) A throwaway test-helper extension** | Exact setups on demand: money, relations, spawned targets, injected EM kills, logs of EM's data and payouts | Has to be written; a wrong cue can change what we're testing, so each test says which cues are allowed |

**Recommendation:** (b) for most setups (a good fighter, money and relations in the right sector in two minutes), (a) where the stock start or stock timing is the thing tested (T07, T15, the first part of T03 and T06), and (c) where neither gets there: an L/XL hunt target on demand (T01), hunter spawns (T10, T11), log dumps (T15, T17) and runtime switches (T13). Per-test choices are in each test and in the [index](#test-index).

### Test helper extension (sketch, not built)

`swibh_testhelper`: one `content.xml` that depends on `SW Interworlds` (so its diff patch loads after SWI), one MD file, one diff patch. Test profile only, never in a recorded episode.

**How it's triggered.** A conversation menu through SWI's ExtendedConversationMenu (`ext/md/extendedconversationmenu.xml`): register an entry in `md.ExtendedConversationMenu.Main.$convOptions` on `event_conversation_started` (`common.xsd` 12594), then `add_player_choice_sub` / `add_player_choice` / `add_player_choice_return` (20297, 20271, 20368) and `event_conversation_next_section` (12533). **Skip the entry when the NPC's owner is `bountyhunters`:** ECM shows one mod entry directly and two or more under "... more. (Mods)" (ECM 33-38), and EM adds one entry per faction there (EM 12063-12064), so our entry would change what T03 sees. A `[swibh]` prefix on every log line makes `debuglog.txt` easy to grep.

| Cue | What it does | Main MD actions (8.00 schema line) |
| --- | --- | --- |
| H1 Menu | The conversation menu above | as above |
| H2 Credits | Give 1 M / 10 M Cr; log `player.money` | `reward_player money=` (32164) or `transfer_money` (32639) |
| H3 Relations | Set the player's relation to a chosen faction (e.g. `huttcartel` to 0.011, UI 10, enough for a police licence) | `set_faction_relation` (34546), `add_faction_relation` (19821) |
| H4 Spawn target | Spawn a ship of a chosen faction and class (e.g. `blacksun` L, `<select faction size tags>`) 10-20 km from the player, with a pilot; optional Attack order | `create_ship` (24644), `create_position` (24589), `create_order` (23607) |
| H5 Make it a bounty | Inject N kills for that ship, so EM's own `Bounties_TargetDestroyed` (EM 11483) registers the pilot, its kills and a sighting for the chosen victim faction. The signal and table are exactly what `kEM_AttackFinish` sends (`ext/aiscripts/kuertee_em_interrupts.xml` 48-54) | `signal_objects object="player.galaxy" param="'K_ObjectAttacks_AttackerKilledObject'" param2="table[$attacker=…, $victimClass=…, $victimFaction=…]"` (36331) |
| H6 Weaken target | Set the target's hull to e.g. 10 %, so an L/XL can be killed with a fighter. EM credits the first player-owned attacker with `100 - hull%` (swi-bounty §4.4), so pay share stays near full | `set_object_hull` (33728) |
| H7 EM debug on | Set `md.kuertee_emergent_missions.UserSettings.$debugChance_missionHunt` (and `$debugChance`) to 100, so EM's own reward lines reach the log. EM resets them on every start and load (EM `UserSettings` 135-211), so press after loading. **Never** turn on `$debugChance_bounties` for T03: it also lets any trade NPC offer hunts (EM 12041-12044) | `set_value` |
| H8 Dump bounty list | For each pilot in `global.$Bounties.$pilots` (EM 11061): ship, idcode, class, owner, sector, `$kEM_kills` by faction and class, `$kEM_lastKnownLocation` factions and newest station; plus pool size by class | `do_for_each`, `debug_text` (25553), `debug_to_file` (25597) |
| H9 Money and kill log | Log every money change (old, new, delta) and every player-owned kill (killer, victim class, owner) | `event_player_money_updated` (15701), `event_player_owned_killed_object` (15760) |
| H10 Hunter tools | (a) Send a live hunter at the player: SWI's rebel-start pattern (`ext/md/sw_plot_rebel.xml` 177-209); (b) spawn one with `<select faction="faction.indibhg" tags="[…bhg_random_small]"/>`; (c) wake the hunter jobs early; (d) every 60 s, log each `indibhg` ship's order and target | `find_ship_by_true_owner` (27815), `warp` (37105), `create_order` (23607), `create_ship` (24644), `set_job_active` (md.xsd 3803) |
| H11 Unsilence BountyHunter | Remove `kProfs.$prof_BountyHunter` from `md.kuertee_professions.ModFeatures.$silentReputationsAndProfessions` (RAP 52-55). RAP re-applies it on every load, so press after loading | `remove_from_list` (30662) |
| H12 Diff patch | A diff on SWI's `md/kuertee_emergent_missions.xml` that adds one unconditional `debug_text` in `CapRewardBasedOnMissionTarget` (EM 7340-7375) after `$CapReward` is set, logging `$MissionTarget.size`, `$TotalReward` and `$CapReward`, and one at the start of `kEMissions`. Changes no behaviour; it is test T12 and the cap logger for T01 | diff `<add>` |
| H13 Universe hook | A cue on `event_universe_generated` that logs once, to see whether it fires when the helper is added to an existing save. Built with a second cue on `event_game_loaded` that calls EM's patched cap library on the player's ship, since `kEMissions` (already complete in an old save) doesn't rerun on load: that's T12's existing-save proof | `event_universe_generated` (`common.xsd` 17153) |

Before building, check: `create_ship`'s pilot child and tag syntax for SWI's custom tags; how to read an order's target in MD (H10d); whether the Player Info Lua re-reads the silent list after H11 (RAP 6840 passes it to the UI).

## Test index

Ordered by importance. "Way" = how to reach the test conditions (a, b, c above).

| ID | Test | Way | Session |
| --- | --- | --- | --- |
| T01 | L/XL Search and Destroy pay cap | b + c (H4-H7, H9, H12); cap logic automated (`t01_pay_cap`) | S2 |
| T02 | S/M hunt pay against the formula | b (+ c H7, H9) | S2 |
| T03 | Hunt options at a Bounty Hunters wharf; offers and limits | b (no helper menu at BH NPCs) | S2 (+ S1 if a wharf is in reach) |
| T04 | Debrief over comms or only docked | b | S2 |
| T05 | Police licence kill bounty in Hutt space | b or a + c (H2-H4, H9) | S3 |
| T06 | Named hunters: appear, and go after the player's AI ships | a, then c (H5, H10c-d) | S1, S4 |
| T07 | BHG start's two R-41s | a | S1 |
| T08 | Diplomacy tab on SWI's menus (UI spike) | b + spike | S1 (`N` only), S5 |
| T09 | Options submenu through `displayOptions_modifyOptions` (UI spike) | b + spike | S5 |
| T10 | Warp and Attack a live named hunter on the player | c (H10a, H10c) | S4 |
| T11 | `create_ship` for `indibhg` from MD | c (H10b) | S4 |
| T12 | Our diff patch on SWI's EM file applies | c (H12, H13) | S0 |
| T13 | BountyHunter profession unsilenced | c (H11) | S2 |
| T14 | Optional: SirNukes 1.95 options menu in SWI | a (install) | S5 |
| T15 | How thin is EM's tracker in Hutt space early | a + c (H8 read-only) | S1 |
| T16 | Sanctions: cost, effect, and the Guild representative | b + c (H8, log rep) | S2 |
| T17 | Export EM's bounty list to a file (stream overlay) | c (H8 with `debug_to_file`) | S0, S1 |
| T18 | Bounty-like vanilla missions in SWI | a (look at offers) | S1, S2 |
| T19 | Sanction on a wing leader: wing detach, escorts, relation | b + c (H4/H5 to place a leader target; log rep); detach logic automatable | S2 |
| T20 | Engagement log events for the player's wing | automated (`engagement`) + playtest for load, ship change, ship loss and the hook unknowns | S2 |
| T21 | Rename a wingman's pilot from a script | c (Lua call on a live NPC) | S1 |

**Automated (`make game-test`, [tests/game/README.md](tests/game/README.md)):** T01's cap logic (`t01_pay_cap`), plus a `smoke` test that SWI and EM are loaded. Its test gamestart (SWI's showcase galaxy, god and jobs off) and runner could also take, as new tests in `md/swibh_tests.xml`: T11 (`create_ship` for `indibhg`; spawn and log what appears), T12 (built: the test extension carries the patch, the runner judges it as `t12_diff_patch`), T17 (file writing with `debug_to_file`; the runner already passes `-scriptlogfiles`), and parts of T02 (EM's reward libraries called with a spawned target, as T01 does). The rest need a live universe, the stock start, a conversation or the UI, so stay manual.

Open questions from bounty-research.md: only the overlay export ("can a most wanted list … be exported") is settled by a test (T17). The others are design choices; T01-T05 and T15 give them numbers.

## Sessions

Run order differs from importance: S0 first, because the helper's logging and patch must work before they're trusted.

| Session | Start from | Tests | Saves to make |
| --- | --- | --- | --- |
| S0 Environment | Custom start, anywhere | T12, T17 (file writing only) | none |
| S1 Stock BHG start | New Bankrupt Bounty Hunter game, helper loaded but only read-only cues (H8, H9, H13) | T07, T08 (`N` only), T15, T06 part 1, T17, T18, T21, T03 if a wharf is in reach | `test-S1-start` (right after load), `test-S1-60min`, `test-S1-120min` |
| S2 Guild hunts | Custom start in Milagro (Bounty Hunters HQ), see S2 setup | T03, T02, T04, T16, T19, T20, T01, T13, T18 | `test-S2-start`, `test-S2-offers`, `test-S2-SM-accepted`, `test-S2-L-accepted`, `test-S2-L-destroyed` |
| S3 Police bounty | Custom start in Hutt Cartel space (or `test-S1-60min` + H2/H3) | T05 | `test-S3-start`, `test-S3-licence` |
| S4 Hunter spawns | `test-S2-start` (or `test-S1-60min`) + helper | T10, T11, T06 part 2 | `test-S4-start` |
| S5 UI spikes | `test-S2-start`, with the spike extensions | T08, T09, T14 | none |

**S2 setup (custom start):** sector Milagro (`swi_zone001_clustermillagro_sector001_macro` holds wharf 01, `ext/libraries/god.xml` 2969-3035); a strong S or M fighter with shields and a long-range scanner MK2; 5 M Cr; Milagro and the neighbouring sectors known; default relations (offering factions must be at least neutral, swi-bounty §4.1). Play 30-60 min on SETA before the first convo, so EM's tracker fills, then save `test-S2-start`.

## Tests

### T01 L/XL Search and Destroy pay cap

- **Question:** what does a finished L or XL hunt really pay? SWI caps it at `target.size × 5` (L) or `× 2` (XL) with the result as `ct`, which would be a few credits. If true, big-game hunting (series arc step 3) pays nothing in stock SWI, and fixing it is our first mod change.
- **Setup:** S2. Natural L/XL offers are rare early (a pilot needs kills against a valid faction), so make one: H4 spawns a `blacksun` L military ship (SWI has one category, swi-bounty §11 / bounty-research hunter table) 50+ km from the player; H5 injects 2 M kills against `huttcartel` (or whichever main faction has a station nearby). Load with H12 on and press H7 and H9. If a natural L/XL offer exists, use it instead and note so.
- **Steps:**
  1. Dock at the Milagro wharf, talk to the trade NPC, pick the victim faction, then "Large and extra-large-sized targets" (`{11513,604}`).
  2. On the map, screenshot the offer, its reward text ("Reward: %base + up to %bonus", `{11513,503}`) and difficulty (should be `hard`). Accept. Save `test-S2-L-accepted`.
  3. Fly to the beacons; when found, H6 sets hull to 10 %; attack and kill it yourself. Save `test-S2-L-destroyed` before the debrief.
  4. Talk to the contact NPC (in person; T04 tries comms) and finish.
  5. Reload `test-S2-L-destroyed` and repeat with an XL target if one can be made (SWI `blacksun` has one XL category); otherwise note it.
- **Record:** offer reward text; target macro, class and `size` (H12 line); H7 lines `$reward_forTargetKills`, `$reward_forTarget`, `$PlayerDamageAndKillsData.$reward` (EM 5680-5682); H12 `$TotalReward` and `$CapReward`; H9 money delta; the logbook mission entry with its damage and kills breakdown; relation change with the offering faction.
- **Expected (code):** offer shows the uncapped value (the cap runs only at resolve, EM 5684-5693). Without the cap, an L kill would pay about 1.4 M Cr for the target (L class reward ≈ 1.1 M × 1.25 player-kill bonus; EM's ×0.5 doesn't apply, see [save check](research/save-check-knw-904.md)) plus half the class value of its kills, before random (×1-1.3) and relation boost (×1-3 for hard). With the cap, total ≈ `size × 5` ct: a 300 m L ship gives 1,500 ct = **15 Cr**; XL ≈ `size × 2` ct. Source: [swi-bounty.md](research/swi-bounty.md) §4.4 and §15, [bounty-research.md](bounty-research.md#the-lxl-pay-cap); code EM `CapRewardBasedOnMissionTarget` 7340-7375, `size` is a length (`libraries/scriptproperties.xml` 63).
- **Pass (cap bug confirmed, pay under ~100 Cr):** mark the bug "seen" in bounty-research.md, and the fix (diff patch setting `$rewardCap_mult` to 0 or scaling the cap) becomes the first mod item. Tell viewers in the series that L/XL Guild hunts don't pay until the fix.
- **Fail (pay in the hundreds of thousands):** the cap doesn't bite (units or comparison work differently). Record the numbers, drop the fix, update both research notes.
- **Automated part:** `make game-test` runs `t01_pay_cap`: an L `hapan_nova_macro` (Hapes) and an XL `isd_2_macro` (Empire) are spawned, their class and `size` logged, and EM's `CapRewardBasedOnMissionTarget` called as `Mission_Hunt_Resolve` calls it (EM 5684-5694) with 500,000 + 500,000 Cr. Its `VERDICT` line says "cap bites" or "cap doesn't bite", with the capped pay. If it bites, the manual run above only needs to confirm the money actually paid (H9).

### T02 S/M hunt pay against the formula

- **Question:** does an S/M hunt pay what the formula says? It sets the income of the early episodes.
- **Setup:** S2, `test-S2-offers`. Prefer a natural S/M offer; if none, H4 + H5 a `blacksun` or `huttpirates` S fighter with 2 M kills. H7 and H9 on.
- **Steps:** pick "Small and medium-sized targets" (`{11513,603}`), screenshot the offer, accept, save `test-S2-SM-accepted`. Find, scan if disguised, destroy it yourself, debrief. If time allows, a second run from the save where a wingman gets the kill after you damaged it (checks the 75 % "player kill" rule).
- **Record:** as T01, plus the target's kill record from H8 before accepting, the offering faction's relation (UI value), and your damage %.
- **Expected (code):** pay = 0.5 × Σ(class reward × target's kills of that class against the offering faction) + damage% × class reward of the target (× 1.25 if your kill), where class reward ≈ S ≈ 72 k (the save check's 1 S kill = 35,835 Cr at half value), M and L higher; EM's ×0.5 doesn't apply, then random and relation boost. Worked example: an S target with 2 M kills ≈ 140 k Cr. Source: [swi-bounty.md](research/swi-bounty.md) §4.4; EM `Mission_Hunt_Resolve` 5630+, `Reward_CalculateForKills` 7079, `Mission_Hunt_GetBaseRewardData` 6643, `GetRewardForLevel` 7271-7338; vanilla `md/lib_reward_balancing.xml` 285-350.
- **Pass (within the random and boost range):** the formula in the research holds; use it to plan pacing and the board's value column. **Fail:** record the gap; check for the kRAP guild multiplier (SWI `lib_reward_balancing.xml` diff), which the research thinks doesn't apply.

### T03 Hunt options at a Bounty Hunters wharf

- **Question:** do the hunt options appear at a wharf's trade NPC, and where (direct or under "... more. (Mods)")? How many offers, how far away, and do the limits work? This is the series' main loop.
- **Setup:** S2 (and S1 if a wharf is reachable from Lannik). Helper menu hidden at `bountyhunters` NPCs; `$debugChance_bounties` stays 0.
- **Steps:**
  1. Dock at the wharf, talk to the trade NPC. Screenshot the menu.
  2. For each faction listed, note the count, then each class count. Pick one; screenshot the map's offer list.
  3. Check where offers sit (other factions' stations, other sectors) and that one far away can be accepted from the map.
  4. Accept three, try a fourth: note the refusal text (`{11513,543}`-`545`) and the "time left" text.
  5. Talk to the Guild representative if one exists (T16) and note whether hunts are offered there.
  6. Note the in-game time since start, and run H8 to compare the offers with the tracker.
  7. While docked, open the wharf's paint options on an R-41 (or the ship flown) and apply any paint: note whether the hull shows it. The contact refit's BH paint is dropped on hulls that can't ([Capture and refit](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/49); the R-41's materials have no paint properties, [research/refit-variants.md](https://github.com/ecarlste/x4-swi-bounty-hunter/blob/research/refit-variants/research/refit-variants.md)).
- **Record:** screenshots of each menu level; counts per faction and class; offer locations and distances; refusal and countdown texts; H8 dump.
- **Expected (code):** one entry per faction with tracked pilots, "%faction: %n missions." (`{11513,602}`); shown directly if there's one faction, under "... more. (Mods)" if more (ECM 33-38, EM 12063). Offers galaxy-wide at the stations that hold the sightings, no 3 h freshness check. Max 3 accepted per rolling hour. The countdown text is wrong (60 h instead of 1 h, `kuertee_emergent_missions.lua` ~243). No XS targets (EM 11997-12004). The representative branch never fires (EM 12038). Source: [swi-bounty.md](research/swi-bounty.md) §4.1-4.2, §15.
- **Pass:** the loop works as researched; plan episodes around it. **Fail (no options):** check `player.station.owner` (EM 12041), that the NPC is the station's trade NPC, and `$isMissionsFromConvo`; record and report to the research note.

### T04 Debrief over comms

- **Question:** can a hunt be finished by talking to the contact over comms, or only by docking at the offering station? Offers are galaxy-wide, so docking could mean long trips.
- **Setup:** S2, `test-S2-L-destroyed` or after T02's kill, more than one sector from the offering station.
- **Steps:** open the mission; try "Comm" on the contact NPC (map, mission objective, or station's interact menu). If it fails, fly over and dock. Note the travel time.
- **Record:** which ways worked; screenshots; time spent getting paid.
- **Expected (code):** the last step is "talk to contact" (`create_mission` steps, EM `Mission_Hunt_CreateMission`); whether a remote comm counts is unknown ([swi-bounty.md](research/swi-bounty.md) §4.3 item 6, §14 Q4).
- **Pass (comms works):** debriefs don't drive pacing. **Fail:** note typical trip lengths; a "pay on kill" patch goes on the candidate list.

### T05 Police licence kill bounty in Hutt space

- **Question:** does the vanilla police bounty pay in SWI space? It would be a second income from killing pirates, and decides whether a Head Hunter-style kill bounty double-pays (gap #2).
- **Setup:** S3. Custom start in a Hutt Cartel police sector (Nal Hutta or Nar Shaddaa are likely, from the BHG reveal list; check the sector's police faction on the map) with `huttcartel` at UI 10 (relation 0.01, the licence's `minrelation`) and 300 k Cr; or `test-S1-60min` with H2 and H3. An S fighter. H9 on.
- **Steps:**
  1. Without a licence, kill a `huttpirates` (or other Hutt Cartel enemy) S ship within 30 km of a Hutt Cartel station that has it in radar (H4 if none come by). Wait 1 min.
  2. Find the Hutt Cartel representative, buy the police licence (100 k Cr, SWI `libraries/factions.xml` 434). Save `test-S3-licence`.
  3. Kill another S enemy in the same sector, away from stations. Wait up to 10 min.
  4. Optional: kill an M and note the amount.
- **Record:** H9 money deltas and the paying station; comm line; logbook "Rewarded for station defence" (`{1016,100}`); relation changes; where the representative is.
- **Expected (code):** step 1 pays bounty/3 = 10 k Cr (S) plus +0.001 relation, from a protective friendly station within 30 km; step 3 pays 30 k Cr (S; M 60 k) from the police representative's station, 45 s to 10 min after the kill. Source: [vanilla-bounty.md](research/vanilla-bounty.md) §1; vanilla `md/notifications.xml` 2149-2195, 2276-2414, `libraries/defaults.xml` 726-729; SWI keeps the values.
- **Pass:** note it as a starting income in the concept; a mod's kill bounty must not stack on it. **Fail:** check whether `huttcartel` has a representative and whether the victim was its enemy; record which condition failed.

### T06 Named hunters

- **Question:** do SWI's 19 named hunters show up, and do they ever go after the player's AI ships? Sets whether named hunters are already a threat to Bobby's wingmen, and feeds the "player is hunted" design.
- **Setup:** part 1: S1 (stock timing). Part 2: S4, with a wingman (custom start `playerproperty`, or bought).
- **Steps:**
  1. Part 1: note the in-game time of the "Invitation" message from "Unknown Contact". Over the next hour, note named `indibhg` ships seen (map search by name) and what they attack.
  2. Part 2: give the wingman a pilot record: H5 with `$attacker` = the wingman (or a real Attack-order kill on a non-excluded faction). Run H10d for 60 min on SETA. Log pool size (H8) every 10 min.
- **Record:** invitation time; hunter names, ships, sectors, targets; any order targeting a player-owned ship; pool size.
- **Expected (code):** jobs wake 20-30 min after start with the invitation (`ext/md/setup_swmod.xml` 246-268). Each hunter waits 1-2 min, picks a random tracked pilot, skips L/XL, attacks with no relation check (`ext/aiscripts/order.sw.bountyhunter.fighters.xml`). A tracked wingman is in the pool for 1 h, so the chance per pick is about 1 / pool size. The player-flown ship is never picked. Source: [swi-bounty.md](research/swi-bounty.md) §6.1-6.2, §3.4.
- **Pass (a hunter targets the wingman):** fleets are at risk after Attack-order kills; mention it in an episode. **Fail:** note the pool size; with a big pool it's just rare. Either way the player-hunt feature has to be ours.

### T07 BHG start's two R-41s

- **Question:** does the start's "bounty on your head" wave reach Bobby? It's the first beat of episode 1.
- **Setup:** S1, a new Bankrupt Bounty Hunter game, nothing touched.
- **Steps:** at start, save `test-S1-start`. Watch the map for two Hutt pirate R-41s; note their distance every minute. Don't run. If they don't arrive within 30 min, fly toward them; then jump out and see if they follow.
- **Record:** spawn time and position; time to contact or the distance when they stop; their orders (map info); fight outcome; whether they follow or despawn.
- **Expected (code):** 10 s after start, 2 `r41_macro` owned by `huttpirates` at sector position (15 km, -500 km) in Lannik, Attack order on `player.ship` with pursue and no relation check, relation behaviour disabled (`ext/md/setup_gamestarts_sw.xml` `SW_Start_bhg` 1544-1600). Nothing else follows. Source: [swi-bounty.md](research/swi-bounty.md) §6.3.
- **Pass:** keep it as the opening; note how long it takes. **Fail:** episode 1 needs a scripted wave (part of our "player is hunted" work).

### T08 Diplomacy tab on SWI's menus (UI spike)

- **Question:** can our own left-bar tab load in SWI's 8.00 Diplomacy menu, open from MD, and reach a fresh start? The bounty-hunter window lives there ([Bounty-hunter window: where it lives in the UI](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/80)).
- **Setup:** S5. Spike extension `swibh_spike_diplotab`: `ui.xml` depending on `ego_detailmonitor` and `ego_detailmonitorhelper` only; Lua on `Helper.getMenu("DiplomacyMenu")` registers `buttonTogglePlayerInfo_on_start`, `createPlayerInfo_on_start`, `createInfoFrame_on_start`, `createInfoFrame_on_info_frame_mode` and `cleanup` (id `swibh_...`), appends a "Bounty Hunting" entry (mode `swibh_contacts`, a vanilla icon) last in `config.leftBar` if missing, and draws a static 3-row table with a sort header. `config` comes from the callback arguments (0.90 has no `uix_getConfig`).
- **Steps:**
  1. Press `N`. Is the tab there on the first open, last in the bar? Open it, click a header and a row, close and reopen.
  2. From MD, `<open_menu menu="DiplomacyMenu" param="[0, 0, 'swibh_contacts']"/>`. Does it land on the tab?
  3. Save and load, open again; `/reloadui`, and check for a duplicate tab.
  4. In S1 (a fresh Bankrupt Bounty Hunter start, before the diplomacy story unlocks), press `N`. Does Diplomacy open? (Already true on save_007, which shows only Factions and Relations and Reputations.)
- **Record:** screenshots; every `[=ERROR=]` and "Widget setup error" line in `debuglog.txt`.
- **Expected (code):** SWI's `menu_diplomacy.xpl` calls all five callbacks (0.91 HF1: 383, 1114, 1173, 1222, 348); `onShowMenu` takes the mode from `param[3]` (712). The left bar is sized before `createPlayerInfo_on_start`, so the first open may miss the entry. SWI's bundled Reputations tab is the precedent. Source: [research/bh-window-entry.md](https://github.com/ecarlste/x4-swi-bounty-hunter/blob/research/bh-window-entry/research/bh-window-entry.md) section 2.
- **Pass:** the window can be built as planned. **Fail:** record the error line; check the callback name and the `ui.xml` load. If `N` is gated on a fresh start, use a Player Info tab instead (same callbacks on `PlayerInfoMenu`).

### T09 Options submenu (UI spike)

- **Question:** can a mod add its own options page through SWI's `displayOptions_modifyOptions`? Gap #16, without SirNukes.
- **Setup:** S5. Spike extension `swibh_spike_options`: Lua callback adds `config.optionDefinitions["bountyhunter"]` with one dropdown and one button, plus a main-menu entry with `submenu = "bountyhunter"`, hidden when `menu.isStartmenu`; values sent with `AddUITriggeredEvent`; MD logs them on `event_ui_triggered` (`common.xsd` 11927) and stores a global.
- **Steps:** open game options in game; open the page; change the dropdown, press the button; save, load, reopen. Check the start menu's options don't show it.
- **Record:** screenshots; MD log lines with the values; errors.
- **Expected (code):** SWI's `gameoptions.xpl` calls the callback before building any page (9492); the submenu handler's last branch shows any id in `config.optionDefinitions` (5424). Source: [bounty-research.md](bounty-research.md#options-without-sirnukes).
- **Pass:** use route 1 for options. **Fail:** try T14 (route 2).

### T10 Warp and Attack a live named hunter on the player

- **Question:** does SWI's rebel-start pattern work outside the rebel start? It's the safest way to have named hunters come for Bobby.
- **Setup:** S4. Hunters awake (wait 30 min, or H10c). An S ship, flown by the player.
- **Steps:** press H10a; watch for the hunter; let it fight; then dodge it and jump out. Repeat once with an M ship.
- **Record:** hunter name and ship; distance it appears at; whether it attacks; relation changes with `indibhg`/`bountyhunters`; what it does after the fight or when you leave.
- **Expected (code):** it is repaired, warped about radar range/3 ahead of the player, and attacks `player.ship` with `checkrelation=false` (`ext/md/sw_plot_rebel.xml` 177-209). Source: [bounty-research.md](bounty-research.md#hunter-factions), [swi-bounty.md](research/swi-bounty.md) §6.3.
- **Pass:** "player is hunted" uses named hunters. **Fail:** use `blacksun`/`huttcartel` groups through `LIB_Create_Ships` instead.

### T11 `create_ship` for `indibhg` from MD

- **Question:** can MD spawn a new named-style hunter with the select SWI's jobs use? Decides between spawning new hunters and borrowing live ones.
- **Setup:** S4. H10b with `tags=[…bhg_random_small]`, then `bhg_firespray`; also `LIB_Create_Ships` with `Ship_Faction=indibhg` and `Ship_CategoryTags`.
- **Steps:** press each; note what spawns.
- **Record:** macro, owner, pilot, loadout of each; MD errors.
- **Expected (code):** jobs use `<select faction="indibhg" tags="[bhg_random_small]"/>` (`ext/libraries/jobs.xml` 21496); `indibhg` categories have no size, so `LIB_Create_Ships` with `Ship_Category_Size` probably finds nothing. Source: [bounty-research.md](bounty-research.md#hunter-factions).
- **Pass:** spawn hunters ourselves. **Fail:** reuse live hunters (T10).

### T12 Our diff patch on SWI's EM file applies

- **Question:** does a diff patch from our extension apply to SWI's `md/kuertee_emergent_missions.xml`? The cap fix and the convo fixes depend on it. Also: does `event_universe_generated` fire when a mod is added to an existing save?
- **Setup:** S0: a custom start with the helper (H12). Then load any older save made without the helper (e.g. `test-S1-start` made before H13 existed, or a fresh one).
- **Steps:** start; grep `debuglog.txt` for the `[swibh]` line from `kEMissions` and for patch errors. Load the older save and check H13's line.
- **Record:** the log lines; any error that names our diff file.
- **Expected (code):** patching another extension's MD file is the standard method, untested here ([bounty-research.md](bounty-research.md#the-lxl-pay-cap)); `event_universe_generated` fires at start and on load (`common.xsd` 17153).
- **Pass:** T01's logging works, and the fixes can be diff patches. **Fail:** check the `SW Interworlds` dependency and the `sel` path; if it still fails, the fix needs another route.
- **PASS on a new game and on an existing save (2026-11-02, [#17](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/17)).** H12 is `tests/game/swibh_tests/extensions/starwarsmod_m1/md/kuertee_emergent_missions.xml` (path-based, SWI's folder); H13 is `md/swibh_hooks.xml`. New game: `make game-test` adds a runner-judged `t12_diff_patch` result (both `[swibh-test] HOOK T12` lines, no error naming the file; plain `[swibh]` is reserved for JSON log events, ADR 0001). Existing save: `make game-test ARGS=-Manual` ([tests/game/README.md](tests/game/README.md#t12-on-an-existing-save)). `make check` shows both `sel`s match one node in SWI 0.90's EM file.
- **Run 1 (2026-11-02, by file name): FAIL.** With the diff at our own `md/kuertee_emergent_missions.xml`, 8.00 logged `Error loading MD file extensions\swibh_tests\md\kuertee_emergent_missions.xml: Ignoring root node 'diff'`: it loads a same-named file in another extension as a new script, not a patch. So a diff on SWI's script must sit at `extensions/starwarsmod_m1/md/` in our extension. H13: `event_universe_generated` fired on the new game at `player.age` 0.
- **Run 2 (2026-11-02, by path): PASS**, no patch errors. `HOOK T12 kEMissions: patched by swibh_tests (event_cue_signalled)`, and one `HOOK T12 CapRewardBasedOnMissionTarget` line per T01 call, e.g. `target hapan_nova_macro, class ship_l, size 1265.75, mult 5, TotalReward 100000000, CapReward 6328.75` (the library sees the reward in ct, so 1,000,000 Cr logs as 100000000, and the cap is a plain number used as ct). So diffs from our extension reach SWI's EM script, and the cap fix and the log hooks can be diffs. 
- **Existing save (`-Manual`, save_007 "Bankrupt Bounty Hunter Test 1", made without the extension, 23,711 s in): PASS.** `HOOK H13 event_game_loaded: gamestart x4ep1_sw_bhg, …, EM kEMissions complete`, then `HOOK T12 CapRewardBasedOnMissionTarget: target rz1awing_macro, class ship_s, size 22, mult 0, …` (the player was on foot, so the hook used a ship it found). So the patched library is what runs in a loaded save. No `HOOK T12 kEMissions` line on load, as expected: `kEMissions` is already complete. H13's answer: **yes**, `event_universe_generated` fires when the extension is added to an existing save, after `event_game_loaded`, with the save's `player.age`. Setup notes: the first load in a new profile shows "Modified game detected" (OK it once), and `-Manual` has no autostart, so load the save from Load Game yourself.

### T13 BountyHunter profession unsilenced

- **Question:** what shows up when BountyHunter is taken off RAP's silent list? Decides whether profession levels go in game or only on the stream overlay.
- **Setup:** S2, after a hunt is accepted. Screenshot Player Info's Professions tab and Diplomacy's Reputations tab first. Then H11.
- **Steps:** do hunt actions (find, scan, attack, finish); repeat over a few hunts on SETA. Check Player Info, the logbook and the Kill Counts panel after each.
- **Record:** screenshots before and after; logbook entries; notifications; whether hunt kills count as Defender (sanctioned) kills in Kill Counts; Lua errors.
- **Expected (code):** level-up notifications, logbook entries and a profession row (RAP 1437-1484, 6840); the swapped `getAllowedProfessions`/`getAllowedReputations` bug (`kuertee_reputations_and_professions_playerinfo.lua` 300-325) may show the wrong rows. Becoming Experienced needs 140 points and 1.5× the next profession, so a level-up may not happen in one session. Hunt kills should count as Defender (RAP `Attacker_Event` 5734). Source: [bounty-research.md](bounty-research.md#silent-profession-and-guild), [swi-bounty.md](research/swi-bounty.md) §5, §8, §14 Q6 and Q12.
- **Pass:** a one-line diff patch can switch it on for the series. **Fail (UI empty or broken):** keep it off and show levels on the overlay (needs T17).

### T14 Optional: SirNukes 1.95 in SWI

- **Question:** does SirNukes' options menu appear in SWI's replaced game options? Route 2 for options, and a direct port of Head Hunter's.
- **Setup:** S5. Install SirNukes Mod Support APIs 1.95 in the test profile only; record its version.
- **Steps:** load `test-S2-start`; open game options; look for its extension options entry; open it.
- **Record:** screenshots; `debuglog.txt` errors from its Lua.
- **Expected:** probably works, since SWI's copy keeps the function names it wraps [inferred]. Source: [bounty-research.md](bounty-research.md#options-without-sirnukes).
- **Pass:** route 2 is available; add to [mods.md](mods.md) candidates. **Fail:** route 1 only.

### T15 How thin is EM's tracker in Hutt space early

- **Question:** how many hunt targets exist in the first hours of a BHG start? Sets the pace of episodes 1-3.
- **Setup:** S1, stock, helper read-only.
- **Steps:** run H8 at 20, 40, 60 and 120 min (SETA between). Save `test-S1-60min` and `test-S1-120min`.
- **Record:** pool size; by class; by sighting faction; how many have `huttcartel` sightings; how many are L/XL.
- **Expected (code):** only 25 % of Attack-order kills count, and kills of 9 factions never count (`kuertee_em_interrupts.xml` `kEM_AttackStart`, EM 61); expiry 4 h for NPCs (EM 11673). Source: [swi-bounty.md](research/swi-bounty.md) §3, §14 Q10.
- **Pass (a handful of S/M targets with Hutt or nearby sightings by 60 min):** the stock loop carries the early episodes. **Fail:** plan a trip to busier space first, or a patch raising the 25 %.

### T16 Sanctions and the Guild representative

- **Question:** what do sanctions cost, does a partial one stop police response, and does the Bounty Hunters Guild have a representative? Sanctions are a story choice for the series (pay to hunt in lawful space).
- **Setup:** S2, an active hunt on a lawful faction's ship (e.g. a `galempire` fighter that killed `newrepublic` ships; H4 + H5 if none). The target near its own faction's station.
- **Steps:** log `faction.bountyhunters.representative` and its station (helper). At the wharf trade NPC, read the sanction prices (partial and full). Buy partial; attack the target near its station; watch police and relation. Reload and repeat with full. With a police licence held (T05), check whether the sanctioned kill also paid a police bounty.
- **Record:** prices; police reaction; relation changes; H9 deltas; the representative's location.
- **Expected (code):** partial ≈ 35-91 k Cr, full ≈ 1-3.9 M Cr; partial stops police calls but not relation loss; full stops both; sanctioned kills skip the vanilla police bounty (`ext/md/notifications.xml` 450-459). Source: [swi-bounty.md](research/swi-bounty.md) §5.4, §14 Q3 and Q9; [vanilla-bounty.md](research/vanilla-bounty.md) §1 SWI.
- **Pass:** sanctions are a usable story beat. **Fail:** record which part failed.

### T17 Export EM's bounty list to a file

- **Question:** can EM's bounty list be written to a file a stream overlay can read? Settles the open question on a "most wanted" overlay.
- **Setup:** S0 for the file test (launch once without `-scriptlogfiles`, once with); then S1 for real data.
- **Steps:** press H8 with `debug_to_file directory="swibh" name="bounties.csv" append="false"`; open the file.
- **Record:** whether the file exists in each launch; path; contents; how often it can refresh without lag.
- **Expected (code):** writes `<profile>\logs\swibh\bounties.csv` only with `-scriptlogfiles`; `.csv` is an allowed extension; `append` defaults to true (`common.xsd` 25597-25640). Source: [headhunter.md](research/headhunter.md) feature 17 and Q9.
- **Pass:** an overlay can poll the file; record in bounty-research.md. **Fail:** fall back to `debuglog.txt` lines.

### T18 Bounty-like vanilla missions in SWI

- **Question:** do vanilla's bounty-like missions show up in SWI, and do Kill Mass Traffic and "Bounty Set" work? Extra contracts for the series.
- **Setup:** S1 and S2; any time on the map's mission offers.
- **Steps:** note Assassinate, Destroy Rarely On Sight ("Bounty Set"), Kill Mass Traffic, Track Ship and Board Ship offers seen. Take one Kill Mass Traffic and one Bounty Set if offered.
- **Record:** offers seen, distance, reward; whether criminal traffic spawns; whether the Bounty Set target is ever found.
- **Expected (code):** SWI shows GMs from 350 km; Kill Mass Traffic's criminal spawns are probably broken (job ids); Bounty Set needs a `ship_m` with `mission, trader` tags for the enemy faction. Source: [vanilla-bounty.md](research/vanilla-bounty.md) §4, open questions 3 and 6.
- **Pass:** extra contract types for episodes. **Fail:** note which are broken; low priority.

### T19 Sanction on a wing leader: wing detach, escorts and relation

- **Question:** when you buy a sanction on a hunt target that leads a wing, does anything split the wing, are its escorts covered, and what does each kill cost and pay? Partial and full both. Raised by AEL-112 ([hunt-protection-ael-112.md](research/hunt-protection-ael-112.md)).
- **Setup:** S2. Two active hunts: one on a wing **leader** (a `*_patrol_s` job ship with escorts, like AEL-112, `newrepublic_mixed_patrol_s` + 3 × `newrepublic_mixedfighters_escort`), and one on a **follower** (a ship with a commander). Use H4/H5 to place one if none is offered. Save before buying.
- **Steps:**
  1. At the Bounty Hunters wharf trade NPC, read both prices.
  2. Buy partial on the leader.
  3. Fly into visual range and check the leader's and escorts' commander and order (helper log, or the map's info).
  4. Kill the escorts with your own ship. Then kill the target, once with your own ship and once (reload) with an AI wingman.
  5. Reload and repeat with full. Then buy partial followed by full (upgrade) and check the debug log's `Sanctions.$sanctionedAttackIds` and `$sanctionedKillIds` lines a few seconds later, since the cleanup may race the new write.
  6. Repeat partial with the follower target.
- **Record:** prices; `SanctionAttack_Visible` debug lines (`commander:` value); escorts' commander after first sight; logbook relation entries per kill (faction, amount, reason); `PlayerKills` debug lines; any money besides the hunt reward; the debrief's "Operation results" line.
- **Expected (code):** RAP 6762-6774 detaches only a ship that has a commander. The leader logs `commander: null`, and its escorts stay on Escort and defend it (vanilla `order.fight.escort.xml` 1428). The follower is detached from its leader. Escorts are never sanctioned, so each kill gives "Unauthorised Kill" and pays nothing (the Hunt pays only the target). The target's own kill gives "Unauthorised Kill" under partial (by design, text 713) and nothing under full when you kill it yourself. [inferred] Under full it may still cost relation if an AI wingman lands the kill. Seen once on AEL-112 (partial, leader): the escorts weren't detached; -3/-2/-2 for the escorts and -2 for the target.
- **Automatable:** the detach logic, in `make game-test`. Spawn a leader with one escort and a lone follower under a commander, signal `md.kuertee_professions.SanctionAttack` on each with `$sanctionType` partial, force an attention change (spawn in the player's zone), and assert the follower's `.commander` is null and the escort's `.commander` is still the leader. The relation part needs a real kill, so it stays manual.
- **Pass:** the behaviour is known for the series (tell viewers that a sanction doesn't split a patrol, and budget for full plus escort losses), and it's a candidate for our first RAP patch (detach or sanction `$ship.subordinates`). **Fail:** if the follower isn't detached either, the hook itself is broken; record it.

### T20 Engagement log events for the player's wing

- **Question:** do `engagement.start` / `engagement.end` ([#23](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/23), `extension/swibh/md/swibh_engagement.xml`) mark every fight of the player's wing, with the right hit counts, hunt key and end reason? And the hook unknowns in [research/combat-hooks.md](research/combat-hooks.md#unknowns-checked-in-game).
- **Automated (`make game-test`, test `engagement`):** the player's ship and one wingman (`t65b_xwing_macro`) fight a TIE Advanced (`tie_advanced_macro`, shielded and about an even match for the X-wing) in turns (the TIE attacks the player's ship while the wingman holds, then the wingman attacks the holding TIE), first registered as a hunt's target, then another in no hunt. Passes when each fight closes one engagement with reason `quiet`, a hit taken by the player's ship and one dealt by the wingman, and the hunt key only on the first. Then `tools/log/game-check.ts` reads the same two engagements from `debuglog.txt` with the log parser. The INFO lines give hit counts and durations.
- **Playtest (the test gamestart can't do these: it can't save, load or change ship, and losing the player's ship ends the run):** with an engagement open (fire on a hostile and stop), (1) load a save: the debug log gets `engagement.end` with `"reason":"load"`; (2) dock and take the pilot seat of another ship within the quiet gap: `"reason":"shipChange"`; (3) lose the player's ship mid-fight: `"reason":"shipLost"`. Also: (4) a fight with ~10 wingmen (hit counts per minute, frame rate); (5) whether turret hits and missiles show in the counts (a missile-only or turret-only ship); (6) a wing with a carrier and drones: docked fighters and drones must not appear in `ships`; (7) whether 20 s splits fights you'd call one (missile boats, long passes).
- **Pass:** every reason appears as described and the unknowns are written into research/combat-hooks.md.

### T21 Rename a wingman's pilot from a script

- **Question:** can a script give an NPC pilot (the person, not the ship) a new name that shows everywhere and survives a save and load? The stage 1 **rename pilot** action needs it, so a character's name can be set after its pick ([Extension scope at launch](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/11)).
- **Why it's open:** the stock UI renames ships and the player only (`SetComponentName(player, text)`, vanilla 8.00 `ui/addons/ego_detailmonitor/menu_playerinfo.lua:1039`; ships and stations through `menu_map.lua` and `menu_station_configuration.lua`). It has no NPC rename. MD's `set_object_name` takes an `object` (`libraries/common.xsd:33741`), and an NPC is an entity, so it may not apply.
- **Setup:** S1. One of the BHG start's R-41s (T07) and its pilot.
- **Steps:**
  1. With a small test Lua (or the debug console), call `SetComponentName` on the pilot's component id with "Test Pilot".
  2. Check the name on the ship's info, the crew list, the map's tooltip and the pilot's comms.
  3. Save, load and check again.
  4. If the Lua call does nothing, try MD `set_object_name` on the pilot entity and record any script error.
- **Record:** which call works, where the new name shows and where the old one stays, and whether it survives the load.
- **Pass:** one call renames the pilot everywhere, and the name survives the load. **Fail:** neither call works, so the name goes in the edit only, and the rename pilot action is dropped.

## Results

Results feed back into [bounty-research.md](bounty-research.md): tick the test there, change its confidence label from **test** to **seen**, and correct the research notes where the game disagrees.

| Test ID | Date | Build / mod state | Result | Notes |
| --- | --- | --- | --- | --- |
| T01 (cap logic, automated) | 2026-10-31 | 8.00 HF4 + SWI 0.90 (+ UIX enabled in profile), `make game-test` | **Cap bites** | SWI's `CapRewardBasedOnMissionTarget` with 1,000,000 Cr: L Nova (size 1,265.75) → 6,328 ct (63.28 Cr); XL ISD-II (size 2,911.5) → 5,822 ct (58.22 Cr). Run: 1 min 34 s, 2 of 2 passed. A real hunt payout is still worth one manual check |
| T01 (KNW-904 target, automated) | 2026-10-31 | 8.00 HF4 + SWI 0.90 (+ UIX enabled in profile), `make game-test` (`t01_knw904`) | **Cap bites; KNW-904 pays 64.81-64.82 Cr** | MC40A Light Cruiser (`mc40a_macro`, newrepublic): class `ship_l`, size 1,296.5, so cap 6,482.5 ct. With the offer's numbers: 35,835 + 1,141,130 × 1.25 = 1,462,247.50 Cr (100% damage, player kill) → 158 + 6,323 = 6,481 ct (64.81 Cr); 35,835 + 114,113 = 149,948 Cr (10% damage, not player kill) → 1,549 + 4,933 = 6,482 ct (64.82 Cr). Each part is cut to whole ct, so any split pays 6,481 or 6,482 ct. The save after the find step stores the same size in EM's damage calculator ([save check](research/save-check-knw-904.md#6-after-the-find-step-second-save-2026-10-31)). Run: 1 min 38 s, 3 of 3 passed |
| T01 (offer half) | 2026-10-31 | 8.00 HF4 + SWI 0.90, no other mods | Natural L/XL offers exist; offer shows the uncapped value, as expected | Bounty Hunters Guild list, offering faction Hutt: "Search and destroy: TFD Battlecruiser Nova (DCU-804)", Reward 19,092.50 Cr + up to 1,109,570.00 Cr, Hard; and HAP Battlecruiser Nova (BIW-225), 32,763.75 + up to 1,054,740.00. Nova is SWI's `hapan_nova_macro` ("Nova-class Battle Cruiser"); class and length still to read in game. Reward line shows "Reward: Reward:" (label doubled, cosmetic). Payout half still to run |
| T01/T03 (offers, large faction) | 2026-10-31 | 8.00 HF4 + SWI 0.90, no other mods | 24 L/XL offers from the Ascendancy (ASC), all Hard | Targets: 20 New Republic (NRL), 2 Empire (IMP), 1 Black Sun (BLS), and an NRL Rhydonium Miner GR-500. Kill part runs from 8,447.50 to 11,794,438.40 Cr (NRL Carrier Group MC80C WGG-356). "Up to" runs from 997,350 to 1,705,329.92 Cr, so it varies per offer, not one flat class value (consistent with random ×1–1.3 and relation boost, inferred). Offer volume follows who is at war with the offering faction: the Hutt Cartel had 2 |
| T02 (manual, S target) | 2026-11-01 | 8.00 HF4 + SWI 0.90, no other mods | **Formula holds; paid 220,810 Cr** | "Search and destroy: NRL Patrol B-wing (AEL-112)", Ascendancy, Medium. Target `bwing_macro`, class `ship_s`, so no cap; 1 M kill; 100% damage, player kill. Offer 107,665 + up to 70,260; after Find 124,785 + about 72,210 (re-rolled on entering Destroy, EM 5897); briefing: kills 124,785 + destruction 96,025 (= a third S roll 76,820 × 1.25) = **220,810 Cr**. The per-ship line shows 48,012.50, half of 96,025 (`$rewardMult` in the text only, EM 7189). No kRAP guild ×2. The briefing's results text is only written after resolve has paid. Confirmed in save_007 (2026-11-01 16:26): logbook "Total reward: 220,810.00 Cr", balance 1,211,863 → 1,432,673 Cr ([save-check-ael-112.md](research/save-check-ael-112.md)). [hunt-pay-ael-112.md](research/hunt-pay-ael-112.md) |
| T19 (manual, leader, partial) | 2026-11-01 | 8.00 HF4 + SWI 0.90, no other mods | **Not detached; escorts unsanctioned** | AEL-112 (`bwing_macro`, leader of `newrepublic_mixed_patrol_s`). Partial sanction 39,700 Cr (full 1,151,670). `SanctionAttack_Visible` ×9, all `commander: null`. Escorts ZRT-957, RNS-504 (killed by AI wingman DBQ-259) and NHJ-691 (player) cost New Republic -3/-2/-2 and paid 0; the target's ram kill -2 (partial, by design). [hunt-protection-ael-112.md](research/hunt-protection-ael-112.md) |
| | | | | |
