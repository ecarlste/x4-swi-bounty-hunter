# Licence costs and the next hunting ship (SWI 0.90)

Read from files on 2026-11-04 for playtest #4 ([../playtests/stock-bounty-loop.md](../playtests/stock-bounty-loop.md), the HWK-290 question). Nothing here was tested in game. SWI 0.91 HF1 changes no ship price; its licence changes are marked "0.91" below ([swi-0.91-diff.md](swi-0.91-diff.md)). Tags: [read] = seen in the files; [inferred] = follows from what was read but not checked in game.

## Short answer

- **You already own every civilian ship and equipment licence** of every government, corporation, the Guild and the Pirate Syndicates. SWI gives them to the player at the start (`factions.xml` 1842-1843). So the Guild's 100 k and 200 k licences cost you nothing.
- **The Guild's 1 M + 3 M figures are right.** 3 M Cr buys "Bounty Hunters' Guild Unique Ship Access" (military ships: HWK-290, Firespray, Razor Crest, Dynamic-class). 1 M Cr buys "Unique Equipment Access" (military equipment). Both need only -10 rep. The HWK-290 needs only the 3 M one: its ion cannon (A-2) and the Guild's launchers are civilian equipment.
- **The HWK-290 is sold by four factions**, not only the Guild: the Guild, Anoat Federation, Corellian Engineering Corporation and the Pirate Syndicates (`valarian`). The cheapest licence is the Pirate Syndicates' **1 M Cr** "Refurbished Military Ships Access", at -10 rep. HWK-290 then costs about 1 M + 1 M = **2 M Cr** instead of 4 M+. Catch: the player starts at exactly -10 with the Syndicates, the hostile edge, so some rep work comes first [inferred].
- **Corporation military ship licences cost 1 M to 5 M Cr**, with no rep or citizenship needed (-10 is enough): Kamino 1 M, Sienar, Rendili, Incom, Mon Cal 2 M, TransGalMeg 3 M, Kuat, Corellia, Hoersch-Kessel 5 M.
- **With about 0.5 M Cr, the realistic next ship needs no new licence:** the **R-41 Starchaser** (219 k, ion cannons and a concussion missile launcher, 8 missiles) or the **X-wing T65B** (255 k, warhead launcher, 6 missiles). The step after that: Kamino's 1 M licence plus an **ARC-170** (220 k, ion turret, launcher, 14 missiles), about 1.25 M Cr.
- **The Traffic Control (police) licence does need Resident.** It needs the free "friend" ceremony licence (+10) as a precursor, and SWI's citizenship mod removes that licence unless you are Resident. Resident needs a production station in that government's space. Same for every government's military ships licence.

## How licences work

- Each licence has a type, a price, a minimum relation and sometimes a precursor (another licence you must already hold) [read: vanilla `factions.xml` 177-195].
- Free licences (price 0) are granted automatically once you can hold them [read: vanilla `md/playerreputation.xml` 309-310]. Priced ones are bought from the faction representative.
- A ship ware names a licence type (`<restriction licence="militaryship"/>`). The licence must be from the faction that owns the station selling it [inferred from vanilla behaviour; matches the HWK being sold under four factions' licences].
- Relation to UI rep: -0.01 = -10, 0.01 = +10, 0.1 = +20.
- `ceremonyfriend` (+10) and `ceremonyally` (+20) are free "promotion" licences. Military ships, military equipment and police licences of the governments need `ceremonyfriend`. Advanced (capital) ones need `ceremonyally`.

## 1. Licences by faction

Prices in Cr. "Rep" is the UI minimum. "Needs" is the precursor and any citizenship level. Ceremony and station licences left out unless they matter.

### Already owned at start (every player)

The player block gets the civilian ship and civilian equipment licence of: galempire, ascendancy, newrepublic, rebelalliance, corporate, commerceguild, huttcartel, mandodw, anoat, naboo, hapes, kamino, kuat, sienar, incom, rendili, hoersh, corellia, moncal, miningguild, bountyhunters, transgalmeg, valarian (`factions.xml` 1842-1843). The matching military and capital lines are commented out (1844-1847). Black Sun and Hutt Pirates are **not** in the list.

### Corporations (no rep, no citizenship: -10 is enough)

| Faction | Military equip. | Military ships | Capital equip. | Capital ships | Civilian (owned) |
|---|---|---|---|---|---|
| Kamino (`kamino`) | 500 k | **1 M** | 5 M | 40 M | 0 |
| Sienar Fleet Systems (`sienar`) | 250 k | 2 M | 1 M | 10 M | 0 |
| Rendili Drive Yards (`rendili`) | 100 k | 2 M | 500 k | 6 M | 0 |
| Incom Corporation (`incom`) | 100 k | 2 M | 1 M | 3 M ("Unique Ships") | 0 |
| Mon Calamari Shipyards (`moncal`) | 150 k | 2 M | 10 k (0.91: 1 M) | 10 M | 0 |
| TransGalMeg Industries (`transgalmeg`) | 150 k | 3 M | 500 k | 10 M | 0 |
| Kuat Drive Yards (`kuat`) | 2 M | 5 M | 10 M | 40 M | 0 |
| Corellian Engineering Corp. (`corellia`) | 100 k | 5 M | 500 k (hidden) | 500 k (hidden) | 0 |
| Hoersch-Kessel Drive (`hoersh`) | 100 k | 5 M | 500 k | 20 M | 0 |
| Mining Guild (`miningguild`) | 250 k (hidden) | 2 M (hidden) | 0 (hidden) | 0 (hidden) | 0 |

Names in game: "Corporation Military Equipment Access", "Corporation Military Ships Access", "Corporation Capital Equipment Access", "Corporation Capital Ships Access" (Incom: "Corporation Unique Ships Access"). Kamino also sells a 1 M "Kamino Trading Subscription" at -10. Hidden licences don't show in the menu.

### Bounty Hunters Guild (`bountyhunters`)

| Licence | Name | Price | Rep |
|---|---|---|---|
| generaluseequipment | Bounty Hunters' Guild Equipment Access | 100 k (owned) | -10 |
| generaluseship | Bounty Hunters' Guild Ship Access | 200 k (owned) | -10 |
| militaryequipment | Bounty Hunters' Guild Unique Equipment Access | **1 M** | -10 |
| militaryship | Bounty Hunters' Guild Unique Ship Access | **3 M** | -10 |

SWI 0.91 adds "Bounty Hunters' Guild Advanced Equipment Access" (capital equipment, 500 k, -10) and "Advanced Ship Access" (capital ships, 6 M, hidden). No ship lists the Guild as a capital-ship seller yet ([swi-0.91-diff.md](swi-0.91-diff.md)).

No precursor and no citizenship gate. Guild military ships: HWK-290 (~992 k), Firespray-31 (~1.49 M), ST-70 Razor Crest (~1.07 M), Dynamic-class freighter (~888 k). Guild civilian ships (owned licence): N-1 Modified Starfighter (~189 k), S-161 "Stinger" XL (~1.13 M), YV-666 (~856 k). The Guild has five wharfs (`god.xml` 2974-3026).

### Pirates (no ceremony, no citizenship)

| Faction | Civ. equip. | Civ. ships | Mil. equip. | Mil. ships ("Refurbished Military Ships Access") | Capital | Rep |
|---|---|---|---|---|---|---|
| Pirate Syndicates (`valarian`) | 50 k (owned) | 300 k (owned) | 500 k | **1 M** | 500 k each (0.91: ships 2 M) | -10 |
| Black Sun (`blacksun`) | 50 k | 300 k | 500 k | 1 M | hidden | -10 |
| Hutt Pirates (`huttpirates`) | 50 k | 300 k | 500 k | 1 M | hidden | -10 |
| Mandalorian Raiders (`mandoraiders`) | all hidden | | 500 k | 1 M | hidden | - |

Player start relations: Syndicates -10 exactly, Black Sun, Hutt Pirates, Raiders -5 (`factions.xml` player relations patch, 1790-1795). Syndicate and Black Sun outposts have S/M ship build modules (`constructionplans.xml` plan `pirate_outpost`; `god.xml` 3134-3234).

### Governments (citizenship-gated)

All nine follow the same pattern. Civilian licences are free and owned. Everything else is free but gated:

| Licence | Price | Rep | Needs |
|---|---|---|---|
| Military Equipment / Military Ships Access | 0 | +10 | `ceremonyfriend` → **Resident** |
| Advanced Equipment / Advanced Ships Access | 0 | +20 | `ceremonyally` → **Citizen**; Advanced Ships also **Militia** |
| Police licence | 100 k (Hapes 10 k) | +10 | `ceremonyfriend` → **Resident** |
| Trade subscription | 10 M (Hapes 1 M) | +20 (Hapes +10) | `ceremonyfriend` |

Police licence names: Imperial Border Control (galempire), Ascendancy Border Control, New Republic Police, Police Licence (corporate / CSA), **Traffic Control Licence (commerceguild / ICG and anoat)**, Cartel Traffic Control (huttcartel), Mando Police (mandodw), Hapan Fountain Police (hapes). Rebel Alliance and Sith sell no police licence.

Factions: Galactic Empire, Imperial Ascendancy, New Republic, Corporate Sector Authority, Independent Commerce Guild, Hutt Cartel, Mandalorian Death Watch, Anoat Federation, Hapes Consortium. Rebel Alliance and Sith have the same free military/advanced licences but are not in the citizenship table (see §3). Naboo's military and advanced licences are hidden.

Resident needs, per the in-game pamphlet: 1 production station in that government's space and 50,000 Cr of station transactions with it (Hapes: 1 station only). Citizen and Militia need more stations and 0.55 M to 6.05 M Cr (`t/0001.xml` 3149).

Quirk: Naboo's civilian ships licence shows the text "Traffic Control Licence" because it points at the wrong text id (`factions.xml` 928, text 515210). It is not a police licence.

## 2. Ships for a bounty hunter

S/M combat ships, ware prices (average). "Ion" and "Missiles" list what fits the ship's weapon slots, read from the ship models. Missile count is the ship's missile storage.

### Shortlist for ~0.5 M Cr, no stations

| Ship | Size, role | Hull | Price | Licence | Ion | Missiles | Sold by |
|---|---|---|---|---|---|---|---|
| **R-41 Starchaser** | S fighter | 7,150 | 219 k | civilian (owned) | A-2, NK-3, SW-7a | HM-6 concussion launcher, 8 | Anoat, TransGalMeg, Black Sun, Hoersch-Kessel, Rendili, Hutt Cartel, Syndicates |
| **X-wing T65B** | S fighter | 8,500 | 255 k | civilian (owned) | no | Krupx warhead launcher, 6 | Rebel Alliance, Incom, Hapes; NRL version: New Republic, Kuat |
| N-1 Modified Starfighter | S fighter | 4,650 | 189 k | civilian (owned) | no | Krupx, 6 | Bounty Hunters Guild |
| V-19 Torrent | S fighter | 5,500 | 127 k | civilian (owned) | no | HM-6, 6 | CSA, Kamino, Mon Cal, Syndicates |
| G9 Rigger | M transporter | 37,000 | 322 k | civilian (owned) | A-2, SW-7a | none | Incom, TransGalMeg, Rendili, CSA, Anoat, Kuat, Syndicates |

- The A-2 Ion Cannon, HM-6 and Krupx launchers and light concussion and ion missiles are all civilian equipment, so they need no new licence. The SW-7a and NK-3 ion cannons are military equipment.
- The R-41 is the only cheap ship with both ion cannons and missiles. It is fragile: a quarter of the Fortitude's hull.
- The G9 is a tougher, Fortitude-like ship that takes ion cannons, but no missiles.

### Next step: one cheap corp or pirate licence

| Ship | Size, role | Hull | Price | Cheapest licence | Ion | Missiles | Total |
|---|---|---|---|---|---|---|---|
| **ARC-170** | S heavy fighter | 11,000 | 220 k | Kamino 1 M (also Incom, Mon Cal 2 M; CSA gov.; Syndicates 1 M) | SW-4 ion turret | Krupx, 14 | ~1.25 M |
| **HWK-290** | S gunboat | 28,500 | 992 k | Syndicates 1 M (Guild 3 M, Corellia 5 M; Anoat free with Resident) | A-2, SW-7a (4 small + 2 medium slots) | none (0 storage) | ~2 M |
| Y-wing BTL-B | S bomber | 19,000 | 235 k | Kamino 1 M (CSA gov.) | SW-4 ion turret | torpedo/bomb launchers, 14 | ~1.25 M |
| Eta-2 Actis | S interceptor | 4,100 | 156 k | Kamino 1 M (CSA gov.) | A-2, SW-7a | none | ~1.16 M |
| Porax-38-B | S heavy fighter | 13,500 | 267 k | Syndicates 1 M (Hutt Cartel gov.) | no | Krupx, 13 | ~1.27 M |

- **The HWK-290 has no missile storage** (`<storage missile="0">`). It fixes the Fortitude's ion problem but not its missile problem. The Firespray (1.49 M, Guild only, 3 M licence) has both: A-2/SW-7a ion, Krupx and seismic launchers, 14 missiles.
- **Anoat route for the HWK:** the bankrupt start comes with energy-cell production and dock blueprints (`gamestarts.xml` 1055 onward). One energy-cell station in Anoat space plus 50 k Cr of trade gives Resident; at +10 Anoat's Military Ships Access is then free [inferred; station cost not checked].

## 3. Citizenship and the police licence

**Yes: the Traffic Control licence needs Resident.** The chain:

1. ICG's and Anoat's "Traffic Control Licence" (100 k, +10) has `precursor="ceremonyfriend"` (`factions.xml` 383, 537). Same for every government police licence and military ships licence.
2. SWI's patch to `CalculateLicences` stops granting `ceremonyfriend`, and removes it if held, when `$kSSaC_current_isFriendReqOk` is false (`ext/md/playerreputation.xml` 501-522).
3. That flag comes from `GetIsFriendOk`: the player's citizenship type must be at least the faction's `$friend_req_ctype` (`ext/md/kuertee_ssac.xml` 2310-2332, checked again at 1812-1815).
4. `$friend_req_ctype` is **Resident** for all nine governments; `$ally_req_ctype` is Citizen; `$capitalShip_req_ctype` is Militia (`ext/md/kuertee_ssac_requirements_by_faction.xml` 96-238). Capital ship licences are added and removed by `AddRemoveMilitaryCapitalShips` (`kuertee_ssac.xml` 2409-2470).
5. The gate only bites free (price 0) ceremony licences: `$isOk_price = not $Faction.licence.ceremonyfriend.price` (`kuertee_ssac.xml` 2330). Corporations, the Guild and pirates sell their licences for money with no precursor, so citizenship never touches them. That is the pamphlet's rule 5.

Other factions (Rebel Alliance, Sith, Naboo, corporations, Guild, pirates) are not in the table and fall back to the `faction.player` row (`kuertee_ssac.xml` 1472-1475). **Correction (see [corp-ship-ladder.md](corp-ship-ladder.md) §5):** that row has `$isDisabled = true` (`kuertee_ssac_requirements_by_faction.xml` 25-40), so these factions have no citizenship requirement. The "1 station plus 500 k Cr" row at 42-58 is a commented-out example [read; not tested].

Note: playtest T05 says the player holds a police scanner. Rep with ICG went from -10 to 0, so no police licence was possible yet anyway (needs +10).

## Sources

SWI 0.90 at `/mnt/e/x4-dev/reference/mods/swi-0.90/ext/`; vanilla 8.00 at `/mnt/e/x4-dev/reference/x4-8.00/base/`. Ship models read from the installed `extensions/starwarsmod_m1/ext_01.dat` (the reference copy has no `.dat`).

- Licences: `libraries/factions.xml` galempire 115-129, ascendancy 159-173, newrepublic 203-217, rebelalliance 259-272, corporate 315-329, commerceguild 369-383, huttcartel 420-434, mandodw 468-482, anoat 523-537, huttpirates 637-646, mandoraiders 703-712, valarian 770-784, blacksun 843-858, naboo 923-936, hapes 959-975, kamino 1015-1030, kuat 1064-1077, corellia 1098-1106, sienar 1132-1140, hoersh 1167-1175, rendili 1203-1211, transgalmeg 1238-1246, incom 1277-1285, moncal 1314-1322, bountyhunters 1570-1573, miningguild 1634-1642, player licences 1840-1852.
- Names: `t/0001.xml` page 999840 (SWI) and page 11191913 (citizenship). Immigration messages: `t/0001.xml` 3144-3149.
- Ships: `libraries/wares.xml` R-41 1086, X-wing T65B 622/637, N-1 Modified 1231, V-19 1310, G9 1356, ARC-170 1264, HWK-290 1118-1132, Firespray 580, Razor Crest 1105, Y-wing BTL-B 749, Eta-2 1190, Porax-38-B 963, Fortitude 1340.
- Equipment licences: `wares.xml` A-2 ion (`weapon_a2_s_laser`), SW-7a ion 4977, SW-4 ion turret 4993, HM-6 and Krupx launchers, concussion missiles 14663.
- Ship slots and sizes: `assets/units/size_s|size_m/<ship>.xml` and `macros/<ship>_macro.xml` in `ext_01.dat`; weapon tags from `assets/props/WeaponSystems/*/<weapon>.xml` (`WeaponCon_01` tags).
- Gamestart: `libraries/gamestarts.xml` 1055 (`x4ep1_sw_bhg`), relations 1138-1145.
- Shipyards and wharfs: `libraries/god.xml` (`select ... tags="[wharf]"` and `[shipyard]`); pirate outposts `libraries/stations.xml` 268-270, `constructionplans.xml` plan `pirate_outpost`.
- Vanilla mechanics: `base/libraries/factions.xml` 177-199 (Argon licences: precursors, police 156 k), `base/md/playerreputation.xml` 309-310 (free licences granted when holdable).
