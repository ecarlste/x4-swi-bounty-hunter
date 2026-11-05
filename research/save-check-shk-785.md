# Save check: hunt 12 turn-in, "Search and destroy: CSA Border Control ARC-170 (SHK-785)"

Save: `quicksave.xml.gz` (file time 2026-11-04 17:53 MST), `<save name="BBH - Test 2">`, game time 34,949.752, X4 8.00 (build 590967) + SWI 0.90, player "Bobby the Fat". It follows [save-check-bql-614.md](save-check-bql-614.md) (quicksave at 16:55, game time 31,738.917, 1,042,288 Cr). The quicksave was copied to the scratch folder as `qs-shk785.xml.gz` and unpacked; the save folder was not touched. Line numbers are from the unpacked copy. Tags: [read] = seen in the save, [inferred] = reasoned, not tested.

Component ids are renumbered on every save. Match ships by code, not id. In this save: NOM-811 `[0x62b20]`, RBQ-989 `[0x62b05]`, BCY-548 `[0x62aea]`, LOD-387 wreck `[0x62ac9]`, SHK-785 wreck `[0x2aaec]`, player `[0x62adb]`.

## Sources

- `<player money>` (line 7), player faction `<relations>`, boosters and `<licences>` (line 1137), `<stats>` (23047207), player inventory (7111960-7112008).
- **Money log** `<economylog><entries type="money">` (from line 23047096): `v` = balance after, in cents.
- Logbook `<log>` (23047312) and ticker (from 23047621; it starts at 34,031, so the first eight pickups have no ticker lines).
- Jabiim fight wrecks (5209017-5210218), Val Motoli's spacesuit (5241296), the fleet (NOM-811 7086947, RBQ-989 7087431, BCY-548 7096834), the player (7111937).
- Emergent Missions cue instance for hunt 12: `<cue id="793076" state="complete" time="32458.01">` (vars 25597295-25597369). md refs: `string` 23047724, `list` 23057484, `group` 23809877, `table` 24044514.
- Helpers: `research/save-read-scripts/anc.py`, `gates.py`, and a throwaway wreck lister (every `state="wreck"` ship or station with its sector, `attacktime`, `attacker` resolved to code/macro/owner, and `attackmethod`).

## Short answer

1. **Balance: 4,225,107 Cr**, +3,182,819 since 16:55 [read]. **+1,414,087 Cr cash from 25 pickups** (two probably in Jabiim, the rest on the Boonta battlefield) and **+1,768,732.48 for hunt 12**. No sales, no purchases: the money log holds only `collect` entries and the hunt's `script_add`. All looted items are still in the inventory.
2. **Hunt 12 was not disguised.** SHK-785 is a real Corporate Sector Authority (`corporate`) `arc170_macro`, a game-start ship, leading three more ARC-170s (LFB-648, UJY-132, OXP-379). Offered from ICG factory BLC-365 in Boonta; accepted at 32,458.0. **Found and fought in Jabiim (CSA space) from about 33,499; killed at 33,644.036 by wingman NOM-811 (Basten Fisty).** Debrief with Ninu Gusta in the War Room of ICG trade station NYA-677, Mongazza, at 34,869.2. **Pay: kills 1,669,595.04 + destruction 99,137.49 = 1,768,732.48; damage 100 / 100.** [read]
3. **Lost: LOD-387, the old flagship**, destroyed in Jabiim at 33,498.923 by a missile from **UJY-132**, one of the target's wingmen. Its pilot **Val Motoli bailed out and is still alive in a spacesuit in Jabiim, with oxygen running out at 35,283** (333 s of game time after the save). [read]
4. **Rep: Corporate Sector Authority +1 -> −8** from four "Unauthorised Kill" losses (−2, −3, −2, −2), one per ARC-170 killed. **Independent Commerce Guild +2 -> 11**, Mission Completed, which unlocked the "Known Associate" discount (Very Small) and an ICG `station_gen_intermediate` licence. No fine or other sanction logged. [read]
5. **Fleet: 3 R-41s, all in Mongazza.** BCY-548 (now the flagship, docked at NYA-677) at 3,045 / 7,150 hull (43%); **NOM-811 at 615 (9%)**; RBQ-989 at 6,961 (97%). [read]
6. **The battlefields are the ICG-CSA war.** Boonta (ICG space, next to Jabiim) had 131 wrecks since 31,690, ICG and CSA capital ships among them; Jabiim, Kubindi and Eadu are the same war. [read]

## 1. Money since 16:55 [read]

| Game time | Type | Amount (Cr) | Balance after | What (ticker, where known) | Where |
|---|---|---|---|---|---|
| 31,698.749 | script_add | | 1,042,288 | Hunt 11 (the 16:55 baseline) | |
| 33,696.568 | collect | +7,459 | 1,049,747 | (before the ticker) | Jabiim? [inferred] |
| 33,701.816 | collect | +6,385 | 1,056,132 | | Jabiim? [inferred] |
| 33,807.887 | collect | +10,780 | 1,066,912 | | Boonta [inferred] |
| 33,859.751 | collect | +7,343 | 1,074,255 | | Boonta |
| 33,966.310 | collect | +5,565 | 1,079,820 | | Boonta |
| 33,999.191 | collect | +8,385 | 1,088,205 | | Boonta |
| 34,057.850 | collect | +7,987 | 1,096,192 | Interface Unit 21 | Boonta |
| 34,080.263 | collect | +9,052 | 1,105,244 | Useful Scrap 29 | Boonta |
| 34,160.749 | collect | +83,676 | 1,188,920 | Micro-Gimbal 7 | Boonta |
| 34,163.883 | collect | +78,739 | 1,267,659 | Useful Scrap 6 | Boonta |
| 34,167.979 | collect | +18,224 | 1,285,883 | Seminar for 3-Star Crew (Management) 1 | Boonta |
| 34,168.453 | collect | +96,517 | 1,382,400 | Micro-Gimbal 5 | Boonta |
| 34,169.263 | collect | +99,350 | 1,481,750 | Hydraulic Pump 7 | Boonta |
| 34,176.031 | collect | +77,608 | 1,559,358 | Micro-Motor 4 | Boonta |
| 34,209.783 | collect | +8,876 | 1,568,234 | Micro-Motor 2 | Boonta |
| 34,282.173 | collect | +6,913 | 1,575,147 | Useful Scrap 5 | Boonta |
| 34,360.487 | collect | +79,015 | 1,654,162 | Micro-Gimbal 5 | Boonta |
| 34,364.687 | collect | +105,528 | 1,759,690 | Micro-Motor 4 | Boonta |
| 34,364.710 | collect | +103,843 | 1,863,533 | Useful Scrap 6 | Boonta |
| 34,365.093 | collect | +103,446 | 1,966,979 | Micro-Gimbal 12 | Boonta |
| 34,369.671 | collect | +113,575 | 2,080,554 | Advanced Targeting Module 6 | Boonta |
| 34,371.420 | collect | +98,758 | 2,179,312 | Micro-Gimbal 12 | Boonta |
| 34,402.418 | collect | +88,002 | 2,267,314 | Interface Unit 21 | Boonta |
| 34,405.706 | collect | +85,393 | 2,352,707 | Useful Scrap 27 | Boonta |
| 34,408.367 | collect | +103,668 | 2,456,375 | AGI Neural Network 2 | Boonta |
| 34,869.177 | script_add | **+1,768,732.48** | 4,225,107 | Hunt 12. Ticker "Payment received: 1,768,732 Cr" at 34,869.268 | Mongazza |

- **Loot: 1,414,087 Cr cash in 25 pickups**, 33,696-34,408. `drops_collected` 125 -> 175, `illegal_drops_collected` 9 -> 10. The ticker also shows drops with items and no cash (Advanced Weapon Chamber, Durasteel Frame, Useful Scrap, Modular Trigger 15, Micro-Motor 15, Advanced Ship Nanoweave, Extended Fuel Container 3, High Energy Catalyst, Tuning Software 2).
- **Where** [inferred]: the save doesn't store a sector per pickup. Wrecks killed near the player get a real `attackmethod` (`hitbybullet`, `hitbymissile`, `collided`); far from the player they get `lowattentionattack`. After the Jabiim fight, the only such wrecks are in **Boonta, from 33,766 to 34,347** (about 30, ICG and CSA ships). Boonta is next to Jabiim. The 34,160-34,176 run of big pickups (78-99k each) follows the deaths of Arquitens BVO-632 (34,125), ARC-170 XQR-817 (34,161) and the ICG Geonosian cruiser IPH-119 (34,172); the 34,360-34,408 run follows Hardcell frigate CCR-505 (34,333). The first two pickups, 50-60 s after SHK-785 died, are probably the drops of the target's wing in Jabiim, as in hunt 11.
- **No sales**: the inventory only grew. Since 16:55: Interface Unit 105 -> 158, Micro-Gimbal 15 -> 77, Micro-Motor 0 -> 25, Modular Trigger 0 -> 28, Hydraulic Pump 4 -> 17, Advanced Targeting Module 0 -> 6, Useful Scrap (`inv_majaglit`) 49 -> 145, AGI Neural Network (`inv_agidevice_03`) 1 -> 3, Advanced Weapon Chamber 1 -> 4, Extended Fuel Container 11 -> 14, Nividium Crystallite 5 -> 8, Tuning Software 7 -> 9, Programmable Field Array 1 -> 2, Ship Nanoweave t2 1 -> 2, High Energy Catalyst 2 -> 3, Seminar Piloting 0-star 4 -> 5, plus a new Seminar Management 3-star and a Shield Generator Coil t2.

## 2. Hunt 12

### Pay [read]

- Logbook (34,869.177): "Reward for CSA Border Control ARC-170 (SHK-785) kills: 1,669,595.04 Cr. Your Engagements: 1 x S ship (kills: 1). Reward for … destruction: 99,137.49 Cr. Total reward: 1,768,732.48 Cr." `money="176873248"`; `$RewardCr` 176873248.
- Offer: `$RewardText` (string 66480) "Reward: 1,740,507.52 Cr + up to 76,190.00 Cr", as the player saw.
- **Kills part fell** from 1,740,507.52 to 1,669,595.04 (−4.1%), the re-roll when the Destroy step started (em-scan-and-wing-damage.md). The target's recorded kills (string 66478) are "1 x XL ship, 1 x L ship, 1 x M ship, 1.25 x S ships". The XL kill is why an S-class fighter paid 1.67M.
- **Destruction 99,137.49 is above the "up to" 76,190**: 99,137.49 = 1.00 × 79,309.99 × 1.25 (the player-kill bonus) [inferred arithmetic]. The implied roll at debrief is 79,310.
- Result text (string 68864): "1 killed / 1 x ARC-170 Starfighter: your kills: 1, your damage: 100 / 100: 49,568.74 Cr." The per-ship line is half the destruction pay, as before.
- `$CappedRewards` (table 34524) and `$BaseRewardData` (table 21207): forTarget 99,137.49, forTargetKills 1,669,595.04. `$PlayerDamageAndKillsData` (table 34523): `$difficulty_max` **easy**, reward 99,137.49.
- `$DamageAndKillsList` (list 103825) has one record, table 21208: `$enemy` `[0x2aaec]`, `$idCode` "SHK-785", `$faction` corporate, `$class` ship_s, `$macro` arc170_macro, `$size` 34.33 m, **`$damage_total` 100**, `$isPlayerKilled` 1, `$killer` "R-41 Starchaser", `$hull` empty (0).

### The target [read]

- Mission vars (cue 793076): `$Faction` commerceguild, `$OpposingFaction` corporate, `$EnemyFactions` (list 67323) = [corporate], **`$IsDisguised` empty (false)**, `$MissionTarget` `[0x2aaec]`, `$TargetSector` = `$kProfs_missionSector` `[0x29b6d]` (Jabiim), `$Difficulty` medium, `$MissionGroup` bountyHunters_guild, `$kEMissionType` 106, `$MissionId` "kEM_Hunt_467", `$RewardNotoriety` 0.004, `$Result` success, `$isTargetAttackedByPlayer` 1, `$timer_find_end` 44,298.977.
- Find beacon (string 67049): "(Report of SHK-785, 06h 32min 43s ago)": the briefing's last-known position was six and a half hours old.
- **Wreck (line 5209017)**: `arc170_macro`, code **SHK-785**, owner **corporate**, spawntime 0 (a game-start ship). **`attacker="[0x62b20]"` = NOM-811 (Basten Fisty), `hitbybullet`, 33,644.036.** It fired its lasers until 33,644.2 and both guided missile launchers at 33,495.828 (both now empty).
- **Where**: `swi_clusterjablim_sector001_macro` (Jabiim, owner corporate), tempzone CSS-287.
- **Its wing: three ARC-170s**, each with a `killed` listener from `[0x2aaec]` (SHK-785 as their commander) [read; that the listener means commander is inferred]. All four died in the same zone:

| Ship | Spawn | Died | Wreck says | Rep loss |
|---|---|---|---|---|
| LFB-648 | 9,967.7 | 33,514.6 | NOM-811, hitbybullet | −2 at 33,514.99 |
| UJY-132 | 0 | about 33,540.6 [inferred] | OXP-379, `collided` 33,549.1 (`intentionalattacktime` 33,539.8) | −3 at 33,540.66 |
| OXP-379 | 0 | 33,595.3 | NOM-811, hitbybullet | −2 at 33,595.45 |
| SHK-785 | 0 | 33,644.0 | NOM-811, hitbybullet | −2 at 33,644.65 |

- UJY-132's guns last fired at 33,540.54 and the −3 Unauthorised Kill came at 33,540.66, so it most likely died then to a player ship, and OXP-379 hit its wreck later. A wreck's attacker can change after death: LOD-387's wreck names SHK-785 at 33,499.216, after the logbook's death time 33,498.923 [inferred]. Which R-41 killed UJY-132 isn't recorded.

### Timeline [read / inferred]

| Game time | Event |
|---|---|
| 32,458.010 | Mission accepted (cue time). `$MissionOffer_Station` = **BLC-365**, an ICG factory in **Boonta**; `$Client` Daneela Kayean (commerceguild). Where the player stood when accepting isn't recorded; at 16:55 they were in Ryloth, and the guild board lists offers from other stations (save-check-bql-614.md) [inferred]. |
| 33,472.9 | BCY-548 fires its missile launchers |
| 33,495.8-33,496.8 | SHK-785 and UJY-132 fire missiles |
| **33,498.923** | **LOD-387 destroyed** by UJY-132 (logbook) |
| 33,498.977 | UJY-132's missile hits Val Motoli's spacesuit. `$timer_find_end` − 3 h = 33,498.977, the same moment: the target counted as found (the timer is pushed to +3 h on each find) when its wing hit the player's ships [inferred] |
| 33,510.0 | NOM-811 fires 2 missiles (6 -> 4) |
| 33,514.6 | LFB-648 killed (NOM-811) |
| 33,533.8 | Logbook "BCY-548 is under attack" by OXP-379 |
| ~33,540.6 | UJY-132 killed [inferred] |
| 33,595.3 | OXP-379 killed (NOM-811) |
| **33,644.036** | **SHK-785 killed (NOM-811)** |
| 33,766-34,408 | Boonta battlefield and pickups |
| 34,429.8-34,804.8 | Travel mode (the long leg to Mongazza) |
| **34,869.177** | **Debrief and pay** |

- Accept to kill: 1,186 s (about 20 min game time); find to kill: 145 s; kill to debrief: 1,225 s; accept to debrief: 2,411 s.
- **Who started it** isn't recorded. LFB-648 and OXP-379 had already fired missiles at 33,417 and 33,372, before the player's first recorded shot, but Jabiim is an active ICG-CSA war zone, so those could have been at ICG ships [unverified].
- Last weapon shots: LOD-387 33,493.7 (before it died); BCY-548 33,615.3; RBQ-989 33,639.3; NOM-811 33,644.6. **All four R-41s fired; NOM-811 killed three of the four ARC-170s.** Player gunnery stats: `bullets_fired` 2,398 -> 2,494, `bullets_hit` 1,508 -> 1,522 (the player's own guns did little).

### Debrief and client [read]

- `$MissionContact_NPC` `[0x80c8706]` = **Ninu Gusta** (YRE-150, commerceguild), `$MissionContact_Interior` = the **War Room** of **NYA-677** (`[0x3bcd2]`, commerceguild trade station), **Mongazza** (`swi_clustermongazza_sector001_macro`, owner commerceguild). `lastspeaktime` 34,948.7, just before the save. The player is standing in that War Room at save time.
- Stats: `missions_accepted` 11 -> 12, `missions_completed` 7 -> 8.

## 3. The lost R-41: LOD-387 [read]

- Logbook (33,498.923): "R-41 Starchaser (LOD-387) was destroyed. Location: Jabiim. Destroyed by: CSA Star Fighter ARC-170 (UJY-132)."
- Wreck at line 5209969: `r41_macro`, owner now **ownerless**, in Jabiim tempzone CSS-287 with the four ARC-170 wrecks. The wreck's last attacker is SHK-785 at 33,499.216, which is SHK-785 shooting the wreck after the kill [inferred]. Its missile launchers had not fired (still loaded).
- LOD-387 was the flagship at 16:55, and the player sat in it. It went into the fight with Val Motoli as pilot: the player had moved to BCY-548 (`lastcontrolled="[0x62aea]"`), which is now the fleet commander (default order Wait, has subordinates) [read; the switch time isn't recorded]. `time_spacesuit` rose 609 -> 773 s.
- **Val Motoli (YFU-705, piloting 4, morale 9) is alive in spacesuit YEJ-409** (line 5241296, owner player), adrift in Jabiim, spawned 33,498.923. Events: `oxygenlow` 34,983.3, **`oxygenempty` 35,283.348**. Unless he's picked up within about 5.5 min of game time after loading, he dies [inferred from the events].
- `ships_owned` 4 -> 3.

## 4. Reputation since 16:55 [read]

| Time | Faction | Change | Now | Reason |
|---|---|---|---|---|
| 33,514.992 | **Corporate Sector Authority** | −2 | −1 | Unauthorised Kill (LFB-648) |
| 33,540.657 | Corporate Sector Authority | **−3** | −4 | Unauthorised Kill (UJY-132 [inferred]) |
| 33,595.453 | Corporate Sector Authority | −2 | −6 | Unauthorised Kill (OXP-379) |
| 33,644.648 | Corporate Sector Authority | −2 | **−8** | Unauthorised Kill (SHK-785, the bounty target itself) |
| 34,869.177 | **Independent Commerce Guild** | **+2** | **11** | Mission Completed (hunt 12) |

- CSA: base relation 0.001 unchanged; new booster `corporate` −0.007 (time 33,644.648). The player was not at war with the CSA, so **killing the bounty target counts as an unauthorised kill too**. Boosters decay, so −8 should creep back toward +1 [inferred]. −8 is close to the −10 where X4 factions turn hostile [inferred].
- ICG: booster 0.00867716 -> 0.0126772. At 10+ the ICG gave "Discount unlocked: Known Associate, Level: Very Small" (`discounts_unlocked` 0 -> 1) and the `station_gen_intermediate` licence now lists `commerceguild` (was `kamino` only). `max_faction_relation` 9 -> 11.
- Also at 34,869.177: a high-priority message from ICG officer Illisa Donel, "Recruiting Volunteers Against the Corporate Sector Authority" (unread).
- No fine, police or other sanction entry in the logbook or ticker.

## 5. Fleet [read]

`ships_owned` 3. All in Mongazza zone 001 (LRO-264). R-41 max hull 7,150.

| Ship | Where | Hull | Missiles | Pilot (piloting, morale) | Order |
|---|---|---|---|---|---|
| **BCY-548** (player's, `lastcontrolled`) | docked at NYA-677 | **3,045 (43%)** | 8 | Renda Caren (**6**, 4; was 5) | Wait (default), fleet commander |
| NOM-811 | in space | **615 (9%)** | **4** (was 6) | Basten Fisty (**7**, 6; was 6) | Escort, group 1 |
| RBQ-989 | in space | 6,961 (97%) | 8 | Romin Riano (4, 7) | Escort, group 1 |

- BCY-548's launchers last fired at 33,472.9 yet it still holds 8 missiles; it may have restocked while docked [unverified].
- RBQ-989's last attacker is a `collided` at 34,164 (`[0x2a328]`), during the Boonta scavenging.
- Not in the fleet: LOD-387 (wreck) and its pilot Val Motoli (spacesuit, section 3).

## 6. Other events

### The battlefields [read]

The ICG-CSA war along the CSA border. Wrecks since 31,690 (killed by any cause):

| Sector (owner) | Wrecks | Time | Who |
|---|---|---|---|
| **Boonta** (commerceguild) | 131 | 32,337-34,897 | 81 ICG, 49 CSA (+1 Valarian). Big losses: ICG Allocator ZVC-538 (XL, 33,515.5), Munificent OHX-028 (XL, 33,537.9), CIS cruisers YTR-488, NPK-528, escort carrier DZT-647, Hardcell frigates FGP-847, VKL-787, CCR-505, Refractories, Geonosian cruiser IPH-119; CSA Arquitens PCV-224, IXP-218, WYT-926, BVO-632, Proclamator UXG-515, CR70 YKS-064 |
| Kubindi | 138 | 31,836-34,945 | 71 ICG, 66 CSA; an ICG and a CSA factory destroyed; news "ICG Defence Platform in Kubindi destroyed by CSA" (33,086) |
| Jabiim (corporate) | 17 | 32,929-34,636 | ICG escort carrier AAU-284, Recusants RBR-122 and AQX-808 (XL) killed by CSA; the hunt-12 fight |
| Eadu | 31 | 32,088-34,849 | ICG vs CSA, incl. CSA Venators QYG-868 and OYU-628 (XL) |

- The player was on the Boonta field from about 33,766 to 34,347 (wrecks there in that window have real attack methods, section 1). **No player ship hit anything in Boonta**: the only wrecks with a player attacker since 16:55 are the three Jabiim ARC-170s.
- News: "CSA mounting defence in Jabiim" (33,473.6, 33,955.9), "in Boonta" (34,143.8, 34,354.1), "ICG mounting defence in Boonta" (33,048, 33,252).

### NPC bounty hunter in Jabiim [read]

- `indibhg` Lancer `lancer_pursuit_macro` PKK-177 killed NR YT-1300 HTY-584 (34,587.7) and CSA ARC-170s QAC-925 (34,617.6) and DDA-304 (34,635.8) in Jabiim after the player left. SWI's roaming hunters again; no contact with the player.

### Other [read]

- Travel: 27 gates (237 -> 264). Ryloth -> Jabiim is 8 jumps and Jabiim -> Mongazza 9 (via Boonta), by `gates.py`.

## Unverified

- Where the player was when they accepted hunt 12, and which way they flew to Jabiim.
- Who fired first in Jabiim, and which R-41 killed UJY-132; why that kill cost −3, not −2.
- Whether the first two pickups (33,696, 33,701) were in Jabiim.
- When the player switched from LOD-387 to BCY-548.
- Whether BCY-548 restocked missiles.
