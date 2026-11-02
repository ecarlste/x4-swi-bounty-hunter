[Back to the bounty research](../bounty-research.md). Answers issue #7 and prepares test T14 ([test-plan.md](../test-plan.md#t14-optional-sirnukes-195-in-swi)).

# SirNukes Mod Support APIs 1.95 on X4 8.00 with SWI 0.90 (2026-11-01)

Tags: [read] = seen in source files, [web] = from a primary web source, [inferred] = reasoning, not run. Nothing was launched. `SN` = SirNukes' `extensions/sn_mod_support_apis` on GitHub `bvbohnen/x4-projects` (master, commit `ba199a4`, which is 1.95). `SWI` = SWI 0.90 unpacked at `E:\x4-dev\reference\mods\swi-0.90`. `V8` / `V9` = vanilla 8.00 / 9.00 unpacked at `E:\x4-dev\reference\x4-8.00` / `x4-9.00`.

## Answer

- **1.95 should run on 8.00 + SWI 0.90.** It declares only `<dependency version="300"/>` (no upper limit), it was built for 8.0, and every vanilla menu function it wraps is still in SWI's replaced menus, unchanged apart from kuertee's added hooks. SWI's interact menu even carries the UIX bridge for SN's Interact Menu API. [read; T14 still has to confirm in game]
- **1.95 is the last version for 8.00, and the last version at all.** No 9.00 release exists. 1.91 to 1.95 are the 8.0 line; the Workshop item and GitHub were last updated on 2025-12-08 [web].
- **For 9.00 nothing official changed.** People run 1.95 on 9.00, with mixed reports (crashes on old saves, "No menus registered"). A community "temporary fix" for a disappearing options menu is attached to GitHub issue #34; its manifest targets game 800 and SN exactly 195 [web, read].
- **No known conflict with SWI or kuertee's UI Extensions (UIX).** UIX is built to work with SN (its custom interact-menu groups feed SN's `Interact_Menu_API`). One side effect in SWI: SWI's dead `Chat_Window_API` debug chat commands become live [read].
- **Candidates that use it (mods.md):** Head Hunter - Reloaded (optional, 195) and Head Hunter by Chillmatica (optional, but its options and wanted board go through it). kuertee's UI Extensions does not depend on it [read, web].

## 1. Versions and dates

From SN `change_log.md` and `content.xml` [read], and the Steam Web API record for Workshop item 2042901274 [web]:

| Version | Date (commit) | What the changelog says |
| --- | --- | --- |
| 1.89 | 2024-06-24 | "Update for x4 7.0." Chat API and hotkey menu disabled pending updates |
| 1.90 | 2024-07-15 | Interact menu fix |
| 1.91 | 2025-09-08 | "Update for x4 8.0, including 7.5 ui loading changes." Protected UI mode support (pipes disabled there); new Lua globals `Register_Require_Response`, `Register_OnLoad_Init`, `Register_Require_With_Init`; Simple Menu cues `Edit_/Enable_/Disable_Registered_Options_Menu` |
| 1.92 | 2025-09-12 | "X4 online features do not work with this mod." Patches restricted `Online*` Lua functions to return safe values |
| 1.93 | 2025-09-14/16 | Chat window API updated for 8.0; lowercase file names; fix for OnLoad init running twice when another mod ships an older Lua loader copy |
| 1.94 | 2025-10-05 | Fix for the Timelines debriefing window (patches `OnlineGetScenarioRankings`) |
| **1.95** | **2025-12-08** | "Fixed chat window api wrongly suppressing some commands (eg. thereshallbewings)" (PR #30, issue #31) |

- `content.xml` 1.95: `id="ws_2042901274"`, `version="195"`, `<dependency version="300" />` only. It loads on any game from 3.00 up, 8.00 included [read].
- Workshop item 2042901274: `time_updated` 2025-12-08T09:29:51Z, two minutes before GitHub commit `ba199a4`. So the Workshop build is 1.95 [web].
- GitHub has no 1.9x releases (its only release is v1.12, 2020). Distribution is the Workshop and Nexus 503, which SirNukes says he maintains for this mod only (issue #20 reply, 2024-06-25) [web]. Nexus blocked automated reads, so its file list wasn't checked.
- The Community Edition (Workshop 3514258146, updated 2025-07-12) says it is "for X4 versions pre-8.0" and not to use it alongside the original [web]. Not an option for us.

## 2. Does it run on 8.00 with SWI?

SN patches vanilla menus by finding them in the global `Menus` list by name (`ui/library.lua` `L.Get_Egosoft_Menu`) and wrapping functions in place [read]. SWI ships its own copies of four addons (`subst02/ui/addons/ego_detailmonitor`, `ego_detailmonitorhelper`, `ego_gameoptions`, `ego_interactmenu`), so the question is whether SWI's copies still have what SN wraps. Compared function by function (V8 `.lua` vs SWI `.xpl`, CR/BOM stripped):

**Options menu** (`OptionsMenu`, SN `ui/simple_menu/options_menu.lua` `Init_Gameoptions_Link` 370-417 and `ui/hotkey/interface.lua` 245-318):

| Function SN wraps | SWI 0.90 vs V8 |
| --- | --- |
| `displayOptions` | Same, plus UIX's `displayOptions_modifyOptions` hook (SWI 9484-9552). Still calls `menu.createOptionsFrame()` and `frame:display()`, which SN intercepts |
| `submenuHandler` | Same, plus UIX's `submenuHandler_preDisplayOptions` hook |
| `viewCreated`, `createOptionsFrame`, `displayOption`, `onRowChanged`, `onSelectElement` | Identical |
| `warningIconOnline` | Same, plus a kuertee `state = 0` line |
| `onColChanged` | Absent in both; SN handles a nil original (`if orig_func then`) |
| `displayControls`, `remapInput`, `getControlName` (hotkey API) | Identical |

- SN puts its "Extension Options" row next to the row with `rowdata.id == "settings"`. That row is still in SWI (`id = "settings"`, SWI 1343) [read].
- SWI's `displayOptions_modifyOptions` callback (SWI `starwarsmod_m1/ui/sw_gameoptions.lua`, hides Timelines) runs inside the original `displayOptions`, before SN adds its row. They don't touch the same rows [read, inferred].

**Interact menu** (`InteractMenu`, SN `ui/interact_menu/interface.lua` 331-420): `display` and `onUpdate` identical; `prepareActions` and `draw` differ only by UIX/Mycu additions. `Helper.interactMenuCallbacks`, which SN rewires, is in SWI's `helper.xpl` as in V8 [read].

**Chat window and target monitor**: SN depends on `ego_chatwindow` (`ChatWindow`) and `ego_targetmonitor`. SWI doesn't replace either; both exist in V8 [read].

**Load order**: SN's `ui.xml` declares dependencies on `ego_chatwindow`, `ego_detailmonitor`, `ego_gameoptions`, `ego_interactmenu` and `ego_targetmonitor`, so it loads after those addons, which in an SWI game are SWI's copies (SWI's own `ui.xml` depends on the same names) [read; addon schema behaviour from bounty-research.md].

**Conclusion**: nothing SN needs is missing or renamed in SWI. Expected to work; T14 confirms it [inferred].

## 3. Known problems on 8.00 (not SWI-specific)

From the Workshop comments page for 2042901274 (read 2026-11-01; no replies from SirNukes) [web]:

- 2025-09-15, Wizwuzwiz: "This mod makes it so you can't see the new options menu therefore you cant activate DLSS and Framge Gen." Posted between 1.92 and 1.93; may predate the 1.93 fixes.
- 2025-11-16, Mordegar: "This mod deactivates the station building menu", then a fix: deleting old station blueprints, on a tip from "LAND from the SWI community". So at least one SWI player ran 1.9x with SWI.
- 2026-01-31, Mirageman: "I have found a bug In 8.0. Almost all mods using tis API blocks save settings dialog after antialiasing change."
- Earlier (pre-8.0) GitHub issues #26/#27 (open PRs) note `OnlineGetUserItems()` returning nil can break the right-click menu; 1.92 added safe-value wrappers for these [read].
- 1.91/1.92 changelog: with SN installed, X4's online features (Ventures) don't work. Not relevant to SWI, which is offline anyway [read].

For the series: change graphics settings with SN removed, or expect the save-settings dialog bug.

## 4. 9.00

- No SN release after 1.95. GitHub master's last commit for this folder is 2025-12-08 [read].
- Workshop comments from June to October 2026 (9.00 shipped around then): "works with 9.0" (R3bbit), "it is working on a new 9.0 save" (DirtNap), "Confirmed, causes a CTD on load" (SpaceAuddity), "the extension menu will say 'No menus registered.'" (Sloth-Jaw), "it seems that 9.0 has cooked the modding community" (Brazzyy, 2026-10-27) [web].
- GitHub issue #34 "Possible solution for Extensions menu disappearing" (chemodun, 2026-09-14, open) attaches `sn_mod_support_apis_temporary_fix.zip`. Its `content.xml` requires game 800 and `ws_2042901274` with `version="195" maxversion="195"`. It adds MD diffs that clear `player.entity.$simple_menu_args` and `$interact_menu_args` on reset, and nil guards in `Get_Next_Args` in the Simple Menu Lua [read, unzipped in the scratchpad]. This points at stale blackboard args in a save as the cause of "No menus registered", which can hit 8.00 too [inferred]. Not by SirNukes; unreviewed.
- V8 vs V9: `submenuHandler`, `viewCreated`, `createOptionsFrame`, `onSelectElement`, `displayControls` and the interact menu's `prepareActions`, `draw` and `onUpdate` all changed in 9.00 [read]. SN wraps them without depending on their bodies, which fits the mostly-working reports [inferred].
- Head Hunter (Chillmatica) Workshop description, updated 2026-10-31: "UPDATE FOR 9.0: Make sure to update SirNukes Mod API to the latest version" [web]. So mod authors treat 1.95 as the 9.0 version.

## 5. kuertee's UI Extensions and SWI's built-in UIX

- UIX's `content.xml` (9.0 line, `version="900"`, 2026-10-23) has no dependency on SN [read, GitHub `kuertee/x4-mod-ui-extensions`].
- UIX is designed to sit on top of SN's Interact Menu API: its README documents `Interact_Menu_API.Add_Custom_Actions_Group_Id` / `_Text` and using the new group id in `md.Interact_Menu_API.Add_Action` [read]. SWI's `menu_interactmenu.xpl` registers exactly these events (481-483) plus `Interact_Menu_API.Existence_Query`. So SWI's built-in UIX expects SN may be present [read].
- No issue on SN's GitHub mentions UIX, kuertee or SWI [read, issue list].
- Whether a separate UIX install overrides SWI's menus is a separate question (HANDOFF research item); it doesn't change SN's answer.

## 6. Side effect: SWI's chat commands come alive

SWI's MD listens for `event_ui_triggered screen="'Chat_Window_API'" control="'text_entered'"` in `kuertee_emergent_missions.xml` (111, 4100, 4961, 5415, 5852, 6227), `kuertee_professions_guilds.xml`, `mc_management.xml`, `x4ep1_war_subscriptions.xml` and `playerreputation.xml` [read]. Only SN raises that event, so without SN these are dead. With SN, typing e.g. `reset emissions` in chat resets Emergent Missions' `UserSettings` and `kEMissions` (EM 106-133). Harmless if nobody types them, but don't type debug commands on stream [inferred].

## 7. Candidates in mods.md

| Candidate | Uses SN? | Source |
| --- | --- | --- |
| kuertee's UI Extensions and HUD | No dependency. Integrates with SN's Interact Menu API if present | UIX `content.xml`, README [read] |
| Head Hunter - Reloaded (IceDesign) | Optional, `ws_2042901274` 195. Options menu only through SN's Simple Menu API; without it everything runs on defaults | [headhunter.md](headhunter.md) Overview, §16 [read] |
| Head Hunter (Chillmatica, Workshop 2992233767) | Optional but "extremely recommended": wanted board and options are in SN menus (a map tab needs UIX). Correction to mods.md: it is optional, not required, and the mod is not abandoned (updated 2026-10-31 for 9.0) | Workshop description via Steam Web API [web] |

## 8. What T14 should check

Install the Workshop or Nexus 1.95 into the test profile only, then on `test-S2-start`:

1. Main game options show "Extension Options" next to Settings; opening it shows "No menus registered" (nothing registers yet).
2. `debuglog.txt` has no Lua errors from `sn_mod_support_apis`, `gameoptions` or `interactmenu`.
3. Right-click interact menu still opens on a ship and a station.
4. Station building menu still opens (Mordegar's report).
5. Save, load, and recheck 1 to 3 (stale args, issue #34).
6. Typing in the chat window doesn't trigger SWI's debug commands by accident.

## Sources

- SirNukes, `bvbohnen/x4-projects`: [`sn_mod_support_apis/change_log.md`](https://github.com/bvbohnen/x4-projects/blob/master/extensions/sn_mod_support_apis/change_log.md), [`content.xml`](https://github.com/bvbohnen/x4-projects/blob/master/extensions/sn_mod_support_apis/content.xml), [`ui.xml`](https://github.com/bvbohnen/x4-projects/blob/master/extensions/sn_mod_support_apis/ui.xml), [`ui/simple_menu/options_menu.lua`](https://github.com/bvbohnen/x4-projects/blob/master/extensions/sn_mod_support_apis/ui/simple_menu/options_menu.lua), [`ui/interact_menu/interface.lua`](https://github.com/bvbohnen/x4-projects/blob/master/extensions/sn_mod_support_apis/ui/interact_menu/interface.lua), [`ui/library.lua`](https://github.com/bvbohnen/x4-projects/blob/master/extensions/sn_mod_support_apis/ui/library.lua); commits [`ba199a4`](https://github.com/bvbohnen/x4-projects/commit/ba199a4) (1.95), [`536c4c1`](https://github.com/bvbohnen/x4-projects/commit/536c4c1) (1.94), [`5fd67db`](https://github.com/bvbohnen/x4-projects/commit/5fd67db) (8.0 update); issues [#20](https://github.com/bvbohnen/x4-projects/issues/20), [#31](https://github.com/bvbohnen/x4-projects/issues/31), [#34](https://github.com/bvbohnen/x4-projects/issues/34); PRs [#26](https://github.com/bvbohnen/x4-projects/pull/26), [#27](https://github.com/bvbohnen/x4-projects/pull/27), [#30](https://github.com/bvbohnen/x4-projects/pull/30)
- Steam Workshop: [SirNukes Mod Support APIs 2042901274](https://steamcommunity.com/sharedfiles/filedetails/?id=2042901274) and its [comments](https://steamcommunity.com/sharedfiles/filedetails/comments/2042901274); [Community Edition 3514258146](https://steamcommunity.com/sharedfiles/filedetails/?id=3514258146); [Head Hunter 2992233767](https://steamcommunity.com/sharedfiles/filedetails/?id=2992233767). Dates and descriptions from the Steam Web API `ISteamRemoteStorage/GetPublishedFileDetails`
- Nexus: [Mod Support APIs 503](https://www.nexusmods.com/x4foundations/mods/503) (not readable by tools; not checked)
- kuertee: [`x4-mod-ui-extensions`](https://github.com/kuertee/x4-mod-ui-extensions) README and `content.xml`
- Local: SWI 0.90 `subst02/ui/addons/ego_gameoptions/gameoptions.xpl`, `ego_interactmenu/menu_interactmenu.xpl`, `ego_detailmonitorhelper/helper.xpl`, `starwarsmod_m1/content.xml`, `starwarsmod_m1/ui.xml`, `ext/md/*.xml`; V8 and V9 `ui/addons/ego_gameoptions/gameoptions.lua`, `ego_interactmenu/menu_interactmenu.lua`, `ego_chatwindow/chatwindow.lua`
