# Trials extension: ships, loadouts, targets and MD hooks (issue #63)

Facts for the dev-only "trials" extension. [read] = seen in the file at the cited line.
[inferred] = my reading, not tested in game.

Paths used below:
- `SWI90` = `/mnt/e/x4-dev/reference/mods/swi-0.90/ext` (the game runs 0.90; libraries only, no assets)
- `SWI91` = `/mnt/e/x4-dev/reference/mods/swi-0.91hf1` (assets are only unpacked here, `ext/assets/...`)
- `VAN` = `/mnt/e/x4-dev/reference/x4-8.00/base`

## 1. Ship macros

Macro name, class and component from `SWI91 ext/assets/units/size_*/macros/<name>.xml` line 3-4 [read].
English names from `SWI91 ext02/t/0001.xml` [read]. Ware owners from `SWI90 libraries/wares.xml`
(line = the ware's `<component ref>` line) [read].

| Ship | Macro | Class | Ware (SWI90 wares.xml) | Ware owners (0.90) |
|---|---|---|---|---|
| HWK-290 light freighter | `hwk_290_01_macro` | ship_s | `hwk_290_01` :1126 | bountyhunters, anoat, corellia, valarian |
| R-41 Starchaser | `r41_macro` | ship_s | `r41` :1094 | anoat, transgalmeg, blacksun, hoersh, rendili, huttcartel, valarian |
| N-1 Modified Starfighter | `ship_mando_s_n1_macro` | ship_s | `ship_mando_s_n1` :1239 | bountyhunters |
| Firespray-31-class | `firespray_macro` | **ship_m** | `firespray` :588 | bountyhunters |
| Weequay Corvette | `weequay_macro` | ship_m | `weequay` :1993 | blacksun, huttcartel, valarian, transgalmeg |
| Gozanti C-ROC Corsair | `gozanti_croc_raider_macro` | ship_m | `gozanti_croc_raider` :1976 | blacksun, huttcartel, valarian, transgalmeg |
| Gozanti-class Cruiser (Imperial) | `impgozanti_cr_macro` | ship_m | `impgozanti_cr` :1941 | galempire, ascendancy, sienar, kuat |
| Gozanti Imperial Armed Transport | `impgozanti_at_macro` | ship_m | `impgozanti_at` :1916 | galempire, ascendancy, sienar, kuat |
| GS-80 Gallofree Gunship | `gs80_macro` | ship_m | `gs80` :1663 | corellia |
| CR-90A Corellian Corvette | `cr90_01a_macro` | ship_m | `cr90_01a` :1692 | newrepublic, rebelalliance, corellia |
| CR-90B Corellian Corvette | `cr90_01b_macro` | ship_m | `cr90_01b` :1723 | anoat, corellia |

Notes:
- Firespray is `class="ship_m"` although its files live in `size_s/` (`SWI91 .../size_s/macros/firespray_macro.xml:4`) [read].
- "N-1 Modified" (text 104211, `0001.xml:260`) is used by two macros: `ship_mando_s_n1_macro` and
  `n1pi_macro` (`size_s/macros/n1pi_macro.xml:3`). Only `ship_mando_s_n1` has a ware in 0.90; `n1pi`
  has none, so it may not exist in 0.90 [read]. Plain Naboo N-1 is `n1_macro` (owner naboo, wares.xml:1218).
- Other Gozanti macros: `gozanti_croc_macro` (C-ROC, civilian), `gozanti_civ_01_macro`, `gozanti_civ_miner_macro` [read].
- CR-90 variants: `cr90_01a`, `cr90_01as` (AS), `cr90_01b`, `cr90_01d` (Diplomat) [read].

### Named loadouts
`SWI90 libraries/loadouts.xml` has only 13 loadouts (lines 5-434): shuttle_scientist, warlord_546,
warlord_int, mc80r_start, awing/xwing mc80start, venator_start, acclamator_clone, `sw_cr70_venatorstart`
(cr70_01a, :324), delta7, eta2, arc170, gauntlet_outcast [read]. **None of the trial ships has a named
loadout.** 0.91's loadouts.xml adds none for them either [read].

### Why `<level exact="1.0"/>` gives a player ship no engines, and the cheap fix
`create_ship`'s `<loadout><level faction="..."/>` attribute is documented as "The faction to use for
selecting equipment ... (defaults to owner faction)" (`VAN libraries/common.xsd:10804-10808`) [read].
The player faction owns no SWI equipment wares, so nothing fits [inferred]. Vanilla passes the faction
explicitly: `<level exact="0.7" faction="faction.xenon"/>` (`VAN md/setup.xml:1474`) [read].

So for a player-owned ship, try:
```xml
<create_ship name="$Ship" macro="macro.hwk_290_01_macro" sector="...">
  <owner exact="faction.player"/>
  <loadout><level exact="1.0" faction="faction.bountyhunters"/></loadout>
  ...
</create_ship>
```
[inferred, untested]. The equipment faction must own the ship's engine ware. Engine owners (0.90 wares.xml):
`engine_hwk` (:11216) bountyhunters, anoat, corellia, valarian; `engine_slave` (:11201, Firespray) bountyhunters;
`engine_mando_s_n1` (:12451) bountyhunters; `engine_incom` (:9979, R-41) most factions incl. blacksun, valarian;
`engine_gs80` (:10408) corellia, newrepublic; `engine_cr90` (:10445, CR-90 and Weequay) newrepublic,
rebelalliance, corellia, anoat, blacksun, huttcartel, valarian, transgalmeg; `engine_croc` (:10506) corellia,
blacksun, valarian, huttcartel, transgalmeg; `engine_m_gg0` (:11502, Imperial Gozanti, generic "medium
standard") almost all factions [read]. Good equipment factions: bountyhunters for HWK/Firespray/N-1,
valarian for R-41/Weequay/C-ROC, corellia for GS-80/CR-90, galempire for impgozanti_cr.

`create_ship`'s loadout also takes `macros="[...]"` or `wares="[...]"` attributes ("A list of macros from
which the loadout should be generated", `VAN common.xsd:10894-10905`) and `loadout=` (a script-made loadout)
[read]. It does **not** accept an inline `<macros>` list: its children are only `level`, `variation`,
`quantity`, `quality` (`common.xsd:10794-10870`) [read]. An explicit list therefore needs either a new
`<loadout id>` in our extension's `libraries/loadouts.xml` (diff add) or the `macros=` attribute.

### Explicit macro lists (fallback, for a loadouts.xml entry)
Slot names and tags from the component files `SWI91 ext/assets/units/size_*/<component>.xml` [read].
Equipment macros chosen by matching tags in `SWI91 ext/assets/props/...` and checked to have a 0.90 ware [read].
Shields: `shield_s_novaldex45_macro` (S, wares.xml:12857) and `shield_m_novaldexga30_01_macro` (M, :13359),
both used on these slot types in SWI gamestarts (`SWI90 libraries/gamestarts.xml:354, 2847`) [read].

| Ship | Engines | Shields | Weapons / turrets |
|---|---|---|---|
| HWK-290 (`hwk_290_01.xml:1229-1290`) | `con_engine_01` tag hwk → `engine_hwk_macro` | `con_shield_01..05` small | `con_weapon_01,02` tag swmed → `weapon_ga60_m_laser_macro`; `con_weapon_03..06` tag sw7a → `weapon_a2_s_laser_macro` |
| R-41 (`r41.xml:436-491`) | `con_engine_01..04` tag incom → `engine_incom_macro` | `con_shield_01,02` small | `con_weapon_01..04` (kx5 in all four) → `weapon_kx5_s_laser_macro` |
| N-1 Modified (`ship_mando_s_n1.xml:101-163`) | `con_engine_01` tag mando_n1 → `engine_mando_s_n1_macro` | `con_shield_01` small | `con_weapon_01,02` tag kx5 → `weapon_kx5_s_laser_macro`; `con_weapon_03` tag krupx → `weapon_krupx_s_guided_macro` (needs missiles) |
| Firespray (`firespray.xml:623-714`) | `con_engine_01` tag slave → `engine_slave_macro` | `con_shield_01..10` **small** | `con_weapon_01,02` tag d40 → `weapon_d40_m_laser_macro`; `con_weapon_03,04` tag sw7a → `weapon_a2_s_laser_macro` |
| Weequay (`weequay.xml:1116-1236`) | `con_engine_01..06` tag cr90 → `engine_cr90_macro` | `con_shield_01..04` medium | `con_weapon_01..03` tag xv1 → `weapon_xv1_m_laser_macro`; `con_turret_01..03` tag ag1g → `turret_m_ag1g_macro` |
| C-ROC Corsair (`gozanti_croc_raider.xml:1729-1845`) | `con_engine_01..05` tag croc → `engine_croc_macro` | `con_shield_03..08` medium (01,02 are tag "gonk", skip) | `con_weapon_01,02` tag xv1 → `weapon_xv1_m_laser_macro`; `con_turret_01` ag1g → `turret_m_ag1g_macro`; `con_turret_02` quadlaser → `turret_m_quadlaser_red_macro` |
| Imp. Gozanti Cruiser (`impgozanti_cr.xml:1034-1160`) | `con_engine_01,02` "medium standard" → `engine_m_gg0_macro` (as in SWI gamestart :352) | `con_shield_front_R`, `con_shield_front_L`, `con_shield_03..06` medium | `con_weapon_01,02` xv1 → `weapon_xv1_m_laser_macro`; `con_turret_L01`, `con_turret_R01` → `turret_m_quadlaser_red_macro` |
| GS-80 (`gs80.xml:1863-1982`) | `con_engine_01..05` tag gs80 → `engine_gs80_macro` | `con_shield_01..06` medium | `con_weapon_01` swmed → `weapon_ga60_m_laser_macro`; `con_weapon_02..05` kx5 → `weapon_kx5_s_laser_macro`; `con_turret_01..03` → `turret_m_quadlaser_red_macro` |
| CR-90A (`cr90_01a.xml:2906-3027`) | `con_engine_01..11` tag cr90 → `engine_cr90_macro` | `con_shield_01..06` medium | `con_turret_01,02` h9dual → `turret_m_h9dual_red_macro`; `con_turret_03..06` h9single → `turret_m_h9single_red_macro` |

Engine macro names: `SWI91 ext/assets/props/Engines/macros/engine_{hwk,incom,mando_s_n1,slave,cr90,croc,gs80}_macro.xml:3` [read].
Weapon tag sources: `SWI91 ext/assets/props/WeaponSystems/standard/weapon_a2_s_laser.xml:77` (sw7a),
`weapon_ga60_m_laser.xml:77` (swmed), `weapon_d40_m_laser.xml:77` (d40), `weapon_kx5_s_laser.xml:77` (kx5),
`weapon_xv1_m_laser.xml:77` (xv1), `turret_m_ag1g.xml:125`, `turret_m_quadlaser_red.xml:216`,
`turret_m_h9dual_red.xml:222`, `turret_m_h9single_red.xml:217`, `guided/weapon_krupx_s_guided.xml:13` [read].
Format: copy SWI's gamestart `<loadout><macros><engine macro=".." path="../con_engine_01"/>...`
(`SWI90 libraries/gamestarts.xml:2840-2867`, N-1) plus `<software>` and `<virtualmacros><thruster .../>`;
thrusters `thruster_gen_s_allround_01_mk2_macro` / `thruster_gen_m_allround_01_mk1_macro` (:2864, :373) [read].
Weapon/turret/shield picks are [inferred]: tags match, not tried in game.

## 2. M-class hunt targets

The bounty tracker records any NPC that kills while on the vanilla Attack order (see
[swi-bounty.md](swi-bounty.md) §1), and S/M pilots share one "small" bucket for Hunt offers. So M
targets come from SWI's armed M jobs. Jobs pick ships by `<select faction tags size>` →
`libraries/ships.xml` → `libraries/shipgroups.xml` macro weights. All from `SWI90 libraries/` [read].

| # | Faction | Job (jobs.xml line) | M ship (group, weights) | Escorts (subordinate jobs) |
|---|---|---|---|---|
| 1 | blacksun | `blacksun_free_plunderer_m` (18720; also `_m_tag` 18693, `south_` 18747) | `blacksun_corvette_m` (shipgroups 1661): weequay 40, gozanti_croc_raider 20, defender_corvette 20, cumulus_class 20 | `blacksun_mixedfighters_escort` (18904): 3 × from r41 60, kihraxz 30, scurrg_h6 10 (shipgroups 1668) |
| 2 | valarian | `valarian_free_plunderer_m_sector` (19719; `_tag` 19748) | `valarian_corvette_m` (1635): gozanti_croc_raider 30, weequay 30, defender_corvette 20, cumulus 20 | `valarian_mixedfighters_escort` (19947): 3 (variation 1) × r41 40, z95 30, victor_wing 20, v19 20 (1622) |
| 3 | valarian | `valarian_pirate_miner_harasser_m_tag` (19634) | `valarian_corsair_m` (1642): gozanti_croc_raider only | `valarian_mixedfighters_escort` as above |
| 4 | huttpirates | `huttpirates_corvette_plunderer_m_galaxy` (18989) | `huttpirates_corvette_m` (1681): gozanti_croc_raider 40, yv666 40, weequay 20 | `huttpirates_corvette_escort_m` (19044, 1 more M) + `huttpirates_fighter_mixed_s_escort` (19141): 2 × ywing_btlbp, r41, porax_38b, victor_wing |
| 5 | galempire | `galempire_gozanti_patrol_m_sector` (2394) | `galempire_gozanti_m` (136): impgozanti_cr only | `galempire_tief_gozanti_wingman` (2704): 4 × tie_fighter 90 / tie_brute 10 (154); plus `galempire_gozanti_escort_m` (2486): 1 more impgozanti_cr with its own 4 TIEs |
| 6 | newrepublic | `newrepublic_cr90_patrol_m_sector` (6680) | `newrepublic_cr90_m` (487): cr90_01a 40, cr90_01as 15, gs80 10 | `newrepublic_cr90_escort_m` (6704, 1 more M) + `newrepublic_xwing_trio` (6832): 3 × t65b_xwing_01 (504) |

Also: `huttcartel_corvette_patrol_m_sector` (16711) uses `huttcartel_corvette_m` (1177: defender_corvette 70,
cumulus 20, gozanti_croc_raider 10) with `huttcartel_lightfighter_escort` (16864, 3 × r41); `anoat_cr90_patrol_m_sector`
(8977) flies cr90_01b with one cr90 escort and `anoat_mixedfighters_escort` (9132, 3 fighters) [read].
GS-80's only ware owner is corellia, but in jobs it appears for newrepublic through the group above [read].
For a trial, a "realistic" M fight is one M ship plus 2-4 S escorts; the patrol jobs can add a second M [inferred].

## 3. On-demand MD trigger and MD syntax (X4 8.00)

**Conversation hook** [read]. Vanilla injects choices into *any* default conversation in
`VAN md/npc_missions.xml:38-58` (`DeliveryNPCConversation_Start`):
```xml
<cue name="X_Start" instantiate="true" namespace="this">
  <conditions>
    <check_any>
      <event_conversation_started conversation="default"/>
      <event_conversation_returned_to_section section="default"/>
    </check_any>
    <check_value value="event.object.isplayerowned"/>   <!-- our filter, optional -->
  </conditions>
  <actions>
    <add_player_choice text="'Start trial'" section="trials_start" choiceparam="'hwk_vs_m'" position="bottom_left"/>
  </actions>
</cue>
<cue name="X_Next" instantiate="true">
  <conditions><event_conversation_next_section section="trials_start"/></conditions>
  <actions> ... event.param2 is the choiceparam ... </actions>
</cue>
```
`event_conversation_next_section`: object = actor, param = section name, param2 = choice parameter;
attributes `actor`, `section`, `sectionprefix`, `choiceparam` (`VAN common.xsd:12533-12550`) [read].
Vanilla handler with param checks: `md/diplomacy.xml:942-955` (`event.param == 'cFactionDiplomat_licences'`);
choices built at `diplomacy.xml:910-940` [read]. Vanilla's own handler `md/conversations.xml:6-12`
(`DefaultComm`) runs for every default conversation unless `event.object.customhandler` [read], so our
choices add to the normal menu. [inferred] The player cannot comm the ship they are flying (no AI pilot);
comm another player-owned ship or any NPC (e.g. spawn a parked player-owned helper with a pilot).

**set_object_commander** (`VAN common.xsd:33191-33230`) [read]: `object`, `commander` (required),
`assignment` (assignmentexprlookup), or `subordinategroupid` 1-10, `informfleetmanager`. Assignment values
(`common.xsd:3591`): defence, attack, interception, bombardment, positiondefence, assist, mining. Examples:
`<set_object_commander object="$Wingman" commander="$Fighter" assignment="assignment.attack"/>`
(`md/setup.xml:1635`), `assignment="assignment.defence"` (`md/cpu_ship_manager.xml:265`) [read].

**Pilot in create_ship** [read], `md/setup.xml:1623-1635`:
```xml
<create_ship groupname="$XenonShips" name="$Wingman" sector="$S" macro="macro.ship_xen_s_fighter_01_a_macro">
  <owner exact="faction.xenon"/>
  <loadout><level exact="0.7" faction="faction.xenon"/></loadout>
  <pilot><select faction="faction.xenon" tags="tag.aipilot"/></pilot>
  <safepos object="$Fighter" max="3km"/>
</create_ship>
```
`<pilot>` takes the createnpc group (`select` or `macro=`), `common.xsd:10776-10787`; `<pilot macro="$X"/>`
form at `md/scenario_combat.xml:765, 930` [read].

**Gamestart player ship with a loadout ref** [read]: allowed. `gamestarts.xsd:886-902` (`gamestartloadout`
has `ref`), used for the player ship at `gamestarts.xsd:1244`; vanilla example
`<ship macro="ship_arg_s_fighter_04_a_macro"><loadout ref="flightschool_player_ship"/></ship>`
(`VAN libraries/gamestarts.xml:74-75`). SWI gamestarts instead inline `<loadout><macros>...`
(`SWI90 gamestarts.xml:349-375, 2840-2867`).

## 4. End-of-fight events (`VAN libraries/common.xsd`) [read]

- `event_object_destroyed` (13814): attributes `object`/`group` (objecteventsource), `killer`, `method`;
  object = destroyed, param = killer, param2 = kill method, param3 = was parent killed. Group form:
  `<event_object_destroyed group="$AttackingShips"/>` (`md/boarding.xml:168`).
- Player's ship lost: `event_player_owned_destroyed` (15746): param = killed object, param2 = killer,
  param3 = method; attributes `killed`, `killer`, `method` (used `md/notifications.xml:118`). Or
  `event_object_destroyed object="$PlayerShip"` with the ship saved when the trial starts [inferred].
- Player died: `<event_object_destroyed object="player.entity"/>` (`md/tutorial_boarding.xml:17`).
- Ejected: `event_player_ejected` (15269), "Player was emergency ejected from ship", no attributes
  (used `md/notifications.xml:767`). `event_player_ejecting` (15258) fires before.
- Player kill: `event_player_killed_object` (15650): param = killed object, param2 = method; attribute `killed`.
- There is no `event_player_died` / ship-destroyed-specific player event in 8.00 [read: not in the event list].
