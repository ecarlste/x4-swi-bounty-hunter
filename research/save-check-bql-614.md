# Save check: hunt 11 turn-in, "Search and destroy: HTP Mercenary Y-wing BTL-BP (BQL-614)"

Save: `quicksave.xml.gz` (file time 2026-11-04 16:55 MST), `<save name="BBH - Test 2">`, game time 31,738.917, X4 8.00 (build 590967) + SWI 0.90, player "Bobby the Fat". It follows [save-check-onj-300.md](save-check-onj-300.md) (save_008 at 15:53, game time 28,270.136, 1,023,383 Cr). The quicksave was copied to the scratch folder as `qs-bql614.xml.gz` and unpacked; the save folder was not touched. A later copy of `save_008.xml.gz` (re-saved 16:31, game time 30,462.688, 900,881 Cr) was also copied, for its ticker, which still held the Chardaan pickups. Line numbers are from the unpacked quicksave. Tags: [read] = seen in the save, [inferred] = reasoned, not tested.

Component ids are renumbered on every save. Match ships by code, not id. In this save: LOD-387 `[0x62ac9]`, RBQ-989 `[0x62b05]`, NOM-811 `[0x62b20]`, BCY-548 `[0x62aea]`, player `[0x62adb]`.

## Sources

- `<player money>` (line 7), player faction `<relations>` and `<licences>` (line 1134), `<stats>` (22939589).
- **Money log** `<economylog><entries type="money">` (from line 22939504): `v` = balance after, in cents.
- Logbook and ticker (from 22939590). The quicksave's ticker starts at 29,350, so the Chardaan pickups come from the 16:31 save_008's ticker (its lines 22833130-22833198).
- Ship components: the four R-41s (4394186-4418560), the target wreck (12804110), Chardaan cluster (13195901-13358089), Smuggler's Run cluster (from 12715687).
- Emergent Missions cue instance for hunt 11: `<cue id="827233" state="complete" time="30539.037">` (vars 25510088-25510170). md refs: `string` 22940071, `list` 22950101, `group` 23701733, `table` 23946985.
- SWI 0.90 `ext/libraries/factions.xml` (licence prices, `indibhg`), `ext/t/0001.xml`; vanilla 8.00 `libraries/wares.xml` (item prices). Helper: `research/save-read-scripts/anc.py`.

## Short answer

1. **Balance: 1,042,288 Cr**, only +18,905 since 15:53 [read]. The money came in and went out: **+743,640 Cr cash from 17 Chardaan pickups**, **+133,858 from the Milagro HQ** (most likely an item sale [inferred]), **−1,000,000 to the Milagro HQ for the Bounty Hunters Guild military equipment licence**, +12,364 from one more pickup, and **+129,043.84 for hunt 11**.
2. **Hunt 11 was not disguised.** BQL-614 is a real Hutt Pirates (`huttpirates`, "HTP") `ywing_btlbp_macro`, a ship that existed from game start. **It died in Smuggler's Run at 31,529.182, killed by wingman RBQ-989 (Romin Riano).** All four R-41s fired on it. **Pay: kills 37,150.00 + destruction 91,893.84 = 129,043.84; damage share 97.1779 / 100.** No escort was found. [read]
3. **Rep:** Independent Commerce Guild +3 (-> 9), Mission Completed. Nothing else changed. No sanction. [read]
4. **Fleet:** all four R-41s present, in Ryloth. LOD-387 (docked at HIH-890) is at **6,667 / 7,150 hull (93%)**; the three escorts are at full hull. Missiles: 8 / 8 / 8 and NOM-811 still 6 (no missile fired since hunt 10). [read]
5. **The Chardaan battle** was an Imperial Ascendancy fleet destroyed by the New Republic in NR-held Chardaan: an XL Procursator, a Fulgor, a Kontos, three Veloxes, a supply barge and a new Defence Platform, 28,395-29,194. The player's ships hit nothing there; they only collected drops. [read]
6. **A clash with an SWI NPC bounty hunter**: the player's wing exchanged fire with Razor Crest NKU-627 (`indibhg`, pilot Marelle Loma) in Gizer at about 30,610-30,646. No rep change, no losses. [read]

## 1. Money since 15:53 [read]

| Game time | Type | Partner | Amount (Cr) | Balance after | What |
|---|---|---|---|---|---|
| 28,065.069 | script_add | | | 1,023,383 | Hunt 10 (the 15:53 baseline) |
| 28,907.274 | collect | | +95,397 | 1,118,780 | Chardaan drop: Interface Unit 13 |
| 28,922.702 | collect | | +113,313 | 1,232,093 | Security Bypass System 1 |
| 28,928.989 | collect | | +100,796 | 1,332,889 | Interface Unit 10 |
| 28,956.607 | collect | | +76,809 | 1,409,698 | Advanced Targeting Module 6 |
| 28,960.343 | collect | | +8,446 | 1,418,144 | Remote Detonator 1 |
| 28,960.865 | collect | | +108,030 | 1,526,174 | Security Slicer 2 |
| 28,961.261 | collect | | +89,993 | 1,616,167 | Micro-Gimbal 11 |
| 29,005.560 | collect | | +19,370 | 1,635,537 | Seminar for 1-Star Crew (Piloting) 1 |
| 29,042.477 | collect | | +3,054 | 1,638,591 | Basic Seminar (Management) 2 |
| 29,082.601 | collect | | +7,897 | 1,646,488 | Secure Container 7 |
| 29,082.633 | collect | | +1,916 | 1,648,404 | Seminar for 1-Star Crew (Piloting) 1 |
| 29,087.275 | collect | | +6,615 | 1,655,019 | Modular Trigger 1 |
| 29,134.365 | collect | | +30,059 | 1,685,078 | Interface Unit 28 |
| 29,138.386 | collect | | +47,760 | 1,732,838 | Durasteel Frame 1 |
| 29,149.573 | collect | | +5,617 | 1,738,455 | Interface Unit 4 |
| 29,177.748 | collect | | +9,166 | 1,747,621 | Alien Ingredients 7 |
| 29,202.691 | collect | | +19,402 | 1,767,023 | Seminar for 1-Star Crew (Management) 1 |
| 29,475.473 | transfer | `[0x5ce79]` = UYK-860, Bounty Hunters Guild HQ, Milagro | **+133,858** | 1,900,881 | Ticker "Payment received: 133,858 Cr". Most likely an item sale (below) [inferred] |
| 29,523.959 | transfer | `[0x5ce79]` UYK-860 | **−1,000,000** | 900,881 | **Licence: `militaryequipment` for `bountyhunters`.** Ticker "Debit withdrawal: 1,000,000 Cr" |
| 31,577.768 | collect | | +12,364 | 913,245 | Drop in Smuggler's Run: Tuning Software 2, Micro-Gimbal 2 |
| 31,698.749 | script_add | | **+129,043.84** | 1,042,288 | Hunt 11. Ticker "Payment received: 129,043 Cr" at 31,698.809 |

- **Chardaan loot: 743,640 Cr cash** in 17 pickups from 28,907 to 29,202 (the player guessed about 700k). Each `collect` is the cash in a drop, logged with the items in the same drop; some drops had items and no cash (Extended Fuel Container, Durasteel Frame 2, Advanced Weapon Chamber, High Energy Catalyst). `drops_collected` 102 -> 125, `illegal_drops_collected` 6 -> 9.
- **The 1,000,000 Cr licence** [read]: the player's licences gained `militaryequipment` for `bountyhunters` (15:53: `transgalmeg` only). SWI's `factions.xml` prices it at exactly 1,000,000 (`minrelation` −0.01). The next one, the guild's `militaryship` licence, costs 3,000,000.
- **The +133,858 from the HQ**: no ticker line says what it was. The items that left the inventory since 15:53 (counting what was picked up) are Advanced Targeting Module 6 (avg 10,056 each), Secure Container 6 (4,561), Basic Seminar (Management) 2 (4,620), Lost Fragment 6 (738), Rapid Sand Filter 4 (791), Durasteel Frame 3, Modular Trigger 1, Alien Ingredients 7. At vanilla average prices the first five alone come to about 104,500 [read prices; inferred sum], so an item sale to a trader at the HQ fits the 133,858. Some may have gone into crafting instead [unverified].
- Inventory now also holds the loot that wasn't sold: Interface Unit 105 (was 50), Micro-Gimbal 15 (was 2), Security Slicer 4, Security Bypass System 1, Advanced Weapon Chamber (`modpart_weaponchamber_t2`) 1, Seminar Piloting 1-star 2, Seminar Management 1-star 1, Remote Detonator 2, High Energy Catalyst 2, Nividium Crystallite 5, Spacefly Eggs 26.

## 2. Hunt 11

### Pay [read]

- Logbook (31,698.749): "Reward for HTP Mercenary Y-wing BTL-BP (BQL-614) kills: 37,150.00 Cr. Your Engagements: 1 x S ship (kills: 1). Reward for … destruction: 91,893.84 Cr. Total reward: 129,043.84 Cr." `money="12904384"`; `$RewardCr` 12904384.
- Offer: `$RewardText` (string 67456) "Reward: 34,470.00 Cr + up to 86,830.00 Cr", the same as the player saw. Updated text (string 69531): "Reward: 37,150.00 Cr + up to 91,893.84 Cr". Unlike hunt 10, `$RewardText` still points at the offer text.
- **Kills part rose** from 34,470 to 37,150 (+7.8%), the re-roll when the Destroy step started (em-scan-and-wing-damage.md). 37,150 = 0.5 x 74,300, one S-class roll for the target's one recorded S kill [inferred].
- **Destruction 91,893.84 is more than the "up to" 86,830**: 91,893.84 = 0.971779 x 75,650 x 1.25 (the player-kill bonus). The implied S roll at debrief, 75,650, is lower than the offer's 86,830 roll; the 1.25 bonus more than made up for it [inferred arithmetic, per em-scan-and-wing-damage.md].
- Result text (string 69530): "1 killed / 1 x Y-wing BTL-BP: your kills: 1, your damage: 97.1779 / 100: 45,946.92 Cr." The per-ship line is half the destruction pay, as in hunts 8 and 10.
- `$CappedRewards` (table 36936): `$RewardForPlayerKills` 91,893.84, `$RewardForTarget` 37,150.00. `$BaseRewardData` (29318): `$reward_forTarget` 91,893.84, `$reward_forTargetKills` 37,150.00. `$PlayerDamageAndKillsData` (36935): `$difficulty_max` **easy** (hunt 10: medium), `$reward` 91,893.84.

### Damage share [read / inferred]

- `$DamageAndKillsList` (list 111628) has one record, table 29319: `$enemy` `[0x67a21]`, `$idCode` "BQL-614", `$name` "HTP Mercenary Y-wing BTL-BP (BQL-614)", `$faction` huttpirates, `$class` ship_s, `$macro` ywing_btlbp_macro, `$size` 22.59 m, **`$damage_total` 97.1779**, `$isPlayerKilled` 1, `$killer` "R-41 Starchaser", `$hull` 0.
- **97.18%, not 44% as in hunt 10**: the target wasn't disguised, so the damage counter started when the target was found, before the fight (em-scan-and-wing-damage.md section 2) [read code, inferred here]. The missing 2.8% is unexplained; the likely cause is the first hull hit arriving with no recorded attacker (EM 9465-9481) [inferred].
- As before, the save has no per-ship split: `$damage_total` is one number for the player's side.

### The target [read]

- Mission vars (cue 827233): `$Faction` commerceguild, `$OpposingFaction` huttpirates, `$kProfs_targetFaction` huttpirates, `$EnemyFactions` (list 74757) = [huttpirates], **`$IsDisguised` empty (false)**, `$MissionTarget` `[0x67a21]`, `$TargetSector` `[0x6799e]` (Smuggler's Run), `$Difficulty` medium, `$MissionGroup` bountyHunters_guild, `$kEMissionType` 106, `$MissionId` "kEM_Hunt_449", `$RewardNotoriety` 0.004, `$Result` success, `$isTargetAttackedByPlayer` 1, `$timer_find_end` 42,291.066. Cue time 30,539.037 (accept).
- `$idCode` (string 68335) "BQL-614", find beacon "(Report of BQL-614, 04h 30min 18s ago)".
- **Wreck (line 12804110)**: `ywing_btlbp_macro`, `state="wreck"`, code **BQL-614**, owner **huttpirates**, spawntime 0 (a game-start ship). **`attacker="[0x62b05]"` = RBQ-989 (wingman Romin Riano), `hitbybullet`, 31,529.182.** No `cover` attribute. Its weapons: 2 x `weapon_ix4_s_laser_macro` (never fired), a `weapon_sw4_s_laser_macro` turret (last shot 31,528.41), 2 x flex missile launchers (last shot 9,288). Only the player has a `killed` listener on it.
- **Where**: `swi_clustersmugglersrun_sector001_macro` (owner ownerless), zone 003 (KJA-955). The briefing's "last seen in Smuggler's Run" was right.
- **Escort: none.** No ship links to it. Another HTP Y-wing BTL-BP, **LDZ-187**, is alive in the same zone (hull 13,526, order Plunder, spawned 29,656.8); it killed the ICG repair ship BKR-433 (`cis_repair_macro`) with a missile at 31,428.84, 100 s before the fight. It isn't the target's wingman and no player ship hit it.

### The fight [read]

- `$timer_find_end` 42,291.066 = find + 3 h, so the target was found at about **31,491** [inferred]; the logbook has "Travel Mode aborted" 31,491.9 and "Scan Mode activated" 31,512.4.
- Last weapon shots: LOD-387 31,500.86 (lasers); NOM-811 31,516.6; BCY-548 31,518.7-31,528.0; RBQ-989 31,528.4-31,529.1. **All four fired; RBQ-989 made the kill.** The target hit LOD-387 at 31,528.619, 0.6 s before it died; that's likely LOD-387's hull loss [inferred]. No missiles fired.
- Player gunnery stats: `bullets_fired` 2,246 -> 2,398, `bullets_hit` 1,471 -> 1,508 (both include the Gizer clash below).
- Pickup in Smuggler's Run at 31,577.8 (+12,364 Cr, Tuning Software 2, Micro-Gimbal 2), 49 s after the kill: probably the target's drop [inferred].

### Debrief and client [read]

- `$MissionContact_NPC` `[0x81aebe3]` = **Torb Teller** (JBO-537, commerceguild), in the **Situation Room** of **HIH-890** (commerceguild station `[0x250b3]`), **Ryloth** (`swi_clusterryloth_sector001_macro`, owner commerceguild). `lastspeaktime` 31,710.2. `$Client` `[0x250b8]` = Manda Mellerd (commerceguild). `$MissionOffer_Station` is also HIH-890, though the player took the mission at the Milagro HQ: the guild board shows offers whose station is elsewhere [inferred].
- At save time the player is in LOD-387's cockpit, docked at HIH-890.
- Stats: `missions_accepted` 10 -> 11, `missions_completed` 6 -> 7.

## 3. Reputation since 15:53 [read]

| Time | Faction | Change | Now | Reason |
|---|---|---|---|---|
| 31,698.749 | **Independent Commerce Guild** | **+3** | **9** | Mission Completed (hunt 11). Booster `commerceguild` 0.00467716 (since 11,433.4) -> 0.00867716 |

- No other relation or booster changed. No sanction or "lost reputation" entry in the logbook or ticker.
- +3 for a 129k hunt; hunt 10 gave Ascendancy +2 for 373k, hunt 8 +5 for 93k. Pay and rep don't track each other [read].

## 4. Fleet [read]

`ships_owned` 4. All four `r41_macro` are in Ryloth zone 003 (QZF-110). R-41 max hull is 7,150 (`r41_macro.xml`).

| Ship | Where | Hull | Missiles | Pilot (piloting, morale) | Order |
|---|---|---|---|---|---|
| **LOD-387** (player's) | docked at HIH-890 | **6,667 (93%)** | 8 | Val Motoli (4, **9**; was 6) | Wait (default), Fleet 2, 3 subordinates |
| RBQ-989 | in space | full | 8 | Romin Riano (4, **7**; was 6) | Escort, group 1 |
| NOM-811 | in space | full | **6** | Basten Fisty (6, 6) | Escort, group 1 |
| BCY-548 | in space | full | 8 | Renda Caren (5, 4) | Escort, group 1 |

- "Full" = no `<hull>` element, as before [inferred from the format].
- NOM-811's two missiles were fired in hunt 10 (launcher `lastshottime` 27,957.033); none of the four has fired one since, and none restocked.

## 5. Other events

### The Chardaan battle [read]

Chardaan (`swi_clusterchardaan_sector001_macro`) is New Republic space at both saves. Wrecks from 28,395 to 29,194, the window of the player's pickups:

| Time | Wreck | Owner | Killed by |
|---|---|---|---|
| 28,395.0 | Velox CWW-775 (L) | ascendancy | `[0x6b28b]` (gone) |
| 28,706.6 | Pelta RDZ-150 (L) | newrepublic | Procursator WQS-008 |
| 28,812.9 | Velox MZR-884 (L) | ascendancy | NR dreadnaught NOA-131 |
| 28,860.1 | Velox IZL-830 (L) | ascendancy | NOA-131 |
| 28,882.3 | **Procursator WQS-008 (XL)**, spawned 27,938.8 | ascendancy | Fulgor VPT-384 (Ascendancy's own ship: last hit was friendly fire) |
| 28,983.4 | Fulgor VPT-384 (L) | ascendancy | NR dreadnaught BPL-795 (itself died later in Pax, 31,036.9) |
| 29,023.8 | ETA supply barge ICN-467 (L) | ascendancy | NR X-wing WDT-833 (missile) |
| 29,138.6 | Kontos GPI-108 (L) | ascendancy | NOA-131 (collision) |
| 29,193.9 | **Defence Platform NKL-642** (station), built 28,546.6 | ascendancy | NR CR90 PRJ-189. News: "Imperial Ascendancy station in Chardaan was destroyed" |

- An Ascendancy push into NR-held Chardaan that the New Republic wiped out. Live ships there now: 56 NR, 10 Baobab, 6 Twin Suns, 3 Ascendancy.
- **No player ship hit anything in Chardaan** (no `attacker` pointing at the four R-41s). The player only scavenged the drops, many from big Ascendancy hulls, which is why the cash was so high.

### Clash with an NPC bounty hunter in Gizer [read]

- **NKU-627**, a `razorcrest_macro` owned by **`indibhg`** (SWI's hidden "Bounty Hunter" / "Individual Bounty Hunters" faction, allied to `bountyhunters`), pilot **Marelle Loma**, default order `SWBountyHunterFighters`, hull 42,000. Alive in Gizer (`swi_clustergizer_sector001_macro`, Mandalorian Death Watch space), zone 004.
- NOM-811's lasers fired at 30,609.8; LOD-387 hit NKU-627 (two engines) at 30,620.1-30,621.0; NKU-627 hit BCY-548 at 30,646.2. No wrecks, no hull loss left on the escorts.
- No rep change: the player has no relation entry for `indibhg`. Who started it isn't recorded [unverified]. Worth noting for the mod: SWI's own NPC hunters roam, and the player's wing can end up fighting them.

### Other [read]

- Travel: 13 gates (224 -> 237), 4 new sectors (75 -> 79).
- The logbook has only two mission or rep entries since 15:53 (hunt 11's pay and rep). EM logs results only, not accepts.

## Unverified

- What the +133,858 from the Milagro HQ was (item sale fits; no ticker line names it).
- Why hunt 11's damage share is 97.18, not 100.
- Who opened fire in the Gizer clash with NKU-627.
- Whether LOD-387's 483 hull loss is all from BQL-614's last shot.
