# Leads on SWI's hunt: what find and identify need (2026-11-05)

Answers [#54](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/54) for the lead chain in [#39](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/39) (the hunt loop). The question: what makes the wrapped Emergent Missions hunt's **find** and **identify** steps succeed, whether they break when the player reaches the target by a lead rather than by SWI's own last-known marker, how SWI's guidance points at the stale position and how `swibh` can override it, and whether `swibh` can follow the target's moves to build leads.

Sources:
- EM = SWI 0.91 HF1 `ext02/md/kuertee_emergent_missions.xml` (`/mnt/e/x4-dev/reference/mods/swi-0.91hf1`). All EM line numbers below are 0.91 HF1 (0.90 notes are about 5 lines lower).
- EMO = SWI 0.91 HF1 `ext02/aiscripts/orders.base.xml` (EM's diff on the vanilla order wrapper).
- CX = vanilla 8.00 `base/libraries/common.xsd`; vanilla `base/aiscripts/orders.base.xml` (`/mnt/e/x4-dev/reference/x4-8.00`).

Builds on, doesn't repeat: [em-scan-and-wing-damage.md](em-scan-and-wing-damage.md) (scan step, unscanned kill fails, silent ends), [hunt-logging-hooks.md](hunt-logging-hooks.md) (hook points, field table), [debrief-contact-guidance.md](debrief-contact-guidance.md) (contact NPC), [wing-split-facts.md](wing-split-facts.md).

Tags: [read] = seen in the files; [inferred] = reasoned, not tested in game.

## Short answer

1. **Find is proximity, not position.** It succeeds when the target comes near the player (its attention rises to `inzone` or nearer), when a long-range scan pings it, or when a player ship's radar finds it as an enemy. Nothing checks the last-known position or the beacons [read]. So a lead that brings the player to the target by another route satisfies find on its own.
2. **Identify is a finished scan of the target**, only for disguised targets (cover owner differs from true owner), and only while the step is identify [read]. EM sets no range; the game's scan rules apply [inferred].
3. **Neither step blocks a lead route**, with three traps: the **3 h find timer** (a lead chain slower than that silently ends the hunt unless the target is found in between; each find resets it to +3 h); a target **already in the player's zone** when find starts gives no attention change, so find waits for an LRS ping or an enemy contact; a scan finished **before** identify starts counts for nothing [read; the zone case inferred].
4. **Guidance points at a group of up to three nav beacons** that EM spawns at the newest last-known positions (from the offering faction's and the player's sighting records, plus `$LastKnown_Update`) [read]. They refresh only when the offering faction reports a new sighting. The cleanest override is EM's own update path: write a lead into `$Cue_Mission.$LastKnown_Update` and signal `Mission_Hunt_UpdateMissionDescription`. EM then rebuilds the beacons with the lead first and shows "Update: New position in <sector> <time> ago." No diff needed [read for the path; that it works from another script is inferred].
5. **Yes, swibh can follow the target.** MD can listen to `event_object_changed_sector` and `event_object_entered_gate` (entry and exit gate) on `$MissionTarget`, and EM already rebroadcasts every NPC ship's sector change as `kEM_ObjectChangeSector` on `player.galaxy` [read]. The target's live `sector`/`position` is readable from MD at any time [inferred].

## 1. Steps and how each succeeds

Steps: brief 1, find 2, identify 3, destroy 4, debrief 5, complete 6 (em-scan-and-wing-damage §1). In SWI mode the contact's OnCreate skips the brief and signals `Mission_Hunt_ObjectiveFind` straight after `Mission_Hunt_CreateMission` (EM 6344-6350) [read].

### Find [read]

`Mission_Hunt_ObjectiveFind` (EM 5852-5876) signals `StartHunting`, sets step 2 and `set_objective ... action="objective.find" group="$beacons_lastKnown" endtime="$timer_find_end"` (5868). `StartHunting` (5949-5970) sets `$timer_find_end = player.age + 3h` if it isn't set (5954-5956; it starts at 0, 5365), and signals `Mission_Hunt_Beacons` and `Mission_Hunt_TimeoutStart`.

Success is `Mission_Hunt_TargetFound_20220119` (EM 6086-6139), a sub-cue of the condition-less `Mission_Hunt_TargetManager` (6084), so it is live for the whole hunt. Conditions, any one of:

| Trigger | EM | Notes |
|---|---|---|
| `event_long_range_scan_ping object="$MissionTarget"` | 6091 | Any LRS ping on the target. The event has no scanner param (CX 12712-12716), so "the player's LRS" is inferred |
| `event_object_changed_attention object="$MissionTarget"`, new level in `$attentionInZoneAndNearer`, old level not | 6092-6097 | List = `inzone, nearby, adjacentroom, inroom` (EM 236). Attention is the engine's measure of how close an object is to the player (CX enum 3390-3402: ... `insector`, `adjacentzone`, `visible`, `inzone`, ...). So: the target enters the player's zone |
| `event_object_enemy_found group="global.$PlayerShipsGroup"` with `event.param == $MissionTarget` | 6098-6102 | Any player-owned ship's radar finding the target **as an enemy** (CX 14112-14116). A target that isn't hostile to the player (e.g. disguised under a friendly cover owner) won't fire this one [inferred] |

Plus: step is find **or destroy**, and `$Cue_Mission.hasmission` (6104-6108).

Actions (6110-6138): `find_success = true`; RAP "target found" event while step < destroy; **`$timer_find_end = player.age + 3h`** (6129); recompute `$IsDisguised`; disguised → `ObjectiveIdentify`, else → `ObjectiveDestroy`.

**No position check anywhere.** Being at a beacon matters only for `Mission_Hunt_LongRangeScan` (6199-6222): an LRS sent by a player ship while any beacon is in `player.sector` gives RAP's "location investigated" activity (XP), nothing more.

### Identify [read]

Only for disguised targets. `Mission_Hunt_ObjectiveIdentify` (5877-5893) sets step 3, `identify_success = false`, objective `objective.scan` on `$MissionTarget` (briefing 5612). `Mission_Hunt_TargetManager_Scanned` (6140-6198) needs `event_scan_finished scanned="$MissionTarget"` while step == identify (6142-6144). No `scanner` attribute, so any scanner may count (CX 16458-16461 allows `scanned` alone; whether an NPC's scan counts is untested). It removes the cover owner (6158) and signals `ObjectiveDestroy`, the only place `identify_success = true` is set (5908). EM checks no range or position.

### Destroy and debrief

See em-scan-and-wing-damage §1-3. `Mission_Hunt_TargetManager_Destroyed` (6275-6314): no player-owned hit yet → silent end (6298-6301); otherwise → debrief, whatever the step. At Resolve, any of the three success flags false → fail, 0 Cr.

## 2. Reaching the target by another route

| Situation | What happens | Tag |
|---|---|---|
| Player arrives near the target far from every beacon | Attention rises to `inzone` → find succeeds, timer reset, next step | read |
| Player's LRS pings the target (a lead put them in the right sector) | Find succeeds | read |
| Target already in the player's zone when find starts (e.g. accepted while next to it) | No attention *change*, so that trigger doesn't fire. Needs an LRS ping, an enemy-found, or leaving the zone and coming back | inferred (event fires on change, CX 13050-13054) |
| Player scans the target during find (before it is "found") | Scan ignored (step check 6144); must scan again in identify. In practice find fires first, since a scan needs proximity | read; ordering inferred |
| Player hits the target during find | `$isTargetAttackedByPlayer` is set whatever the step (6249-6273). A kill then goes to debrief; fail if find or identify never succeeded (texts 575/576) | read |
| Lead chain longer than 3 h game time without the target being found | `Mission_Hunt_Timeout` (6324-6331, `checktime="$timer_find_end"`) → silent end. Also checked on load (patch 11, 5405-5413). The objective shows `endtime="$timer_find_end"` (5868), so the player sees the clock | read |
| Target found once, then lost again | Step is already identify/destroy; find doesn't come back. The timer only runs in find (`StopHunting` resets `TimeoutStart`, 5971-5986), so no time pressure after the first find | read |

**Design consequences** [inferred]:
- The lead chain should end with the player in the target's zone, or in its sector with an LRS. No need to touch EM's find.
- A long chain needs leads that cost less than 3 h in total, or `swibh` pushing the timer: set `$Cue_Mission.$timer_find_end` and restart the timeout (`reset_cue` then `signal_cue` `Mission_Hunt_TimeoutStart`; `StartHunting` won't overwrite a set timer, 5954). Whether `checktime` is re-read after a reset is unverified; the load patch reads the variable directly, so the variable is what counts on load.

## 3. SWI's guidance and how to override it

### How it points [read]

- The briefing's find objective is `object="$LastKnownDatas.$lastKnowns.{1}.$sector" offset="...$position"` (5611), but `ObjectiveFind` replaces it at once with `group="$beacons_lastKnown"` (5868).
- `Mission_Hunt_Beacons` (5987-6082) clears the group (5994), calls `Mission_Hunt_GetLast3KnownData`, and creates one player-owned `env_deco_nav_beacon_t1_macro` at each position, named "(Report of <idcode>, <time> ago)" (text 11513/533, 6004-6011), max 3. With `$LastKnown_Update` set, the objective becomes `objective.custom` "Update: New position in %s(sector) %s(time) ago." (text 542, 6024-6026), plus a notification if the hunt isn't guided (6028-6030).
- `Mission_Hunt_GetLast3KnownData` (6822-6903): for `faction.player` then `$Cue_Mission.$Faction` (6830), the first 3 entries of `$MissionTarget.pilot.$kEM_lastKnownLocation.{faction}`, padded from `{1}.$otherPosInArea`; then appends `$Cue_Mission.$LastKnown_Update` (6866-6873); sorts newest first (6874); drops entries within 10 km of the previous kept one (6878-6891); keeps 3.
- **Refresh** only happens when `Mission_Hunt_UpdateMissionDescription` (5744-5804) is signalled: it signals `Beacons_CleanUp` (destroys non-ship group members and resets `Beacons`, 6040-6054), and its 1 s child re-signals `Beacons` if the step is still find (5793-5803). Opening the map also runs it, but that path resets the cue without rebuilding beacons (5785-5787).
- Who signals it: `Mission_Hunt_TargetManager_UpdateLastKnownFromReport` (6224-6248), on the target pilot's `kEM_Bounties_UpdateLastKnown` signal **for `$Faction` only** and step ≤ find; it copies that faction's newest record into `$LastKnown_Update` (6240). And `Mission_Hunt_CompleteUpdateLastKnowns` (6566-6612), from the kEM UI "update from other mission" (6550-6565) or the NPC-reactions rumour `npcr_rumour_emHunt` (6614-6631).
- `Mission_Hunt_Activated` (5808-5834) would rebuild beacons when guidance is enabled, but its conditions include `<check_value value="false" />` (5815): dead.

### Where sightings come from [read]

`Bounties_UpdateLastKnown` (EM 11387-11485) records `$sector`, `$position`, the nearest station of that faction and `player.age`, for one faction. It inserts a new entry only if it's the first or >50 km from the last (11412-11423); otherwise it updates `$otherPosInArea`. Keeps 10 (11437). Then signals the pilot `kEM_Bounties_UpdateLastKnown` with `$faction` (11440). Callers:
- `Bounties_NewAttack` (11516-11553): an attack involving a registered pilot gives the other side's faction a sighting.
- Kills (`Bounties_TargetDestroyed`, from 11555).
- `Bounties_ChangeSector` (11600-11632): on a sector change, factions the pilot **has kills against** get a "satellite" sighting if one of their satellites or stations within 100 km of the ship (new sector) or of the exit gate (old sector) has it within radar range (11634-11733).

So the beacons go stale whenever the target moves without fighting, or moves where its victims have no satellites or stations.

### Override options

| Option | How | Pros | Cons |
|---|---|---|---|
| A. Feed `$LastKnown_Update` | `set_value name="$Cue_Mission.$LastKnown_Update" exact="table[$sector=…, $position=…, $time=…, $otherPosInArea=[]]"`, then signal the instance's `Mission_Hunt_UpdateMissionDescription` | EM's own path: beacons, "Update: new position" text and description agree; no diff | EM overwrites it at the faction's next report (6240). `$position` must be a position datatype (11396). Only rebuilds in the find step. Addressing the sub-cue **instance** from swibh is unverified (a static `md.kuertee_emergent_missions.…` path won't reach the instance; may need a one-line diff that stores `this` on `$Cue_Mission`) |
| B. Write the faction's sighting record | Insert into `$MissionTarget.pilot.$kEM_lastKnownLocation.{$Faction}` at `{1}` and `signal_objects object="$pilot" param="'kEM_Bounties_UpdateLastKnown'" param2="table[$faction=$Faction]"` (the signal is a pilot event, so no cue path is needed) | Fully native, survives, and needs no instance path | Changes shared bounty-board data (offers, "sighted at" station, convo). EM's own `Bounties_UpdateLastKnown` records the **live** position, not a lead's chosen spot, so write the entry by hand |
| C. Diff `Mission_Hunt_Beacons` | A swibh `run_actions` after the loop that adds our lead beacon to the group, or replaces the `set_objective` | Full control of what's shown | A diff on EM; `Beacons_CleanUp` destroys any non-ship in the group (6046-6048), so our beacon must be re-added on each rebuild |
| D. `set_objective` from swibh | `set_objective cue="$Cue_Mission" step="$Cue_Mission.$Objective_Step" action="objective.find" object="<our beacon>"` | No diff, immediate | Any EM refresh or step change overwrites it [inferred] |
| E. Add the target itself to the group | EM does it only in debug mode (6035-6037) | — | Direct guidance to the live ship ends the hunt as a hunt |

Recommendation [inferred]: **B** is the only no-diff route that avoids the instance-path question (the pilot signal reaches every hunt on that target); **A** if a stored cue reference is available. **C** only if playtests show EM's reports overwrite leads too often. Keep a lead's `$time` honest (the time of the sighting it stands for), since EM sorts by it.

## 4. Following the target's moves

| Source | What it gives | Tag |
|---|---|---|
| `event_object_changed_sector object="$MissionTarget"` in swibh MD | new and previous sector (`null` in a superhighway, CX 13131-13136). EM uses the same event on groups from MD (EM 789, 1634) | read |
| `event_object_entered_gate object="$MissionTarget"` | entry gate and exit gate (CX 14183-14194): a ready-made "jump record" (gate A in sector X → gate B in sector Y) | read (event); that it fires for NPCs far from the player: inferred |
| EM's rebroadcast: `event_object_signalled object="player.galaxy" param="'kEM_ObjectChangeSector'"` with `event.param2.$attacker == $MissionTarget` | `$sector_new`, `$sector_old`. EMO adds this handler to vanilla `orders.base`, the wrapper every ordered NPC ship runs (EMO 7-18; vanilla `orders.base.xml` 5) | read |
| `$MissionTarget.sector`, `.position`, `.zone` at any time | live truth for the end of a lead chain | inferred (EM reads `$Pilot.ship.sector` freely, 11411, 11459) |
| EM's sighting records `$MissionTarget.pilot.$kEM_lastKnownLocation.{faction}` | per-faction sightings with station, time, `$isFromSatellite` | read |
| Witness test | reuse the idea of `Bounties_ChangeSector_FindFactionWitnesses2` (satellite or station within 100 km and `maxradarrange`, 11701-11733) to decide whether a move left a lead, and for whom, including the player's satellites (EM counts them only if the target has killed player assets) | read (EM), inferred (reuse) |

Superhighway transit gives a `null` sector between two events (CX 13131-13134), so a jump record should pair the last non-null old sector with the next non-null new one [inferred]. SWI's own hyperspace travel was not looked at: if it moves ships without gates, only the sector-change event would see it [inferred].

## Unverified

- The distance at which `inzone` attention is reached (engine zone size), and that LRS pings come only from player ships.
- That a target already in zone at find start stays unfound until an LRS or enemy contact.
- That `event_object_entered_gate` and `event_object_changed_sector` fire for low-attention ships far from the player (EM's design assumes the latter).
- How swibh addresses a hunt instance's sub-cue (option A), and whether a reset `Mission_Hunt_Timeout` re-reads `$timer_find_end`.
- Whether an NPC's scan satisfies identify.
