[Back to mods.md](../mods.md). Resolves issue #44, "Locked-mod sweep for 8.00 + SWI".

# Locked-mod sweep for X4 8.00 + SWI 0.91

**Question.** Which mods, beyond the series mods already chosen (SWI 0.91 HF1, Reaper's Ship Pack (SWI) With Jobs, Mycu's Equipment tooltips), are worth trying as **locked mods** for a bounty-hunter run? A locked mod changes the universe, jobs, factions or ships, or leaves things in the save, so it must be in before the first game starts (see GLOSSARY.md, "Locked mod" and "QoL mod").

Already ruled out, not repeated here: standalone kuertee UI Extensions, SirNukes Mod Support APIs, both Head Hunter mods.

**Short answer.** There is no official SWI list of compatible or recommended mods. SWI's own site says the list is "TBD", points to Discord, and warns that any mod touching factions, map, economy, jobs, ships, equipment, bailing, NPC levelling, relations or AI fleets will likely conflict unless it was made for SWI. So the candidates are SWI submods plus a few small gameplay mods that patch the same systems a bounty hunter uses. Worth trying, in order:

1. **Bailing Extension** (Vindicator): an SWI-built bailing rewrite. It decides whether "capture alive" works, but it overrides SWI's own bail roll, which design.md's surrender hail builds on. Decide on bailing before the version lock.
2. **Better Kill Credit** (Mysterial) 1.33: pays the police kill bounty for kills by your wingmen and for assists. Its patch points exist in vanilla 8.00 and don't overlap SWI's. It changes bounty income, so check it against the hunt-pay design.
3. **Dreadnaughts and Battlecruisers for SWI (DABC)** 6.04: the main SWI ship-and-jobs submod. It requires SWI 0.91 and X4 8.0. It's the base that Reaper's Job Pack and Expanded Escalation build on. It matters for the late size ladder.
4. **Reaper's Job Pack (SWI)** 1.01: only if DABC goes in. It needs DABC and RSP, and it adds more DABC and RSP fleets.

Everything else is rejected or deferred (table below). Nothing here has been loaded in the game yet: step 4 of "How we check a candidate" is still open for all four.

Conventions: **[read]** = read directly in a file, API response or first-party page. **[2nd-hand]** = from search-engine summaries of pages that return 403 to automated fetches (Nexus, ModDB), not read directly. **[inferred]** = my conclusion, not verified in the game. SWI paths are relative to `E:\x4-dev\reference\mods\swi-0.90` (`ext/` = SWI's `ext_01.cat`). We have no unpacked 0.91 reference yet, so file comparisons are against 0.90. Vanilla paths are relative to `E:\x4-dev\reference\x4-8.00\base`.

---

## 1. What SWI says about other mods

From SWI's site, [X4 Mods and Compatibility](https://sites.google.com/view/swinterworlds/x4-mods-and-compatibility) [read]:

- The recommended mod list is "TBD"; ask on the SWI Discord.
- SWI is a total conversion. Mods that do any of the following will likely conflict unless made for SWI: change or add factions, change the map, change the economy, change or add jobs, change or add ships, equipment, weapons or shields, change the bailing system, change NPC levelling, change faction relations (such as Dynamic Wars), or change AI or fleet compositions (such as Faction Enhancer and FOCW).
- Light QoL mods that add orders or small things without changing assets may work (examples given: Mules, Sector Explorers).
- SWI already changes: encounters (disabled), long-range sensor range, cargo magnets, ship modifications, and it integrates kuertee's Emergent Missions, Social Standings and Reputations.

The site's [FAQ](https://sites.google.com/view/swinterworlds/faq-and-known-issues) [read] says the team can't guarantee compatibility with any mod. Its [changelog page](https://sites.google.com/view/swinterworlds/roadmap-and-changelog) [read] stops at 0.86, so it is stale. Nexus [mod 349](https://www.nexusmods.com/x4foundations/mods/349) lists 0.91 HF1 as the latest, requiring X4 8.0, Protected UI Mode off and all five DLCs, and loading saves from SWI 0.90 or 0.91 only [2nd-hand].

**Bailing in SWI.** SWI replaces vanilla's bail block (`md/notifications.xml`, `PlayerOwnedShipAttacks`, `do_if[@value='$target.iscapturable']`, line 45) with a modified copy of MoonShadowFan's "Enhanced Bailing" [read: `ext/md/notifications.xml` lines 44-240]. SWI's site credits that mod. Any bailing mod therefore patches a block SWI has already rewritten.

## 2. Where the candidates came from

- **SWI submods on Nexus**, found through search: DABC (1045), Reaper's Job Pack (2220), Reaper's Trader Modifications (1942), Interworlds at War (1992), SWI Clone Wars Expansion (943), SWI No Neutral Sectors (1332), SWI Expanded Escalation (1704), Closed Loop Reborn (1024), Boron Addon (2081), Dangerous Interworlds (913), SWI - No Engine Boost (1496), SWI Patch Collection (924), Star Wars Interworlds - Careers (1534) [2nd-hand].
- **The Steam collection** ["X4: Star Wars Interworlds Modpack"](https://steamcommunity.com/sharedfiles/filedetails/?id=3460247232) by Trashcan Terry (18 items, last updated 2025-04-08) [read]. Steam currently flags it as removed from the community and as incompatible with X4, so it is only a list of what one player ran. Its gameplay mods are Bailing Extension, Better Kill Credit, Faster Crew Leveling, Protect Sector, Sector Patrol, SWI: Careers, TaterTrade and Assailer's loot and service mods.
- **The Nexus collections** "[7.5] Star Wars Interworlds: Expanded" ([bu5nbs](https://www.nexusmods.com/games/x4foundations/collections/bu5nbs/mods)) and "UI Extensions and HUD for SWI" (4lmz42) [2nd-hand]. The first targets 7.50, so it is outdated for 8.00. The second only fixes UIX load order (see `research/ui-extensions-vs-swi.md` on its branch).
- **GitHub:** [Dhomie/SWI-Sith-Extension](https://github.com/Dhomie/SWI-Sith-Extension) and [Akenno95/akenno_swi_expansion](https://github.com/Akenno95/akenno_swi_expansion) [read].
- **Reddit:** searches turned up no Reddit threads on SWI mod lists, and the Steam discussions found don't name specific mods. Community picks are only what the Steam collection shows.
- **Already on disk:** Better Piracy Reborn 14.10 (`E:\x4-dev\reference\mods\better-piracy-reborn-14.10`) [read].

Steam Workshop details come from the public `ISteamRemoteStorage/GetPublishedFileDetails` API [read]. Workshop uploads were unpacked from Steam's public CDN (an `XRWS` container holding `ext_01.cat/.dat`) to read their files [read].

## 3. Shortlist

### 3.1 Bailing Extension (Vindicator)

- **Source:** [Steam 3202993868](https://steamcommunity.com/sharedfiles/filedetails/?id=3202993868) [read], [Nexus 1342](https://www.nexusmods.com/x4foundations/mods/1342) [2nd-hand].
- **Version:** the Workshop file is `extensions/bailing_extension_v90.dat`, uploaded 2024-03-27 and not updated since (Steam API) [read]. The Nexus file version is unknown.
- **X4 target:** "compatible with X4 6.0+"; save-safe to add and remove [read: Workshop description]. No 8.00 or 9.00 claim either way. A Steam comment reports CTDs [2nd-hand].
- **SWI:** "I actually built this mod primarily for Star Wars Interworlds … compatible with at least SWI 0.72/0.73", and "any other bailing mods … will almost certainly conflict" [read]. No `content.xml` dependency on SWI.
- **Files:** all diffs except one new script [read: unpacked Workshop file]:
  - `md/bail_core.xml`: new mdscript.
  - `md/notifications.xml` (diff): **replaces the same node SWI replaces**, `//cue[@name="PlayerOwnedShipAttacks"]/actions/do_if[@value="$target.iscapturable"]`, and adds two more nodes around it.
  - `md/conversations.xml` (diff): replaces `$maysurrender` in `DefaultComm`. SWI also replaces a `set_value` in `DefaultComm` (`/mdscript/cues/cue[1]/actions/do_if[1]/set_value[4]`), probably the same one [inferred].
  - `aiscripts/orders.base.xml`, `interrupt.foundabandonedship.xml`, `lib.respond.foundabandonedship.xml` (diffs). SWI also diffs `orders.base.xml`; it has no diff on the other two.
- **Clash guess:** both replacements keep a root `do_if value="$target.iscapturable"`, so both apply, and whichever extension loads last wins the whole bail block [inferred]. With no dependency on SWI, load order isn't guaranteed (same problem as UIX vs SWI). To make it reliable, patch its `content.xml` with a dependency on `SW Interworlds` (as we did for Equipment tooltips).
- **Why it matters for the series:** bail and surrender decide whether "bring them in alive" works, and design.md's "give up or die" hail plans to build on SWI's bail roll. Swapping the bail model after launch would change that feature's odds mid-run, so this is a locked decision: SWI's bailing or Bailing Extension. Test first: does SWI's own bail roll already give enough surrenders in the playtest saves?

### 3.2 Better Kill Credit (Mysterial)

- **Source:** [Steam 1700645587](https://steamcommunity.com/sharedfiles/filedetails/?id=1700645587) [read].
- **Version:** Workshop file `better_kill_credit_v133.dat`, updated **2026-10-26** (Steam API) [read]. Search summaries say the last changelog entry was a 2022 5.1 update and that comments call it broken on 7.5/7.6 [2nd-hand]. The API date is newer, so treat those summaries as stale.
- **X4 target:** not stated. Its patch points all exist unchanged in vanilla 8.00 and 9.00 `md/notifications.xml` (the `ReputationTrigger` `check_value` at 8.00 line 2332, `$curdata.{1}.exists` at line 2337, and the `AttackResponse` `event.param.{2} == 'event_player_killed_object' and not event.param.{4}` conditions) [read]. That suggests it applies on 8.00 [inferred].
- **SWI:** no dependency, not SWI-specific.
- **What it does:** "Receive kill credit rewards from owned ships you aren't piloting and receive rewards for contributing to large ship kills even if you don't get the final shot." You still need the police licence for the higher rewards [read].
- **Files:** `md/BetterKillCredit.xml` (new mdscript) and `md/Notifications.xml` (diff: adds before `AccumulateRewards`' `ReputationTriggerStart`, edits `ReputationTrigger`, and replaces three attribute values in `AttackResponse`) [read]. SWI's `ext/md/notifications.xml` also patches `AttackResponse`, but only with an `add pos="before"` inside the `$responsetype == 2` branch (line 474). SWI's sanctions code hooks `PlayerKills` (`event_player_killed_object`), which BKC doesn't touch [read]. No overlapping selector [inferred].
- **Clash guess:** low on files. The real question is design: bounty-research.md §"Kill bounty" counts the vanilla police kill bounty as live in SWI, and BKC widens it to wing kills and assists. That changes Bobby's income once he has wingmen, and with it the hunt-pay balance. Also check that SWI's sanctions don't double-pay a BKC-credited kill [inferred].
- **Note:** the filename is `Notifications.xml` (capital N). X4 file paths are case-insensitive on Windows [inferred], but check that the patch applies in `debuglog.txt`.

### 3.3 Dreadnaughts and Battlecruisers for SWI (DABC) (Sovrei and the DABC Team)

- **Source:** [Nexus 1045](https://www.nexusmods.com/x4foundations/mods/1045) [2nd-hand].
- **Version:** 6.04, last updated 2026-07-31. 6.00 (announced 2026-03-14) was the SWI 0.91 release; 6.01 lists "Requires X4 8.0, Requires SWI 0.91, only save compatible with DABC 6.0" [2nd-hand].
- **What it does:** adds XL/XXL dreadnaughts and battlecruisers with their own faction jobs (minimum and maximum quotas, keeping SWI's balance between factions), new stations and abandoned ships, and icon and equipment art. 6.0 reworked its jobs to "greatly reduce the number of XXLs" [2nd-hand]. A commenter calls it "heavily integrated with SWI" [2nd-hand].
- **Files:** not read. We need the zip (Nexus only). Expect diffs on `libraries/jobs.xml`, `ships.xml`, `wares.xml` and the indexes, like RSP [inferred].
- **Clash guess:** RSP With Jobs is already in, and Reaper's Job Pack is built to run RSP and DABC together, so the authors expect the two to coexist [2nd-hand]. Check for jobs with the same id in both.
- **Why it matters:** the series' size ladder ends at capitals. DABC sets which big ships factions field and how many, so it changes late-game targets and threats. It can't be added mid-run without a new game (save compatibility is tied to DABC 6.x), so it is locked.

### 3.4 Reaper's Job Pack (SWI) (Reaperxvii)

- **Source:** [Nexus 2220](https://www.nexusmods.com/x4foundations/mods/2220) [2nd-hand].
- **Version:** 1.01, uploaded 2026-07-09 [2nd-hand].
- **Needs:** DABC and RSP. The author says it can be added to an existing save [2nd-hand].
- **What it does:** "roughly triples most fleets in DABC", swaps some escorts for RSP ships and adds some RSP fleets. More fleets, not bigger ones. Meant to be harder than base SWI or DABC [2nd-hand].
- **Clash guess:** same author as RSP, so low against RSP [inferred]. Three times the capital fleets is a big difficulty and performance step for a small-ship bounty start. Try it only after DABC, and only if the late game feels empty.

## 4. Rejected or deferred

| Mod | Version / date | X4 / SWI target | Why not (now) | Source |
| --- | --- | --- | --- | --- |
| Better Piracy Reborn (Jayseun), `ws_3816572322` | 14.10 on disk, 14.12 on Workshop (2026-10-21) | "Compatible with 9.x"; needs SirNukes | **Rejected.** Removes vanilla's `g_surrender` choices from `DefaultComm` (conflicts with design.md's surrender hail). Replaces values in the bail block SWI rewrote (`$ejectchance`, `$numcrewbailing`, `$damageminpercent`, `$scuttle`). Ships non-diff `libraries/experiences.xml` and `icons.xml`, which SWI also patches. 9.00-shaped patches | [read] `content.xml`, unpacked files |
| Enhanced Bailing (Topo123), Nexus 2290 | — | "X4 9.00 or later … will not apply to older versions" | **Rejected:** 9.x only | [2nd-hand] |
| Enhanced Bailing (MoonShadowFan), Nexus 741 | updated for 4.2 | old | Already inside SWI | [read] SWI `ext/md/notifications.xml` line 44 |
| SWI Sith Expansion: Crisis Edition (Dhomie) | `version="200"`, 2026-01-22, GitHub release v2.0.0 "testing version" | SWI 0.9X; dependency `SW Interworlds` | **Deferred.** `save="1"` (the save requires it). Diffs `jobs.xml` (47 Sith jobs), `god.xml`, `factions.xml`, faction-logic MD; also patches SWI's own map files. Makes the Sith a crisis or ally faction, which doesn't serve a bounty run and adds risk | [read] repo |
| SWI Clone Wars Expansion, Nexus 943 | unknown | "Requires SWI"; no 0.91 confirmation found | **Deferred.** Overhauls AI jobs and sector patrols and changes the era. Too big without a 0.91 build confirmed | [2nd-hand] |
| Interworlds at War (SWI), Nexus 1992 | 1.0.2, 2026-03-03 to 04-27 | SWI; a YouTube episode title pairs it with SWI 0.91 on X4 8.0 | **Deferred.** A combat rebalance (faster lasers, +50% missile and turret range), incompatible with any weapon mod. Locked, but it's a difficulty choice, not a bounty feature. Revisit if stock combat feels too easy | [2nd-hand] |
| SWI No Neutral Sectors, Nexus 1332 | unknown | "SWI 0.8x" | **Rejected.** Turns on faction logic in the 27 neutral sectors, and factions push pirates out of their home sectors. Fewer safe pirate bases means fewer bounty targets. Not for a first run, per its own page | [2nd-hand] |
| SWI Expanded Escalation, Nexus 1704 | unknown | needs DABC and "Heroes for SWI" | **Deferred.** Phased escalation every 5 game hours, with named and boss capitals. Interesting for late-game targets, but "Heroes for SWI" wasn't found, so its version is unknown | [2nd-hand] |
| Dangerous Interworlds, Nexus 913 | updated 2026-02-25 | "SWI 0.6+"; a related fix was "0.7x only" | **Rejected:** unclear support for 0.9x | [2nd-hand] |
| SWI Patch Collection, Nexus 924 | 0.1, 2023-01-02 | "not working with SWI 0.70 or higher" | **Rejected:** outdated | [2nd-hand] |
| Star Wars Interworlds - Careers (Swizzle), Steam 3334171200 / Nexus 1534 | 1.05, 2024-10-22 | SWI of 2024 | **Rejected.** A separate roguelike mode with its own progression, not compatible with the Bankrupt Bounty Hunter start | [read] Workshop |
| Closed Loop Reborn, Nexus 1024 | updated 2026-02-15, "updated for 0.72" | SWI 0.72 | **Rejected:** economy change, not bounty-related, version stale | [2nd-hand] |
| Boron Addon, Nexus 2081 | — | "X4 8.0 and SWI 0.9" | **Rejected:** player station modules only | [2nd-hand] |
| Akenno's SWI Expansion | `version="001"`, last push 2026-04-21 | dependency `SW Interworlds` | **Rejected:** a personal repo (1 star) that reuses DABC assets; no release | [read] repo |
| Faster Crew Leveling ($300), Steam 2050537227 | v19, 2025-01-15 | "still working" on 7.60 and 8.0 | **Not needed.** Changes crew levelling, which SWI's site lists as a likely conflict (SWI diffs `libraries/experiences.xml`). Save-safe both ways | [read] Workshop |
| Sector Patrol, Steam 2458720435 | v1.14, 2026-09-13 | says "7.x" | **QoL, later.** Adds a player-wing order to patrol a sector and chase threats. Could help a wing-based hunter in mid-game; can be added mid-run | [read] Workshop |
| Protect Sector, Steam 3379427822 | v2.02, 2026-10-05 | "X4 8.00 and upper"; needs SirNukes 1.95, Options Helper, Print Extension List | **Not needed:** for defending a sector, not hunting | [read] Workshop |
| kuertee NPC Reactions, Nexus 497 | 7.1.07 (2024-09-17) is the last found | 7.x | **Rejected for now:** no 8.0 build found. SWI 0.86 added compatibility with its rumours | [2nd-hand]; SWI changelog [read] |

## 5. Next steps (per "How we check a candidate")

1. Download DABC 6.04, Reaper's Job Pack 1.01 and Bailing Extension (Nexus 1342, for the current version) by hand. Unpack them next to `E:\x4-dev\reference\mods\`, and list each one's `content.xml` and files against SWI 0.91 once that is unpacked as a reference.
2. Decide on bailing: run a few surrender attempts on SWI's stock bail roll in save_007 first. Only try Bailing Extension if surrenders are too rare, and give it a `SW Interworlds` dependency so it loads after SWI.
3. Load each shortlisted mod on a fresh Bankrupt Bounty Hunter start and check `debuglog.txt` for patch errors (BKC's `Notifications.xml`, and DABC and RSP job ids).
4. Record results in mods.md's Candidates table.

## Sources

- SWI site: [Overview](https://sites.google.com/view/swinterworlds/), [X4 Mods and Compatibility](https://sites.google.com/view/swinterworlds/x4-mods-and-compatibility), [FAQ](https://sites.google.com/view/swinterworlds/faq-and-known-issues), [Roadmap and Changelog](https://sites.google.com/view/swinterworlds/roadmap-and-changelog) [read].
- Steam Workshop pages and the `GetPublishedFileDetails` API: [3460247232](https://steamcommunity.com/sharedfiles/filedetails/?id=3460247232) (modpack), [3202993868](https://steamcommunity.com/sharedfiles/filedetails/?id=3202993868), [1700645587](https://steamcommunity.com/sharedfiles/filedetails/?id=1700645587), [3334171200](https://steamcommunity.com/sharedfiles/filedetails/?id=3334171200), [3379427822](https://steamcommunity.com/sharedfiles/filedetails/?id=3379427822), [2458720435](https://steamcommunity.com/sharedfiles/filedetails/?id=2458720435), [3816572322](https://steamcommunity.com/sharedfiles/filedetails/?id=3816572322), [2050537227](https://steamcommunity.com/sharedfiles/filedetails/?id=2050537227) [read].
- GitHub: [Dhomie/SWI-Sith-Extension](https://github.com/Dhomie/SWI-Sith-Extension), [Akenno95/akenno_swi_expansion](https://github.com/Akenno95/akenno_swi_expansion) [read].
- Nexus (all through search summaries, since Nexus returns 403): [349](https://www.nexusmods.com/x4foundations/mods/349), [1045](https://www.nexusmods.com/x4foundations/mods/1045), [2220](https://www.nexusmods.com/x4foundations/mods/2220), [1342](https://www.nexusmods.com/x4foundations/mods/1342), [2290](https://www.nexusmods.com/x4foundations/mods/2290), [943](https://www.nexusmods.com/x4foundations/mods/943), [1992](https://www.nexusmods.com/x4foundations/mods/1992), [1332](https://www.nexusmods.com/x4foundations/mods/1332), [1704](https://www.nexusmods.com/x4foundations/mods/1704), [913](https://www.nexusmods.com/x4foundations/mods/913), [924](https://www.nexusmods.com/x4foundations/mods/924), [1534](https://www.nexusmods.com/x4foundations/mods/1534), [1024](https://www.nexusmods.com/x4foundations/mods/1024), [2081](https://www.nexusmods.com/x4foundations/mods/2081), [497](https://www.nexusmods.com/x4foundations/mods/497), collection [bu5nbs](https://www.nexusmods.com/games/x4foundations/collections/bu5nbs/mods) [2nd-hand].
- Local: SWI 0.90 reference `ext/md/notifications.xml`, `ext/md/conversations.xml`, `ext/aiscripts/orders.base.xml`, `ext/libraries/`; vanilla 8.00 and 9.00 `md/notifications.xml`, `md/conversations.xml`, `aiscripts/*foundabandonedship.xml`; Better Piracy Reborn 14.10 unpacked [read].
