# Reaper's Ship Pack ships a player can buy (RSP 2.8, SWI 0.91 HF1, X4 8.00)

Read from files on 2026-11-05. Nothing here was tested in game. Feeds the wayfinder ticket "Hunting ladder: ship and wing per target size" ([#36](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/36), child of map [#1](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/1)). It extends [corp-ship-ladder.md](corp-ship-ladder.md) and `research/player-fleet-per-size.md` (on branch `origin/research/player-fleet-per-size`, not on main yet). The buying rules (a station sells the ship wares whose `<owner>` list has the station's owner; the player needs that owner's licence; docking needs a relation above -10) are in those two files and aren't repeated here. Tags: [read] = seen in the files; [inferred] = follows from what was read, not checked in game.

"Money route" means licences bought with credits and no player stations: the corporations, Valarian, Black Sun, the Bounty Hunters, and the Hutt Cartel's free general-use licence. The major factions' military and capital licences need the +10/+20 ceremonies, which kuertee's citizenship gates behind player stations (player-fleet-per-size §3.2). The Rebel Alliance has no citizenship row, so its ceremonies come from reputation alone. That "rep route" is listed separately.

## Short answer

RSP adds 51 ship wares (13 XL, 14 L, 12 M, 12 S), all kitbashed from SWI models. It doesn't edit any SWI ship's stats or price, but it adds sellers to 3 SWI ships (§1). No RSP ship carries `missiononly`, `blueprintsaleonly` or `noplayer*` tags [read]. Of the 51, these can be bought on the money route:

| Rung | RSP ship (variant of SWI) | Price | Licence, where (sector) | Hunter notes |
|---|---|---|---|---|
| **S** | Heavy Victor-wing (Victor-wing, 274 k) | 455 k | military: **Valarian 1 M** (Stenos, Nazzri, Kin Yen) | Hull 15,000. 4 guns + 1 turret. **A-2 ion fits and Valarian sells it**. No missiles |
| S | Z-95-AF4-H (Z-95 Headhunter, 79 k) | 255 k | military: Black Sun 1 M, Rendili/Incom/Mon Cal 2 M, TGM 3 M, Kuat 5 M | Hull 11,500. Krupx launcher, 10 missiles. No ion. Also 2-6 free derelicts to claim |
| S | X-wing XJ-7 (X-wing XJ-3/5, 308 k) | 408 k | capital: Incom 3 M (Lucazec, Uviuy Exen) | Hull 11,500. Medium concussion launcher, 20 missiles. No ion |
| **M** | Gozanti C-ROC-BM Corsair (C-ROC Corsair, 1.26 M) | 3.26 M | military: Black Sun or Valarian 1 M, TGM 3 M | Hull 135,000. 4 medium guns (proton launchers fit), 4 turrets, 30 missiles |
| M | Sivoria-class Heavy Corvette (Charubah Corvette) | 3.46 M | military: Black Sun or Valarian 1 M, TGM 3 M | Hull 142,000. 6 guns, Krupx, 40 missiles, no turrets |
| M | C-70MX Corvette (C-70M, 2.60 M) | 4.60 M | military: **Kamino 1 M** | Hull 181,000. 3 medium guns, 5 turrets. No missiles, no ion |
| M | Braha'tok-class gunship (Dornean Gunship, 2.47 M) | 3.07 M | military: CEC 5 M (Corellia) | Hull 135,000. 10 turrets incl. light concussion tubes, **120 missiles**, 2 S docking pads |
| **L** | **Heraklon Auxiliary Carrier** (Heraklon Ore Miner, 2.88 M) | **3.88 M** | **general use: Hutt Cartel free** (Nar Shaddaa shipyard); Black Sun 300 k (Huk, Fusai, Polis Massa) | Hull 335,000. 26 small dual-laser turrets + 1 light concussion tube, **60 missiles, 6 S fighter hangar**. No ion. Also 1-3 free derelicts to claim |
| L | Neutron Star-class Carrier (Neutron Star Cruiser, 5.76 M) | 5.76 M | military: Rendili 2 M | Hull 552,000. 11 turrets, **24 S hangar**. No missiles, no ion |
| L | Acclamator I Carrier (Acclamator-I Transport, 7.35 M) | 9.35 M | military: **Kamino 1 M**; Sienar 2 M; Mon Cal 2 M; Kuat 5 M | Hull 471,000. 32 turrets, 30 missiles, 16 S hangar. No ion. Engine fit open (see §3) |
| L | Malleus-class Heavy Cruiser (Hammerhead Cruiser, 7.06 M) | 11.06 M | military: Black Sun or Valarian 1 M, TGM 3 M | Hull 510,000. 3 large guns, 23 turrets incl. 2 torpedo tubes, **120 missiles**, 2 S hangar |
| L | Victory III Star Destroyer (Victory II, 19.86 M) | 34.4 M | capital: **Sienar 10 M** (Scipio); Kuat 40 M | Hull 1.1 M. 67 turrets, NK-5/NK-7 ion turrets fit (Sienar sells), 200 missiles, 30 S hangar |
| L | Deleo Prototype Siege Cruiser (Cantwell Arrestor, 6.48 M) | 34.4 M | capital: Sienar 10 M; Kuat 40 M | Hull 405,000. 16 turrets, NK-5 ion fits, 14 S hangar |
| L | MC50A Strike Cruiser (MC40A, 13.4 M) | 29.9 M | capital: Mon Cal 10 M | Hull 697,500. Ion ball turret fits (Mon Cal sells), 100 missiles, 10 S hangar |
| L | Acclamator II Heavy Assault Cruiser (Acclamator-II, 11.6 M) | 15.3 M | capital: Sienar 10 M; Kamino/Kuat 40 M | Hull 710,000. 39 turrets, A-4/NK-5 ion fits, torpedo tubes, 60 missiles, 6 S hangar. Engine fit open |
| L | Arquitens-class Command Cruiser (Arquitens, 6.18 M) | 11.9 M | capital: Kamino or Kuat 40 M | Hull 419,000. A-4 ion fits, 40 missiles. Licence makes it poor value |
| **XL** | Beneficent-class Heavy Cruiser (Allocator, 35.6 M) | 55.6 M | capital: Hoersch-Kessel 20 M (Geonosis) | Hull 2.45 M. Munificent ion cannons fit. 6 S hangar. One derelict in Rothana, guarded by a scripted ambush |
| XL | Servator-class SD, Venator II (Venator, 44.6 M) | 58.6 M | capital: Kuat or Kamino 40 M (Servator); Kuat (Venator II) | Hull 1.85 M / 1.78 M. Tractor turret fits, torpedo tubes, no ion |
| XL | MC75 Heavy Ordnance, MC80 Heavy Liberty (MC75/MC80) | 58.3 M | capital: Kuat 40 M | MC80HL: Home One ion cannon (RSP gives Kuat that ware). MC75 Ordnance: 200 missiles |
| XL | Indoctrinator-class SD (ISD-I, 59.5 M) | 69.5 M | capital: Kuat 40 M | Hull 2.0 M, NK-7 ion fits, tractor |

The general-use Neutron Star Fleet Tender (20.4 M, many sellers), Convalescence Support Carrier (Hoersch-Kessel, military), Venator Fleet Tender and Venator Cargo Ship (XL, capital) are support or cargo ships, not hunters.

**Does RSP beat the SWI ladders on the money route?**

- **S: no.** The TGM or Hutt R-41 (219 k, civilian, A-2 ion) stays the cheapest. The Heavy Victor-wing is a sturdier ion fighter (15,000 hull against the ARC-170's 11,000) on a 1 M Valarian licence, at twice the ARC-170's hull price. It is a side-grade [inferred].
- **M: no.** The Weequay Corvette (1.74 M, civilian, 50 missiles) stays the pick. Every RSP M on the money route needs a military licence, costs more, and none takes an ion weapon. The C-70MX gives Kamino-ladder players a tougher M (181,000 hull) on the 1 M licence they already bought, but with no missiles [inferred].
- **L: yes, at the bottom.** The **Heraklon Auxiliary Carrier is the cheapest L any player can buy: 3.88 M with the Hutt Cartel's free civilian licence.** The TGM/Hutt Interceptor Frigate costs 5.27 M. The Heraklon has 6% less hull and 60 missiles against 80. But it has 26 turrets and carries 6 fighters, which is a wing in one hull [read for stats, inferred for value]. The Hutt Cartel's own yards sell the whole civilian ladder (R-41, Weequay, Interceptor and Heraklon all list `huttcartel` as owner), and the Bounty Hunter start is in Hutt space. So the no-licence ladder becomes R-41 → Weequay → Heraklon = **about 5.84 M** instead of 7.23 M, with every step bought from the Hutts. Also on the L rung: the Acclamator I Carrier on the Kamino 1 M licence (if its engine can be fitted, §3), the Neutron Star Carrier at Rendili, and the Malleus (120 missiles) on a 1 M Black Sun/Valarian licence. Sienar's 10 M capital licence now buys the Victory III (34.4 M), an L with ion turrets, 200 missiles and 30 fighters.
- **XL: no.** Every RSP XL needs a 20-40 M capital licence and costs 55-70 M. That is above SWI's cheapest money-route XL (Hoersch-Kessel: 20 M licence + Munificent or Allocator). The Beneficent is a tougher Allocator at +20 M [inferred].

## 1. What RSP is and what it touches

- `content.xml`: id `Reaper's Ship Pack (SWI)`, version 208, `save="0"`, needs `SW Interworlds` 091 [read].
- `libraries/wares.xml` is a `<diff>` that adds 51 `transport="ship"` wares (lines 17-1543) plus equipment. At the end it adds owners to existing SWI wares [read, 3368-3439]:
  - `turret_l_homeone_ion_cannon` + Kuat (for the MC80HL);
  - `hapan_m` (Charubah Corvette) + Sith, and `engine_hapan_m` + Black Sun, Hutt Cartel, Valarian, TGM, Sith. So the Sivoria can be fitted at those yards;
  - `hammerheadcruiser` (Hammerhead Type-B, 7.06 M, military) + **Rendili**, with its engine and turret;
  - `vsd2` (Victory II, 19.9 M, capital) + **Kamino**, with its shield. Kamino's capital licence is 40 M, so this doesn't help;
  - `engine_venator_xl` + Kuat; `buildmodule_asteroidbase` + Hutt Cartel (a station module, not a ship).
- **SWI ships whose sellers change:** Charubah Corvette (adds Sith), Hammerhead Type-B (adds Rendili), Victory II (adds Kamino). None of these is cheaper for the player than before [inferred].
- Leftovers that are not ships in game: `imperial_nebulon_macro` and its component are in the archive, but `index/macros.xml` doesn't list them and no ware or job uses them. `index/macros.xml` 21 lists `dabc_tector_macro`, but the archive has no such file and no ware uses it [read].

## 2. Every RSP ship ware

Read from RSP `libraries/wares.xml` (line = the `<ware>` line). Size from the macro's `class` in `assets/units/size_*/macros/`. "Base" is the SWI model the component's `source geometry` points at, with that SWI ship's ware price (SWI 0.91 `ext02/libraries/wares.xml`). Gate column: **money** = sold by a corporation, Valarian, Black Sun or (general use) the Hutt Cartel; **rep** = Rebel Alliance (ceremony, no stations needed); **stations** = only major factions whose military/capital licences need citizenship; **hostile** = Sith only (the player starts at -1 with them).

| Line | Ware | Name | Size | Base (SWI) | Price | Licence | Owners | Gate |
|---|---|---|---|---|---|---|---|---|
| 17 | servator_ware | Imperial Servator-class SD | XL | Venator | 78.6 M | capital | galempire | stations |
| 47 | servator_ce_ware | Servator-class SD | XL | Venator | 58.6 M | capital | corporate, ascendancy, kamino, kuat | money (40 M) |
| 80 | provocator | Provocator-class SD | XL | ISD-II | 106.5 M | capital | galempire, ascendancy | stations |
| 111 | venator_aux | Venator-class Fleet Tender | XL aux | Venator | 39.6 M | capital | galempire, corporate, ascendancy, kamino, kuat | money (40 M) |
| 145 | venator_cargo | Venator-class Cargo Ship | XL trade | Venator | 42.6 M | capital | as above | money (40 M) |
| 179 | indoctrinator | Indoctrinator-class SD | XL | ISD-I | 69.5 M | capital | galempire, ascendancy, kuat | money (40 M) |
| 211 | beneficent | Beneficent-class Heavy Cruiser | XL | Allocator | 55.6 M | capital | commerceguild, hoersh | money (20 M) |
| 242 | mc75_ordnance | MC75 Heavy Ordnance Star Cruiser | XL | MC75 | 58.3 M | capital | newrepublic, rebelalliance, kuat | money (40 M) / rep |
| 274 | mc80hl | MC80 Heavy Liberty-class | XL | MC80 | 58.3 M | capital | newrepublic, rebelalliance, kuat | money (40 M) / rep |
| 307 | concordia | Concordia-class Battleship | XL | Keldabe | 103.6 M | capital | mandodw | stations |
| 338 | kelita | Kelita-class Dreadnaught | XL | Kandosii | 93.6 M | capital | mandodw | stations |
| 369 | obliviator | Obliviator-class SD | XL | Procursator | 69.5 M | capital | ascendancy | stations |
| 400 | venator_mkii | Venator II-class SD | XL | Venator | 58.6 M | capital | corporate, kuat, huttcartel | money (Kuat 40 M) |
| 434 | acclamator_carrier | Acclamator I Carrier | L | Acclamator | 9.35 M | military | galempire, ascendancy, corporate, kamino, sienar, kuat, moncal | money (Kamino 1 M) |
| 470 | acclamator_assault | Acclamator II Heavy Assault Cruiser | L | Acclamator | 15.3 M | capital | galempire, ascendancy, corporate, kamino, sienar, kuat | money (Sienar 10 M) |
| 505 | valor_carrier | Valor-class Escort Carrier | L | Valor | 9.75 M | capital | anoat | stations |
| 535 | valor_heavy_cruiser | Valor-class Heavy Cruiser | L | Valor | 21.4 M | capital | anoat | stations |
| 565 | neutronstar_carrier | Neutron Star-class Carrier | L | Neutron Star | 5.76 M | military | corporate, anoat, huttcartel, rendili, hapes | money (Rendili 2 M) |
| 599 | neutronstar_aux | Neutron Star-class Fleet Tender | L aux | Neutron Star | 20.4 M | general | mandodw, huttcartel, rendili, incom, hoersh, transgalmeg, moncal, sienar, corporate, hapes | money (free) |
| 638 | heraklon_carrier | Heraklon Auxiliary Carrier | L | Heraklon miner | 3.88 M | general | huttcartel, blacksun | money (free / 300 k) |
| 669 | mc50 | MC50A Strike Cruiser | L | MC40A | 29.9 M | capital | rebelalliance, newrepublic, moncal | money (10 M) |
| 701 | rook | Rook-class | L | Teroch | 34.4 M | capital | mandodw | stations |
| 732 | deleo_cruiser | Deleo Prototype Siege Cruiser | L | Cantwell Arrestor | 34.4 M | capital | kuat, sienar, galempire | money (Sienar 10 M) |
| 765 | convalescence | Convalescence-class Support Carrier | L aux | Administrator carrier | 20.4 M | military | commerceguild, hoersh | money (5 M) |
| 797 | malleus_heavy_cruiser | Malleus-class Heavy Cruiser | L | Hammerhead | 11.06 M | military | blacksun, huttcartel, valarian, transgalmeg, anoat | money (1 M) |
| 832 | victory_3 | Victory III Star Destroyer | L | Victory II | 34.4 M | capital | kuat, sienar, galempire | money (Sienar 10 M) |
| 864 | command_arquitens | Arquitens-class Command Cruiser | L | Arquitens | 11.9 M | capital | corporate, kamino, kuat | money (40 M) |
| 897 | raider_one | Raider II-class Corvette | M | Raider | 3.01 M | military | galempire, ascendancy | stations |
| 926 | raider_three | Raider III-class Corvette | M | Raider | 6.01 M | military | galempire, ascendancy | stations |
| 955 | raider_five | Raider V-class Corvette | M | Raider | 60.0 M | military, `limited` (1) | galempire, ascendancy | stations |
| 984 | cr70mx | C-70MX Corvette | M | C-70M | 4.60 M | military | corporate, kamino | money (Kamino 1 M) |
| 1013 | aeg777 | AEG-77-EXT Vigo Corvette | M | AEG-77 | 4.73 M | military | commerceguild | stations |
| 1041 | aeg77x | AEG-77X-EXT Vigo Corvette | M | AEG-77 | 40.7 M | military, `limited` (1) | commerceguild | stations |
| 1069 | gozanti_croc_bm | Gozanti C-ROC-BM Corsair | M | C-ROC | 3.26 M | military | blacksun, huttcartel, valarian, transgalmeg | money (1 M) |
| 1100 | brahatok | Braha'tok-class gunship | M | Dornean | 3.07 M | military | newrepublic, rebelalliance, corellia | money (CEC 5 M) / rep |
| 1130 | gs90 | GS-90 Heavy Torpedo Gunship | M | GS-80 | 47.1 M | military, `limited` (1) | newrepublic, rebelalliance, corellia | money (CEC 5 M) / rep |
| 1160 | kom'rk | Kom'rk Gunship | M | Gauntlet | 3.26 M | military | mandodw | stations |
| 1188 | lancer_heavy | Lancer-class Heavy Gunship | M | Lancer pursuit | 3.76 M | military | mandodw | stations |
| 1216 | sivoria | Sivoria-class Heavy Corvette | M | Charubah (hapan_m) | 3.46 M | military | blacksun, huttcartel, valarian, transgalmeg, sith, hapes | money (1 M) |
| 1250 | heavy_z95 | Z-95-AF4-H | S | Z-95 | 255 k | military | corporate, mandodw, anoat, rendili, incom, transgalmeg, blacksun, moncal, huttcartel, kuat, hapes | money (Black Sun 1 M) |
| 1285 | b6_proto | Prototype B6 | S | B-wing | 349 k | capital, `limited` (12) | newrepublic, rebelalliance | rep |
| 1311 | tie_baron | TIE Interceptor Baron | S | TIE Interceptor | 236 k | capital | ascendancy, galempire | stations |
| 1337 | tie_fighter_fo | TIE Fighter First Order | S | TIE Fighter | 125 k | military | ascendancy | stations |
| 1362 | tie_defender_elite | TIE Defender Elite | S | TIE Defender | 555 k | capital | galempire | stations |
| 1387 | t65xj7_xwing | X-wing XJ-7 | S | X-wing XJ-3 | 408 k | capital | rebelalliance, incom, newrepublic | money (Incom 3 M) / rep |
| 1414 | bwingmk3 | B-wing A/SF-03 | S | B-wing | 1.45 M | capital | newrepublic, rebelalliance | rep |
| 1440 | bwingmk2 | B-wing A/SF-02 | S | B-wing | 449 k | capital | newrepublic, rebelalliance | rep |
| 1466 | tie_striker_sk_x1 | TIE/sk x1 experimental | S | TIE Striker | 155 k | military | ascendancy, galempire | stations |
| 1492 | protectorate | Protectorate Fighter | S | Fang | 355 k | military | mandodw | stations |
| 1517 | heavy_victor_wing | Heavy Victor-wing | S | Victor-wing | 455 k | military | huttcartel, valarian | money (Valarian 1 M) |
| 1543 | tie_fury_b | TIE Fury /B | S | TIE Fury | 445 k | capital | sith | hostile |

- **`limited`** isn't a sale block. `setup_rsp.xml` 16-19 sets `limited_blueprint_*` counts: B6 12, Raider V 1, GS-90 1, AEG-77X 1. Vanilla's configurator refuses a purchase once you own that many ("You cannot own any more copies of this ship.") [read: V8 `menu_ship_configuration.lua` 7082-7099].
- **NPC-only in practice:** the 21 "stations" and "hostile" rows, unless the player builds stations in that faction's space. The "rep" rows (3 rep-only: B6, B-wing A/SF-02 and -03) need +10 (military) or +20 (capital) with the Rebel Alliance, bought at its Alderaan wharf (S/M only; its shipyard is commented out in `god.xml` 2540). So the MC50, MC75 Ordnance and MC80HL can't be bought from the Rebels [read: SWI 0.91 `god.xml` 2540, 2553; factions.xml 255-266].
- RSP's jobs and ship groups field most of these ships for NPC factions (`libraries/jobs.xml`, `ships.xml`, `shipgroups.xml`), so they also become bounty targets ([swi-0.91-diff.md](swi-0.91-diff.md) §7) [read].

## 3. Fitting: engines, ion, missiles, hangar

A ship can only be bought if the yard sells an engine that fits. Vanilla marks engines `allowempty = false` and refuses the purchase with "missing mandatory upgrades" [read: V8 `ego_detailmonitorhelper/helper.lua` 8488, 8492; `menu_ship_configuration.lua` 7569-7579]. Turrets may be left empty (`allowempty = true`, helper.lua 8510). Fits below were matched by a scratch script. It counts an equipment piece as fitting when all its connection tags (minus `component`) are in the slot's tags. Owners come from SWI 0.91 `wares.xml` plus RSP's owner patches.

- **Engines are sold where the ship is, for every money-route ship but the Acclamators.** Examples: `engine_hz95` (RSP 3131) is sold by every faction but the Bounty Hunters. `engine_victor` (Valarian, Hutt). `engine_croc` (TGM, CEC, Valarian, Black Sun, Hutt). `engine_hapan_m` (RSP's patch adds Black Sun, Hutt, Valarian and TGM). `engine_mc75` (Heraklon; every faction). `engine_xwing` (Incom). `engine_m_dorean` (CEC). `engine_arquitens` (Kamino only). `engine_l_imp_acc` (Deleo: Sienar, Kuat). `engine_allocator` (Hoersch-Kessel, Mon Cal). `engine_mc80` (Kuat, Mon Cal) [read].
- **Open: the Acclamator I Carrier and Acclamator II.** Their 2 engine slots are tagged `engine large standard`. That fits only vanilla L engines, and SWI removes all of those (`wares.xml` 18487-18568), except Xenon's (`engine_xen_l_allround_01_mk1`, owner `xenon`, `noplayerblueprint`). SWI's own Acclamator-I and -II have the same slots (`acclamator1.xml`, `acclamator2.xml`). So none of these may be buyable at all [inferred; check once in game at Kamino].
- **Neutron Star Carrier** has the same engine slots as SWI's Neutron Star (9 `engine large neutron` plus 27 untyped `engine large large`). If one is buyable, both are [read; inferred].
- **Heraklon turrets:** its 25 `turret small duallaser red green hittable` slots take the orange dual laser (`turret_m_duallaser_orange`/`_02`, general-use equipment). The Hutt Cartel, Black Sun, Valarian and TGM sell it (SWI `wares.xml` 7876, 7899). Its light concussion tube (`turret_m_conctubelight`, 9218) is general-use and sold by both. So a Heraklon can be fully armed with civilian equipment at Nar Shaddaa [read].
- **Ion weapons that fit and that a money-route seller has:** Heavy Victor-wing: A-2 (`weapon_a2_s_laser`, general equipment, Valarian/Hutt sell it, 5003). Victory III, Deleo, Acclamator II: NK-5/NK-7 (Sienar, Kuat; military equipment, 7262, 7289). Command Arquitens: A-4 (`turret_m_ion_single`, Kamino, 7360). MC50 and MC75 Ordnance: ion ball turret (Mon Cal, Kuat; 7342). Beneficent: Munificent ion cannon (`weapon_munion_l_laser`, general equipment, Hoersch-Kessel and Mon Cal, 5779). MC80HL: Home One ion cannon (Kuat via RSP's patch) [read].
- **Tractor:** the heavy tractor turret (`turret_m_tractor_heavy`, general equipment, sold by nearly every faction, SWI 9067) fits only RSP XLs: Servator, Servator CE, Venator Fleet Tender, Venator II, Indoctrinator, Provocator, Obliviator, MC75 Ordnance, MC80HL. No RSP S, M or L ship takes one [read].
- **Missile storage** (macro `storage missile`): Heraklon 60, Malleus 120, Braha'tok 120, Victory III 200, MC50 100, Acclamator I 30, Acclamator II 60, Gozanti BM 30, Sivoria 40, Z-95-AF4-H 10, X-wing XJ-7 20, Heavy Victor-wing 0, C-70MX 0, Neutron Star Carrier 0 [read].
- **Hangar** (`shipstorage_sw_s_capN`): Heraklon 6 S, Acclamator I 16, Neutron Star Carrier 24, Deleo 14, Victory III 30, MC50 10, Malleus 2, Beneficent 6 [read]. A hangar lets the hunter bring S wingmen inside one hull instead of escorting them [inferred].

## 4. Free hulls RSP places at game start

All four scripts run on `md.Setup.GameStart` or `event_player_created` in the main SW galaxy [read].

- **Heraklon Auxiliary Carrier, 1-3 copies** (`md/rsp_heraklon_carrier.xml` 16, 25-55). Placed in random ownerless sectors, never Sith-owned, 220-330 km from centre. Ownerless, no crew, hull 5-20%. Same pattern as SWI's Katana Dreadnoughts, so it's claimed the same way: fly up in a spacesuit and claim [inferred]. A free L carrier for a broke hunter.
- **Z-95-AF4-H, 2-6 copies** (`md/rsp_heavy_z95.xml`, same script, count at 16). Free S heavy fighters.
- **Beneficent derelict in Rothana** (`md/setup_event_beneficent.xml` 16-32, hull 2-5%). A warning at 100 km (47) and an ambush at 30 km or on claim (74-104). Claiming it resets the ship to ownerless and spawns a Lucrehulk leader, Providence carriers and Vulture droids hostile to the player (105-183). It's a combat event, not a free XL early on [read; inferred for difficulty].
- **Prototype Super Star Destroyer derelict in Firrerre** (`md/setup_event_protossd.xml` 18-32). The same trap: a Venator Fleet Tender leader, Provocators and TIE elites (101-215). The prize is SWI's XXL `ship_imperial_xxl_executer_proto` [read].

## 5. Effect on the hunting ladder

- **Cheapest no-licence ladder (all at Hutt Cartel yards):** R-41 Starchaser 219 k (Nal Hutta wharf) → Weequay Corvette 1.74 M (Nal Hutta wharf) → **Heraklon Auxiliary Carrier 3.88 M (Nar Shaddaa shipyard)**. Total about **5.84 M Cr**, against 7.23 M with the Interceptor at the L step. The Bounty Hunter start reveals Hutt space with its shipyards and wharfs (player-fleet-per-size §1). So the whole ladder is on the starting map [read for owners; inferred for the route].
- **Kamino ion ladder (corp-ship-ladder.md B):** unchanged at S and L. RSP adds the C-70MX as a missile-less M alternative on the same licence. The Acclamator I Carrier is a 9.35 M carrier on that licence if its engine problem is only in the slot data (§3).
- **Black Sun/Valarian 1 M military licence ladder:** Heavy Victor-wing (Valarian, ion) or Z-95-AF4-H → Gozanti C-ROC-BM or Sivoria → Malleus (11.06 M, 120 missiles). It costs more than the Hutt civilian ladder, so take it only if the missile cruiser is worth it [inferred].
- **XL:** nothing new on the money route under 55 M.
- Ion weapons stay absent from every cheap M and from the cheap L (Heraklon, Interceptor). A hunter who wants ion at L still needs the Kamino Pelta II or Arquitens (6.2-6.5 M plus 1.5 M licences) [read: corp-ship-ladder.md].

## Open checks for in-game testing

- Can a player buy the Acclamator I Carrier (or SWI's Acclamator-I/II) at Kamino, or does the configurator show no engine?
- Does the Nar Shaddaa shipyard list the Heraklon Auxiliary Carrier at the start relation (-0.001), and does it build with orange dual lasers?
- Can the derelict Heraklons and Z-95-AF4-Hs be claimed like Katanas, and how quickly are they found?

## Sources

RSP 2.8 = installed `extensions/starwars_rsp/ext_01.cat/.dat` (X4 8.00 install on the E: Steam library), read in place; its XML was unpacked to the session scratchpad by a TypeScript cat/dat reader (not in the repo). SWI 0.91 HF1 = `E:\x4-dev\reference\mods\swi-0.91hf1` (`ext02/libraries`, `ext02/md`, `ext/assets`). V8 = vanilla 8.00 at `E:\x4-dev\reference\x4-8.00\base`; vanilla 9.00 `base/assets/props/Engines` for engine tags.

- RSP `content.xml` 1-11. `libraries/wares.xml`: ship wares at the lines in §2; `engine_hz95` 3131; `engine_servator_xl` 3097; owner patches 3368-3439. `index/macros.xml` 7-21 (XL), 21 (`dabc_tector`), 30 (Heraklon). `md/setup_rsp.xml` 16-19 (`limited_blueprint_*`). `md/rsp_heraklon_carrier.xml` 16-55; `md/rsp_heavy_z95.xml` 16, 43-44; `md/setup_event_beneficent.xml` 16-32, 45-47, 74-183; `md/setup_event_protossd.xml` 18-32, 101-215.
- RSP ship macros `assets/units/size_{s,m,l,xl}/macros/*_macro.xml`: `storage missile`, `hull max`, `people capacity`, `threatscore`, `shipstorage_*`, `dockarea_*` (e.g. `heraklon_carrier_macro.xml`: missile 60, hull 335000, crew 47, `shipstorage_sw_s_cap6`). Components `assets/units/size_*/*.xml`: `source geometry` (base model) and slot `tags`.
- SWI 0.91 `ext02/libraries/wares.xml`: base ships z95 542, t65xj3_xwing 652, victor_wing 1282, cr70_01a 1572, dorean_corvette 1730, gozanti_croc_raider 1968, hapan_m 2310, acclamator1 2431, acclamator2 2461, heraklon_solid 2694, vsd2 2805, neutronstar 2978, cis_escort_carrier 3158, mc40a 3273, arquitens 3306, arrestor_cruiser 3373, hammerheadcruiser 3682, mc80 3742, mc75 3864, isd_1 3916, venator_01 4052, allocator 4206; r41 1087, weequay 1985, interceptor_frigate 2787 (all list `huttcartel`). Equipment: weapon_a2_s_laser 5003, weapon_nk3_s_laser 4976, weapon_sw7a_s_laser 5034, weapon_munion_l_laser 5779, turret_m_ion_nk7 7262, turret_m_ion_nk5 7289, turret_m_ion_single_ball 7342, turret_m_ion_single 7360, turret_l_homeone_ion_cannon 7492, turret_m_duallaser_orange 7876, turret_m_duallaser_orange_02 7899, turret_m_tractor_heavy 9067, turret_m_conctubelight 9218, engine_croc 10583, engine_victor 11555, engine_neutron 11966, engine_mc75 12276; vanilla L engine removals 18487-18568.
- SWI 0.91 `factions.xml` licences: rebelalliance 255-266, huttcartel 418-429, valarian 772-782 (general 300 k, military 1 M, capital 2 M at -0.01), blacksun 845-855 (general 300 k, military 1 M, capital hidden), kamino 1017-1028, kuat 1066-1077, corellia 1100-1111, sienar 1134-1145, hoersh 1169-1180, rendili 1205-1216, transgalmeg 1240-1251, incom 1279-1290, moncal 1316-1327, bountyhunters 1571-1582.
- SWI 0.91 `god.xml`: shipyard_huttcartel_01 1895 (Nar Shaddaa), wharf_huttcartel_01 1908 (Nal Hutta), shipyard_rebelalliance_01 2540 (commented out), wharf_rebelalliance_01 2553 (Alderaan), corp yards 2678-2956, wharf_blacksun_01..03 3134-3175 (Huk, Fusai, Polis Massa; `pirateasteroidbase`), wharf_valarian_01/02/kinyen 3201-3240 (Stenos, Nazzri, Kin Yen; `pirateoutpost`). `stations.xml` 268-274; `stationgroups.xml` 216-222; `constructionplans.xml` `pirate_outpost` 16393 (M dock + `buildmodule_gen_ships_l`), `pirate_asteroidbase` 16499 (`buildmodule_asteroidbase`). `ext/assets/structures/buildmodule/macros/buildmodule_asteroidbase_macro.xml` (`builder classes="ship_l ship_m ship_s"`).
- SWI 0.91 `md/setup_swmod.xml` 425-460: the only `set_ship_wares_*` calls (XXL lists); nothing else filters what yards sell.
- SWI 0.91 `ext/assets/units/size_l/acclamator1.xml`, `acclamator2.xml`, `neutronstar.xml`: engine slot tags. Vanilla 9.00 L engine components (`engine large component standard`): arg, par, tel, spl, ter, xen. `engine_xen_l_allround_01_mk1` owner xenon (9.00 `base/libraries/wares.xml` 1466-1478).
- V8 `ui/addons/ego_detailmonitor/menu_ship_configuration.lua` 7039-7099 (licence, `blueprintsaleonly`, `islimited` checks), 7541-7579 (mandatory upgrades); `ui/addons/ego_detailmonitorhelper/helper.lua` 8488-8514 (`allowempty`); `t/0001-l044.xml` 1819 (text 1001/8020).

[Back to the bounty research](../bounty-research.md). Related: [corp-ship-ladder.md](corp-ship-ladder.md), [swi-0.91-diff.md](swi-0.91-diff.md), [licence-costs.md](licence-costs.md).
