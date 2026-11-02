[Back to the bounty research](../bounty-research.md). Detailed reference for its "Head Hunter features" section. Wing, surrender and odds mechanics: [headhunter-wings.md](headhunter-wings.md).

# Head Hunter - Reloaded (ice_headhunter 1.01): feature inventory

Research for porting or rebuilding on X4 8.00 with Star Wars Interworlds (SWI) 0.90. Every claim cites a file and line, or a cue or function name. Things I worked out without seeing them run are marked **(inferred)**. Nothing was executed; the files were only read.

Abbreviations used below:
- `HH/` = `ice_headhunter/` (the unpacked mod, Head Hunter - Reloaded v1.01 from [Nexus 2289](https://www.nexusmods.com/x4foundations/mods/2289))
- `MD` = `HH/md/ice_headhunter_md.xml` (core logic, mdscript `HeadHunterMD`)
- `OPT` = `HH/md/ice_headhunter.xml` (setup and options, mdscript `IceHeadHunter`)
- `HUNT` = `HH/md/ice_headhunter_hunted.xml` (hunter groups, mdscript `HeadHunterHunted`)
- `LOG` = `HH/md/ice_headhunter_logging.xml`
- `AI` = `HH/aiscripts/headhunter.assassinate.xml`
- `LUA` = `HH/ui/ice_headhunter.lua`
- `TXT` = `HH/t/0001-l044.xml` (page 8008574)
- `V8` = vanilla 8.00, game-relative paths (unpacked from `E:\SteamLibrary\steamapps\common\X4 Foundations - 8.00`); `V9` = vanilla 9.00 reference (`E:\x4-dev\reference\x4-9.00`); `SWI` = SWI 0.90 reference (`E:\x4-dev\reference\mods\swi-0.90`)

## Overview

The manifest (`ice_headhunter/content.xml`) requires game version 900 and `kuerteeUIExtensionsAndHUD` 900 (not optional). SirNukes Mod Support APIs (`ws_2042901274`) 195 is optional. `save="0"`, so saves don't hard-depend on the mod.

The mod has five systems:

1. **General bounties.** The player gets paid credits, and optionally reputation, when a hostile ship the player's assets attacked is destroyed (`MD` `HHAttackTagger`, `Watcher`, `DeathWatcher`).
2. **Wanted board data.** Any ship (NPC or player) that kills a non-Xenon, non-Kha'ak, owned ship, or destroys a station module, gets a bounty added to `global.$HeadHunterWantedTracker` (`MD` `WantedDestructionTracker`, `PlayerWantedDeathTracker`, `StationModuleDestructionTracker`).
3. **Claiming.** When a wanted ship dies, its killer claims the bounty. If the killer is the player's, the player gets paid credits and reputation (`MD` `WantedClaimTracker`). Captures and owner changes clear the bounty instead.
4. **UI.** A "Headhunter Wanted Board" tab in the map's right sidebar, with a filters panel and a sortable bounty table; bounty labels on wanted ships on the holomap; "wanted ship nearby" notifications (`LUA`, `MD` `UpdateWantedHolomapTags`, `WantedPlayerProximity`).
5. **Head Hunter attack groups.** When the player's own ships are wanted, groups from hostile or pirate factions spawn and hunt them with a custom AI order. They can be bribed off over comms (`HUNT`, `AI`).

The options menu goes through SirNukes' Simple Menu API (`OPT` `HHOptsInit`). Logging goes to a file (`LOG`).

Data flows one way, from MD to Lua. MD writes a list of tables to the player entity's blackboard, `player.entity.$headhunterWantedShips` (`MD` `BuildHunterLuaTable`, line 1019). Lua reads it with `GetNPCBlackboard(playerId, "$headhunterWantedShips")` (`LUA` 132-139). Lua asks MD for refreshes with `AddUITriggeredEvent("MapMenu", <control>)`, which MD catches with `event_ui_triggered` (`MD` 1022-1063).

### Core data structures

| Name | Type | Contents | Where |
|---|---|---|---|
| `global.$HeadHunterWantedTracker` | table keyed by ship | `{$killer, $value (int credits), $lastseen (sector), $lastvictimfaction (faction), $lastseentime (player.age), $maptagvisible, $maptaglabel}` | created `OPT` 11; written `MD` 452-460, 592-605, 680-704; tag fields `MD` 1096-1097 |
| `global.$HHAllShips` | group | every functional, non-deployable ship except drones, escape pods and laser towers, and except those whose true owner is Kha'ak, ownerless or Xenon; the victims we watch for wanted bounties | `MD` 130-137, 207-214; added to on `event_job_ship_activated` (`AllShipsHandler`, 967-984) |
| `global.$HHAllWanted` | group | ships in the tracker (destruction watch) | rebuilt `MD` 145-153, 215-223, 344-353 |
| `global.$HHAllPlayerWanted` | group | player-owned wanted ships (hunter targets) | `MD` 154-159, 224-229, 349-351 |
| `global.$HHAttackWatched` | group | hostiles the player attacked (general bounty) | `MD` 29-32 |
| `global.$HHPlayerAttackWatched` | group | non-hostile-filtered victims the player attacked (player wanted bounty path) | `MD` 380-383 |
| `global.$HHAllStations`, `$HHActiveStations`, `$HHAllStationModules` | groups | all non-wreck stations not owned by ownerless, Xenon or Kha'ak; stations that were attacked; operational modules of attacked stations | `MD` 141-144, 256-259, 265-282 |
| `global.$HHAllPlayerOwnedShips` | group | player S/M/L/XL ships (proximity scanners) | `MD` 121-127, 299-306, `UpdatePlayerShips` 836-844 |
| `global.$HHMapTagCleanup` | group | ships whose holomap label must be removed | many cues; processed `MD` 1069-1077 |
| `global.$HHHunters` | group | live spawned hunter ships | `HUNT` 16, 349 |
| `global.$HHThrottled` | bool | proximity notification throttle | `MD` 845-849, 880, 896 |
| `player.entity.$headhunterWantedShips` | list of tables | `{$ship, $idcode, $name, $value, $lastseensector, $lastseentime, $victimfaction, $isinliveview}` for Lua | `MD` 994-1019 |

Timers in `MD` `PapaCue`: `HHGatherTimer` every 30 min refreshes the watcher groups (175-181). `HHCleanupTimer` runs the hourly cleanup (182-186). `RefreshWatchersOnGameLoaded` rebuilds everything on load (164-174).

---

## Feature list

### 1. Install and setup, defaults, save migration

- **Player sees:** a purple help message, "Head Hunter Mod Installed: This is the way" (`OPT` 42).
- **How:** `LoadStuffAndSetup` (version 15) runs on `event_universe_generated` (`OPT` 4-149). If the tracker doesn't exist yet, it creates it and sets every option global to its default (11-36; values in the Settings section). Patches 2-15 add options to older saves (44-148). Patch 10 divides every stored `$value` by 100 (88-94): older versions stored cents, this one stores credits. `PapaCue` (`MD` 107-162, also on `event_universe_generated`) creates the groups and fills them with `find_ship` and `find_station`. `Init` in `HUNT` (7-20) creates `global.$HHHunters`.
- **(inferred)** These cues rely on `event_universe_generated` firing the first time the script is seen in an existing save; the help message "Mod Installed" suggests that is the intent. See open questions.

### 2. General kill bounty (credits for hostiles the player attacked)

- **Player sees:** a logbook alert "Earned General Bounty" (`TXT` 128/129). The text is "<attacker> shot down <victim> in <sector>. <payer> has paid a general bounty ... <amount> credits". Credits are added to the account.
- **Trigger:** `HHAttackTagger` (`MD` 5-38) fires on `event_player_owned_attacked_object` (param = attacker, param2 = victim). Conditions: the victim is not already watched; it is an S/M/L/XL ship and not a distress drone, escape pod, laser tower, small drone or XS drone; it is not ownerless and not player-owned; it is `ishostileto.{faction.player}`; it is operational. Xenon and Kha'ak are **not** excluded here.
- **Tracking:** it adds the victim to `$HHAttackWatched` and signals `Watcher`. `Watcher` (namespace `this`) snapshots the attacker, the time and `$enemy.shield + $enemy.hull` (44-50). Sub-cue `WatcherExpire` (93-104) cancels the watch 600 s after the first attack. The watch is not extended by later attacks.
- **Payout** (`DeathWatcher`, 53-92, `event_object_destroyed object="$enemy"`):
  - **The killer is not checked.** If the victim dies by any cause within 10 min, the player is paid.
  - Reward: `$reward` is a random int between `0.5*(shield+hull)` and `1.0*(shield+hull)` (76-77). It is then multiplied by `global.$HeadHunterBountyMultiplier` (78) and paid with `transfer_money from="faction.civilian" to="faction.player"` (85). The step is skipped entirely if the multiplier is 0 (75).
  - The logbook entry uses `money=$reward` and `bonus=modified-base` (81-84).
  - Payer name: "The Intergalactic Bounty Fund", or the sector owner when the reputation branch applies (58, 68).
- **Reputation** (60-69): applies if the victim is hostile to the sector's true owner, the sector owner is not the player, `$HeadHunterGainReputation` is on, and the owner's relation to the player is below 1. Then `add_faction_relation` adds `HHAttackTagger.$reputationcalc` to the sector owner, with reason `relationchangereason.destroyedfactionenemy`. `$reputationcalc = 0.0064/2,000,000 * (shield+hull)` is set in the *instance* of `HHAttackTagger` (35). The reference `HHAttackTagger.$reputationcalc` reads the static cue's variable, so it is **probably null and grants nothing (inferred bug)**.

### 3. Wanted bounty from ship kills (NPC and player killers)

- **Player sees:** the killer shows up on the Wanted Board with a growing bounty ("serial killer" accumulation).
- **NPC-vs-NPC path:** `WantedDestructionTracker` (`MD` 627-726) fires on `event_object_destroyed group="$HHAllShips"`. Conditions:
  - the victim is not already wanted (a wanted ship's killer is "left in peace", 631);
  - the victim is not in `$HHPlayerAttackWatched` and not a hunter;
  - the killer is a ship (S-XL), not a laser tower, deployable, unit or drone type;
  - the victim is a ship with a true owner other than Xenon, Kha'ak or ownerless, and has `.value`.
- **Player-attacked path:** `PlayerWantedAttackTracker` (359-387) watches any non-ownerless, non-player, non-Xenon/Kha'ak, non-hunter ship that the player attacks. This applies regardless of hostility. `PlayerWantedDeathTracker`/`PlayerWantedDeathWatcher` (388-487) then resolves the killer in this order: `event.param` if it is a ship, else the initial attacker, else `player.occupiedship`, `player.controlled`, then `player.entity.object` (411-427). The watch expires after 600 s (475-485). **So the player's own ships become wanted for killing, including killing hostile pirates.**
- **Formula** (identical in both paths: 446-450 and 673-677):
  ```
  VictimCreditValue = (victim.value / 100)i              # .value is in cents
  Base     = (VictimCreditValue * WantedBountyPercent / 100)i   # default 20 %
  Variance = if Base >= 10 then victim.seed % (Base/10) else 0  # up to -10 %, deterministic per victim
  Added    = max(Base - Variance, 0)
  ```
- **Record:** if the killer is already in the tracker, `$value += Added`, and `$lastvictimfaction`, `$lastseen = killer.sector` and `$lastseentime` are updated (680-686). Otherwise a new entry is created (698 or 702). The killer is then added to `$HHAllWanted`, and to `$HHAllPlayerWanted` if player-owned (707-720). Finally `BuildHunterLuaTable` is signalled.
- "Wanted by" (`$lastvictimfaction`) is the faction of the **most recent** victim.
- **Restrict wanted targets ("Classic Baddies"):** when on, only killers whose true owner is `xenon`, `khaak`, `scaleplate`, `fallensplit` or `buccaneers` get bounties (440, 668, 701, 716). In this mode the player's ships can never become wanted.
- Victims in `$HHAllShips` are removed on death (723). Killed hunters never create bounties (633, 402).

### 4. Wanted bounty from station-module destruction

- **Trigger:** `StationAttackTracker` (`MD` 265-282) fires on `event_object_attacked group="$HHAllStations"`. The first attack on a station adds `$Station.modules.operational.list` to `$HHAllStationModules` (lazy activation). `$HHAllStations` includes **player-owned stations**: the `find_station` excludes only ownerless, Xenon and Kha'ak (141-144, 256-259).
- **Payout** (`StationModuleDestructionTracker`, 517-626): on `event_object_destroyed group="$HHAllStationModules"` where the killer is an S-XL ship that is not a laser tower:
  - If the killer `typename == 'Drone'`, the bounty goes to its commander (534-541).
  - Skipped if the killer is a deployable or drone type, if the station's owner is missing or is Xenon, Kha'ak or ownerless, or if Classic Baddies excludes the killer.
  - Module value is `sum(resource.averageprice * amount)` over `$Module.macro.ware.resources.table` (568-575). `WantedBountyValue = (value/1Cr)i * StationModuleBountyPercent / 100` (default 50 %, 582-584).
  - The entry is added or accumulated like in feature 3, with `$lastvictimfaction = station.trueowner` (591-619). The module leaves the group (622-624).
  - **This path does not signal `BuildHunterLuaTable`**, so the board updates on the next refresh (inferred harmless; the Lua polls every 3 s).

### 5. Claiming wanted bounties

- `WantedClaimTracker` (`MD` 727-791) fires on `event_object_destroyed group="$HHAllWanted"` when there is a tracker entry with `$value`, the killer is a ship and not deployable, and the victim is a ship. A drone killer passes the claim to its commander (739-745).
- **NPC claim notification** (749-755): only if `$HeadHunterNPCNotify` is on and the claimer is not player-owned. It shows `show_notification` with `TXT` 130 and writes a logbook entry with `TXT` 131/133. `TXT` 132 and 134 are chosen only when the claimer is player-owned, so they are **effectively unused (inferred)**.
- **Player claim** (756-776): the claimer is player-owned and the wanted ship is not (this blocks self-farming).
  - Reputation, if enabled: `min(0.00016 + 0.00064/8,000,000 * value, 0.02)` with `$lastvictimfaction` (759), reason `destroyedfactionenemy`. That is about one UI step (0.00064 = 1 step, `SWI` factions.xml comment line 30) plus 0.1 step per 1.25 M credits, capped at 0.02.
  - A coloured multi-row notification "Bounty Claimed / Wanted ship / Sector / Payout" (`TXT` 408/400/406/407) using vanilla `{1001,120}` (colon) and `{1001,101}` (Cr) (762-772).
  - `transfer_money from faction.civilian` for the full bounty (774).
  - `PayoutEffect` (815-835, 2 s delay, only if `$HeadHunterPayoutNotify`): the ship computer says line 279 ("Incoming fund transfer", page 10002) with the faction's name. The faction representative then plays one of lines 2013/2111/5023 ("Good doing business" / "Thanks for your help" / "Here's a little something") via the `player.interaction` script.
- **Afterwards:** the entry is removed, the ship is queued in `$HHMapTagCleanup`, and the Lua table is rebuilt (777-789). `WantedDestroyedCleanup` (792-814) removes any entry still present 1 s after a wanted ship dies with an invalid claimer, without payout.

### 6. Capture, boarding and bail-out handling of wanted ships

- `LCapturedHandler` (`MD` 907-924): on `event_object_claimed` of an L/XL wanted ship, the bounty is removed with no payout.
- `WantedShipBoardedByPlayerHandler` (925-944): when any wanted ship changes owner to the player, the bounty is removed with no payout.
- `SCapturedHandler` (945-966): when an S/M wanted ship is abandoned (`event_object_abandoned`), the entry is removed and `PayoutEffect` plays (voice only). **`$rewardCr` is computed but never transferred, so there is no money (inferred bug).**

### 7. Cleanup and maintenance

- `HourlyCleanup` (`MD` 283-358) rebuilds `$HHAllPlayerOwnedShips` and drops tracker entries for:
  - ships that no longer exist, aren't ships, or are non-operational or wrecks;
  - deployables, laser towers, units and drone types;
  - entries whose `$value` is missing or 0 or below, or whose `$lastvictimfaction` is missing or is Xenon, Kha'ak or ownerless.
  It then rebuilds `$HHAllWanted` and `$HHAllPlayerWanted`, and queues map tags for removal.
- `RefreshWatchers` (187-237) rebuilds `$HHAllShips` and the wanted groups, and resets `WantedClaimTracker` and `WantedDestructionTracker`, since group-based event conditions are rebound when a cue is reset (inferred reason).
- `RefreshStationModuleWatchers` (238-264) rebuilds the station groups.
- Options "Reset wanted board" (`OPT` `ClearWantedBoard` 952-963) and "Reset options" (`OPT` `ResetOptionsToDefaults` 909-951). See Settings.

### 8. Wanted Board (map right-sidebar tab)

- **Player sees:** a new right-sidebar tab, "Headhunter Wanted Board" (`TXT` 104), with the custom icon `mapst_headhunter` (`HH/libraries/icons.xml`, texture `assets/fx/gui/textures/map_sidebar_tabs/mapst_headhunter.gz`). It is inserted after the vanilla "legend" entry (`LUA` `createRightBar`, 252-283, UIX callback `createRightBar_on_start`).
- **Panel construction** (`createInfoFrame2_on_menu_infoModeRight`, `LUA` 294-315): runs only when `mapMenu.searchTableMode == "headhunter"`. It builds the list, then two tables:
  - **Filters table** (`buildSettingsTable`, 322-363):
    - a location dropdown, "Show all locations" or "Only known sectors" (`TXT` 210/211). The known filter removes rows whose last-seen sector fails `C.IsKnownToPlayer` (`filterByLocation`, 719-738);
    - a "Target faction filter" button (`TXT` 222). It opens a context popup (`openTargetFactionFilter` / `createTargetFactionContextFrame`, 404-515) with an all-toggle checkbox ("Target factions", `TXT` 221), one checkbox per **wanted ship's owner faction**, and OK/Cancel (`{1001,14}`, `{1001,64}`). Deselected factions are kept in `config.settingsTable.sortStates.targetFactionDeselected` (`applyTargetFactionContext`, 580-591). Unknown factions are grouped as `__unknown__` (91, 218-223).
  - **Bounties table** (`buildBountiesTable`, 593-680): 6 columns, a title row and a sortable header row:
    1. ship icon (`GetComponentData(ship,"icon")`, tinted with the owner faction's colour);
    2. "Wanted ship": `(IDCODE) name`, in the owner's colour;
    3. "Reward": `ConvertMoneyString(bounty) .. 'Cr'`, right-aligned;
    4. "Last spotted": the sector name, white if the ship is in live view, grey otherwise. If the sector isn't known to the player it shows "Unknown sector" (`TXT` 300);
    5. a guidance button (icon `mapst_mission_guidance`, active only if the ship is in live view). It calls `C.SetGuidance(component, UIPosRot 0)` and refuses the player's own ship (`activateGuidance`, 839-846);
    6. "Wanted by": the victim faction's short name, in its colour, "---" if unknown.
    The list is capped at `config.maxShips = 50` rows (21, 630-633).
- **Sorting** (`createSortHeader`/`toggleSort`/`sortShips`/`getSortValue`, 682-798): name, bounty, sector or faction. The default is bounty descending (24-28). Clicking the active column flips the direction. A new column starts ascending, except bounty. Ties break by name.
- **Row interaction** (`onSelectElement`, 810-822, UIX `ic_onSelectElement`): double-click focuses the map on the ship (if in live view) or on its last-seen sector (`C.SetFocusMapComponent`), and selects it (`C.SetSelectedMapComponent`, 824-837). `onRowChanged` (848-852) clears `mapMenu.noupdate`. `refreshInfoFrame2_on_start` (285-292) keeps the top and selected row across refreshes.
- **Live update** (`onUpdate`, 868-902, registered with `SetScript("onUpdate")`, 956-959):
  - When the map opens, it sends `headhunter_refresh_wanted_tags_force` once. MD clears the tag cache and re-labels everything (`MD` 1039-1054).
  - While the board is open, it sends `headhunter_refresh_wanted` every 3 s. MD rebuilds the blackboard list and tags (1022-1030). Lua compares a signature (ship|value|sector|time|faction|liveview, `getWantedSignature` 141-157) 0.1 s later and calls `mapMenu.refreshInfoFrame2()` only if it changed and no dropdown is open.
  - While the map is open with the board closed, it sends `headhunter_refresh_wanted_tags` every 3 s (1031-1038).
  - Opening the tab also fires `event_ui_triggered control="headhunter"`, which the vanilla right-bar toggle emits (`SWI` menu_map.xpl 2601; `V8` menu_map.lua 2537). MD `BuildHunterLuaTableOnWantedBoardOpen` (1055-1063) catches it.
- Unused strings: "MOST WANTED" and "Wanted Faction:", and "By Value", "By Distance", "By Latest Intel" (`TXT` 123-127) are unreferenced (inferred leftovers).

### 9. Bounty labels on the holomap

- `UpdateWantedHolomapTags` (`MD` 1064-1118) removes the labels in `$HHMapTagCleanup`. Then, for each wanted ship in live view, it shows `add_holomap_text "(<label>)"`. Player-owned ships are labelled only if the "Wanted markers for player ships" option is on (1081).
- Label format (1083-1092): `N Cr` below 1000; `round(N/1000)K Cr` below 999,500; else `round(N/1e6)M Cr`. The current label is cached in `$maptaglabel` so the text is only replaced when it changes (1093-1098).
- Ships that leave live view have their labels removed (1100-1104). Invalid entries are dropped from the tracker (1106-1115).

### 10. Wanted-ship-nearby notifications and "latest intel"

- `WantedPlayerProximity` (`MD` 850-906) fires on `event_gravidar_has_scanned group="$HHAllPlayerOwnedShips"`. It gets contacts with `count_gravidar_contacts`: same sector (`match_context` sector macro), ships, not XS/small drone or laser tower, **not player-owned**.
- For each contact in the tracker:
  - Always: update `$lastseen` and `$lastseentime` (899-900). This is the only "intel" source besides new kills.
  - If not throttled, proximity notify is on, and the value is at least `$HeadHunterProximityThreshold`:
    - If the scanning ship is in vanilla `global.$PlayerShipsGroup` (the player's ship and its carrier; `V8` md/setup.xml 46, 574), the computer says line `[2021,511]` ("Ship ... within sensor range", page 10002) and a priority-90 purple notification shows "Wanted Ship Nearby / Wanted ship / Sector / Reward" (`TXT` 409/400/406/401).
    - Otherwise it plays the UI sound `ui_hud_soft_scan_pos_core` and shows the same notification at priority 5.
    - Then it sets `$HHThrottled`.
- `ProximityThrottle` (845-849) clears the throttle every 60 s, so at most one alert a minute, galaxy-wide.
- `UpdatePlayerShips` (836-844) adds newly built player ships to the scanner group on `event_player_built_ship`. Captured ships join only at the next hourly cleanup (inferred).
- `TXT` 135/136 (older "Wanted Ship Nearby!" and "Wanted Ship Spotted" texts) are unused (inferred).

### 11. Head Hunter attack groups: when and who

- **Timer:** `HunterTimer` (`HUNT` 22-76) checks every 15 s, the first time at +60 s. It needs `$HeadHunterHuntersEnabled` and at least one player wanted ship (`$HHAllPlayerWanted.count gt 0`). Every `SpawnInterval` seconds (default 240, clamped 120-1200) it:
  1. picks a **random** player wanted ship as `$playertarget` (48-49);
  2. runs the orphan check: if any live hunter has `pilot == null`, or any is at least 45 min past its `spawntime`, it runs `destroy_group global.$HHHunters` (50-68). That **instantly destroys every hunter**, a hard despawn;
  3. signals `SpawnHunters` with `chance = SpawnChance` (default 50 %, 69);
  4. resets `TargetClaimed`.
- **Variable scope (inferred):** `HunterTimer`, `SpawnHunters`, `HuntersCreated` and `StartTalk` have no `namespace` attribute, so their `$playertarget`, `$SendingFaction` and `$Difficulty` live in the static `Init` namespace and are shared.
- **One group at a time:** `SpawnHunters` requires `$HHHunters.count == 0` and an operational target with a bounty (77-84).
- **Sending faction** (89-141):
  - Start with `[scaleplate, buccaneers, fallensplit]`, which are always eligible.
  - Add `argon`, `antigone`, `teladi`, `paranid` and `holyorder` if the player's relation is at or below the threshold. The threshold is the UI value from the "Head Hunter faction reputation threshold" option (default -15, range -20..20), converted with `md.LIB_Generic.CalculateReputation` (`V8` base/md/lib_generic.xml 251) and sign-restored (96-101).
  - Add `boron` if `md.Setup_DLC_Boron` exists and `Boron_Gates_Open_KingdomEnd` is complete.
  - Add `loanshark` (Pirate DLC), `split` (Split DLC), and `terran` + `pioneers` (Terran DLC), each under the same threshold check.
  - Pick one at random (`set_value list=`, 141). **The pick is unrelated to who the ship is "wanted by".**
- **Spawn position** (142-159): the faction's `headquarters`; else a random operational, non-wreck station of that faction; else the **target's own sector** at `position 0,0,0`.

### 12. Head Hunter attack groups: size, equipment, setup

- **Sizing** (160-224): `find_gravidar_contact` from the target collects player-owned ships in the same sector within the target's `currentradarrange` (excluding build storage and drones), plus the target itself. For each that has `primarypurpose == purpose.fight`: S adds 1 S hunter, M adds 1 M, L adds 1 L, and XL adds **3 L** (195). So **hunters mirror the player's combat ships near the target. A lone trader, or any non-fight target, gets 0 hunters** (inferred consequence: the log says "hunter spawn produced no ships", `HUNT` 368).
- **Difficulty cap** (`$HeadHunterHunterSpawnLimit`: 3/5/10/15/0 = unlimited): if the total exceeds the cap, L ships fill the slots first, then M, then S (204-223).
- **Equipment tier by bounty** (225-230): tier 1 up to 1 M credits, tier 2 for more than 1 M up to 5 M, tier 3 above 5 M.
- **Creation:** three `md.LIB_Create_Ships.Start` ref-cues (237-281), one each for S, M and L, with:
  - `Ship_Faction` and `Ship_CategoryFaction` = sending faction;
  - `Ship_Category_Size` and `Ship_Class` = the class;
  - **`Ship_CategoryTags = tag.military`**;
  - `PositionObject`, `AllowBoostingIn=true`;
  - `GroupCue` and `EndSignalCue` = `HuntersCreated`.
- **Post-processing** (`HuntersCreated`, 284-372):
  - `set_owner` = sending faction; paint `ware.paintmod_0024`.
  - Capturable only if L/XL, not Xenon/Kha'ak, and the "Head Hunters can be captured" option is on.
  - `set_object_relation_behaviour disable=true`.
  - L/XL ships launch all defence drones and order them to `DockAndWait` on the mother ship.
  - Equipment mods per tier: always `mod_engine_travelthrust_01_mk3` and the custom radar mod. The weapon mod is `mod_weapon_damage_01_mk1` at tier 1, `mod_weapon_damage_04_mk2` at tier 2 and `mod_weapon_damage_02_mk3` at tier 3 (316-348).
  - Each hunter is added to `$HHHunters` and removed from `$HHAllShips`.
  - The group is sorted by `value` descending. The most valuable ship leads; the others get `set_object_commander assignment.attack` (354-359).
  - The leader gets the default order `HeadHunter`, `target=$playertarget`, `destination=target.sector` (361-366).
  - **(inferred, open question)** All three create cues signal the same non-instantiated `HuntersCreated`, which ends with `reset_cue this`. Ships from creations that finish after the first signal may never be post-processed.

### 13. Hunter AI order "HeadHunter" (`AI`)

- **Order** (`AI` 3-21): id `HeadHunter`, `category="internal"`, `infinite`. Params: `target`, `destination` (sector), `timetocamp` (default 20 min; the comment says it is also the group lifetime), and internal `searchingstart` and `lastrepaircheck`. Laser towers can't run it.
- **Interrupt handlers** (22-93): the vanilla `ResupplyHandler`, `TargetInvalidHandler`, `TideHandler`, `AttackHandler` and `MissileLockHandler` (all present in `V8` aiscripts/interrupt.*.xml), plus two custom ones:
  - **Gravidar acquisition** (28-82): on `event_gravidar_has_scanned` of the hunter, it counts player-owned ships in the same sector. For each contact that is in `$HHAllWanted`:
    - The first time only (`pilot.$renamed`): if the contact is in `$PlayerShipsGroup`, the computer says `[2021,513]` ("... on intercept course"). The leader and its subordinates are renamed `<name> Head Hunter`. Each subordinate gets `set_relation_boost faction.player -1`, decaying over 10 min. **Bug (inferred):** inside the subordinate loop, the `Attack` order is created on `this.assignedcontrolled` (the leader) each time, not on the subordinate (54-63). Subordinates follow through `assignment.attack` anyway.
    - Every time: a relation boost of -1 on the leader, then an immediate `Attack` order with `primarytarget=contact`, `pursuetargets`, `pursuedistance=1000km`, `allowothertargets=false`, `squad_attack`, `escort=contact` and `checkrelation=false`. Hunters go hostile to the player only through a temporary relation boost, not a faction relation change.
  - **Gate tracking** (83-93): `event_object_changed_sector object="$target"` updates the order's `destination` with `edit_order_param`. Hunters always know which sector the target moved to.
- **Main loop** (104-217), every 5 s:
  1. Travel to `destination` with `move_to travel=true`, using local highways if not a capital ship.
  2. On arrival, start "camping": collect the sector's normal zones, gates, and stations at neutral or better relation; `move_to` a random one; whenever stopped, pick another (124-167).
  3. After `timetocamp` (20 min) of searching, `MoveDie` the leader and the docked subordinates that aren't boarding (168-187).
  4. Every 300 s, issue `Resupply` (hull 100 %, not urgent) for the leader and its non-drone subordinates (189-213).

### 14. Hunter end states, bribing and capture

- **Target gone** (`TargetClaimed`, `HUNT` 487-524): on destroyed, changed owner or abandoned in `$HHAllPlayerWanted`, if it was `$playertarget`, every hunter gets `reset_relation_boost`, `cease_fire`, and a stop-attack signal to its L-ship defence NPC. Unless it is boarding, it gets `MoveDie` to a random non-player station in the sector. The leader's pilot speaks `[1008,10038,12206]` (laugh, "Well done, everyone!", "Abort").
- **Payoff over comms** (`StartTalk` 407-423, `PayoffBounty` 424-486):
  - When the player opens a conversation with a hunter (`event.object.assignedcontrolled` is in `$HHHunters`) and the current target has a bounty, the NPC says 10101 ("Maybe we can work out a deal"). A choice appears: "Payoff Bounty for <id> <name>: <amount> Cr" (`TXT` 137).
  - On selection, if the player has at least the current bounty: `transfer_money` from the player to the hunter's owner faction. All hunters stand down (the same as when the target is gone) and the target's wanted entry is deleted. The NPC says 10102 ("I knew we'd be able to work something out").
  - Otherwise the NPC says 10103 ("It's your loss").
  - This is the only way for the player to clear their own bounty besides losing or transferring the ship.
- **Captured or abandoned hunters** (`HunterCapturedHandler` 373-384) are removed from `$HHHunters`. Destroyed hunters (`HunterDestroyedHandler` 385-406) are removed from `$HHHunters`, `$HHAllShips` and `$HHPlayerAttackWatched`.
- Toggling "Head Hunters can be captured" updates `set_object_capturable` on live hunters (`OPT` `BoardHuntersToggle` 746-765).

### 15. Custom ware: HeadHunter Radar Mod

- `HH/libraries/wares.xml`: ware `mod_ship_radarrange_01_mk1_headhunter`, "HeadHunter Radar Mod".
  - Tags `crafting equipmentmod noplayerblueprint`, price 1, transport inventory.
  - Production: 10 s from 1 `modpart_shipnanoweave_t1`, method default.
- `HH/libraries/equipmentmods.xml`: `<add sel="//equipmentmods/ship">` with `<radarrange ware=... quality="2" min="1.45" max="1.45"/>`, a fixed 1.45x radar range.
- It is only installed on hunters (`HUNT` 323-346). Because of `noplayerblueprint`, the player can't craft it (inferred). The player could loot it only if they capture a hunter (inferred).
- Unused icon: `order_headhunter` (`HH/libraries/icons.xml` 5) points to `assets\fx\gui\textures\order\order_board.tga`, but vanilla's texture is `assets\textures\ui\order\order_board.tga` (`V8` icons.xml 1344). It is referenced nowhere.

### 16. Options menu (SirNukes Simple Menu API)

- `HHOptsInit` (`OPT` 150-965) has no conditions, so it is active at start. On `md.Simple_Menu_API.Reloaded` it registers the options menu `HeadHunterOptions`: 12 columns, title "Head Hunter" (`TXT` 600), `$onOpen = HHOptsMenu` (155-169).
- The page is built from local libraries (`AddSectionHeader`, `AddCheckboxRow`, `AddSliderRow`, `AddDropdownRow`, `AddButtonRow`, `AddEmptyRow`; 450-676). These call `Simple_Menu_API.Add_Row`, `Make_Text`, `Make_CheckBox`, `Make_Slider` (`$fromCenter`, `$hideMaxValue`, `$onSliderCellConfirm`), `Make_Dropdown` (`$startOption`, `$onDropDownConfirmed`), `Make_Button` and `Refresh_Menu`.
- There are two pages, "main" and "logCategories", switched through `global.$HeadHunterOptionsPage` (175-177, 891-908).
- **Without SirNukes, no options UI exists. Everything runs on defaults** (inferred from the optional dependency; nothing else writes these globals).

### 17. Logging

- `LOG` `SessionHeader` (4-22) writes a session banner on game start or load. `Log` (instantiated, 24-46) takes `table[$category,$text]` or a plain string. If logging is enabled and that category's toggle is on, it calls `debug_to_file directory="HeadHunter" name="HeadHunter.log"` with a `player.systemtime` timestamp.
- Categories: `general`, `bounties`, `wanted`, `hunted`, `station_module_bounty`, `station_module_diagnostics` and `destroy_diagnostics`. `WantedDestructionDiagnostics` (`MD` 488-516) logs, for every tracked destruction, whether it *would* create a bounty.
- `HUNT` debug output is gated by `Init.$HuntedDebug = 0` (12), so it is effectively off. The AI also writes `debug_to_file name='hunted'` with chance `$HunterAIDebug = 0` (`AI` 97-102).

---

## Settings

All are globals, set by `OPT` `LoadStuffAndSetup`, and exposed **only** through the SirNukes options menu (`OPT` `HHOptsMenu`). The Lua UI has no settings of its own: its filter and sort state is session-local in the `config` table and not saved.

| Global | Default | UI control (range) | Effect / used at |
|---|---|---|---|
| `$HeadHunterBountyMultiplier` | 1.0 | slider 0-10 step 0.1 | general bounty multiplier; 0 disables general bounties (`MD` 75-78) |
| `$HeadHunterWantedBountyPercent` | 20 | slider 1-100 % | % of victim value added to the killer's bounty (`MD` 446, 673) |
| `$HeadHunterStationModuleBountyPercent` | 50 | slider 0-100 % | % of module build value (`MD` 582) |
| `$HeadHunterGainReputation` | true | checkbox | rep on general and wanted kills (`MD` 60, 758) |
| `$HeadHunterClassicBaddies` | false | checkbox "Restrict wanted targets"; turning it on shows hint `TXT` 122 | only Xenon, Kha'ak, Scale Plate, Fallen Split and Buccaneer killers become wanted |
| `$HeadHunterNPCNotify` | false (forced false by patch 6) | checkbox | NPC claim notifications (`MD` 749) |
| `$HeadHunterProximityNotify` | true | checkbox | nearby alerts (`MD` 866) |
| `$HeadHunterProximityThreshold` | 0 | slider 0-50,000,000 Cr, step 100,000 | minimum bounty for nearby alerts |
| `$HeadHunterPayoutNotify` | true | checkbox "Voice payout notifications" | `PayoutEffect` (`MD` 818) |
| `$HeadHunterPlayerMapTag` | true | checkbox | label player-owned wanted ships (`MD` 1081) |
| `$HeadHunterHuntersEnabled` | true | checkbox | hunter spawning (`HUNT` 24, 80) |
| `$HeadHunterHunterReputationThreshold` | -15 | slider -20..20, from centre | relation for regular factions to send hunters |
| `$HeadHunterHunterSpawnLimit` | 10 | dropdown 3/5/10/15/unlimited (0) | group size cap ("difficulty") |
| `$HeadHunterHunterSpawnInterval` | 240 s | dropdown 2:00-20:00 in 30 s steps | spawn attempt interval |
| `$HeadHunterHunterSpawnChance` | 50 | slider 0-100 % | chance per interval |
| `$HeadHunterBoardHunters` | true | checkbox | L/XL hunters capturable |
| `$HeadHunterLogsEnabled` | false | checkbox | master log switch |
| `$HeadHunterLog{General,Bounties,Wanted,Hunted,StationModuleBounty,StationModuleDiagnostics,DestroyDiagnostics}` | true | checkboxes on the "Log Categories" page | per-category logging |
| buttons | n/a | "Reset wanted board" (red) / "Reset options" | `ClearWantedBoard` / `ResetOptionsToDefaults` (also re-applies capturable to hunters) |

Hard-coded (not settings): watch expiry 600 s; attack-watcher check every 60 s; proximity throttle 60 s; refresh every 30 min; cleanup every 1 h; hunter lifetime 45 min (timer) and 20 min camping (AI); resupply every 300 s; bounty tiers at 1 M and 5 M; general reward 0.5-1.0x HP; wanted variance up to 10 %; rep formulas; board cap 50 rows; Lua refresh every 3 s.

---

## Per-feature dependency table

Legend: **9.00** = only in vanilla 9.00 (absent in `V8`); **UIX** = needs kuertee UI Extensions hooks; **SN** = needs SirNukes; **VF/VW** = vanilla faction or ware assumption. "8.00" = present in vanilla 8.00. "SWI" = present or working in SWI 0.90 (its menus in `SWI/subst02/ui/addons`, its data in `SWI/ext/libraries`).

**MD/AI engine support:** I parsed every element and attribute used in `MD`, `OPT`, `HUNT` and `LOG` (88 element types) and in `AI` (41) against `V8` `libraries/md.xsd`+`common.xsd` and `aiscripts.xsd`+`common.xsd`. There are **no missing elements or attributes in 8.00** (checked with a throwaway script, not kept in the repo). The only element names 9.00 adds to md.xsd (`event_cue_enabled`, `loadingscreen*`, `onlinemissiongamestart`, `register_online_reward_trigger`, `remove`, `scaneffect`, `trigger`) are not used.

**Script properties:** every property used exists in `V8` `scriptproperties.xml`, including `isinliveview`, `currentradarrange`, `boardingoperations`, `defencenpc`, `hasarmeddefencedrones`, `availableunits`, `isunit`, `isdeployable`, `islasertower`, `value`, `seed`, `modules.<state>.list`, `resources`, `averageprice`, `spawntime`, `headquarters`, `representative`, `systemtime`, `primarypurpose`, `iscapitalship` and `dockslot`. None of the properties that are new in 9.00 is used.

**Library cues, orders and scripts:** these all exist in 8.00 with the parameters HH passes:
- `md.LIB_Create_Ships.Start`: the parameter lists in 8.00 and 9.00 are identical;
- `md.LIB_Generic.CalculateReputation` (`V8` lib_generic.xml 251);
- the orders `MoveDie` (`atstation`/`byhighway`/`byhostile`), `Attack` (`order.fight.attack.object.xml`: all params), `Resupply` (`order.restock.xml`) and `DockAndWait`;
- the `player.interaction` script (`Line`/`MaxQueueDelay`/`interactive`);
- `global.$PlayerShipsGroup` (`V8` setup.xml 46).

**Lua FFI:** `GetPlayerID`, `IsKnownToPlayer`, `SetFocusMapComponent`, `SetSelectedMapComponent`, `GetPlayerControlledShipID`, `SetGuidance(UniverseID, UIPosRot)` and the `UIPosRot` struct are all declared in `V8` (menu_map.lua and others) and in SWI's `menu_map.xpl`. The engine globals `GetNPCBlackboard`, `AddUITriggeredEvent`, `SetScript`, `getElapsedTime`, `ConvertMoneyString`, `IsKnownItem` and `ConvertStringToLuaID` are present in V8 UI code.

| Feature | Dependency | Kind | In vanilla 8.00? | In SWI 0.90? | Notes |
|---|---|---|---|---|---|
| all | `content.xml` `<dependency version="900"/>` and UIX 900 | 9.00/UIX | n/a | n/a | the manifest must be lowered to load on 8.00 |
| 1 Setup | `event_universe_generated`, `show_help`, `patch` | engine | yes | yes | |
| 2 General bounty | `event_player_owned_attacked_object`, `add_faction_relation`, `write_to_logbook money/bonus`, `transfer_money` from `faction.civilian` | engine/VF | yes | yes (`civilian` exists in SWI: 38 ship entries) | the rep value is probably null (inferred bug) |
| 3 Wanted from kills | `event_object_destroyed group`, `.value`, `.seed`, `event_job_ship_activated` | engine | yes | yes | |
| 3 Classic Baddies | `faction.scaleplate/fallensplit/buccaneers` | **VF** | yes | **inactive in SWI** (`SWI` factions.xml sets `@active=0` for scaleplate, buccaneers, fallensplit and others) | in SWI only Xenon ("Menace Inconnue") and Kha'ak ("Yuuzhan Vong") would qualify; SWI's pirates (`huttpirates`, `mandoraiders`, `blacksun`, `valarian`) would be excluded |
| 3/4/5 exclusions | `faction.xenon/khaak/ownerless` | VF | yes | yes; SWI replaces them in place, as Menace Inconnue and Yuuzhan Vong (`SWI` factions.xml 1675, 1725; t 532110/533110) | they still can't issue bounties, which is fine |
| 4 Module bounty | `modules.operational.list`, `macro.ware.resources.table`, `averageprice` | engine | yes | yes (inferred: depends on SWI module wares having resources) | |
| 5 Claim | `show_notification` with coloured rows, `speak`, `start_script player.interaction` | engine | yes (`V8` notifications.xml 53 uses the row-colour form) | yes; whether SWI keeps the vanilla voice lines 279/2013/2111/5023 is unchecked | |
| 8 Board tab | UIX callbacks `createRightBar_on_start`, `createInfoFrame2_on_menu_infoModeRight`, `refreshInfoFrame2_on_start`, `ic_onSelectElement`, `ic_onRowChanged`; `menu.registerCallback`/`updateCallback`/`uix_callbacks` | **UIX** | **no** (vanilla 8.00 and 9.00 menu_map.lua have no `uix_callbacks`) | **yes**: SWI menu_map.xpl 7193, 19946, 20139, 27274, 27489; `registerCallback` 31575, `updateCallback` 31645 | |
| 8 Board tab | `ui.xml` `<dependency name="kuertee_ui_extensions"/>` | **UIX** | no | **no such addon in SWI** (SWI's `starwarsmod_m1/ui.xml` depends only on the ego_* addons) | the addon probably won't load without it (inferred); a port must drop this dependency |
| 8 Board tab | `Register_OnLoad_Init` | UIX | no | not found in SWI's menus | guarded by `type(...)=="function"`; falls back to a direct `init()` |
| 8 Board tab | `Helper.color.white/grey/red/semitransparent`, `Helper.defaultTitleBackgroundColor` | UIX ("colour backward compatibility") | **no** (not in V8 or V9 helper.lua) | **yes** (`SWI` helper.xpl 629-633, 670+) | `config.styleProperties.color = Helper.color.white` runs when the file loads, so the whole file fails if `Helper.color` is missing (inferred) |
| 8 Board tab | `frame:addFrameBorder`, `frameborder=` table property, `Helper.getFrameBorderColor`, `Helper.getFrameBorderLineWidth`, `mapMenu.panelState`, `mapMenu.panelPins` | **9.00** | **no** | **no** | `infoFrame2:addFrameBorder(...)` (LUA 325, 596, 443) is unguarded, so it errors on 8.00 (inferred). The panelState and panelPins uses are nil-guarded (LUA 517-524) |
| 8 Board tab | `Helper.sortButtonHeight` | **9.00** | **no** (defined only in V9 helper.lua 562) | **no** | `Helper.scaleY(nil)` in `createSortHeader` (LUA 683) would error or misbehave (inferred) |
| 8 Faction filter | `mapMenu.updateInputBar()` | **9.00** | **no** | **no** | called unguarded at LUA 430; also guarded at 834 |
| 8 Board tab | `Color["frame_background_black"]`, `"row_background"`, `"row_background_container"`, `"button_background_hidden"`, `Helper.headerRowCenteredProperties`, `Helper.standardContainerOffset`, `setColWidthPercent`, `getColSpanWidth`, `createFrameHandle`, `closeOnUnhandledClick`, `removeAllWidgetScripts`, `mapMenu.contextFrame`/`contextMenuMode`/`closeContextMenu`/`refreshInfoFrame2`/`infoTableRight2`/`createInfoFrame2Running`/`noupdate`/`topRows`/`selectedRows`/`holomap`/`searchTableMode` | vanilla UI | yes | yes | |
| 8 Board tab | icons `mapst_mission_guidance`, `table_arrow_inv_up/down`; right-bar entry "legend" | vanilla | yes (`V8` icons.xml 630, 1151; menu_map.lua 1118) | yes (`mode = "legend"` in SWI menu_map.xpl) | |
| 8 Guidance and focus | `C.SetGuidance`, `C.SetFocusMapComponent`, `C.SetSelectedMapComponent`, `C.IsKnownToPlayer` | FFI | yes | yes | |
| 8/9 Live refresh | `event_ui_triggered` + `AddUITriggeredEvent`, the right-bar toggle emitting the mode name | engine/vanilla | yes (`V8` menu_map.lua 2537) | yes (SWI 2601) | |
| 9 Map labels | `add_holomap_text`, `remove_holomap_text`, `isinliveview` | engine | yes | yes | |
| 10 Proximity | `event_gravidar_has_scanned`, `count_gravidar_contacts`, `play_sound`, `global.$PlayerShipsGroup` | engine/vanilla | yes | yes (SWI's setup.xml is a diff and keeps it) | |
| 11 Hunter factions | `faction.scaleplate, buccaneers, fallensplit` (always), `argon, antigone, teladi, paranid, holyorder, boron, loanshark, split, terran, pioneers` | **VF** | yes | **all inactive in SWI**; the SWI ship library has 0 ship entries for all of them except argon/antigone, which have 1 each, and those are `<select>` pilot lines, not ship categories | in practice no ships spawn in SWI (inferred). The fallback position (the target's sector) still works |
| 11 DLC gating | `md.Setup_DLC_Boron/Pirate/Split/Terran` | vanilla DLC | yes (`V8` ego_dlc_*/md/setup_dlc_*.xml) | depends on the installed DLCs | |
| 12 Ship creation | `LIB_Create_Ships` with `Ship_CategoryTags = tag.military` | VF/data | yes | **partly**: SWI factions with `military`-tagged S/M/L categories include `blacksun` (S 4, M 1, L 1), `huttcartel`, `mandodw`, `valarian`, `galempire` and `newrepublic`. **`indibhg` has no `military` categories; it uses named tags like `bhg_firespray`, `bhg_random_small` and `bhg_random_med`**, so mods.md's `indibhg` suggestion needs different tags. `bountyhunters` has 0 | |
| 12 Equipment | wares `mod_engine_travelthrust_01_mk3`, `mod_weapon_damage_01_mk1`, `_04_mk2`, `_02_mk3`, `paintmod_0024` | **VW** | yes (`V8` wares.xml) | engine and weapon mods: yes (still in SWI's replaced `equipmentmods.xml`); `paintmod_0024`: not removed by SWI (inferred present) | |
| 12/15 Radar mod | `<add sel="//equipmentmods/ship">` | data | yes | **order-dependent**: SWI does `<replace sel="/equipmentmods">` (`SWI` equipmentmods.xml 8), but its replacement does contain `<ship>` (400-480). If HH's diff is applied before SWI's replace, it is wiped (inferred) | `modpart_shipnanoweave_t1` is vanilla and not removed by SWI |
| 13 AI order | `move_to`, `find_zone`/`find_gate`/`find_station`, `edit_order_param`, `set_relation_boost`, `create_order` Attack/MoveDie/Resupply, vanilla interrupt handlers | engine/vanilla | yes | yes | |
| 14 Bribe | `event_conversation_started/returned_to_section/next_section`, `add_player_choice`, voice lines 10101-10103 | engine | yes | yes (voice lines unchecked) | |
| 16 Options | `md.Simple_Menu_API.*` | **SN** | no | no (not bundled) | optional; without it, everything runs on defaults |
| 17 Logging | `debug_to_file`, `player.systemtime` | engine | yes | yes | |

**Summary for a port.** All of the MD/AI gameplay is 8.00-compatible engine-wise. What breaks:
- the version numbers in `content.xml`;
- the `kuertee_ui_extensions` addon dependency in `ui.xml`;
- in the Lua, the four 9.00-only UI APIs: `addFrameBorder` (and the frame-border helpers), `Helper.sortButtonHeight`, `mapMenu.updateInputBar` and `panelState` (that one is guarded);
- vanilla faction ids in the hunter roster and in Classic Baddies;
- (possibly) the radar mod diff's load order against SWI's equipment-mod replace.

---

## Behaviour quirks worth deciding on in a rebuild

1. General bounties pay whoever's kill it was, as long as the player attacked first, within 10 min (`MD` `DeathWatcher` has no killer check).
2. The player's ships become wanted for killing almost anything non-Xenon/Kha'ak, including hostile pirates. Hunters then come from a fixed roster unrelated to the victim faction (`HUNT` 102-141).
3. Destroying player-owned station modules can make the killer wanted "by" the player faction. The player's own ships can even become wanted by the player (`$HHAllStations` includes player stations).
4. Hunter group size scales with the player's fight-purpose ships near the target. Unarmed targets draw no hunters (`HUNT` 181-198).
5. Abandoned S/M wanted ships play the payout voice but pay nothing (`SCapturedHandler`).
6. The orphan and lifetime check destroys the whole hunter group at once (`destroy_group`).
7. The general-bounty reputation value probably resolves to null (feature 2).
8. The subordinate `Attack` loop targets the leader (`AI` 54-63).
9. `HuntersCreated` may race between the three ship-creation cues (feature 12).

## Open questions

1. Does `event_universe_generated` fire when HH is added to an existing save on 8.00? `LoadStuffAndSetup`, `PapaCue` and `HUNT` `Init` depend on it.
2. Does `HuntersCreated` (non-instantiated, `reset_cue this`) process the ships from all three `LIB_Create_Ships` calls, or only from the first to finish? Test in-game.
3. Is `HHAttackTagger.$reputationcalc` really null in `DeathWatcher`? It is an instance variable read through the static cue reference. Check with logging enabled ("relation gain" log line, `MD` 66).
4. Is extension load order between HH and SWI deterministic, so that HH's `equipmentmods` add survives SWI's `replace`?
5. Does an addon whose `ui.xml` dependency (`kuertee_ui_extensions`) is missing fail to load, or just load without ordering? If it loads, is UIX's `Register_OnLoad_Init` needed for reload safety?
6. Does a separate kuertee UIX 8.0.4.3 install provide `kuertee_ui_extensions` and coexist with SWI's built-in hooked menus (also open in mods.md)?
7. Is there an 8.00-compatible SirNukes Mod Support APIs build with `Simple_Menu_API` that works with SWI's replaced game-options menu (`SWI` subst02 ego_gameoptions)?
8. Does SWI keep the vanilla voice lines that HH speaks (pages 10002 and 10101: 279, 511, 513, 2013, 2111, 5023, 10101-10103, 1008, 10038, 12206)?
9. Does `debug_to_file` on 8.00 need a launch flag to write `logs/HeadHunter/HeadHunter.log`?
10. Which SWI factions should make up the hunter roster? `blacksun`, `huttcartel`, `mandodw` and `valarian` have `military` S/M/L categories. `indibhg` would need its own category tags (`bhg_random_small`, `bhg_random_med` and others). And should Classic Baddies map to `huttpirates`, `mandoraiders` and `blacksun`?
