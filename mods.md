# SWI Bounty Hunter playthrough: mods

Every extension in the playthrough's X4 8.00 install (`X4 Foundations - 8.00\extensions\`), with its version, and candidates being tried. Update it with every install, update or removal, so a recording can be reproduced. Versions are from each extension's `content.xml`.

[Back to the concept](concept.md)

## Installed

| Extension | ID (folder) | Version | Date | Source | Notes |
| --- | --- | --- | --- | --- | --- |
| X4 Foundations | — | 8.00 HF4 | — | NoSteam download, kept in `E:\x4-dev\nosteam-8.00\` | Base game |
| Split Vendetta | `ego_dlc_split` | 800 | 2020-03-31 | DLC | Required by SWI |
| Cradle of Humanity | `ego_dlc_terran` | 800 | 2021-03-16 | DLC | Required by SWI |
| Tides of Avarice | `ego_dlc_pirate` | 800 | 2022-03-14 | DLC | Required by SWI |
| Kingdom End | `ego_dlc_boron` | 800 | 2023-04-12 | DLC | Required by SWI |
| Timelines | `ego_dlc_timelines` | 800 | 2024-06-20 | DLC | Required by SWI |
| Hyperion Pack | `ego_dlc_mini_01` | 800 | 2025-02-13 | DLC | |
| Envoy Pack | `ego_dlc_mini_02` | 800 | 2025-09-10 | DLC | |
| SW Interworlds | `SW Interworlds` (`starwarsmod_m1`) | 090 (0.90) | 2025-12-06 | Not recorded yet | Bundles kuertee's Professions, Emergent Missions and SSAC |

## What SWI already includes

Found in SWI 0.90's files (unpacked reference in `E:\x4-dev\reference\mods\swi-0.90\`). A mod that changes the same things can clash with SWI.

- **kuertee's UI Extensions, built in.** SWI replaces the game's menus (map, docked, ship configuration, player info, game options, interact menu and more, in `subst02/ui/addons/`) with copies that carry kuertee's UI Extensions hooks.
- **kuertee's gameplay mods, adapted for SWI:** Emergent Missions, Reputations and Professions (the bounty hunter profession and guild), Social Standings and Citizenships, and Kill Counts and Missions, as MD scripts in `ext/md/kuertee_*.xml` and Lua in `starwarsmod_m1/ui/`.
- **Diff patches to many vanilla scripts:** generic missions (`gm_*`), mission library (`rml_*`), faction logic, notifications, conversations and others in `ext/md/`.

## How we check a candidate

1. Note its version and the X4 version it targets: 8.00, not 9.x.
2. List the files it changes and compare them with SWI's: the same menu Lua, the same `md/` scripts or libraries. A replaced file (not a diff) that SWI also changes is a conflict.
3. If it's one of kuertee's mods SWI already includes, assume it's a duplicate unless SWI's notes say otherwise.
4. Load it on a fresh Bankrupt Bounty Hunter start and check `debuglog.txt` for errors.
5. Record the result below, and what a compatibility patch would need if it clashes.

## Candidates

Mods to try for the series. Move a row up to **Installed** once it's in, with its version.

| Mod | Why | Works on 8.00 + SWI? | Status |
| --- | --- | --- | --- |
| kuertee's UI Extensions and HUD ([GitHub](https://github.com/kuertee/x4-mod-ui-extensions)) | Many UI mods need it | Yes, as a replacement. SWI's `subst_02.cat` is a UIX snapshot from early December 2025, and standalone UIX substitutes the same 20 menu files. Whichever loads last wins whole, so there is no duplication. UIX 8.0.4.10 (2026-07-04, the last 8.0 release) has every callback SWI uses. Neither mod declares a dependency on the other, so the winner is not controlled; Nexus patch 2134 forces UIX to load after SWI | Optional. Use 8.0.4.10 with patch 2134 if another mod needs it. Win order not yet tested in game. See [research/ui-extensions-vs-swi.md](research/ui-extensions-vs-swi.md) |
| Head Hunter - Reloaded by IceDesign ([Nexus 2289](https://www.nexusmods.com/x4foundations/mods/2289)), `ice_headhunter` 1.01, 2026-08-10 | A wanted board on the map, bounties on ships that kill, hunter groups after the player's wanted ships | **No.** `content.xml` requires game version 900 and kuertee's UI Extensions 900 (not optional); SirNukes APIs 1.95 is optional. The UI hooks it uses (5 map menu callbacks) all exist in SWI's built-in menus, but its `ui.xml` also depends on the `kuertee_ui_extensions` addon, which SWI doesn't have. Hunter groups would not spawn: the factions they come from (Scale Plate, Buccaneers, Fallen Families, Argon and others) are inactive in SWI, and SWI replaces the whole ship library, so those factions have no ships. Bounties for kills would likely work, since that code only excludes Xenon, Kha'ak and ownerless | Rejected for 9.x. Making it work would need a fork: lower the version requirements, and point the hunter factions at SWI factions that have `military`-tagged ships, such as `blacksun`, `huttcartel`, `mandodw` or `valarian`. `indibhg` has ships, but only under named tags like `bhg_random_small`, and `bountyhunters` has none of its own |
| Head Hunter by Chillmatica ([Nexus 1150](https://www.nexusmods.com/x4foundations/mods/1150), [Steam](https://steamcommunity.com/sharedfiles/filedetails/?id=2992233767)) | The original that Reloaded rebuilds | Unknown. Updated for 7.0+ (needs SirNukes Mod Support APIs); abandoned, with no confirmed 8.00 reports. It probably also sends hunters from vanilla factions | To check: get the zip, then check its `content.xml` and hunter factions |

## Changes

| Date | Change |
| --- | --- |
| 2026-10-30 | Recorded the starting install: 8.00 HF4, DLCs, SWI 0.90 |
| 2026-10-30 | Recorded what SWI includes, how we check a mod, and the first two candidates |
| 2026-10-31 | Checked Head Hunter - Reloaded 1.01: built for 9.00, not compatible as is; added the original Head Hunter as a candidate |
