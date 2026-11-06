[Back to the Head Hunter - Reloaded inventory](headhunter.md). Related: [headhunter-wings.md](headhunter-wings.md).

# Original Head Hunter (Chillmatica, Nexus 1150): what differs from Reloaded (2026-11-05)

Question: which features of the original Head Hunter (`chillheadhunter`, [Nexus 1150](https://www.nexusmods.com/x4foundations/mods/1150)) did IceDesign's Head Hunter - Reloaded (`ice_headhunter` 1.01, [Nexus 2289](https://www.nexusmods.com/x4foundations/mods/2289)) drop or change? Only the delta; Reloaded's features 1-17 are in [headhunter.md](headhunter.md).

**No local copy of the original.** Downloads has only the Reloaded zip. Nexus pages return 403 to fetches and file downloads need a login, so no original file was read. Sources used instead:

- **[page]**: the Nexus 1150 description and per-file notes, read through the public Nexus GraphQL API (`api.nexusmods.com/v2/graphql`, queries `legacyModsByDomain` and `modFiles`, game id 2659).
- **[files]**: the archive listing of original 2.0.1 from the same API (`modFileContents`): `chillheadhunter/ch.txt` (17 KB, probably the changelog, contents not visible), `content.xml`, `ext_01.cat`, `ext_01.dat` (152 KB).
- **[read]**: the Reloaded 1.01 zip's `ext_01.cat` index and `ext_01.dat`, only grepped (`HH/` and file names as in headhunter.md).
- **[inferred]**: reasoning only.

## Version history [page]

- Original: v1.0 on 2023-06-20, then 1.01-1.91 through August 2023, **v2.0 on 2023-08-27** (map Wanted Board by Mycu, needs UIX) and 2.0.1 on 2023-09-04. Then, **after Reloaded** (released 2026-08-04), Chillmatica uploaded **2.0.3 (2026-10-27), 2.0.4 (10-28) and 2.0.8 (10-31, current MAIN)**. These have no file notes and their contents aren't indexed. So the original is no longer abandoned, though Reloaded's disclaimer still says it is. What 2.0.3-2.0.8 change is unknown (open question 1).
- Notes from the per-file descriptions: 1.2 extended the general multiplier to 0-10x, split the logbook amount into base + multiplier, "synced general bounty range to Roaming Fleet" and "tweaked capture mechanics for wanted ships". The second 1.2 file fixed "bounties in player owned sectors". 1.3 was performance work. 1.4 added "dynamic bounties" map labels. 1.91 added the option to disable reputation gains. Reloaded has all of these (features 2, 6, 9; `$HeadHunterGainReputation`).
- **Reloaded is built on original 2.0** [read]: in Reloaded's `ext_01.cat`, `aiscripts/aiscripts.xsd`, `md/md.xsd`, `libraries/wares.xml`, `libraries/equipmentmods.xml` and the tab icon `mapst_headhunter.gz` carry timestamp 1693161035 (2023-08-27, the original 2.0 upload day). Every other file is dated 2026-07/08.

## Delta: original features Reloaded dropped or changed

| # | Original | Reloaded | Source |
|---|---|---|---|
| D1 | **The Wanted Board works without UIX.** The board is viewed in the SirNukes options menu ("how are you going to view the Wanted board and choose some options? Just grab it"). The map tab (v2.0) is an extra and needs UIX only for that tab. | The board exists only as the map tab. `content.xml` makes `kuerteeUIExtensionsAndHUD` **required** (`optional="false"`), and the options menu has no board, only "Reset wanted board" (`OPT` 438, 952). | [page] description, "Mod Support API ... optional"; v2.0 notes; [read] `HH/content.xml`, `OPT` grep |
| D2 | The options-menu board apparently had a "MOST WANTED" list, a "Wanted Faction:" field and sorting "By Value", "By Distance" and "By Latest Intel". | The map board sorts by name, bounty, sector or faction. **There is no distance sort and no latest-intel sort.** The five strings remain unused in `TXT` 123-127. | [read] `HH/t/0001-l044.xml` 25-29; the link to the old board is [inferred] |
| D3 | **Roaming Fleet integration**: "can be used alongside Roaming Fleet. Head Hunter bounty function will automatically take precedence". 1.2 synced the general-bounty range with Roaming Fleet. | No reference to Roaming Fleet anywhere (`roam` and `chill` don't appear in `ext_01.dat`). | [page]; [read] grep |
| D4 | **Disguised hunters**: they "won't disclose their true ship transponder code until they find you". | Hunters spawn already owned by the sending faction (`HUNT` `HuntersCreated` `set_owner`). On acquisition they only append " Head Hunter" to their names (`AI` 45-52). A commented-out line, `HUNT` 292, `<set_object_name ... $SendingFaction.shortname+' '+$hunter.knownname/> not needed if faction set`, suggests the original handled names or owner differently. Whether the original also hid the owner or the ID code is unverified. | [page]; [read] `AI` 45-52, `HUNT` 292; the original mechanism is [inferred] |
| D5 | Game target: built for 6.x/7.x (2023). The SirNukes options are the main UI. | Requires game 900 (9.00) and SirNukes 195. It also adds 9.00-only Lua APIs (headhunter.md, dependency table). | [page] dates; [read] `HH/content.xml` |

Kept unchanged in Reloaded (per the page's feature list): general bounties with sector-owner reputation (feature 2), faction-posted wanted bounties on killers with larger reputation (3, 5), player ships becoming wanted, and hunters that travel and search rather than spawn on the player, "so they can be juked or hidden from" (11-13). The page's hunter description matches Reloaded's search-and-camp AI.

## Notable for our design

- D1 matters for us: SWI has no `kuertee_ui_extensions` addon (headhunter.md, dependency table). The original's way of showing the board through SirNukes alone avoids the UIX hard dependency. It still needs a SirNukes build that works on 8.00 with SWI (headhunter.md, open question 7).
- D4's "unknown transponder until contact" idea fits a hunt fantasy (hunters appear neutral until they reveal themselves). Reloaded keeps only the rename.
- D2's "By Distance" and "By Latest Intel" sorts are cheap additions if we build our own board.

## Open questions

1. What do original 2.0.3-2.0.8 (October 2026) change? Download 2.0.8 (Nexus login needed) and read `ch.txt` and `md/`. This may also answer D2 and D4 from source.
2. Did the original hunters spawn under a cover owner (D4), or only under a hidden name?
