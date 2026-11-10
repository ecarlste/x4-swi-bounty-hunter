# SWI 0.91 HF1 against 0.90: what changed for us (2026-11-05)

For [#42](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/42) (move the test install to SWI 0.91 HF1). Read from files; the game tests then ran on the new install (see **In game** below). Tags: [read] = seen in the files; [inferred] = follows from what was read, not checked in game.

**In game (2026-11-05):** `make game-test` passed 7 of 7 on X4 8.00 + SWI 0.91 HF1 + Reaper's Ship Pack 2.8 + Equipment tooltips. T12 confirms swibh's diff on EM still applies now that EM lives in `ext_02`. The cap tests pay the same as on 0.90: L (size 1265.75) 6328, XL 5822, KNW-904 (MC40A) 6481/6482. By hand, the same day: the existing BBH test saves load on 0.91, and a new Bounty Hunter start with the Ship Pack runs. That session's `debuglog.txt` (17:02) has no script or patch errors from the Ship Pack, only unsigned-file notices and a duplicate ware (below). Other errors in it, none from this update:
- about 40 `Cannot find XML file component macro 'heroes_*_macro'` and 322 `ConstructionPlanSequence::Import` errors. No `heroes_` name is in any catalog of SWI 0.90 or 0.91 or in the Ship Pack, and the game tests' log has none, so they come from something the session loaded (a save or the player's construction plans) [inferred];
- `md.kuertee_ssac.ThirdPartyModEvents_onkCHCEvent_PayFine: Property lookup failed: md.kuertee_chc` (SWI's SSAC looks for kuertee's Crime Has Consequences, which isn't installed) [read], in SWI's own `ext02/md/kuertee_ssac.xml`;
- `WareDB::Import(): Duplicate definition of 'turret_m_llaser_purple_unhittable'`: the name is only in the Ship Pack (its `ext_01.dat`), not in SWI's libraries, so the Ship Pack defines it twice [read]. X4 keeps one definition and goes on.

Sources:

- SWI 0.91 HF1 as downloaded: `E:\x4-dev\staging\swi-0.91hf1\starwarsmod_m1` (`content.xml` version `091`, date 2025-12-24, description "Star Wars 0.9.1 HF", still `<dependency version="800"/>` and the same five DLC dependencies). No readme or changelog is in the archive or in any catalog [read].
- Unpacked to `E:\x4-dev\reference\mods\swi-0.91hf1` (`/mnt/e/x4-dev/reference/mods/swi-0.91hf1`), md5-checked against the `.cat` files:
  - `ext02/`: all of `ext_02.cat` (345 files: `aiscripts/`, `libraries/`, `md/`, `t/`);
  - `ext/`: the `.xml`, `.lua` and `.txt` files of `ext_01.cat` (2,667 of 26,630 entries: `assets/` component and macro files, `index/`, `maps/`, `cutscenes/`, `extensions/`); textures, models and sound were not unpacked;
  - `subst02/`: all of `subst_02.cat` (the 20 UI menus);
  - `starwarsmod_m1/`: the loose files (`content.xml`, `ui.xml`, `ui/`) and the five `.cat` files.
  - `subst01/` and `subst03/` were not unpacked: `subst_01.cat` and `subst_03.cat` are byte-identical to 0.90's (loading screens and DLC loading-screen images) [read].
- SWI 0.90 reference: `E:\x4-dev\reference\mods\swi-0.90` (its `ext/` = the scripts of 0.90's `ext_01`), and the packed 0.90 backup `E:\x4-dev\backup\extensions-2026-11-05\starwarsmod_m1-0.90` for the catalog listing and 0.90's asset XML.
- Reaper's Ship Pack 2.8: `E:\x4-dev\staging\rsp-2.8\starwars_rsp` (`ext_01.cat`; its XML was unpacked to a scratch folder).
- The unpacker and diff scripts were throwaway TypeScript in the session scratch folder, not in the repo.

Line numbers: "EM" = `md/kuertee_emergent_missions.xml`, "RAP" = `md/kuertee_professions.xml`. 0.90 lines are in `swi-0.90/ext/`, 0.91 lines in `swi-0.91hf1/ext02/`.

## Flags (read first)

Nothing found breaks a decision, swibh or Equipment tooltips. Three things need action before or during the move:

1. **`make check` needs a change to read 0.91.** In 0.91 every script and library moved from `ext_01.cat` to the new `ext_02.cat`. `tools/check_game_tests.py` reads SWI's scripts from `SWI_UNPACKED/ext/md` and `ext/libraries`, so pointing `SWI_UNPACKED` at `swi-0.91hf1` as is makes the MD-diff and faction/ware checks fail ("no script at this path"). It needs to read `ext02/` (ext_02 overrides ext_01 by path). With a scratch folder whose `ext` points at `swi-0.91hf1/ext02`, `make check`'s Python checks **pass on 0.91**: all four swibh `sel`s and both swibh_tests `sel`s match exactly one node in 0.91's EM; factions, wares and macros resolve [read: ran `check_game_tests.py` with that `SWI_UNPACKED`]. *Note (2026-11-10, #92):* the Python check was ported to TypeScript, so this flag now applies to `tools/offline-check.ts` (SWI's folders are listed by `swiExtDirs` in `tools/offline-check/config.ts`). **Done (2026-11-10, #93):** the offline checks read `ext02/` ahead of `ext/`, by path, for MD-diff targets and library ids (`swiFile` in `tools/offline-check/config.ts`). An `ext02/` library replaces `ext/`'s file of the same name, so an id only `ext/`'s copy has fails. `make check` passes with `SWI_UNPACKED` at `swi-0.91hf1` and at `swi-0.90`.
2. **T12 and the game tests should run again on 0.91.** The swibh diff sits at `extensions/starwarsmod_m1/md/kuertee_emergent_missions.xml`, and X4 patches by path, so the move to `ext_02.cat` shouldn't matter [inferred]. That's the one engine assumption that changed, so a `make game-test` on 0.91 is the check.
3. **RSP's only hard gate is the version.** Every file Reaper's Ship Pack 2.8 patches exists in 0.90 too, and it names nothing new in 0.91. So installing SWI 0.91 is all RSP needs. It also adds a 20th named hunter and a diff on SWI's `md/BridgeAlertSound.xml` that mods.md didn't list (section 7).

## 1. Change set overview

Catalog listings compared by md5 (0.90 `ext_01` against 0.91 `ext_01` + `ext_02`): **107 added, 1 removed, 1,017 changed** [read].

- **No path is in both `ext_01` and `ext_02`.** `ext_02` holds exactly the 345 script files 0.90 kept in `ext_01` (49 `aiscripts`, 76 `libraries`, 211 `md`, 9 `t`); 0.91's `ext_01` no longer has any of them. So nothing is overridden between the two in 0.91 [read].
- **Most "changed" files are line endings.** Of the 913 changed asset XML files, 814 differ only in whitespace or CRLF; 99 have real changes (mostly station modules: production 29, defence 11, storage 11, dock 10) [read].
- Scripts with real changes (ignoring whitespace): text files `t/` (5 languages), `md/kuertee_emergent_missions_rescue.xml` (669 lines), `libraries/wares.xml` (614), `characters`, `constructionplans`, `character_macros`, `md/diplomacy.xml`, `charactergroups`, `libraries/jobs.xml` (159), `md/kuertee_ssac.xml` (122), EM (115), `factions.xml` (75), `setup_swmod.xml` (68), `fight.attack.object.station.xml` (65), `swi_story_sith.xml` (60), `gm_killmasstraffic.xml` (36), RAP (31), `gamestarts.xml` (23), `ships.xml` (20), `order.sw.bountyhunter.fighters.xml` (9), `shipgroups.xml` (8) and small ones. `loadouts.xml`, `genericmissions.xml`, `factionlogic*.xml` and 30 other files differ only in whitespace [read].
- Added: 47 cluster environment files (a new `desertplanet_sm` backdrop), Sith habitat and scrap-recycler station modules, two "dummy" ship macros (`hammerheadcruiser_red_dummymacro`, `venator_01_dummymacro`), Envoy Pack (`ego_dlc_mini_02`) story stubs that blank its three stories, three Timelines refugee scenario stubs, 21 silence sound files. Removed: one station-module icon [read].
- The galaxy map (`maps/swgalaxy/`) and the test galaxy (`maps/swshowcase/`) differ only in whitespace [read].
- UI: all 20 menus in `subst_02` changed, but 15 only gained one line, `function menu.uix_getConfig() return config end`. Map, player info and diplomacy also gained four context-menu callbacks; the map gained a boarding-order fix (section 4) [read].

## 2. The hunt and the pay cap: unchanged

- **The whole Hunt section of EM is identical**, only 5 lines later: `Mission_Hunt` 5251 → 5256 (still `version="11"`), `Mission_Hunt_CleanUp` 5497 → 5502, `Mission_Hunt_CreateMission` 5588 → 5593, `Mission_Hunt_Resolve` 5630 → 5635, the cap call 5684 → 5689 [read].
- **`CapRewardBasedOnMissionTarget` is identical** at 7345-7382 (was 7340-7377): `$rewardCap_mult` 5 for L and 2 for XL, still a local, still gated only on `kEMissions.$IsSWIExists`. The Mayday, Escort and Sector Raid calls (now 703, 1364, 3005) are still commented out, so only the Hunt is capped [read]. Design feature 3 and [cap-fix-facts.md](cap-fix-facts.md) stand.
- EM's `UserSettings` (`$rewardMult` 50 and the rest) is unchanged [read].
- `lib_reward_balancing`: neither 0.90 nor 0.91 patches or calls it [read: no match in either].
- The target sizes behind the cap tests can't have changed: the macro and component files of `hapan_nova`, `isd_2` and `mc40a` are byte-identical. Only the MC40's engine and shield macros changed [read]. So `t01_pay_cap`'s and `t01_knw904`'s expected pay should still hold [inferred].
- Line offsets for EM citations in our docs: 0.90 line + 2 (after 11), +3 (after 2065), +4 (after 2385), **+5 from about 2597 to 8128** (all the Hunt and the cap library), +6 after 8141, about +10 after `GetSectorClass` (8426), +71 after 10444 [read].

## 3. Other EM and kuertee changes

- **`GetSectorClass` (EM 8374) was rewritten.** A sector is now "frontier" when *any* adjacent sector is contested by more than one non-player faction, owned by someone else, or unclaimed. In 0.90 it took an adjacent sector that was enemy-owned or contested by an enemy, or the sector being contested by the faction itself. It also returns a new `$causes` table [read]. It drives Escort sector checks, the **Sector Raid patrol offers** (`Missions_SectorRaids_CreateOffer`: patrols are only offered for frontier, enemy or free sectors) and the briefing text, plus SSAC's station data. Expect more sectors to count as frontier, so possibly more patrol offers [inferred]. The Hunt doesn't call it [read].
- A new library `GetStation` (EM 10457) finds the nearest dockable station with a trade NPC. Nothing calls it yet [read].
- The rescue-mission debrief now computes `$reward_total` in each branch (a fix), and `OnModLuaInited` registers an interact-menu action group for EM [read].
- `kuertee_emergent_missions_rescue.xml` (civilian rescue missions, not hunts) got a large rework: cue versions 6 → 9 with save patches, new stuck-passenger fixes [read].
- **RAP and SSAC debug spam is off.** 0.90 forced `UserSettings.$debugChance = 100` on every SWI init (RAP 694-697) and started SSAC at 100. 0.91 removes the RAP override and sets both to 0, with a save patch (`UserSettings` version 17 in RAP, 7 in SSAC) [read]. `debuglog.txt` should be much quieter [inferred].
- RAP's guild placement now checks `ModFeatures.$guilds` or `.$professions` before adding a guild NPC. In SWI mode `$guilds` is still empty and `$professions` still holds BountyHunter, so the Bounty Hunter NPC at defence stations and headquarters still appears [read]. The profession and guild stay silent (`$silentReputationsAndProfessions` unchanged) [read].
- RAP's sanction cues (`Sanctions` 6742, `SanctionAttack` 6753) are unchanged; swibh's `md.kuertee_professions.SanctionAttack` and `Sanctions.$sanctionedAttackIds`/`$sanctionedKillIds` still exist [read]. The wing detach (`remove_object_commander`) moved from RAP 6771 to 6790. RAP offsets: +1 after 697, +15 after 2924, +19 after 6147 [read].
- `kuertee_professions_guilds.xml`: the Saboteur guild's laser-tower template is skipped in SWI. Nothing else changed [read].
- `playerreputation.xml`: SSAC's forced recalculation flag is now read from `TrackPlayerReputation` (a scope fix) [read].

## 4. UI Extensions menus (`subst02`)

- **Equipment tooltips is safe.** All three callbacks it registers are still called, with the same code, one line later each: `displaySlots_on_before_create_button_mouseovertext` (ship configuration 5480, 5760), `displayModules_on_before_create_button_mouseovertext` (station configuration 2843), `display_on_after_create_equipment_text` (blueprint/licence trader 421). `menu.registerCallback` is still in all three menus [read]. The installed mod depends only on `SW Interworlds` and `ego_detailmonitor`, so the one-line dependency patch carries over unchanged [read].
- The five map callbacks Head Hunter's board needs are still there: `createRightBar_on_start` 20184, `createInfoFrame2_on_menu_infoModeRight` 19991, `refreshInfoFrame2_on_start` 7238, `ic_onRowChanged` 27375, `ic_onSelectElement` 27590, `registerCallback` 31676. The options hook `displayOptions_modifyOptions` is at `gameoptions.xpl` 9496 [read].
- New callbacks: `createContextFrame_on_start/_on_end` and `refreshContextFrame_on_start/_on_end` (map, player info, diplomacy) and `menu.uix_getConfig()` in every menu [read]. These look like a newer kuertee UI Extensions build. Whether kuertee's UIX installed separately would still override SWI's menus stays open [inferred].
- Map: before boarding orders, ships whose commander is also selected are moved ahead of the top-level commander, so sub-wings get their own commander's behaviour (a kuertee fix) [read].
- Loose Lua (`starwarsmod_m1/ui/`): nil guards and sorting in EM's crew list, RAP's player-info page and SSAC [read].

## 5. Ships, jobs and factions behind the hunting ladder

- **No ship ware changed price, licence or owner list** except two hulls that the Sith now also sell (`quad_jumper`, `cor_scrapper`). Two weapons gained sellers (`weapon_kx20_m_laser`: Incom, Rendili; `weapon_kv22_m_laser`: TransGalMeg). Two XL engines were removed (`engine_xl_igt10`, `engine_xl_goliath`) [read]. The ladders in [licence-costs.md](licence-costs.md) and [corp-ship-ladder.md](corp-ship-ladder.md) keep their ship prices.
- **Licence changes** (`factions.xml`) [read]:
  - Mon Calamari capital equipment: 10 k → **1 M**.
  - Kamino's construction and shipyard licences are now sold, with no precursor: basic 100 k, intermediate 1 M, advanced 5 M, starfighter facilities 10 M, shipyard facilities 20 M (0.90: hidden, free or Investor).
  - Pirate Syndicates (`valarian`): capital ships 500 k → **2 M**, renamed "Refurbished Advanced Ships Access"; capital equipment stays 500 k, renamed "Advanced Equipment Access". The only Syndicate capital ship ware is `dreadnaught_alliance` (~10.2 M).
  - **Bounty Hunters Guild gets two new licences:** "Bounty Hunters' Guild Advanced Equipment Access" (capital equipment, 500 k) and "Advanced Ship Access" (capital ships, 6 M, hidden). No ship ware lists the Guild as a capital-ship owner, so the hidden one sells nothing yet; the equipment one unlocks `turret_l_doublelr_turbolaser_orange`.
  - Sith gain a trading subscription (10 M) and a police licence (100 k); every faction's illegal-module licence got new text.
- **Ships and jobs** (`ships.xml`, `shipgroups.xml`, `jobs.xml`) [read]:
  - New Sith police and probe ships, a Sith police job (`sith_police_s` with three escorts) and scout patrols, all `startactive="false"`. The Sith now have `policefaction="sith"`. Sith also gain food-trader and miner jobs, and some Sith quotas go up.
  - Rebel Alliance's MC80 Home One and MC75 jobs gain `expedition` and `patrol` tags.
  - Mandalorian liquid and mineral miner quotas roughly double; a new Pirate Syndicates food-trader job (20 ships).
  - The three SWI criminal mass-traffic jobs go from 1 to 2 per sector.
  - The Guild garrison job's location now lists `stationfaction="[bountyhunters]"` (a list instead of a single faction; same meaning) [inferred].
  - A few ship macros changed `ship type` (the purpose shown and used for job matching): `valor_02` destroyer → carrier; `genosian_cruiser` and `vigilfinal` carrier → expeditionary; `cr90_01as` prestige 640 → 40. No ship changed class (S/M/L/XL).
- **Bankrupt Bounty Hunter (`x4ep1_sw_bhg`) is byte-identical** (`gamestarts.xml` 1055), and so is the Fortitude's macro apart from line endings [read]. Other starts changed: the Sith start's player character and relations; four starts gained `female="true"` [read].
- `god.xml`: station quotas for four station types go up, and the station placement range shrinks (core range 1.2 → 1.0, with a comment about overflow in big sectors) [read].

## 6. Named hunters, mass-traffic bounties and other bounty-adjacent changes

- **Named hunters no longer pick docked targets or stations.** `order.sw.bountyhunter.fighters.xml` now restarts if its random tracker pick is docked, and skips stations along with L and XL. The attack itself (`order.fight.attack.object`, `checkrelation=false`, `allowothertargets=true`) moved from 56-62 to 61-67 and is unchanged. So the way a hunter turns on the player after its kill ([named-hunters.md](named-hunters.md)) still applies [read].
- **`GM_KillMasstraffic` now spawns criminals in SWI space.** 0.91's `gm_killmasstraffic.xml` replaces `ActivateMission`'s actions so `$CriminalMasstraffic` is chosen by SWI sector owner (Empire, Ascendancy, Sienar, Kuat → `masstraffic_galempire_criminal`; Sith → `masstraffic_sith_criminal`; New Republic, the corporations, CSA, Rebels, Hutt Cartel, Syndicates, Black Sun, Hutt Pirates → `masstraffic_newrepublic_criminal`; Mandalorians → split; Hapes → `masstraffic_hapes_criminal`; Anoat → teladi). This answers the open question in [vanilla-bounty.md](vanilla-bounty.md) for 0.91. Whether SWI offers that mission at all is still not checked [inferred].
- `setup_swmod.xml` (`SetupThingsForSWmod` version 10): the start's timewarp item is no longer given twice (a patch removes a duplicate), and Naboo's and the Rebels' diplomat chairs are fixed. Two "0.90 hotfix" cues expand the ICG wharf at Molavar and the Sith shipyards in existing saves (`player.age` ≥ 30 s). The named hunters' activation is unchanged [read].
- `diplomacy.xml` and `sw_diplo_simple.xml`: Rebel Alliance and Anoat relations set to -0.032 [read].
- `drops.xml` removes five Erlking blueprint drop lists [read].

## 7. Reaper's Ship Pack 2.8 on 0.91

Read from RSP's `ext_01.cat` (366 entries; 19 XML scripts and libraries) [read]:

- `content.xml` requires `SW Interworlds` version `091`, `save="0"`. With 0.91 HF1 (version `091`) the dependency is met [read].
- **Every patch target exists in both 0.90 and 0.91.** Its `libraries/` files (`jobs`, `ships`, `shipgroups`, `loadouts`, `wares`, `icons`, `sound_library`) and `index/` files are `<diff>` files that mostly `add` to the root. Its ten `add sel="//wares/ware[@id=…]"` targets (`hapan_m`, `hammerheadcruiser`, `vsd2`, `turret_m_hammerheadcruiser` and others) are in both versions' `wares.xml`. It names none of 0.91's new wares, macros or jobs [read]. So 0.91 doesn't change how RSP applies; only the version check would block it on 0.90 [inferred].
- **Not listed in mods.md:** RSP also ships `extensions/starwarsmod_m1/md/BridgeAlertSound.xml`, a diff on SWI's `BridgeAlertSound` (`MainCheck` cue, present in both versions), adding its capital ships to the bridge-alert lists. This is the same by-path patching swibh uses [read].
- `md/setup_rsp.xml` resets SWI's `md.Setup_swmod.ShipThreatLevelTable` and `ShipThreatLevelTable_EncyclopediaOpen` on start and every load; both cues exist in 0.91 (`setup_swmod.xml` 360, 374) [read].
- **RSP adds a 20th named hunter:** job `bountyhunters_ohil` (`SWBountyHunterFighters` order, faction `indibhg`, ship `indibhg_ohil` = group `bhg_aeg77x`, elite pilot), quota 1, same spawn space as SWI's hunters. It has no `startactive="false"`, so it is active from the start, not 20-30 min in like SWI's [read; inferred for the timing].
- RSP's 56 jobs are mostly `military` ships for New Republic (16), Empire (15), Mandalorians (7), Ascendancy (5), CSA (4), Kamino, Anoat (3 each) and Hutt Cartel (2). They change which ships these factions field, so they change hunt targets [read; inferred for hunts].

## Docs changed

Small edits, each pointing here:

- [mods.md](../mods.md) "What SWI already includes": the 0.91 catalog layout and the UI callback note.
- [design.md](../design.md): target SWI version, and the RAP detach line in 0.91.
- [bounty-research.md](../bounty-research.md): 0.91 line numbers for the map and options callbacks.
- [research/swi-bounty.md](swi-bounty.md): the hunters' target skip and the RAP debug setting.
- [research/named-hunters.md](named-hunters.md): docked and station targets skipped; RSP's 20th hunter.
- [research/licence-costs.md](licence-costs.md) and [research/corp-ship-ladder.md](corp-ship-ladder.md): Mon Cal, Kamino, Syndicate and Guild licence changes.
- [research/vanilla-bounty.md](vanilla-bounty.md): mass-traffic criminals now mapped to SWI factions.
- [research/cap-fix-facts.md](cap-fix-facts.md) and [research/hunt-logging-hooks.md](hunt-logging-hooks.md): unchanged in 0.91, EM lines +5.

Not changed here, for the main session: mods.md's tables, HANDOFF.md and test-plan.md (T-test line references to 0.90's menus and EM, such as the map callback lines in the Head Hunter tab test, are now 45-101 lines off). (`test.config.example`'s `SWI_UNPACKED` now points at `swi-0.91hf1`, and flag 1, the checks' `ext/` path, was done in #93.) The extension's diff comments cite 0.90 EM lines; the `sel`s don't depend on them.
