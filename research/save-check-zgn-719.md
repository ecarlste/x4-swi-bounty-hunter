# Save check: hunt 8 turn-in, "Search and destroy: TST Mercenary Weequay (ZGN-719)"

Save: `save_008.xml.gz` (file time 2026-11-04 14:07 MST), `<save name="BBH - Test 2">`, game time 26,781.744, X4 8.00 (build 590967) + SWI 0.90, player "Bobby the Fat". It was copied to the scratch folder as `save_008-hunt8.xml.gz` and unpacked. The save folder was not touched. Line numbers are from the unpacked file (`zcat | sed -n`). Tags: [read] = seen in the save, [inferred] = reasoned, not tested.

## Sources

- `<player money>` (line 7) and `<stats>` (`money_player`, `ships_owned`, `ships_claimed`, `missions_*`).
- Logbook `<log>` (lines 22643287-22643510): reputation and mission-pay entries only. `money` attributes there are in cents.
- Ticker `<tickercache>` (lines ~22643519-22643621): game time 25,659 to the save only.
- **Player money log** `<economylog><entries type="money">` (lines ~22643121-22643179). Each entry's `v` is the **balance after the event, in cents**; `type` is `script_add` (mission pay), `transfer`, `collect` (loot sold on pickup) or `sellship`; `partner` is the other party. This is the only place the ship sales and purchases show up. Amounts below are the differences between consecutive balances.
- Ship components (R-41s, wrecks), the hunt's Emergent Missions cue instance (`Mission_Hunt...`, vars from line ~25097520) and its string/table refs.
- SWI 0.90 `ext/t/0001.xml` and `ext/libraries/factions.xml` for faction names; vanilla 8.00 `t/0001-L044.xml` page 20102 for station type names.
- Helpers: `research/save-read-scripts/anc.py` (ancestors) and `gates.py` (routes).

## Short answer

1. **Balance: 1,550,089 Cr** [read]. Up from 631,379 after hunt 6, mostly from loot sold on pickup (about 1,050,000 Cr in all) and three ship sales.
2. **Hunt 8 paid 93,113.36 Cr: kills 9,502.50 + destruction 83,610.86**, at game time 26,751.878 (ticker payment 26,751.95). "Your Engagements: 1 x M ship (kills: 1)". Plus +5 Ascendancy rep (-> 7). [read]
3. **The target was disguised.** The ship was really **JJO-747, a `weequay_macro` owned by `valarian` (Pirate Syndicates, "PIR")**, and the mission showed it as "TST Mercenary Weequay (ZGN-719)": `$IsDisguised = 1`, `$idCode` = "JJO-747", the find beacons read "(Report of JJO-747 …)". **TST = Twin Suns Transport Services** (SWI faction `twinsuns`). A real, unrelated New Republic X-wing called ZGN-719 is alive in Thyferra. [read]
4. **It died in Wroona** (Ascendancy), at 26,012.562, **killed by the wingman R-41 RBQ-989 (pilot Romin Riano)**, not by the player. The mission still counted "your kills: 1". [read]
5. **Wing:** no live escort. One probable escort, Z-95 HVO-391 (`valarian`), died earlier (25,824.7) to a New Republic X-wing. [inferred]
6. **Ship trades, all at TransGalMeg Wharf MEV-790 in Mataou:** sales of +551,454 (24,293.9), +949,875 (24,584.6) and +408,169 (26,462.1, the TIE bomber). R-41 buys: −1,759,750 for two (24,379.0) and −975,199 for the third (24,635.6). Which of the first two sales is the Y-wing and which is the Fortitude isn't recorded; by order, 551,454 = Y-wing and 949,875 = Fortitude. [read / inferred]
7. **Surprises:** no −60k hull-repair charge exists in the money log; the station-defence "50,000" rewards are **500 Cr** (the field is in cents); and the TIE bomber was sold remotely: it's now TransGalMeg's, being flown to recycling from Kriselist.

## 1. Balance [read]

`<player name="Bobby the Fat" … money="1550089"/>`; `stat money_player` 1550089; the last money-log entry is `script_add` 26,751.878, v = 155008900.

## 2. Hunt 8 [read]

- Logbook (line 22643509, 26,751.878): "Reward for TST Mercenary Weequay (ZGN-719) kills: 9,502.50 Cr. Your Engagements: 1 x M ship (kills: 1). Reward for … destruction: 83,610.86 Cr. Total reward: 93,113.36 Cr." `money="9311336"`.
- Ticker: "Reputation gained: - +5 / Faction: Imperial Ascendancy / Reason: Mission Completed / Current reputation: 7" (26,751.878); "Payment received: 93,113 Cr / New balance is 1,550,089 Cr" (26,751.95).
- Offer (ref 67042): "Reward: 8,832.50 Cr + up to 216,660.00 Cr". So the kills part grew a little (8,832.50 -> 9,502.50), and destruction paid 39% of the "up to".
- Final mission text (ref 69185): "1 killed / 1 x Weequay Corvette: your kills: 1, your damage: 32.9193 / 100: 41,805.43 Cr." Destruction pay 83,610.86 is exactly 2 x 41,805.43. The damage table (ref 21816) has hitpoints 32.9193 for target `[0x403e57b]`, class ship_m, faction valarian. So the player's side did a third of the damage and still got full kill credit.
- Cue instance 799876 (`state="complete"`, created 25,410.734): `$Faction` ascendancy, `$OpposingFaction` valarian, `$MissionTarget` `[0x403e57b]`, `$TargetSector` `[0x416dc4f]` (Wroona), `$Difficulty` medium, `$MissionGroup` bountyHunters_guild, `$kEMissionType` 106, `$MissionId` "kEM_Hunt_346", `$RewardNotoriety` 0.004, `$timer_find_end` 36,628.649, `$Result` success. `$MissionContact_NPC` `[0x12023920]` = **Ivan Green** (HWL-650, ascendancy), in the War Room of station HZK-086 (`{20102,1041}`, vanilla "Defence Platform"), Kira sector, Ascendancy. `lastspeaktime` 26,772.1. `$Client` = John Davis (`[0x161d756c]`, manager of station SSG-331 in Wroona).
- The created time 25,410.7 is the game time the cue started (the offer or accept; the user notes about 13:44 real time).

### The target and where it died [read]

- Wreck (line 9177505): `ship_m weequay_macro`, `state="wreck"`, code **JJO-747**, owner **valarian**, id `[0x403e57b]`, spawntime 11,781.6. `attacker="[0x240383ca]"` = player R-41 **RBQ-989**, `hitbybullet`, **26,012.562**. Self-destructs at 27,812.1.
- Ancestors: cluster `swi_clusterwroona_macro` -> sector `swi_clusterwroona_sector001_macro` (owner `ascendancy`) -> `tempzone` LJT-094 `[0x181b7d0e]`.
- No `cover` attribute on the ship: the "TST" disguise is the mission's (`$IsDisguised`), not a faction cover.
- JJO-747 is the `attacker` on all three player R-41s (25,904.9 on LOD-387, 25,981.3 on RBQ-989, 25,992.8 on NOM-811). Only the wingmen's guns fired in the last seconds (lastshottime ~26,011.9-26,012.0 on both wingmen; LOD-387's guns 26,009.8).
- The live ZGN-719 (line 11265412) is a `t65xj3_xwing_macro`, newrepublic, in a Thyferra tempzone, id `[0x406450a]`: not the target. The disguise borrowed (or happened to reuse) a real code.

### Wing or escorts

- The wreck itself keeps no subordinate or commander data. No live ship has an Escort order targeting `[0x403e57b]` (every reference to the id is a wreck attacker, a mission var or a listener). [read]
- The Z-95 wreck HVO-391 (line 9159304, `valarian`, spawntime 21,154.3) in Wroona zone 003 has JJO-747 as a `killed` listener: that's what a wing leader registers for its wingmen [inferred]. It was killed at 25,824.7 by `[0x214e508]`, the New Republic X-wing PCP-756 (itself a wreck at 25,838.1). So the Weequay probably had one Z-95 escort, which New Republic killed before the player's fight. [inferred]
- Other `valarian` ships alive in Wroona (V-19 BEV-883, Z-95 HHC-848, Gozanti raider QDA-399) show no link to the target. [read]

## 3. TST [read]

SWI `0001.xml`: `526110` "Twin Suns Transport Services", `526120` "TST" (faction `twinsuns`, a small neutral shipping company). The real owner `valarian` is `513110` "Pirate Syndicates", short "PIR".

## 4. Ship sales and purchases [read, except where marked]

Money log, balance deltas. `[0x2154e2e]` = **MEV-790, TransGalMeg Wharf** (`{20102,1081}`), Mataou (`swi_clustermataou_sector001_macro`, owner anoat). `[0x2155223]` = RUN-537, TransGalMeg Shipyard (`{20102,1071}`).

| Game time | Type | Partner | Amount (Cr) | Balance after | What |
|---|---|---|---|---|---|
| 23,315.259 | transfer | MEV-790 | +500 | 1,153,245 | Station defence reward, +1 TransGalMeg rep (logbook) |
| 23,401.061 | transfer | MEV-790 | −9,230 | 1,144,015 | Unknown (repair or resupply?) |
| 23,457.857 | transfer | MEV-790 | +357,839 | 1,501,854 | Unknown. Not a `sellship`. Maybe a refit credit (removing the Y-wing's gear) or a ware sale [inferred] |
| 23,835.390 | transfer | RUN-537 | −150,000 | 1,351,854 | Unknown. A flat sum at the shipyard: a licence or a refit? |
| 24,293.891 | **sellship** | MEV-790 | **+551,454** | 1,903,308 | Y-wing [inferred, by order] |
| 24,378.955 | transfer | MEV-790 | **−1,759,750** | 143,558 | Two R-41s (LOD-387 spawned 24,378.999, NOM-811 24,379.143): 879,875 each if equal |
| 24,584.624 | **sellship** | MEV-790 | **+949,875** | 1,093,433 | Fortitude VVB-886 [inferred: sold after the player moved into an R-41; the playtest log has the Fortitude sale with the third R-41] |
| 24,635.554 | transfer | MEV-790 | **−975,199** | 118,234 | Third R-41 RBQ-989 (spawned 24,635.613). 95,324 more than the first two each; RBQ-989 alone carries 2 x `eq_arg_satellite_02_macro`, which explains part of it at most [inferred] |
| 26,462.086 | **sellship** | MEV-790 | **+408,169** | 1,456,976 | TIE bomber (the only sale during hunt 8; follows "Active tool: Repair Laser" at 26,364.98) |

- The `sellship` entries don't name the ship. Both the Y-wing and the Fortitude are gone from the save (`ships_owned` 3, `ships_claimed` 2) [read]; which sale was which is inferred from order.
- **The sold TIE bomber** (line 2709748): `tie_bomber_macro` ZFX-808, now `owner="transgalmeg"`, `capturable="0"`, no `<hull>` element (full hull), spawntime 8,854.9. It's in Kriselist zone 003 (`swi_clusterkriselist_sector001_macro`, anoat) with a TransGalMeg pilot (Vendy Jorwan) on a `Recycle` order. So the player sold it remotely to the Mataou wharf and the buyer is flying it there to recycle [inferred]. Kriselist is 3 jumps from Wroona (Wroona -> Yag'Dhul -> Kinyen -> Kriselist). Where it was found isn't recorded; Kriselist is the likely spot [inferred].
- Abandoned TIE bombers near Wroona: an Ascendancy TIE bomber wreck HJI-373 (line 9158304, killed by NR X-wing PCP-756 at 25,791.1) is a separate ship.

### The money in between (for the log)

- 631,379 after hunt 6 (18,076.7). Then **no debit until 23,401**: the **~60k hull repair (real time 11:25-11:29) is not in the money log** [read]. Either it was free, paid some way the log doesn't keep, or happened in a timeline later reloaded (`savegames_loaded` 7) [inferred].
- Loot sold on pickup (`collect`): 21,935.8-22,229.9 **+521,620** (the Y-wing battlefield, about 12:30-12:51); 25,777.6-26,292.9 **+930,573** (hunt 8's battlefield: single pickups of 74,000-117,746 Cr, e.g. a Damaged Hyperdrive Core 117,746, Security Slicer 93,484, Secure Container 92,356) [read]. Hunt 6's pickups paid about 5,000 each, so these are 15-20 times bigger.
- The logbook's "Rewarded for station defence" `money="50000"` is 500 Cr (cents), confirmed by the money log (+500 at 23,315). [read]

## 5. The player's ships [read]

`ships_owned` 3: all `r41_macro`, all in Kira (`swi_clusterkira_sector001_macro`, Ascendancy), zone 002 `[0x161fe425]`. None has a user name.

| Ship | Id | Where | Pilot (`aipilot`) | Order | Other crew |
|---|---|---|---|---|---|
| **LOD-387** (player's) | `[0xa09d05a]` | docked at HZK-086 (Ivan Green's station) | Val Motoli (piloting 4, morale 6); the player is in it (`playerpilot`, `lastcontrolled`) | Wait (default, allowdocked); `fleet name="Fleet 2"`; `<subordinates><group index="1" assignmment="attack"/>`, two `subordinates` connections | |
| **RBQ-989** | `[0x240383ca]` | in space, same zone, position (-15,861, -5,083, 15,875) | Romin Riano (piloting 4, morale 6) | **Escort `[0xa09d05a]`**, default, started, pointguard formation 820 m, pursue 40 km; `subordinate group="1"` | 1 marine (boarding 1) |
| **NOM-811** | `[0x100a857e]` | in space, same zone | Basten Fisty (piloting 6, morale 5) | **Escort `[0xa09d05a]`**, default, started, pointguard 796 m, pursue 40 km; `subordinate group="1"` | 1 marine (boarding 1) |

So both wingmen are crewed and set as wingmen of the player's ship (group 1, "attack" assignment), holding formation in space while the leader is docked. Pilot skills here are on the save's 0-15 scale (about 1-2 stars) [inferred].

**Loadout, identical on all three:**

- Lasers: 2 x `weapon_ix4_s_laser_macro`, 2 x `weapon_kx5_s_laser_macro`.
- Missiles: 2 x `weapon_hm6launcher_macro`; ammo 8 x `missile_concussion_light_macro`. **No missiles fired** (launcher `lastshottime` = spawn time; `missiles_fired` 0).
- Shields: 2 x `shield_s_cec1077_macro` (not the R-41's own `shield_s_zr41_macro` seen on NPC R-41s).
- Engines: 4 x `engine_incom_macro`. Thrusters `thruster_gen_s_allround_01_mk3_macro`.
- Also 8 flares each; RBQ-989 has 2 satellites. Software: docking mk2, long-range scanner mk2, object scanner mk2, targeting mk1, trading mk1.

**Hull:** none of the three has a `<hull>` element. Damaged ships in this save carry one (e.g. `<hull value="62760.988"/>`), so all three are at **full hull** [inferred from the format], despite JJO-747 hitting each of them.

## 6. Reputation from hunt 8 [read]

- **+5 Imperial Ascendancy, Mission Completed, now 7** (26,751.878). `max_faction_relation` stat 7.
- No loss and no "Unauthorised Kill" after 18,035.9: killing a `valarian` (pirate) ship in Ascendancy space cost nothing, unlike Fett in hunt 6.
- In the same play stretch, not from hunt 8: +1 TransGalMeg Industries (`{999840,524110}`), "Destroyed Enemy", now 1, with the 500 Cr station-defence reward (23,315.3).
- No sanction entries (none in the logbook or ticker).

## 7. Hunts 5 and 7 (dropped) [read]

- **No cost found.** The logbook has no reputation loss after 18,035.9 (hunt 6's Fett kill), and the money log has no debit that matches a penalty (the only debits are −9,230, −150,000 and the R-41 buys, all at TransGalMeg). Mission aborts in EM appear not to fine or cost rep.
- Stats: `missions_accepted` 8, `missions_completed` 5 (hunts 1, 2, 4, 6, 8). The 8 accepted fit hunts 1, 2, 4, 5, 6, 7, 8 plus the Lawlessness mission [inferred].
- Hunt 5's target SGP-611 is still alive, now in Beliasa (`swi_clusterbeliasa_sector001_macro`, New Republic), line 8459969.

## Unverified

- Which of the 551,454 and 949,875 sales was the Y-wing and which the Fortitude (order-based guess only).
- What the +357,839 (23,457.9) and −150,000 (23,835.4, RUN-537 shipyard) transfers were.
- Why the third R-41 cost 95,324 more than the first two.
- Whether the Z-95 HVO-391 was JJO-747's wingman (based on the `killed` listener only).
- Where the TIE bomber was found and repaired.
- The real-time mapping of game times (roughly 18,082 = 11:11 and 26,782 = 14:07; reloads make it uneven).
