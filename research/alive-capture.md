[Back to the bounty research](../bounty-research.md). Related: [pirates-mod-capture.md](https://github.com/ecarlste/x4-swi-bounty-hunter/blob/research/pirates-mod-capture/research/pirates-mod-capture.md) (#48), [swi-bounty.md](swi-bounty.md).

# Alive capture: what happens to pilots and crew, and can we take prisoners? (2026-11-06)

Facts for the design ticket "Alive bounties: prisoners worth more alive".

Sources. `V8` = vanilla 8.00 `base/` at `E:\x4-dev\reference\x4-8.00` (DLC folders checked by grep). `SWI` = SWI 0.91 HF1 `ext02/` at `E:\x4-dev\reference\mods\swi-0.91hf1`. Script actions and properties are checked in V8 `libraries/common.xsd` and `scriptproperties.xml`. Nothing was run in game. Tags: **[read]** = seen in the files; **[inferred]** = reasoning, to check in game.

## Short answer

| Question | Answer |
|---|---|
| 1. Bail: what happens to pilot and crew? | They leave in **escape pods** (NPC ships only). Pods fly to the nearest friendly station and are destroyed on docking, or are destroyed once they drop out of visible attention. The player **can't pick up** pods or people: there is no collect or tractor action for them in 8.00 scripts. |
| 2. Boarding: what happens to pilot and crew? | **All deleted.** Every person template is removed and the pilot is destroyed. No prisoners, no pods. |
| 2b. `entityrole.prisoner` | Exists. Vanilla uses it for (a) a marine who claims a ship someone else owns, (b) prisoners in station prison cells (missions and stories), (c) **crew definitions: military NPC ships spawn with a few prisoners aboard** (vanilla and SWI `people.xml`). No boarding or police code uses it. |
| 2c. Hold and deliver a prisoner? | **Yes, with script.** A prisoner is an NPC template on a ship. It takes a crew slot (`people.capacity`) and the ship's crew menu lists it. MD can make one (`create_npc_template ... role="entityrole.prisoner"`), move it (`transfer_people`), re-role it (`set_npc_template_role`) and delete it (`remove_npc_template`). That's enough for a "deliver at station" step. |
| 3. Can MD follow the target's pilot after a bail or capture? | **After a bail, for a short time.** Catch the pods with `event_object_dropped_objects` on the target. Keep the pilot entity and its `seed`, and check `.exists`, `.ship` and `.sector`. Once the pod docks or leaves the player's sight, the pod is destroyed [read], and the pilot with it [inferred]. **After boarding, no.** The pilot is destroyed. |
| 4. Any alive/dead or "bring back" step to reuse? | **SWI's hunt has none.** Destroyed and abandoned end the hunt the same way. Reusable pieces: vanilla `RML_Transport_Passengers_V2` (carry an NPC to a destination), vanilla `RML_Capture` (unused library: success on ownership change), kuertee's station-rescue mission in SWI (moves NPCs aboard the player's ship as passengers and lets them off at another station). |
| 5. Police arrest? | **No.** Police scan for illegal cargo, then turn hostile and attack. A player with a police licence can order an NPC to eject illegal cargo. Nobody is taken prisoner. |

So an alive bounty is new `swibh` work. The nearest match is to **turn the target's pilot into a prisoner template on the player's ship when it bails, instead of letting it eject** (or when the player boards the ship). The hand-in step then removes the template at the contract station and pays.

## 1. Bailing: pilot and crew

### Vanilla 8.00 [read]
- The crew bail in `PlayerOwnedShipAttacks`. The batch is `eject_people object="$target" ... spacesuit="$target.isplayerowned"` when a role is set, otherwise plain `eject_people` (`V8 md/notifications.xml` 1329, 1332). Only player-owned crew get spacesuits. NPC crew get pods.
- The pilot bails when the batch covers all remaining crew, the target isn't a capital ship or player-owned, and the attacker is player-owned or wants a claim (1294-1296). The pilot leaves with `eject_npcs object="$target"` (1361). There's no `spacesuit` flag, so a pod. A non-NPC pilot (e.g. an AI computer) is destroyed (1362-1364).
- `eject_people` and `eject_npcs`: "they will use escape pods". `spacesuit` = "eject into their defined spacesuit, otherwise the pod defined in script parameter crewtransfer.podmacro" (`V8 libraries/common.xsd` 26074-26150). The pod macro is `ship_gen_xs_escapepod_01_a_macro` (`V8 libraries/parameters.xml` 1595). A pod holds up to 3 people (1597).
- What a pod does (`V8 aiscripts/move.escapepod.xml`): it finds a station of at least neutral relation, in the zone and then in the sector (43-63). It flies there and docks (77-95), then **self-destructs on docking** (97-98, 125-127). With no station, it flees, then waits until it is **no longer visible to the player and self-destructs** (101-127). Out of sight (`attention min="unknown"`) the same steps run (131-205). A pod launched after a hostile act may report the attacker to the police on arrival (82-87).
- The player's own crew, when their ship is destroyed, go into spacesuits (`PlayerOwnedKilled`, `V8 md/notifications.xml` 116-179, `spacesuit="true"`).

### SWI Enhanced Bailing [read]
- Crew: `eject_people ... role="$bail_role" level="0"` with **no `spacesuit` attribute at all**, so pods even for player-owned crew (`SWI md/notifications.xml` 191, 194).
- Pilot: `eject_npcs object="$target"` (241), pods. SWI drops vanilla's "not a capital ship" and "attacker is player-owned" conditions (156-159), so civilian L/XL can lose their pilot too. SWI keeps military L/XL at half their crew, so their pilot never bails (147-154; see pirates-mod-capture.md section 1).
- The bailed ship goes on a list with a 30-70 min lifetime, then is destroyed if it is still unclaimed (271-300, per pirates-mod-capture.md section 2).

### Picking them up [read]
- The 8.00 collect actions are `collect_drop`, `collect_asteroid`, `collect_deployable` and `collect_unit` (`V8 libraries/common.xsd` 34366-34405). The collect events cover ammo, powerups, resources and wares only (13491-13599, 15345-15420). `order.collect.ship` collects `class.drop` and skips spacesuits (`V8 aiscripts/order.collect.ship.xml` 3, 10, 19).
- No 8.00 script, xsd or `ui` Lua file mentions a tractor beam (grep "tractor": no hits).
- **So pods and people can't be collected by the player in 8.00.** A "pick up the pilot" step would have to be scripted: for example, when the player's ship comes near the pod, move the pod's pilot onto the player's ship as a prisoner and destroy the pod [inferred].

### Prisoners aboard the target
NPC ships can carry prisoners (section 2b). SWI and vanilla eject crew by role `service` or `marine` (`SWI md/notifications.xml` 111-113, `V8 md/notifications.xml` 1279-1281), so prisoners aboard are probably not ejected in those batches [inferred].

## 2. Boarding: pilot and crew

### What vanilla boarding does [read]
- On success, `Boarding_Successful` signals `Transfer_Ownership` (`V8 md/boarding.xml` 1490-1505). The leftover TODO, "remove all people from the target? NB: now done in Transfer_Ownership", is at 1517-1518.
- `Transfer_Ownership` (2658-2756) does this:
  - Every person template on the target is removed. Any instanced person gets `npc_despawn` (comment: "despawn due to being killed"), then `remove_npc_template` (2708-2718).
  - Every NPC control entity of another faction, the pilot included, gets `abort_scripts`, `dismiss_control_entity` and `remove_actor_from_room ... destroy="true"`. The comment: "kill remaining enemy personnel on-board the seized ship" (2720-2731).
  - Then `set_owner` (2735).
- **So a boarded ship's pilot and crew are deleted.** They aren't taken prisoner and don't flee. Docked ships that are capturable change owner too, and units and deployables are removed (2675-2705).
- SWI doesn't patch `md/boarding.xml`. Its `rml_board_ship.xml`, `gm_board_ship.xml` and `rml_capture.xml` diffs only add kuertee Professions hooks (`SWI md/rml_capture.xml` 1-36).

### Where `entityrole.prisoner` is used (grep of V8 base + DLCs and SWI ext02) [read]
- Defined: `V8 libraries/common.xsd` 3515 (`entityrole.prisoner`) and 4519 (`prisoner`).
- **move.claim:** when a marine claims a ship that belongs to someone else, "taken prisoner": `create_npc_template name="$person" entity="this" object="$startship" role="entityrole.prisoner"`, then `transfer_people object="$target" otherobject="$startship"` with `existing_people people="[$person]"` (`V8 aiscripts/move.claim.xml` 89-96; same at 203-209). **This is the model for making a prisoner from a live NPC entity.**
- **Prison cells:** `gm_prisonbreak.xml` puts the client in a `tag.prisoner` slot with `set_entity_role ... entityrole.prisoner` (`V8 md/gm_prisonbreak.xml` 608-620). On success the client gets `escape_prison` and despawns (800). Story uses: `ego_dlc_pirate/md/setup_dlc_pirate.xml` 746, `gs_pirate2.xml` 144, `story_criminal.xml` 16441-16442, 16693; `ego_dlc_split/md/story_split.xml` 11346-11364.
- **NPC state machine:** a prisoner NPC enters `STATE_prisoner`, which only handles `escape_prison` (then despawn) (`V8 md/npc_state_machines.xml` 839-840, 6559-6596).
- **Crew definitions:** vanilla military crews include `<person role="prisoner" weight="1">` beside service 60 and marine 45 (`V8 libraries/people.xml` 31-57, 73-81, 97-105, ...; 49 entries across base + DLCs). SWI adds 65 prisoner entries across its 195 crew definitions (`SWI libraries/people.xml` 13-14, 77-78, ...). Its character groups add prisoner looks per faction, e.g. `imperial.prisoner`, `bountyhunters.prisoner` (`SWI libraries/charactergroups.xml` 82-89, 687-694).
- **SWI game start:** "CIS prisoner" (`SWI libraries/gamestarts.xml` 746) is a start only, with no mechanic behind it.
- **Not used** by boarding, police, bailing or any SWI script.

### Holding a prisoner on a player ship [read unless marked]
- A prisoner is a person template on a ship, like crew. The ship properties are `people.count`, `people.free`, `people.capacity` and `people.{$entityrole}.list` / `.count` (`V8 libraries/scriptproperties.xml` 375-380, on `controllable` 302).
- The player's ship crew menu shows `prisoner` and `passenger` rows next to service and marines. All are counted in "people / crew capacity" (`V8 ui/addons/ego_detailmonitor/menu_map.lua` 14862, 14878-14881). **So prisoners share the ship's crew capacity.** An S fighter with 0-1 crew slots has no room [inferred from capacity].
- `create_npc_template` has `force`: "Force the template to be added even if there is no available space" (`V8 libraries/common.xsd` 25466-25517). `transfer_people` reports people it couldn't move in a `failed` element (22297-22330), so it respects capacity [inferred].
- A template keeps the person's identity: `npctemplateentry` has `seed`, `name`, `race`, `macro`, `role` and skills (`V8 libraries/scriptproperties.xml` 1983-2004). The entity has `npctemplate` (1387) and `seed` (45). The ship has `roleentity.{$seed}` / `roleentity.{$npctemplate}` (317-318).
- Other actions: `set_npc_template_role` changes a template's role on an object, and `set_entity_role` does the same for an instanced actor (`V8 libraries/common.xsd` 34469-34492). `remove_npc_template object template` (25521-25530).

### Delivering a prisoner at a station [read: actions; inferred: the flow]
- Removing the template is a complete hand-in: vanilla passenger transport drops a passenger exactly that way (`remove_npc_template object="$PassengerTemplateContainer" template="$PassengerTemplate"`, `V8 md/rml_transport_passengers_v2.xml` 212-213).
- Or move it to the station with `transfer_people object="$station" otherobject="$playership"`. That `people` is defined on `controllable`, and stations are controllables [inferred]. For a bounty, removing the template plus a logbook line is simpler.
- Trigger: the player's ship docked at the contract station (e.g. `player.occupiedship.dock` / `hascontext`), or a conversation choice with the contact (the SWI hunt already has a debrief at the contact) [inferred].

## 3. Following the target's pilot [read unless marked]
- **Before the bail:** the hunt target is the ship (`$MissionTarget = event.param.$target`, `SWI md/kuertee_emergent_missions.xml` 5272). Its pilot is `$MissionTarget.pilot`, and SWI already writes on the pilot's blackboard (`$MissionTarget.pilot.$kEMissions_missions`, 5273-5275). Store the pilot entity and its `seed` and `name` at accept.
- **At the bail:** `event_object_dropped_objects` (object = the dropping object, param = list of dropped objects, `V8 libraries/common.xsd` 14088-14098). Vanilla uses it to collect a boarded ship's escape pods, `$Drop.isclass.ship and $Drop.type == shiptype.escapepod` (`V8 md/story_diplomacy_intro.xml` 8427-8441). That gives the pods. Whether the original pilot entity becomes the pod's `pilot` (so `$pilot.ship == $pod`) isn't shown in script [inferred; check in game]. `$pilot.exists`, `.ship`, `.sector` and `.isclass.npc` are the checks to use (`V8 libraries/scriptproperties.xml` 10, 34, 37).
- **Window:** the pilot lives until the pod docks at a station or leaves visible attention. Then `destroy_object ... this.ship` runs on the pod (`V8 aiscripts/move.escapepod.xml` 97-127). Whether the pilot is destroyed with the pod or moved to the station isn't in script [inferred: destroyed].
- **After boarding:** the pilot is destroyed by `remove_actor_from_room destroy="true"` (`V8 md/boarding.xml` 2729). To keep it, `swibh` would have to act **before** `Transfer_Ownership`. One way is a cue on `event_boarding_phase_changed` / `Boarding_Successful` that copies the pilot to a prisoner template on the player's ship. Another is a diff on `Transfer_Ownership` that skips the hunt target's pilot [inferred].
- **Cleanest design** [inferred]: skip the ejection for the hunt target's pilot. In a `swibh` diff on SWI's pilot bail (`SWI md/notifications.xml` 198-241, just before `eject_npcs`), when the target is a live alive-bounty, run `create_npc_template entity="$target.pilot" object="$target" role="entityrole.prisoner"`. Then `transfer_people` to the player's ship, or keep it on the bailed ship until the player claims it. Then dismiss or destroy the pilot actor. That is move.claim's own recipe (section 2b), and it keeps the seed, so MD can always find the prisoner by `seed` on the player's ships.

## 4. Reusable alive/dead or "bring back" pieces [read]
- **SWI hunt:** `Mission_Hunt_TargetManager_Destroyed` fires on `event_object_destroyed` **or** `event_object_abandoned` of the target ship (`SWI md/kuertee_emergent_missions.xml` 6275-6282). Both lead to the same `destroy_success` and the debrief (6295-6309). There's **no alive/dead split**. A boarded target changes owner without being destroyed. Whether `event_object_abandoned` fires then isn't clear (the xsd says "abandoned by its NPCs", `V8 libraries/common.xsd` 13038-13042). A boarded hunt target may not end the hunt [inferred; check].
- **SWI "kept alive"** in EM is the escort and sector-raid reward for keeping the escorted ship alive (`SWI md/kuertee_emergent_missions.xml` 2533, 3014-3020, 4398-4409). It has nothing to do with prisoners.
- **SWI kuertee station rescue** (`SWI md/kuertee_emergent_missions_rescue.xml`) creates cue actors at an attacked station. It sets them to `entityrole.passenger` (1176-1183) and caps the run at `people.capacity * 1.5 - people.count` (1004). It walks them aboard the player's ship and off at a disembark station, and it has a debug fix for "lost" passengers (2664-2737). It's the closest SWI example of carrying people and handing them over.
- **Vanilla `RML_Transport_Passengers_V2`** (library `TransportPassengers_V2`, `V8 md/rml_transport_passengers_v2.xml` 34-60). It carries an NPC component to `Destination` and succeeds when `$Passenger.hascontext.{$Destination}` (432-441). It fails if the destination is destroyed, turns hostile or has no dock (449-506). Callers are `gmc_assisted_task.xml` 991, `gmc_improve_station_defences.xml` 733 and `gmc_retrieve_dead_drop.xml` 807. It needs an instanced NPC that walks off. A prisoner template would need instancing first [inferred], so removing the template is simpler.
- **Vanilla `RML_Capture`** (library `Capture`, `V8 md/rml_capture.xml` 39-60). Feedback 1 = captured, -1 = destroyed (4-16). Success comes from `event_object_changed_true_owner` to `faction.player` (210-229). Nothing in V8 or SWI calls it (grep), but SWI patches it with a Professions BountyHunter event (`SWI md/rml_capture.xml`). Its success check is a ready-made "ship taken" check, not a "pilot taken alive" one.
- **Vanilla `gm_prisonbreak`**: a prisoner in a station cell; the player hacks the door (`V8 md/gm_prisonbreak.xml` 608-620, 715, 800). It's the only vanilla mission with a prisoner the player deals with, and it frees one rather than delivering one.

## 5. Police and arrests in 8.00 [read]
- `masstraffic.police` scans ships for illegal cargo: `$target.pilot.inventory.illegalto` or `$target.cargo.illegalto` with `chance="100 - $target.hidecargochance"` (`V8 aiscripts/masstraffic.police.xml` 14, 317-325). On a find it applies a relation boost, `relationchangereason.illegalcargo` and kill relation, then runs `order.fight.attack.object` (336-378).
- When scanned, the NPC only speaks lines like "Err... I have a permit for that" (`V8 aiscripts/interrupt.scanned.xml` 30-50).
- A player with a police licence gets the comm choice "Eject your illegal cargo!" (`g_player_policedrop`) (`V8 md/conversations.xml` 107, 133-134). The player's own illegal cargo triggers warnings (`V8 md/notifications.xml` 1006-1021).
- Surrender (`g_surrender`) is a forced bail: it signals the bail cue at 100% (`V8 md/conversations.xml` 24, 118-124, 659; `V8 md/notifications.xml` 1286-1287, 1317). SWI drops the S/M limit and uses hull < 50% (`SWI md/conversations.xml` 6-9). The pilot still leaves in a pod.
- grep `arrest|jail|detain` in V8 md and aiscripts: no mechanic. The only hits are `gm_prisonbreak` and `gmc_dynamic.xml` 27, 41 ("prison keycard ... prisoner/escape mission").
- **So there's no arrest: police kill or chase. Nobody is taken prisoner.**

## What to check in game
- After an SWI bail, is the pod's `pilot` the same entity (same `seed`) as the target's old pilot?
- When a pod docks or leaves sight, is that pilot destroyed or placed on the station?
- Does `event_object_abandoned` fire on a hunt target the player boards, and does the SWI hunt then pay?
- `create_npc_template` from the live pilot plus `transfer_people` to the player's ship at a distance: does it work, and is there a pod delay (`podarrivaltime`)? Does the crew menu show the prisoner?
- Do NPC military ships really carry prisoners (crew info on a scanned ship), and what happens to them on a bail?
