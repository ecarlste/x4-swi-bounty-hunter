# SWI 0.90 named bounty hunters

For playtest T06 (test-plan.md). Builds on [swi-bounty.md](swi-bounty.md) §6.1-6.2, which first listed them.

## Short answer

SWI 0.90 defines **19 named hunters** in 19 jobs, plus one commented out:

Boba Fett, Sabine Wren, Neesh, Ketsu Onyo, IG-88, Embo, Unknown Mandalorian (2 ships), Dengar,
Cad Bane, Bossk, Asajj Ventress, Amanaman, 4-LOM, Kuer Het Mes, Taros Arkeen, Nobutora,
Griff the Dreaded, Shuul Daran, Ketraar. Shiroyasha (TIE Fury) is commented out.

Shared rules for all of them:

- Owner is faction `indibhg`, shown as "Bounty Hunter" (the Guild itself is `bountyhunters`, "Bounty Hunters Guild").
- The ship's name in game is the job name (text page 999840).
- Jobs start inactive. On a main-galaxy game (every SWI gamestart, Bankrupt Bounty Hunter included) they all switch on **20-30 min of game time after start**. At the same moment the "Invitation" message from "Unknown Contact" arrives.
- One ship per job in the whole galaxy (Unknown Mandalorian: two). At most one per sector.
- They spawn in space of: Galactic Empire, Ascendancy, New Republic, Anoat, Corporate, Commerce Guild, **Hutt Cartel**, Mandalorians (`mandodw`). Shuul Daran only Empire, Ascendancy, Anoat, Hutt Cartel. `buildatshipyard="true"` is set, so they may be built at a shipyard rather than appear in open space [inferred].
- They respawn when killed. 16 jobs set `<time interval="4000"/>` (about 67 min). Nobutora, Griff and Shuul have no interval, so the engine default applies [inferred].
- Order `SWBountyHunterFighters`: wait 1-2 min, pick a random ship from EM's bounty tracker (`global.$Bounties.$pilots`), skip L/XL ships and ships with an L/XL commander, then attack it anywhere in the galaxy with no relation check.
- **They never pick the player-flown ship from the tracker**: it is never in it. A player-owned AI ship can be picked if it is in the tracker (it got there by an Attack-order kill; entries last 1 h). But once a hunter's tracker target dies, it attacks the best nearby ship of any faction, the player's included. See "When they turn on the player".
- They are **not hireable or capturable** by any SWI script (`commandeerable="false"`, no MD hire path). They can be killed.
- They take no contracts and give none.
- **They can become Hunt (Search and Destroy) targets.** Playtest hunt 4, "BH Amanaman YT-1300M (DHC-011)", was the named hunter Amanaman (see below). EM's `factions_noBountyMissions` (which includes `indibhg`) blocks the **victim's** faction and the **offering** faction, not the attacker's owner:
  - `Bounties_NewAttack` (EM 11457): ignores attacks whose victim is owned by a listed faction.
  - `Bounties_TargetDestroyed` (EM 11491): ignores kills whose victim faction is listed.
  - `Bounties_PrepareMissionsForConvo` (EM 11992): a listed faction never offers a bounty.
  - So killing an `indibhg` ship earns no bounty and `indibhg` offers none. But when a named hunter kills, say, an ICG ship, the kill is recorded against ICG, and ICG offers a bounty on that hunter. The hunters' own order (attack random tracked pilots, no relation check) makes this common. [read: code; the chain matches hunt 4]
- Player relation to `indibhg` is neutral (no entry in the player faction's relations; `indibhg` relations are locked). They fight back if attacked (`signal attacked -> attack`). They can still turn on a neutral player; see "When they turn on the player".
- Only exception that sends one at the player: the MC80 rebel start (`sw_plot_rebel.xml` `BountyHuntersAttacks`). On each sector change in an S ship, 15 % chance, up to 3 times, it repairs one `indibhg` ship, warps it near the player and orders `Attack` on `player.ship`. Not in the Bankrupt Bounty Hunter start.

## Table

Sizes come from the asset path in `starwarsmod_m1/*.cat` (`assets/units/size_s|size_m`); the macros are not unpacked.

| Name (999840 id) | Job id (jobs.xml line) | Ship group -> ship(s) | Size | Respawn | Spawn space |
|---|---|---|---|---|---|
| Boba Fett (619911) | `bountyhunters_bobba` (21542) | `bhg_firespray` -> Firespray | S | 4000 s | 8 factions |
| Sabine Wren (619912) | `bountyhunters_sabine` (21428) | `bhg_sabine` -> TIE fighter MG 50 % / Lancer pursuit 50 % | S or M | 4000 s | 8 factions |
| Neesh (619913) | `bountyhunters_neesh` (21390) | `bhg_random_small` -> Kihraxz, Y-wing BTL-A4, R-41, M12 | S | 4000 s | 8 factions |
| Ketsu Onyo (619914) | `bountyhunters_ketsu` (21409) | `bhg_lancer` -> Lancer pursuit | M | 4000 s | 8 factions |
| IG-88 (619915) | `bountyhunters_ig` (21371) | `bhg_porax` -> Porax 38B | S | 4000 s | 8 factions |
| Embo (619916) | `bountyhunters_embo` (21447) | `bhg_random_med` -> HWK-290, YT-1300, Razor Crest, VCX-100 | S or M | 4000 s | 8 factions |
| Unknown Mandalorian (619917), 2 ships | `bountyhunters_mando` (21580) | `bhg_mando` -> Mandalorian N-1 75 % / Razor Crest 25 % | S | 4000 s | 8 factions |
| Dengar (619918) | `bountyhunters_dengar` (21466) | `bhg_random_med` | S or M | 4000 s | 8 factions |
| Cad Bane (619919) | `bountyhunters_bane` (21485) | `bhg_random_small` | S | 4000 s | 8 factions |
| Bossk (619920) | `bountyhunters_bossk` (21599) | `bhg_yv666` -> YV-666 | M | 4000 s | 8 factions |
| Asajj Ventress (619921) | `bountyhunters_asajj` (21561) | `bhg_assaj` -> Lancer pursuit or Firespray | M or S | 4000 s | 8 factions |
| Amanaman (619922) | `bountyhunters_amanaman` (21504) | `bhg_random_med` | S or M | 4000 s | 8 factions |
| 4-LOM (619923) | `bountyhunters_4lom` (21523) | `bhg_random_small` | S | 4000 s | 8 factions |
| Kuer Het Mes (619924) | `bountyhunters_kuertee` (21618) | ship `indibhg_kuertee` -> `bhg_random_med` | S or M | 4000 s | 8 factions |
| Taros Arkeen (619925) | `bountyhunters_taros` (21637) | ship `indibhg_taros` -> `bhg_random_small` | S | 4000 s | 8 factions |
| Ketraar (619930) | `bountyhunters_ket` (21656) | ship `indibhg_ket` -> `bhg_ket`: X-wing T-65B 50 % / N-1 50 % | S | 4000 s | 8 factions |
| Nobutora (619927) | `bountyhunters_nobu` (21693) | ship `indibhg_nobu` -> `bhg_porax` -> Porax 38B | S | no interval set | 8 factions |
| Griff the Dreaded (619928) | `bountyhunters_griff` (21711) | ship `indibhg_griff` -> `bhg_arc` -> ARC-170 | S | no interval set | 8 factions |
| Shuul Daran (619929) | `bountyhunters_shuul` (21729) | ship `indibhg_shuul` -> `bhg_tieadvanced` -> TIE Advanced | S | no interval set | Empire, Ascendancy, Anoat, Hutt Cartel |
| ~~Shiroyasha~~ (619926) | `bountyhunters_elratie` (21675, commented out) | `bhg_tiefury` -> TIE Fury | S | - | - |

"8 factions" = galempire, ascendancy, newrepublic, anoat, corporate, commerceguild, huttcartel, mandodw.

The six non-canon names (Kuer Het Mes, Taros Arkeen, Nobutora, Griff the Dreaded, Shuul Daran, Ketraar) look like tributes to modders, e.g. kuertee [inferred].

Not named: `bountyhunters_garrison_m` ("Garrison", 21351) is 12 Guild-owned (`bountyhunters`) medium ships patrolling at the Guild wharfs. They are active from the start and do not hunt.

## Hunt 4 (DHC-011) was the named hunter Amanaman

- Target: `yt1300_01_a_macro` (YT-1300), owner `indibhg` ([save-check-dhc-011.md](save-check-dhc-011.md) §1). YT-1300 is in `bhg_random_med`, Amanaman's ship group.
- The objective text is the ship's own `knownname` (EM 5606: `text="$MissionTarget.knownname"`); EM does not build it. The engine names job ships "<faction short> <job name> <ship short name>". Compare "CSA Escort C-70M" in the same save. So "BH Amanaman YT-1300M" = "BH" (`indibhg` short name, 501121) + "Amanaman" (job name 619922) + "YT-1300M". Only `bountyhunters_amanaman` uses that name.
- The later save of the same game (`quicksave-hunt5`, "BBH - Test 2", game time 13,685) has a new Amanaman: `hwk_290_01_macro` SLN-927, owner `indibhg`, `spawntime="13049.883"`, `<source job="bountyhunters_amanaman">`. DHC-011 died at about 9,199. The job refilled about 3,850 s later, close to its 4,000 s interval. [read: save scratch copy]
- That save also shows all 19 named-hunter jobs with a live ship.

## Bearing on the playtest (Bankrupt Bounty Hunter, first ~6 h)

- The player did meet one: hunt 4 was Amanaman, about 2.5 h in. They wake 20-30 min in, Hutt Cartel space (where Bobby starts) is one of their spawn areas, and they show up as Search and Destroy targets.
- They can attack Bobby's own ship without him shooting first: when a hunter's target dies, it picks a new target from any nearby ship. Hunt 6 showed this. See "When they turn on the player".
- The "Invitation" message from "Unknown Contact" marks the time they switched on. Its time in the logbook answers T06 step 1.
- Nothing changes at 6 h for them. 6-8 h after the hunters, the same cue activates extra capital patrols (SSD, Praetor and others) and sends another message (`setup_swmod.xml` 269-279).

## When they turn on the player

Playtest hunt 6 (2026-11-04, Bankrupt Bounty Hunter): Boba Fett (Firespray, CWH-250) was fighting the Hunt target VUA-500 (HTP = `huttpirates`). Bobby joined. After the kill, Boba attacked Bobby, then Nobutora (Porax, ZRU-226) joined. Both followed him to the debrief station in Rutan, shown red.

Paths are from `/mnt/e/x4-dev/reference/x4-8.00/base/aiscripts/` (vanilla) unless marked SWI.

### 1. How a hunter comes to target the player

The player is never in EM's tracker, so the hunter's first pick can't be the player. The switch happens inside the attack it runs on its tracker target.

- SWI `order.sw.bountyhunter.fighters.xml` 56-62: the hunter runs `order.fight.attack.object` on the tracked ship with `checkrelation=false`, `allowothertargets=true`, `pursuetargets=true`, `forceprimarytarget=true`.
- While the tracked ship lives, the hunter sticks to it (`order.fight.attack.object.xml` 667).
- When it dies, the hunter picks a new target (`order.fight.attack.object.xml` 1270-1276 -> `selecttarget` -> `lib.target.selection`).
- `lib.target.selection.xml` 62-92: with `allowothertargets`, it lists **every** gravidar contact in its sector, ship or station. `maybeattackedby` is only set when `checkrelation` is true, so there is **no relation filter**.
- Line 101 skips only: not attackable, same true owner (other `indibhg` ships), docked. Lines 105-127 skip ships in highways, build storage and XS ships.
- Scoring, lines 225-248: closer is better (full +10 within 500 m, nothing past 5.5 km); lower relation is better (-5 x relation); more DPS per remaining hull+shield is better. A neutral, armed, damaged fighter right next to the wreck tops the list. That was Bobby.
- `order.fight.attack.object.xml` 758-779: the target is not hostile, but `checkrelation` is false, so the hunter forces it. Line 779 ("HACK: force relation boost from this to player, if check relation is false") sets its own relation toward the target to kill level: `set_relation_boost ... value="this.owner.relation.kill.min" decay="1" delay="10min"`. That is why the hunters show red.
- Nobutora took the same path [inferred]: its own target died near Bobby, or it was in a sector Bobby passed through when its target died. Hunters only scan their own sector.

So Bobby did not need to hit Boba or enter the tracker. It happens to any neutral ship near a hunter when the hunter's kill lands.

Second, rarer path: if Bobby's stray shots hit Boba before VUA-500 died, the engine's attack boost makes Boba hostile to him [inferred: engine, `relationchange.attackboost.*` in `libraries/scriptproperties.xml` 97-100]. Then the in-order attacked handler (`order.fight.attack.object.xml` 166-190, needs `mayattack`) can switch to the attacker. `forceprimarytarget` makes this unlikely while VUA-500 lives.

Not the cause: the player entering the tracker. Tracker entries come only from AI attack scripts (SWI `kuertee_em_interrupts.xml` 6-58, included in `order.fight.attack.object`); the player's own flying runs no such script.

### 2. How long it lasts and what ends it

- No timer. `pursuetargets=true` and the order has no timeout. After each fight pass the hunter returns to the fight while the target can be attacked (`order.fight.attack.object.xml` 1221). If out of sight it flies after the target with `move.generic`, through gates (820-838). Leaving the sector does not help.
- It breaks off when the target is **docked** (749-751) or **in a highway** (753-755, 804-806), the target dies, or the move fails. Then it picks again (`acquirenewtarget`).
- Docked ships are skipped by the new pick (`lib.target.selection.xml` 78 `docked="false"`, 101 `@$target.dock`). **A docked player is safe from the pick.**
- After docking, the hunter attacks another nearby non-`indibhg` ship, or, with none left, ends the attack. Then the SWI loop waits 1-2 min and picks a new random tracked ship anywhere in the galaxy (fighters.xml 33-35), and flies off.
- Risk on undocking: if the hunter is still in the sector fighting something else, Bobby is again a candidate each time its target dies. The relation boost from line 779 also holds 10 min before it starts to decay (decay rate unit not documented).
- The EM tracker's 1 h expiry is irrelevant: the player is not in it.

### 3. Relations and station defence

- `indibhg` relations are `locked="1"` (SWI `libraries/factions.xml` 1619): "don't change permanently" (`libraries/factions.xsd` 280). The hunters' boost is per object and decays. Player-`indibhg` faction relation stays neutral; other hunters are not made hostile by it.
- Shooting back once they are red is a fight with a hostile ship. Hitting one while it is still neutral counts as an attack on a neutral [inferred: may draw a police report in a policed sector, `md/notifications.xml` ~2100].
- Killing one pays nothing (EM `factions_noBountyMissions`, above) and it respawns (about 67 min for Boba; engine default for Nobutora).
- Station defence: probably no help [inferred]. Station turrets engage the station owner's enemies. The hunter's hostility is a boost toward the player only; it stays neutral to Rutan's owner. Vanilla "call for help" (`interrupt.attacked.xml` 105-122) runs in the victim's AI, which a player-flown ship doesn't have. If the hunter later picks a station ship or the station itself (stations are valid targets, `lib.target.selection.xml` 35), the station will fight it.

### 4. Kill credit

- **Hunt (EM Search and Destroy):** one player hit is enough. `Mission_Hunt_TargetManager_Attacked` (SWI `md/kuertee_emergent_missions.xml` 6244-6253) sets `$isTargetAttackedByPlayer` on any player-owned hit. `Mission_Hunt_TargetManager_Destroyed` (6270-6303) fires on the target's death by anyone; with that flag set it goes to the debrief step (success). So Boba's kill still counted.
- **Vanilla "Destroy: <faction> (Any ship)"** (`md/rml_destroy_rarelyonsight.xml` 238-296, SWI's diff only adds profession hooks): counts on `event_player_owned_killed_object`, so only when a player-owned ship lands the killing blow, and only if the victim's owner matches. VUA-500 was `huttpirates` (HTP = 511120 in SWI `t/0001.xml` 2787), so the ICG "kill 5 Hutt Pirates" counter not moving means Boba landed the kill.

### Practical advice (for the playtest)

- Dock and debrief: safe while docked.
- After the debrief, check the map before undocking. Wait until the BH ships have left the sector (a few minutes; they wander off after 1-2 min once they have nothing to shoot), or undock and leave fast.
- Don't shoot at idle hunters. Their `AttackHandler` (fighters.xml 19) answers once the engine marks you hostile.
- When joining a hunter's fight, expect it to turn on you as soon as the target dies. Keep away from it at that moment or be ready to dock or fight.
- To shake a pursuing hunter in space: dock anywhere, or enter a highway if the sector has one.

## Version notes (0.86 vs 0.90)

Same in both: the job block in `jobs.xml`, `order.sw.bountyhunter.fighters.xml`, the `bhg_*` ship groups and the `indibhg_*` ships. Only line numbers differ in `setup_swmod.xml` (0.86: delay at 97, activation 99-118; 0.90: 246, 248-267).

Both versions have a typo in the save-upgrade patch (`sinceversion="2"`): it activates `'bountyhunters_shul'`, not `shuul`. It only matters for saves started before that cue version; a new game uses the correct id.

## Sources (SWI 0.90, `/mnt/e/x4-dev/reference/mods/swi-0.90/`)

- `ext/libraries/jobs.xml` 21351-21745: the jobs (name, quota, location, `<time>`, owner, `commandeerable="false"`, default order).
- `ext/t/0001.xml` 3001-3021: names (page 999840); 2563-2566: faction names; 3152-3154: "Unknown Contact", "Invitation" text.
- `ext/libraries/ships.xml` 3789-4019: `indibhg_*` ship entries and their groups.
- `ext/libraries/shipgroups.xml` 1688-1757: `bhg_*` groups -> macros.
- `starwarsmod_m1/*.cat`: macro paths, giving size_s / size_m.
- `ext/md/setup_swmod.xml` 7-11 (main galaxy only, on `md.Setup.GameStart`), 246-267 (20-30 min delay, activation, invitation), 269-279 (later capital patrols), 280-288 (upgrade patch with the `shul` typo).
- `ext/aiscripts/order.sw.bountyhunter.fighters.xml`: the target pick and attack.
- `ext/libraries/factions.xml` 1610-1628: `indibhg` faction, locked relations, attacked -> attack; 1790-1798: player relations (no `indibhg` entry).
- `ext/md/kuertee_emergent_missions.xml` 61: `indibhg` in `factions_noBountyMissions`; 11457, 11491, 11992: what the list blocks; 5606: objective text is the target's `knownname`.
- Save scratch copy `quicksave-hunt5.xml.gz` ("BBH - Test 2", time 13,685): `bountyhunters_*` job sources (unpacked lines 1969187-21320977); Amanaman's respawned ship at about line 13765430.
- `ext/md/sw_plot_rebel.xml` 33, 177-209: rebel-start warp-and-attack on the player.
- 0.86: `/mnt/e/x4-dev/reference/mods/swi-0.86/ext/md/setup_swmod.xml` 97-138.
