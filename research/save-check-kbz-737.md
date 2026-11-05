# Save check: hunts 13 and 14, the HWK-290 and the Guild ship licence

Save: `quicksave.xml.gz` (file time 2026-11-05 13:51 MST), `<save name="BBH - Test 2">`, game time **44,254.223**, X4 8.00 (build 590967) + SWI 0.90, player "Bobby the Fat". It follows [save-check-shk-785.md](save-check-shk-785.md) (quicksave 2026-11-04 17:53, game time 34,949.752, 4,225,107 Cr). The quicksave was copied to the scratch folder as `qs-kbz737.xml.gz` and unpacked; the save folder was not touched. Line numbers are from the unpacked copy. Tags: [read] = seen in the save, [inferred] = reasoned, not tested.

Component ids are renumbered on every save. Match ships by code, not id. In this save: HWK-290 BRX-282 `[0x461c5e85]`, NOM-811 `[0x28028a15]`, NKK-081 `[0x481fa7c0]`, BCY-548 `[0x501a56a2]`, RBQ-989 `[0x361d5fd7]`, player `[0xe075d5f]`, KBZ-737 wreck `[0x420a4292]`, UYK-860 (Guild HQ) `[0x520c677b]`, NYA-677 `[0x501ab57e]`, MEV-790 `[0x214eb7d]`.

## Sources

- `<player money>` (line 7), player faction `<relations>`, boosters and `<licences>` (line 1141), `<stats>` (23297972), player inventory (7048092-7048144), `<messages>` (23298448).
- **Money log** `<economylog><entries type="money">` (from line 23297786): `v` = balance after, in cents.
- Logbook `<log>` (23298077). The ticker (23298461) **starts at 42,377**, so nothing before that has ticker lines.
- Hunt 14's Emergent Missions cue instance: `<cue id="811130" state="complete" time="43255.803">` (vars around 25872560-25872830); its tables `$PlayerDamageAndKillsData` 36496 (line 24429654), `$CappedRewards` 36497 (24563783), `$BaseRewardData` 24144 (24650008), the damage record table 24145 (24434864).
- **Hunt 13's and the extra hunt's cues are gone** (completed mission cues get cleaned up) and so are their target wrecks. Hunt 13 is pieced together from the logbook, the playtest log and the Greater Javin wrecks.
- Ships: NOM-811 (3045836), NKK-081 (3121471), BCY-548 (6998797), RBQ-989 (6999150), HWK-290 BRX-282 (7038637), KBZ-737 wreck (3479645), Greater Javin wrecks (21438887-21464012).
- Helpers: `research/save-read-scripts/anc.py`, `gates.py` (a version that runs several routes in one pass), and throwaway scripts: a wreck lister (every `state="wreck"` ship or station since 34,949 with its sector, `attacktime`, `attacker` resolved, and `attackmethod`; 799 wrecks) and a component-block dumper.
- SWI 0.90 `ext/libraries/wares.xml` (HWK equipment prices and licences), vanilla 8.00 `libraries/wares.xml` (item prices), vanilla `md/playerreputation.xml` (the "stripped of your rank" mail). Licence names and what they unlock come from [licence-costs.md](licence-costs.md).

## Short answer

1. **Balance: 4,202,564 Cr**, −22,543 since 17:53 [read]. In: **3,244,290 Cr cash from 63 pickups**, **994,137 from two payments at ICG trade station NYA-677 in Mongazza** (most likely the stored loot sold [inferred]), **1,730,438 from three hunts**, 1,000 from two station-defence rewards and +83,454 at the Guild HQ. Out: **−3,000,000 for the Guild's `militaryship` licence** and **−1,858,224 for the HWK-290**, both at the Bounty Hunters Guild HQ UYK-860 in Milagro; −9,904 at the HQ (refit? [inferred]); **−1,207,734 for a replacement R-41, NKK-081**, at TransGalMeg Wharf MEV-790 in Mataou.
2. **There were three hunts, not two.** An unlogged one came first: **"Search and destroy: PIR Mercenary Gozanti Corsair (DMD-761)" for the Anoat Federation, paid 378,842.48 at 39,718.4**. Then **hunt 13 (VSH-071) paid 911,251.36 at 41,843.4** and **hunt 14 (KBZ-737) paid 440,345.00 at 44,199.3**. `missions_accepted` 12 -> 15, `missions_completed` 8 -> 11 [read].
3. **Hunt 13 was disguised.** The real VSH-071 is a Pirate Syndicates Y-wing, still alive and nowhere near the fight: SWI borrows a random ship's code for a disguised target. The real target was the fleet leader shown as XMF-073. Its fleet was Pirate Syndicates (`valarian`, "PIR") ships in **Greater Javin** (Anoat space). XMF-073's wreck and mission cue are gone, so who killed it and when aren't recorded. The Anoat patrol and the fleet went on fighting there until the save. [read/inferred]
4. **Hunt 14 was not disguised.** KBZ-737 is a real Black Sun `weequay_macro` from game start, alone with no escorts. Offered from Ascendancy factory APZ-764 in Dola and accepted at the Guild HQ in Milagro at 43,255.8. Found in Cerea (Anoat) about 43,682; **killed at 43,789.105 by wingman NOM-811 (Basten Fisty)**. Debriefed with Jennifer Yamashita in the Security Office of Ascendancy station OVY-026, Kira, at 44,199.3. Offer 156,930 + up to 223,950; **paid kills 149,270 + destruction 291,075 = 440,345, damage 100.058 / 100.** [read]
5. **Reputation:** Anoat Federation 0 -> **9** (+5, +1, +3, +0); Imperial Ascendancy 9 -> **11** (+2, which unlocked a "Known Associate" discount and an Ascendancy `station_gen_intermediate` licence); **Black Sun −9 -> −11** (Unauthorised Kill of KBZ-737, the hunt target itself). At −11 the player lost the **Black Sun Basic Module Licence** ("You have been stripped of your rank") and **can no longer dock at Black Sun stations or trade with them remotely**. An Anoat police interdiction in Kriselist (40,093.8, complied) cost nothing. [read]
6. **Fleet: 5 ships, all at full hull** [inferred: no `<hull>` element]. HWK-290 **BRX-282** (the player's ship, docked at OVY-026 in Kira) with **4 × A-2 ion cannon, 2 × HS-10 heavy laser, 5 × CEC 1077 shields**. Four R-41s escort it: BCY-548 and RBQ-989 in Kira, NOM-811 and the new NKK-081 in Pax next door. No ship lost since 17:53. [read]
7. **Val Motoli is dead** [inferred]. His spacesuit (YEJ-409) and his NPC (YFU-705) are no longer in the save, and his oxygen ran out at 35,283, 334 s after the 17:53 save, nine jumps from the player. Nothing in the logbook records it. The only "Val Motoli" in the save is an unrelated CSA station manager (AHY-497, Lothal).
8. **Licences:** the Guild now sells the player both `militaryequipment` (1 M, bought 2026-11-04 at 29,524) and **`militaryship` (3 M, new: "Bounty Hunters' Guild Unique Ship Access")**. So, yes, it's a different licence from the earlier 1 M one. The 3 M one unlocks the Guild's military ships (HWK-290, Firespray-31, Razor Crest, Dynamic-class freighter); the 1 M one unlocks its military equipment, such as the HS-10 lasers now on the HWK. [read; unlocks from licence-costs.md]
9. **`savegames_loaded` 9** (8 at the hunt 10 read, save-check-onj-300.md). That one load since hunt 10 is most likely the start of today's session from the 17:53 quicksave, which the money log continues without a gap. So probably no reload during this play [inferred].

## 1. Money since 17:53 [read]

| Game time | Type | Partner | Amount (Cr) | Balance after | What |
|---|---|---|---|---|---|
| 34,869.177 | script_add | | | 4,225,107 | Hunt 12 (the 17:53 baseline) |
| 35,124.264 | transfer | NYA-677, ICG trade station, Mongazza | **+124,651** | 4,349,758 | Item sale [inferred] |
| 35,200.034 | transfer | NYA-677 | **+869,486** | 5,219,244 | Item sale [inferred] |
| 35,762.144 | transfer | **UYK-860, Bounty Hunters Guild HQ, Milagro** | **−3,000,000** | 2,219,244 | **Licence `militaryship` for `bountyhunters`** |
| 36,298.899 | transfer | UYK-860 | **−1,858,224** | 361,020 | **HWK-290 BRX-282** (spawntime 36,298.939) |
| 36,459.399 | transfer | UYK-860 | +83,454 | 444,474 | Refit credit? [inferred] |
| 36,461.982 | transfer | UYK-860 | −9,904 | 434,570 | Refit? [inferred] |
| 36,877.6-38,122.4 | collect × 27 | | +1,020,881 | 1,455,451 | Pickups (biggest 107,514); place not recorded |
| 38,423.846 | transfer | **MEV-790, TransGalMeg Wharf, Mataou** | **−1,207,734** | 247,717 | **R-41 NKK-081** (spawntime 38,423.88) |
| 39,380.0 | collect × 2 | | +22,293 | 270,010 | After the DMD-761 fight in Adarlon? [inferred] |
| 39,718.356 | script_add | | **+378,842.48** | 648,852 | **Extra hunt: DMD-761** (Anoat) |
| 39,771.091 | collect | | +10,132 | 658,984 | |
| 39,824.775 | transfer | DDX-346, Anoat factory, Kriselist | +500 | 659,484 | Station defence reward, +1 Anoat |
| 39,992.0-40,656.4 | collect × 22 | | +1,622,794 | 2,282,278 | Pickups, 15 of them 78-118k each; Kriselist area? [inferred] |
| 41,843.417 | script_add | | **+911,251.36** | 3,193,529 | **Hunt 13** (VSH-071) |
| 42,328.357 | transfer | PBJ-977, Anoat factory, Greater Javin | +500 | 3,194,029 | Station defence reward (Anoat, shown as +0) |
| 42,370.8-42,792.6 | collect × 10 | | +555,722 | 3,749,751 | Pickups, five of 77-117k at 42,370-42,377; Greater Javin [inferred] |
| 43,799.700 | collect | | +12,468 | 3,762,219 | KBZ-737's drop, 10 s after the kill [inferred] |
| 44,199.321 | script_add | | **+440,345.00** | **4,202,564** | **Hunt 14** (KBZ-737). Ticker "Payment received: 440,345 Cr" at 44,199.389 |

- Check: 4,225,107 + 3,244,290 (pickups) + 1,730,438 (hunts) + 995,137 (NYA-677 and defence rewards) + 83,454 − 3,000,000 − 1,858,224 − 9,904 − 1,207,734 = 4,202,564.
- **The licence** [read]: `<licence type="militaryship" factions="bountyhunters"/>` is new; at 17:53 the player held `militaryequipment` for `transgalmeg bountyhunters` and no `militaryship`. The 3,000,000 debit at the Guild HQ matches SWI's price exactly (licence-costs.md). No ticker covers it (the ticker starts at 42,377). The HQ's faction representative, Mayenne Cruise (OQK-186, control room of UYK-860), last spoke at 36,297.5, 1.4 s before the HWK purchase.
- **The HWK**: −1,858,224 at the HQ, and the ship's spawntime is 40 ms later. licence-costs.md gives the HWK's base price as about 992k, so the high preset's equipment makes up the rest [inferred]. The +83,454 / −9,904 pair 160 s later at the same station looks like a loadout change (equipment sold back, then a small charge) [inferred]. The weapons' glow parameters are stamped about 36,560, which fits a refit finishing then [inferred].
- **The replacement R-41 NKK-081** cost 1,207,734, more than the earlier R-41s (879,875 each for two; 975,199; 916,542; save-check-zgn-719.md, save-check-onj-300.md). At 17:53 BCY-548 was at 43% hull and NOM-811 at 9%; both are full now, so repairs done at the wharf may be in this sum [inferred].
- **Loot sold** [inferred]: the two NYA-677 payments came 175-251 s after the 17:53 save, while the player was still at that station (ICG crew Maree Bro on the same station spoke at 35,287). Together, 994,137. At 17:53 the inventory held Interface Unit 158, Micro-Gimbal 77, Micro-Motor 25, Modular Trigger 28, Hydraulic Pump 17, Advanced Targeting Module 6, Useful Scrap 145, AGI Neural Network 3 and more. At vanilla average prices those eight alone come to about 812k. Today's inventory is no proof either way, because 129 more drops were picked up since (`drops_collected` 175 -> 304, `illegal_drops_collected` 10 -> 23). Only Advanced Targeting Module (6 -> 4), Useful Scrap (145 -> 138) and Seminar Piloting 0-star (5 -> 3) are lower now. Current inventory: Interface Unit 193, Useful Scrap 138, Micro-Gimbal 114, Modular Trigger 50, Hydraulic Pump 44, Micro-Motor 39, Secure Container 42, Spacefly Eggs 65, AGI Neural Network 7, AGI device t1 4, Advanced Targeting Module 4, Extended Fuel Container 18, Nividium Crystallite 16, Nividium Oxide 15, Tuning Software 15, High Energy Catalyst 10, and smaller lots.
- `trades_executed` is still 0: inventory sales don't count as trades.
- The HWK's cargo hold carries **225 Graphene** from a dropped container. A second one couldn't be taken at 42,965.5 ("Cannot collect container: Graphene 128, cargo storage full").

## 2. The extra hunt: PIR Mercenary Gozanti Corsair (DMD-761) [read]

Not in the playtest log.

- Logbook (39,718.356): "Search and destroy: PIR Mercenary Gozanti Corsair (DMD-761)". "Reward for … kills: 98,555.00 Cr. Your Engagements: 1 x M ship (kills: 1). Reward for … destruction: 280,287.50 Cr. Total reward: 378,842.48 Cr." Anoat Federation **+5 -> 5**.
- 39,288.532: "R-41 Starchaser (NOM-811) is under attack. Location: Adarlon. Commander: HWK-290 (BRX-282). Attacked by: PIR Mercenary Gozanti Corsair (DMD-761)". **So the fight was in Adarlon**, and the target was what it claimed to be (PIR, no disguise shown) [inferred from the name].
- Debrief contact most likely **Ace Felden** (Anoat, HLD-348), who last spoke at 39,723.8, 5 s after the pay [inferred].
- Then 39,824.8: +500 Cr and +1 Anoat (-> 6) for defending DDX-346, an Anoat factory in Kriselist, and at 40,093.8 an Anoat police interdiction of BCY-548 in Kriselist ("Response: Comply"). No fine followed.
- The offer, the accept time and the wreck aren't in the save.

## 3. Hunt 13: BAO Gang Defender Corvette (VSH-071)

### Pay [read]

- Logbook (41,843.417): "Reward for BAO Gang Defender Corvette (VSH-071) kills: 655,496.24 Cr. Your Engagements: 1 x M ship (kills: 1). Reward for … destruction: 255,755.16 Cr. Total reward: 911,251.36 Cr." `money="91125136"`. Anoat Federation **+3 -> 9**.
- Offer (playtest log): 584,878.76 + up to 254,340. **The kills part rose 12.1%** (584,878.76 -> 655,496.24). The kills part is re-rolled when the Destroy step starts, which for a disguised target is after the scan (em-scan-and-wing-damage.md, hunt-pay-ael-112.md). Hunt 12's fell 4.1%, so the re-roll goes both ways.
- Destruction 255,755.16 at damage 98.0844 (Results screen): 255,755.16 / 1.25 / 0.980844 = **208,600** [inferred arithmetic]. So the roll at debrief was 208,600, within the 254,340 band, scaled by the damage share and the player-kill bonus 1.25.

### The target [read / inferred]

- **The code was borrowed.** `VSH-071` in the save is a Pirate Syndicates (`valarian`) Y-wing BTL-B (`ywing_btlbp_macro`, line 12144110, spawntime 0), **alive**. SWI gives a disguised target a random ship's code (swi-bounty.md: `Mission_Hunt_GetIdCode`). On the map the leader showed as XMF-073 (playtest log), and the scan showed PIR. **XMF-073 isn't in the save at all**: the wreck has been cleaned up.
- **The fleet was Pirate Syndicates ships in Greater Javin** (`swi_clusterjavin_sector001_macro`, owner anoat), all with spawntime 284.094. The fleet ships carry a `killed` listener from KLE-467, so KLE-467 was their commander when the save was written; it probably took over after XMF-073 died [inferred]. That matches the player's fleet description (2 Defender Corvettes, 4 Gozanti Corsairs, a Weequay, an HWK-290, a Z-95):

| Ship | Type | Fate |
|---|---|---|
| FBF-375 | Defender Corvette | killed 42,693.7 by Anoat Valor ZNQ-988 |
| UYD-313 | Defender Corvette | **alive** in Greater Javin at save time, still fighting Anoat ships (it killed 6 of them, 41,804-43,924) |
| KLE-467 | Gozanti Corsair (`gozanti_croc_raider`) | killed 42,733.2 by Anoat Kihraxz IEJ-166 |
| OYT-995 | Gozanti Corsair | killed 42,661.5 by Anoat Hammerhead FZY-461 |
| VSB-698 | Gozanti Corsair | killed 43,725.5 by Anoat Y-wing UAX-164 |
| FIF-467 | Weequay | **killed 42,653.426 by the player's HWK-290 BRX-282** (`hitbybullet`), 810 s after the debrief |
| HMV-544 | HWK-290 | killed 42,574.8 by Anoat Hammerhead FZY-461 |
| LJF-429 | Z-95 | killed 42,879.1 by Anoat Valor ZNQ-988 |

- **The Anoat patrol was a whole response force**, not one patrol. Anoat losses in Greater Javin since 41,804: Hammerheads RME-354, LIV-315, FZY-461; Valor ZNQ-988; CR90s GNF-482, MKE-846, CFY-173; R-41s ONR-075, RYI-844; Kihraxz IEJ-166, WDE-899, XFA-603, GVF-295, SLU-545; Scurrg H-6s MKL-607, SPV-543, ORN-051; Y-wing UAX-164. Another Pirate Syndicates Gozanti, EOV-201, did much of the killing; it carries a `cover` owner, so it is disguised too [read]. That it belongs to this fleet is [unverified].
- RBQ-989's last attacker is `[0x2145b48]` at 41,692.348 (`hitbybullet`). No component with that id exists any more. The same id attacked PBJ-977 (an Anoat factory in Greater Javin) at 36,805. So the id is a destroyed Javin raider, most likely XMF-073 itself [inferred].
- **Who killed XMF-073 and when** isn't recorded. "Your Engagements: 1 x M ship (kills: 1)" means a player-owned ship got the kill.

### Timeline [read / inferred]

| Game time | Event |
|---|---|
| ? | Accepted (11:50 real time the player had talked to Rena Rieper and found the target; the cue is gone) |
| 41,692.3 | RBQ-989 hit by `[0x2145b48]` (XMF-073? [inferred]) |
| 41,702.5 | Logbook: NOM-811 under attack in **Greater Javin** by PIR Weequay FIF-467 |
| 41,804.3 | Anoat Hammerhead RME-354 killed by UYD-313 |
| **41,843.417** | **Debrief and pay**; contact **Rena Rieper** (Anoat, SEL-448), who last spoke at 41,868.8 |
| 42,328.4 | Station defence reward for PBJ-977, Greater Javin (+500 Cr, Anoat +0) |
| 42,370-42,792 | Pickups 555,722 Cr |
| 42,653.4 | The HWK kills FIF-467 |
| 42,687.2 | The HWK's engine was hit by Anoat Valor ZNQ-988 (friendly fire, no rep effect) |
| 42,807.4 | Autopilot: "Fly to BHG Guild Station" (the way to hunt 14) |

- No rep loss with the Pirate Syndicates for any kill: the player's relation to `valarian` is −0.01 base (−10, enemy), so those kills are authorised [read/inferred].

## 4. Hunt 14: BLS Mercenary Weequay (KBZ-737)

### Pay [read]

- Logbook (44,199.321): "Reward for BLS Mercenary Weequay (KBZ-737) kills: 149,270.00 Cr. Your Engagements: 1 x M ship (kills: 1). Reward for … destruction: 291,075.00 Cr. Total reward: 440,345.00 Cr." `$RewardCr` 44034500.
- Offer: `$RewardText` (string 68043) **"Reward: 156,930.00 Cr + up to 223,950.00 Cr"**. The kills part fell 4.9% at the re-roll (156,930 -> 149,270).
- **Destruction 291,075 is above the "up to" 223,950**: 291,075 = 1.00 × 232,860 × 1.25 (the player-kill bonus) [inferred arithmetic], the same pattern as hunt 12.
- Result line (string 69608): "1 killed / 1 x Weequay Corvette: your kills: 1, your damage: 100 / 100: 145,537.50 Cr" (half the destruction pay, as before).
- `$CappedRewards` / `$BaseRewardData`: forTarget 291,075, forTargetKills 149,270. `$PlayerDamageAndKillsData`: `$difficulty_max` **medium** (hunt 12: easy), reward 291,075.
- `$DamageAndKillsList` (list 107417) has one record, table 24145: `$enemy` `[0x420a4292]`, `$idCode` "KBZ-737", `$faction` blacksun, `$class` ship_m, `$macro` weequay_macro, `$size` 174.31 m, **`$damage_total` 100.058**, `$isPlayerKilled` 1, `$killer` "R-41 Starchaser", `$hull` empty (0).
- Target kills (string 68041): "1 x M ship, 1 x S ship".

### The target [read]

- Mission vars (cue 811130): `$Faction` ascendancy, `$OpposingFaction` blacksun, `$EnemyFactions` (list 76591) = [blacksun], **`$IsDisguised` empty (false)**, `$MissionTarget` `[0x420a4292]`, `$TargetSector` = `$kProfs_missionSector` **Cerea** (`swi_clustercerea_sector001_macro`, owner anoat), `$Difficulty` medium, `$isStronger` 1, `$MissionGroup` bountyHunters_guild, `$kEMissionType` 106, `$MissionId` "kEM_Hunt_556", `$RewardNotoriety` 0.004, `$Result` success, `$isTargetAttackedByPlayer` 1, `$timer_find_end` 54,482.063.
- Find beacon (string 68479): "(Report of KBZ-737, 06h 35min 29s ago)".
- **Wreck (line 3479645)**: `weequay_macro`, code **KBZ-737**, owner **blacksun**, spawntime 0 (a game-start ship). **`attacker="[0x28028a15]"` = NOM-811 (Basten Fisty), `hitbybullet`, 43,789.105.** In Cerea zone 001 (YKG-763).
- **No escorts**: it is the only Black Sun wreck in Cerea, and no other ship there died near that time. Its listeners are boost-disable effects (the HWK's ion hits [inferred]) and the player's `killed` listener.
- `$MissionOffer_Station` = **APZ-764**, an Ascendancy factory in **Dola**; `$Client` Rachael Choi (HAT-071, ascendancy). Dola is 5 jumps from Milagro and 3 from Cerea (`gates.py`).

### Timeline [read / inferred]

| Game time | Event |
|---|---|
| 43,249.9 | The player talks to **Nascha Yency** (EIM-545, Guild manager, control room of the Guild HQ UYK-860, **Milagro**) |
| **43,255.803** | **Mission accepted** (cue time), 6 s later, so from the Guild's board at the HQ |
| 43,311-43,688 | Travel, with long-range scans at 43,464, 43,537, 43,567 and 43,631 |
| **~43,682.1** | **Found** (`$timer_find_end` − 3 h) [inferred] |
| 43,702.3 | Scan mode on (43,702-43,822) |
| 43,774.2 | KBZ-737 hits the HWK (`hitbybullet`) |
| 43,785.3 | The HWK's last shots (ions and HS-10s) |
| 43,788.3-43,788.7 | All four R-41s' last shots |
| 43,788.730 | Black Sun −2, Unauthorised Kill |
| **43,789.105** | **KBZ-737 killed by NOM-811** |
| 43,799.7 | Pickup +12,468 |
| 43,914.8 | Autopilot "Fly to Jennifer Yamashita" |
| **44,199.321** | **Debrief and pay**: **Jennifer Yamashita** (UIH-410, ascendancy) in the **Security Office of OVY-026**, an Ascendancy factory in **Kira**, next to Milagro. The player is standing there at save time |

- Accept to kill: 533 s; find to kill: 107 s; kill to debrief: 410 s (Cerea -> Kira is 7 jumps); accept to debrief: 944 s.
- Gunnery: `bullets_fired` 2,494 -> 4,066, `bullets_hit` 1,522 -> 2,522 since 17:53 (the HWK made the player a gunner again). `ships_destroyed` 21.

## 5. Reputation since 17:53 [read]

| Time | Faction | Change | Now | Reason |
|---|---|---|---|---|
| 39,718.356 | **Anoat Federation** | **+5** | 5 | Mission Completed (DMD-761) |
| 39,824.775 | Anoat Federation | +1 | 6 | Destroyed Enemy (station defence, DDX-346) |
| 41,843.417 | Anoat Federation | **+3** | 9 | Mission Completed (hunt 13) |
| 42,328.357 | Anoat Federation | (+0) | 9 | Destroyed Enemy (station defence, PBJ-977) |
| 43,788.730 | **Black Sun** | **−2** | **−11** | **Unauthorised Kill** (KBZ-737, the hunt target) |
| 44,199.321 | **Imperial Ascendancy** | **+2** | **11** | Mission Completed (hunt 14) |

- **Black Sun at −11**: mail "You have been stripped of your rank. … The following licences have been revoked: Black Sun Basic Module Licence". Ticker: "You can no longer dock at stations belonging to: Black Sun", "…no longer allowed to trade remotely…", "…no longer able to build in space…". Booster `blacksun` −0.0132 (43,788.73). The vanilla demotion mail uses that title for any licence lost to a rep drop, not only for a rank (`playerreputation.xml` 470-500). Black Sun was already −9 from earlier hunts (hunt 10 was a disguised Black Sun ship). A non-disguised Black Sun target at −9 still counts as an unauthorised kill, as the CSA kills did in hunt 12.
- **Ascendancy 11**: "Discount unlocked: Known Associate, Level: Very Small" (`discounts_unlocked` 1 -> 2), and `station_gen_intermediate` now lists `ascendancy` (kamino, commerceguild, ascendancy). Mail from Inquisitor Paul Rasheed, "Recruiting Volunteers Against the New Republic" (unread).
- **Anoat 9**: booster 0.00928 (42,328.357). The player is close to +10 with Anoat, where licence-costs.md says Anoat's Military Ships Access is free with Resident [inferred].
- CSA booster still −0.007 from 33,644.6, ICG 0.0126772 from 34,869.2 (no change).
- No fine, and no money-log debit that could be one.

## 6. Fleet [read]

`ships_owned` 5 (was 3). All five ships escort or are the HWK. **None has a `<hull>` element**, which in this save format means an undamaged hull (2,558 damaged objects elsewhere carry `<hull value=…>`) [inferred].

| Ship | Where | Bought | Pilot (piloting, morale) | Order | Missiles |
|---|---|---|---|---|---|
| **HWK-290 BRX-282** (player, `lastcontrolled`) | docked at OVY-026, Kira | 36,298.9, Guild HQ | Seleen Springer (NQO-694; 5, 8) | Wait (default), fleet commander, "Fleet 3" | none (no missile storage) |
| R-41 NOM-811 | in space, Pax | 24,379 | Basten Fisty (7, 6) | Escort BRX-282, pointguard | 6 |
| R-41 **NKK-081** (new) | in space, Pax | 38,423.9, MEV-790 | Mak Yatar (URQ-654; 4, 3) | Escort BRX-282 | 8 |
| R-41 BCY-548 | in space, Kira | 27,142 | Renda Caren (6, 4) | Escort BRX-282 | 8 |
| R-41 RBQ-989 | in space, Kira | 24,636 | Romin Riano (**5**, 7; was 4) | Escort BRX-282 | 6 |

- Pax is next to Kira, and NOM-811 and NKK-081 had collided with things in Pax at 43,313-43,314. Pax is the Ascendancy-New Republic front, with 47 wrecks in one zone since 34,949 [read].
- **R-41 fit (all four, NKK-081 identical)**: 2 × IX-4 (`weapon_ix4_s_laser`), 2 × KX-5 (`weapon_kx5_s_laser`), 2 × HM-6 missile launchers with light concussion missiles, 2 × CEC 1077 S shields, 4 × Incom engines, 8 flares. NKK-081 is a like-for-like replacement for LOD-387.

### HWK-290 BRX-282 full loadout [read]

- `hwk_290_01_macro`, spawntime 36,298.939. Hull max 28,500 (licence-costs.md).
- **Weapons (6, one primary group)**: **4 × A-2 ion cannon** (`weapon_a2_s_laser`, S, general-use equipment, about 36.9k each) and **2 × HS-10 heavy laser cannon** (`weapon_hs10_m_laser`, M, **military equipment** licence, about 97.3k each) [read; prices: SWI wares.xml averages]. All six last fired 43,785.
- **Shields**: 5 × CEC 1077 (`shield_s_cec1077`).
- **Engine**: `engine_hwk` (the CEC engine made for the HWK); thrusters `thruster_gen_s_allround_01_mk3`.
- **Software**: docking mk2, long-range scanner mk2, object scanner mk2, targeting mk1, trading mk1.
- **Deployables**: 8 flares, 3 × `eq_arg_satellite_02` (advanced satellites). No missiles.
- **Cargo**: `storage_container_4500` holding 225 Graphene.
- **Crew**: pilot Seleen Springer (piloting 5, morale 8; the AI pilot while the player is out of the seat), 3 service crew (engineering 6, 6, 4), 3 marines (boarding 1, 1, 2). `staff_hired` is still 0, so they came with the ship [inferred].

### Not in the fleet

- **Val Motoli** (YFU-705), LOD-387's pilot, adrift in Jabiim in spacesuit YEJ-409 at 17:53 with `oxygenempty` at 35,283.3: neither object exists in this save, and no logbook entry mentions him. The player was in Mongazza, 9 jumps away, and stayed there until at least 35,200. **He died when his oxygen ran out** [inferred]. `time_spacesuit` rose 773 -> 989 s, but that is the player's own suit time.

## 7. Licences held now [read]

| Type | Factions (relevant ones) | What it unlocks |
|---|---|---|
| `militaryship` | **bountyhunters** (new, 3 M at 35,762) | Guild "Unique Ship Access": HWK-290, Firespray-31, ST-70 Razor Crest, Dynamic-class freighter (licence-costs.md) |
| `militaryequipment` | transgalmeg, bountyhunters (1 M, 29,524) | Military equipment from those factions' stations, e.g. the HS-10 heavy lasers |
| `generaluseship`, `generaluseequipment` | most factions, incl. ascendancy, anoat, bountyhunters | Civilian ships and equipment (the R-41, the A-2 ions) |
| `station_gen_basic` | most factions, incl. ascendancy, anoat; **no longer blacksun** | Basic station modules |
| `station_gen_intermediate` | kamino, commerceguild, **ascendancy** (new at 11) | Intermediate station modules |
| `capitalship`, `capitalequipment`, `station_equip_sm`, `station_equip_lxl` | miningguild | (game-start licences) |
| `station_illegal` | hatikvah, scaleplate, hapes, naboo, kamino, kuat | |

- So the 3 M licence is a separate licence from the 1 M "military equipment licence" bought 2026-11-04. Both were bought at the Bounty Hunters Guild HQ UYK-860 in Milagro (`factionheadquarters="1"`, owner bountyhunters).
- The Guild's `militaryship` licence would also let the player buy the Firespray-31 (about 1.49 M; it has missile storage, which the HWK lacks) [read from licence-costs.md; not tried in game].

## 8. Travel [read]

- `gates_traversed` 264 -> 330 (+66). Routes by `gates.py`: Mongazza -> Milagro 1 jump; Milagro -> Mataou 8; Milagro -> Dola 5; Dola -> Cerea 3; Cerea -> Kira 7; Kira -> Pax 1; Kriselist -> Greater Javin 1; Adarlon -> Kriselist 6; Milagro -> Greater Javin 7.
- So the order was: Mongazza (loot sale) -> Milagro (licence, HWK) -> Mataou (R-41) -> Adarlon (DMD-761) -> Kriselist -> Greater Javin (hunt 13) -> Milagro (hunt 14 accepted) -> Cerea (kill) -> Kira (debrief) [read/inferred from the money log, logbook and wrecks].

## Unverified

- Where the 36,877-38,122 and 39,992-40,656 pickups were. Their wrecks have been cleaned up; only far-away (`lowattentionattack`) wrecks survive more than about 1.5 h.
- What the +83,454 / −9,904 at the Guild HQ were (refit assumed), and whether the 1,207,734 for NKK-081 included repairs.
- That the NYA-677 payments were loot sales, and which items they covered.
- Hunt 13: when and where it was accepted, when XMF-073 died, which player ship killed it, and where Rena Rieper was.
- The DMD-761 hunt's offer, accept time and killer.
- When exactly Val Motoli died; nothing in the save records it.
