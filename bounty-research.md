# SWI Bounty Hunter playthrough: bounty research

Status: **WIP, research.** What SWI 0.90 on X4 8.00 already does for bounty hunting, what vanilla gives us underneath, and what it would take to add Head Hunter - Reloaded's features. Nothing is built or tested in game yet.

[Back to the concept](concept.md). Detailed references, with file and line citations:

- [research/swi-bounty.md](research/swi-bounty.md): SWI 0.90's bounty system.
- [research/vanilla-bounty.md](research/vanilla-bounty.md): vanilla 8.00 bounty features and the 8.00 modding toolkit.
- [research/headhunter.md](research/headhunter.md): Head Hunter - Reloaded 1.01, feature by feature.

Confidence labels used below: **read** = read in code; **inferred** = worked out from code but not seen running; **test** = needs an in-game test.

## Summary

- SWI's bounty loop is real but narrow: a hidden tracker of NPC killers, Search and Destroy missions from one conversation at Bounty Hunters' Guild stations, and paid immunity ("sanctions"). The profession and guild side of kuertee's mods is switched off or silent.
- Nothing hunts the player. The Bankrupt Bounty Hunter start's "bounty on your head" is one wave of two fighters.
- L and XL hunt targets probably pay almost nothing, because of an SWI-only reward cap with a unit mix-up.
- Vanilla pays a fixed bounty per kill near police or defending stations, and SWI keeps it. Vanilla has no wanted level or bounty board.
- Every Head Hunter feature can be built on 8.00 + SWI. The MD and AI code is 8.00-compatible as is. The map tab needs four 9.00-only Lua calls replaced and one `ui.xml` line dropped. Hunter groups need SWI factions. Options can go through SWI's own options-menu hook.
- Three Head Hunter features already have an SWI or vanilla equivalent. The biggest one is the wanted tracker: SWI's Emergent Missions already keeps one, and a board should read it rather than run a second.

## SWI's bounty hunting today

Spec-style summary of [research/swi-bounty.md](research/swi-bounty.md). SWI forces kuertee's mods into "SWI mode" on every load, so this is what every game gets.

### The pieces

| Part | What it does | Player-reachable? |
| --- | --- | --- |
| Bounty tracker (Emergent Missions `Bounties`) | NPC ships that kill while running the vanilla `Attack` order get a pilot record: kills by victim faction and class, and "last known location" sightings per faction | Hidden data. Feeds missions and NPC hunters |
| Search and Destroy missions | Offered by the trade NPC at a Bounty Hunters' Guild station: pick a faction, then a size class; offers open on the map | **Yes**, main loop |
| Sanctions | Pay the Guild to stop police response (partial) or relation loss too (full) on an active hunt target | **Yes** |
| Assessment dialogue | Any faction rep or trade NPC tells you how they view you | Yes, flavour |
| BountyHunter profession, guild, membership, access keys, guild bonus | kuertee's Reputations and Professions | **Dead or silent**: points pile up unseen; no guild rooms, membership or bonus |
| "Ranger" social standing (SSAC) | Earned for killing enemies of the sector owner and for profession actions | Mostly cosmetic (immigration status) |
| 19 named NPC hunters (Boba Fett, Cad Bane, Bossk and others, faction `indibhg`) | Switched on 20-30 min into the game; each picks a random S/M pilot from the tracker and attacks it | You see them; they never target the player-flown ship |
| BHG start "bounty on your head" | Two Hutt pirate R-41s spawned about 500 km out, 10 s after start, with an Attack order on you | Once only |

### Who becomes a target

- Only 25 % of NPC attacks are tracked, and only kills made inside vanilla `order.fight.attack.object`.
- Kills of nine factions never count: `indibhg`, `sith`, `xenon`, `khaak`, `huttpirates`, `mandoraiders`, `valarian`, `blacksun`, `hapes`. So killing pirates never makes anyone a bounty, but pirates who kill lawful ships do become bounties, and so do warring militaries.
- Sightings: per witnessing faction, up to 10, added on kills, tracked attacks and sector changes seen by that faction's stations or satellites.
- Expiry: 1 h without updates for player-owned pilots, 4 h for others.
- The player-flown ship is never tracked. Your AI-flown fleet can be, and NPC hunters can then go after it.

### A hunt, start to finish

1. Dock at a Bounty Hunters wharf (five exist; the HQ is in Milagro) and talk to the trade NPC. The options may sit under "... more. (Mods)".
2. Choose a faction and "small and medium" or "large and extra-large". Offers appear at the stations that hold the sightings, galaxy-wide.
3. Accept (max 3 per rolling hour). A contact NPC is created at the offering station. The briefing step is skipped in SWI.
4. Find: up to 3 beacons at the last known positions, 3 h timer; new sightings update the mission.
5. Scan if the target is disguised, then destroy it. You must have damaged it yourself.
6. Talk to the contact for the payout. Whether this works over comms is untested.

Pay: half of the vanilla mission value of the target's kills against the offering faction, plus a share of the target's own class value by your damage (×1.25 if it's your kill). EM's ×0.5 reward multiplier does not apply to the pay (corrected 2026-10-31, [save check](research/save-check-knw-904.md)); it only halves the per-ship line in the briefing's "Operation results". Each class value is re-rolled at the offer, on entering Destroy and at the debrief, so "up to" is an estimate, not a ceiling. Worked example: an S target with 2 M kills is about 140 k Cr before random and relation factors. Seen in game: an S B-wing with 1 M kill, 100% damage and your kill shows 124,785 + 96,025 = 220,810 Cr ([AEL-112](research/hunt-pay-ael-112.md)).

### Known bugs and gaps that matter for the series

| Gap | Effect | Source |
| --- | --- | --- |
| L/XL reward cap | Caps total pay at `target.size × 5` (L) or `× 2` (XL): metres used as money. Probably a few credits | EM `CapRewardBasedOnMissionTarget` 7340 |
| Profession and guild silent | No level-ups, logbook, profession rows, guild rooms or bonus | RAP `ModFeatures_Init` 39-58 |
| Player never hunted | No persistent bounty on the player character | §3.1, §6.3 in the detail |
| Guild rep can't offer hunts | A faction is compared with an NPC, always false; only station trade NPCs work | EM `Bounties_Convo` 12038 |
| XS targets dropped | XS pilots get no size bucket | EM 11997-12004 |
| Wrong "time left" text | Countdown uses 60 h instead of 1 h | `kuertee_emergent_missions.lua` ~243 |
| No in-game options | Every setting is hard-coded and re-applied on load | §10 in the detail |

## Vanilla features underneath

Short version of [research/vanilla-bounty.md](research/vanilla-bounty.md).

- **Kill bounty**: killing an enemy of the local police faction while holding its police licence pays a fixed bounty (S 30 k, M 60 k, L 300 k, XL 600 k), from the police representative's station. Near a friendly defending station you get a relation bonus and, without a police payout, a third of the bounty. SWI keeps this and sells police licences for most of its main factions (100 k Cr). SWI skips it for sanctioned kills.
- **Crime and police**: attacking non-enemies gets you reported (relation loss) and police sent after you; police scan for contraband. No fines and no wanted level: "criminal" just means your relation to the police faction.
- **Bounty-like generic missions**: Assassinate (has a "Bounty Hunting" variant), Destroy Rarely On Sight ("Bounty Set"), Kill Mass Traffic, Track Ship, Board Ship. SWI shows them from 350 km instead of 50 km. Kill Mass Traffic's criminal spawns are probably broken in SWI.
- **Toolkit**: kill and attack events (`event_object_destroyed`, `event_player_owned_killed_object`, `event_object_attacked`), relation actions, `LIB_Create_Ships`, `create_offer`/`create_mission`, the RML mission libraries, and MD-to-Lua data via the player blackboard (`GetNPCBlackboard`, used by both vanilla and SWI's own Lua).
- **UI**: vanilla 8.00 menus have no callback API. SWI's replaced menus carry kuertee UI Extensions callbacks, so a mod for SWI should use those.

## Head Hunter features

Head Hunter - Reloaded 1.01 by IceDesign, built for 9.00. Full inventory in [research/headhunter.md](research/headhunter.md).

1. Setup, defaults and save migration.
2. General kill bounty: credits for hostiles your ships attacked, if they die within 10 min.
3. Wanted bounty from kills: any ship that kills gets a growing bounty, including your own ships.
4. Wanted bounty from station-module destruction.
5. Claiming: whoever kills a wanted ship collects; you get credits and reputation.
6. Capture, boarding and bail-out handling.
7. Cleanup and maintenance timers.
8. Wanted Board: a map right-sidebar tab with filters and a sortable table.
9. Bounty labels on the holomap.
10. "Wanted ship nearby" alerts.
11. Hunter groups: which factions send them, and when.
12. Hunter group size and equipment.
13. Hunter AI order (`HeadHunter`).
14. Hunter end states and bribing them off over comms.
15. HeadHunter Radar Mod ware.
16. Options menu (SirNukes Simple Menu API).
17. Logging to a file.

## Gap: what we can and can't build on 8.00 + SWI

Status: **a** = we know how to build it; **b** = SWI or vanilla already has an equivalent; **c** = unknown. "Was c" marks items that were open and are now answered (see the subsections).

| # | Feature | Status | How / what's unknown | Confidence |
| --- | --- | --- | --- | --- |
| 1 | Setup, migration | a | Same MD. `event_universe_generated` fires at game start and on load (`libraries/common.xsd` 17153), so adding the mod to a running save works | read |
| 2 | General kill bounty | b | Vanilla police bounty and station-defence reward (vanilla §1), live in SWI with a police licence. Building HH's version on top is easy (`event_player_owned_attacked_object` + `event_object_destroyed`) but double-pays | read |
| 3 | Wanted from kills | b | EM's tracker: `global.$Bounties.$pilots`, with `$kEM_kills.{faction}.{class}` and `$kEM_lastKnownLocation.{faction}` per pilot. Differs from HH: 25 % sampling, 9 excluded victim factions, player-flown ship never tracked | read |
| 4 | Station-module bounty | a | Engine side all present in 8.00 | inferred that SWI module wares have resource lists; test |
| 5 | Open claim by any killer | a | `event_object_destroyed group=` over the wanted ships; `transfer_money`; notification and logbook. Pays without a mission, unlike SWI's hunts | read |
| 6 | Capture and bail handling | a | `event_object_abandoned`, `event_object_changed_owner`, `event_object_claimed`. Fix HH's "voice but no money" bug | read |
| 7 | Cleanup | b | EM's own expiry (1 h / 4 h, every 30 min) if we reuse its tracker | read |
| 8 | Wanted Board map tab | a (was c) | SWI's map has all five callbacks with HH's signatures. Drop the `kuertee_ui_extensions` dependency and swap four 9.00-only Lua calls ([below](#map-tab-on-swis-800-menus)) | read; layout needs test |
| 9 | Holomap labels | a | `add_holomap_text`, `isinliveview` in 8.00 | read |
| 10 | Nearby alerts | a | `event_gravidar_has_scanned`, `count_gravidar_contacts`, `global.$PlayerShipsGroup` (SWI keeps it) | read |
| 11 | Hunter factions | a (was c) | Roster from SWI factions with military ships and stations, or reuse SWI's named `indibhg` hunters ([below](#hunter-factions)) | read; spawning needs test |
| 12 | Hunter size and equipment | a | `LIB_Create_Ships` has identical params in 8.00 and 9.00; the mod wares exist in SWI. Fix the three-way `HuntersCreated` race by giving each create its own end cue | read; race is inferred |
| 13 | Hunter AI order | a | All elements, orders and interrupt handlers exist in 8.00 | read |
| 14 | Bribe over comms | a | Conversation events are vanilla. SWI's text has no pages 10002 or 10101, so the vanilla voice lines are untouched | inferred; test |
| 15 | Radar mod ware | a | SWI replaces all of `equipmentmods.xml`. Depend on SWI (`id="SW Interworlds"`) so our `add` loads after it | inferred; test |
| 16 | Options menu | a (was c) | SWI's options menu has a `displayOptions_modifyOptions(options, config)` callback that can add a whole submenu. SirNukes 1.91+ also supports 8.0 ([below](#options-without-sirnukes)) | read; test |
| 17 | Logging | a | `debug_to_file` exists, but only writes if the game is started with `-scriptlogfiles` (`common.xsd` 25600) | read |
| — | Player has a bounty and is hunted | a (was c) | Not in SWI. Build it from SWI's own rebel-start pattern ([below](#the-player-is-never-hunted)) | read; test |
| — | One wanted list or two | b (was c) | Reuse EM's tracker for the board; don't run HH's second tracker ([below](#reusing-emergent-missions-bounty-list)) | read; design choice |

Counts over the 17 Head Hunter features: 14 a (3 of them were c), 3 b, 0 c. Plus the two cross-cutting rows. What's still unknown is now a short list of in-game tests, not a blocker.

SWI's own gaps:

| Gap | Fixable? | How | Confidence |
| --- | --- | --- | --- |
| L/XL pay cap | Yes | Diff patch on EM's `CapRewardBasedOnMissionTarget` ([below](#the-lxl-pay-cap)) | seen in automated test (library call); a real hunt payout not yet |
| Silent profession, no guild | Partly | Remove BountyHunter from the silent list; leave guilds off ([below](#silent-profession-and-guild)) | read; UI result needs test |
| Player never hunted | Yes | New MD ([below](#the-player-is-never-hunted)) | read |
| Guild rep can't offer hunts; XS targets dropped | Yes | Small diff patches on `Bounties_Convo` and `Bounties_PrepareMissionsForConvo` | read |
| Debrief needs docking? | Unknown | Test first; may not matter | test |
| Countdown text | Not worth it | Lives in SWI's Lua file; fixing means replacing the whole file | read |

### Map tab on SWI's 8.00 menus

**The hooks exist.** SWI's `subst02/ui/addons/ego_detailmonitor/menu_map.xpl` calls every callback HH registers, with the same arguments [read]:

| Callback | SWI line | Passes |
| --- | --- | --- |
| `createRightBar_on_start` | 20139 | `config` (HH reads `config.rightBar`) |
| `createInfoFrame2_on_menu_infoModeRight` | 19946 | `menu.infoFrame2` |
| `refreshInfoFrame2_on_start` | 7193 | nothing |
| `ic_onRowChanged` | 27274 | `row, rowdata, uitable, modified, input, source` |
| `ic_onSelectElement` | 27489 | `uitable, modified, row, isdblclick, input` |

`menu.registerCallback` is at 31575. SWI's own kuertee Lua registers map callbacks the same way and loads from `starwarsmod_m1/ui.xml` with only `ego_*` dependencies [read].

**`ui.xml` dependency.** The 8.00 addon schema says a `<dependency>` addon that isn't available stops the addon loading (`ui/core/addon.xsd` 61-64) [read]. SWI has no `kuertee_ui_extensions` addon, so HH's Lua would never load. Fix: depend on `ego_detailmonitor` and `ego_detailmonitorhelper` only, as SWI does. `Register_OnLoad_Init` turns out to be SirNukes' Lua loader (SirNukes 1.91 changelog), not UIX; HH falls back to calling `init()` directly when it's missing [read].

**9.00-only Lua and 8.00 replacements:**

| 9.00 call (where defined) | What it is | 8.00 replacement | Confidence |
| --- | --- | --- | --- |
| `frame:addFrameBorder`, table `frameborder=`, `Helper.getFrameBorderColor/LineWidth` (`ui/addons/ego_detailmonitorhelper/helper.lua` 3949, 13923-13940 in 9.00) | 9.00's panel borders (new widget type) | Drop them. 8.00 tables already have `backgroundID`, `backgroundColor`, `backgroundPadding` (8.00 `helper.lua` 3017-3019). Unknown properties only log a "Widget setup error" (8.00 `helper.lua` 3365-3371), but `addFrameBorder` is a nil call and would stop the menu | read |
| `Helper.sortButtonHeight` (9.00 `helper.lua` 562, = 20) | Sort-header button height | 8.00's own map sort headers use `config.mapRowHeight` = `Helper.standardTextHeight` (8.00 `menu_map.lua` 1476, 14964; SWI `menu_map.xpl` 1484). Use `Helper.standardTextHeight` | read |
| `mapMenu.updateInputBar()` (9.00 `menu_map.lua` 20657) | 9.00's gamepad hint bar | No 8.00 counterpart. Guard it, as HH already does at line 834 | read |
| `mapMenu.panelState`, `panelPins` | 9.00 panel mode | Already nil-guarded in HH | read |

`Helper.color.*` is not in vanilla 8.00 but is in SWI's `helper.xpl` (629-633), so it's fine on SWI only [read].

### Options without SirNukes

Two routes:

1. **SWI's own hook (recommended).** SWI's `gameoptions.xpl` calls `displayOptions_modifyOptions(options, config)` before building any options page (line 9492), and SWI already uses it to hide Timelines (`starwarsmod_m1/ui/sw_gameoptions.lua`). Because `config` is passed, a callback can add `config.optionDefinitions["bountyhunter"]` and a main-menu entry with `submenu = "bountyhunter"`. The submenu handler's last branch shows any id in `config.optionDefinitions` (line 5424). Value types available: `button`, `dropdown`, `slidercell` [read]. Values go to MD with `AddUITriggeredEvent` and are stored as MD globals, so they're per-save. Hide the entry in the start menu (`menu.isStartmenu`) [inferred].
2. **SirNukes Mod Support APIs.** Its changelog says 1.91 is the "update for x4 8.0", 1.93 updates the chat window API for 8.0, and 1.95 (2025-12-08) is the latest [read, GitHub `bvbohnen/x4-projects`]. Its options menu wraps `OptionsMenu`'s `displayOptions`, `submenuHandler`, `viewCreated` and the row and select handlers. SWI's copy keeps those function names, so it probably works [inferred; test]. It would also make SWI's dead debug chat commands reachable (they need the Chat Window API).

Route 1 adds no dependency. Route 2 is less code if we port HH's options as they are.

### Hunter factions

HH's roster (Scale Plate, Buccaneers, Fallen Families, Argon and others) is inactive in SWI and has no ships. Counted from SWI's `ext/libraries/ships.xml` (categories tagged `military`) and `god.xml` (station `owner=` entries, including some commented out, so approximate) [read]:

| Faction | Military S / M / L / XL | Stations (god.xml) | Fit |
| --- | --- | --- | --- |
| `blacksun` | 4 / 1 / 1 / 1 | ~10 | Criminal hunters; already hostile-ish to everyone |
| `huttcartel` | 6 / 1 / 3 / 1 | ~48 | Natural for a Hutt-space start; police faction |
| `mandodw` | 5 / 3 / 4 / 3 | ~42 | Mandalorian hunters |
| `valarian` | 2 / 2 / 2 / 0 | ~10 | Pirate clan |
| `mandoraiders`, `huttpirates` | 1-2 S/M only | 4 or none | Small groups only |
| `galempire`, `newrepublic` and other main factions | many | many | As "the law" when relation is bad, like HH's threshold rule |
| `indibhg` | 0 tagged `military` | 0 | Uses named tags (`bhg_random_small`, `bhg_random_med`, `bhg_firespray`…) and its categories have **no size**, so `LIB_Create_Ships` with `Ship_Category_Size` probably finds nothing [inferred] |

Two ways to get the iconic hunters instead of generic fighters:

- **Reuse the live named hunters.** SWI's MC80R start already does it: `ext/md/sw_plot_rebel.xml` `BountyHuntersAttacks` (177-209) finds an `indibhg` ship with `find_ship_by_true_owner`, repairs it, warps it near the player out of radar range/3, and gives it an `Attack` order on `player.ship` with `checkrelation=false` [read]. This works in shipped SWI, so it's the safest route.
- **Spawn new ones** with `create_ship` and `<select faction="indibhg" tags="[bhg_random_small]"/>`, the same select SWI's jobs use (`jobs.xml` 21496) [read that jobs use it; test that MD can].

Spawn position: HH falls back to the target's sector, which matters for `indibhg` (no stations).

### Reusing Emergent Missions' bounty list

Recommendation: one wanted list, EM's. A board that reads `global.$Bounties.$pilots` shows the same targets the Guild's Search and Destroy missions offer, so the board, the missions and SWI's named hunters agree. A second HH tracker would label different ships as wanted than the Guild does.

- Data per pilot: `$kEM_kills.{faction}.{class}` and `$kEM_lastKnownLocation.{faction}` (list of `{$sector, $station, $time, …}`) [read, EM 5274, 6649, 11369].
- Bounty value: compute it the way `Mission_Hunt_GetBaseRewardData` does, so the board matches the mission pay.
- Updates: listen for `K_ObjectAttacks_AttackerKilledObject` on `player.galaxy` and `kEM_Bounties_UpdateLastKnown` on the pilot (EM 11485, 11369) [read]. Read only, never write EM's data.
- Pass to Lua the way HH and SWI already do: MD writes a table to `player.entity`'s blackboard; Lua reads `GetNPCBlackboard` (SWI `kuertee_emergent_missions.lua` 85) [read].
- What we'd add on top: an open claim (feature 5) for kills without a mission, and the player's own entry (next section). Accept that the board is thinner than HH's (25 % sampling, excluded factions) [inferred; test how thin].

### The L/XL pay cap

`CapRewardBasedOnMissionTarget` (EM 7340-7375) sets the cap to `$MissionTarget.size × 5` (L) or `× 2` (XL) and rescales both reward parts to it with `ct`. `size` is "Size (based on bounding box)", type length (`libraries/scriptproperties.xml` 63), and money is numeric in cents (2323) [read]. So an L ship of a few hundred metres caps at about 1,500 ct, roughly 15 Cr [inferred].

**Automated test, 2026-10-31** (`make game-test`, T01): calling SWI's own library with a 1,000,000 Cr reward, the Nova-class Battle Cruiser (`hapan_nova_macro`, L, size 1,265.75) is capped to 6,328 ct = **63.28 Cr**, and the ISD-II (`isd_2_macro`, XL, size 2,911.5) to 5,822 ct = **58.22 Cr** [seen]. XL pays less than L. The same test with a real contract's target, KNW-904 (`mc40a_macro`, MC40A Light Cruiser, L, size 1,296.5) and its offer of 35,835 + up to 1,141,130 Cr, pays **64.81 Cr** at 100% damage and **64.82 Cr** at 10%: the cap is 6,482.5 ct whatever the damage share ([save check](research/save-check-knw-904.md)) [seen]. A real hunt's payout, after any multipliers applied after the cap, still needs one manual check. The same library is also called from three other places in EM (701, 1362, 3000), so the fix reaches those missions too [read].

Fix: a diff patch in our extension on SWI's `md/kuertee_emergent_missions.xml` that sets `$rewardCap_mult` to 0 (no cap) or multiplies the cap by a sensible credits value. We'd need SWI as a dependency so the patch applies after SWI's file [inferred: patching another extension's MD file is a standard method but untested here]. The automated test confirms the cap bites; the fix is the first mod item.

### Silent profession and guild

`ModFeatures_Init` (RAP 39-58) re-applies SWI mode on every load: `$guilds = []` and every profession and reputation in `$silentReputationsAndProfessions` [read].

- Removing BountyHunter from the silent list (one diff on that `set_value`) should bring back level-up notifications, logbook entries and the profession row in Player Info [inferred from the checks at RAP 1437-1484, and RAP 6840 passing the list to the UI]. Watch the swapped `getAllowedProfessions`/`getAllowedReputations` bug in the Player Info Lua, which this would expose [read; test].
- Turning guilds back on is not recommended: it brings back guild rooms, NPCs, discounts and bonuses SWI chose to disable, across all professions. The guild reward bonus needs guilds on.
- The SWI "Invitation" message and `bountyhunters` licences already give the Guild a presence; profession levels could be shown on the series' overlay instead of in game.

### The player is never hunted

SWI tracks no bounty on the player character. Candidate approach for the series, all 8.00 MD:

1. A player "heat" value in our own MD, raised by the player's crimes: `event_player_relation_changed` with kill or attack reasons, police reports, or kills of factions that have a Guild presence (vanilla §2, §8) [read: events exist].
2. While heat is above a threshold, on sector changes, a chance to send hunters: a named `indibhg` hunter via the `BountyHuntersAttacks` pattern, or a `blacksun`/`huttcartel` group via HH's spawn code.
3. Ways to clear it: HH's bribe-over-comms, paying the Guild (like sanctions), or a time decay.
4. Show it on the Wanted Board as the player's own row.

Alternative: diff-patch SWI's `order.sw.bountyhunter.fighters.xml` so the named hunters sometimes pick `player.ship` while heat is high. Less code, but it changes all 19 hunters at once [read: the pick is one `set_value`].

## Things to test in game

How to run each one, and the results: [test-plan.md](test-plan.md).

Most important first:

- [ ] Complete one S/M hunt and one L/XL hunt on a fresh BHG start; note pay against the formula. (Confirms the cap bug.)
- [ ] At a Bounty Hunters wharf trade NPC: do the hunt options appear, under "... more. (Mods)"? How many offers after the first hour?
- [ ] Debrief: can a hunt be finished by comms, or only by docking at the offering station?
- [ ] Does a police licence pay vanilla kill bounties in SWI space (Hutt Cartel first)?
- [ ] Do the 19 named hunters show up, and do they ever go after the player's AI ships?
- [ ] Do the BHG start's two R-41s reach the player?
- [ ] Load a minimal test extension with a map tab using SWI's callbacks and the 8.00 replacements; check `debuglog.txt`.
- [ ] Add an options submenu through `displayOptions_modifyOptions`; check it opens and saves.
- [ ] Warp and Attack-order a live `indibhg` hunter on the player (the rebel-start pattern) outside the rebel start.
- [ ] Try `create_ship` with `select faction="indibhg" tags="[bhg_random_small]"` from MD.
- [ ] A diff patch on SWI's `kuertee_emergent_missions.xml` from our extension applies (check with a harmless debug change).
- [ ] Removing BountyHunter from the silent list: what shows up in Player Info and the logbook?
- [ ] Optional: SirNukes 1.95 alongside SWI: does its options menu appear in SWI's game options?
- [ ] How thin is the EM tracker in Hutt space early on (25 % sampling)?

## Open questions

- Do we want the vanilla police bounty, SWI's hunts and a Head Hunter-style open claim all paying, or pick one or two?
- Port Head Hunter (fork it, with credit and permission) or write our own smaller mod that reads EM's data?
- Is the player's bounty a story device for the series (fixed waves at story beats) or a system (heat, decay, bribes)?
- Which hunters should come for Bobby: the named ones, Hutt Cartel enforcers, Black Sun, or a mix by who's angry?
- Does any of this go into A Pirate's Life's SWI profile instead of a separate mod?
- Viewer interaction: can a "most wanted" list from EM's data be exported for stream overlays (log file, or the `-scriptlogfiles` output)?

## Notes and thoughts

- (Add notes here.)
- (Ideas from playing the stock loop go here first.)
