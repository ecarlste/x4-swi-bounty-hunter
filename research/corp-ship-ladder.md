# Corporate ship ladder for a bounty hunter (SWI 0.90)

Read from files on 2026-11-04. Extends [licence-costs.md](licence-costs.md); prices there are not repeated unless needed. In-game screens: [corp-licences-cec.png](screenshots/corp-licences-cec.png), [corp-licences-sie.png](screenshots/corp-licences-sie.png). Nothing here was tested in game. Tags: [read] = seen in the files; [inferred] = follows from what was read, not checked in game.

## Short answer

- **Yes, a Neutral (0) player can buy from corporate shipyards.** Every corp licence needs only -10. Docking needs a relation above -10 with the *station owner*, which is the corporation, not the sector's government. The player starts at 0 with every corporation. No ware in SWI has a `minrelation`. The shop checks only the licence, and it checks the licence of the station's owner [read].
- **Bad standing with a government only bites in its space.** At -20 or worse, that government's military attacks your combat ships (`killmilitary`). Sienar's yards sit in Empire space (Scipio). Hoersch-Kessel's sit in ICG space (Geonosis). CEC, Kuat, Rendili and one Incom wharf sit in New Republic space [read].
- **Cheapest ladder: TransGalMeg (TGM), with no new licence at all.** It is one stop in Mataou (Anoat space). R-41 (219 k) → Weequay Corvette (1.74 M, 50 missiles) → Interceptor-class Frigate (5.27 M, 80 missiles, two launchers). All use the civilian licence you already own. Total: **about 7.2 M Cr**. The catch: no ion weapons after the R-41.
- **Best ladder with ion weapons: Kamino.** Military Ships Access (1 M) gets the ARC-170 (220 k: SW-4 ion turret, Krupx launcher, 14 missiles). Add the TGM Weequay for M. Then Military Equipment Access (500 k) and a Pelta II frigate (6.47 M: ion turret, missile turrets, 120 missiles) or an Arquitens (6.18 M: four ion turrets, no missiles). Total: **about 9.9 M Cr**, of which 1.5 M is licences.
- **The Construction and Facilities licences are station-module blueprints.** They let you buy production, ship-building and shipyard modules from that corp. A hunter who builds no stations never needs them.
- **Friend (+10) and Investor (+20) are free.** They are granted automatically at that relation, and citizenship does not gate them for corporations. They unlock no ships. They are only precursors for hidden blueprint licences and a "ship sale contract" (the right to be the corp's ship supplier).
- **Correction to licence-costs.md §3.** Factions without a citizenship row (corporations, Guild, pirates, Rebel Alliance, Sith, Naboo) fall back to the `faction.player` row, and that row has `$isDisabled = true`. So they have no citizenship requirements at all. The "1 station + 500 k" row quoted there is a commented-out example.

## 1. Corporation licence ladders

All prices are in Cr. "Rep" is the UI minimum. Every priced licence below needs only -10 and has no precursor. Ceremony licences are free and given automatically at +10 / +20. "hidden" means the licence is not shown in the menu and can't be bought.

| Corp (sector) | Mil. equip. | Mil. ships | Cap. equip. | Cap. ships | Basic constr. | Interm. constr. | Adv. constr. | Starfighter fac. | Shipyard fac. |
|---|---|---|---|---|---|---|---|---|---|
| Kamino (`kamino`) | 500 k | **1 M** | 5 M | 40 M | hidden, free | hidden | hidden, Investor | hidden, Investor | hidden, Investor |
| Sienar (`sienar`) | 250 k | 2 M | 1 M | 10 M | 100 k | 1 M | 2 M | 10 M | 40 M |
| Kuat (`kuat`) | 2 M | 5 M | 10 M | 40 M | 100 k | 1 M | 5 M | 10 M | 20 M |
| Hoersch-Kessel (`hoersh`) | 100 k | 5 M | 500 k | 20 M | 100 k | hidden, Friend | hidden, Investor | hidden, Investor | hidden, Investor |
| Mon Calamari (`moncal`) | 150 k | 2 M | 10 k | 10 M | 100 k | hidden, Friend | hidden, Investor | hidden, Investor | hidden, Investor |
| Rendili (`rendili`) | 100 k | 2 M | 500 k | 6 M | hidden, free | hidden, Friend | hidden, Investor | hidden, Investor | hidden, Investor |
| TransGalMeg (`transgalmeg`) | 150 k | 3 M | 500 k | 10 M | hidden, free | hidden, Friend | hidden, Investor | hidden, Investor | hidden, Investor |
| Incom (`incom`) | 100 k | 2 M | 1 M | 3 M ("Unique Ships") | hidden, free | hidden, Friend | hidden, Investor | hidden, Investor | hidden, Investor |
| CEC (`corellia`) | 100 k | 5 M | 500 k hidden | 500 k hidden | hidden, free | hidden, Friend | hidden, Investor | hidden, Investor | hidden, Investor |

The two screenshots match this table. CEC shows only five rows because all its construction and capital licences are hidden. Sienar shows priced construction rows because Sienar (and Kuat) sell them for money.

Every corp also has these:
- Civilian Equipment and Civilian Ships Licence: free at -10, already owned by the player from the start (`factions.xml` 1842-1843).
- Friend of Corporation (`ceremonyfriend`, +10) and Corporation Investor (`ceremonyally`, +20): free.
- Ship Sale Contract (`shipsalecontract`): hidden, price 1, needs Investor. It "designates the holding faction as an official ship supplier" for that corp. It matters to a station builder, not a hunter.
- Illegal-module licence (`station_illegal`): hidden.
- Kamino only: Kamino Trading Subscription (1 M, -10).

What each licence type unlocks (from the `restriction licence=` on wares):

| Licence | Unlocks |
|---|---|
| Civilian Ships / Equipment | Ships and equipment tagged `generaluseship` / `generaluseequipment` |
| Military Ships / Equipment Access | Wares tagged `militaryship` / `militaryequipment` (most heavy fighters, gunboats, corvettes, M and L ion turrets, SW-7a and NK-3 ion cannons) |
| Capital Ships / Equipment Access | `capitalship` / `capitalequipment` wares (big L and XL warships, a few elite S fighters such as the X-wing XJ-3 and T70) |
| Basic / Intermediate / Advanced Construction | Station module blueprints: production, habitation, storage, docks (`station_gen_*`) |
| Starfighter Facilities (`station_equip_sm`) | S/M ship-building and equipment-dock module blueprints |
| Shipyard Facilities (`station_equip_lxl`) | L/XL ship-building module blueprints (incl. Sienar/Kuat's XXL build module) |

## 2. Where each corporation sells, and who can buy

Wharfs build S and M ships (`corp_wharf`: an M dock-area build module). Shipyards build L and XL (`corp_shipyard`: L and XL build modules). Sienar and Kuat use Imperial and Kuat plans with the same split [read].

| Corp | Wharf (S/M) | Shipyard (L/XL) | Sector | Sector owner at start (corp is allied 1.0 with it) |
|---|---|---|---|---|
| Kamino | yes | yes | Kamino | Kamino itself (has police, claims space) |
| Sienar | yes | yes | Scipio | Galactic Empire |
| Kuat | yes | yes | Kuat | New Republic |
| Hoersch-Kessel | yes | yes | Geonosis | ICG |
| Mon Calamari | yes | yes | Mon Calamari | CSA (`corporate`) |
| Rendili | yes | yes | Rendili | New Republic |
| TransGalMeg | yes | yes | Mataou | Anoat Federation |
| Incom | 2 wharfs | none | Lucazec; Uviuy Exen | CSA; New Republic |
| CEC | yes | none | Corellia | New Republic |

Sector owner is taken from the government defence station placed in the same sector in `god.xml`. SWI's `sw_corp_licenses*.xml` scripts give the sector owner all of the corp's ship and equipment licences and set the two to relation 1. If the sector changes hands, the new owner gets them [read].

The buying rules, step by step:

1. **Docking.** The station owner (the corp) must be in the `dock` relation range with you. The engine's `dock` range excludes its lower bound. Vanilla's diplomacy script sets "dock.min + 0.001" to "move into the docking UI range". Licence screens show -10 as the "Enemy" edge. So docking needs a relation strictly better than -10 [inferred: range values are hard-coded in the engine, not in the files].
2. **Licence.** The ship configuration menu calls `HasLicence("player", tradelicence, menu.containerowner)`: you need the licence named on the ware, issued by the station's owner [read]. A Kamino military ship bought at Kamino needs Kamino's licence. The same ship at the CSA's yard needs the CSA's licence.
3. **Equipment.** Each weapon in the loadout is checked the same way. Military weapons show as locked without that corp's Military Equipment Access. You can still buy the hull with civilian weapons [read].
4. **Stock.** The station's owner must be listed as an `<owner>` of the ship ware, and the station must be able to build that size [read: wares.xml owners, constructionplans.xml].
5. **No other gate.** SWI ship wares carry no `minrelation` (0 matches in `wares.xml`). No corp has the `noplayerbuyships` or `nolicencesale` tag [read].

**So a Neutral (0) player can buy every civilian-licence ship from every corp right now, and any military ship after buying that corp's licence.** Being -10 or worse with the governments doesn't matter at the corp's own station. It matters on the way there. At -20 or worse, a government's military will attack your combat ship (`mayattack`: a "killmilitary" relation against a ship whose purpose is `fight`) [read: `scriptproperties.xml` 116]. At -25 (`kill`), everything of theirs attacks. The risky trips are Scipio (Empire), Geonosis (ICG: the player starts at -10 there) and Corellia, Kuat, Rendili and Uviuy Exen (New Republic).

## 3. Hunting ships per corporation

Only combat ships that suit a hunter. "Ion" lists what fits the slots. An asterisk (*) marks military equipment. "Missiles" is the ship's missile storage. Slot fits were worked out from the ship and weapon component tags in `ext_01.dat`. Licence column: civ = Civilian Ships (owned); mil = Military Ships Access; cap = Capital Ships Access.

### TransGalMeg (Mataou): the no-licence ladder

| Ship | Size, role | Hull | Price | Licence | Ion | Launchers | Missiles |
|---|---|---|---|---|---|---|---|
| R-41 Starchaser | S fighter | 7,150 | 219 k | civ | A-2, NK-3*, SW-7a* | HM-6 concussion, light rocket | 8 |
| Kihraxz | S fighter | 8,300 | 212 k | civ | - | M-g-2, HM-6 | 10 |
| Gozanti C-ROC Corsair | M corvette | 120,000 | 1.26 M | civ | - | Krupx medium | 30 |
| **Weequay Corvette** | M corvette | 160,000 | 1.74 M | civ | - | medium concussion | **50** |
| Defender Light Corvette | M gunboat | 140,000 | 1.24 M | civ | - | - | 0 |
| Cumulus-class Corsair | M corvette | 146,000 | 2.15 M | civ | - | - (18 turrets) | 0 |
| **Interceptor-class Frigate** | L frigate | 355,000 | 5.27 M | civ | - | medium concussion, Krupx medium | **80** |
| Nebulon-B Patrol Frigate | L | 300,500 | 5.52 M | civ | - | - | 0 |

NK-3 and SW-7a are not sold by TGM (SW-7a: New Republic and Rebels only; NK-3: Empire, Ascendancy, Sith, Sienar, Kuat). At TGM the R-41 gets the A-2.

### Kamino: the ion ladder

| Ship | Size, role | Hull | Price | Licence | Ion | Launchers | Missiles |
|---|---|---|---|---|---|---|---|
| V-19 Torrent | S fighter | 5,500 | 127 k | civ | - | HM-6, light rocket | 6 |
| **ARC-170** | S heavy fighter | 11,000 | 220 k | mil (1 M) | SW-4 turret (civ) | Krupx | 14 |
| Y-wing BTL-B | S bomber | 19,000 | 235 k | mil | SW-4 turret | flex-tube proton, proton bomb | 14 |
| Eta-2 Actis | S interceptor | 4,100 | 156 k | mil | A-2 | - | 0 |
| LAAT/i | S gunboat | 26,000 | 535 k | mil | - | EP-750X EMP launcher (civ) | 30 |
| C-70M Corvette | M corvette | 175,000 | 2.60 M | mil | - | - | 0 |
| **Pelta II-class Frigate** | L frigate | 437,000 | 6.47 M | mil | 1 slot: A-4*, NK-5*, SW-7*, MM-1* | light concussion turrets | **120** |
| **Arquitens Light Cruiser** | L frigate | 359,000 | 6.18 M | mil | 4 slots: A-4* etc. | - | 0 |
| Hammerhead Cruiser | L frigate | 400,000 | 7.06 M | mil | - | medium concussion | 80 |

Kamino sells the A-4 ion turret, the SW-4, the A-2 and Krupx. The A-4 needs Kamino's Military Equipment Access (500 k).

### The other corporations, in short

| Corp | Mil. ships | Best hunter picks |
|---|---|---|
| Incom | 2 M | **E-wing** (S, 252 k, mil: A-2 / SW-7a* ion and Krupx, 6 missiles); ARC-170 (mil); X-wing T65B (civ). No shipyard, so no L. |
| Mon Calamari | 2 M | ARC-170, V-wing (mil); V-19 (civ). L: Quasar Fire (4.78 M, mil, carrier, no ion). |
| Sienar | 2 M | TIE Advanced (S, 224 k, mil, 8 missiles); Gozanti-class Cruiser (M, 1.21 M, **civ**, Krupx medium, 40 missiles); Customs Corvette (M, 1.76 M, mil); **Imperial Light Cruiser** (L, 6.58 M, mil, 4 ion slots for NK-5*, Sienar mil. equip. 250 k). Scipio is Empire space. |
| Rendili | 2 M | R-41, Defender (civ); Nebulon-B Escort (L, 5.18 M, civ, no ion or missiles); Neutron Star (L, 5.76 M, mil, heavy ion slots, but Rendili doesn't sell those turrets). |
| CEC | 5 M | HWK-290 (S, 992 k, A-2 ion, 0 missiles); **GS-80 Gunship** (M, 2.98 M, 40 missiles, rocket and proton torpedo launchers); CR-90 family and Dornean (M, 1.56-2.66 M, turrets only); GR75 Battle Refit (M, 928 k, civ). No shipyard. |
| Hoersch-Kessel | 5 M | B-22 (S, 205 k, mil, A-2 ion); Hardcell and QDF Refractory (L, 5.36 M and 5.6 M, **civ**, no ion or missiles); Overseer, Diamond (L, mil; Diamond has ion slots). Geonosis is ICG space. |
| Kuat | 5 M | Mostly capital-licence L/XL warships. Expensive (equipment licence 2 M). Not a hunter's corp. |

### Recommended ladders

**A. No licences (TGM only).** Fly to Mataou once.

| Step | Ship | Cost | Running total |
|---|---|---|---|
| S | R-41 Starchaser (A-2 ion, HM-6) | 219 k | 0.22 M |
| M | Weequay Corvette (50 missiles) | 1.74 M | 1.96 M |
| L | Interceptor-class Frigate (80 missiles) | 5.27 M | **7.23 M** |

**B. Ion all the way (Kamino + TGM).** The cheapest licences that keep an ion weapon on the S and L steps.

| Step | Buy | Cost | Running total |
|---|---|---|---|
| Licence | Kamino Military Ships Access | 1.0 M | 1.0 M |
| S | ARC-170 (SW-4 ion turret, Krupx, 14 missiles) | 220 k | 1.22 M |
| M | Weequay Corvette at TGM (no corp M combat ship takes ion) | 1.74 M | 2.96 M |
| Licence | Kamino Military Equipment Access (for A-4 ion turrets) | 500 k | 3.46 M |
| L | Pelta II (1 ion turret, 120 missiles) or Arquitens (4 ion turrets, 0 missiles) | 6.47 M / 6.18 M | **9.93 M / 9.64 M** |

Optional S step at Kamino: the LAAT/i gunboat (535 k, 26,000 hull, 30 EMP missiles) on the same 1 M licence. Sienar's Imperial Light Cruiser (2 M + 250 k licences) is the other L with four ion slots, but it is bought in Empire space.

Totals don't count selling the old ship, ammunition, crew or the trip.

## 4. Construction and Facilities licences

- These are the vanilla station-module licence types under corporate names. They gate the purchase of **module blueprints** from that faction [read: vanilla module wares carry `restriction licence="station_gen_basic"` etc.].
- Basic, Intermediate and Advanced Construction: production, habitation, storage and trade-station modules. Starfighter Facilities: S/M ship and equipment dock modules. Shipyard Facilities: L/XL (and XXL) build modules.
- They don't affect buying ships, docking or citizenship. **A bounty hunter doesn't need any of them.**
- Only Sienar and Kuat sell them for money. For the other corps they are hidden and free, behind Friend or Investor.
- The player block already owns `station_gen_basic` for the governments and Kamino, but not for the other corps (`factions.xml` 1850).

## 5. What can turn a corporation against you

- **Your own fire.** Hitting or killing a corp's ships or stations lowers your relation with that corp, as for any faction. At -10 you lose docking, so you can't buy there. Corps are tagged `peaceful` and have no police, except Kamino, which has `police claimspace` and polices its own sector [read].
- **Nothing scripted lowers it.** No SWI script found changes player relations with corporations. `sw_corp_licenses*.xml` changes only corp-to-government relations and licences [read].
- **Corp allegiance follows the sector.** Each corp is set to relation 1 with whoever owns its home sector. A war that flips Scipio, Corellia and so on changes who the corp supplies, not your relation with it [read]. Whether your standing with that government spills over to the corp was not found in the files. The in-game "Relation Implications" tab (vanilla engine) lists what each relation level does. Check it once in game.
- **Friend (+10) perks:** precursor for hidden Intermediate-construction and illegal-module licences (CEC, Hoersch-Kessel, Rendili, TGM, Incom, Mon Cal). No ship access.
- **Investor (+20) perks:** precursor for hidden Advanced, Starfighter and Shipyard Facilities licences and the Ship Sale Contract. No ship access.
- **Higher relation means better prices.** Vanilla tip text says better relations bring discounts (`t` 1001 524). The amount was not looked up.
- **Citizenship doesn't apply.** SSAC's friend/ally gate uses the faction's requirement row. Corporations have none and fall back to `faction.player`, which is `$isDisabled = true`, so the required citizenship type is 0, which becomes `alien`. The ceremony licences come at +10 / +20 as normal [read; "alien or better" for a criminal-record player not checked].

## Sources

SWI 0.90 at `/mnt/e/x4-dev/reference/mods/swi-0.90/ext/`; vanilla 8.00 at `/mnt/e/x4-dev/reference/x4-8.00/base/`. Ship and weapon components read from the installed `extensions/starwarsmod_m1/ext_01.dat` (unpacked to the session scratchpad; not in the repo).

- Corp licences: `libraries/factions.xml` kamino 1014-1031, kuat 1063-1079, corellia 1097-1113, sienar 1131-1147, hoersh 1166-1182, rendili 1202-1218, transgalmeg 1237-1253, incom 1276-1292, moncal 1313-1333. Faction tags on the `<faction>` lines 1011, 1060, 1094, 1128, 1163, 1199, 1234, 1273, 1310. Player licences 1842-1850; player relations patch 1792-1798.
- Licence names: `t/0001.xml` page 999840 ids 500002-500016, 517280. Hidden licence names: vanilla `t/0001-l044.xml` page 20207 ids 7261-7471, 9002, 9051, 9071.
- Corp stations: `libraries/god.xml` shipyard_kuat_01 2678, wharf_kuat_01 2691, shipyard_kamino_01 2721, wharf_kamino_01 2734, wharf_corellia_01 2760, wharf_sienar_01 2777, shipyard_sienar_01 2790, shipyard_hoersh_01 2808, wharf_hoersh_01 2821, wharf_rendili_01 2839, shipyard_rendili_01 2852, wharf_incom_02 2883, wharf_incom_03 2896, wharf_transgalmeg_01 2913, shipyard_transgalmeg_01 2926, wharf_moncal_01 2943, shipyard_moncal_01 2956. Sector names from `mapdefaults.xml` and `t/0001.xml` (903601 Corellia, 906701 Geonosis, 909601 Kuat, 914901 Rendili, 915901 Scipio, 911301 Mataou, 908801 Kamino, 911701 Mon Calamari, 910801 Lucazec, 918401 Uviuy Exen).
- Station plans: `libraries/stations.xml` 18-34, 220-224; `stationgroups.xml` 44-62, 224-234; `constructionplans.xml` plans `corp_wharf` (16976), `corp_shipyard` (17192), `imperial_wharf`, `imperial_shipyard_small`, `kuat_wharf`, `kuat_shipyard`.
- Corp allegiance: `md/sw_corp_licensesSienar.xml` 29-30, 67-144 (same pattern in Corellia, Hoersh, Kuat, Rendili, Transgalmeg).
- Ship wares (`libraries/wares.xml`): tie_advanced 304, ewing 594, b22 877, kihraxz 948, r41 1086, hwk_290_01 1118, laat_com 1155, arc170 1264, cr70_01a 1571, customs_corvette 1615, gs80 1654, impgozanti_cr 1924, gozanti_croc_raider 1967, weequay 1984, cumulus_class 2001, defender_corvette 2035, nebulonb_01e 2353, nebulonb_01p 2386, quasar_imp 2548, quasar_reb 2574, pelta_02 2766, interceptor_frigate 2785, neutronstar 2976, hardcell_frigate 3058, overseer 3140, cis_refractory 3172, diamond_cruiser 3204, arquitens 3304, imp_light_cruiser 3320, hammerheadcruiser 3680.
- Weapon wares (`wares.xml`): weapon_nk3_s_laser 4919, weapon_a2_s_laser 4946, weapon_sw7a_s_laser 4977, weapon_sw4_s_laser 4993, turret_m_ion_nk7 7202, turret_m_ion_nk5 7229, turret_m_ion_single (A-4) 7300, turret_m_ion_dualsw7 7332, turret_m_ion_dualmm1 7348. Station blueprint wares carry `licence="station_equip_sm|lxl|gen_*"` (e.g. `buildmodule_sw2025_gen_ships_m_dockarea`).
- Buying check: vanilla `ui/addons/ego_detailmonitor/menu_ship_configuration.lua` 7023-7080 (`HasLicence("player", tradelicence, menu.containerowner)`).
- Relation ranges: vanilla `libraries/factions.xml` 1-25 (range table, UI mapping), `libraries/scriptproperties.xml` 116 (mayattack/killmilitary), 1777 (dock min excluded); `md/diplomacy.xml` 3596-3597 (dock.min + 0.001).
- Citizenship fallback: `md/kuertee_ssac_requirements_by_faction.xml` 25-40 (player row, `$isDisabled = true`), 42-58 (commented default), 96-238 (nine government rows); `md/kuertee_ssac.xml` 1472-1491 (disabled branch), 2310-2332 (GetIsFriendOk); `md/playerreputation.xml` 501-522.
- Shipyard reveal at start: `md/setup_swmod.xml` 103-107 (`UncoverShipyardsAndWharfs`).
