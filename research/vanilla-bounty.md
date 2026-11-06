[Back to the bounty research](../bounty-research.md). Detailed reference for its "Vanilla features underneath" section.

# Vanilla X4 8.00 bounty mechanics and modding toolkit (under SWI 0.90)

Scope: the vanilla 8.00 systems that sit under SWI's bounty play (SWI's own kuertee bounty system is covered elsewhere), plus the vanilla scripting toolkit for building bounty features on 8.00. Notes on 9.00 changes and on SWI overrides throughout.

Paths:

- Vanilla 8.00 paths are game-relative (unpacked from `E:\SteamLibrary\steamapps\common\X4 Foundations - 8.00`), like `md/gm_assassinate.xml`; DLC files are under `extensions/ego_dlc_*/`.
- `V9/` = vanilla 9.00 reference, `E:\x4-dev\reference\x4-9.00\base\`.
- `SWI/` = SWI 0.90 reference, `E:\x4-dev\reference\mods\swi-0.90\ext\`.
- Text refs `{page,id}` resolve in `t/0001-l044.xml`.

"Inferred" marks conclusions drawn from reading code, not stated in the source.

## Overview

Vanilla X4 8.00 has no "bounty board" and no player "wanted level". What it has:

1. **Automatic kill rewards** (`md.Notifications`, cue `IllegalActivity`): killing an enemy of the local police faction while holding that faction's **police licence** pays a fixed per-class **bounty** from the police representative's station; killing near a friendly "protective" station gives a relation bonus and, if no police bounty was paid, a third of the bounty. Paid in batches after a 45 s delay, with a logbook entry.
2. **Crime and police**: attacking or killing non-enemies gets you reported (police faction relation penalty) and police ships sent after you; police ships scan cargo/inventory for wares illegal to the police faction, order you to drop them, and turn hostile for 5 min if you don't. No money fines exist in vanilla; all penalties are relation changes (permanent faction relation, or temporary per-object "relation boosts"). "Criminal status" is just your relation to that faction.
3. **Relations**: one float per faction pair, -1..+1, named ranges (enemy at -0.01, killmilitary at -0.1, kill at -0.32), shown in UI as -30..+30.
4. **Bounty-like generic missions**: `GM_Assassinate` (has a "Bounty Hunting" and "Keep the Peace" variant), `GM_Destroy_RarelyOnSight` ("Bounty Set": hunt a ship by type signature), `GM_KillMasstraffic` (kill criminal traffic), `GM_TrackShip`, `GM_BoardShip`, `GM_Patrol`, `GM_Destroy_Objects`, `GM_Ambush`. Mission rewards are credits plus "notoriety" (which in vanilla just means faction relation gain).
5. **Guild missions** = "subscriptions" (`x4ep1_*_subscriptions.xml`). Only the war subscriptions run in SWI's galaxy (SWI re-gates them); the pirate, trade and police-ish subscriptions are main-galaxy only.
6. **Tides of Avarice / Ventures**: no bounty system for the player. Pirate DLC stories (Vigor Syndicate "bounty on your head", Riptide Rakers) are main-galaxy only; SWI empties `story_ventures`.
7. **Modding toolkit**: MD events for kills/attacks/bails/relation changes, script properties for relations/police/licences/illegal wares, `LIB_Create_Ships`/`LIB_Create_Enemies`, `create_offer`/`create_mission`/`set_objective`, RML libraries (`RML_Destroy_Entities`, `RML_Destroy_RarelyOnSight`, `RML_TrackShip`, ...). Vanilla 8.00 Lua menus have **no** kuertee-style callback API; mods must wrap menu functions directly or use SWI's built-in kuertee UI Extensions copies.

## 1. Kill rewards: police bounty and station-defence reward

Source: `md/notifications.xml`, mdscript `Notifications`, cue `IllegalActivity` (line 1475) and children `PlayerKills` (1715), `AttackResponse` (1848), `AccumulateRewards` (~2260), `ReputationTrigger` (~2325), `IllegalActivityReward` (~2375).

### Trigger

`PlayerKills` (notifications.xml:1715-1786) listens to `event_player_killed_object` (only kills by the ship the player is currently flying; kills by other player-owned ships do not trigger it; inferred from the event definition, see section 8). Conditions: victim `isclass.destructible`, not `isrelationchangedisabled`, owner not player/ownerless, and victim is a non-visitor defensible (or coalition ally, 8.00 only). It calls `change_relation_on_kill` (relation penalty to the victim's faction; values below), then signals `AttackResponse`.

Escape pods: killing one also propagates the same relation loss to the pod owner's faction (notifications.xml:1752-1758).

### Reward path ("no responder" branch, notifications.xml:2149-2195)

If no station/victim is set to report the player (i.e. the kill was not a crime), and the kill was a whole object (no sub-component):

1. **Police bounty**: `$object.zone.policefaction` exists, its `representative` exists, the police faction `hasrelation.enemy` to the victim, and `faction.player.haslicence.{policefaction.licence.police}` → `AccumulateRewards` with `givebounty=true`. Bounty = `$object.relationchange.policefaction.bounty` (notifications.xml:2282-2284).
2. **Station defence**: `find_station` in the player's sector, not player-owned, enemy of the victim's owner, within 30 km and within the station's `maxradarrange`; station must have a `tradenpc`, owner `isprotective` and not `isrelationlocked`. Closest one wins → `AccumulateRewards` with `givereputation=true`, `givebounty=false`.
   - Relation bonus = `$object.relationchange.killfaction.bonus` (2276).
   - If no police bounty was paid for this kill, it also pays `policefaction.bounty / 3` (2285-2288; comment: "this assumes a minimum bounty of 3. current minimum is 1500. defined in defaults.xml").

### Payout

- Rewards accumulate per rewarding NPC (`IllegalActivity.$rewardnpcs/$rewardnpcdata`). First kill sets a 45 s trigger delay; further kills shorten the extra delay proportionally so the NPC pays within 10 min max (`$triggerdelay`=45s, `$maxtriggerdelay`=10min, 2291-2312).
- `ReputationTrigger` (checkinterval 5s) waits until not in conversation/fullscreen menu and `global.$SuppressCommChatter` is off, then runs NPC use case `$IllegalActivity_Station_Defended` (a comm line) with callback `IllegalActivityReward`.
- `IllegalActivityReward` (2375-2414): `transfer_money from="$rewardnpc.container" to="faction.player"` (so the money comes out of the station's account; inferred: a broke station may pay less or nothing, untested), then relation bonus:
  - if current relation < -0.0032 (UI below -5): `set_faction_relation value = old * 0.1 ^ (bonus / 0.006401)` (so a bonus moves the UI value by the same amount even in the log range);
  - else `add_faction_relation value = bonus`, reason `relationchangereason.destroyedfactionenemy`.
- Logbook: `write_to_logbook category="general" title={1016,100}` "Rewarded for station defence", `money=$bounty`, faction = rewarding owner (2407-2413). The flight tutorial line confirms the design: "It'll pay out a bounty for each enemy you destroy near one of their stations" (`md/scenario_tutorials.xml:16246`).

### Numbers (`libraries/defaults.xml`, `<relation>` per dataset class)

| Victim class | Police bounty (licence) | Station-defence cash (bounty/3, no licence) | Relation bonus to defender (`kill/faction@bonus`) | Kill penalty to victim faction (`kill/faction@change`) | Police report penalty (`police@change`) | Line |
| --- | --- | --- | --- | --- | --- | --- |
| ship_xl | 600,000 | 200,000 | +0.01 | -0.02 | -0.0025 | 390-393 |
| ship_l | 300,000 | 100,000 | +0.005 | -0.01 | -0.002 | 511-514 |
| ship_m | 60,000 | 20,000 | +0.002 | -0.004 | -0.0015 | 624-627 |
| ship_s | 30,000 | 10,000 | +0.001 | -0.002 | -0.001 | 726-729 |
| ship_xs | 1,500 | 500 | +0.00064 | -0.001 | -0.00064 | 831-834 |
| spacesuit | 1,500 | 500 | +0.00064 | -0.001 | -0.00064 | 873-876 |
| station | 40,000 | 13,333 | +0.02 | -0.1 | -0.0032 (also scan/hack -0.0032) | 945-964 |

Format notes in the header comment of `defaults.xml` (lines 4-41): `police@bounty` "is money for killed enemy in Cr"; `kill/faction@bonus` "is a relation bonus from another faction which considers the killed object as enemy". Attack tolerance for ship_s: `tolerance threshold=-1 change=-1.00 decay=0.05 delay=10`, `boost absolute=-1.0 decay=0.02 delay=540` (722-725), i.e. one deliberate hit on a ship_s sets a temporary -1.0 object boost for ~9 min.

0.00064 relation = 1 UI step in the neutral band, so killing an XS enemy near a defender is roughly +1 UI, an XL about +10 UI in the neutral band (from factions.xml mapping, section 3).

### SWI

- `SWI/libraries/defaults.xml` (196 lines, a diff) changes storage/countermeasures only; no `relation`/`police` nodes, so the bounty table above is unchanged in SWI (grep for police|bounty|relation found nothing).
- `SWI/md/notifications.xml:450-459` adds a condition to `PlayerKills`: kills whose idcode is in `global.$kProfs_Sanctions.$sanctionedKillIds` are skipped (kuertee Professions "sanctioned kills"). Inferred consequence: a sanctioned bounty-contract kill gets neither the relation penalty nor the vanilla police bounty/station reward. Lines 474-517 make sanctioned attacks/kills not reported (relation penalty chance 0, police signal chance 0).
- SWI factions with police licences (`SWI/libraries/factions.xml`, `licence type="police"`, `minrelation="0.01" price="100000" maxlegalscan="2" precursor="ceremonyfriend"`): galempire (129), ascendancy (173), newrepublic (217; rebelalliance uses newrepublic as police, 255), corporate (329), commerceguild (383), huttcartel (434), mandodw (482), anoat (537), hapes (975, price 10000), kamino (policefaction only, 1011). So the vanilla police bounty works in SWI space once the player buys a licence (inferred: requires the faction representative to exist).

### 9.00

`V9/md/notifications.xml` diff vs 8.00: the `iscoalitionally` check is removed from `PlayerAttacks`/`PlayerKills` (8.00 lines 1509, 1724) and a `remove_value $reason` added after the station-defence signal; reward logic and `defaults.xml` police/kill values are unchanged.

## 2. Police, scans, illegal wares, contraband, criminal status

### Police faction and licence

- `sector/zone.policefaction` = police faction of the space owner; `faction.policefaction`, `defaultpolicefaction`, `ispolice` (`libraries/scriptproperties.xml:1281,1290,1770-1771,1805`).
- Vanilla police licences: `licence type="police" ... minrelation="0.01" precursor="ceremonyfriend" price="156000" maxlegalscan="2"` (`libraries/factions.xml:187,227,348,443,514,660`); other factions borrow, e.g. alliance `policefaction="paranid"` (91). Licence text {20207,1001} "Federation Police Licence"; description {20207,1002} explains the issuer is the police authority of its space.
- Licence grant flow: `md.PlayerReputation` (`md/playerreputation.xml`) recalculates licences on relation change (`CalculateLicences`, ~367 `add_licence`) and notifies "You can now purchase: ..." for police licences (`DelayedPoliceNotification`, 603-614). Police licences are bought, not granted. SWI removes the main-galaxy gate on `TrackPlayerReputation` (`SWI/md/playerreputation.xml:92`), so this runs in SWI.
- Effects of holding it (from code): police bounty (section 1); `maxlegalscan` (scan level you may use without penalty, `scriptproperties.xml:134-135 maxlegalscanlevel`); higher chance (40% vs 25%) of a "rapid response" police comm event when criminal mass traffic is spotted near a station (`notifications.xml:1632-1712`, cue `RapidResponse`, `event_object_enemy_found` on `faction.criminal` masstraffic; flavour lines only, no reward).

### Being reported (crime)

`AttackResponse` (notifications.xml:1848-2148): when the player attacks/kills a non-enemy ship near a non-hostile station with a `defencenpc` (30 km, in radar), or the victim itself, it warns (after `$firstattacktolerance` 3s; warning interval 40s) then reports (report interval 2 min). Report → `IllegalActivityRetaliate` (2216-2255):

- `add_faction_relation faction.player ↔ lawnpc.owner value = $object.relationchange.policefaction.change` (table above), reason = kill/attack reason, unless the player has cover (`has_cover`) or the victim is an enemy of the police (known felon: no penalty).
- `signal_objects object="$reporter.sector" param="'police'" param2=$perp param3=$victim`: only if the perpetrator is still in that sector ("to give perpetrators a chance to get away", 2244).
- Police ships handle `'police'` signals: `aiscripts/masstraffic.police.xml:70,92` (`$attackreason='CALL_FOR_HELP'`), `aiscripts/move.seekenemies.xml:287,463` (also strips cover: `signal_objects ... 'LoseCover'`), `aiscripts/order.move.recon.xml:169`.

### Police scans and contraband

`aiscripts/order.move.recon.xml` (order `Recon`, param `police`, line ~16: "Police investigation. Look for disguised criminals or smuggled goods?"):

- Halts target (line 11202 voice "(ship scan warning - cargo)"; signal `policehalt` with responses attack/comply/distract/flee/wait, `libraries/factions.xml:62-68`).
- Illegal cargo found with chance `100 - $localtarget.hidecargochance` (1436); illegal pilot inventory found with `$reportchance` (1439). `$reportchance` = police pilot `combinedskill` × (1 - relation) if relation ≥ 0; pirate stations (hatikvah/scaleplate) only 10% ("bribery!"); paranid/holyorder/trinity police always 100 (1389-1402).
- If the player ship is carrying contraband and not hostile: conversation `g_playership_illegalcargo` / `g_playership_illegalinventory`, signal `police_illegalfound_player`, 2 min to drop it (1455-1500).
- Non-compliance: `set_relation_boost object=police otherobject=target value=-1.0 decay=1 delay=5min reason=relationchangereason.illegalcargo` both ways, `ship_in_distress` and `'police'` signals to the sector (1500-1610). That is: that police ship (and responders) turn hostile for ~5 min; no permanent faction penalty from the scan itself.
- Player-owned NPC ships: signal `policefoundcontraband` (default response `destroy`, others `collect`/`ignore`, `factions.xml:57-61`); logbook {1036,151} "Found Contraband", {1036,152} "Smuggler dropped contraband".
- Illegal player build plots: `add_faction_relation -0.001 reason=illegalplot` + logbook {1016,120} (recon 1375-1385).
- Station scanning/hacking detected: `relationchange.attackfaction.scan/hack`, `relationchange.policefaction.scan/hack` (`scriptproperties.xml:101-111`; station values -0.0032).

Illegal ware properties: `ware.illegal`, `ware.illegalto.{$faction}.{$faction}` (takes licences into account), `cargo.illegalto.{$faction}`, `inventory.illegalto` (`scriptproperties.xml:1887-1943`); `hidecargochance` (765); `software.police` (373, police scanner software).

### Cover / disguise

`coverowner` vs `trueowner` (`scriptproperties.xml:69-70`). Police scans uncover covered ships (`signal_objects ... 'LoseCover'`, recon 1445-1450). Reports are skipped when the attacker has cover (notifications `$IllegalActivity_Station_Retaliate_Warning` use case and `has_cover`).

### "Wanted" / criminal status

No wanted flag or criminal record exists in vanilla 8.00 or 9.00 (no `bounty`/`wanted` property in `scriptproperties.xml`; `grep -i bounty` in `ui` finds nothing). Criminal status = your faction relation to the police faction (permanent) plus temporary `set_relation_boost` hostility on specific ships. `IllegalActivity.$lawnpc.$NumPlayerReports` (notifications.xml:2228) is the only per-faction report counter, on the law NPC's blackboard; nothing reads it in vanilla (inferred from grep).

### 9.00

`V9/aiscripts/order.move.recon.xml` (84 changed lines): the attacked-handler no longer sets the -1.0 boost on attackers itself; it now requires `this.mayattack.{$attacker}` and aborts called scripts to resume `lookfortrouble`; stealth stance now via `activate_ship_stance_by_tag tags=[tag.covert]`. New 9.00 aiscript `V9/aiscripts/lib.boost.relations.xml` (library `BoostRelations`: `$_boostobject`, `$_otherboostobject` or `$_boostfaction`, defaults desired relation `kill.min`, delay 10min). Contraband/scan rules otherwise unchanged.

## 3. Relations and tiers

`libraries/factions.xml:3-27` (header comment):

| Range | Relation | UI |
| --- | --- | --- |
| self | 1.0 | 30 |
| ally | 0.5 to 1.0 | 27+ |
| member | 0.1 to 1.0 | 20+ |
| friend | 0.01 to 1.0 | 10+ |
| neutral | -0.01 to 0.01 | -10..10 |
| enemy | -1.0 to -0.01 | ≤ -10 |
| killmilitary | -1.0 to -0.1 | ≤ -20 |
| kill | -1.0 to -0.32 | ≤ -25 |
| nemesis | -1.0 | -30 |

UI mapping: `uivalue = 10 * log10(relation * 1000)` outside ±0.0032; linear between UI -5..+5 with 0.00064 per step. Key fixed points 0.0032=5, 0.01=10, 0.032=15, 0.1=20, 0.32=25, 0.5=27, 1.0=30.

Script access: `faction.relationto.{$faction}`, `hasrelation.<range>.{...}`, `relation.<range>.min/mid/max`, `relation.{$n}.uivalue`, `isrelationlocked`, `mayattack`, `ishostileto` (`scriptproperties.xml:87-119,1777-1794`). Actions `add_faction_relation`, `set_faction_relation`, `set_relation_boost`, `add_relation_boost`, `change_relation_on_kill`, `change_relation_on_attack` (`libraries/common.xsd:19821,34546,34955,20415,21335`). Reasons (`relationchangereason.*`, common.xsd:4690-4701): missioncompleted, destroyedfactionenemy, smalltalkreward, attackedobject, boardedobject, killedobject, hackingdiscovered, scanningdiscovered, illegalcargo, missionfailed, tradecompleted, illegalplot.

Licence thresholds (vanilla): basic ship/equipment -0.01; ceremonyfriend / military / police 0.01 (UI 10); ceremonyally / capital 0.1 (UI 20) (`factions.xml:95-110`).

SWI: `SWI/md/notifications.xml:4` adds `check_value event.param3 != null` to `BaseRelationChanged` ("reactive factions - dont show notification with minuscule changes").

9.00: `factions.xml` only adds `nobuildunits` to xenon; ranges unchanged.

## 4. Bounty-like vanilla missions

All generic missions (GMs) are started by `md.GenericMissions` (`md/genericmissions.xml`). On sector change / every 10 min (`OnSectorChange` 70, `MoreOffers` 81), `EvaluateSectorMissions` (107-160) creates up to `min(stations*0.75, SectorLimit - existing + (3 if no active mission))` offers; `$SectorLimit=7` (line 13). Excluded offering factions: player, xenon, khaak, criminal, civilian, ownerless (14). Mission picked uniformly from a `do_any` list in `SelectMission_Signal_GM` (171-212).

SWI: `SWI/md/genericmissions.xml` raises `$SectorLimit` to 10, removes `GM_DeployInPlace`, adds a second `GM_BarterWares` entry (double weight). SWI diffs on GMs set `OfferDistance` default to 350 km (e.g. `SWI/md/gm_assassinate.xml:3`, also gm_destroy_rarelyonsight, gm_killmasstraffic) and add kuertee Professions hooks (`$MissionGroup` param, `GMMissionEnd` signal with `$repu_Defender`).

Reward formula (`md/lib_reward_balancing.xml`):

- `GetValue_Credits` (51-108): difficulty factor trivial/veryeasy 1, easy 1.4, medium 8, hard 40, veryhard 400, impossible 1000; × `1 + (MissionLevel-1)*0.1` (MissionLevel clamped 1..10).
- `Reward_Money` (285-352): × random 24,000..26,000, × relation boost (hard+: 1→3× between relation 0.1 and 1.0; medium: 1→2× between 0.01 and 0.1; easy and below: 1→2× between 0 and 0.1), × random 1..1.3 (decreasing profile), rounded to 10 Cr. E.g. a medium level-1 mission at neutral ≈ 8 × 25,000 ≈ 200,000 Cr (inferred arithmetic).
- `GetValue_Notoriety`/`Reward_Notoriety` (111-432): factor trivial/veryeasy 1, easy 1.2, medium 4, hard 10, veryhard/impossible 20; × level factor × 0.001. "Notoriety" = faction relation reward: on success `add_faction_relation faction.player ↔ $ClientOwner value=$RewardNotoriety reason=missioncompleted` (`md/gm_assassinate.xml:713`). Wares also have `buyrestriction`/`sellrestriction` "notoriety" fields (`scriptproperties.xml:1849-1852`). No separate notoriety stat exists.
- SWI patches `Apply_RewardMultiplier` for kuertee guild mission groups incl. `missiongroup.bountyHunters_guild` (+1 multiplier on trivial/veryeasy/easy, plus template bonus) (`SWI/md/lib_reward_balancing.xml`).

### GM_Assassinate (`md/gm_assassinate.xml`, page 30134, missiontype default `missiontype.destroy`, header says `kill`)

- Generic variant: offered by **pirate** stations (`md.$PirateFactions`), target a trade/build/mine ship of any other active non-xenon/khaak faction within 2 clusters, `capturable`, not masstraffic (966-1048; offsets 100/200/300/400/4400 "Dirty Deeds", "Wetwork", "Silence Is Golden", "The Early Bird", "Intercept leaked intelligence").
- Other variants include {30134,1101} "Keep the Peace", {30134,5301} "Bounty Hunting" (Split variant: "Too much heat for Split to get rid of undesired individual... you take out target and Split share reward"), faction-flavoured targets (2101..5501). Also started from signal leaks (`md/signal_leaks.xml:951`), pirate subscriptions (`x4ep1_pirates_subscriptions.xml:1755`), war subscriptions (`x4ep1_war_subscriptions.xml:16774`).
- Flow: `create_offer ... faction opposingfaction=target.owner type reward rewardtext hidden space` with `<briefing><objective step="1" action="objective.kill" object="$AssassinationTarget"/>` (384-389) → on accept `create_mission`/`update_mission` (587-598) → `md.RML_Destroy_Entities.DestroyEntities` (669) → success: `add_faction_relation` notoriety, `reward_player money`, logbook via `md.GenericMissions.GenericCompleteLogbookEntry`, `remove_mission type="completed"` (712-740). Feedback `TARGET_KILLED_EARLY` if target dies during the offer.
- 9.00: `GenerateGenericMission` v3 takes `$OfferObject` from the caller (9.00's manager now picks the offer station; see section 9).

### GM_Destroy_RarelyOnSight (`md/gm_destroy_rarelyonsight.xml`, page 30154)

- "Destroy Rarely Onsight - intended for Master Missions". Variants {30154,1001} "High-Profile Military Target(s)", {30154,1201} **"Bounty Set"**: "A dangerous criminal is loose. As of yet, no one has been able to give us the ID code belonging to their ship, but we have enough reports..." ({30154,1202}); illegal signal-leak variants 1101 "Sending A Message", 1301 "On the Lookout"; faction war variants 2001-2701.
- Bounty Set target spec = `get_ship_definition faction=$EnemyFaction size=class.ship_m tags=[tag.mission, tag.trader]` (`Setup_Criminal`, 1127-1139); if the enemy faction is criminal/smuggler it is swapped to xenon/khaak (1257-1259). Requires an enemy station within 3 clusters.
- `md.RML_Destroy_RarelyOnSight.DestroyRarelyOnSight` (`md/rml_destroy_rarelyonsight.xml`): params `TargetSpec` (macro/equipment/wares/mods), `TargetCount`, `TargetFaction`, `AllowBailing`. It does **not** spawn the target (the `create_ship` at 113 is a debug cue); it waits for any matching ship: `CheckProximity` every 17s uses `find_gravidar_contact` for matching macro/faction and makes the ship computer speak (cooldown 10-20 min); `CheckMissionStatus` listens to `event_player_owned_killed_object` and the `player_owned_forced_bail`/`boarded_object` signals (241-253), then checks the killed ship against the spec. Text {30154,101}: "the target signature has been loaded into your ship computer... notify you whenever matches are detected". Closest vanilla thing to an open bounty.

### GM_KillMasstraffic (`md/gm_killmasstraffic.xml`, page 30150)

"Shakedown", "Eye For An Eye", "Preventative Measures", "Law and Order" ("stark increase in criminal traffic... authorised to use lethal force", {30150,1002}), plus "Blink And You'll Miss It", "Chaos and Confusion" (distraction: kill station traffic). Spawns criminal mass traffic with `add_mass_traffic_quota job=$CriminalMasstraffic` (691) where the job id is chosen by station owner: argon/antigone → `masstraffic_argon_criminal`, paranid/holyorder/alliance → paranid, teladi/ministry → teladi, Split → split, Terran → terran (612-645). Kills counted when `event.param.ismasstraffic` and `owner == faction.criminal` (715-721).

SWI: `SWI/libraries/jobs.xml` replaces `//jobs` wholesale; it defines `masstraffic_galempire_criminal`, `masstraffic_sith_criminal`, `masstraffic_newrepublic_criminal` (21872-21897) and keeps only `masstraffic_teladi_criminal` (22170) and `masstraffic_split_criminal` (22230) from the vanilla ids. Since SWI stations are owned by SWI factions, none of the vanilla owner checks match (inferred), so `$CriminalMasstraffic` stays unset and the criminal-traffic variants probably do not spawn targets in SWI. Open question. **SWI 0.91 fixes this:** its `gm_killmasstraffic.xml` replaces `ActivateMission`'s actions and picks the criminal job by SWI sector owner, and the three SWI criminal jobs go to 2 per sector. Whether SWI offers the mission at all is still unchecked ([swi-0.91-diff.md](swi-0.91-diff.md) §6).

### Others

- `GM_TrackShip` (page 30153; "Xenon Hunt", "Locate an escaped detainee", "Track Suspected Informer"), `md.RML_TrackShip.TrackShip`: tracker position starts 20 km off and gets more accurate; detection at 10 km, success at 8 km, 60 s limit after detection (`md/rml_trackship.xml` params). Good template for "find the fugitive".
- `GM_BoardShip` (page 30152; "Ship Seizure", "Troublesome Agent", "Keep It in One Piece"), `RML_BoardShip` with `TargetShip` or `TargetSpec`. Template for "bring them in alive".
- `RML_EnforceSurrender` (`TargetShieldPercent`, `TargetHullPercent`): make a ship drop an item when beaten down; template for "disable, don't kill".
- `RML_Capture` (claim or board a target of faction/class in a space).
- `GM_Patrol` with `RML_Patrol` (`KilledEnemySignalCue` gives `[$enemy, $killer]`, `EscapedEnemySignalCue` for escape pods, `PirateShips` uses cover).
- `GM_Destroy_Objects` (page 30137: "Intimidate a Debtor", "Strip the Ship of its Defences", "Insurance Fraud"...), `GM_Ambush` (page 30159 "A Trap!").

## 5. Guild missions (subscriptions) and DLC features

- Mission groups (`libraries/missiongroups.xml`): `argon_police` {30206}, war groups, `antigone/teladi_trade_guild`, `scaleplate_pirates` {30207}. Map menu has an offer category "guild" (`ui/addons/ego_detailmonitor/menu_map.lua:1494`).
- Galaxy gating: `x4ep1_pirates_subscriptions.xml` Start requires `player.galaxy.macro == macro.xu_ep2_universe_macro` (line ~30), as do trade subscriptions (`x4ep1_trade_subscriptions.xml:35`) and war subscriptions (`x4ep1_war_subscriptions.xml:122`). SWI replaces the war one's condition with `macro.swi_galaxy_macro` (`SWI/md/x4ep1_war_subscriptions.xml:41`) and adds SWI war groups (`SWI/libraries/missiongroups.xml`). So in SWI only war subscriptions run; the pirate guild (which carries Assassinate) and trade guilds don't (inferred). SWI's galaxy is `swi_galaxy_macro` (`SWI/libraries/gamestarts.xml:1055-1064` for `x4ep1_sw_bhg`).
- Tides of Avarice (`extensions/ego_dlc_pirate/md/`): factions `loanshark` (Vigor Syndicate, `factionlogic.xml:12`) and `scavenger` (Riptide Rakers). The only "bounty" is story text: "the twins have put a bounty on your head, and the entirety of the Vigor Syndicate is looking to collect" (`story_thefan.xml:15272`). Stories are main-galaxy gated (e.g. `story_criminal.xml` Start checks `xu_ep2_universe_macro`), so they don't run in SWI. No player-facing bounty or notoriety system in the DLC.
- Ventures: online features (venture seasons/operations, `menu_map.lua:1029,1108`); 8.00 has an empty `coalitions.xml` "imported through the ego_dlc_ventures extension" (`libraries/coalitions.xml:2`) and `coalition`/`iscoalitionally`/`iscoalitionenemy` properties (`scriptproperties.xml:1772-1774`), plus a "coalition" mission category in the map (1495, 1507). SWI empties `story_ventures` (`SWI/md/story_ventures.xml`, `<replace sel="//mdscript/cues"><cues/></replace>`). 9.00 removes coalitions entirely (no `coalitions.xml`, properties gone, map has no coalition category, `V9/.../menu_map.lua:1505-1509`).

## 6. Bounty/target UI in vanilla

- No bounty/wanted UI anywhere (no "bounty" in `ui`).
- Mission offers: map menu "Mission Offers" tab with categories plot/guild/coalition/other and tabs normal/operation (`menu_map.lua:1492-1502`); mission briefing menu `menu_missionbriefing.lua`; offers show `reward`, `rewardtext`, `faction`, `opposingfaction`, `difficulty` from `create_offer`. Lua listens for `missionofferremoved`/`missionremoved` events (`menu_map.lua:6806-6808`).
- Relations: `menu_diplomacy.lua`, `menu_playerinfo.lua` (factions/relations), logbook in player info.
- Notifications/logbook: `show_notification` (common.xsd:36133), `write_to_logbook category=... money= faction= object= interaction="showonmap"` (37611), `speak actor="player.computer"` (as used by RarelyOnSight).

## 7. SWI vs vanilla, quick list

| Vanilla feature | SWI 0.90 | Source |
| --- | --- | --- |
| Police bounty / station-defence reward | Active; kuertee sanctioned kills excluded | `SWI/md/notifications.xml:450-517` |
| Bounty/relation numbers | Unchanged | `SWI/libraries/defaults.xml` |
| Police licences | SWI factions have them (100k Cr, Hapes 10k) | `SWI/libraries/factions.xml` |
| Reputation/licence tracking | Galaxy gate removed | `SWI/md/playerreputation.xml:92` |
| Generic missions | Limit 10/sector, 350 km offer distance, guild hooks, no DeployInPlace | `SWI/md/genericmissions.xml`, `SWI/md/gm_*.xml` |
| Kill-masstraffic criminal spawn | Probably broken (job ids) | `SWI/libraries/jobs.xml` (inferred) |
| Pirate/trade subscriptions | Not running (main galaxy only) | `md/x4ep1_*_subscriptions.xml` |
| War subscriptions | Re-gated to SWI galaxy | `SWI/md/x4ep1_war_subscriptions.xml:41` |
| Ventures intro | Emptied | `SWI/md/story_ventures.xml` |
| Bail logic for player-owned attacks | Replaced (`PlayerOwnedShipAttacks` iscapturable block) | `SWI/md/notifications.xml:45` |
| Menus | Replaced with kuertee UI Extensions copies | `starwarsmod_m1`/`subst02/ui/addons/` (see project mods.md) |

## 8. Modding toolkit on 8.00

### MD events (definitions in `libraries/common.xsd`)

| Event | Params | Line | Notes |
| --- | --- | --- | --- |
| `event_object_destroyed object=` | param = killer, param2 = kill method, param3 = was parent killed | 13814 | Attach to a specific target (e.g. a bounty ship). Killer can be null or a component; use `.isplayerowned`, `.owner`. |
| `event_player_killed_object` | param = killed, param2 = method | 15650 | Only the player's currently controlled object. Used by vanilla `PlayerKills`. |
| `event_player_owned_killed_object` | param = killer, param2 = killed, param3 = method | 15760 | Any player-owned object incl. player; good for wingmen/fleet kills (RarelyOnSight uses it). |
| `event_object_killed_object object=` | param = killed, param2 = method | 14349 | NPC hunters killing targets. |
| `event_object_attacked object=` | param = attacker, param2 = method, param3 = component | 12944 | Detect who shot a bounty target ("first to tag"). |
| `event_player_attacked_object`, `event_player_owned_attacked_object` | | 14919, 15293 | |
| `event_object_abandoned` | | 13038 | Crew bailed (ship becomes ownerless). |
| `event_object_changed_owner` | | 13117 | Captured/claimed targets. |
| `event_object_signalled object=player.entity` param `'player_owned_forced_bail'` / `'boarded_object'` | param2 = ship | sent at `md/notifications.xml:1344` | Forced bail / boarding success. |
| `event_player_relation_changed` | object = entity or null, param = faction or null, param2 = [new, old], param3 = reason | 15830 | Track "criminal" standing changes. |
| `event_faction_relation_changed` | | 17175 | |
| `event_object_enemy_found`, `event_scan_finished` | | 14112, 16458 | Spotting/scanning targets. |
| `event_ui_triggered screen= control=` | param = screen, param2 = control, param3 = params | 11927 | Lua → MD (see UI). |
| `event_offer_accepted cue=` | | used `md/genericmissions.xml:706` | Offer accepted. |
| `event_object_signalled object=sector param='police'` | param2 = perp, param3 = victim | `notifications.xml:2242` | Hook into police calls; can also be sent by a mod to sic police on a target. |

### Script properties (`libraries/scriptproperties.xml`)

- Kill/attack: `lastattacker` (183; "may become null if attacker is killed"). There is no `killer` property; the killer comes from event params.
- Relations: `relationto`, `hasrelation.<range>`, `mayattack`, `ishostileto` (87-119); `relationchange.policefaction.bounty/change/scan/hack`, `relationchange.killfaction.change/bonus`, `relationchange.attackboost.*` (92-115), which read the `defaults.xml` values per object, so a mod can reuse vanilla bounty sizing via `$ship.relationchange.policefaction.bounty`.
- Police/licences: `sector/zone.policefaction` (1281/1290), `faction.policefaction`, `representative` (1814), `ispolice` (1805), `isprotective` (1806), `haslicence.<type>.{$faction}` (121, 1795), `licence.<type>` with `price/minrelation/precursor` (1617-1627, 1800), `canholdlicence` (1796-1797), `maxlegalscanlevel` (134-135), `software.police` (373).
- Contraband: `ware.illegalto.{$f}.{$f}`, `cargo.illegalto`, `hidecargochance` (765, 1887-1943).
- Identity/knowledge: `knownname` (49), `isknown` (86), `idcode`, `coverowner`/`trueowner` (69-70), `isvisitor` (259), `ismasstraffic` (210), `threatscore` (182), `boardingstrength` (439, marines + officer), `suspicious` (218, 8.00 only).
- Actions: `set_known` (common.xsd:20074), `set_object_name` (33741), `create_ship` (24644), `find_ship` (27791), `reward_player money=` (32164), `transfer_money`, `write_to_logbook`, `show_notification`, `add_faction_relation`, `set_relation_boost` (as section 3).

### Ship spawning

- `create_ship` with `<select faction= size= tags= required=/>` or `macro=`/`ref=`, `<owner exact= overridenpc=/>`, `<safepos .../>`, `groupname=` (as in `md/lib_create_ships.xml:312-377`).
- `md.LIB_Create_Ships.Start` (`lib_create_ships.xml:8-50`): `Ship_Amount`, `Ship_Faction`, `Ship_Class`, `Ship_Ref`, `Ship_Macro`, `Ship_CategoryFaction`, `Ship_Category_Size`, `Ship_CategoryTags`, `Zone`/`Sector`/`PositionObject`/`Position`, `SafePos*`, `MinRange` 1km/`MaxRange` 3km, `Dock`, `AllowHighways`, `AllowBoostingIn`, `AllowJumpBeacon`, `Pilot_DoCreate`, `Pilot_Essential`; result in `$GroupCue.$LIB_Create_Ships_Result`, end via `EndSignalCue`. Also `SpawnShipsByDefinition` (588) for fleets with subordinates.
- `md.LIB_Create_Enemies.Start` (`lib_create_enemies.xml:24-56`): enemy fleet by `Difficulty`, `MissionLevel` 1-10 or `EnemyPoints`, `Ship_Faction`, `Ship_CategoryFaction`, `Ship_AdditionalTags`, `GetSuitableFaction`; result `$GroupCue.$LIB_Create_Enemies_Result`.
- `get_ship_definition macro= faction= size= tags=` (as in RarelyOnSight `Setup_Criminal`).
- SWI note: SWI replaces the ship library and jobs, so category selection must use SWI factions with ships (see project `mods.md` notes on `indibhg`, `blacksun`).

### LIB_Generic (`md/lib_generic.xml`)

Libraries: `GenerateGenericVoiceTable`, `GenerateTextTable_BriefingWarning_Call`, `GenerateRewardText`, `CalculateReputation`, `CalculateReputationDrop`, `Spawn_Ship_Formation`, `Spawn_Attack_Wave`, `CreateShipAtExitGate`, `CreateFleetAtExitGate`, `FindSectorEntryPoints/ExitPoints`, `FindNearestEnemySectorForFaction`, `DetermineEnemyFaction` (used by RarelyOnSight), `CheckShipMatches`, `ForceShipHalt`, `RequestObjectInvincibility`, `SetObjectOwner`, `TransferShipOwnership`, `SuppressChatter_*`, `GetSectorSafety`, `ReachedSector`/`LeftSector`, and more. SWI only removes a lasertower macro from `PlaceLasertowerfield` (`SWI/md/lib_generic.xml`).

### Missions: offers, objectives, guidance

- `create_offer cue= location= distance= name= description= difficulty= actor= faction= opposingfaction= type= reward= rewardtext= hidden= space= group=` with `<briefing><objective step= action="objective.kill" object= encyclopedia=/></briefing>` (`libraries/md.xsd:2603`; usage `gm_assassinate.xml:384-389`). `group=` ties it to a mission group (SWI uses it for guild missions).
- `create_mission cue= missionthread= name= description= difficulty= faction= opposingfaction= type= reward= rewardtext=` or `create_mission cue= offercue=` to convert an accepted offer (`md.xsd:2511`; `gm_assassinate.xml:587-606`).
- `set_objective cue= step= action= object= text= encyclopedia=` sets the active objective and guidance (`md.xsd:3842`; `rml_destroy_rarelyonsight.xml:330`); `update_mission` (`md.xsd:3939`); `remove_mission cue= type="completed|failed|aborted" reason=` (`md.xsd:3057`). `$MissionCue.hasguidance` tells if it is the active mission.
- The simplest bounty mission is `md.GenericMissions.OfferMission` (genericmissions.xml:454) + `md.RML_Destroy_Entities.DestroyEntities` (`Targets_Param`, `Objective` default `objective.kill`) or a hand-rolled `event_object_destroyed` cue.
- Registering a new GM in the station offer rotation: diff-add a `<set_value name="$Cue" exact="md.MyBounty.GenerateGenericMission"/>` into `//cue[@name='SelectMission_Signal_GM']//do_any` (as SWI does for BarterWares) and append to `md.GenericMissions.Manager.$StaticGMCues` (`genericmissions.xml:30-57`, `gm_assassinate.xml:13-14`). Inferred: 9.00 replaced this `do_any` with `$MissionWeightTable`, so such a patch is 8.00-specific.

### UI side on 8.00 (vanilla, without kuertee UI Extensions)

- Lua files load through an extension's `ui.xml` addon (`<addon><environment type="menus"><file name="..."/>`, format as `ui/addons/ego_detailmonitor/ui.xml`, schema `ui/core/coreaddon.xsd`).
- Menus register themselves in the global `Menus` table (`table.insert(Menus, menu)`, `menu_map.lua:1771-1775`, `name = "MapMenu"` at 1026). Vanilla 8.00 has no callback registry (`grep registerCallback|uix|callbacks` in `ui` finds nothing); `Helper.registerMenu`/`createCustomHooks` (`helper.lua:878, 1227`) only wire row/selection hooks. So without kuertee, a mod finds the menu in `Menus` by name and wraps its functions (e.g. the info-frame or mission-list builders), which breaks when Egosoft or another mod changes them (inferred, standard practice).
- MD → Lua: `raise_lua_event name= param=` (param string/number/component; common.xsd:30578; used e.g. `md/boarding.xml:711`); Lua side `RegisterEvent(name, fn)` (`menu_map.lua:1812,6113`).
- Lua → MD: `AddUITriggeredEvent(screen, control, param)` (e.g. `menu_map.lua:2352`) → MD `event_ui_triggered screen= control=`.
- Data passing: MD blackboard values readable from Lua via `GetNPCBlackboard`/player blackboard (inferred standard; not checked here).
- In SWI, the map/docked/playerinfo/interact menus are already SWI's kuertee UI Extensions copies (project `mods.md`), so a bounty mod for SWI should target those callbacks, not vanilla function wrapping.
- 9.00: vanilla 9.00 UI also has no callback API (same grep on `V9/ui` finds nothing); `menu_map.lua` grew 29,783 → 31,103 lines and dropped coalitions.

## 9. 8.00 vs 9.00 differences (relevant)

1. `notifications.xml`: coalition-ally checks removed from `PlayerAttacks`/`PlayerKills`; reward/bounty logic otherwise the same.
2. Coalitions removed: `coalitions.xml`, `coalition`/`iscoalitionally`/`iscoalitionenemy` properties, map "coalition" mission category.
3. `genericmissions.xml` (348 changed lines): mission selection rewritten into `$MissionWeightTable` with per-mission `$minRelation` (dock / not-fighting thresholds), the offer station chosen centrally (`$PotentialOfferStations`), station-type chance boosts (`$Chance_Fight` high at defence stations and pirate bases, `$Chance_Trade` at trade stations, wharfs, equipment docks; barter limited to one per station). GMs take `$OfferObject` from the manager (`gm_assassinate.xml` `GenerateGenericMission` v3). Patches that add to 8.00's `do_any` won't apply on 9.00.
4. `order.move.recon.xml`: police attacked-handler logic changed; covert stance by tag.
5. New aiscript `lib.boost.relations.xml` (`BoostRelations`).
6. New script properties: `isdetectedby.{$faction}` (resource areas), `madscore.*`, `isswarm`, `istargetable`, `istorpedo`, `incomingmissilecount`, `maxcombatrange.*`, `referenceprice`, `buy/sellpriceoverride`, `audiologs`; removed: `suspicious`, `coalition*`, VR inputs.
7. New MD/AI elements: `add_money`, `remove_money`, `add_mad_score`/`reduce_mad_score`, `activate_ship_stance_by_tag`, `event_object_stance_activated`, `play_voice_sequence`, `set_detector_disabled`, `set_player_undocking_locked`, `stop_script_influences` and others; removed `event_area_discovered`, `find_asteroid_in_cluster`, `get_highest_resource_yield`.
8. Unchanged: `defaults.xml` bounty/relation values, `factions.xml` relation ranges and police licences, `lib_reward_balancing.xml`, `lib_create_ships.xml` (0 diff lines).

## Open questions

1. Does `transfer_money from=station` fail or pay partially when the rewarding station is short of money? (Test in game.)
2. Do SWI's kuertee bounty contracts mark their targets as sanctioned kills, so the vanilla police bounty is never paid on top? (Check `kuertee_professions*.xml` for `$sanctionedKillIds`; other agent's area.)
3. Does `GM_KillMasstraffic` produce criminal traffic in SWI, given SWI's job ids? Look for SWI redefining `md.$SplitFactions`/`$TerranFactions` and test.
4. Which SWI factions have a `representative` (needed for police bounties) and do their police ships run `order.move.recon` police scans? SWI's `jobs.xml` and faction logic would answer it.
5. Is `faction.criminal` still active in SWI, and who owns SWI's criminal masstraffic jobs (`masstraffic_galempire_criminal` etc.)? This affects `RapidResponse` and `GM_KillMasstraffic` kill checks.
6. Does `GM_Destroy_RarelyOnSight` "Bounty Set" find target ships in SWI? It needs `get_ship_definition` with `tag.mission, tag.trader` for the enemy faction to return a ship_m macro from SWI's ship library.
7. Exact Lua-side access to MD blackboards on 8.00 (`GetNPCBlackboard` etc.) wasn't verified here.
