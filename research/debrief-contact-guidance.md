# Debrief contact with no guidance (ICG hunt, DHC-011)

Situation, 2026-11-03: hunt "Search and destroy: BH Amanaman YT-1300M (DHC-011)", offered by ICG and accepted at the Bounty Hunters Guild HQ in Milagro. The target is dead. The open objective is "Talk to: <contact>", and there is no waypoint and no sector.

Source: SWI 0.90 `ext/md/kuertee_emergent_missions.xml` (EM below), vanilla 8.00 `base/ui`. This builds on [missing-accepted-hunt.md](missing-accepted-hunt.md) and [hunt-pay-ael-112.md](hunt-pay-ael-112.md).

## What to do now, in order

1. **Make the hunt the active mission.** In the Mission Manager, select the hunt and set it as active (guided). X4 only shows guidance for the active mission. If a waypoint appears, fly there and talk to the contact.
2. **Do not abort.** The debrief step has no timer (see Evidence), so the mission waits forever. Aborting pays nothing.
3. **Save, then load that save.** On load, `Mission_Hunt_CheckMissionContact` checks the contact. If the contact is gone or has no room, it spawns them again. A contact that was only moved out of their room keeps the same NPC, so the objective should point at them again.
4. **Look for the contact by hand.** They are not at the Guild HQ in Milagro. They are on the **ICG station that last sighted the target**, normally close to where it was found (the same pattern as the IMP hunt debriefed right next to the kill sector). If that station is gone, look at the nearest ICG defence station with an L dock. On the map, mission NPCs show the "Person of Interest" icon. Dock and look for a new office-type room: Security Office, Control Room, Situation Room, Weapons Control, Communications Centre, Command Centre, Operations Room or War Room.
5. **Try comms (unverified).** Select the contact on the map and press "Comm" in the info panel. The debrief cue listens for any conversation with the contact, so the "talk to" option may show up over comms too.

## Cause

**Confirmed:** the contact NPC existed when you killed the target. The debrief objective is set only inside `if $MissionContact_NPC.exists`, so the "Talk to" line would not show without them. The objective points at the NPC itself, not at a station.

**Likely:** one of the following. The code can't tell which one without a save or a debug log.
- **The hunt is not the active mission.** This is the cheapest thing to check.
- **The contact was taken out of their room and not given a new one.** `ActorAndRoomManager_CleanUp` removes the NPC from the room when any of these happen while you are not on that station:
  - the station is destroyed;
  - the station is attacked below 50% hull, or it is attacked while it refuses you docking, during the brief or debrief step;
  - you take control of a ship with a different dock size and the station won't dock it.

  It then tries to put the NPC on the ICG defence station with an L dock that is nearest to you. If there is none, it tries 3 times and then gives up. The NPC then still exists but has no room and no station, which fits guidance with "not even a sector".
- **The station is unknown to you.** This one is unverified. The offering station can be any ICG station that saw the target, so it may be one you have never found.

## Evidence

- **The contact's station is the offering station, which is not the Guild HQ.** At a guild, the offer's `$station` is `$pilot_target.$kEM_lastKnownLocation.{$faction}.{1}.$station` (EM 12112-12114, also 11894-11895). That is the station recorded when that faction last saw the target (11355-11364). `Mission_Hunt` stores it as `$MissionOffer_Station` and `$Ship` (5259-5261). `Mission_Hunt_MissionContact_Generate` passes it to `MissionNPC` as `Ship` (6403).
- **`MissionNPC` (9742-9810).** SWI forces the dock size to L (9753-9761). In both branches the container ends up as the offering station: 9779-9781 if it has no L dock, 9807-9808 if it does. Only if that station no longer exists does it search for an ICG defence station with an L dock nearest the target sector (9782-9790). After that it tries any station that isn't hostile (9792-9796), and failing that it gives up (9797-9802).
- **Room creation.** `CreateRoomAndAddActor` (10147-10230) creates a dynamic office on the station, with a random name from the list in step 4 (10188).
- **SWI skips the opening "talk to".** `Mission_Hunt_MissionContact_OnCreate` goes straight to the find step under SWI (6341-6348). That is why objective 1 was already done on accept.
- **The objective targets the actor.** The briefing has `objective.talkto object="$MissionContact_NPC"` for both steps (5605 and 5609). `Mission_Hunt_ObjectiveDebrief` (5913-5930) sets step 5 only if `$MissionContact_NPC.exists`. If not, it asks `Mission_Hunt_CheckMissionContact` to spawn the contact.
- **The kill leads to the debrief.** A kill by the player at step 2 or later signals `Mission_Hunt_ObjectiveDebrief` (6301-6304).
- **Moving the contact.** `ActorAndRoomManager_CleanUp` triggers are at EM 10068-10102, and `remove_actor_from_room` is at 10110. `MissionNPC_OnCleanUp` looks for a new station nearest to `player.entity` (9873-9880). If it finds none, it fails (9886-9893) and goes to `Mission_Hunt_MissionContact_TryAgain` (6366-6391, at most 3 tries).
- **The contact check on load.** `Mission_Hunt_CheckMissionContact` (6496-6530) runs on `event_game_loaded`. It respawns the contact if the NPC doesn't exist or has no room (6508-6527).
- **No timeout during the debrief.** `Mission_Hunt_ObjectiveDebrief` calls `Mission_Hunt_StopHunting`, which resets `Mission_Hunt_TimeoutStart` (5966-5980). The timeout (6311-6324) is the only automatic fail.
- **Abort pays nothing.** An abort sets `$Result_aborted` and only cleans up (5631-5662).
- **Comms.** The debrief cue `Mission_Hunt_Convo_v2` fires on `event_conversation_started actor="$MissionContact_NPC"` (6420-6427), with no in-person check. Picking the option at step 5 signals `Mission_Hunt_ObjectiveComplete`, then `Resolve`, which pays (6461-6462, 5932-5942). The vanilla map has a "Comm" button for a selected actor (`base/ui/addons/ego_detailmonitor/menu_map.lua` 25088-25098). The "Person of Interest" icon is `npc_missionactor` (menu_map.lua 1625).
- **Debug chat commands.** EM has a chat command, `debug em move actor`, that forces the move (10092-10097, needs `hasguidance`). Another, `debug em hunt cues`, logs the contact and station (5419-5437). Both listen on the `Chat_Window_API` UI screen, which comes from kuertee's UI mod. It is not in vanilla 8.00, and SWI's UI files are not unpacked here, so these may not work.

## Unverified

- Whether X4 shows guidance to an actor on a station you haven't discovered.
- Whether remote comms to an EM contact work and show the debrief option. Vanilla warns that far NPCs can despawn during comms (menu_map.lua 25091), but EM sets `$Stay`.
- **A respawn after the NPC was destroyed may not bring the guidance back.** It creates a new NPC, but the briefing still points at the old one. `Mission_Hunt_ObjectiveDebrief` won't run again at step 5 (5916). Also, `Mission_Hunt_MissionContact_OnCreate` resets itself when the mission already exists (6351-6353), which may skip `Mission_Hunt_MissionContact_OnCreate2`. That would mean no `Mission_Hunt_Convo_Start` signal and no callback. Talking to the new NPC in person may still work.
- Whether the `debug em ...` chat commands work in this SWI install.
- Which of the three likely causes applies here. A save, or a debug log with `UserSettings.$debugChance_missionHunt` on, would settle it.
