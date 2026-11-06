# Ladder hulls: who flies them, so the player can capture instead of buy (2026-11-06)

Question: for each ship in the hunting ladder's wing configs ([concept.md](../concept.md) "Hunting ladder"), which factions and jobs spawn it as an NPC ship, so the player could capture it rather than buy it? Which hulls are never flown by NPCs (buy-only)?

Read from files only, nothing tested in game. Tags: [read] = seen in the files; [inferred] = follows from what was read.

Sources:

- SWI 0.91 HF1 scripts: `/mnt/e/x4-dev/reference/mods/swi-0.91hf1/ext02/libraries/` (`jobs.xml`, `ships.xml`, `shipgroups.xml`, `wares.xml`, `factions.xml`) and `ext02/md/`. SWI replaces the whole of `//jobs`, `//ships` and `//groups` (`jobs.xml` 3, `ships.xml` 6), so vanilla's jobs play no part. Ship names: `ext02/t/0001.xml` page 999840; macros in `ext/assets/units/size_*/macros/`.
- Reaper's Ship Pack 2.8: `ext_01.cat` of `E:\x4-dev\staging\rsp-2.8\starwars_rsp`, its XML unpacked to a scratch folder. Paths below are inside that catalog. Its `libraries/jobs.xml`, `ships.xml` and `shipgroups.xml` only `add` new entries (`jobs.xml` 4, `ships.xml` 3, `shipgroups.xml` 3). They patch no SWI job, ship or group.
- How it was traced: macro → `shipgroups.xml` group → `ships.xml` entry (`group=`, plus `category` faction, tags and size) → every job whose `<ship><select>` names that faction, a subset of those tags and that size. A throwaway TypeScript script did this over SWI + RSP with XML comments removed, so commented-out groups don't count. The script is not in the repo. Line numbers are SWI `ext02/libraries/` unless marked RSP.

## Short answer

| Ladder hull | Macro | Flown by NPCs? | Best capture source for a hunter |
|---|---|---|---|
| Fortitude-class assault shuttle | `fortitude_macro` | Yes, traders only: Anoat Federation and Tagge Corporation | Lawful traders. Taking one is piracy, not a hunt |
| R-41 Starchaser | `r41_macro` | Yes, widely: Pirate Syndicates, Black Sun, Hutt Pirates, Hutt Cartel, Anoat, and 4 named hunters | Pirate fighter wings, Hutt escorts |
| N-1 Modified Starfighter | `ship_mando_s_n1_macro` | Only the named hunter "Mando" (indibhg, 75 %) | Mando, or buy (Guild, civilian licence) |
| HWK-290 | `hwk_290_01_macro` | Yes: Pirate Syndicates (heavy fighters, couriers), Anoat couriers, 4 named hunters, Guild wharf garrisons | Pirate Syndicates heavy-fighter wings |
| Firespray-31 | `firespray_macro` | Only Bounty Hunters: Boba Fett, Asajj, Guild wharf garrisons | Boba Fett / Asajj (indibhg). Garrisons are Guild-owned |
| Weequay Corvette | `weequay_macro` | Yes, pirates only: Pirate Syndicates, Black Sun, Hutt Pirates | Pirate plunderer leads and their escorts |
| Gozanti C-ROC Corsair | `gozanti_croc_raider_macro` | Yes: Pirate Syndicates, Black Sun, Hutt Pirates, Hutt Cartel | Pirate plunderer leads; Hutt Cartel escorts |
| Gozanti C-ROC (freighter) | `gozanti_croc_macro` | Traders: Hutt Cartel, Baobab, Pirate Syndicates, Black Sun | Pirate couriers |
| Gozanti C-ROC-BM Corsair (RSP) | `gozanti_croc_bm_macro` | **No. Buy-only** | none |
| Heraklon Auxiliary Carrier (RSP) | `heraklon_carrier_macro` | **No NPC job.** 1-3 crewless derelicts at game start | Claim a derelict, or buy |
| Venator (Clone Era) | `venator_ce_macro` | Yes: Kamino only | Kamino Venator patrols (war with Kamino) |
| (Venator, Hutt) | `venator_hutt_macro` | Hutt Cartel, Mandalorian Death Watch | Hutt Venator patrols |

**Buy-only hulls:** Gozanti C-ROC-BM (RSP) has no ship entry or job. The Heraklon Auxiliary Carrier has no job either; it only exists as derelicts. `n1pi_macro`, the other "N-1 Modified Starfighter" macro, sits in no group and no ware, so it is unused [read].

**For hunts:** Emergent Missions doesn't spawn hunt targets. It picks existing NPC pilots who killed ships of non-excluded factions ([swi-bounty.md](swi-bounty.md) 3.2). Escorts' kills are credited to the top commander, so a target's wingmen are its job subordinates. The pirate jobs below (Plunder order) are the ones most likely to become targets, and their hulls are the Weequay, C-ROC Corsair, R-41 and HWK-290 [inferred].

## 1. Per hull

### Fortitude-class assault shuttle (`fortitude_macro`, name `{999840,102410}`)

Groups ([read], `shipgroups.xml`):
- `anoat_trader_container_m` 1231 (weight 10 of 110) → ship `anoat_trader_container_m` (`ships.xml` 1622, anoat, `[trader, container, mission]`, M).
- `anoat_trader_courier_m` 1240 (30 of 100) → `anoat_trader_courier_m` (`ships.xml` 1632).
- `civilian_trader_corporate_m` 1468 (1 of 4, unweighted) → `tagge_trader_container_m` (`ships.xml` 2242, tagge).
- `civilian_trader_shuttle_m` 1507 (40 of 130): no ship entry uses this group.

Jobs: Anoat M traders, `jobs.xml` 8020-8560 (14 jobs, e.g. `anoat_tech_trader_m` 8420, quota galaxy 10-25; `anoat_smuggler_trader_m` 8536). Tagge M traders 11454-11782 (11 jobs, incl. `tagge_bear_smuggle_m_galempire` 11502) [read].

Traders don't fight, so they rarely become hunt targets. Capturing one means attacking a lawful faction [inferred]. Bought from Anoat, Rendili, Incom (`wares.xml` 1341, civilian licence). It is also the player's start ship.

### R-41 Starchaser (`r41_macro`, `{999840,102910}`)

Pirates [read]:
- **Pirate Syndicates** (`valarian`): `valarian_fighter_mixed_s` group 1630 (40 of 110) → `ships.xml` 3484. Jobs `valarian_mixed_plunder_s_tag` 20005 (Plunder, quota galaxy 60), `_tag_low` 20030 (30), and `valarian_mixedfighters_escort` 20084 (wing 3). That escort is the fighter escort of most Pirate Syndicates leads: L plunderers, `valarian_free_plunderer_m_*` 19856/19885/19910, `valarian_pirate_miner_harasser_m_tag` 19771, `valarian_heavy_patrol` 19981.
- **Black Sun**: `blacksun_fighter_mixed_s` 1676 (60 of 100) → `ships.xml` 3377. Jobs `blacksun_mixed_plunder_s_south` 18961, `_north` 18988, and `blacksun_mixedfighters_escort` 19016 (escort of the Black Sun M plunderers and Nebulon patrols). Also `blacksun_fighter_interceptors_s` (`ships.xml` 3395, which uses group `anoat_fighter_interceptors_s` 1322) → `blacksun_lightfighter_escort` 19058.
- **Hutt Pirates**: `huttpirates_fighter_mixed_s` 1682 (30 of 100) → `ships.xml` 3512. Jobs `huttpirates_fighter_plnderer_s_hutt` 19178, `_sr` 19203, `_s` 19228 (quota 15), and `huttpirates_fighter_mixed_s_escort` 19253.

Others [read]:
- **Hutt Cartel**: `huttcartel_fighter_mixed_s` 1195 (2 of 14) → `huttcartel_mixedfighters_escort` 16934 (escorts of the Hutt Venator patrol 16651, RSP's `huttcartel_venator_ii_patrol` RSP 1350, and the heavy-escort patrol). `huttcartel_fighter_interceptors_s` 1210 (R-41 only) → `huttcartel_lightfighter_escort` 16976 (escorts of `huttcartel_corvette_patrol_m_sector` and Hutt police). `huttcartel_police_s` 1218 (R-41 only) → `huttcartel_police_mixed` 16890.
- **Anoat**: `anoat_fighter_mixed_s` 1310 → `anoat_mixed_patrol_s` 9178, `anoat_mixedfighters_escort` 9244. `anoat_fighter_interceptors_s` 1322 (70 %) → `anoat_lightfighter_escort` 9286.
- **Named hunters** (indibhg): `bhg_random_small` 1712 (1 of 4) → `bountyhunters_neesh` 21527, `_bane` 21622, `_4lom` 21660, `_taros` 21774.
- MD: Black Sun R-41s guard the station in SWI's HQ-discovery event (`md/swi_hq_discovery.xml` 757, 852).

Sold by Anoat, TransGalMeg, Black Sun, Hoersch-Kessel, Rendili, Hutt Cartel, Pirate Syndicates (`wares.xml` 1087, civilian licence). It is cheap; capture is a story beat, not a saving.

### N-1 Modified Starfighter (`ship_mando_s_n1_macro`, `{999840,104211}`)

- Only group: `bhg_mando` 1749 (75 %, the rest is the Razor Crest) → `indibhg_mando` (`ships.xml` 3905) → job `bountyhunters_mando` 21717: indibhg, `SWBountyHunterFighters` order, quota galaxy 2, switched on 20-30 min into the game (`md/setup_swmod.xml` 262) [read].
- `n1pi_macro` has the same name but no group or ware (unused). The plain N-1 Starfighter (`n1_macro`) is Naboo's (jobs 21292-21391) and Ket's (`bhg_ket` 1728, `bountyhunters_ket` 21793). It is a different ship [read].
- Sold only by the Guild (`wares.xml` 1232, civilian licence, so no 3 M licence is needed). Effectively buy-only, unless the player beats Mando [inferred].

### HWK-290 (`hwk_290_01_macro`, `{999840,102310}`)

- **Pirate Syndicates heavy fighters**: `valarian_fighter_heavy_s` 1637 (30 of 90) → `ships.xml` 3493. Jobs `valarian_heavy_patrol` 19981 (Patrol at Pirate Syndicates shipyards, quota galaxy 30) and `valarian_fighterheavy_escort` 20105 (wing 2). That escort serves `valarian_pirate_gang_m_tag` and `_tag_low` 19821 (3 jobs: a corvette lead with 7 corvette escorts and 3 heavy-fighter escorts), the L plunderers and `valarian_patrol_l_heavy` [read].
- **Pirate Syndicates couriers**: `valarian_trader_container_m` 1609 (10 of 100) → `valarian_trader_courier_m` (`ships.xml` 3428) → jobs 19375-19454 (`valarian_universal_trader_m`, `valarian_generic_smuggler_m` 19429 and 2 more).
- **Anoat couriers**: `anoat_trader_courier_s` 1246 (HWK only) → `anoat_universal_trader_s` 8489, `anoat_smuggler_trader_s` 8513.
- **Named hunters**: `bhg_random_med` 1733 (1 of 4) → `bountyhunters_embo` 21584, `_dengar` 21603, `_amanaman` 21641, `_kuertee` 21755.
- **Guild garrisons**: `bhg_random` 1740 (1 of 6) → `bountyhunters_garrison_m` 21488 (quota galaxy 12, Patrol at Guild wharfs, **owner `bountyhunters`**, the Guild itself).
- `mandodw_trader_container_s` 947 → `ships.xml` 3111: no job selects it.
- Sold by the Guild, Anoat, CEC, Pirate Syndicates (`wares.xml` 1119, **military** licence).

### Firespray-31 (`firespray_macro`, `{999840,100710}`)

Bounty Hunters only [read]:
- `bhg_firespray` 1754 → `indibhg_firespray` (`ships.xml` 3920) → `bountyhunters_bobba` 21679 (Boba Fett; quota 1, respawn `time interval="4000"`).
- `bhg_assaj` 1762 (1 of 2, with the Lancer) → `bountyhunters_asajj` 21698.
- `bhg_random` 1740 (1 of 6) → `bountyhunters_garrison_m` 21488 (Guild-owned garrison).
- Sold only by the Guild (`wares.xml` 580, military licence, 3 M).

So the only capture sources are the named hunters Boba Fett and Asajj Ventress (indibhg) or a Guild garrison (shooting the Guild, which is the hunter's employer). A save shows the player killing Fett's Firespray ([save-check-vua-500.md](save-check-vua-500.md)), so the encounter happens. Capturing it instead of killing it is untested [inferred].

### Weequay Corvette (`weequay_macro`, `{999840,113410}`)

Pirates only [read]:
- **Pirate Syndicates**: `valarian_corvette_m` 1643 (30 of 100) → `ships.xml` 3466. Leads: `valarian_pirate_gang_m_tag_low` 19821, `valarian_free_plunderer_m_sector` 19856 (quota 12), `_tag` 19885 (40), `_tag_low` 19910 (40). All are Plunder order with a `valarian_mixedfighters_escort` R-41 wing. Escorts: `valarian_corvette_escort` 19935 and `valarian_corvette_escort_escroted` 19956, under the L plunderers and patrols.
- **Black Sun**: `blacksun_corvette_m` 1669 (40 of 100) → `ships.xml` 3368. Leads `blacksun_free_plunderer_m_tag` 18805, `blacksun_free_plunderer_m` 18832, `blacksun_south_plunderer_m` 18859 (Plunder, in ownerless space, with R-41 escorts). Escort `blacksun_corvette_escort` 18887.
- **Hutt Pirates**: `huttpirates_corvette_m` 1689 (20 of 100) → `ships.xml` 3503. Leads `huttpirates_corvette_plunderer_m_galaxy` 19101, `_sector` 19127 (Plunder). Escort `huttpirates_corvette_escort_m` 19156.
- Sold by Black Sun, Hutt Cartel, Pirate Syndicates, TransGalMeg (`wares.xml` 1985, civilian licence).

A pirate M plunderer with its own R-41 wing is the ladder's top M config, already alive in the universe [inferred].

### Gozanti C-ROC Corsair (`gozanti_croc_raider_macro`, `{999840,110515}`)

The same pirate jobs as the Weequay, through the same groups [read]: `valarian_corvette_m` 1643 (30 %), `blacksun_corvette_m` 1669 (20 %), `huttpirates_corvette_m` 1689 (40 %). Two more:
- `valarian_corsair_m` 1650 (Corsair only) → `ships.xml` 3475 → `valarian_pirate_miner_harasser_m_tag` 19771 and `_low` 19796 (Plunder in mineral regions, R-41 escort).
- **Hutt Cartel**: `huttcartel_corvette_m` 1185 (10 of 100) → `huttcartel_corvette_patrol_m_sector` 16823 (quota galaxy 10-40) and `huttcartel_corvette_escort_m` 16846 (escort of the L heavy escorts in Hutt Venator patrols, SWI and RSP).

Seen in play: hunt DMD-761 was a "PIR Mercenary Gozanti Corsair" ([save-check-kbz-737.md](save-check-kbz-737.md) 2). Sold by Black Sun, Hutt Cartel, Pirate Syndicates, TransGalMeg (`wares.xml` 1968, civilian licence).

### Gozanti C-ROC (freighter, `gozanti_croc_macro`, `{999840,110514}`) and other Gozantis

- C-ROC freighter: `huttcartel_trader_container_m` 1134 (40 of 115) → Hutt Cartel traders 15846-16321 (13 jobs). `civilian_trader_outerrim_m` 1475 → Baobab traders 9310-9566. `valarian_trader_container_m` 1609 (20 %) → Pirate Syndicates couriers 19375-19454. `blacksun_trader_container_m` 1663 → Black Sun traders 18439-18497 [read].
- Gozanti-class Cruiser (`impgozanti_cr_macro`): Galactic Empire (`galempire_gozanti_patrol_m_sector` 2506 and `_mission` 2530, escort 2598) and Ascendancy escort 4908 [read].
- **Gozanti C-ROC-BM Corsair (RSP, `gozanti_croc_bm_macro`)**: no group, no ship entry, no job, no MD in RSP. **Buy-only**: RSP `libraries/wares.xml` 1069 (2.06-4.66 M, military licence; Black Sun, Hutt Cartel, Pirate Syndicates, TransGalMeg) [read].

### Heraklon Auxiliary Carrier (RSP, `heraklon_carrier_macro`, `{1323010019,1}`)

- No group, no ship entry, no job: no NPC ever flies one [read].
- RSP `md/rsp_heraklon_carrier.xml` 5-66: at game start (only in the SWI galaxy), it places **1-3** carriers. Each goes in a random ownerless sector (not Sith-owned), 220-330 km out on X and Z, created with no crew (`fillpercent 0`), then set `ownerless` with hull 5-20 %. They are claimable derelicts. It runs once; a lost one is not replaced [read].
- Sold by Hutt Cartel and Black Sun (RSP `libraries/wares.xml` 638, 3.23-4.77 M, **civilian** licence).
- SWI's two other "Heraklon" hulls are the Ore Miner and Gas Collector (`heraklon_solid/liquid_macro`, Empire and Ascendancy miners, groups 85/88/255/258). They aren't the carrier.

### Venator-class Star Destroyer (Clone Era) (`venator_ce_macro`, `{999840,130311}`)

- Only group: `kamino_venator_xl` 1388 → `ships.xml` 3700 (kamino). Jobs [read]:
  - `kamino_venator_patrol` 20693: quota galaxy 3, sector 1. Patrol in Kamino space with 4 Y-wing, 2 interceptor and 5 ARC-170 escorts plus 2 Acclamator II escorts;
  - `kamino_venator_patrol_shipyard` 20767: quota 2, at Kamino shipyards;
  - `kamino_venator_dual_patrol` 20730: quota 4, `startactive=false`, switched on by the Kamino plot (`md/sw_plot_kamino.xml` 65);
  - `kamino_venator_escort` 20805.
- Capturing one means boarding a Kamino XL inside Kamino space with its full escort, and war with Kamino, which is also the only seller (`wares.xml` 4076, capital licence 40 M) [inferred].
- Lookalikes: `venator_hutt_macro` ("Venator (Hutt)") → Hutt Cartel `huttcartel_venator_patrol` 16651 (quota galaxy 2-8) and Death Watch `mandodw_venator_patrol_xl` 17895 (quota 1). `venator_01_macro` (plain Venator) → Corporate Sector `corporate_venator_patrol_single` 10729 and `_trio` 10763. RSP's Venator Fleet Tender, Cargo and Venator II are other macros [read].
- MD `create_ship venator_ce_macro` calls are player-owned start ships (`md/setup_gamestarts_sw.xml` 1020) or showcase starts. They aren't NPC sources [read].

## 2. Notes for the design

- **Capturable at all?** None of these ships' `ships.xml` entries carries `capturable="false"`. Only `sith_fighter` (117) and `commerceguild_fighter_vulture_s` (2514) do. The MD uncapturable spawns (`swi_hq_discovery.xml`, `setup_gamestarts_sw.xml`) are other macros or showcase starts. The `iscapturable` engine rules (crew, bail) were not checked [read].
- **Named-hunter hulls are owned by `indibhg` ("Bounty Hunter"), not the Guild (`bountyhunters`).** Only the wharf garrison job is Guild-owned. So taking Fett's Firespray costs no Guild relation, but a garrison HWK or Firespray does [read for owners; relation effect inferred].
- **Hunt targets come from Plunder jobs.** Pirate Syndicates, Black Sun and Hutt Pirates are in SWI's `$factions_noBountyMissions`, so killing them never creates bounties. Their own kills of lawful ships do, so their plunderers become targets ([swi-bounty.md](swi-bounty.md) 3.2). The jobs that fit the ladder's M rung (corvette lead + R-41/HWK wing) already exist: `valarian_pirate_gang_m_tag_low` (corvettes + HWK escorts), `valarian_free_plunderer_m_*`, `blacksun_*_plunderer_m`, `huttpirates_corvette_plunderer_m_*` [inferred].
- **No Fortitude, Firespray or N-1 Modified in any pirate job.** For a capture-first ladder, the Fortitude comes only from lawful traders. The Firespray and N-1 Modified come only from named hunters.
