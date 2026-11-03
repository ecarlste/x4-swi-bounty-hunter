[Back to the bounty research](../bounty-research.md). Related: [swi-bounty.md](swi-bounty.md), [headhunter-wings.md](headhunter-wings.md). Issue [#35](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/35), child of map [#1](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/1).

# What the player can field per target size in SWI (2026-11-03)

Question: for each rung of the hunting ladder (S, M, L, XL and SWI's XXL dreadnoughts), what ships and wing can the player realistically field in SWI 0.90 on X4 8.00, starting from the Bankrupt Bounty Hunter start? Where are they sold, what reputation or rank does each need, what do they cost, how do players get capital ships, how are wingmen's pilots hired, and do pilots need a minimum skill or crew for L/XL?

Sources. `SWI` = SWI 0.90 `ext/` unpacked at `E:\x4-dev\reference\mods\swi-0.90` (md, aiscripts, libraries, t), plus its `starwarsmod_m1/ui` Lua. Ship classes, hull, crew capacity and threat scores come from the ship macros in the installed `extensions/starwarsmod_m1/ext_01.cat/.dat`, which were read in place (never written). `V8` = vanilla 8.00 `base/` at `E:\x4-dev\reference\x4-8.00`. A scratch script parsed every `transport="ship"` ware in `SWI libraries/wares.xml` (222 ship wares) and joined it with the macro folder (`assets/units/size_*`) and the English names in `SWI t/0001.xml`. Public sources (Nexus, Steam, forums) had nothing on SWI ship buying: the Nexus page returned 403 and searches found only generic X4 posts. So everything below comes from code. Tags: **[read]** = seen in the files; **[inferred]** = reasoning, to check in game.

## Short answer

| Rung | Engine class | What the player can realistically field | Where to get it | Gate (licence and rank) | Price (hull, ware average) |
|---|---|---|---|---|---|
| **S** | ship_s | Z-95 (79k), R-41 Starchaser (219k), Kihraxz, Porax-38-B, M12-L Kimogila, Victor-wing, Y-wing BTL-BP; bounty-hunter ships: N-1 Modified (189k), HWK-290 (992k), ST-70 Razor Crest (1.07M), Firespray-31 (1.49M) | Hutt Cartel wharf (Nal Hutta); Bounty Hunters wharfs (Milagro, Byss and three placed in Corporate, Anoat and Empire space); Valarian outposts | General-use: free at Hutt Cartel when relation ≥ -0.01 (the start is -0.001). Bounty Hunters: general 200k, military **3M Cr**, at neutral. Valarian military 1M at -0.01 | 45k-1.5M |
| **M** | ship_m | Fortitude (start ship, 500k), YV-666 (856k), Cumulus Corsair (2.1M), Weequay Corvette (1.7M), Defender Light Corvette (1.2M), C-ROC Corsair (1.26M), S-161 Stinger XL (1.13M), Dynamic-class (888k, military) | Hutt wharf, Bounty Hunters wharfs, Valarian outposts, corporation wharfs | Mostly general-use (free at neutral). Military corvettes need a military licence | 0.3M-3M |
| **L** | ship_l | Hutt/pirate route: Dreadnought-class Cruiser (10.2M, capital), Neutron Star-class Cruiser (5.8M, military), Interceptor-class Frigate (5.3M, general), Nebulon-B Patrol Frigate (5.5M, general). Corporation route: Lancer, Velox, Vigil, Enforcer, Vindicator, Victory II (Kuat); Dreadnought, Quasar Fire, Nebulon-B (Rendili); MC40A/B (Mon Cal); Acclamator-II, Proclamator (Kamino). Free: 7-12 abandoned **Katana Dreadnoughts** to claim | Valarian outposts (L dock), the Hutt shipyard (Nar Shaddaa), corporation shipyards; Katana wrecks in ownerless sectors | General-use L (frigates, Neutron Star freighter) need no rank. Military or capital: **buy** a corporation licence at neutral (Rendili 6M, Incom 3M, Sienar, Transgalmeg or Mon Cal 10M, Hoersh 20M, Kuat or Kamino 40M), Valarian capital 500k, or meet the major-faction ladder (see below) | 4.8M-20M |
| **XL** | ship_xl | Venator (Hutt) 42.6M at Nar Shaddaa; ISD-I 59.5M, MC75 35.3M, MC80 Liberty 51.2M at Kuat; Venator (Clone Era) 39.6M at Kamino; Allocator, Munificent, Recusant, LH-3210 at Hoersh; Harbor-class Fleet Tender (general, 13.9M) | Hutt shipyard, Kuat, Kamino, Hoersh and Mon Cal shipyards; or boarding | Corporation capital licence for money (Kuat or Kamino 40M, Hoersh 20M, Mon Cal 10M). Hutt Cartel needs **militia** status (2 player stations in Hutt sectors and 1.55M Cr traded) plus +20 | 14M-97M |
| **XXL** | ship_xl (folder `size_xxl`, dock `dock_xxl`) | Executor 368M, Prototype SSD 238M, Bellator 210M, Subjugator 165M, Praetor 162M | **Not sold to the player.** Only the player's own shipyard with an XXL build module, after HQ research; or by boarding an NPC's | Research chain; at most 1 Executor, 1 Prototype SSD, 1 Bellator, 2 Praetor, 2 Subjugator built | 162M-368M plus research wares |

The realistic early path from 500 Cr: fight and mission in the Fortitude, then a Hutt or bounty-hunter S/M fighter and a few general-use S wingmen. For L, either claim a Katana Dreadnought or buy a Valarian/Rendili capital licence (0.5-6M) and a Dreadnought-class Cruiser (about 10M hull). XL means 40M or more in licence alone at Kuat or Kamino, or about 42M plus Hutt militia status for the Hutt Venator. XXL means owning a shipyard plus research, or boarding. Above 150M Cr of total assets, SWI's maintenance starts to charge for every ship (section 7).

## 1. The start [read]

`SWI libraries/gamestarts.xml` 1055-1146, `x4ep1_sw_bhg`:
- The player is "Bobby the Fat" (`{999840,602030}`) with **500 Cr**, in sector `swi_clusterlannik_sector001_macro`, "Hutt Cartel Space".
- The ship is `fortitude_macro`, ware "Fortitude-class assault shuttle", **class M**, average 499,500 Cr, general-use licence. It carries 2 IX4 S lasers, 4 P12 S shields, Incom H engines, 3 satellites and 5 flares.
- Starting relations: Hutt Cartel -0.001, Ascendancy -0.005, Corporate +0.001, Commerce Guild -0.01. All others use the `factions.xml` defaults: 0 for most; Valarian -0.01; Hutt pirates, Mando raiders and Black Sun -0.0032; Sith -1.
- `SWI md/setup_gamestarts_sw.xml` 1544-1599 `SW_Start_bhg` reveals 11 Hutt-space sectors with their shipyards, wharfs and trade stations. After 10 s it spawns **two R-41s owned by Hutt pirates** that attack the player (relation behaviour disabled). That is the "bounty on your head".

## 2. Where ships are sold [read]

A shipyard or wharf sells the ship wares whose `<owner faction>` list includes the station's owner. The player needs that owner's licence named in the ware's `<restriction licence>`, checked against the selling station's owner (`V8 ui/addons/ego_detailmonitor/menu_ship_configuration.lua` 7039-7080, `HasLicence("player", tradelicence, menu.containerowner)`). Build modules (`SWI libraries/constructionplans.xml`, via `stations.xml` and `stationgroups.xml`) set what sizes a station builds:

| Station type | Builds | Examples (god.xml) |
|---|---|---|
| Wharf (`*_wharf`, `wharf_corp`, `wharf_scum`) | S/M dock only | Hutt wharf at Nal Hutta (1908); Bounty Hunters wharfs `wharf_bountyhunters_01..05` (2974-3035: Milagro, Byss, and one each placed in Corporate, Anoat and Empire space); Black Sun at Huk, Fusai, Polis Massa; Incom at Lucazec and Uviuyexen; Corellia |
| Pirate outpost (`pirate_outpost`, Valarian and Black Sun) | M dock **plus one L build module** | Valarian at Stenos, Nazzri and Kin Yen (3201-3231) |
| Shipyard | L and XL | Hutt Cartel at **Nar Shaddaa** (1895, `hutt_shipyard`: 2 L and 2 XL); Kuat (2678, 4 L and 4 XL); Kamino, Rendili, Hoersh, Sienar, Transgalmeg, Mon Cal (`corp_shipyard`: 2 L and 1 XL); Empire (Bastion, Rakata Prime), Ascendancy (Eriadu), New Republic (Coruscant, Fondor), Corporate (Cantonica), Commerce Guild (Hypori), Anoat (Bespin), Mandalore, Hapes, Sith |
| XXL shipyard | One `buildmodule_sw_ship_xxl` | Empire at Dantooine (298), Ascendancy at Mustafar (687), Corporate at Voss (1565), Commerce Guild at Scarif (2039) |

The Bounty Hunters faction has **only wharfs**: S/M bounty-hunter ships, no L/XL. Its exclusive ships: Firespray-31 (1.49M, military), ST-70 Razor Crest (1.07M, military), N-1 Modified (189k, general), and shared HWK-290 (992k, military), Dynamic-class (888k, military), S-161 Stinger XL (1.13M, general) and YV-666 (856k, general).

The full per-ship table (size, ware, price, licence, owner factions) was built in a scratch script and isn't kept in the repo; the short answer and section 3.1 summarise it. To rebuild it, parse each `transport="ship"` ware in `wares.xml` for `price@average`, `restriction@licence` and `owner@faction`, and map `component@ref` to its `assets/units/size_*` folder in `ext_01.cat`. Prices are the ware's `average`, i.e. hull only. Shipyard prices float between `min` and `max` with stock, and weapons, shields and crew are extra. [read: wares.xml; inferred: the final bill]

## 3. Licences and the rank ladder

### 3.1 Licence definitions [read: SWI libraries/factions.xml]

Major factions (Empire 116-128, Ascendancy, New Republic, Rebel Alliance, Corporate, Commerce Guild, Hutt Cartel 421-435, Mandalorians, Anoat, Hapes, Sith) use the vanilla pattern:
- `generaluseship`: minrelation -0.01, free;
- `militaryship`: minrelation 0.01, precursor `ceremonyfriend`, free;
- `capitalship`: minrelation 0.1, precursor `ceremonyally`, free.

[inferred, vanilla convention] Relation 0.01 shows as +10 in the UI and 0.1 as +20. The ceremonies are the vanilla promotion events at those levels.

Corporations sell their licences **for money at neutral (-0.01)**, without ceremonies:

| Faction | Military | Capital | Sells |
|---|---|---|---|
| Kuat (1060) | 5M | **40M** | Shipyard and wharf at Kuat: ISD-I, Victory II, Enforcer, Vindicator, Lancer, Velox, Vigil, MC75/MC80 variants, TIE line |
| Kamino (1011) | 1M | 40M | Venator (Clone Era), Acclamator-II, Proclamator, Arquitens |
| Hoersh (1163) | 5M | 20M | Allocator, Munificent, Recusant, LH-3210, Ordnance Cruiser, Diamond |
| Sienar (1128) | 2M | 10M | Acclamator-I, Cantwell, Imperial Light Cruiser, Quasar Fire II (all military), TIEs |
| Transgalmeg (1234) | 3M | 10M | Interceptor and Nebulon-B Patrol frigates (general) |
| Mon Calamari (1310) | 2M | 10M | MC40A/B, MC80 Reef Home, Recusant |
| Rendili (1199) | 2M | **6M** | Dreadnought-class Cruiser, Neutron Star Cruiser, Quasar Fire, Nebulon-B |
| Incom (1273) | 2M | 3M | Wharfs only: X-wing XJ-3/5 and T70 O (capital S), E-wing, ARC-170 |
| Corellia (1094) | 5M | 500k, hidden | Wharf only: CR-90, YT-1300M, GS-80 |
| Bounty Hunters (1564) | **3M** | none | General 200k |
| Valarian (766) | 1M | **500k** at -0.01 | General 300k; L at its outposts |
| Hutt pirates, Black Sun | 1M | hidden | General 300k |

### 3.2 kuertee Social Standings and Citizenships gates the free licences [read]

SWI ships kuertee's Social Standings and Citizenships (`SWI md/kuertee_ssac.xml`, `kuertee_ssac_requirements_by_faction.xml`). With SWI present, `$isUseFullMod` is false (`kuertee_ssac.xml` 146-148), so the per-faction tables apply.
- `GetIsCapitalShipOk` (2372-2406) grants a **free** capital licence only when the player's citizenship type for that faction is at least `$capitalShip_req_ctype`. `AddRemoveMilitaryCapitalShips` (2407-2467) adds or removes the licence. Licences with a price are skipped (`not $Faction.licence.capitalship.price`), so **bought corporation and pirate licences aren't gated**.
- The promotion to +10 (`ceremonyfriend`, needed for the military licence) needs `$friend_req_ctype` = resident; +20 (`ceremonyally`) needs citizen (`kuertee_ssac.xml` 1789-1813, 2325-2360).
- Citizenship is counted from **player-owned stations in sectors that faction owns or contests**, Cr traded at those stations, and player **defence stations in frontier sectors** (`GetStationDataInFactionSectors` 2535-2590, `GetCitizenshipType` 1866-1925). The levels add up.

Thresholds (`kuertee_ssac_requirements_by_faction.xml`; capital licence = militia):

| Faction | Resident (+10) | Citizen (+20) adds | Militia (capital licence) adds |
|---|---|---|---|
| Empire, Ascendancy | 1 station, 50k Cr | 1M Cr | 1 station, 5M Cr, 1 frontier defence station |
| New Republic | 1 station, 50k | 1M | 5M, 2 frontier defence stations |
| Corporate | 1 station, 50k | 1M | 1 station, 5M |
| Commerce Guild | 1 station, 50k | 1 station, 1M | 1 station, 5M |
| Mandalorians | 1 station, 50k | 500k | 1.5M, 1 frontier defence station |
| **Hutt Cartel** | 1 station, 50k | 500k | **1 station, 1M** |
| Anoat | 1 station, 50k | 500k | 1 station, 3M |
| Hapes | 1 station | 1 station | 1 station |

Factions not in the table (Rebel Alliance, Sith, Bounty Hunters, corporations, pirates) fall back to the player entry, which has `$isDisabled = true`: no citizenship requirement (`kuertee_ssac.xml` 1475-1490). Factions that don't claim space are "static" and count as militia (234-238).

**Consequence for a bounty hunter [inferred]:** without owning stations, the player stays below +10 with the major factions for licence purposes. Their military and capital ships (TIE Defender, ISD-II, the Hutt Venator) are out of reach. The money route (corporations, Valarian, Bounty Hunters) is the realistic one, plus capture.

The "rank" in kuertee Reputations and Professions (Bounty Hunters guild) doesn't gate ships: the only shipwright hook is a UI event on installing mods (`SWI ui/kuertee_reputations_and_professions_shipconfiguration.lua`), and HANDOFF notes the profession is silent in SWI. [read; inferred that nothing else gates]

## 4. XXL dreadnoughts [read]

- **What they are.** 5 wares in `SWI libraries/wares.xml`: `ship_imperial_xxl_executer` (Executor, 368M, 4278), `ship_imperial_xxl_executer_proto` (238M, 4248), `bellator` (210M, 4338), `subjugator_class` (165M, 3958), `praetor` (162M, 4308). The macros are in `assets/units/size_xxl/macros/` but declare `class="ship_xl"`, `docksize tag="dock_xxl"`. Hull 6.2M-15M, crew 362-750, threat score 350-750, boarding resistance 2500-3400 (the only SWI ships whose macro sets one).
- **Not sold to the player.** All five carry the tags `limited missiononly blueprintsaleonly nocustomgamestart`. Vanilla locks `blueprintsaleonly` wares at any shipyard the player doesn't own, with "This ship is no longer offered for sale to third parties." (`V8 menu_ship_configuration.lua` 7050-7053, text 1026/8019). They're also on the diplomacy blueprint-steal blacklist (`SWI md/setup_swmod.xml` 41-60).
- **Where NPCs build them.** `SWI md/setup_swmod.xml` `UpdateShipyardsXXL` (391-440) runs every 10 min. For the Empire, Corporate, Ascendancy and Commerce Guild it sets the XXL list as the *only* wares of each shipyard with a `buildmodule_sw_ship_xxl` (Empire: Executor and Prototype; Corporate: Praetor; Ascendancy: Bellator; Commerce Guild: Subjugator), and excludes them from every other shipyard. `setup_sw_xxl_stations.xml` rebuilds a destroyed XXL forge after 30-45 min in the same sector, or an alternative.
- **How the player can own one.** Research `research_xxl_construction` (10k energy cells, 2k claytronics, 6k quantum tubes) gives the XXL build-module blueprint (`setup_swmod.xml` 444-453). The per-ship research gives the ship blueprints (Prototype → Executor; Bellator; Praetor; Subjugator; `wares.xml` 28-130, `setup_swmod.xml` 454-520). Research needs the player HQ, which SWI hands out through the `swi_hq_discovery.xml` mission (defenders guard it). Building then needs the player's own shipyard with that module. [read; inferred that vanilla's HQ is needed for research]
- **Ownership cap.** `setup_swmod.xml` 33-38 sets `limited_blueprint_*` user data: Executor 1, Prototype SSD 1, Praetor 2, Bellator 1, Subjugator 2 (and TIE Silencer 6). The vanilla configurator counts the player's owned copies against it and refuses more with "You cannot own any more copies of this ship." (`V8 menu_ship_configuration.lua` 7082-7099, 2736-3026; text 1026/8028). [read] This limit is a build-menu check. [inferred] A boarded XXL isn't blocked by it, but it counts toward the limit for further builds.
- **Capture.** NPC factions do field them. The macros have `boarding resistance` 2500-3400, so vanilla boarding applies, at a very high marine cost. [inferred: needs an in-game check]

## 5. How players get capital ships in SWI

1. **Claim an abandoned Katana Dreadnought (L) [read].** `SWI md/sw_katana_fleet.xml` places **7-12 `dreadnaught_katana_macro`** at game start, in random ownerless sectors that aren't Sith, 220-330 km from sector centre, set to `faction.ownerless` with **5-20% hull** (macro hull 850,000, crew capacity 12) and no crew. Ware "Katana Dreadnought", L, 11.2M average, owner `ownerless`. [inferred] They're claimed the vanilla way: fly up in a spacesuit and claim, then repair. This is the cheapest L for a broke hunter, and the start reveals no map, so they have to be found.
2. **Buy a licence with money [read].** Valarian capital licence 500k at -0.01, then a Dreadnought-class Cruiser (10.2M hull) from a Valarian outpost's L module. Or Rendili's 6M capital licence, then the Dreadnought or Quasar Fire at Rendili. XL: Kuat 40M licence + ISD-I 59.5M, or Kamino 40M + Venator (Clone Era) 39.6M, or Hoersh 20M + Munificent 23.8M / Recusant 35.6M. [inferred] At -0.01 Valarian may count as hostile for docking. Check in game.
3. **Earn the free licence** from a major faction by building stations in its space (section 3.2). The Hutt Cartel is the cheapest: 2 stations in Hutt sectors and 1.55M Cr traded at them, plus +20 and the ally ceremony. Then the **Venator (Hutt)** XL, 42.6M, at Nar Shaddaa.
4. **Board or bail.** SWI replaces vanilla's bail roll with "EnhancedBail" (crew and morale based, `SWI md/notifications.xml` 45-110; see [headhunter-wings.md](headhunter-wings.md)), and vanilla marine boarding works on L/XL. [read for bail; inferred for boarding costs]
5. **Missions.** SWI keeps vanilla's `rml_capture.xml` and `rml_board_ship.xml`, but nothing found in SWI awards a capital ship to the player as a reward. [read: grep; inferred: absent]

## 6. Wingmen: pilots, skill, crew

- **Hiring [read: V8 md/conversations.xml 166-232].** Any station NPC (bar or room NPCs) offers "Work somewhere else for me" (`{1002,3008}`) and the hire sub-choice (`{1002,3014}`). The hired NPC can be assigned as pilot. A ship bought at a shipyard comes with the crew bought in the configurator's crew tab. That price follows the station's workforce (`menu_ship_configuration.lua` 3981). [inferred] Crew can also be promoted to pilot through the crew transfer screen.
- **No minimum skill to fly or command L/XL [read].** Vanilla orders gate on skill only through `<skill min>` in the order header. Only these have one: Police 40, Recon 40, Explore 60, Update recon 20, Trade middleman 40, advanced trade or mining 60, expert mining 80, salvage 40, **Plunder 80** (`V8 aiscripts/order.*.xml`). Escort, Attack and Patrol have none (`order.fight.escort.xml` 63-66, `order.fight.patrol.xml` 57-60). SWI adds no skill gates of its own: a grep for `skill` in `SWI ext/` finds only combat chances and EnhancedBail morale. [inferred] Ship class doesn't gate pilot assignment, and an L/XL flies with a pilot and no crew. Low crew hurts repair and boarding defence, and the macros' `people capacity` sets the maximum (Dreadnought-class Cruiser 50, Katana Dreadnought 12, ISD-I 330, Executor 750).
- **Wing size.** Nothing in SWI caps how many subordinates the player can have. [inferred] Ships follow the vanilla fleet rules.

## 7. SWI maintenance once the fleet grows [read]

`SWI md/sw_reactivemain.xml` 40-44, 66-130 recomputes the player's **power level every 30 min** from total asset value. Ships count at 100%, trade or mining ships at 50%, and only assets worth ≥ 50k Cr count. Below **150M Cr**, the power level is 0 and nothing is paid. From 150M, 300M, 600M, 1B and 1.5B the multiplier is 0.3 / 0.6 / 1.0 / 1.5 / 2.0. `SWI md/sw_maintenance.xml` then sums every ship's macro `threatscore`, multiplies by that factor, and subtracts what owned sectors' supply and Ship Supplies wares at the player's equipment docks cover. It charges the rest at **5,000 Cr per point** (`$DefaultCreditsCostMultiplier`, line 39; payment 560-566). Example [inferred arithmetic]: at power 1, one ISD-I (threat 140) costs 140 × 0.3 × 5,000 = 210,000 Cr per 30 min. A hunter with no sectors covers none of it. One XXL (≥162M) alone lifts the player to power level 1.

## Open checks for in-game testing

- Can a player docked at relation -0.01 buy the Valarian capital licence, and does Valarian let the player dock?
- Does a Bounty Hunters wharf sell the Firespray once the 3M military licence is bought, and at what total price?
- Find and claim a Katana Dreadnought: hull, repair cost, and whether claiming works like vanilla's abandoned ships.
- Does a boarded XXL count toward `limited_blueprint` (blocking a second build)?
