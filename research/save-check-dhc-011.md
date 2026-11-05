# Save check: "Search and destroy: BH Amanaman YT-1300M (DHC-011)"

Save: `save_008.xml.gz`, `<save name="BBH - Test 2">`, game time 9,282.744, X4 8.00 (build 590967) + SWI 0.90, gamestart `x4ep1_sw_bhg`. It was copied to a scratch folder, unpacked and streamed. The save folder was not touched. Line numbers are from the unpacked stream (`zcat | sed -n`). EM = `ext/md/kuertee_emergent_missions.xml` in the unpacked SWI 0.90. Tags: [read] = seen in the save or code, [inferred] = reasoned, not tested.

## Tell the player first

1. **The debrief contact is Mik Kellar, at the ICG Defence Platform FKG-580 in Kubindi.** The station is alive and known to you. **But Mik is not on the station right now.** EM took him out of his room and deleted the room, then failed to place him anywhere else. That's why "Talk to: Mik Kellar" has no waypoint and the autopilot said "Target is invalid".
2. **The kill is recorded.** The mission is at step 5 (debrief). EM counts DHC-011 as destroyed and as your kill. The ship is a wreck in the save. Nothing is paid yet: EM pays and writes the logbook entry only after you talk to Mik.
3. **Fix: save, then load that save.** On load EM checks the contact again. If he has no room, it resets the retry count and places him again at FKG-580. The guidance should come back. [inferred from code, not tested]
4. **Then talk to him right away, by comms if you can.** Mik is flagged `remotecommable`. With ICG at -10 the station probably won't let you dock. Kubindi is a CSA-vs-ICG warzone: a CSA Proclamator was attacking FKG-580 when you saved. While you're at the debrief step and not on the station, any attack on it while it refuses you docking makes EM pull Mik off it again. If he vanishes again, reload again.

## 1. The kill [read]

- Target `[0x4c89f]` (save line 16627124): `yt1300_01_a_macro`, code DHC-011, owner `indibhg`, `state="wreck"`, `knownto="player"`. It's in Kubindi (`swi_clusterkubindi_sector001_macro`, `[0x77fcf]`). `attacker="[0x4d198]" attackmethod="hitbybullet" attacktime="9198.943"`. `[0x4d198]` (line 16621019) is `acclamator2_macro` IMP-312, owner `corporate` (CSA). So the last hit came from a CSA ship, not the player.
- EM's DamageCalculator entry for "$DHC-011" (table 27877, line 23009927): `$isPlayerKilled` = 1, `$damage_total` = 100.027, `$killer` = "CSA Escort C-70M", `$class` ship_m, `$size` 69.89. **EM counts it as a player kill.**
- Hunt cue vars (below): `$Objective_Step_destroy_success` = 1, `$Objective_Step_find_success` = 1, `$Objective_Step_identify_success` = 1, `$isTargetAttackedByPlayer` = 1, `$Objective_Step` = 5.
- **Logbook:** `<log>` (lines 21893243-21893300) has nothing for this hunt and no reputation changes after 6,518.883. The last entries are news up to 9,107.404. No "Unauthorised Kill" (the target is `indibhg`). There's also no ICG reputation entry anywhere in the log. `tools/playtest-log.ts --since 8200` finds no hunt or relation events.
- Messages (line 21893400): 9,233.433 "Autopilot engaged. Command: Fly to Mik Kellar", then at 9,233.489 "Target is invalid. Deactivating autopilot."
- Player: `fortitude_macro` VVB-886 (line 5316682), now in Eadu (`swi_clustereadu_sector001_macro`, ICG-owned). It was last hit by the same IMP-312 at 9,193.601.

## 2. The hunt mission [read]

**Mission entry** (`<missions>`, line 24241630): id 808573, `active="1"`, time 8,241.981, faction `commerceguild`, group `bountyHunters_guild`, type fight, level medium, "Reward: 99,135.00 Cr + up to 206,730.00 Cr". The description says 107,145 + about 249,540 Cr: the reward was re-rolled on entering Destroy, as with KNW-904 and AEL-112.

| Step | Type | Text | Targets |
|---|---|---|---|
| 1 | talkto | Mik Kellar | none |
| 2 | find | BH Amanaman YT-1300M | `[0x77fcf]` (Kubindi sector) + offset |
| 3 | scan | BH Amanaman YT-1300M | `[0x4c89f]` |
| 4 | destroy | BH Amanaman YT-1300M | `[0x4c89f]` |
| 5 | talkto | Mik Kellar | **none**, `active="1"` |

The objective is `objective.talkto object="$MissionContact_NPC"` (EM 5605, 5609). The empty `<targets/>` means the game finds no location for the actor.

**Hunt cue instance `808573`** (`kuertee_emergent_missions` script id 342, line 24235108, state complete at 7,695.452). `$kEMissionType` 106, `$Faction` commerceguild, `$MissionTarget` `[0x4c89f]`, `$TargetSector` `[0x77fcf]` (Kubindi), `$Objective_Step` 5 (= `$Objective_Step_debrief`), `$Result` null, `$RewardCr` 1 (placeholder, not computed yet), `$PlayerDamageAndKillsData` null, `$timer_find_end` 19,957.2.

- `$MissionContact_NPC` = `[0x1aa352]` (Mik Kellar)
- `$MissionContact_Container` = `$MissionOffer_Station` = `$Ship` = `[0x78426]` (FKG-580). The offer was made in the Guild HQ conversation, but EM uses an ICG station as the offer station (Bounties `$station` = `[0x78426]` too, `$isMissionsFromConvo` = 1).
- `$MissionContact_Interior` = `[0x1abeb5]`. **This id appears nowhere else in the save, so the interior has been destroyed.**
- `$MissionContact_Tries` = **3**, which is the give-up value (EM `Mission_Hunt_MissionContact_TryAgain`: retries only while `Tries lt 3`).
- `$Client` = `[0x7842b]` Ban Mellerd, an ICG NPC on FKG-580 (line 16656802).

**Contact sub-cues:**
- `Mission_Hunt_MissionContact_Generate` instance 808596 and its `MissionNPC` child 817391 (line 24235229) are both complete at 8,251.557. The MissionNPC vars: `$Actor` `[0x1aa352]`, `$Interior` `[0x1abeb5]`, **`$Container` null**, `$container_possible` null, `$dockSize` dock_l, `$nearestTo` `[0x77fcf]`, **`$eventName` = event_object_attacked**.
- MissionNPC children 817392-817394 are waiting. **`MissionNPC_ActorAndRoom_New` has no live instance**, so no ActorAndRoomManager is looking after Mik.
- `Mission_Hunt_MissionContact_TryAgain` (808595) is waiting. `Mission_Hunt_CheckMissionContact` (808598) is waiting.

## 3. The contact NPC and station [read]

- **Mik Kellar** `[0x1aa352]`, code RZJ-403, owner commerceguild, `character_argon_male_cau_crew_02_macro`, `traits flags="mission|remotecommable" role="service"`, blackboard `$is_kEMissionsCreation` = 1 (line 24229389).
- **He's stored only in the EM script's `<actors>` block** (lines 24229243-24229409), with no `connection` attribute and no parent. Only the two cue vars refer to him (lines 24235124, 24235239). **He's in no room and no station.** (A different Mik Kellar, UJP-232 `[0x1835d]`, owner hapes, is crew on a Hapes factory in Roqoo. He has nothing to do with this.)
- None of the 41 actors in the md `<actors>` blocks appear in the universe tree. Placed NPCs there have `connection="parentconnection"`.
- **Station FKG-580** `[0x78426]` (line 16656210): `station_gen_factory_base_01_macro`, basename `{20102,1041}` = **"Defence Platform"**, owner commerceguild (ICG), `knownto="player" known="1"`. It's alive (not a wreck) and has a pier and XL/venator dock areas, so it has L docks. Its sector is `swi_clusterkubindi_sector001_macro` = **Kubindi** (SWI text 909701), code SVF-454, owner corporate, `contested="1"`, `knownto="player"`. That's the same sector as the find objective.
- **It's under attack:** `attacker="[0x86d64]" attackmethod="lowattentionattack" attacktime="9280.201"`. `[0x86d64]` is `proclamator_macro` GXN-537, owner corporate (CSA), 2.5 s before the save.
- FKG-580 still holds an older EM dynamic interior: corridor `[0x1a99cf]` and server room `[0x1a99d0]` (line 16661043). The ids are next to EM actor Neol Felden `[0x1a99cd]`, probably an earlier contact. That room is empty now.

## 4. Relation with ICG [read]

- Save, ICG faction (line 782): `<relation faction="player" relation="-0.01"/>`, with **no player boosters** in the ICG block (lines 782-817). The player faction (line 1131) has `commerceguild -0.01`. **-0.01 is UI -10.**
- That's the **starting value, unchanged.** SWI `ext/libraries/gamestarts.xml`, gamestart `x4ep1_sw_bhg`: `<relation faction="commerceguild" otherfaction="player" relation="-0.01" />` (around line 1143, the 89th line of the gamestart block). The faction default in `factions.xml` is -0.01 too (line 797). No logged event changed it.
- **Docking [inferred]:** vanilla `scriptproperties.xml` 1777 says the lower bound of `neutral` and `dock` is NOT included in the range. Neutral starts just above -0.01, so `dock` most likely also needs a relation above -0.01. **At exactly -0.01 the player is probably outside `dock`, in `enemy`.** So ICG stations would refuse docking and `dockingallowed.{player.ship}` is false. This fits the player's report and the cleanup below. The engine's range table isn't in the game files, so this isn't confirmed.

**Relation conditions in EM's contact code [read]:**
- `MissionNPC` (EM 9742-9810). If the offer station `$Ship` is a station and has the dock size (SWI forces dock_l, EM 9752-9761), `$Container` = that station with **no relation check** (the do_else at about 9809, `$Container = $Cue_Mission.$Ship`). The relation check is used only when the lead ship is under heavy attack or lacks the dock. Then `find_station` uses owner = mission faction, `defencestation`, dock size, and `match_relation_to faction.player relation="dock" ge` (9787-9793). The fallback is any station ≥ neutral to `$Ship.owner` (9795-9797).
- **`ActorAndRoomManager_CleanUp` (EM 10038-10101) is the relation trap.** It fires on `event_object_attacked object="$Container"` when (hull < 50% **or** `not $Container.dockingallowed.{player.ship}`). The step must be brief or debrief, and the player must not be inside the station (`not player.entity.hascontext.{$Container}`). Then it runs `remove_actor_from_room`, `remove_dynamic_interior` + `destroy_object` on the interior (10110-10126), and signals `MissionNPC_OnCleanUp`. The same branch also fires on a ship change when docking isn't allowed.
- **`MissionNPC_OnCleanUp` (EM 9834-9900)** looks for a new spot only with `find_station owner=$Cue_Mission.$Faction defencestation=true` + dock_l + `match_relation_to faction.player relation="dock" comparison="ge"`, sorted by distance to the player. If the player is in ICG's `enemy` range, no ICG station matches. `$Container` = null (as in the save), `$isFail`, and then `Cue_OnFail` = `Mission_Hunt_MissionContact_TryAgain`. At `Tries` 3 it gives up silently, and the actor stays out of every room.
- The objective text stays "Talk to: Mik Kellar", but with no room the game has no guidance target.

## 5. What most likely happened [inferred]

1. At 8,241.981 the contact was placed in a new room on FKG-580 and the mission was created. Step 1 was skipped, as usual in SWI.
2. At about 9,198.9 the target died and the mission went to step 5 (debrief).
3. Between then and 9,233.4, CSA ships attacked FKG-580 while the station refused the player docking (ICG -10) and the player was not aboard. `ActorAndRoomManager_CleanUp` removed Mik and destroyed interior `[0x1abeb5]`. Re-placing him needed an ICG defence station that would let the player dock, and there wasn't one. `$MissionContact_Tries` reached 3 and EM stopped trying. The autopilot's "Target is invalid" at 9,233.489 fits: by then Mik had no location.
4. `Generate` last ran at 8,251.557, with `Tries` already at 2 from earlier failed spawn tries. So the failure after the kill went straight to 3 without another `Generate`. That's why that cue's time is still 8,251.557.

**Why a reload should help [inferred]:** `Mission_Hunt_CheckMissionContact` (EM about 6416-6450) runs on `event_game_loaded`. If `$MissionContact_NPC` has no room, it sets `$MissionContact_OnCreateCallback` = `Mission_Hunt_ObjectiveDebrief` and `$MissionContact_Tries` = 0, then signals TryAgain. That runs `Generate`, then `MissionNPC` with `Ship` = FKG-580. FKG-580 is an operational station with L docks, and `$attacker_largest` (the target) is a wreck. So `$Container` = FKG-580 with no relation check, a new room is made and Mik is added. If FKG-580 is still in a fight, the next attack pulls him off again unless the player is inside the station.

## Unverified

- The exact dock threshold. That `-0.01` is outside the `dock` range is inferred from the "min not included" note, not from an engine table. Also unchecked: whether FKG-580 actually refuses the player's Fortitude.
- When the cleanup ran. `$eventName` = event_object_attacked has no timestamp. The "Target is invalid" message at 9,233.489 suggests before then. The station's `attacktime` 9,280.201 is only its latest attack.
- That a reload respawns Mik and brings the guidance back. Read from code, not tested in game. Also whether the room creation (`CreateRoomAndAddActor`) works on a station that refuses docking.
- Whether the player can comm Mik remotely (he's `remotecommable`) without docking. If EM's debrief conversation needs the player in the room, docking at -10 ICG will be a blocker. A fix may be needed (for example, raise ICG relation above -0.01, or debrief by comms).
- How the earlier `Tries` (0 → 2) were used before 8,251.557. There's no debug log for this save.
- Whether CSA IMP-312 being the last hitter matters for the payout. EM's `$isPlayerKilled` = 1 says it counts as the player's kill. The payout amount isn't computed until debrief.
