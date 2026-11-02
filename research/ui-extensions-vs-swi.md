[Back to mods.md](../mods.md). Resolves issue #6, "UI Extensions vs SWI's built-in menus".

# kuertee's UI Extensions installed separately vs SWI 0.90's built-in copy

**Question.** SWI 0.90 bundles kuertee's UI Extensions and HUD ("UIX"). If the player also installs UIX on its own (the 8.0 line), does it override, duplicate or conflict with SWI's copy, on X4 8.00?

**Short answer.** It **replaces** SWI's copy; it does not duplicate it or merge with it. SWI's "built-in UIX" is a substitution catalog (`subst_02.cat`) holding the same 20 UIX menu files that standalone UIX ships in its own `subst_01.cat`. When both are installed, each file path is substituted twice and the catalog that loads last wins, whole file by whole file. There is no double hook registration, because the `registerCallback` plumbing lives inside those same files.

- **If standalone UIX wins** (the setup the SWI community expects): you get a newer UIX build (8.0.4.10 against SWI's early-December 2025 snapshot). Every callback SWI's own Lua uses exists in it, so SWI's menus keep working. It also adds the `kuertee_ui_extensions` UI addon name, which other mods' `ui.xml` files depend on and SWI lacks.
- **If SWI's copy wins**: standalone UIX is effectively inert, apart from its `ui.xml` addon entry and saved variables. Mods that need callbacks added after early December 2025 would miss them.
- **Load order is the only real risk.** Neither `content.xml` declares a dependency on the other, so neither side controls which catalog wins. A third-party Nexus patch exists only to fix this ordering (see section 4).

**For this project:** installing standalone UIX 8.0.4.10 alongside SWI 0.90 is safe as far as the code shows, but the win order is not proven. It should be confirmed in game before we rely on it (see "Open" at the end).

Conventions: **[read]** = read directly in a file or API response. **[inferred]** = my conclusion, not verified in game. SWI paths are relative to `/mnt/e/x4-dev/reference/mods/swi-0.90` (unpacked: `subst02/` = `starwarsmod_m1/subst_02.cat`, `ext/` = `ext_01.cat`). Vanilla 8.00 paths are relative to `/mnt/e/x4-dev/reference/x4-8.00/base`. UIX files are cited by GitHub ref in [kuertee/x4-mod-ui-extensions](https://github.com/kuertee/x4-mod-ui-extensions).

---

## 1. What SWI 0.90 ships

**`starwarsmod_m1/content.xml`** [read]: id `SW Interworlds`, version `090`, date 2025-12-06. Its dependencies are game version `800` and the five DLCs (split, terran, pirate, boron, timelines). **There is no dependency on UIX** (`kuerteeUIExtensionsAndHUD`), optional or not.

**`starwarsmod_m1/subst_02.cat`** (unpacked as `subst02/`) holds exactly 20 files, all under `ui/addons/` [read]:

- `ego_detailmonitor/`: `menu_diplomacy`, `menu_docked`, `menu_encyclopedia`, `menu_map`, `menu_playerinfo`, `menu_research`, `menu_scenario_debriefing`, `menu_scenario_selection`, `menu_ship_configuration`, `menu_station_configuration`, `menu_station_overview`, `menu_toplevel`, `menu_trader_blueprintsorlicences`, `menu_transactionlog`, `menu_transporter`, `menu_userquestion` (all `.xpl`)
- `ego_detailmonitorhelper/helper.xpl`
- `ego_gameoptions/customgame.xpl`, `ego_gameoptions/gameoptions.xpl`
- `ego_interactmenu/menu_interactmenu.xpl`

A `subst_*.cat` in an extension replaces game files with the same path. Vanilla 8.00 ships these `.xpl` files as LuaJIT bytecode (`file` reports `data`; for example `ui/addons/ego_detailmonitor/menu_toplevel.xpl` starts with the `\x1bLJ` header). SWI's copies are plain Lua source. Each one is the vanilla 8.00 `.lua` of the same name plus kuertee's `-- kuertee start: callback` / `-- kuertee end: callback` blocks. Counts of `kuertee`/`uix` markers per file range from 56 (`menu_scenario_*`) to 778 (`menu_map.xpl`). `menu_toplevel.xpl` holds UIX's `menu.registerCallback` / `deregisterCallback` implementation (around line 516) and the kHUD code [read].

**`starwarsmod_m1/ui.xml`** [read]: addon name `StarWarsMod_M1`. It loads 10 Lua files from `starwarsmod_m1/ui/`: 6 adapted kuertee gameplay mods (`kuertee_emergent_missions.lua`, `kuertee_reputations_and_professions_{map,playerinfo,shipconfiguration}.lua`, `kuertee_kill_counts_and_missions.lua`, `kuertee_social_standings_and_citizenships.lua`) and 4 SWI files (`resourcelookup.lua`, `sw_gameoptions.lua`, `sw_maintenance.lua`, `sw_supply_level_encyclopedia.lua`). It depends on the `ego_detailmonitorhelper`, `ego_gameoptions`, `ego_detailmonitor` and `ego_interactmenu` addons. It does **not** declare the `kuertee_ui_extensions` addon name and does **not** declare UIX's `savedvariable`s (`__userdata_uix_menu_map`, `__userdata_uix_gameoptions`). SWI's copies create those as plain globals instead (`menu_map.xpl:1781`, `gameoptions.xpl:404`), so UIX map and mod-list preferences probably do not persist under SWI alone [inferred].

SWI's own Lua hooks into the menus through 24 distinct `registerCallback` names (`grep` over `starwarsmod_m1/ui/*.lua`) [read].

## 2. What standalone UIX ships (8.0 line)

**Repository:** [github.com/kuertee/x4-mod-ui-extensions](https://github.com/kuertee/x4-mod-ui-extensions). Branches: `8.0`, `master` (9.0 work), `9.0-beta-*`, `pre-6.2`. Nexus page: [mod 552](https://www.nexusmods.com/x4foundations/mods/552) (Nexus blocks automated fetching, so I used the GitHub repo, which is the same author's source).

**`content.xml` on branch `8.0`** [read]: id `kuerteeUIExtensionsAndHUD`, version `804`, date 2026-07-04. It has **no dependencies at all**: no game version, and no SWI.

**`subst_01.cat` on branch `8.0`** [read via the GitHub contents API]: exactly the **same 20 paths** as SWI's `subst_02.cat`, at similar sizes. For example, `menu_map.xpl` is 1 551 870 bytes in UIX and 1 533 321 in SWI.

**`ui.xml` on branch `8.0`** [read]: addon `kuertee_ui_extensions`, with the same four ego addon dependencies. It declares the two `__userdata_uix_*` saved variables and loads no Lua files of its own.

**kuertee builds SWI's catalog himself.** The repo has `dev-make-cat-file-for-swi.bat` (first commit `fecfb0385e`, 2024-02-23, "make cat file for swi bat file"). It runs the same `XRCatTool` dump as `dev-make-cat-file.bat` but writes `subst_02.cat` instead of `subst_01.cat` [read]. So SWI's `subst_02.cat` is UIX itself, packed under SWI's catalog name. It is not a fork.

**8.0 release history** (GitHub releases API, tag → publish date) [read]: 8.0.0.1 (2025-07-12, 8.0 beta) … 8.0.0.8 (2025-09-11, "8.0 final compatibility") · 8.0.1.0 (2025-09-28, 8.0 hotfix 1) · 8.0.2.x (October 2025) · 8.0.3.0 (2025-10-31) · 8.0.3.1 (2025-11-11) · **8.0.3.4 (2025-12-08)** · 8.0.3.5 (2025-12-15) · 8.0.4.0 (2026-02-09) · 8.0.4.1, 8.0.4.2 (March 2026) · 8.0.4.5 (2026-05-10) · 8.0.4.9 (2026-06-28) · **8.0.4.10 (2026-07-04, the last 8.0 release; branch `8.0` head `77ffcd83fc`)**. From 9.0.0.2 on (June 2026) the releases are for X4 9.0. The README dates some 8.0.4.x entries "2025", but the release dates show 2026, so those README dates are typos. The README's player instructions are to install it as a normal extension in `extensions/kuertee_ui_extensions/` and leave Protected UI Mode on. SWI requires Protected UI Mode off, per [SWI's Nexus page](https://www.nexusmods.com/x4foundations/mods/349) (seen through search results).

The 8.0 README also has SWI-specific entries: "7.6.1: Tweak: SWI compatibility: allow for SWI's larger plot sizes", and an Encyclopedia callback "for a feature in the StarWars Interworlds mod" [read].

## 3. Which UIX build SWI 0.90 bundles

I normalised line endings and diffed SWI's files against UIX at several git refs [read]:

| File | 8.0.3.1 | commit `f8ff3b0894` (2025-12-04) | 8.0.3.4 | 8.0.3.5 | `8.0` head |
|---|---|---|---|---|---|
| `menu_toplevel.xpl` | identical | identical | identical | 3 lines | 5 lines |
| `helper.xpl` | identical | identical | identical | identical | 2 lines |
| `gameoptions.xpl` | 9 lines | **identical** | identical | 11 lines | 133 lines |
| `menu_map.xpl` | 8 lines | 8 lines | 56 lines | 73 lines | 494 lines |

The `menu_map.xpl` difference from `f8ff3b0894` is one added callback, `addCrewSection_after_full_crew_list`, which SWI's `kuertee_emergent_missions.lua:23` registers. UIX released it in 8.0.3.4 (README: "Ship crew list: support for Emergent Missions mod's new Station Rescue mission"). 8.0.3.4 also added the boarding-menu tweak, which SWI's copy lacks. So **SWI 0.90 bundles a working-tree snapshot of UIX taken between `f8ff3b0894` (2025-12-04) and 8.0.3.4 (2025-12-08)**, which matches SWI's 2025-12-06 date [read + inferred].

## 4. What happens when both are installed

**Same files, whole-file replacement.** Both mods substitute the same 20 game paths. The engine reads one file per path, so the two copies are never both loaded. The result is the content of whichever extension's catalog is applied last [inferred from how subst catalogs work; not tested in game]. This means:

- **No duplication.** Callbacks are not registered twice, and the HUD is not drawn twice.
- **No merge either.** You get one complete UIX build, never a mix.

**Callback coverage in UIX 8.0.4.10.** I fetched all 20 files at branch `8.0` and searched them for each of the 24 callback names SWI's Lua registers. Every name present in SWI's copy is also present in UIX 8.0 head, in the same number of files [read]. (`createProfessionsOrReputationsInfo_reputations` and `onClearUIData` appear in neither, so those registrations were already no-ops in SWI.) **If standalone UIX wins, SWI's menus keep every hook they use.** UIX is additive across 8.0 releases, and nothing SWI relies on was removed.

**Which one wins.** Neither `content.xml` names the other, so the engine's default extension order decides. I found no primary Egosoft source that documents that default (whether it goes by folder name, id, or something else) [open]. The SWI community treats it as a real problem:

- Nexus [mod 2134, "kuertee UI Extensions and HUD for SW Interworlds adoption"](https://www.nexusmods.com/x4foundations/mods/2134) (third-party; read through search-result summaries because Nexus returns 403 to automated fetches) says SWI ships "its own, slightly older copy" of UIX. To make UIX load **after** SWI, so that the external UIX wins, it "replaces only the content.xml file of UI Extensions and HUD". Presumably that file adds a dependency on `SW Interworlds`. It targets X4 8.00 with the latest hotfixes. Its install steps are: install SWI and UIX, then this patch, and in Vortex set a rule so the patch overwrites UIX.
- The Nexus collection ["UI Extensions and HUD for SWI"](https://www.nexusmods.com/games/x4foundations/collections/4lmz42) exists only "to ensure the loading order of mods" (same caveat).

The intended setup is therefore **standalone UIX overriding SWI's copy, with load order forced by a dependency**. A plain side-by-side install without the patch has an undocumented winner.

**Other interactions** [read + inferred]:
- With UIX installed, the `kuertee_ui_extensions` addon exists. Mods whose `ui.xml` depends on it (for example Head Hunter Reloaded, see `research/headhunter.md` and mods.md) can then load their Lua. SWI alone does not provide that addon name.
- UIX's `ui.xml` declares the `__userdata_uix_*` saved variables, so map and mod-list preferences would persist. This is harmless to SWI.
- Protected UI Mode: SWI needs it off, and UIX recommends on but works either way, so SWI's requirement prevails. kuertee's warning applies: toggle the mode only with UIX disabled, or restart the game afterwards.
- Version gate: UIX 8.0.4.10's `content.xml` has no game-version dependency, so nothing stops a player from installing a 9.0.x UIX on 8.00 by mistake. Use 8.0.4.10 (the `8.0` branch or the matching Nexus file) on 8.00.

## 5. Consequences for SWI Bounty Hunter

- Our extension should **not** assume a specific UIX build. If we add Lua hooks, use only callbacks present in both SWI's bundled snapshot and UIX 8.0.4.10. Today that is every callback SWI's snapshot has, since the 8.0 line only added callbacks.
- If we need a callback newer than early December 2025, we must require standalone UIX **and** a forced load order: our own `content.xml` dependency is not enough, because the conflict is between SWI and UIX. Users would need the adoption patch, or we would document that requirement.
- If our `ui.xml` depended on the `kuertee_ui_extensions` addon, the mod would fail on a plain SWI install. Depend on the `ego_*` addons, as SWI's `ui.xml` does.

## Open

- Confirm the default extension load order on 8.00, and which copy wins with SWI 0.90 and UIX 8.0.4.10 installed with no patch. A game test could check for a UIX-only marker after load, for example the 8.0.3.4 boarding-menu code or a `debugText` in a newer callback. Needs `make game-test` (X4 closed).
- Read mod 2134's actual `content.xml` (needs a Nexus download) to confirm the dependency it adds.

## Sources

- SWI 0.90 unpacked: `starwarsmod_m1/content.xml`, `starwarsmod_m1/ui.xml`, `starwarsmod_m1/ui/*.lua`, `subst02/ui/addons/**/*.xpl`.
- Vanilla 8.00: `ui/addons/ego_detailmonitor/*.lua|.xpl` and the other ego addons, under `/mnt/e/x4-dev/reference/x4-8.00/base`.
- UIX repo [kuertee/x4-mod-ui-extensions](https://github.com/kuertee/x4-mod-ui-extensions): branch `8.0` (`content.xml`, `ui.xml`, `subst_01.cat`, `README.md`, `dev-make-cat-file*.bat`, `ui/addons/**`), tags `8.0.3.1`, `8.0.3.4`, `8.0.3.5`, commit `f8ff3b0894`, and the releases and commits APIs.
- Nexus: [UIX 552](https://www.nexusmods.com/x4foundations/mods/552), [SWI 349](https://www.nexusmods.com/x4foundations/mods/349), [adoption patch 2134](https://www.nexusmods.com/x4foundations/mods/2134), [collection 4lmz42](https://www.nexusmods.com/games/x4foundations/collections/4lmz42). These were read only through search-result summaries, since Nexus returned 403.
- The X4 8.00 install (`/mnt/e/SteamLibrary/steamapps/common/X4 Foundations - 8.00/extensions`) currently has `starwarsmod_m1` and no `kuertee_ui_extensions`.
