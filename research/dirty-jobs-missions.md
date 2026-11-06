# Dirty jobs and the rescue: vanilla and SWI mission libraries

For [#66](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/66), feeding [Saving Shaddo: the scripted rescue](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/50) (concept.md, "Stages follow the target-size ladder", stage 1).

Sources: vanilla X4 8.00 unpacked at `E:\x4-dev\reference\x4-8.00` (paths below are from `base/` unless a DLC is named), checked against 9.00 where noted; SWI 0.91 HF1 at `reference\mods\swi-0.91hf1` (`ext02/md`, `starwarsmod_m1/ui`, `subst02/ui`); A Pirate's Life at commit `bf25224`. Every claim cites file:line. **[inferred]** marks anything not read directly in code.

## Short answer

- Vanilla's **generic missions (GM)** and **reusable mission libraries (RML)** cover all three dirty jobs and most of the rescue. A mod can call a GM's `Start` library directly with its own client, texts, reward and no Bulletin Board offer, the way the vanilla guild subscriptions do. That's the main reuse path.
- **Haul trash loot to a buyer:** `GM_BringItems` (inventory items to an NPC) or `RML_Trade_Wares` (cargo to a station's trade offer).
- **Collect a debt from a late payer:** `GM_RetrieveItem`. Beat the payer's ship down until it drops an item (the "payment"), then hand it to a named NPC. `RML_Enforce_Surrender` alone gives the "beat it until it gives up" step.
- **Smuggling run to a chosen spot:** `RML_Drop_Objects` (drop a given macro at a list of positions) or `RML_FlyTo` plus our own check. Vanilla's own "Smuggle" job is just `GM_BringItems` with a different text. SWI's illegal wares (spice and others) give the risk.
- **Saving Shaddo** has no vanilla precedent as one piece, but every part exists: spawning (`LIB_Create_Ships`, or SWI's warp-in of a named hunter), a forced eject (`eject_npcs spacesuit="true"`), a pod pickup (`order.rescue.ship` docks the suit to the rescuer), delivery (`RML_Transport_Passengers_V2`), and a ship-and-pilot reward (`set_owner ... overridenpc="true"`).
- **Feature flags and a skip button:** A Pirate's Life's settings page (kuertee UI Extensions callback `displayOptions_modifyOptions`) is the model. SWI 0.91 bundles a UIX-patched options menu with that callback, so the page works on SWI with no extra mod.
- **SWI side effect:** SWI patches several of these RMLs with kuertee hooks. `RML_Enforce_Surrender` reports success and failure to kuertee's **Bounty Hunter profession**, so a debt job built on it would count toward that profession [inferred effect].

## 1. How a mod reuses a GM

A GM's `Start` library takes a ready-made client and skips the offer:

- `GM_BringItems.Start` params (`md/gm_bringitems.xml`): `Client` "Pre-existing client" (162), `MissionThread` (165), `RewardCr` (168), `RewardObj` "if the reward ... is an object" (169), `WithoutOffer` "Do not create a mission offer. Either run immediately or wait for WithoutOfferWaitCue" (181), `ConversationOffer` (186), `HideFromBBS` (189), `TextTable` for custom names and texts (203).
- Vanilla guilds do exactly this. The Scale Plate Pact "smuggle" job (`md/x4ep1_pirates_subscriptions.xml`, cue `SmuggleItem` at 3236) creates a crew actor (`create_cue_actor`, 3372), then refs `md.GM_BringItems.Start` (3390) with `Client` = the guild contact, `WithoutOffer` true, its own page and text offset, and `DeliveryNPC` = that actor.
- Other GMs referenced this way by vanilla's subscriptions and signal leaks: Assassinate, Transport_Passengers, TrackShip, RetrieveItem, GetExactCrew, BoardShip, SupplyFactory, KillMasstraffic, DeployInPlace, Destroy_Objects, HackPanel, Rescue_Ship (`x4ep1_pirates_subscriptions.xml` 1755-3812; `x4ep1_trade_subscriptions.xml` 3742-6133; `signal_leaks.xml` 707-1571).
- Each RML reports a `$feedbackvalue` (positive = success, -1..-99 = player failure, <= -100 = setup error), listed at the top of each file, for example `rml_retrieveitem.xml` 4-16.
- 9.00 changes `GM_BringItems` and `GM_RetrieveItem` only in `GenerateGenericMission` (the random offer generator, new `$OfferObject` param and patch; `diff` 8.00 vs 9.00 at gm_bringitems 1448-1503, gm_retrieveitem 1033-1071). The `Start` libraries a mod would call are unchanged.

**What this means for Shaddo [inferred]:** Shaddo stays unseen as a body in a station. He can still be the `Client` as a cue actor that's never placed, with his messages sent by `write_incoming_message` (as SWI's MC80 start does, `ext02/md/sw_plot_rebel.xml` 170). Each dirty job is then a `Start` call with `WithoutOffer` true, started from our own script, not the Bulletin Board.

## 2. The three dirty jobs

### 2.1 Haul trash loot to a buyer

| Option | What the player does | Source |
|---|---|---|
| `GM_BringItems` | Bring N of an **inventory** ware to a named NPC on a station; the GM places the NPC and the room | params `DeliveryNPC`, `DeliveryStation`, `DeliveryItem`, `DeliveryAmount`, `PlaceNPC` (`gm_bringitems.xml` 210-226); runs `RML_Deliver_Inventory` (954) |
| `RML_Deliver_Inventory` | Same, as a bare RML (talk to the NPC, hand over items) | `rml_deliver_inventory.xml` 33-65 |
| `RML_Trade_Wares` | Sell **cargo** wares into given trade offers at stations | `rml_trade_wares.xml` 1-38 (param `TradeOffers`, 33); `RML_Deliver_Wares` is "DEPRECATED ... use RML_TRADE_WARES instead" (`rml_deliver_wares.xml` 2) |
| `GM_BarterWares` | Deliver wares to a station and get wares back, not credits | `gm_barterwares.xml` 6-20 |

Pick by what "trash loot" is: hunt drops are inventory items (playtest drops were "Tuning Software 2, Micro-Gimbal 2", `research/save-check-bql-614.md` 49), so `GM_BringItems` fits [inferred]. Cargo loot would use `RML_Trade_Wares`.

### 2.2 Collect a debt from a late payer

- **`GM_RetrieveItem`** (`md/gm_retrieveitem.xml`): "Retrieve specified item" (6). `Start` (125) takes `Client` (129), `WithoutOffer` (144), `TargetShip` "Specific ship that contains the item" (169), `TargetShieldPercent` default 5 and `TargetHullPercent` default 75 "required to drop item" (170-171), `ItemWare` (172), `DeliveryNPC` "If null, the mission ends on collection" (175). It runs `RML_RetrieveItem` (678), then `RML_Deliver_Inventory` (765).
- **`RML_RetrieveItem`** (`md/rml_retrieveitem.xml`): param `NeedTargetShipAlive` (27). On reaching the shield and hull thresholds it gives the pilot the item and drops it (`add_inventory`, `drop_inventory`, 131-132). Feedback: 1 = item collected; -1 = target destroyed when it had to live; -4 = collected by a non-player ship (4-16).
- **`RML_Enforce_Surrender`** (`md/rml_enforce_surrender.xml`): just the "beat it down" step. Params `TargetShip`, `TargetShieldPercent`, `TargetHullPercent` (13-23). Success once a player-owned attacker gets it below both (`OnShipAttacked`, 76-98). Note its `Cheat` cue (66-74): **any player-owned hit sets the target's shield to 0** (`set_object_shield exact="0"`). Vanilla's one use, the Split story's getaway ship, follows it with a "Cease fire! We're ready to negotiate!" line and a docking hand-over (`ego_dlc_split/md/story_split.xml` 5051-5063, 5068-5098). That's the shape of a debt collection: beat the payer, he hails, he pays.
- Paying in credits rather than an item: `reward_player money` (`libraries/common.xsd` 32164-32175; used by SWI at `sw_plot_rebel.xml` 171) or `transfer_money from= to= amount=` (`common.xsd` 32639-32659). `RML_TransferMoney` is the other way round: the player pays an NPC (`rml_transfer_money.xml` 19-31; only used by `upkeep.xml`).
- The stock **Surrender!** hail (`{1002,12005}`, `t/0001-l044.xml` 3926) only makes the crew bail (`conversations.xml` 22-24, 659-661 -> `notifications.xml` `PlayerOwnedShipAttacks` 1185). It doesn't pay anything, and SWI replaces the bail maths (`ext02/md/notifications.xml` 45-75).
- **SWI:** `ext02/md/rml_enforce_surrender.xml` registers the RML with kuertee professions (`RegisterMissionRML`, 8-13) and on cleanup signals `md.kuertee_professions.BountyHunter_Event` with success or failure (22-33). A debt job built on it would feed kuertee's Bounty Hunter profession [inferred; test it].

### 2.3 Smuggling run to a chosen spot

- Vanilla's guild "smuggle" job is a delivery: the Scale Plate cue is named `SmuggleItem` but uses `GM_BringItems.Setup_ExquisiteFood` (`x4ep1_pirates_subscriptions.xml` 3259-3264), which picks a station and 1-3 `inv_finemeal` (`gm_bringitems.xml` 1370-1400). A real `Setup_Smuggle` with drugs (`inv_hallucinogenics`, `inv_harddrug_01`) is commented out, "Not currently used" (1416-1424).
- **`RML_Drop_Objects`** (`md/rml_drop_objects.xml`): `Locations` as `[[$Zone, $Position, $Radius], ...]` and a `DropMacro` (26-29). It uses `RML_FlyTo` per location (117-130) and counts drops from the player's ship group whose macro matches (`event_object_dropped_objects`, 156-169). No vanilla script calls it. Dropped cargo containers likely share one generic macro, so it may not tell which ware was dropped [inferred; check].
- **`RML_FlyTo`** (`md/rml_flyto.xml` 16-46): `Target`, `Offset`, `Radius`, `Distance`, `ReachedTargetSignalCue`. Our own cue can then check what's in the hold or what was dropped.
- **`RML_DeployInPlace`** (`md/rml_deployinplace.xml` 23-47): deploy N of a `DeployableCategory` (for example a satellite or nav beacon) in a sector area. That's a "leave the package here" variant.
- **`GMC_Retrieve_Dead_Drop`** (`md/gmc_retrieve_dead_drop.xml`, page 30232): a vanilla chain that pairs a pickup at a dead drop with delivery (`RML_Transport_Passengers_V2` 807, 1095; `RML_Deliver_Inventory` 1379). It's the closest stock "pick up there, deliver here" story.
- **Risk in SWI:** SWI marks wares illegal per faction, for example `spacefuel` and `spaceweed` (`ext02/libraries/wares.xml` 19995, 20013, `illegal="newrepublic rebelalli..."`). Police scans for contraband are vanilla (`aiscripts/order.move.recon.xml`; see [vanilla-bounty.md](vanilla-bounty.md) 101-107), and SWI patches `IllegalActivityRetaliate` (`ext02/md/notifications.xml` 501-517). Carrying one of these through a faction's space makes the run a real smuggle [inferred].

## 3. Saving Shaddo

### 3.1 Spawn Shaddo, his escorts, the hunter and his escorts on arrival

- **Trigger on arrival:** `event_object_changed_sector object="player.entity"` plus a check, as SWI's MC80 start does before it sends a hunter at the player (`ext02/md/sw_plot_rebel.xml` 177-185).
- **Spawn:** `md.LIB_Create_Ships.Start` (`md/lib_create_ships.xml` 8-50): `Ship_Amount`, `Ship_Faction`, `Ship_Macro` or `Ship_Ref`, `Sector` and `Position`, `PositionObject`, `MinRange`/`MaxRange`, `Pilot_DoCreate`; result group in `$GroupCue.$LIB_Create_Ships_Result`. `SpawnShipsByDefinition` (588-605) spawns a commander with subordinates (`Commander`).
- **SWI precedent for a named hunter:** `BountyHuntersAttacks` finds an `indibhg` ship, sets hull to 100, warps it ahead of the player at a third of radar range and orders `Attack` on `player.ship` with `checkrelation` false (`sw_plot_rebel.xml` 187-201). For Shaddo the target is his ship, not the player.
- **Names:** `set_object_name object= page= line=` names ships and actors (used across vanilla stories, for example `ego_dlc_pirate`/`ego_dlc_split` story files); `create_cue_actor` makes a scripted NPC (`libraries/md.xsd` 2480; example `x4ep1_pirates_subscriptions.xml` 3372); `assign_control_entity ... post="controlpost.aipilot" transfer="true"` seats an actor as pilot (`libraries/common.xsd` 20960; 6 uses in vanilla md).
- **Keep Shaddo's ship alive until the eject:** `md.LIB_Generic.SetShipMinHull` (`md/lib_generic.xml` 2637-2676) sets a hull floor on the ship and its parts. On a spacesuit it also pauses oxygen (2667-2673).
- The hunter (the nemesis) has to survive too: the same floor plus a scripted retreat [inferred]. SWI's named hunters respawn and can't be hired or captured ([named-hunters.md](named-hunters.md)), so the nemesis should be our own spawn, not one of SWI's 19 [inferred].

### 3.2 A named NPC who ejects

- Vanilla ejects crew in spacesuits **only for player-owned ships**: `PlayerOwnedKilled` (`md/notifications.xml` 116-179) calls `eject_people ... spacesuit="true"` and last `eject_npcs ... spacesuit="true" force="true" immediate="true"` (179), skipped if `pilot.$donotbail` (128). NPC ships bailing from combat eject without suits unless player-owned (`spacesuit="$target.isplayerowned"`, 1329).
- So Shaddo's eject has to be scripted: on his ship's hull reaching the floor, `eject_npcs object=$ShaddoShip spacesuit="true" force="true"`. `eject_npcs` "Eject all NPCs from the object"; `spacesuit` = "eject into their defined spacesuit, otherwise the pod defined in ... crewtransfer.podmacro"; `force` = "spawn even if the object is not capturable" (`libraries/common.xsd` 26074-26101). Story precedent: `dismiss_pilot` then `eject_npcs` and `eject_people` (`ego_dlc_pirate/md/story_criminal.xml` 16686-16688).
- **Keep him alive in the suit:** `pause_spacesuit_oxygen` (`common.xsd` 35060-35068), and `SetShipMinHull` on the suit (above). Suits otherwise have `<oxygen maxtime="30"/>` (concept.md, Characters).
- **Pod or suit:** with `spacesuit="false"` the NPC goes into an escape pod (the `crewtransfer.podmacro` script parameter), not a suit (`common.xsd` 26086). Which one `order.rescue.ship` can collect: it only takes `class.spacesuit` (below), so use `spacesuit="true"` [inferred].

### 3.3 Picking up the pod and delivering it to a station

- **Pickup:** order `RescueShip` (`aiscripts/order.rescue.ship.xml`): target must be `class.spacesuit` **owned by the rescuer's true owner** (5-7, as an order input). It moves to the suit (87-101), gives the suit a `DockAt` order onto the rescuer (254), waits for it to dock (wait length set at 277-285, capped by the suit's oxygen time), and if docking fails but owners match, turns the person into an NPC template on the rescuer (309-315).
- **For Shaddo [inferred]:** either `set_owner` the suit to `faction.player` so the player's ships (and the RescueShip order) can take it, or give the suit a `DockAt` order onto `player.occupiedship` directly. Either way it needs a free crew slot (`people.free`, 72). 9.00 adds a target-destroyed handler and space reservation to this order (`diff` 8.00 vs 9.00, lines 21-30, 211-221). Test on 8.00.
- **Delivery:** `RML_Transport_Passengers_V2` (`md/rml_transport_passengers_v2.xml` 34-65): `Passenger` = an NPC component, or `[npctemplate, $Object]` (41-42); `Destination` object (51); `SkipConversation` (49); `DropOff` (50); `TimeOut` (52). Feedback 1 = transported (4-25). The older `RML_Transport_Passengers` succeeds when `$Ship` docks at `DestinationStation` (`rml_transport_passengers.xml` 130-150) but takes people templates (38).
- **SWI model:** kuertee's emergent "rescue" job evacuates a station's crew to another station: dock at the station, wait, dock at the disembark station, talk to its trade NPC (`ext02/md/kuertee_emergent_missions_rescue.xml` 192-196). It's not a suit pickup.
- Vanilla's `GM_Rescue_Ship` and `RML_RescueShip` are not people rescues: they free a manned ship from a minefield (`gm_rescue_ship.xml` 7; `rml_rescueship.xml` 262-286).

### 3.4 Giving the player a ship plus a pilot, or cash

- **Ship with pilot:** spawn the R-41 with a pilot, then `set_owner object=$Ship faction="faction.player" overridenpc="true"`. `overridenpc` = "Set the owner faction of the control entities" (`common.xsd` 34780-34799), so the pilot comes with it. Vanilla uses it for the HQ and static defence (`x4ep1_mentor_subscription.xml` 3184; `factionlogic_staticdefense.xml` 1565). Ships handed over without it: `rml_barterwares.xml` 1337 (barter reward ships), `story_diplomacy_intro.xml` 1286 (lent freighter).
- **The pilot as a cast character:** make him a `create_cue_actor` with our name (`set_object_name`), seat him with `assign_control_entity` (above), then hand over the ship [inferred order; test that the pilot's name and skills survive `overridenpc`].
- **Cash:** `reward_player money=` (`common.xsd` 32164-32175), or a GM's `RewardCr` and `RewardObj` (`gm_bringitems.xml` 168-169).

## 4. Feature flags and a skip button: the A Pirate's Life model

- **Two layers:** a config file of `global.$APiratesLife_<Name>` values run on every start and load (`md/apirateslife_config.xml` 21-66), and an in-game page that changes the page settings, saved with the game (`md/apirateslife_settings.xml` 1-30). Page settings are 0/1 toggles listed in `PageSettings` (`apirateslife_settings.xml`, library at 104-108) and in the Lua (`ui/apirateslife_options.lua` 20-38).
- **Page hook:** `optionsMenu.registerCallback("displayOptions_modifyOptions", modifyOptions, "apirateslife_options")` (`apirateslife_options.lua` 558-562). `modifyOptions` adds a Settings entry with `submenu = pageId` and puts the page in `menuConfig.optionDefinitions` (526-556). Toggles are rows with `valuetype = "button"` (468-476).
- **A skip button** fits as an action row: a `name`, `callback`, optional `selectable`, no `valuetype`, like "Save as new profile..." (491-496). Confirm with `menu.displayUserQuestion` (`ask`, 339-347). The Lua tells MD with `AddUITriggeredEvent(screen, control, value)` (114-117); MD listens with `event_ui_triggered screen="'APiratesLife_Settings'"` (`apirateslife_settings.xml` 307). MD mirrors state back on the player blackboard (`Mirror`, 153-160) [inferred fit: a skip would send e.g. `'SkipRescue'` and MD would jump the questline].
- **On SWI:** the page needs kuertee UI Extensions (`apirateslife_options.lua` 4-6; optional dependency in `content.xml`). SWI 0.91 ships a UIX-patched options menu: `subst02/ui/addons/ego_gameoptions/gameoptions.xpl` defines `menu.registerCallback` (12275) and runs `displayOptions_modifyOptions` callbacks (8052-8053), and SWI's own `starwarsmod_m1/ui/sw_gameoptions.lua` registers one (5). So `swibh` gets the page with no extra mod [inferred from code; check in game].
- **Lua loading:** `ui.xml` loads the file in the `menus` environment with `ego_detailmonitor` and `ego_gameoptions` dependencies (order matters) and declares a `userdata` saved variable (A Pirate's Life `ui.xml`).

## Open checks for the test game

1. Does `eject_npcs spacesuit="true" force="true"` on a non-player ship give a suit the player can collect after `set_owner`?
2. Does `RML_Drop_Objects` tell dropped wares apart, or is our own check needed?
3. Does a job on `RML_Enforce_Surrender` change kuertee's Bounty Hunter profession progress in SWI?
4. Does the pilot keep his name and skills through `set_owner ... overridenpc="true"`?
5. Does a page added through `displayOptions_modifyOptions` show on SWI 0.91 without kuertee's mod installed?
