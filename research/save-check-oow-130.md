# Save check: hunt 16 (OOW-130), two more HWK-290s and a Partial sanction

Save: `quicksave.xml.gz` (file time **2026-11-05 14:42:26 MST**), `<save name="BBH - Test 2">`, game time **47,051.218**, X4 8.00 (build 590967) + SWI 0.90, player "Bobby the Fat". It follows [save-check-kbz-737.md](save-check-kbz-737.md) (quicksave 13:51, game time 44,254.223, 4,202,564 Cr). The quicksave was copied out of the save folder and unpacked; the save folder was not touched. Line numbers are from the unpacked copy. Tags: [read] = seen in the save, [inferred] = reasoned, not tested.

The player saved again at **14:44:31** (game time 47,159.124, balance also 1,749,231 Cr; only its header was read). The 14:42 save already holds hunt 16's pay, so this note reads the 14:42 one.

Component ids were **not** renumbered between these two saves: same ids as in save-check-kbz-737.md. HWK-290 BRX-282 `[0x461c5e85]`, new HWK-290s BUP-674 `[0x14075d9e]` and JNQ-247 `[0x1e1b5043]`, NOM-811 `[0x28028a15]`, RBQ-989 `[0x361d5fd7]`, BCY-548 `[0x501a56a2]`, NKK-081 `[0x481fa7c0]`, OOW-130 wreck `[0x217624d]`, UYK-860 (Guild HQ) `[0x520c677b]`, DDX-346 `[0x2c02169c]`, XIG-707 `[0xc18ee23]`.

## Sources

- `<player money>` (line 7), player faction `<relations>` and `<licences>` (from line 1144), `<stats>` (23327003), player inventory (2900139), `<messages>` (23327498), ticker cache (23327511).
- **Money log** `<economylog><entries type="money">` (from line 23326813): `v` = balance after, in cents.
- Logbook `<log>` (23327108-23327497).
- Hunt 16's Emergent Missions cue instance: `<cue id="799705" state="complete" time="45734.219">` (line 25959292; vars around 25959580-25959660). Its tables: `$PlayerDamageAndKillsData` 38263 (line 24531169), `$CappedRewards` 38264 (24389341), `$BaseRewardData` 29112 (24406555), `$DamageAndKillsList` list 113081 (23400430) -> damage record table 29113 (24682258).
- Ships: JNQ-247 (2883494), BUP-674 (2883968), NOM-811 (2885776), RBQ-989 (2886370), BCY-548 (2887566), NKK-081 (2888284), BRX-282 (2895661); OOW-130 wreck (15676044) in Polis Massa zone ATK-166 (15675089).
- Helpers: `research/save-read-scripts/anc.py`; `gates.py` changed to run several routes in one pass; throwaway scripts: a zone lister (every component in a zone with its attacker fields) and a ship dumper (orders, crew, fit, each weapon's `lastshottime`).
- [sanction-tiers.md](sanction-tiers.md) (sanction prices and effects), [em-scan-and-wing-damage.md](em-scan-and-wing-damage.md) (damage share).

## Short answer

1. **Balance: 1,749,231 Cr**, −2,453,333 since 13:51. Four entries: **+687,753 at the Guild HQ UYK-860** (most likely loot sold [inferred]), **−3,359,008 at UYK-860 for the two HWK-290s** (1,679,504 each), **−34,960 with no partner: the Partial sanction on OOW-130** (it matches the cue's `$kProfs_sanctionCost_partial` exactly), and **+252,882.24 for hunt 16**. No pickups (`drops_collected` still 304).
2. **Hunt 16 was not disguised.** OOW-130 is a real Hutt Pirates Gozanti C-ROC Corsair (`gozanti_croc_raider_macro`, spawntime 18,687.8), alone, no escorts. Offered from Anoat factory **XIG-707 in Terminus** (client Daneela Erris), accepted at **45,734.2** while the player was at the Guild HQ in Milagro. Found about **46,479.9** in **Polis Massa**; **killed at 46,530.056**. Debriefed with **Hanes Motoli** in the Situation Room of Anoat factory **DDX-346, Kriselist**, at **47,019.089**. Offer **39,630 + up to 246,510**; paid **kills 38,965 + destruction 213,917.24 = 252,882.24**, damage **79.031**. [read]
3. **Who killed it:** the wreck's `attacker` is **R-41 BCY-548** (Renda Caren, `hitbybullet`); the damage record's `$killer` is "HWK-290". Only **BRX-282, BUP-674 and BCY-548** fired in this fight; JNQ-247, NOM-811, RBQ-989 and NKK-081 didn't fire at all. [read]
4. **The 79% is not a late Destroy step.** It's a non-disguised target, so tracking started at the find (≈46,479.9), and the first recorded player hit came after it (46,508.7). No non-player attacker is recorded on the wreck after 18,964. Most likely **OOW-130 was already at about 79% hull when found**, from earlier out-of-sector fights (an Anoat ZH-40 hit it at 18,964, and it attacked an Anoat YT-1300 at 41,121). Under the damage code a clean player-side kill credits exactly the hull % at tracking start. [inferred]
5. **Reputation:** Anoat Federation 9 -> **11** (+2, Mission Completed), which unlocked an Anoat "Known Associate" discount and an Anoat `station_gen_intermediate` licence. **No loss with the Hutt Pirates** for killing OOW-130. No other change, no fine. [read]
6. **Fleet: 7 ships, all at full hull** [inferred: no `<hull>` element], all in Kriselist, no losses. The new HWK-290s **BUP-674** and **JNQ-247** have the same fit as BRX-282 (**4 × A-2 ion, 2 × HS-10, 5 × CEC 1077**), with fresh low-skill crews. They escort BRX-282 as wing group 1; the four R-41s are group 2. [read]

## 1. Money since 13:51 [read]

| Game time | Type | Partner | Amount (Cr) | Balance after | What |
|---|---|---|---|---|---|
| 44,199.321 | script_add | | | 4,202,564 | Hunt 14 (the 13:51 baseline) |
| 45,002.282 | transfer | **UYK-860, Bounty Hunters Guild HQ, Milagro** | **+687,753** | 4,890,317 | Loot sale [inferred]. Ticker "Payment received: 687,753 Cr" 45,002.31 |
| 45,248.026 | transfer | UYK-860 | **−3,359,008** | 1,531,309 | **Two HWK-290s**: BUP-674 (spawntime 45,248.057) and JNQ-247 (45,248.197). Ticker "Debit withdrawal: 3,359,008 Cr" |
| 46,051.698 | transfer | (none) | **−34,960** | 1,496,349 | **Partial sanction on OOW-130** [inferred from the exact price] |
| 47,019.089 | script_add | | **+252,882.24** | **1,749,231** | **Hunt 16** (OOW-130). Ticker "Payment received: 252,882 Cr" 47,019.161 |

- Check: 4,202,564 + 687,753 − 3,359,008 − 34,960 + 252,882.24 = 1,749,231.24.
- **The HWKs:** 1,679,504 each. BRX-282 cost 1,858,224 (then +83,454 / −9,904 at the HQ), and has the same fit, so these two came out about 105k-180k cheaper each. Why isn't recorded (price spread, or a different preset with the fit changed in the same purchase) [inferred]. Both spawned in the same 0.14 s, so they were one order.
- **The sanction:** the hunt cue holds `$kProfs_sanctionCost_partial` = 3,496,000 cents = **34,960 Cr** and `$kProfs_sanctionCost_full` = 1,008,170 Cr. The debit is exactly the Partial price and has no partner, as a script payment would. Guild manager Nascha Yency (EIM-545, control room of UYK-860) last spoke at 46,060.1, 8 s later, so it was bought in her conversation [inferred]. Per [sanction-tiers.md](sanction-tiers.md), **Partial does nothing for a pirate target**: every lawful police faction is already at war with the Hutt Pirates. The RAP lists `$sanctionedAttackIds` / `$sanctionedKillIds` are empty now (cleared after the hunt? [inferred]).
- **Loot sold** [inferred]: since 13:51 these left the player inventory: Useful Scrap 138, Micro-Gimbal 114, Modular Trigger 50, Micro-Motor 39, Advanced Targeting Module 4, and 1 Interface Unit (193 -> 192). Nothing else in the inventory went down, and nothing was picked up. The +687,753 at the Guild HQ, while the player was there, fits a sale of those. Still in the inventory: Interface Unit 192, Spacefly Eggs 65, Hydraulic Pump 44, Secure Container 42, Extended Fuel Container 18, Nividium Crystallite 16, Nividium Oxide 15, Tuning Software 15, High Energy Catalyst 10, AGI device t3 7, and smaller lots.
- BRX-282 still carries **225 Graphene**; BCY-548 picked up 9 Superfluid Coolant at some point.
- `trades_executed` still 0.

## 2. Hunt 16: HTP Mercenary Gozanti Corsair (OOW-130)

### Pay [read]

- Logbook (47,019.089): "Reward for HTP Mercenary Gozanti Corsair (OOW-130) kills: 38,965.00 Cr. Your Engagements: 1 x M ship (kills: 1). Reward for … destruction: 213,917.24 Cr. Total reward: 252,882.24 Cr." `$RewardCr` 25,288,224 cents.
- Offer: `$RewardText` (string 67575) **"Reward: 39,630.00 Cr + up to 246,510.00 Cr"**. The kills part fell 1.7% at the re-roll (39,630 -> 38,965).
- Result line (string 69728): "1 killed / 1 x Gozanti C-ROC Corsair: your kills: 1, **your damage: 79.031** / 100: 106,958.62 Cr" (half the destruction pay, as before).
- `$CappedRewards` / `$BaseRewardData`: forTarget 213,917.24, forTargetKills 38,965. `$PlayerDamageAndKillsData`: `$difficulty_max` medium, reward 213,917.24.
- Destruction: 213,917.24 / 1.25 / 0.79031 ≈ **216,540**, the roll at debrief, within the 246,510 band [inferred arithmetic]. At 100% damage it would have paid about 270,675, so the 79% cost about 56,760 Cr.
- `$DamageAndKillsList` (list 113081) has one record, table 29113: `$enemy` `[0x217624d]`, `$idCode` "OOW-130", `$faction` huttpirates, `$class` ship_m, `$macro` gozanti_croc_raider_macro, `$size` 121.73 m, **`$damage_total` 79.031**, `$isPlayerKilled` 1, **`$killer` "HWK-290"**, `$hull` empty (0).
- Target kills (string 67573): "1 x S ship".
- `missions_accepted` 15 -> 16, `missions_completed` 11 -> 12: no other mission since 13:51.

### The target [read]

- Mission vars (cue 799705): `$MissionId` "kEM_Hunt_568", `$Faction` anoat, `$OpposingFaction` huttpirates, `$kProfs_targetFaction` huttpirates, **`$IsDisguised` empty (false)**, `$MissionTarget` `[0x217624d]`, `$TargetSector` = `$kProfs_missionSector` **Polis Massa** (`swi_clusterpolismassa_sector001_macro`, ownerless), `$Difficulty` medium, `$isStronger` 1, `$MissionGroup` bountyHunters_guild, `$kEMissionType` 106, `$RewardNotoriety` 0.004, `$Result` success, `$isTargetAttackedByPlayer` 1, `$isAlreadyAttacked` 1, `$Objective_Step_find_success` / `_identify_success` / `_destroy_success` 1, `$timer_find_end` 57,279.867.
- Find beacon (string 68392): "(Report of OOW-130, 04h 05min 49s ago)".
- `$MissionOffer_Station` = **XIG-707**, an Anoat factory in **Terminus**; `$Client` **Daneela Erris** (GEU-143, anoat manager). `$MissionContact_NPC` **Hanes Motoli** (PGB-377, anoat), `$MissionContact_Container` **DDX-346** (Anoat factory, Kriselist), `$MissionContact_Interior` "Situation Room".
- **Wreck (line 15676044)**: `gozanti_croc_raider_macro`, code **OOW-130**, owner **huttpirates**, spawntime 18,687.849. **`attacker="[0x501a56a2]"` = R-41 BCY-548 (Renda Caren), `hitbybullet`, 46,530.056.** Polis Massa, tempzone ATK-166. Wreck components: engine hit by **BRX-282** at 46,508.714, a turret hit by **BCY-548** at 46,526.641, and another turret hit by **Anoat ZH-40 WNX-589** at **18,964.3** (`lowattentionattack`, an old out-of-sector fight). Its turrets last fired 46,524.1-46,529.6.
- Earlier: OOW-130 is the last attacker of **Anoat YT-1300 ORM-246** (alive), 41,120.9, `lowattentionattack`.
- **No escorts**: OOW-130 has no commander or subordinates, it's the only Hutt Pirates ship in Polis Massa, and it's the only wreck since 44,000 with a player-owned last attacker.
- **Others in the same zone** (all alive, none with an attacker since 42,067): a Black Sun build storage TGO-696 and station APE-722 under construction, Black Sun Weequay **KEO-508** (order Plunder), Kihraxz EXK-303 and Scurrg H-6 HWQ-343, and a Mandalorian Raiders Lancer EWV-428. KEO-508's three XV-1 lasers all carry `lastshottime` 46,535.68, the same instant as the player's "Travel Mode charging". Black Sun and the Hutt Pirates have no relation entry with each other (neutral [inferred]), while the player is at −11 with Black Sun (hostile [inferred]). So KEO-508 was probably shooting at the player's ships, not at OOW-130, but the save can't show its target [unverified].

### Who fired [read]

Each weapon's `lastshottime`:

| Ship | Last shots | Hit OOW-130? |
|---|---|---|
| **HWK-290 BRX-282** (player's) | HS-10s 46,529.311; 4 A-2 ions **46,530.172** (after the kill: ion bolts in flight) | engine hit 46,508.714; OOW-130 hit BRX-282's hull at 46,529.617 and its engine at 46,527.411 |
| **HWK-290 BUP-674** (new) | A-2s 46,511.1-46,517.9; HS-10s 46,518.8-46,519.5 | OOW-130 hit it at 46,516.648 (hull and engine) |
| **R-41 BCY-548** | IX-4s 46,528.246; KX-5s 46,529.4 | **last hit on the wreck**, turret hit 46,526.641 |
| HWK-290 JNQ-247 (new) | never fired (stamps = spawn time 45,248.197) | |
| NOM-811, RBQ-989, NKK-081 | last fired 43,785-43,788 (hunt 14) | |

- `$killer` "HWK-290" vs the wreck's attacker BCY-548: the damage record takes the killer from the kill event, the wreck keeps the last attack. Most likely an ion or HS-10 hit from one of the two HWKs landed the kill in the same instant as BCY-548's last hit [inferred]. Which HWK isn't recorded. Either way it's a player kill (`$isPlayerKilled` 1).
- `bullets_fired` 4,066 -> 4,298, `bullets_hit` 2,522 -> 2,743, `ships_destroyed` 21 -> 22.

### Why 79% and not ~100% [read / inferred]

From [em-scan-and-wing-damage.md](em-scan-and-wing-damage.md): the damage counter starts when the Destroy step starts, with `$hull` = the target's hull % then. After that, every player-owned hit adds the hull % drop, and the killing blow adds the rest. So if only player-owned ships damage the target after tracking starts, `$damage_total` = **the hull % at tracking start**.

- **Not a late Destroy step:** OOW-130 isn't disguised, so Destroy starts at the find, with no scan. `$timer_find_end` 57,279.867 − 3 h = **46,479.867** for the find, 0.8 s before the ticker's "Travel Mode aborted" (46,480.709). The first recorded player hit is 46,508.7, and BUP-674's first shots are around 46,511. So no player damage fell before tracking started [inferred: the save keeps only last-shot times, not first-shot times].
- **No recorded non-player attacker in the fight:** every component of the wreck that has an attacker names BRX-282 or BCY-548, except the 18,964 Anoat hit. The ships in the zone were not hit and aren't hostile to the Hutt Pirates. But the save keeps only the last attacker per component, so a non-player hit earlier in the 50 s fight can't be ruled out [unverified].
- **Most likely: the target started at about 79% hull.** The wreck shows out-of-sector combat damage from 18,964 (an Anoat ZH-40), and OOW-130 fought an Anoat YT-1300 at 41,121 and has 1 S kill on its record. AI ships don't repair their hull without a shipyard, so that damage would still be there when the player found it [inferred]. 79.031 is then the hull % at the find.
- So in-game, a "your damage" below 100 on a non-disguised target that only your ships shot means the target was already damaged when you found it. It doesn't mean someone else stole hits.

### Timeline [read / inferred]

| Game time | Event |
|---|---|
| 44,398.9 | Travel from Kira (after hunt 14's debrief) |
| 44,556-44,842 | Scan mode; travel aborted 44,850.6 (at the Guild HQ, Milagro, 1 jump [inferred]) |
| 45,002.3 | +687,753 at UYK-860 (loot sale [inferred]) |
| 45,248.0 | Two HWK-290s bought at UYK-860 |
| **45,734.219** | **Mission accepted** (cue time); the player is still at the Guild HQ (no travel between 44,850 and 46,077), so from the Guild's board there [inferred] |
| 46,051.7 | −34,960: Partial sanction [inferred]; Nascha Yency speaks 46,060.1 |
| 46,077.0 | Travel from Milagro (Polis Massa is 6 jumps: Milagro -> Kira -> Pax -> Dark Knell -> Eriadu -> Rutan -> Polis Massa) |
| 46,313-46,371 | Long-range scans on the way |
| **~46,479.9** | **Found** (`$timer_find_end` − 3 h); travel aborted 46,480.7 |
| 46,508.7 | BRX-282 hits OOW-130's engine |
| 46,511-46,519 | BUP-674 fires; OOW-130 hits BUP-674 at 46,516.6 |
| 46,526.6 | BCY-548 hits a turret |
| 46,529.6 | OOW-130's last hit on BRX-282 |
| **46,530.056** | **OOW-130 killed** (last hit BCY-548; `$killer` "HWK-290") |
| 46,535.7 | Travel to Kriselist (6 jumps: Polis Massa -> Rutan -> Eriadu -> Dola -> Garrenthum -> Javin -> Kriselist) |
| 46,957.2 | Last travel abort, then docks at DDX-346 |
| **47,019.089** | **Debrief and pay**: **Hanes Motoli** (PGB-377, anoat) in the **Situation Room of DDX-346**, Anoat factory, **Kriselist**. He last spoke at 47,048.9; the player is docked there at save time |

- Accept to find: 746 s; find to kill: 50 s; kill to debrief: 489 s; accept to debrief: 1,285 s.
- Terminus, where the offer came from, is 6 jumps from Milagro and 2 from Polis Massa.
- `gates_traversed` 330 -> 346 (+16). Kira -> Milagro -> Polis Massa -> Kriselist is 13; 3 jumps unaccounted for (detours [inferred]).

## 3. Reputation and sanctions since 13:51 [read]

| Time | Faction | Change | Now | Reason |
|---|---|---|---|---|
| 47,019.089 | **Anoat Federation** | **+2** | **11** | Mission Completed (hunt 16) |

- **Anoat 11**: "Discount unlocked: Known Associate, Level: Very Small, Offered by: Anoat Federation" (`discounts_unlocked` 2 -> 3); `station_gen_intermediate` now lists `anoat` (kamino, commerceguild, ascendancy, anoat). Booster anoat 0.01328 (47,019.089). `max_faction_relation` 11. No Anoat `militaryship` licence appeared.
- **Hutt Pirates: no change.** No "Unauthorised Kill" in the logbook or ticker, no huttpirates booster; base relation −0.0032. Why the kill wasn't penalised isn't settled here (BCY-548's last hit, the "HWK-290" killer, or the Hutt Pirates' standing) [unverified]. sanction-tiers.md expects −2 with a pirate faction on the player's own kill without Full.
- Black Sun still −11 (booster −0.0132 from 43,788.73), Ascendancy still 11 (0.0135 from 44,199.321). CSA −0.007, ICG 0.0126772: unchanged.
- **Sanction:** the Partial (34,960) on OOW-130 only, as above. No fine, no police interdiction, and no other unexplained debit.
- Messages: nothing new since 44,199.321.

## 4. Fleet [read]

`ships_owned` 7 (was 5). **No ship has a `<hull>` element**, which in this save format means an undamaged hull [inferred]. BRX-282 and BUP-674 were hit by OOW-130, so its fire hit shields only, or was repaired: no repair debit. No losses.

| Ship | Where | Bought | Pilot (piloting, morale) | Order | Group | Missiles |
|---|---|---|---|---|---|---|
| **HWK-290 BRX-282** (player) | docked at DDX-346, Kriselist | 36,298.9, Guild HQ | Seleen Springer (NQO-694; 5, 8) | Wait (default), fleet commander | | none |
| **HWK-290 BUP-674** (new) | in space, Kriselist (LTU-999) | 45,248.06, Guild HQ | **Ty Fisty** (SVE-868; 4, 2) | Escort BRX-282 | 1 | none |
| **HWK-290 JNQ-247** (new) | in space, Kriselist | 45,248.20, Guild HQ | **Scot Donel** (ZCV-655; 4, 6) | Escort BRX-282 | 1 | none |
| R-41 NOM-811 | in space, Kriselist | 24,379 | Basten Fisty (WKQ-309; 7, 6) | Escort BRX-282 | 2 | 6 |
| R-41 RBQ-989 | in space, Kriselist | 24,636 | Romin Riano (GRO-814; 5, 7) | Escort BRX-282 | 2 | 6 |
| R-41 BCY-548 | in space, Kriselist | 27,142 | Renda Caren (DVV-128; 6, 4) | Escort BRX-282 | 2 | 8 |
| R-41 NKK-081 | in space, Kriselist | 38,423.9 | Mak Yatar (URQ-654; 4, 3) | Escort BRX-282 | 2 | 8 |

- **New HWK fit (BUP-674 and JNQ-247, identical to BRX-282):** 2 × HS-10 heavy laser (`weapon_hs10_m_laser`, M, military equipment), **4 × A-2 ion cannon** (`weapon_a2_s_laser`), 5 × CEC 1077 S shields, `engine_hwk`, `storage_container_4500` (empty), software docking mk2, long-range scanner mk2, object scanner mk2, targeting mk1, trading mk1; 8 flares. No satellites (BRX-282 has 3 advanced satellites).
- **New HWK crews** (came with the ships; `staff_hired` still 0): JNQ-247: 3 service (engineering 3, 1, 2), 3 marines (boarding 2, 2, 1), morale 1 all round. BUP-674: 3 service (engineering 2, 2, 2), 3 marines (boarding 2, 2, 1), morale 1-3. BRX-282: 3 service (engineering 6, 6, 5), 3 marines (boarding 1, 1, 2).
- The R-41 fit is unchanged (2 × IX-4, 2 × KX-5, 2 × HM-6 with light concussion missiles, 2 × CEC 1077, 4 × Incom engines, 8 flares).
- All four R-41s' last attacker is a collision at 44,583-44,861 (`[0x361ff8b8]`), the same object for each; harmless [inferred].

## Unverified

- What the +687,753 at the Guild HQ was (loot sale assumed from the inventory drop), and why the two HWKs cost 1,679,504 each, less than BRX-282.
- That the −34,960 was the Partial sanction (exact price match and no partner; no ticker or log line names it).
- Which HWK's shot `$killer` "HWK-290" refers to.
- That OOW-130 was at ~79% hull when found. A non-player hit during the 50 s fight can't be excluded, because the save keeps only the last attacker per component.
- Why the Hutt Pirates didn't take an "Unauthorised Kill" rep loss.
- What KEO-508 (Black Sun Weequay in the same zone) was shooting at 46,535.68.
- The 3 unaccounted gate jumps.
