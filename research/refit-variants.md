# Ladder hulls: NPC variants, and refitting a ship from MD (2026-11-06)

Questions:

1. Do the pirate, Hutt and Bounty Hunter NPCs fly the same ship macro the player buys for the R-41, HWK-290, Weequay corvette, C-ROC Corsair, Firespray and N-1 Modified? Or do they fly faction variants with other slots?
2. In X4 8.00, can MD replace a ship's equipment and paint in place, without a build order? Can it apply a `loadouts.xml` entry to an existing ship? How are paint mods defined?

Read from files only, nothing tested in game. Tags: [read] = seen in the files; [inferred] = follows from what was read.

Sources:

- SWI 0.91 HF1, unpacked at `/mnt/e/x4-dev/reference/mods/swi-0.91hf1`. Macros are in `ext/assets/units/size_*/macros/`, components in `ext/assets/units/size_*/`, libraries in `ext02/libraries/`.
- Reaper's Ship Pack 2.8 (`ext_01.cat` of `starwars_rsp`), its XML unpacked to a scratch folder.
- Vanilla 8.00 unpacked at `/mnt/e/x4-dev/reference/x4-8.00` (`base/` and `ego_dlc_*/`). The MD schema is `base/libraries/common.xsd` and the script properties are in `base/libraries/scriptproperties.xml`.
- Who flies each hull: [ladder-hull-sources.md](https://github.com/ecarlste/x4-swi-bounty-hunter/blob/research/ladder-hull-sources/research/ladder-hull-sources.md) (branch `research/ladder-hull-sources`).

## Short answer

1. **They are the same macro.** No ladder hull has a faction variant. Every NPC job picks the same macro the player buys (`r41_macro`, `hwk_290_01_macro`, `weequay_macro`, `gozanti_croc_raider_macro`, `firespray_macro`, `ship_mando_s_n1_macro`). No other macro uses those components except `*_menu_macro` copies, which only the start-menu cutscene uses. RSP adds no variant and changes none of these macros. An NPC ship differs only in its **fitted equipment**, its **paint** (faction theme), and, for the named hunters, **equipment mods**. Slot counts and sizes are the same, so a captured NPC hull refits like a bought one [read].
2. **Yes, MD can refit in place.** 8.00 has `generate_loadout` / `create_loadout` / `get_loadout` (the last reads a `loadouts.xml` entry), then `apply_loadout object="$ship"`. These change an existing ship's engines, weapons, shields, turrets, thrusters, ammo, units, software, crew or drones at once, with no build order. `add_equipment_mods` and `add_paint_mod` work on an existing ship. There is no single-slot "add weapon" or "remove equipment" action, and no "remove paint" action [read].
3. **A paint mod needs no new texture.** It is a `paintmods.xml` entry with colour numbers (hue, brightness, saturation, metal, smooth, dirt), plus an `inventory paintmod` ware in `wares.xml`. A camo pattern is optional and can point at a vanilla pattern texture. Whether SWI's hull materials take the colour shift is untested [read for format; inferred for SWI].

## 1. NPC variants of the ladder hulls

### 1.1 One macro per hull

Each hull has one ship macro and one component. A search of every macro under `ext/assets/units/` for `<component ref="...">` finds only these [read]:

| Hull | Macro (file) | Component | Other macros on that component |
|---|---|---|---|
| R-41 Starchaser | `size_s/macros/r41_macro.xml` 4 (`class="ship_s"`) | `r41` | none |
| HWK-290 | `size_s/macros/hwk_290_01_macro.xml` 4 (`ship_s`) | `hwk_290_01` | `hwk_290_01_menu_macro` |
| Weequay Corvette | `size_m/macros/weequay_macro.xml` 4 (`ship_m`) | `weequay` | none |
| Gozanti C-ROC Corsair | `size_m/macros/gozanti_croc_raider_macro.xml` 4 (`ship_m`) | `gozanti_croc_raider` | none |
| Firespray-31 | `size_s/macros/firespray_macro.xml` 4 (**`ship_m`**, though it sits in `size_s/`) | `firespray` | `firespray_menu_macro` |
| N-1 Modified | `size_s/macros/ship_mando_s_n1_macro.xml` 4 (`ship_s`) | `ship_mando_s_n1` | `ship_mando_s_n1_menu_macro` |

- The `_menu` macros appear only in `ext/assets/cutscenecore/macros/startmenu_sw_mando_n1_macro.xml` 8, 26, 35, the start-menu backdrop. No job, group, ware or MD uses them (grep of `ext02/libraries` and `ext02/md`) [read].
- The C-ROC freighter `gozanti_croc_macro` and the RSP C-ROC-BM `gozanti_croc_bm_macro` are other hulls with their own components (`gozanti_croc`; RSP `assets/units/size_m/gozanti_croc_bm.xml`). They are not variants of the Corsair [read].
- `n1pi_macro` (also named "N-1 Modified Starfighter") is unused: no group and no ware (see ladder-hull-sources). Its component `n1pi` has no file in `size_s/` [read].
- The groups NPC jobs use name the player's macro directly. Example: `shipgroups.xml` 1740-1765 (`bhg_random` names `hwk_290_01_macro` and `firespray_macro`; `bhg_mando` names `ship_mando_s_n1_macro`; `bhg_firespray` names `firespray_macro`). The pirate groups in ladder-hull-sources (`valarian_corvette_m` 1643 etc.) do the same [read].
- RSP's `index/macros.xml` and `index/components.xml` add only `gozanti_croc_bm(_macro)` of these hulls. RSP has no diff on any of the six macros [read].
- The Firespray's `ship_m` class means it counts as an M ship: it uses M docks and M-class licence and job rules, although it has S-size weapons [read for the class; effects inferred].

### 1.2 Slot counts (the same for NPC and player)

Counted from `<connection ... tags="...">` in each component file, with XML comments removed. The tags after the size word are **compatibility tags**: they limit which weapon families fit the slot (e.g. `sw7a`, `d40`, `xv1`) [read].

| Hull (component file) | Weapons | Turrets | Shields | Engines |
|---|---|---|---|---|
| R-41 (`size_s/r41.xml` 436-491) | 6 S: 2 tagged `ix4 ix8 ms2 ms3 tie1 tie7 nk3 sw7a gatling taim1`, 2 tagged `kx5 ms1 tie1 tie7`, 2 tagged `hm6 lr_launcher` (missiles) | 0 | 2 S | 4 S (`incom`) |
| HWK-290 (`size_s/hwk_290_01.xml` 1229-1290) | 2 M (`swmed`) + 4 S (`sw7a`) | 0 | 5 S | 1 S (`hwk`) |
| Weequay (`size_m/weequay.xml` 1116-1236) | 5 M: 3 `xv1 xx3`, 2 `concmed mr_launcher` (missiles) | 3 S (`ag1g`) | 4 M | 6 M (`cr90`) |
| C-ROC Corsair (`size_m/gozanti_croc_raider.xml` 1729-1845) | 2 M (`xv1 xx3 proton swmed mr_launcher`) | 4 S (1 `ag2g ag1g`, 1 `quadlaser duallaser`, 2 `llaser`) | 6 M + 2 tagged `shield gonk` with no size | 5 M (`croc`) |
| Firespray (`size_s/firespray.xml` 623-714) | 2 M (`d40`) + 2 S (`sw7a mg2 krupx`) + 1 S (`seismicl`) | 0 | 10 S | 1 M (`slave`) |
| N-1 Modified (`size_s/ship_mando_s_n1.xml` 101-163) | 3 S: 2 `combat ... kx5 kx7 kx10 tie7 tie1 ms1 ms2 taim1`, 1 `krupx lr_launcher` | 0 | 1 S | 1 S (`mando_n1`) |

For a refit [inferred]:

- A loadout made for the player's hull fits a captured NPC hull, because the connections are the same.
- The family tags matter more than the counts. A generated loadout only puts a weapon where its tags match, so a hand-written loadout must name weapons the slot accepts, or `generate_loadout` must pick them.
- The C-ROC's `shield gonk` slots have no size tag, and its 4 turrets are S-size. The Weequay's missile slots (`mr_launcher`) and the R-41's (`lr_launcher`) take launchers, not guns.

### 1.3 What does differ for an NPC ship

- **Equipment is generated, not fixed.** None of the ladder hulls' `ships.xml` entries names a loadout. Neither SWI's `loadouts.xml` (13 loadouts, none for these macros) nor RSP's (2) has one. Jobs ask for a generated loadout by level: `<loadout><level exact="1.0"/></loadout>` in almost every pirate job (e.g. `valarian_free_plunderer_m_sector` `jobs.xml` 19856, level at 19876; `valarian_mixedfighters_escort` 20084, level at 20099) and `level exact="1"` for the named hunters (`bountyhunters_bobba` 21679-21697). A few escorts use 0.4 (e.g. `jobs.xml` 19073, 19094). The engine picks equipment the owner faction can get (common.xsd 23931-24103, `generate_loadout` "faction: Faction to use for selecting equipment"), so pirates fit pirate-sold weapons [read for jobs; equipment choice inferred].
- **Mines and missiles** come from `loadoutrules.xml` (SWI `ext02/libraries/loadoutrules.xml` 4-48). Example: `mine` weight 40 for `ship_s` and 50 for `ship_m` with `factiontags="plunder"` (lines 7-8), so pirate plunderers get mines more often [read].
- **Named hunters get equipment mods.** `indibhg_mando` (`ships.xml` 3905) and `indibhg_firespray` (3920) carry `<equipmentmods>`: `mod_engine_forwardthrust_01_mk3`, `mod_shield_capacity_02_mk3`, `mod_ship_maxhull_01_mk1` [read]. Whether mods survive a capture was not checked.
- **Paint** comes from the faction theme. SWI `themes.xml` 3-40 adds groups to `painttheme_race_default`: most SWI factions, including `valarian`, `blacksun`, `huttpirates`, `bountyhunters` and `individualhunters`, get `paintmod_0060`. `huttcartel` gets `paintmod_0004` [read].
- **Crew and drops** vary by faction (`<people ref>` and `<drop ref>` in `ships.xml`, e.g. 3466-3500). They don't affect a refit [read].

## 2. Refitting a ship in place from MD (8.00)

### 2.1 Actions

All lines are `base/libraries/common.xsd` [read]:

| Action | Line | What it does |
|---|---|---|
| `generate_loadout` | 23931 | Builds a loadout for a `macro` (or a construction `sequence`). Attributes: `faction`, `otherfaction`, `wares` or `macros` (a list or table to pick from), `level`, `variation`, `quantity`/`quality` overrides, `flags`, `invertflags`, `requireblueprints`. `result` is a **list** of loadouts (use `.{1}` for a ship). |
| `get_loadout` | 24104 | `loadout="'id'"` plus optional `macro`: returns a `loadouts.xml` entry as a loadout value. |
| `create_loadout` | 24136 | Builds a fixed loadout inline from `loadoutelements` (common.xsd 11571: `<macros>` with `engine`, `weapon`, `shield`, `turret` by `macro` and `path`; `shields`/`turrets` groups; `ammunition`; `unit`; `virtualmacros`; `upgrades`). |
| `apply_loadout` | 24201 | "Apply the specified loadout to an object". `object` = a ship or station module. `flags` = a `loadoutflaglist`. |
| `add_equipment_mods` | 24247 | Adds equipment mods (`engine`, `weapon`, `shield`, `ship` wares) to a ship. |
| `add_paint_mod` | 24266 | `object` + `ware` (a paint mod ware "from paintmods.xml"). |
| `set_loadout_level` | 24291 | Sets the stored loadout level (0-1) used by later calls such as `evaluate_unit_storage`. It doesn't change equipment. |
| `create_ship` `<loadout>` | 10788 | At creation only: `ref` (a loadouts.xml id), `loadout` (a script loadout), `level`, `wares`/`macros`, `purpose`, `flags`. Also `<equipmentmods>` (10918) and `<paint ware>` (10923). |
| `add_build_to_modify_ship` | 22067 | The vanilla shipyard refit path, through a build. Not needed for the above. |

`loadoutflaglist` (common.xsd 4884-4994) values: `engines weapons shields turrets shieldgroups turretgroups ammo units software thrusters crew drones`, plus `add` and `remove` ("Add/Remove loadout elements (not used for loadout generation)") and `forcesymmetry` [read].

There is **no** action to add or remove one weapon or shield by slot, and **no** `remove_paint_mod`, `set_object_paint` or remove-equipment-mod action. A search for `remove_*`/`set_*` names with mod, paint, loadout or equipment in common.xsd finds only `set_loadout_level`, `set_module_loadout_level` and the `set_equipment_wares_*` trade actions (38394-38420) [read]. To empty a slot, apply a loadout with the `remove` flag, or apply a whole loadout that leaves the slot out [inferred; see 2.3].

### 2.2 Vanilla uses it on existing ships

- `base/md/gm_barterwares.xml` 2236-2244: `create_ship` a copy of a ship with no loadout, then `<apply_loadout object="$ShipReward" loadout="$ShipToCopy.loadout"/>`. This copies the live loadout of another ship (`object.loadout`, scriptproperties.xml 467 "Current loadout of this object") [read].
- `base/md/scenario_tutorials.xml` 9368-9369: `generate_loadout macro="$PlayerShip.macro" macros="[macro.thruster_gen_s_combat_01_mk1_macro]" flags="thrusters"` then `apply_loadout object="$PlayerShip" flags="thrusters"`. This swaps the thrusters on the player's existing ship [read].
- `base/md/scenario_tutorials.xml` 19053-19059: `create_loadout` with one `weapon macro="weapon_gen_s_laser_01_mk1_macro" path="../con_weapon_006"`, then `apply_loadout object="player.ship" flags="add weapons"`. This adds one weapon to a named connection of an existing ship [read].
- `base/md/gm_getexactfleet.xml` 717-732: `apply_loadout` on a ship that already exists, from a definition's equipment list or a level-1 generated loadout [read].
- **A `loadouts.xml` entry on an existing ship:** `base/md/showcases.xml` 23-24 does `<get_loadout result="$loadout" loadout="'default'" macro="player.ship.macro"/>` then `<apply_loadout object="player.ship" loadout="$loadout"/>` ("Reset weapons to default"). That block is marked `TODO @Owen #Legacy`. The next line includes `md.Setup.RemovePlayerWeapons`, which doesn't exist in 8.00, so it is a stale showcase. `ego_dlc_pirate/md/gs_pirate1.xml` 203-205 is live: it calls `get_loadout` with an id and macro (`story_thefan_harrasser_shih`), then passes the result to `create_ship`. Together these show that `get_loadout` + `apply_loadout` is the documented route for a `loadouts.xml` id on an existing ship [read; that it works on 8.00 is inferred].
- Equipment mods on an existing ship: `base/md/rml_board_ship.xml` 152-173 and `rml_deliver_fleet.xml` 389-405 call `add_equipment_mods object=...` [read].
- Paint at creation: `base/md/setup.xml` 1689 and `story_paranid.xml` 2218 put `<paint ware="ware.paintmod_..."/>` inside `create_ship`. SWI does the same (`ext02/md/swi_hq_discovery.xml` 625). No vanilla MD file calls `add_paint_mod` (grep of `base/` and `ego_dlc_*/` md and aiscripts), so the in-place paint action is schema-only and untested [read].

### 2.3 Open points (need a game test)

- Without `add`/`remove`, does `apply_loadout` replace every slot (removing what the loadout leaves out), or only fill the slots it names? The schema doesn't say. The tutorial adds `add` to keep the existing guns, which hints that the default replaces [inferred].
- Does `apply_loadout` create the new equipment for free and delete the old? Or does it need wares, or a dock? The vanilla calls above happen in space with no wares, so it seems free [inferred].
- Does `add_paint_mod` replace an existing paint? There is no remove action. `object.haspaintmod` and `haspaintmod.{$ware}` (scriptproperties.xml 267-268) can read the state [read for the properties].

## 3. Paint mods

- **Definition.** A paint mod is two entries:
  - a ware in `wares.xml`, e.g. `base/libraries/wares.xml` 7939: `<ware id="paintmod_0006" ... transport="inventory" volume="1" tags="inventory paintmod">` with a `<price>`;
  - a `<paint>` entry in `libraries/paintmods.xml` with the same `ware` id.
- **Parameters.** The file's own header comment (`base/libraries/paintmods.xml` 3-4) lists the attributes: `quality` (1-3), `hue`, `brightness`, `saturation`, `metal`, `smooth`, `dirt`, `extradirt`, then an optional `pattern` (texture path), `scale`, `strength`, `sharpness`, `invert`, `red`/`green`/`blue`/`alpha` (pattern colour) and `personal`. Plain paints are colour numbers only, e.g. line 7: `paintmod_0006 quality="1" hue="143" brightness="-0.8" saturation="-0.8" metal="0.2"`. Camo paints add a vanilla pattern, e.g. `paintmod_0042` `pattern="assets\textures\pattern\pattern_18_diff"`. **So a new paint needs no new texture**, only the ware, the `paintmods.xml` entry (as an `<add sel="/paintmods">` diff) and the text-page name [read].
- **SWI** adds no paint mods. Its `ext02/libraries/paintmods.xml` is a diff whose only two `<paint>` entries (Galactic Empire) are commented out. It sets faction themes with existing vanilla paints (`themes.xml`, see 1.3) [read].
- **Will an SWI hull show it?** Paint mods tint the hull's materials. SWI's hull materials are custom `P1_complex_surface.fx` materials in `ext02/libraries/material_library.xml`. Some have `diffuse_paint_map` / `diffuse_paintStr` properties: `gozanti_civ_01` 10046 (C-ROC hull), `generic_p1_firespray` 684, `weequayeng` 2445. The R-41's hull materials `r41` 10829 and `r41_detail` 10846 have none, nor do the Weequay's main shell materials (`weequay_outershell`, `weequay_plates`, `weequay_wing`). The N-1 Modified uses a separate `mando.*` library that was not read. So a paint may show on some hulls and not on others, such as the R-41. Test in game before relying on paint as a visual marker [read for material properties; effect inferred].
