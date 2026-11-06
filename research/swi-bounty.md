[Back to the bounty research](../bounty-research.md). Detailed reference for its "SWI's bounty hunting today" section.

# SWI 0.90 bounty hunting: how it works (source research)

Scope: everything in Star Wars Interworlds 0.90 (X4 8.00) that touches bounty hunting. Read directly from the unpacked mod at `E:\x4-dev\reference\mods\swi-0.90` (`/mnt/e/x4-dev/reference/mods/swi-0.90`); paths below are relative to it, and `ext/` = the ext_01 catalog. Vanilla 8.00 files were unpacked from the install at `E:\SteamLibrary\steamapps\common\X4 Foundations - 8.00` and are cited game-relative, like `md/notifications.xml`.

Conventions: **[read]** = read directly in code. **[inferred]** = my reading of how the pieces combine, or depends on engine/vanilla behaviour I did not verify. Line numbers are for SWI 0.90 files.

**SWI 0.91 HF1:** the hunt, the pay cap and the sanctions are unchanged; the few changes below are marked "0.91". Details and line offsets: [swi-0.91-diff.md](swi-0.91-diff.md).

Text refs: SWI ships no `0001-L044.xml`; English text is in `ext/t/0001.xml` (page 11513 = Emergent Missions, page 161815 = Reputations and Professions, page 999840 = SWI).

---

## 1. Overview

SWI's bounty hunting is made of five loosely-connected parts:

1. **Bounty pilot tracker** (kuertee Emergent Missions, `Bounties` cue). NPC ships that kill other ships while running the vanilla `Attack` order get a "pilot record": kills by victim faction and class, and per-faction "last known location" sightings. In SWI only **25 % of attacks** are tracked, and kills of nine factions (pirates, Sith, Hapes, Xenon, Kha'ak, independent hunters) never count.
2. **Search And Destroy ("Hunt") missions** (Emergent Missions, `Missions_Hunts`). In SWI these are offered **only by talking to the trade NPC at a Bounty Hunters' Guild-owned station**. You pick a faction and a size class, offers are spawned at the stations that reported the sightings, and the map opens on the offer list. You find the target (beacons at the last three reported positions), scan it if it is disguised, destroy it, then return to a contact NPC for the payout. Pay is 50 % of vanilla mission money for the target's own kill record, plus a share for the target, scaled by the damage you did. Limit: 3 accepted per rolling hour.
3. **Reputations and Professions** (kuertee RAP). Its BountyHunter profession, guild, membership, access keys and reward bonuses are mostly **switched off or silent in SWI**: no notifications, no guild rooms, no guild bonus, no visible profession rows. What still works in SWI: the profession points pile up invisibly; the **sanction (immunity) purchase** for active Hunt targets, from the Bounty Hunters' representative or a Bounty Hunters station trade NPC; and the "assessment" dialogue at any faction rep or trade NPC.
4. **SWI's own NPC bounty hunters**: 19 named hunter jobs (Boba Fett, Cad Bane, Bossk, IG-88 and others, faction `indibhg`), switched on 20–30 min into a main-galaxy game. They run the SWI order `SWBountyHunterFighters`, which picks a **random pilot from the same bounty tracker** (S/M only) and attacks it with no relation check.
5. **Gamestart flavour**: the Bankrupt Bounty Hunter start spawns **two Hutt pirate R-41 fighters** with an Attack order on the player, 10 s after the start. That is the whole "bounty on your head". Nothing in the code keeps a persistent bounty or wanted level on the player character.

Social Standings and Citizenships adds a per-faction "Ranger" (internally `bountyHunter`) social standing, earned for killing enemies of the sector owner and for BountyHunter profession actions. Kill Counts and Missions is a UI-only panel over RAP data.

The bounty-specific code is essentially unchanged from 0.86. A diff of `kuertee_emergent_missions.xml` shows only minor hunt changes: description-update guards, the beacon/find-step condition, and a per-macro damage cap in the reward text. `kuertee_em_interrupts.xml` and `order.sw.bountyhunter.fighters.xml` are byte-identical. [read]

---

## 2. Mode switch: "SWI mode" vs kuertee "full mod"

Every kuertee script checks `$IsSWIExists = @ware.tie_fighter != null`. If true, it forces `UserSettings.$isUseFullMod = false` on every game start and load. [read]
- RAP: `ext/md/kuertee_professions.xml` cue `kProfs` lines 211–214, patch 28 (610–613).
- EM: `kuertee_emergent_missions.xml` cue `kEMissions` 228–231, patch 6.
- SSAC: `kuertee_ssac.xml` 146–149, 512–515.

So in SWI, "SWI mode" is always on. The rest of this document describes SWI mode. Where full-mod behaviour differs, I note it as dead in SWI.

Effects of SWI mode (RAP `ModFeatures_Init`, `kuertee_professions.xml` 39–58): [read]
- `ModFeatures.$professions` = all 9 professions, including BountyHunter.
- `ModFeatures.$reputations` = Defender, Mercenary, Vigilante, Pirate.
- `ModFeatures.$guilds = []`, so **no guild features** (no guild rooms or NPCs, no guild reward bonuses, no trade discounts or penalties).
- `ModFeatures.$silentReputationsAndProfessions` = all professions and reputations, so **no "you achieved…" notifications or logbook entries**, and the UI hides their rows (section 9).

---

## 3. Bounty pilot tracker (who can become a target)

Source: `kuertee_emergent_missions.xml` cue `Bounties` (11054+), plus `ext/aiscripts/kuertee_em_interrupts.xml`, `ext/aiscripts/order.fight.attack.object.xml` and `ext/aiscripts/orders.base.xml`.

### 3.1 Where kills come from [read]
- `order.fight.attack.object.xml` (a diff on the vanilla Attack order) includes the interrupt library `kEM_AttackStart` after label `fight`, and `kEM_AttackFinish` after `acquirenewtarget`, after `finish`, and in `on_abort`.
- `kEM_AttackStart` (`kuertee_em_interrupts.xml`): attacker = `this.assignedcontrolled` (or its defensible), victim = `$target`. Both must be ship or station, not a unit or laser tower. **In SWI: `$kEM_random` 1–100, valid only if ≤ 25** ("in SWI, only 25% of attacks are bounty targets"). On a valid attack it signals `player.galaxy` `K_ObjectAttacks_AttackerInit`.
- `kEM_AttackFinish`: if the attack was valid and the victim is no longer operational, it signals `K_ObjectAttacks_AttackerKilledObject` with victim class and victim true-owner faction.
- `orders.base.xml` handler `kEM_ObjectChangeSector` signals `kEM_ObjectChangeSector` with the new and old sector of any ship running an order.

[inferred] Only kills made inside the vanilla `order.fight.attack.object` script count. Kills made by other combat scripts that do not route through this order, and anything the **player flies personally**, never register. The player character therefore **cannot become a tracked bounty**. Player-owned AI-piloted ships running Attack orders can (see 3.4). Which vanilla behaviours (patrol, police, escort, protect) route through `order.fight.attack.object` is a vanilla question.

### 3.2 Registering a pilot [read]
`Bounties_TargetDestroyed` (11483):
- Attacker must be a ship with an entity pilot, not a laser tower or unit.
- `victimFaction` must **not** be in `ModFeatures.$factions_noBountyMissions`.
- If the attacker is XS/S/M with an operational commander, credit goes to the top-level commander ship (or the commander chain) as a **subordinate kill (0.25 per kill instead of 1)**.
- Then `Bounties_RegisterPilot` (adds the pilot entity to group `Bounties.$pilots`), `Bounties_RegisterKill` (`$pilot.$kEM_kills.{victimFaction}.{class}` += 1 or 0.25), and `Bounties_UpdateLastKnown(pilot, victimFaction)`.

`ModFeatures.$factions_noBountyMissions` in SWI (61): `indibhg, sith, xenon, khaak, huttpirates, mandoraiders, valarian, blacksun, hapes`. In full mod it is `[]`. [read]

Consequence [inferred]: killing pirates, Sith, Hapes or Xenon never makes anyone a bounty. Typical targets are pirate, raider or Sith ships that killed lawful factions' ships, and **military ships of warring factions** (an Imperial fighter that kills Rebel ships becomes a target for the Rebels). The killer's own faction is never filtered, so pirates can be targets.

### 3.3 Sightings ("last known location") [read]
`Bounties_UpdateLastKnown(Pilot, Faction)` (11316):
- Records, per witnessing faction, a list of up to 10 sightings: `{sector, position, station, time, distFromOld, time_elapsed, isFromSatellite, otherPosInArea[≤3]}`.
- `station` = the nearest station owned by that faction, galaxy-wide. If there is none, the nearest station whose owner is ≥ neutral to the pilot's ship owner.
- A new record is added only if the move from the last one is > 50 km. Moves of 10–50 km update the head record and push the old position into `otherPosInArea`.

Sightings are added:
- when the tracked pilot kills (faction = victim faction);
- on any new tracked attack involving a tracked pilot (`Bounties_NewAttack` 11447). This updates the attacker's record with the victim's faction and the victim's record with the attacker's faction. It also needs the victim's true owner not in the excluded list;
- on sector change (`Bounties_ChangeSector` 11529). For each faction the pilot has kills against, look for that faction's **satellites or stations** within 100 km in the new sector that have the ship within their `maxradarrange`, or near the exit gate in the old sector (safe position within 40 km of the gate). Each witnessing faction gets an `IsFromSatellite=true` sighting.

### 3.4 Expiry [read]
`Bounties_CleanInterval2` (checkinterval 30 min) → `Bounties_CleanIntervalNow` (11673):
- Limit is **1 h for player-owned pilots, 4 h for others**.
- A pilot is deregistered if nothing updated it within the limit. A faction's sightings are removed when their head record is older than the limit.

[inferred] Player-owned AI pilots (wingmen, fleet ships) that kill non-excluded factions while on Attack orders are registered too. The convo and offer code filters them out (`not $pilot.isplayerowned`), but SWI's NPC hunters do not (section 6). So **your fleet can be hunted** for about an hour after such kills.

---

## 4. Search And Destroy ("Hunt") missions

Source: `kuertee_emergent_missions.xml` `Missions_Hunts` (5092–7020), reward libs (7050–7380), `Bounties_ArriveStation` and children (11737–12140), and `DamageCalculator` (9188+). Lua: `starwarsmod_m1/ui/kuertee_emergent_missions.lua`.

### 4.1 How offers are generated in SWI (conversation only) [read]
1. Arriving or teleporting at any station sets `$isMissionsFromConvo = true` in SWI (`Bounties_ArriveStation`, 11737). The `K_ArriveAndLeaveStations` signal is kuertee's own station tracker (EM 12142+).
2. `Bounties_ArriveStation_RunOnce` → `Bounties_PrepareMissionsForConvo` (11972). For every tracked pilot that is operational and not player-owned, and for each faction with a sighting of it:
   - the faction is in `kEMissions.$validFactions` (tag `economic` or `plunder`);
   - the faction is not in the excluded list;
   - the faction's relation to the player is ≥ its `relation.neutral.min`;
   - the pilot has no mission from this faction yet;
   - the head sighting's `$station` is operational;
   - the pilot has kills recorded against that faction.

   Pilots are bucketed by class: S/M → "small" (`class.ship_s` key), L/XL → "large" (`class.ship_l` key).
   **Note:** this path does **not** apply the 3 h freshness or station-proximity rules of the full-mod path (`Bounties_OpenMissionOffersUI`, 11822, which needs a sighting < 3 h old at this station, or a defence station/pirate base in the same sector, or any HQ). In SWI the list is galaxy-wide, limited only by the 1 h/4 h cleanup.
3. `Bounties_Convo` (12034) fires on `event_conversation_started` when:
   - `event.object == $station.tradenpc` (the arrived station's trade NPC). The other branch, `event.object.owner == faction.bountyhunters.representative`, compares a faction with an NPC and can never be true (see Bugs);
   - **and** `player.station.owner == faction.bountyhunters` (or the debug flag);
   - **and** SWI mode.

   It adds one player choice per faction: `{11513,602}` "%faction: %n missions." Through SWI's bundled `ExtendedConversationMenu` (`ext/md/extendedconversationmenu.xml`) these go in a "... more. (Mods)" sub-menu when more than one mod option exists.
4. `Bounties_Convo_Next` (12091): choosing a faction shows "Small and medium-sized targets: N missions." (603) and/or "Large and extra-large-sized targets: N missions." (604). Choosing a class first signals `Bounties_Convo_Next_remove_mission_offers`, which removes untaken hunt offers from earlier convo picks (`Mission_Hunt_CleanUp`). It then calls `Missions_Hunts_CreateOffer` for every pilot in that bucket, at that pilot's head-sighting station, and opens `MapMenu` in `infomode` `missionoffer`.
5. `Missions_Hunts_CreateOffer` (5213) re-checks that the station is operational, the owner is a valid faction ≥ neutral, the pilot is operational, has no mission from that faction, and is not player-owned. Then `Mission_Hunt` (5251) creates the offer:
   - `create_offer type=missiontype.fight`, actor = sighting station's `tradenpc`, faction = station owner;
   - difficulty `medium`, or `hard` for L/XL targets;
   - group `missiongroup.bountyHunters_guild` ("Bounty Hunters Guild", `libraries/missiongroups.xml` 31);
   - text: "Search and destroy: <ship> (<id>)" (501); description lines 502/511/531/532/521(/512); reward text "Reward: %base + up to %bonus" (503).
   - `$IsDisguised` = target has a cover owner different from its true owner.
   - The displayed ID code is faked for disguised targets: a random ship's idcode from `find_ship` (`GetName` 7022, `Mission_Hunt_GetIdCode` 6983).

Where Bounty Hunters stations are (`libraries/god.xml` 2969–3035) [read]:
- five respawnable wharfs `wharf_bountyhunters_01..05`, owned by `bountyhunters`:
  - 01 in the zone `swi_zone001_clustermillagro_sector001_macro` (Milagro);
  - 02 in Corporate space, 03 in Anoat space, 05 in Galactic Empire space;
  - 04 in sector `swi_clusterbyss_sector001`.
- Faction logic (`md/factionlogic.xml` `BountyHuntersFactionLogic`, 306) prefers its HQ in Milagro (types shipbuilding, defence, trade, any), DesiredWharfs = 1 (`factionlogic_stations.xml` 32). `libraries/stations.xml` allows bountyhunters trade stations (241) and defence stations (253). [inferred] Further stations may be built over time.

### 4.2 Acceptance limits (map UI) [read]
- `Missions_Hunts.$missionsPerHour_max = 3` (5098).
- Accepted-mission times go in `$missionTimes`; entries older than 1 h are pruned whenever the map opens (`Missions_Hunts_MapMenu_MissionOffers`, 5161).
- The silver or gold access-key bonus (+3 / +4) is read here. It cannot be obtained in SWI (section 5.3), so **the SWI cap is 3 per rolling hour**.
- Lua `getIsMissionAcceptable`: an offer cannot be accepted if the cap is reached, or if you already have an active mission on that target (text 543/544/545).
- Lua `addUpdateHuntDataBtn`: on an offer whose target you are already hunting, with a newer sighting, a button "Download the reports from this mission" (546) copies that faction's newer sighting into your active mission (`Mission_Hunt_UpdateLastKnownsFromOtherMission`). This also counts as a BountyHunter "location investigated" action.

### 4.3 Mission flow [read]
1. Accept (map or briefing sends `accept` to `$Client`) → `Mission_Hunt_MissionContact_Generate` → `MissionNPC` (9742). This creates a **mission contact NPC** at the offering station. In SWI it always uses dock size L, falling back to the nearest defence station of the faction or any neutral station. Up to 3 tries.
2. Contact created → `Mission_Hunt_CreateMission` (`create_mission`, steps: talk-to contact, find (sector + offset), scan, destroy, talk-to contact). It registers with RAP (`RegisterMissionRML` and `RegisterMissionTargets`).
   **In SWI the briefing step is skipped**: it goes straight to `Mission_Hunt_ObjectiveFind` (6356–6366).
3. **Find** (`StartHunting`):
   - timer `$timer_find_end = player.age + 3h`;
   - up to 3 nav beacons (`env_deco_nav_beacon_t1_macro`, owner player) at the last 3 known positions, merged from the player's and the offering faction's sightings plus any update, newest first, at least 10 km apart (`Mission_Hunt_GetLast3KnownData` 6817). Each is named "(Report of <id>, <time> ago)" (533) and renamed every minute.
   - New sightings by the offering faction (`kEM_Bounties_UpdateLastKnown`) update the mission: notification 542 "Update: New position in <sector> <time> ago."
4. **Target found** (`Mission_Hunt_TargetFound_20220119`, 6081). Triggers are a long-range-scan ping on the target; the target's attention changing into in-zone or nearer; or any player ship's gravidar finding it as an enemy.
   - Sets find success.
   - Resets the 3 h timer **from now**.
   - Disguised → Identify step (scan; on `event_scan_finished` the cover owner is removed and `OpposingFaction` set). Otherwise → Destroy.
5. **Destroy**:
   - Any player-owned attacker damaging the target sets `$isTargetAttackedByPlayer`.
   - On target destroyed or abandoned (`Mission_Hunt_TargetManager_Destroyed`, 6270):
     - player never attacked it → mission completes as **fail** ("still operational" or "failed to damage");
     - player attacked it → `destroy_success`, then Debrief.
6. **Debrief**: talk to the contact NPC (mission choice in conversation) → `ObjectiveComplete` → `Mission_Hunt_Resolve` (5630). [inferred] The player must reach or contact that NPC at the offering station to get paid. Whether a remote comm works for the debrief is an in-game question.
7. **Timeout**: `Mission_Hunt_Timeout` at `$timer_find_end` resolves the mission. Without find, identify and destroy successes this is a **fail** with 0 Cr.
8. **Abort**: cleanup, no reward.
9. Cleanup: when the mission is complete or has no mission, it is removed when you leave the station, or on a new convo class pick in SWI.

### 4.4 Reward formula [read unless marked]
At resolve on success (`Mission_Hunt_Resolve`):
- `DamageCalculator` tracks the target's hull damage by player-owned attackers, as hull %.
  - Initial damage when first registered: `100 - hull%`, if the attacker is player-owned.
  - "Player kill" if the killer is player-owned, or player damage ≥ 75 %.
- `Reward_CalculateForKills` (7079), per enemy (only the target here):
  - `damage = min(100, player damage%)`;
  - `reward = damage/100 × classReward(target class)`;
  - × **1.25** if a player kill and the class is S/M/L/XL/station. **SWI excludes XS from the kill bonus.**
- If the resulting player reward is 0 → **fail**.
- `Mission_Hunt_GetBaseRewardData` (6643):
  - `reward_forTargetKills = 0.5 × Σ_class ( classReward(class) × target's kills of that class against the offering faction )`;
  - `reward_forTarget = classReward(target class)`, shown as "up to".
  - `classReward` is a fresh random roll on every call. `Mission_Hunt_GetBaseRewardData` runs at the offer (5315) and again on entering Destroy (5897), and `Reward_CalculateForKills` rolls the target class a third time at resolve (7130). So "up to" is an estimate, not a ceiling: the kills part is fixed at the Destroy-step roll, and the target part paid is the resolve roll × damage × 1.25. The map list's reward text is never updated after `create_mission` (only the description is, 5716/5772). Seen 2026-11-01 on an S target: offer 107,665 + up to 70,260, Destroy step 124,785 + 72,210, paid target part 76,820 × 1.25 = 96,025 ([hunt-pay-ael-112.md](hunt-pay-ael-112.md)).
- **SWI-only cap** `CapRewardBasedOnMissionTarget` (7340): for L targets cap = `target.size × 5`, for XL `target.size × 2`. If the total exceeds the cap, both parts are scaled proportionally down to the cap. (See Bugs: this looks like a unit error that collapses L/XL pay.)
- `RewardCr = reward_forTargetKills + playerReward` → `reward_player`.
- Notoriety: vanilla `LIB_Reward_Balancing.Reward_Notoriety(difficulty, 1, offering faction)` → `add_faction_relation` with the offering faction.
- `stat.missions_completed` += 1. `Mission_Complete` also signals the RAP BountyHunter "mission_success" event, plus `DefendMission_Complete` and `GMMissionEnd` (repu Defender).

`classReward(class)` = `GetRewardDataForClassKill` → `GetRewardForLevel` (7271–7338):

| Class | Vanilla difficulty | Level | Vanilla `GetValue_Credits` factor (difficulty × (1 + 0.1·(level−1))) | ≈ base before relation boost and random |
|---|---|---|---|---|
| station | hard (40) | 10 | 40 × 1.9 = 76 | ~1.9 M |
| XL | hard (40) | 5 | 40 × 1.4 = 56 | ~1.4 M |
| L | hard (40) | 1 | 40 | ~1.0 M |
| M | medium (8) | 1 | 8 | ~200 k |
| S | easy (1.4) | 10 | 1.4 × 1.9 = 2.66 | ~66.5 k |
| XS / other | easy (1.4) | 1 | 1.4 | ~35 k |

Then (vanilla `Reward_Money`, `base/md/lib_reward_balancing.xml` 285–350):
- × 24 000–26 000;
- × relation boost (hard: 1→3 between relation 0.1 and 1.0; medium: 1→2 between 0.01 and 0.1; easy: 1→2 between 0 and 0.1);
- × random 1–1.3 (decreasing profile);
- rounded to 10.

Then `Apply_RewardMultiplier` (1.0; SWI's `lib_reward_balancing.xml` diff adds +1 for easy-or-lower difficulty and a template bonus when `$MissionGroup` is a kRAP guild group). EM's `UserSettings.$rewardMult = 50.0` (EM 170) does **not** apply to the paid amount: the line that would multiply by it is commented out (EM 7334-7336), and it is only used in the reward breakdown text (EM 7189): the briefing's per-ship "Operation results" line shows half the real amount (AEL-112: 48,012.50 shown for a 96,025 part; the "destruction" and "Total reward" lines are correct). Corrected 2026-10-31 by the [save check](save-check-knw-904.md), which matches the offer text to the unhalved class values.

The kRAP guild multiplier in SWI's `lib_reward_balancing.xml` diff does **not** apply to Hunt rewards (seen 2026-11-01: AEL-112's S rolls were 70-77 k; with the +1 for easy difficulty the smallest S roll would be 127,680, see [hunt-pay-ael-112.md](hunt-pay-ael-112.md)). `GetRewardForLevel` is a `run_actions` library, so the mission's `$MissionGroup` is not in its scope (`$MissionGroup` is not passed). Relation boost uses the **offering** faction's relation to the player (param 4 = `$Faction`).

Worked example [inferred, ignoring random and boost]: an S-class target that killed 2 M ships of the offering faction, destroyed by you with 100 % damage. Base = 0.5 × 2 × 100 k = 100 k. Target part = 33 k × 1.25 ≈ 42 k. Total ≈ 140 k Cr, before the 1.0–1.3 random factor and the relation boost.

### 4.5 RAP hooks from hunts [read]
BountyHunter profession actions signalled during a hunt (`md.kuertee_professions.BountyHunter_Event`):

| Hunt event | Activity id | Source |
|---|---|---|
| Target found | `activity_target_found` 1201 | 6110 |
| Target scanned (identify) | `activity_target_scanned` 1205 | 6145 |
| Long-range scan in a beacon's sector | `activity_location_investigated` 1200 | 6205 |
| Downloaded a newer report | `activity_location_investigated` 1200 | 6596 |
| First player attack on target | `activity_target_attacked` 1202 | 6257 |
| Mission success | `mission_success` | `Mission_Complete` 7059 |
| Mission failure | `mission_failure` | `Mission_Fail` 7394 |

The `activity_target_destroyed` signal is commented out (6282).

### 4.6 Player-facing surface
- Conversation at a Bounty Hunters station trade NPC: faction → size class → map opens on offers.
- Map mission offers and active-mission context: accept limits, "already have a mission on this target", "Download the reports" button (Lua via the SWI map's uix callbacks in `subst02/ui/addons/ego_detailmonitor/menu_map.xpl` ~26145).
- Mission guidance to beacons; update notifications; logbook (missions category) with a damage and kills breakdown (242–246, 491–496, 571–577).
- An "Assign ship" button for EM missions exists for patrol, raid and rescue missions (Lua `addAssignShipsBtn`), **not for hunts** (only `shipsByAcceptedMission` missions). [read]

---

## 5. Reputations and Professions (kuertee RAP) in SWI

Source: `ext/md/kuertee_professions.xml` (RAP), `ext/md/kuertee_professions_guilds.xml`, and `ext/md/kuertee_profession_requirements_by_faction.xml`.

### 5.1 Data model and numbers [read]
- Professions (ids): Builder 100, Courier 101, **BountyHunter 102**, Miner 103, Repairer 104, Saboteur 105, Shipwright 106, Spy 107, Trader 108. Reputations: Defender 200, Mercenary 201, Pirate 202, Vigilante 203 (`kProfs` 216–231).
- `$disabledProfs = [Builder, Shipwright]` (339–342). BountyHunter was disabled at patch 16 and re-enabled at patch 17.
- Per profession: `$bonus_base 0.25, $bonus_mult 1`, `$points`, `$pointsLevel2`, `$level` (0 Apprentice, 1 Experienced, 2 Specialist: text 507–509), `$isGuildMember`. BountyHunter has `$isReqDefStation = true` (781).
- `$total_oneProf = 20` → `maxTotal = enabledProfsCount × 20 = 7 × 20 = 140` points across professions (`GetBest` 1265+).
- **Points per action** (`AddAction` 1509):
  - base `$mult = 1`, or `enabledProfsCount` (7) if it is already the active profession;
  - + inspiration count (max 25, `UserSettings.$maxInspirationPoints`);
  - +1 for an objective "mission_success", +2 for a full mission success;
  - × `UserSettings.$activityMult` (1).
  - Same profession and same activity type is rate-limited to once per `UserSettings.$actionLimiterMinutes` = **5 min**, except for mission success/failure events and a different activity type.
- **Becoming active (Experienced)**: only once total points ≥ maxTotal (140) **and** the best profession has > 1.5 × the second best (`GetBest`). After that, points are normalised to percentages of 140.
- **Specialist**: while level 1, `pointsLevel2` (raw count of actions) > 20 (`GetBest_SetActiveAndLevels`).
- **Bonus %** (`GetBest_CalcBonuses` 1360): `min + share × (max − min)`, with `max = min(0.25, base×mult)` = 0.25, `min` = 0.10 (level < 2) or 0.20 (level 2). In other words 10–25 % (Experienced) or 20–25 % (Specialist), as text 526 says.

### 5.2 What feeds the BountyHunter profession [read]
- Hunt events (4.5).
- **Any vanilla generic mission** using these RMLs: on cleanup, success if `$feedbackvalue ≥ 1`, otherwise failure. The SWI diffs in `ext/md/`:
  - `rml_destroy_entities.xml`
  - `rml_destroy_matching_objects.xml`
  - `rml_destroy_rarelyonsight.xml`
  - `rml_board_ship.xml`
  - `rml_capture.xml`
  - `rml_enforce_surrender.xml`
  - `rml_repeat_customevent.xml` (used by `gm_killmasstraffic`)
- The `BountyHunter_Event` cue (4413) forwards `$type` and `$missionLib` to `ProfessionAction` (count 1). The faction is found from the mission cue (`FindFactionInMissionCue` 3997: `$ClientOwner`, `$Client.owner`, `$OfferObject.owner`, `$Faction`, walking up to 10 parents).

### 5.3 Guild, membership, access keys in SWI
- **Guild rooms and NPCs are never spawned**: `Guilds_DockedAtStation` (2743) adds a guild room only if `ModFeatures.$guilds` contains the prof, and it is `[]` in SWI. [read] Station guild lists are still computed (`Guilds_ArrivedAtStation` 2815): BountyHunter is added at every defence station or faction HQ, plus a random 0–3 guilds on first visit. Nothing uses them in SWI except the map's guild-network block, which is also hidden (`kuertee_reputations_and_professions_map.lua` 61–72: shown only if the allowed-guilds list is non-empty and not BountyHunter-only).
- **Membership** (`Guilds_ConvoStart_Membership`, "Bounty Hunters Guild membership?") needs `$npc.$kProfs.$prof`, which only guild NPCs have. The faction representative and trade NPCs have none, so **membership is unreachable in SWI**. The SWI-specific membership lines (715/716/719) are dead. [inferred, high confidence]
- **Access keys** (silver 6/h, gold "10/h") are hidden in SWI: `$convo_isShowAccessKeys` requires `not IsSWIExists or isUseFullMod` (3071–3093). [read]
- **Guild reward bonus** (`RewardBonus` 2459): skipped for any profession or repu not in `ModFeatures.$guilds`, so **no bonus in SWI**. In full mod it would be `rewardCr × bonus%`, × 3 if completed ≤ 30 min, × 2 if ≤ 1 h (× 1.5 / 1.25 for Builder and Shipwright; Mercenary × 2 if ≤ 30 min at half rate). [read]
- **Guild missions** (`kuertee_professions_guilds.xml`): BountyHunter is explicitly excluded ("bounty hunter's missions are only from Emergent Missions", 264). Templates that use `missiongroup.bountyHunters_guild` (Assassinate, BoardShip, DestroyObjects mines/satellites, DestroyObject station, DestroyRarelyOnSight, 4435–4990) are registered only under Saboteur, and only when `UserSettings.$debugChance3` is set (1797–1806). They are **dead in normal play**. [read]

### 5.4 Sanctions (immunity) — works in SWI [read]
Offered in `Guilds_ConvoStart_20220707` (3037). The NPC is `faction.bountyhunters.representative`, or the `player.station.tradenpc` of a station owned by `bountyhunters`. For **each active Hunt mission** whose target's true owner is a valid or plunderer faction, and which is not already fully sanctioned, it offers "Sanction my attacks on: <ship>" (712).
- Costs are computed once per mission with vanilla `Reward_Money` against the **target's** faction:
  - **partial** = easy, level 1 (≈ 35–91 k Cr);
  - **full** = hard, level 1 (≈ 1–3.9 M Cr). [inferred ranges]
- Paid to the NPC's owner (`transfer_money`, or `VerboseTransactionLog` if that mod is present).
- Effect (`Sanctions` 6723, `SanctionAttack` 6734; ids stored for 3 h, or until the ship dies):
  - **partial** (720 "No retaliations"): `notifications.xml` `IllegalActivityRetaliate` police signal chance 0; `AttackResponse` uses the "refuse to retaliate" usecase; AI `move.seekenemies.xml` and `order.move.recon.xml` ignore the `police` signal for that victim. Relationship loss still happens (713).
  - **full** (721): also suppresses the `IllegalActivityRetaliate` relation change; skips the vanilla `PlayerKills` relation-on-kill cue (`notifications.xml` 446–458); suppresses laser-tower relation boosts in `move.flee.xml` and `order.move.recon.xml`.
  - Both: when the sanctioned ship becomes visible, it is removed from its commander (`SanctionAttack_Visible`, `remove_object_commander`, RAP 6762-6774). This only detaches a **follower**. A target that leads a wing has no commander, so nothing happens and its escorts keep defending it. Its subordinates are never detached or sanctioned. Seen on AEL-112 (2026-11-01): a partial sanction for 39,700 Cr, `commander: null` on all nine triggers, three escorts killed at -3/-2/-2 New Republic and unpaid, and the target's own kill -2 (partial doesn't cover kills). See [hunt-protection-ael-112.md](hunt-protection-ael-112.md).
  - Wording: 712 "Sanction my attacks on: %1(ship)", 720 "Partial immunity. No retaliations.: %s", 721 "Full immunity. No retaliations and intact relationships.: %s" (`ext/t/0001.xml` 5451, 5459-5460). None mentions the wing.
- Description line 512 "faction will not retaliate" checks `$MissionTarget.assignedaipilot.$kProfs_isSanctioned_partial/_full`, which nothing sets, so it never shows (dead).

### 5.5 Assessment dialogue [read]
At any economic-faction representative or trade NPC (SWI branch): "What is <faction>'s assessment of my actions?" (725). The reply is positive, neutral or negative (726–728) by disposition, which in SWI falls back to the vanilla relation (≥ neutral → positive; < neutral → negative). It then runs `NotifyAndLog_Reputation_Assessment`.

### 5.6 Reputations, kill counting and licences (bounty-adjacent) [read]
- `Attacker_Event` (5734, on `event_player_killed_object`) classifies every player kill as Defender, Vigilante, Mercenary or Pirate for the "from" faction (mission giver, else police faction of zone, else sector owner). Kills on registered mission targets (`$missionTargets3`, which includes Hunt targets) count as **sanctioned → Defender**. Kills are counted per reputation, target faction and macro (`AddKillCount` 2204), and feed the Kill Counts UI.
- `SetDispositionByFaction` (3896): in SWI the reputations are "silent" but still in `ModFeatures.$reputations`, so disposition follows the active reputation. Disposition gates military/capital ship licences (`KRAP_GetIsMilitaryShipsReqOk`) when `is_military_ships_req_defender`. In SWI, SSAC exists and takes over licence gating (`playerreputation.xml` diff); `kuertee_profession_requirements_by_faction.xml` sets the player default `isDisabled = true`.

---

## 6. SWI's NPC bounty hunters (faction indibhg) and "is anyone hunting the player?"

### 6.1 Named hunter jobs [read]
In `libraries/jobs.xml` 21350–21745 (all `startactive="false"`, `commandeerable=false`, owner `indibhg`, default order **`SWBountyHunterFighters`**):

| Job | Name (text 999840) | Ship tag |
|---|---|---|
| `bountyhunters_ig` | IG-88 | bhg_porax |
| `bountyhunters_neesh` | Neesh | bhg_random_small |
| `bountyhunters_ketsu` | Ketsu Onyo | bhg_lancer |
| `bountyhunters_sabine` | Sabine Wren | bhg_sabine |
| `bountyhunters_embo` | Embo | bhg_random_med |
| `bountyhunters_dengar` | Dengar | bhg_random_med |
| `bountyhunters_bane` | Cad Bane | bhg_random_small |
| `bountyhunters_amanaman` | Amanaman | bhg_random_med |
| `bountyhunters_4lom` | 4-LOM | bhg_random_small |
| `bountyhunters_bobba` | Boba Fett | bhg_firespray |
| `bountyhunters_asajj` | Asajj Ventress | bhg_assaj |
| `bountyhunters_mando` (quota 2) | Unknown Mandalorian | bhg_mando |
| `bountyhunters_bossk` | Bossk | bhg_yv666 |
| `bountyhunters_kuertee` | Kuer Het Mes | indibhg_kuertee |
| `bountyhunters_taros` | Taros Arkeen | indibhg_taros |
| `bountyhunters_nobu` | Nobutora | indibhg_nobu |
| `bountyhunters_griff` | Griff the Dreaded | indibhg_griff |
| `bountyhunters_shuul` | Shuul Daran | indibhg_shuul (Empire, Ascendancy, Anoat, Hutt space only) |
| `bountyhunters_ket` | Ketraar | indibhg_ket |

The others spawn in Empire, Ascendancy, New Republic, Anoat, Corporate, Commerce Guild, Hutt Cartel or Mandalorian space; quota 1, respawn interval 4000 s. `bountyhunters_elratie` (Shiroyasha) is commented out.

They are activated by `md/setup_swmod.xml` `SetupThingsForSWmod` (on `md.Setup.GameStart`, main SWI galaxy only, so **all gamestarts including BHG**) after a 20–30 min delay (246–268). Alongside, an incoming message arrives: "Invitation" (800105/800106), from "Unknown Contact": "…our Guild operates in all major government jurisdictions, but main office is in Milagro system… unique ships… if you buy that license".

Also `bountyhunters_garrison_m`: 12 galaxy-wide, 3 per sector, at bountyhunters wharfs, owner `bountyhunters`, ship tag `bhg_random_med_gar` → group `bhg_random`, order Patrol (zone).

### 6.2 What the hunters do [read]
`ext/aiscripts/order.sw.bountyhunter.fighters.xml` (order `SWBountyHunterFighters`, category internal):
- Wait 1–2 min.
- Pick `global.$Bounties.$pilots.random.ship` (the EM tracker in section 3).
- Skip if null, L/XL, or if its commander is L/XL. (0.91: also skip a docked target or a station.)
- Otherwise `run_script order.fight.attack.object` with primary target = that ship, `pursuetargets=true`, `checkrelation=false`, `allowothertargets=true`, `forceprimarytarget=true`.

[inferred] The script has no loop after the attack. It relies on the default job order restarting when it ends (vanilla behaviour). The hunt is galaxy-wide: a hunter may cross the map for a random target.
[inferred] Because the attack runs inside `order.fight.attack.object`, hunters' own kills feed the tracker (25 %), so a named hunter can itself become an S&D target if it kills ships of a non-excluded faction.
[inferred] Player-owned AI pilots in the tracker (1 h expiry) can be picked, so **your wingmen or fleet can be hunted**. The player-flown ship is never in the tracker (section 3.1).

### 6.3 "Bounty on your head" (Bankrupt Bounty Hunter start) [read]
- `ext/libraries/gamestarts.xml` 1055–1137 (`x4ep1_sw_bhg`):
  - name 602010 "Bankrupt Bounty Hunter"; description 602020 "INITIAL DIFFICULTY: Moderate, beware of bounty on your head!…"; player "Bobby the Fat" (602030), "Hutt Cartel Space" (602040), "Fortitude-class Shuttle" (602050), 500 Cr;
  - sector `swi_clusterlannik_sector001_macro`;
  - ship `fortitude_macro`: 2 × `engine_incomh`, 2 × `weapon_ix4_s_laser`, **4 × `shield_s_p12`**, 3 satellites, 5 flares, docking MK2, flight assist MK1, long-range scanner MK1, object scanner MK1, target MK1;
  - inventory: spacesuit repair laser, object scanner MK3 (as inventory), 1 timewarp;
  - relations: huttcartel −0.001, ascendancy −0.005, corporate +0.001, commerceguild −0.01.
- `ext/md/setup_gamestarts_sw.xml` `SW_Start_bhg` (1544):
  - reveals 11 sectors (Bothawui, Leritor, Manda, Daalang, Nanthri, Toydaria, Nar Shaddaa, Nal Hutta, Rorak, Mimban, Randon);
  - after 10 s, creates **2 × `r41_macro` owned by `huttpirates`** in the player's sector at position (x 15000, z −500000, so about 500 km out), with an immediate `Attack` order on `player.ship` (pursue, no relation check) and `set_object_relation_behaviour disable`.
- That is all. There is no recurring bounty, wanted level, or hunter spawn tied to this start. [read: no other references to `x4ep1_sw_bhg` in md, aiscripts or libraries apart from backups and `md/temp/gs_bhg.xml`, which is not loaded.]
- A comparable recurring mechanic exists only in the MC80R (rebel) start: `md/sw_plot_rebel.xml` `BountyHuntersAttacks` (177). After the intro, on each player sector change while flying an S ship, there is a 15 % chance to warp an `indibhg` ship near the player with an Attack order, at most 3 times. [read]

---

## 7. Social Standings and Citizenships (SSAC) touches

`ext/md/kuertee_ssac.xml` [read]:
- Social standing types include `cType_bountyHunter` = 108, shown as **"Ranger"** in the requirements comment ("majority cType_bountyHunter points. accrues for killing enemies of the sector owner"). The Lua comment says "Bounty Hunter" (`kuertee_social_standings_and_citizenships.lua` 177).
- Points (`FactionData_AddSocialStanding` 1228): +1 + consecutive-action bonus (max +9) per action.
- Sources:
  - `CType_BountyHunter_OnKillObject` (852): player kills a ship or station (not a laser tower or drone) in a sector owned by a valid faction, where the victim is an enemy of the sector owner;
  - `ThirdPartyModEvents_OnkProfsEvent` (1062): any RAP ReputationAction, or ProfessionAction with prof = BountyHunter, for that faction.
- Initial seeding from RAP uses the **Defender** percentage for the bountyHunter score (2005).
- Ranger or entrepreneur points make you a "migrant" instead of a "visitor" (≥ 10 % of total, 1715–1735). A "Ranger" established after being pirate or traitor clears traitor status (2049–2056).
- [inferred] For SWI's named factions (`kuertee_ssac_requirements_by_faction.xml`), `immigration_req_social_standing = 0`. So Ranger standing mainly affects immigration status and the cosmetic label. Citizenship tiers (friend, ally, capital-ship licences) depend on stations and transactions, not bounty work. No entry exists for `bountyhunters` (falls back to the `faction.player` default).

---

## 8. Kill Counts and Missions

`starwarsmod_m1/ui/kuertee_kill_counts_and_missions.lua` is UI only. There is no MD script; it reads RAP data (`killsByRepuByFactionByMacro`, mission completed/failed lists, tours of duty). [read]
- Hooks into the RAP Player Info / Diplomacy panels (`createProfessionsOrReputationsInfo_reputations`) and shows, for the selected row: total kills (Defender = "sanctioned" kills), tours of duty, missions completed:failed, and expandable lists by reputation, faction and macro (text 535–546).
- Bounty relevance: Hunt kills count as Defender (sanctioned) kills, and Hunt missions appear in the missions lists by `$TextTable.$missionname` "Search And Destroy".
- [inferred] It only renders when a RAP row is selected. In SWI the rows are hidden (section 9), so it may never appear. Needs an in-game check.

---

## 9. UI surfaces summary

| Where | What | Source | Works in SWI? |
|---|---|---|---|
| Conversation, Bounties Hunters station trade NPC | S&D offers by faction and class → map | EM `Bounties_Convo` | Yes [read] |
| Conversation, BH rep / BH station trade NPC | Sanction purchase per active hunt | RAP `Guilds_ConvoStart_SactionAttacks` | Yes [read] |
| Conversation, any faction rep / trade NPC | Assessment | RAP `SWI_Guilds_ConvoStart_Evaluation` | Yes [read] |
| Map, mission offer and active context | Accept limit, "already hunting", download reports | `kuertee_emergent_missions.lua` | Yes [read] |
| Map, guild network | Connect to Guild Network | `kuertee_reputations_and_professions_map.lua` | Hidden in SWI (no allowed guilds) [read] |
| Player Info, "Professions" tab (after Empire) | Profession table | `kuertee_reputations_and_professions_playerinfo.lua` 57–110, 665, 816 | Tab added, but rows need `professions_allowed[id] == true`; all ids are "silent", so **the table is likely empty** [inferred] |
| Diplomacy, "Reputations" tab | Reputation and SSAC info | same + SSAC Lua | SSAC rows likely; RAP rows hidden [inferred] |
| Notifications and logbook | Hunt updates, mission logbook | EM | Yes; RAP level-ups silent [read] |
| Incoming message at 20–30 min | Guild invitation | `setup_swmod.xml` | Yes [read] |

How the Lua loads: `starwarsmod_m1/ui.xml` lists all kuertee Lua files. The MD `SWIUI_LoadLua` events (EM 77–104, SSAC 40–67) raise a Lua event nothing registers. They are leftovers and harmless. [read]

---

## 10. Settings and toggles

There are **no in-game options** for any kuertee setting in SWI. `sw_gameoptions.lua` only hides the Timelines and Tutorials options. Every `UserSettings` value is hard-coded in MD and re-applied on load (or by patch). [read]

| Setting | Value | Source |
|---|---|---|
| EM `$rewardMult` | 50.0 (%) | EM 170 |
| EM `$gateDistance_missionOffers` | 3 | EM |
| EM `$missionHandlerNPC_alwaysSpawnAtStation` | false (SWI forces the station path anyway) | EM |
| Hunt `$missionsPerHour_max` | 3 | EM 5098 |
| RAP `$actionLimiterMinutes` | 5 | RAP 125 |
| RAP `$maxInspirationPoints` | 25 | RAP |
| RAP `$activityMult` | 1 | RAP |
| RAP `$isNewOfferOnMissionComplete` | false | RAP |
| RAP `$debugChance` | 100 on a fresh start (actions) and forced 100 during `Init` in SWI (0.91: 0, no override, patched into saves) | RAP 120, 694–697 |

Debug chat commands exist ("debug rap bh member", "debug em hunt …", "reset emissions"). They need kuertee's `Chat_Window_API`, which SWI does not ship (only referenced in `menu_interactmenu.xpl`). [inferred: unreachable]

---

## 11. Relevant factions (from `ext/libraries/factions.xml`, a diff) [read]

**bountyhunters** ("Bounty Hunters Guild" family, text 999840/501110)
- Tags: barterships barterwares economic protective watchdoguser privateloadout publicloadout privateship. **No `police` tag.** Primary race teladi.
- Licences: general-use equipment 100 k, general-use ships 200 k, military equipment 1 M, military ships 3 M (all min relation −0.01); ceremony friend 0.01, ally 0.1.
- Relations: Khaak and Xenon −1; Sith −1; Black Sun, Hutt pirates, Valarian, Mando raiders −0.1; the 12 main factions +0.32; **indibhg +1**.
- Sells (`libraries/wares.xml` owners): Firespray, Razor Crest, HWK-290, Mandalorian N-1, Mantis, Dynamic-class freighter, YV-666, seismic charges and equipment.
- Has a `factionrepresentative` character group (`charactergroups.xml` 428).

**indibhg** (independent hunters)
- Tags: economic, privateloadout, publicloadout, privateship, **hidden**. Relations **locked**: Khaak, Xenon and Sith −1; bountyhunters +1. Signal: attacked → attack.
- Licences mirror those of 11 factions.
- 17 ship entries in `ships.xml` (3788+), elite pilots and crews.

**blacksun**
- Tags include **plunder, pirate**, claimspace. Relation to player −0.0032; −0.32 to the main factions, −0.1 to bountyhunters.
- In the hunt excluded list: its ships' **deaths** never create bounties, and it never offers them. Its ships **can** be bounty targets when they kill others.

**huttcartel**
- Police faction (tag `police`, `policefaction="huttcartel"`), economic; +0.32 to bountyhunters; police licence 100 k. Valid S&D offerer.

**huttpirates**
- Plunder, pirate; relations locked; −0.0032 to player. The BHG start's attackers belong to this faction.

`gm_barterwares.xml` lets bountyhunters (among others) offer barter missions (12). `md/setup.xml` removes bountyhunters and indibhg from the smuggler cover factions (95). `notifications.xml` gives bountyhunters stations the "generic droid" station announcements (28).

---

## 12. SWI diffs to vanilla touching bounties, police, kills [read]

- `ext/aiscripts/order.fight.attack.object.xml`: kEM attack/kill hooks (section 3.1), plus SWI combat tweaks.
- `ext/aiscripts/orders.base.xml`: kEM sector-change handler.
- `ext/aiscripts/move.seekenemies.xml` and `order.move.recon.xml`: ignore `police` signals for sanctioned victims; kEM attack signal.
- `ext/aiscripts/move.flee.xml`: no laser-tower relation boost against fully sanctioned ships.
- `ext/md/notifications.xml`: `PlayerKills` skipped for fully sanctioned kills; `AttackResponse` refuse usecase; `IllegalActivityRetaliate` relation and police chance by sanction type.
- `ext/md/rml_*` (destroy, board, capture, enforce-surrender, repeat-customevent): RAP registration and BountyHunter events (section 5.2). Most other `rml_*` diffs only register missions with RAP.
- `ext/md/gm_*`: all register mission start time and end with RAP `GMMissionEnd` and add a `MissionGroup` param. **SWI also raises `OfferDistance` default from vanilla 50 km to 350 km** in 24 gm files (gm_assassinate, gm_destroy_objects, gm_killmasstraffic and others). Vanilla kill-type generic missions are therefore visible from much farther.
- `ext/md/lib_reward_balancing.xml`: guild-group reward multiplier (section 4.4).
- `ext/md/playerreputation.xml`: kRAP/kSSAC licence gating on relation changes (adjacent, not bounty).
- `ext/md/factionlogic.xml`: Bounty Hunters faction logic.

---

## 13. Depends on vanilla (for the vanilla researcher)

- **`order.fight.attack.object`**: which AI behaviours (patrol, police, plunder, escort, defend, interrupt.attacked) route their kills through it. This decides who becomes a bounty.
- **Default job orders**: whether `SWBountyHunterFighters` restarts after it ends, and job respawn timing (`time interval`).
- **Mission offer and BBS machinery**: `create_offer` / `create_mission`, offer visibility on map and BBS (`distance=0`), `accept` signal to actor, `MissionBriefingMenu`, guidance, `set_objective` with `endtime`.
- **`LIB_Reward_Balancing`**: `Reward_Money` (`GetValue_Credits`, relation boost, random), `Apply_RewardMultiplier`, `Reward_Notoriety`.
- **Relations on kill and police response**: `change_relation_on_kill`, `notifications.xml` `PlayerKills` / `AttackResponse` / `IllegalActivityRetaliate`, sector `police` signals, police licences, `relation.neutral.min` / `relation.friend.min` thresholds.
- **Cover owners / disguised ships** (`coverowner`), scanning (`event_scan_finished`), long-range scan events.
- **Faction representatives and HQ**: does `faction.bountyhunters` get a representative (needs HQ via faction logic)? `station.tradenpc` availability on wharfs.
- **NPC conversation** (`event_conversation_started` default), remote comms to mission NPCs.
- **Generic missions and RMLs**: destroy, board, capture, enforce-surrender, kill mass traffic; `$feedbackvalue` semantics.
- **Licences** (`canholdlicence`, ceremony licences), wares owners and wharf sales.
- **`event_player_killed_object`** semantics (does it fire for player-owned AI kills or only the player-flown ship?). This affects RAP and SSAC kill counting.
- **Script value semantics**: `component.size` units, and money vs number comparison (needed to judge the SWI reward cap).

---

## 14. Open questions / needs in-game testing

1. **L/XL Hunt payout cap**: what does a completed hunt on an L or XL target actually pay? (`CapRewardBasedOnMissionTarget`, `size × 5` / `size × 2`.)
2. Do S&D conversation options appear at the trade NPC of a Bounty Hunters wharf (e.g. Milagro)? Under "... more. (Mods)"? How many factions and offers show early in a BHG start (tracker needs about 20+ min of NPC fighting)?
3. Does `faction.bountyhunters` have a representative, and where? (Needed for sanctions outside BH station trade NPCs.)
4. Debrief: can you finish by comms, or must you dock at the offering station (often far away, another faction's space)?
5. Are offers placed at other factions' stations visible and acceptable from the map opened at the BH station?
6. Player Info "Professions" tab and Diplomacy "Reputations" tab in SWI: empty or populated? Does the Kill Counts panel ever appear?
7. Do NPC named hunters ever attack player-owned ships (wingmen with Attack-order kills)? Do they hunt each other or pirates in practice?
8. BHG start: do the two R-41s spawned 500 km out actually reach the player? Do they despawn or keep pursuing?
9. Sanction costs in practice (target-faction relation drives the boost), and whether partial sanctions really stop police response.
10. Does the 25 % sampling make the bounty pool thin in quiet regions (Hutt space at start)?
11. Rate of the 3-per-hour cap versus offer volume; the map's countdown text (see bugs).
12. Do "Hunt" kills count as Defender (sanctioned) kills in RAP data as intended?

---

## 15. Bugs, oddities, dead code

**Bugs (read in code):**
- `Bounties_Convo` (EM 12038): `event.object.owner == @faction.bountyhunters.representative` compares a faction with an NPC and is always false. Only the trade-NPC branch works, so a BH rep standing elsewhere never offers S&D.
- `Bounties_PrepareMissionsForConvo` (EM 11997–12004): XS pilots get `$class = null` (only S/M and L/XL are mapped), so they are never offered and may write a null key.
- Hunt payout cap (EM 7340–7370, SWI-only): compares a money total with `MissionTarget.size × 5|2` (object size, presumably metres) and rescales to that number as `ct`. [inferred] Likely collapses L/XL rewards to a few Cr; needs testing.
- Hunt Lua (`kuertee_emergent_missions.lua` ~243–246): the countdown uses `60 * 60 * 60` (60 h) instead of 3600 s, so the "N missions an hour: time left" text is wrong.
- Gold key comment says "10 missions total" but `3 + 4 = 7` (EM 5184). Moot in SWI (keys hidden).
- `RewardBonus` (RAP 2492): `bonus lt bonus` compares a value with itself, so "lowest repu" selection never works. Moot in SWI.
- `ProfessionAction` disabled-prof branch (RAP ~1785) uses undefined `$repu` (`kProfs.$reputations.$scores.{$repu}`), affecting Builder and Shipwright only.
- `rml_repeat_customevent.xml`: BountyHunter_Event passes `$kProfs_missionLib` (local) while the check and AttackMission use `namespace.$kProfs_missionLib`. The profession event may get a null missionLib, so its faction can't be found.
- `kuertee_reputations_and_professions_playerinfo.lua` 300–325: `getAllowedProfessions` builds from `modFeatures_reputations` and `getAllowedReputations` from `modFeatures_professions` (swapped). It is masked in SWI because everything is silent.
- Sanction wing detach (RAP 6762-6774): `remove_object_commander` runs on the target only, so a wing-leader target keeps its escorts. The escorts aren't covered by the sanction, so each kill costs relation and pays nothing. [inferred] The full sanction's kill hook is on `PlayerKills` only, so a target killed by the player's AI wingman may still cost relation. See [hunt-protection-ael-112.md](hunt-protection-ael-112.md) and T19.
- RAP 5800 (`Attacker_Event`): `@target.commander` is missing its `$`. It only affects kuertee's silent reputation books.
- `setup_swmod.xml` patch 2 (286) activates `'bountyhunters_shul'` (typo; the job is `bountyhunters_shuul`). Only affects old saves; the main path (265) is correct.

**Dead or unwired in SWI:**
- Guild rooms and NPCs, membership, access keys, guild reward bonuses, trade discounts and penalties, guild network UI (`ModFeatures.$guilds = []`; membership needs guild NPCs).
- Membership lines 715/716/719, texts 711/714/723/724 (unused), description line 512 (`$kProfs_isSanctioned_*` never set).
- BH-group guild mission templates (Assassinate, BoardShip, Destroy…): registered only under `debugChance3`.
- Full-mod S&D path via Guild Network (`Bounties_OpenMissionOffersUI*`), gated `not $isMissionsFromConvo`.
- `Mission_Hunt_Activated` (EM 5803) has `<check_value value="false"/>`, so it never fires.
- `activity_target_destroyed` profession event (commented out).
- `md/temp/` and `md/test/` scripts, e.g. `md/temp/sw_gm_huntbounty.xml` (a vanilla-style "GM_HuntBounty" generic mission, 1074 lines, referenced nowhere) and `md/temp/gs_bhg.xml` (an old BHG map reveal using vanilla cluster macros). [inferred] Not loaded, since X4 loads only top-level `md/*.xml`. `libraries/backup/` is similarly unused.
- `SWIUI_LoadLua` MD events (no Lua handler; SSAC path points to a non-existent `kuertee_ssac` Lua).
- Debug chat commands (no Chat Window API in SWI).
- In SWI the RAP BountyHunter profession accumulates points with no player-visible effect except SSAC "Ranger" standing. [inferred]

**Oddities:**
- RAP `Init` forces `UserSettings.$debugChance = 100` in SWI during init, and fresh games start at 100 (patch 16 sets 0 only for upgraded saves). Possible debug-log spam. [read] Fixed in 0.91: 0, with a save patch.
- The hunt list in SWI is galaxy-wide, not station-local, and has no 3 h freshness check (unlike full mod).
- The BHG description promises "a bounty on your head", but the code delivers one wave of two fighters.
- The gamestart ship has 4 shields (S P12 ×4) and 2 lasers; the concept doc mentions only "two lasers and basic software".
