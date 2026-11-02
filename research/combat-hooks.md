# Combat hooks: engagement start/end for the player's ship (2026-11-02)

Facts for new log events `engagement.start` / `engagement.end` (video edit markers). Paths: V = vanilla 8.00 `E:\x4-dev\reference\x4-8.00\base` (`libraries/common.xsd` holds the MD event definitions; `md.xsd` has only 24 `event_` mentions); SWI = `mods/swi-0.90/ext`. Tags: [read] = seen in files; [inferred]; **unverified** = confirm in game.

## 1. Events when the player's ship is hit

| Event | Params (common.xsd docs) | Line | Notes |
|---|---|---|---|
| `event_object_attacked` | object = attacked, param = attacker, param2 = kill method, param3 = attacked component. Filters `attacker`, `method`, `component` | 12944 | Needs `object=`/`group=`. Vanilla listens on the player ship via `group="global.$PlayerOccupiedShipGroup"` (V md/cover.xml 464) or `global.$PlayerShipsGroup` (V md/npc_usecases.xml 2298, 2310). No damage amount. Fires on collisions too: `killmethod` has `collided`, `hitbyareadamage`, `hitbybullet/missile/mine/bomb`, `lowattentionattack` (common.xsd 1275+) [read]. Rate: once per hit, no throttle is documented [inferred, **unverified**] |
| `event_player_ship_hit` | param = attacked object, param2 = attacker, param3 = projectile | common.xsd 15331 | No group needed: "player controlled ship or ship context". Projectiles only: "does not listen for hazardous region damage, boost damage, nor collision damage" (V md/npc_usecases.xml 2285) [read]. Whether missiles count as projectiles: **unverified** |
| `event_player_owned_attacked` | object = attacked, param = attacker, param2 = method, param3 = component | 15280 | Every player-owned object, so too broad unless filtered to `player.occupiedship` |
| `event_object_shield_damaged` / `event_object_hull_damaged` | param = damaged component, param2 = new value, param3 = **damage** | 12973 / 12986 | Only events that carry damage. No attacker. Hull includes children's hulls. Per damage tick, incl. hazards and boost (npc_usecases 2285) [read] |
| `event_player_incoming_missile` | param = target component, param2 = missile, param3 = source | 15637 | Fires before the hit; could start an engagement early |
| `event_object_destroyed` | param = killer, param2 = method | 13814 | Use on `global.$PlayerOccupiedShipGroup` to end an engagement with reason "destroyed" (the extension's `player.loss` may already cover it) |
| `event_attack_started` / `_stopped` | param = attacker, param2 = target | 16523 / 16536 | Fired only by the `start_attack` / `stop_attack` actions (common.xsd 21495, 21520), used by `order.fight.attack.object.xml` 1111 and 4 masstraffic scripts [read]. AI intent, not hits, and most combat AI (e.g. fighter scripts) never calls it. Not reliable for this |
| `event_player_attacked` | doesn't exist (grep common.xsd) [read] | | |

The group: `global.$PlayerOccupiedShipGroup` is created at V md/setup.xml 45 and rebuilt on `event_control_entity_added/removed` (setup.xml 636-650). It holds `player.occupiedship` **only while the player controls something** (comment 646); if the player leaves the pilot seat the group is empty [read]. `global.$PlayerShipsGroup` = `player.ship` plus ships it's docked at (setup.xml 46, 570-625) [read].

## 2. Events when the player attacks something

| Event | Params | Line | Notes |
|---|---|---|---|
| `event_player_attacked_object` | param = attacked object, param2 = kill method, param3 = [attacked component, weapon] | common.xsd 14919 | "from their currently controlled object". The main hook. Used by V md/notifications.xml 1502 (`IllegalActivity.PlayerAttacks`, filters `not event.param3.{1}.iswreck`, not `signalleak` 1505-1506), gm_patrol 932, SWI RAP `kuertee_professions.xml` 4771 [read]. Per hit [inferred, **unverified**]. Turret hits while the player flies: **unverified** |
| `event_object_attacked_object` | object = attacker, param = attacked, param2 = method, param3 = [component, weapon] | 12959 | Same, via group (V md/cover.xml 465 on `$PlayerOccupiedShipGroup`) |
| `event_player_owned_attacked_object` | param = attacker, param2 = attacked | 15293 | All player-owned, too broad |
| `event_player_killed_object` | param = killed, param2 = method | 15650 | Count kills during an engagement |
| `event_object_attacked attacker="player.ship"` | | V md/story_paranid.xml 3892 | Pattern for "this specific object hit by the player" (e.g. the hunt target; EM's own `TargetManager_Attacked`, SWI md/kuertee_emergent_missions.xml 6247) |
| `event_player_activated_weapon`, `event_player_launched_missile`, `event_weapon_fired` | | 15502, 15663, 16697 | Trigger pulls, not hits. Skip |

## 3. "Player in combat" state in vanilla

- **No `isincombat` / `isunderattack` / `threats` script property** exists (grep `scriptproperties.xml`) [read]. `attackers` (1551) is boarding only; `alertlevel` (2721, 2951) is the upkeep alert.
- **`destructible.lastattacker` / `.lastattacktime`** (scriptproperties.xml 183-184): last attacker component (null if it died) and game time of the last attack, `-1s` if never. Engine-maintained, free to read. Vanilla polls it: `player.age - $Ship.lastattacktime gt $NoAttackTime` (V md/factionlogic.xml 1169) [read]. Inbound only: there's no "last time I attacked" property.
- `defensible.isenemylockingon` (scriptproperties.xml 611): enemy locking/locked on. A cheap pre-combat hint.
- Lua: no combat-state function. `GetLastAttackInfo(id)` → {attacker, time, method} (V ui/addons/ego_interactmenu/menu_interactmenu.lua 45-49, 191) is the same data; the interact menu treats "attacked in the last 120 s" as under attack (5191-5199) [read]. Combat music and the HUD "enemy attack" warning sound are engine-side (only the sound choice is exposed, gameoptions.lua 6714-6722) [read].
- Vanilla's own "quiet for N seconds" rule: masstraffic.flee.xml 26, 35, 49 (set a time on `event_object_attacked`, break after 20 s without it) [read].

## 4. Cost

- `event_object_attacked` / `event_player_attacked_object` fire per hit [inferred]. A capital ship under flak or beams can produce dozens per second. Vanilla already handles `event_player_attacked_object` per hit with heavier work (`change_relation_on_attack` + table bookkeeping, notifications.xml 1502-1530), and EM per-hit on `$MissionTarget` (6247) [read], so a cue with a few `set_value`s is fine. Never `debug_text` per hit.
- Throttle patterns: HeadHunter clears a global flag every 60 s for its alerts (research/headhunter.md, `ProximityThrottle` 845-849); RAP/notifications use "last time" values plus intervals (`$warninginterval` 40 s, `$reportinterval` 2 min, notifications.xml 1494-1495) [read]. Same idea here: per-hit cues only update `$lastHitIn/$lastHitOut`; logging happens only on state changes.
- Shield/hull damaged events also fire for hazard and boost damage; avoid them as triggers.

## 5. Recommendation

One manager cue in the swibh MD with state `$inCombat`, `$start`, `$lastIn`, `$lastOut`, `$opponents` (table: component → [firstSeen, hitsIn, hitsOut]), `$initiator`, `$kills`.

1. **Hit in** (instantiate): `event_object_attacked group="global.$PlayerOccupiedShipGroup"`, check `event.param2 != killmethod.collided and event.param2 != killmethod.hitbyareadamage`, `typeof event.param == datatype.component`, and `not event.param.isplayerowned` (friendly fire, optional). Sets `$lastIn = player.age`, records the opponent. Alternative: `event_player_ship_hit` (already excludes collisions/hazards, no group upkeep).
2. **Hit out** (instantiate): `event_player_attacked_object`, filters as notifications.xml 1505-1506 plus `event.param2 != killmethod.collided`. Sets `$lastOut`, records the opponent.
3. Either, while `not $inCombat` → `engagement.start` now (`t` = first hit), `$initiator = 'player'|'enemy'` by which fired first.
4. **End poll**: `checkinterval="2s"`, `check_value $inCombat`. End when `player.age - max($lastIn, $lastOut, player.occupiedship.lastattacktime) ge 20s` (reason `quiet`, `t` = the last hit, so the marker sits where the action stops, not 20 s later). Also end right away on `event_object_destroyed` of the occupied ship (`destroyed`), occupied-ship change (`shipChange`), and `event_game_loaded` while open (`reload`). 20 s matches masstraffic.flee; tune in playtests (missile-boat fights have long gaps).
5. Fallback for being shot while out of the pilot seat (group empty): the poll can also open an engagement if `player.occupiedship.lastattacktime` (or `player.ship`) is newer than the last check. Latency ≤ 2 s.

Data:
- `engagement.start`: `ship` (Ship: player.occupiedship), `initiator`, `opponent` (Ship/Ref + FactionRef of the first attacker/attacked), `method` (killmethod id), `hunt` key(s) if the opponent is an active hunt's `$MissionTarget` or in its wing (look up `md.kuertee_emergent_missions.Missions_Hunts.$missions_active`, research/hunt-logging-hooks.md §2), `hull`/`shield` %.
- `engagement.end`: `start` time (or duration), `reason`, `opponents` (list, capped ~10, by id/faction with hits in/out), `hitsIn`, `hitsOut`, `kills` (from `event_player_killed_object` while open), hunt target involved / killed, hull/shield % at end.

Unverified in game: per-hit rates; turret hits counting as `event_player_attacked_object`; missiles in `event_player_ship_hit`; whether `lastattacktime` updates on collisions; the 20 s gap.

## The player's wing

Added 2026-11-02. Scope: player-owned ships under the ship the player is flying (any assignment: defence/escort, attack, interception, follow, ...; subordinates of subordinates too). V = vanilla 8.00; SP = `libraries/scriptproperties.xml`; XSD = `libraries/common.xsd`. 9.00 not needed.

### 1. Getting the wing in MD

- `player.occupiedship.allsubordinates`: "List of all subordinates, including those not directly commanded by this" (SP 351). This is the whole tree in one call. `.subordinates` = direct only (SP 339), `.subordinates.{assignment.X}` = direct ones with that assignment (SP 340). Vanilla uses `allsubordinates` the same way (V md/lib_generic.xml 3289, md/factionlogic.xml 1995, md/cinematiccamera.xml 2998 `add_to_group ... list="$LeadAttacker.allsubordinates"`) [read].
- Per ship: `.commander` (SP 333), `.assignment` (SP 335), `.toplevelcommander` ("May be a station or the ship that the player is flying", SP 334), `.subordinategroupid` (SP 343). Assignment values: XSD 3593-3680 (`defence`, `attack`, `interception`, `bombardment`, `positiondefence`, `assist`, `mining`, `trade`, `supplyfleet`, `salvage`, `follow`, ...) [read]. Filter out non-combat ones (`mining`, `trade`, `tradeforbuildstorage`, `salvage`, `supplyfleet`) if the wing should mean fighters only. Whether `allsubordinates` includes docked-in-hangar ships and `.isunit` drones: **unverified** (cover.xml 241-242 checks `event.param.isunit` on subordinate events, so units can show up as subordinates [read]); filter `not $s.isunit`.
- Events to keep a group current:
  - `event_object_subordinate_added` (XSD 14533): object = new commander, param = subordinate, param2 = assignment. Used `object="$Object"` in V md/cover.xml 239, md/rml_assign_subordinate.xml 120, aiscripts/order.fight.tactical.xml 378 [read].
  - `event_object_subordinate_removed` (XSD 14567): object = old commander, param = subordinate (aiscripts/order.fight.tactical.xml 426) [read].
  - `event_object_commander_set` (XSD 13677): object = subordinate, param = new commander, param2 = previous, param3 = new assignment. Can listen on a group (aiscripts/order.fight.escort.xml 280 `group="$fleetcmdrgrp"`, md/story_paranid.xml 17206) [read].
  - `event_object_subordinate_promoted` (XSD 14547): a subordinate replaces the old commander.
  These fire on the *direct* commander only [inferred from docs]. For a sub-subordinate added to a wingman, listen with `group="$Wing"` too, or simply rebuild. Simplest robust approach: rebuild the group (`clear_group` + `add_to_group list="player.occupiedship.allsubordinates"`) on any of these events with `object="player.occupiedship"` or `group="$Wing"`, on occupied-ship change (`event_control_entity_added/removed`, V md/setup.xml 636-650), and on each 2 s poll tick while in combat (cheap, see 4).
- Same sector: `.sector` is a plain property ("Sector context", SP 37). Vanilla compares it in event conditions: `event.param.sector == $Object.sector` (V md/lib_generic.xml 3537-3538, with a guard that `.sector` is null on a superhighway). Cheap [inferred: a context lookup, no search]. `distanceto.{$c}` (SP 73) is also cheap for a radius test (lib_generic 3539).

### 2. Hits on wing ships

- `event_object_attacked group="$Wing"` (XSD 12944): object = attacked wing ship, param = attacker, param2 = killmethod, param3 = attacked component. Filters `attacker=`, `method=` [read]. Same collision/hazard filtering as sections 1 and 5 above (`killmethod.collided`, `hitbyareadamage`). Per hit, no throttle documented [inferred, **unverified**]. `event.object` gives the wing ship for per-ship counts.
- No-upkeep alternative: `event_player_owned_attacked` (XSD 15280), same params, all player-owned objects, filtered with `check_value value="event.object.commander and event.object.toplevelcommander == player.occupiedship"` (+ sector check). Fires for every player asset in the universe (stations, traders), so many wasted condition checks during big fights elsewhere [inferred]. Prefer the group.

### 3. Hits by wing ships

- **There is an attacker-side event: `event_object_attacked_object`** (XSD 12959): object = attacker, param = attacked object, param2 = killmethod, param3 = [attacked component, weapon]. Filters `attacked=`, `method=`. Works on groups: V md/cover.xml 465 (`group="global.$PlayerOccupiedShipGroup"`), md/lib_generic.xml 3536 (`group="global.$PlayerContainerGroup"`), md/khaak_activity.xml 587, md/cinematiccamera.xml 64 [read]. AI scripts use it per wing-like ship too (aiscripts/order.fight.attack.object.xml 296, interrupt.disengage.xml 61) [read]. Per hit [inferred, **unverified**]. Whether turret hits on NPC-piloted ships fire it: **unverified** (likely, since lasertower uses it: order.fight.lasertower.xml 128).
- `event_player_owned_attacked_object` (XSD 15293): param = attacker, param2 = attacked, param3 = method. Note the params differ from the object variant (no `event.object`). Global, so filter `event.param.toplevelcommander == player.occupiedship`.
- Polling fallbacks (not needed but cheap): target's `lastattacker`/`lastattacktime` (SP 183-184); fighter AI stores its target on the pilot blackboard `this.$attacktarget` (aiscripts/fight.attack.object.fighter.xml 48), readable as `$ship.pilot.$attacktarget` [**unverified** access path]; `$ship.order.id == 'Attack'` with `$ship.order.$primarytarget` (V md/cinematiccamera.xml 2027, 2085) [read]. Escorts mostly fight from interrupts while their order stays `Escort` (order.fight.escort.xml 23), so `order.id` alone misses them [inferred]. **No `isinanycombat`/`isincombat` property exists** (grep SP, md, aiscripts) [read].

### 4. Cost and pitfalls

- Two group-event cues on ~10 ships: one condition evaluation per hit per event. A busy 10-ship fighter wing may produce tens to low hundreds of events per second [inferred, **unverified**]. Keep the cue bodies to a few `set_value`s on a table (as in section 4 above). Rebuilding a 10-element group every 2 s is trivial.
- Destroyed members leave groups automatically ("when an object is destroyed ... it is automatically removed from a group", XSD 20475) [read]. Use `add_to_group ... checkoperational="true"` to skip wrecks. Keep per-ship counts keyed by component in a table; a destroyed ship's key stays but later reads of it need `@` / `.exists` guards.
- Staleness: the group does not follow the player into a new ship. Rebuild on occupied-ship change; while the player is out of the seat `player.occupiedship` is null (setup.xml 646), so fall back to `player.ship` or freeze the group [inferred]. Ships reassigned away (commander_set to someone else) stay in the group until rebuilt; the 2 s rebuild bounds that to 2 s.
- Subordinates far away (other sector, still assigned) would count as "the wing". Filter in the event condition by `event.object.sector == player.occupiedship.sector` (or `distanceto` le ~20 km, the escort pursue distance for player defence wings, order.fight.escort.xml 43) [read].
- Friendly fire between wing and player: filter `not event.param.isplayerowned` in both directions.

### 5. Recommendation

Extend the section 5 manager cue above rather than adding a second engagement:

1. Maintain `$Wing` (group): rebuild from `player.occupiedship.allsubordinates` (filter `not isunit`, `isoperational`, optionally combat assignments) on `event_object_subordinate_added/removed object="player.occupiedship"`, `event_object_commander_set group="$Wing"`, occupied-ship change, and every 2 s poll tick.
2. Hit in: `event_object_attacked` on `global.$PlayerOccupiedShipGroup` **and** `group="$Wing"` (two conditions in a `check_any`), same filters plus same-sector check. Hit out: `event_player_attacked_object` (player) plus `event_object_attacked_object group="$Wing"`.
3. Any of them opens the engagement if closed (`initiator` = 'player' / 'wing' / 'enemy'). Each updates `$lastIn`/`$lastOut` and a per-ship table `$ships.{ship} = [hitsIn, hitsOut, kills]` keyed by `event.object` (or `player.occupiedship` for the player events), plus the opponents table.
4. End rule unchanged (20 s quiet), but the quiet clock uses the max over the player ship and wing (`lastattacktime` of each `$Wing` member is a cheap extra source on the 2 s poll). Wing losses: `event_object_destroyed group="$Wing"` adds to a `wingLost` list; it does not end the engagement.
5. `engagement.end` adds `ships`: list of {ship (Ship ref), role 'player'|'wing', hitsIn, hitsOut, kills, destroyed}, capped ~12. Wing kills: `event_object_destroyed` on opponents with `event.param` (killer) in `$Wing` [inferred], since `event_player_killed_object` covers the player only.

Unverified in game: hit rates for a 10-ship wing; turret hits on NPC ships firing `event_object_attacked_object`; whether `allsubordinates` includes docked ships and units; sub-subordinate add events reaching the player's ship.

## What was built (#23, 2026-11-02)

`extension/swibh/md/swibh_engagement.xml` follows the recommendations above, with these choices:

- **Hooks, two kinds** (after the 2026-11-02 runs below): `event_object_attacked` and `event_object_attacked_object` fire once per attack and name both sides, so they open an engagement and record opponents (hunt matching too). They listen on two groups, `$LeadGroup` (the ship the player flies) and `$Wing` (its `allsubordinates` that are ships, operational, not units, and not docked in a ship: `@$s.dock.container.isclass.ship`). `event_object_shield_damaged` and `event_object_hull_damaged` fire once per projectile and carry the damage (param3): on the two wing groups they count `hitsTaken`/`damageTaken`, and on `$FoeGroup` they count `hitsDealt`/`damageDealt` for the opponent's `lastattacker` when that's the lead or a ship under it (getting an entry if it had none). Only while an engagement is open; each moves `$LastHit`, the quiet clock. Damage events alone never open one: they carry no attacker or kill method. Gaps: hazard, boost and collision damage on a wing ship during an engagement count as hits taken; `lastattacker` is set once per attack, so with several wing ships on one opponent a hit can go to the wrong one; a projectile that drains the shield and reaches the hull may count twice [**unverified**]. The player-only events (`event_player_attacked_object`, `event_player_ship_hit`) aren't needed.
- **Filters:** `killmethod.collided` and `killmethod.hitbyareadamage` dropped; the other object must be defensible (no asteroids), not player-owned (no friendly fire) and not a wreck.
- **The lead** is `player.occupiedship` unless that's null or a spacesuit; then it stays the last ship flown, so a fight goes on being tracked from the seat-less ship until the quiet gap ends it.
- **Wing upkeep:** rebuilt on `event_object_subordinate_added/removed` on either group, on `event_control_entity_added/removed object="player.entity"`, and on every 2 s poll while an engagement is open.
- **Kills:** `event_object_destroyed` on a `$FoeGroup` of every opponent seen; `event.param` (the killer) gets the kill if it's a wing ship with a hit. A kill by a missile or drone may name something else as the killer [**unverified**].
- **Hunt key:** the hunt hooks (#19) register each active hunt with `md.SWIBH_Engagement.HuntStarted` (`hunt`, `target`), which stashes the target's wing (its top commander and every ship under it, unless that's a station), and remove it with `HuntEnded`. An opponent in a stashed wing, or with the same top commander as the live target, makes the engagement a hunt engagement from then on. **#19 must call these**; until then only the game test does.
- **End stamp:** `engagement.end` carries `lastHit` (`player.age` of the last hit). The line is written up to the quiet gap + 2 s later, so its wall time at the last hit is about `wall - (t - lastHit)`; that's off only if the game was paused or on SETA in those seconds.

## Unknowns checked in game

To fill in from `make game-test` (test `engagement`, INFO lines) and the T20 playtest in [test-plan.md](../test-plan.md#t20-engagement-log-events-for-the-players-wing). Not run yet.

| Unknown | Answer | Source |
| --- | --- | --- |
| Hit-event rate with ~10 wingmen in a big fight (and frame rate) | | T20 playtest (4) |
| Turret hits and missiles fire `event_object_attacked(_object)` | | T20 playtest (5) |
| Docked ships or units in `allsubordinates` (filtered either way) | | T20 playtest (6) |
| 20 s is the right quiet gap | | T20 playtest (7) |
| Which signal fires per hit | **`event_object_shield_damaged` / `_hull_damaged` and `event_player_ship_hit`**, one per bullet; `event_object_attacked(_object)` and `lastattacktime` only once per attack, not per hit (2026-11-02, third run) | `make game-test`, `combat_signals` |
| Hits per second for one S fighter against the player's ship and one wingman | Too few to rate: the TIE made one pass at each ship (4 bullets, then 2) and the wingman never hit back in 40 s. The test needs a fight that lasts | `combat_signals` |

### Game test, 2026-11-02 (second run)

One TIE (`tie_fighter_macro`, Attack order on the player's `fortitude_macro`, min hull 30) against the player's ship and an X-wing wingman on defence, for 120 s per fight, twice. Quiet gap 10 s. Seen in `debuglog.txt`:

- **Each fight logged three engagements of one "hit" each.** Fight 1: an attack event on the player's ship at t 43.6, on the wingman at 56.7, by the wingman on the TIE at 96.5, then nothing until the test destroyed the TIE at 158. Fight 2: the same pattern (164.6, 177.0, 210.7). Each event opened an engagement that the 10 s gap then closed. I first read this as the events being throttled while the ships kept fighting; the third run showed the fight itself was that sparse, and the attack events are per attack, not per hit (below).
- The hooks themselves work: the lead and wing groups fill, both directions fire on both groups, and the parser reads the lines.
- Bugs fixed after the run: MD libraries need `purpose="run_actions"` to be called with `run_actions` (first run: no wing ever built); a string such as `'swibh-test-hunt'` can't be a table key (`Failed to set table[].{'swibh-test-hunt'}`), so `$Hunts` is now a list; inside a cue instance its own name is the instance, so a test signalling its static cue needs `<cue>.static`.

### Game test, 2026-11-02 (third run, `combat_signals`)

Same three ships for 40 s, every combat event on them counted, the first 60 logged in full, and each ship's shield, hull, `lastattacktime` and `lastattacker` sampled every second. In 40 s: `event_object_attacked` 1 on the player's ship and 1 on the wingman, `event_object_attacked_object` 2 by the TIE, `event_object_shield_damaged` 4 on the player's ship and 2 on the wingman, `event_player_ship_hit` 4, nothing on the TIE.

- **Per bullet:** `event_object_shield_damaged` (param = damaged component, param2 = new shield value, param3 = damage, 150 per TIE bullet) and `event_player_ship_hit` (param2 = attacker, param3 = projectile). The TIE's two bursts at t 43.91 and 44.21 gave 4 of each.
- **Per attack, not per bullet:** `event_object_attacked` and `event_object_attacked_object` fired once, at the first bullet (t 43.91), and not for the burst 0.3 s later. Their killmethod was `hitbybullet`, and param3 of `_attacked_object` is `[attacked component, weapon]`.
- **`lastattacktime` follows the attack events, not the bullets:** it stayed 43.91 after the 44.21 hits. So polling it can't measure quiet either. How long an attack lasts before the next one registers is still unknown: there were no later bullets to see.
- **`lastattacker`** names the attacker (the TIE) and stays set: the attacker for damage events, which carry none.
- **The fight was sparse:** after t 50.2 nothing hit anything until the end at 76; the TIE's shield stayed 100%, so the wingman on defence never fired. Shields recharged to 100% within about 6 s.
- `engagement` this run had the hunt key on fight 1 (the list fix works) and failed only on hit counts.
