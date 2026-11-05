# Save check: hunt 10 turn-in, "Search and destroy: BAO Mercenary Weequay (ONJ-300)"

Save: `save_008.xml.gz` (file time 2026-11-04 15:53 MST), `<save name="BBH - Test 2">`, game time 28,270.136, X4 8.00 (build 590967) + SWI 0.90, player "Bobby the Fat". Same slot as [save-check-zgn-719.md](save-check-zgn-719.md) (14:07, game time 26,781.7). It was copied to the scratch folder as `save_008-hunt10.xml.gz` and unpacked; the save folder was not touched. Line numbers are from the unpacked file. Tags: [read] = seen in the save, [inferred] = reasoned, not tested.

Component ids are renumbered on every save: MEV-790 was `[0x2154e2e]` at 14:07 and is `[0x9fd85]` here; LOD-387 is now `[0x62ac9]`. Match ships by code, not id.

## Sources

- `<player money>` (line 7), `<stats>` (~22678261-22678330), player faction `<relations>` (line 1134).
- **Money log** `<economylog><entries type="money">` (from line 22678167): `v` = balance after, in cents.
- Logbook and ticker (from line 22678336).
- Ship components: the four R-41s (lines 11880714-11910271), the target wreck (12031232), the VEJ-815 wreck (3374247).
- Emergent Missions cue instance for hunt 10: `<cue id="814764" state="complete" time="27459.225">` under `Mission_Hunt` (814678), vars at 25105476-25105550. Its `$DamageAndKillsList` -> table 24222.
- md refs are split by type: `<refs type="string">` (22678688), `list` (22688387), `group` (23377851), `table` (23609658). A ref id means different things in each section (string 3346 = "ONJ-300", list 3346 = something else).
- SWI 0.90 `ext/t/0001.xml` and `ext/libraries/factions.xml` for faction names. Helpers: `research/save-read-scripts/anc.py`, plus a small subtree extractor (prints one `<component>` and its children).

## Short answer

1. **Balance: 1,023,383 Cr** [read]. Since 14:07 (1,550,089): **−916,542** for the fourth R-41 (27,142.5), **+17,115** loot (27,968.6), **+372,721.84** hunt 10 (28,065.1). Nothing else.
2. **Hunt 10's target was disguised: really ZPX-205, a `weequay_macro` owned by `blacksun` (Black Sun, "BLS")**, shown as "BAO Mercenary Weequay (ONJ-300)". BAO = Baobab Merchant Fleet (`baobab`). The mission's own record names it "BLS Mercenary Weequay (ZPX-205)". **It died in Eriadu (Ascendancy) at 27,959.117, killed by LOD-387, the player's own ship.** No escort was found. [read]
3. **Per-attacker damage is not in the save.** The mission keeps one number, `$damage_total` 44.3697, for the player's whole side. The only per-ship trace is which R-41 shot off each of the target's 6 engines (see below). [read]
4. **Hunt 9 failed, not vanished: "You failed to find PIR Gang Weequay (VEJ-815). Total reward: 0.00 Cr." at 27,239.397.** VEJ-815 died 0.03 s earlier (27,239.37) in Kashyyyk, killed out of the player's sight by a New Republic X-wing, XTI-314. Its cue is gone. No rep or money cost. [read]
5. **Rep:** Ascendancy +2 (-> 9), Black Sun −2 "Unauthorised Kill" (-> −9), Anoat unchanged. No sanction. [read]
6. **Fourth R-41: BCY-548**, crewed (pilot Renda Caren + 1 marine), same fit as the others, and a wingman of LOD-387 (Escort, group 1). [read]

## 1. Money since 14:07 [read]

| Game time | Type | Partner | Amount (Cr) | Balance after | What |
|---|---|---|---|---|---|
| 26,751.878 | script_add | | +93,113.36 | 1,550,089 | Hunt 8 (the 14:07 baseline) |
| 27,142.472 | transfer | `[0x9fd85]` = MEV-790, TransGalMeg Wharf, Mataou | **−916,542** | 633,547 | **Fourth R-41 BCY-548** (spawntime 27,142.514). Ticker "Debit withdrawal: 916,542 Cr" |
| 27,968.589 | collect | | **+17,115** | 650,662 | Loot sold on pickup with "Basic Seminar (Piloting) 1", 10 s after the kill |
| 28,065.069 | script_add | | **+372,721.84** | 1,023,383 | Hunt 10. Ticker "Payment received: 372,721 Cr" at 28,065.126 |

- The fourth R-41 cost 916,542: less than RBQ-989 (975,199) and more than the first two (879,875 each, if equal). BCY-548 has no satellites (RBQ-989 has 2) [read]; the price differences are still unexplained.
- Hunt 10's first run (killed unscanned, paid 0) isn't in the save: it was reloaded away (`savegames_loaded` 8, was 7) [read/inferred]. There's no money entry between 27,142 and 27,968.

## 2. Hunt 10

### Pay [read]

- Logbook (28,065.069): "Reward for BAO Mercenary Weequay (ONJ-300) kills: 252,735.00 Cr. Your Engagements: 1 x M ship (kills: 1). Reward for … destruction: 119,986.84 Cr. Total reward: 372,721.84 Cr." `money="37272184"`; `$RewardCr` 37272184.
- Offer (string 1792): "Reward: 291,130.00 Cr + up to 218,340.00 Cr". Final (string 69899): "Reward: 252,735.00 Cr + up to 119,986.84 Cr". So **the kills part shrank** from 291,130 to 252,735 (−13%) between offer and turn-in; in hunt 8 it grew a little. Why isn't recorded [unverified].
- Destruction pay 119,986.84 = 2 x 59,993.42, the line in the result text ("your damage: 44.3697 / 100: 59,993.42 Cr"), as in hunt 8.
- Odd key names in the mission tables: `$CappedRewards` (table 25326) has `$RewardForTarget` = 252,735.00 and `$RewardForPlayerKills` = 119,986.84; `$BaseRewardData` (24221) has `$reward_forTargetKills` = 252,735.00 and `$reward_forTarget` = 119,986.84. Labels and UI don't line up neatly.
- `$PlayerDamageAndKillsData` (table 25325): `$description_damageAndKillsByClass` "Your Engagements: 1 x M ship (kills: 1).", `$description_damageAndKillsByMacro` "1 killed / 1 x Weequay Corvette: your kills: 1, your damage: 44.3697 / 100: 59,993.42 Cr.", `$difficulty_max` medium, `$reward` 119,986.84.

### The target: real identity [read]

- Mission vars (cue 814764): `$Faction` ascendancy, **`$OpposingFaction` blacksun**, `$kProfs_targetFaction` blacksun, `$EnemyFactions` (list 16910) = [baobab, blacksun], `$IsDisguised` 1, `$MissionTarget` `[0x62a9e]`, `$TargetSector` `[0x615a7]` (Eriadu), `$Difficulty` medium, `$MissionGroup` bountyHunters_guild, `$kEMissionType` 106, `$MissionId` "kEM_Hunt_397", `$RewardNotoriety` 0.004, `$timer_find_end` 38,580.957, `$Result` success, `$isTargetAttackedByPlayer` 1. Cue time 27,459.225 (accept, in the reloaded timeline).
- `$idCode` (string 3346) = **"ONJ-300"**, `$mission_name` "Search and destroy: BAO Mercenary Weequay (ONJ-300)", find beacon `$name` "(Report of ONJ-300, 03h 55min 32s ago)". **Unlike hunt 8**, where `$idCode` and the beacons used the real code (JJO-747), here they carry the fake code.
- The damage record (table 24222, the only entry in `$DamageAndKillsList`): `$enemy` `[0x62a9e]`, **`$idCode` "ZPX-205"**, **`$name` "BLS Mercenary Weequay (ZPX-205)"**, `$faction` blacksun, `$class` ship_m, `$macro` weequay_macro, `$size` 174.3 m, **`$damage_total` 44.3697**, `$isPlayerKilled` 1, **`$killer` "R-41 Starchaser"** (a ship-type name, not a code), `$hull` 0, `$cues` 7 entries, `$cues_playerKill` empty.
- Wreck (line 12031232): `weequay_macro`, `state="wreck"`, code **ZPX-205**, owner **blacksun**, id `[0x62a9e]`, spawntime 12,826.1 (a ship that already existed, not spawned for the mission). **`attacker="[0x62ac9]"` = LOD-387 (the player's ship), `hitbybullet`, 27,959.117.** No `cover` attribute: the disguise is the mission's. Only the player has a `killed` listener on it.
- Where: cluster `swi_clustereriadu_macro` -> sector `swi_clustereriadu_sector001_macro` (owner `ascendancy`) -> tempzone KSI-974.
- The real **ONJ-300** is a New Republic `t65b_xwing_01_macro` (spawntime 0), alive in Kuat (`swi_clusterkuat_sector001_macro`, zone 002), line 14213198. As in hunt 8, the disguise borrowed a real ship's code.
- So the player's belief is right: the target was Black Sun. The Black Sun −2 "Unauthorised Kill" at 27,958.905 (0.2 s before the wreck time; X4 logs the kill as it lands) is the cost of that kill.

### Who did the damage

- **Not in the save as a per-ship split** [read]. `$damage_total` is one number for the player's side; `DamageCalculator.$dmgAndKillsDataByIdCode` (table 11760) is empty after the turn-in. The mission code (another agent's file, `research/em-scan-and-wing-damage.md`) is the place to see how it's summed.
- **Proxy: the target's 6 engines (`engine_cr90_macro`), each a wreck with its own attacker** [read]:

| Time | Engine shot off by |
|---|---|
| 27,896.487 | RBQ-989 (Romin Riano) |
| 27,909.974 | LOD-387 (player) |
| 27,917.609 | BCY-548 (Renda Caren) |
| 27,943.757 | NOM-811 (Basten Fisty) |
| 27,946.511 | BCY-548 |
| 27,947.412 | BCY-548 |

  All four R-41s fired on it. The new wingman BCY-548 took out half the engines [read]. That's surface elements only, not hull damage; it doesn't show the hull split [inferred].
- Last shots: LOD-387's four lasers all at 27,959.167 (just after the kill); RBQ-989's lasers 27,958.28-27,958.78, NOM-811's 27,958.28-27,958.68, BCY-548's 27,954.4-27,956.9 [read]. The player made the killing hit.
- **NOM-811 fired 2 missiles**: launchers' `lastshottime` 27,957.033, concussion missiles 6 of 8 left. The other three still have 8. `missiles_fired` stat stays 0, so it counts only the player's own [read/inferred].
- The fight ran about 27,893-27,959 (LOD-387 `intentionalattacktime` 27,892.7; NOM-811 hit by the target at 27,939.6) [read]. Logbook: "Scan Mode activated" 27,940.7-27,941.5 and 27,945.1-27,970.7, the scan that made run 2 pay.
- Collisions in the furball: LOD-387 and RBQ-989 collided at 27,932.837; NOM-811 hit `[0x61a37]` at 28,023.5 [read].

### Escorts [read]

- No live or dead ship links to ZPX-205 (no Escort order targeting `[0x62a9e]`, no `killed` listener from a wingman).
- Other Black Sun wrecks in Eriadu are unrelated: R-41s DHS-365 and MYC-143 (spawned 26,731.5, killed 26,942.6 / 27,008.6 by Ascendancy customs corvettes) were wingmen of a Black Sun R-41 MIK-065 (`killed` listener), and the frigate KZK-857 died at 26,466.9 to an Ascendancy Vigil. All before the player's fight.

### Debrief and client [read]

- `$MissionContact_NPC` `[0x61ed4]` = **Avlyn Tiago** (ESC-800, ascendancy, `default_shadyguy`), in the Command Centre of **CUT-160** (`{20102,1071}` "Shipyard", Ascendancy), Eriadu. `lastspeaktime` 28,266.6. `$Client` = Calvin Brown (manager, ascendancy).
- At save time the player is in that security office (`lastcontrolled` LOD-387) and LOD-387 is docked at CUT-160.

## 3. Hunt 9: VEJ-815 [read]

- Logbook (27,239.397, category missions): "Search and destroy: PIR Gang Weequay (VEJ-815)" / "**You failed to find PIR Gang Weequay (VEJ-815). Total reward: 0.00 Cr.**"
- Wreck (line 3374247): `weequay_macro`, `valarian`, code **VEJ-815**, spawntime 284.1, `state="wreck"`, **`attacker="[0x1f2c8]"` = XTI-314, a New Republic `t65b_xwing_01_macro`**, `attackmethod="lowattentionattack"` (killed in the background, out of the player's view), **27,239.37**. In `swi_clusterkashyyk_sector001_macro` (owner newrepublic), zone 001. The killer is alive in a Kashyyyk tempzone.
- So the mission didn't vanish on its own: **another faction killed the target and the mission failed 0.03 s later** [inferred from the times]. The player was in travel mode 27,157-27,245 (arrival in Mon Gazza fits ~27,245) [read].
- No hunt-9 cue is left in the save; no reputation loss with Anoat (player has no Anoat relation entry or booster); no money debit. A failed hunt costs nothing.
- Stats: `missions_accepted` 10 (was 8), `missions_completed` 6 (was 5).

## 4. Reputation since 14:07 [read]

| Time | Faction | Change | Now | Reason |
|---|---|---|---|---|
| 27,542.987 | "Civilian Ship D…" (ticker cuts the name) | −3 temporary | −30 | "Lost reputation temporarily", Unauthorised Attack. A per-ship temporary loss, not a faction one [inferred]; no faction booster matches it |
| 27,958.905 | **Black Sun** | **−2** | **−9** | Unauthorised Kill (ZPX-205). Booster `blacksun` −0.0092 at 27,958.905 |
| 28,065.069 | **Imperial Ascendancy** | **+2** | **9** | Mission Completed (hunt 10; hunt 8 gave +5). Booster `ascendancy` 0.0095; `max_faction_relation` 9 |

- Anoat Federation, Baobab and Pirate Syndicates: no change. No sanction entries in the logbook or ticker.
- Ascendancy gave only +2 this time against +5 for hunt 8, though hunt 10 paid four times as much [read]; why isn't recorded.

## 5. The fourth R-41: BCY-548 [read]

`ships_owned` 4. All four are `r41_macro` in Eriadu zone 001 (ISV-614), Ascendancy space. None has a `<hull>` element, so all are at **full hull** [inferred from the format, as before].

| Ship | Where | Pilot (piloting, morale) | Order | Crew |
|---|---|---|---|---|
| **LOD-387** (player's) | docked at CUT-160 | Val Motoli (4, 6); player `lastcontrolled` | Wait (default); `fleet name="Fleet 2"`; `group index="1" assignmment="attack"`; **3 `subordinates` connections** | |
| RBQ-989 | in space | Romin Riano (4, 6) | Escort LOD-387, pointguard 820 m, `subordinate group="1"` | 1 marine |
| NOM-811 | in space | Basten Fisty (6, 6; morale was 5) | Escort LOD-387, pointguard 796 m, group 1 | 1 marine |
| **BCY-548** (new) | in space | **Renda Caren** (5, 4) | **Escort LOD-387, pointguard 845.6 m, group 1** | 1 marine (boarding 2) |

- BCY-548: spawntime 27,142.514, id `[0x62aea]`. Fit identical to the others: 2 x `weapon_ix4_s_laser_macro`, 2 x `weapon_kx5_s_laser_macro`, 2 x `weapon_hm6launcher_macro` with 8 `missile_concussion_light_macro`, 2 x `shield_s_cec1077_macro`, 4 x `engine_incom_macro`, `thruster_gen_s_allround_01_mk3_macro`, 8 flares; software dock mk2, long-range scanner mk2, object scanner mk2, targeting mk1, trading mk1. No satellites.
- It's in the player's wing and fought in hunt 10 (3 of the target's 6 engines).

## 6. Mission logbook entries since 14:07 [read]

- 27,239.397: hunt 9 failed (above).
- 27,958.905: Black Sun −2 Unauthorised Kill.
- 28,065.069: Ascendancy +2 Mission Completed; hunt 10 reward entry.
- Nothing about the hunt 10 accept, the first (reloaded) run, or hunt 9's accept: EM logs only results.

## Unverified

- How `$damage_total` 44.37 splits between the player and the three wingmen (not stored; see the mission code).
- Why the kills reward fell from 291,130 to 252,735, and why Ascendancy gave +2, not +5.
- Which faction's ship "Civilian Ship D…" was.
- Why the four R-41s cost 879,875 (x2), 975,199 and 916,542.
