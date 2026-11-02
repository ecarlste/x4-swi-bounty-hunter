# Wing split: implementation facts (2026-11-01)

Facts for the extension that splits a sanctioned Hunt target that leads a wing from its escorts. No design is chosen here: options are listed with trade-offs.

RAP = SWI 0.90 `ext/md/kuertee_professions.xml`, EM = `ext/md/kuertee_emergent_missions.xml` (both under `E:\x4-dev\reference\mods\swi-0.90`). Vanilla = 8.00 `base/` under `E:\x4-dev\reference\x4-8.00`. Tags: [read] = seen in files; [inferred] = reasoning, to confirm in game.

Background: [hunt-protection-ael-112.md](hunt-protection-ael-112.md) (why AEL-112's wing stayed), [cap-fix-facts.md](cap-fix-facts.md) (diff patches reach existing saves).

## 1. SWI's existing detach

### Trigger [read]

- **Only after a sanction is bought**, either tier. Nothing in EM or RAP detaches anything when a Hunt is accepted or the target is found.
- Purchase: conversation choice in `Guilds_ConvoNext` (cue path `kProfs > Guilds > Guilds_ConvoNext`). Partial: RAP 3426-3446, signals `SanctionAttack` at **3444** with `table[$ship = $kEM_huntMission.$MissionTarget, $sanctionType = Sanctions.$sanctionType_partial]`. Full: 3448-3469, same signal at **3467** with `$sanctionType_full`.
- `SanctionAttack` (RAP **6734**, instantiated per purchase): signals the ship `'kProfs_remove_sanctions'` to clear older instances (6742), waits 1 s (6745), writes the idcode lists (6747-6756).
- `SanctionAttack_Visible` (RAP **6762-6774**), a sub-cue of each `SanctionAttack` instance, `instantiate="true"`:
  - condition: `event_object_changed_attention object="$ship"` with `event.param ge attention.visible` and `event.param2 lt attention.visible` (6764-6766). So it fires **each time the target rises to visible attention** (the player's area), not at purchase, and not while it stays visible. AEL-112 logged nine firings.
  - action (6768-6773): `debug_text`, then `<do_if value="$ship.commander"><remove_object_commander object="$ship"/>`. That's the whole detach: it removes the **target from its own commander**. It never touches `$ship.subordinates`.
  - Same for both tiers: the cue doesn't read `$sanctionType`.
- Lifetime: until the ship is destroyed, a newer sanction replaces it (`SanctionAttack_CleanUp` 6776-6797, `cancel_cue parent` at 6793), or 3 h after purchase (`SanctionAttack_Timeout` 6799, `checktime="player.age + 3h"`).
- Target and owner come from the Hunt cue: `$kEM_huntMission.$MissionTarget` (EM 5267, `event.param.$target`).

### Cue paths (comments stripped, parsed) [read]

```
/mdscript[@name='kuertee_professions']/cues/cue[@name='kProfs']/cues/cue[@name='Sanctions']
  /cues/cue[@name='SanctionAttack']/cues/cue[@name='SanctionAttack_Visible']/actions
```

`Sanctions` (6723) is a direct child of `kProfs` (200) with no conditions. Note RAP 4193 has a commented-out `<cue name="Builder">` line; a naive parser that doesn't skip comments puts `Sanctions` under `Builder`, which is wrong.

### Patch points (options)

| Option | How | Pros | Cons |
| --- | --- | --- | --- |
| A. Diff into `SanctionAttack_Visible/actions` | `<add sel="…/cue[@name='SanctionAttack_Visible']/actions" pos="append">` with a `run_actions ref="md.<ourscript>.SplitWing"` (param `$ship`) | Smallest change; same trigger SWI already uses; existing sanction instances in saves pick up the new actions (MD reloads action code on load, [cap-fix-facts.md](cap-fix-facts.md) §4) | Only runs on a rise to visible: if the target is already visible when the sanction is bought, nothing happens until it leaves and comes back (same limit as SWI's own detach) |
| B. Own cue listening to the purchase | In our script: `<event_cue_signalled cue="md.kuertee_professions.SanctionAttack"/>`, read `event.param.$ship` | No diff on SWI at all; runs at purchase time, whatever the attention | Splits the wing at purchase, possibly far from the player (escorts may re-join or drift before the player arrives, see §2); needs its own handling of saves where the sanction was bought before install (see §4) |
| C. Both | B at purchase + A on visible as a re-check | Covers both timings; idempotent if the split checks `$ship.subordinates.count` | Two hooks to keep in step |
| D. Split at hunt start, no sanction needed | Hook `Mission_Hunt_ObjectiveDestroy` (EM 5889) or `Mission_Hunt_TargetManager_Scanned` (EM 6135) | Every hunt fights the target alone | Changes the game's balance and the sanction's value; not what the current decision says |

The split must be **idempotent**: `SanctionAttack_Visible` fires repeatedly.

## 2. Vanilla 8.00 actions and what escorts do after losing their commander

### Actions and properties [read]

| Thing | Where | Notes |
| --- | --- | --- |
| `remove_object_commander object=` | `libraries/common.xsd` 30684 | Only `object`. Removes this object from its commander |
| `set_object_commander object= commander= [assignment=] [subordinategroupid=] [informfleetmanager=]` | common.xsd 33191-33232 | "If neither assignment nor subordinategroupid is supplied, the object will be added with its default assignment." |
| `remove_from_group` / `add_to_group` | common.xsd 30649 / 20441 | **MD groups only**, not commanders. Not the tool for this |
| `cancel_all_orders object=` | common.xsd 36561 | Empties the order queue |
| `create_order id= object= default="true"` | common.xsd 23607 | `default="true"` replaces the default order |
| `$ship.commander`, `.assignment`, `.subordinates`, `.subordinates.{$assignment}`, `.allsubordinates`, `.subordinatesingroup.{$id}`, `.defaultorder`, `.order`, `.isjobship`, `.job`, `.jobsubordinates.valid/invalid` | `libraries/scriptproperties.xml` 325-358, 775-785 | `subordinates` = direct; `allsubordinates` = whole tree |
| `order.id`, `order.$<param>` | scriptproperties.xml 1638-1661 | So a leader's default order and its params can be read: `$ship.defaultorder.id`, `$ship.defaultorder.$range`, `.$space` |
| Events: `event_object_commander_set` (object = subordinate, param = new commander, param2 = previous, param3 = assignment), `event_object_subordinate_removed` (object = old commander, param = subordinate) | common.xsd 13677, 14567 | Usable for checks in a test or as a guard |

Vanilla patterns:
- **Release all subordinates**: `lib_generic.xml` 1296-1315 `TransferShipOwnership` (`do_for_each in="$Ship.subordinates"` → `remove_object_commander`); `boarding.xml` 2670-2673. Neither gives them new orders.
- **Release then give an order**: `cpu_ship_manager.xml` 885-888: `remove_object_commander` then `create_order id="'Patrol'" default="true"` with `space = $Defender.sector`.
- **Release then ask for a default order**: `aiscripts/order.assign.commander.xml` 168-173: `remove_object_commander` then `run_script 'lib.request.orders'` (aiscript only; can't be called from MD).
- **Build a group under a leader**: `lib_generic.xml` 1697-1730 `Setup_ShipGroup_Formation_v2` (first ship leads, `set_object_commander` the rest, optional follower order).
- **No MD library promotes a subordinate.** Promotion on leader death is done by the engine (`order.fight.escort.xml` 1836 "delay to wait for a possible commander promotion", then 1851-1858 re-targets the Escort order to the new commander).

### What an escort does after `remove_object_commander` alone [read + inferred]

- SWI escort job `newrepublic_mixedfighters_escort` (SWI `ext/libraries/jobs.xml` 6920-6938): default order `Escort` (pointguard), `quota wing="3"`, `modifiers subordinate="true"`, `startactive="false"`. Leader job `newrepublic_mixed_patrol_s` (6768-6787): default `Patrol` with `range = class.cluster`, `<subordinate job="newrepublic_mixedfighters_escort"/>` (no `rebuild` attribute).
- The Escort order's `target` param defaults to `this.ship.commander` (`order.fight.escort.xml` 25), stored when the order is created. The running loop (991-1060) checks the target's existence, owner and distance, **not** whether it's still the commander. It keeps flying formation and defending `$target` (attacked handlers at 1428, 2408).
- Worse, the order's init (584-595) re-assigns: if `$target` is operational, isn't the commander and has the same true owner, it runs `AssignCommander` back to `$target`. So if the Escort order restarts for any reason, the escort **re-joins the leader**.
- If the Escort order does end with no commander (target dead or owner changed), 1938-1950 cancels the default order and `orders.base.xml` 132-139 calls `lib.request.orders`, whose no-commander fallback for an NPC fighter is `Patrol` with `range class.zone` (`lib.request.orders.xml` 18-36), else `Wait`.
- Conclusion [inferred, high]: **`remove_object_commander` alone is not enough.** The split must also replace each escort's orders (`cancel_all_orders` + `create_order … default="true"`). Whether the engine itself cancels the Escort default order on commander removal isn't documented; vanilla code always sets an order explicitly after removing one (cpu_ship_manager, order.assign.commander), which suggests it doesn't. Test it.
- Job engine refill [inferred, unknown]: the leader's job lists a subordinate job with a wing quota. Whether the job engine spawns new escorts for a leader that lost its wing isn't documented in `libraries.xsd` (1162-1195 has a `rebuild` attribute; the SWI job doesn't set it). Watch for it in a test.

### Options for the escorts

| Option | Actions | Pros | Cons |
| --- | --- | --- | --- |
| (a) New leader, keep the leader's order | Pick one escort (e.g. best `combinedskill` or first), `remove_object_commander` + `cancel_all_orders` + `create_order id="$leader.defaultorder.id" default="true"` copying params (`space`/`range`, e.g. `$leader.defaultorder.$range`; Patrol params in `order.fight.patrol.xml` 5-22); then `set_object_commander` the others to it with their old `assignment`, and `create_order 'Escort' default="true"` with `target` = new leader | Wing stays a believable patrol; mirrors what vanilla does on leader death | Most code; the new wing may patrol back into the fight (Patrol `range class.cluster` + `allowothertargets`); must check `canuseassignment`; jobs-wise the new leader isn't a leader job ship |
| (b) Escorts go home / dock / leave | `create_order 'DockAndWait'` at a friendly station (needs a find), or `'MoveDie'` (`order.move.die.xml` 10-20, used by vanilla for expired job ships, e.g. escort 1844-1847: `byhighway`, `byhostile`) | Clean for recording: escorts leave the fight and the universe recovers them; `MoveDie` despawns them out of sight | Removes ships from the faction's economy (MoveDie); DockAndWait needs a station search and leaves them parked |
| (c) Move/Patrol away from the target | `create_order 'Patrol' default="true"` with `space` = another sector (or `range class.zone` elsewhere), or a `MoveWait`/`MoveGeneric` to a point ≥ 30 km away first | Simple, like `cpu_ship_manager` 885-888 | If they stay in the same sector they may come back when police or distress signals fire (sanction suppresses police only for the target's idcode); need a destination choice |

Common to all: wrap in `do_if not $ship.isplayerowned`, skip escorts already engaged with the player if wanted, and debug-log each escort's idcode and new order.

## 3. Escorts of escorts, and a target that is a follower

- `$ship.subordinates` lists direct subordinates; `$ship.allsubordinates` lists the whole tree (scriptproperties.xml 339, 351). Detaching the direct ones moves their own sub-escorts with them (those still escort their direct commander). Re-ordering the whole tree isn't needed unless option (a) re-parents them. [read, inferred]
- Target is a follower (has a commander): SWI already removes it from its commander. Its **siblings** keep escorting the old leader, whose Escort `event_object_attacked` handlers watch the leader, not the target, so they don't defend the target. [inferred] But the target's **own** subordinates (if it's a mid-level wing leader) would still follow it: the same subordinate split covers that case if it runs after SWI's removal.
- A target that's a carrier/L/XL with docked fighters: `subordinates` includes them; a split would launch nothing but would re-order docked ships. Check `$sub.isdocked`/`subordinategroupdockoverride` if L/XL targets matter. [inferred]

## 4. Existing saves and hunts already in progress

- `kProfs` triggers on `md.Setup.GameStart` or `event_game_loaded` (RAP 200-208), and only `ResetAll` (RAP 93-115, a chat reset) resets it, so `Sanctions` and every live `SanctionAttack` instance survive save/load. [read]
- The purchase trigger (`SanctionAttack` signal) **fires once**, at purchase. It doesn't re-fire after load.
- `SanctionAttack_Visible` stays armed in saved `SanctionAttack` instances (for up to 3 h after purchase) and fires again on every rise to visible. With patch option A, a hunt whose sanction was bought **before** the extension was installed gets the split the next time the target comes into view, as long as the 3 h hasn't run out. [read + MD-reload fact from cap-fix-facts §4; inferred for instantiated sub-cues]
- Option B (listening to the signal) doesn't help those: the purchase already happened. A catch-up on load could walk `md.kuertee_emergent_missions.Missions_Hunts.$missions_active` (EM 5095, also `global.$Missions_Hunts`, EM 20) and split each `$MissionTarget` whose idcode is in `md.kuertee_professions.Sanctions.$sanctionedAttackIds`.
- Hunts in progress **without** a sanction never split under A/B/C (by design of the trigger).

## 5. Testing it in the harness

Harness: `tests/game/README.md`; `tests/game/swibh_tests/md/swibh_tests.xml` (`Run` 19, `$Tests` 28, `Report` 70; tests are root cues on `event_cue_signalled` that signal `Report` once with `table[$name, $ok, $detail]`). Gamestart `swibh_test`: SWI showcase galaxy, one sector, **jobs off**, so no job wings exist; the test must build one.

Plan [inferred, untested]:

1. Spawn a leader and three escorts in `player.sector`, e.g. `bwing_macro` + `t65xj3_xwing_macro` ×3, owner `newrepublic`, **with pilots** (`create_ship … <pilot><select faction="faction.newrepublic" tags="tag.aipilot"/></pilot>`, orders need a pilot; existing T01 ships have none), loadout level ≥ 0.5 so they count as fighters.
2. `create_order 'Patrol' default="true"` on the leader (`space = player.sector`); `set_object_commander` each escort to the leader (default assignment) and `create_order 'Escort' default="true"` with `target` = leader (pattern: `lib_generic.xml` 1724-1730).
3. Check `$leader.subordinates.count == 3` and each `$esc.commander == $leader`.
4. Call the split. Three ways, cheapest first:
   - **Call our library directly**: `run_actions ref="md.<ourscript>.SplitWing"` with `$ship = $leader`. Tests the split logic without SWI's trigger. Best unit test.
   - **Signal SWI's cue**: `signal_cue_instantly cue="md.kuertee_professions.SanctionAttack" param="table[$ship = $leader, $sanctionType = md.kuertee_professions.Sanctions.$sanctionType_partial]"`. This needs `kProfs` to have run in the test start (it runs on GameStart for any non-scenario start, RAP 200-208; add a check like the `Begin` cue's EM check). The detach still needs an attention rise: spawn the wing out of visible range (or in a second zone) and `warp` it next to the player, or move the player. Whether a fresh spawn near the player counts as a rise isn't known.
   - Patch A can also be checked without attention by having the extension expose the split as a library and only testing the hook's presence via `make check` (XPath resolves against SWI's file).
5. After ~2-5 s check: `$leader.subordinates.count == 0`; each escort's `commander` (null, or the new leader for option a); `defaultorder.id` and `order.id` (not `Escort` with target = old leader); after ~30 s, distance from the leader grows (options b/c) and nobody re-joined (`event_object_commander_set` with param = old leader would show a re-join). Log as `INFO`/`VERDICT`.
6. Clean up with `destroy_object` on all four. Also a sanction-list check: after signalling `SanctionAttack`, wait 1.5 s and read `md.kuertee_professions.Sanctions.$sanctionedAttackIds` (and signal the instance's cleanup, or destroy the ship, so the list is empty for later tests).
7. A job-engine refill check (§2) needs a jobs-on start on `swi_galaxy_macro`; out of scope for the lean start.

## 6. Data logging per hunt

### Where a hunt ends [read]

- **All endings go through `Mission_Hunt_Resolve`** (EM **5630-5721**, path `kEMissions > Missions_Hunts > Mission_Hunt > Mission_Hunt_Resolve`), which sets `$Result` to `'success'`, `'fail'` or `'aborted'` (constants EM 5357-5359):
  - aborted: `event_mission_aborted cue="$Cue_Mission"` while it has a mission (5633-5637, 5644-5645) → CleanUp.
  - fail: the find, identify or destroy step didn't succeed (5647-5655), or success with no player damage reward (5667-5670). Reached from timeout `Mission_Hunt_Timeout` (6311-6325, `checktime="$timer_find_end"`) and target destroyed without the player's attack (`Mission_Hunt_TargetManager_Destroyed` 6270-6307: 6292-6299).
  - success: target destroyed after the player attacked (6301-6303 sets `$Objective_Step_destroy_success`), then debrief at the contact (6459-6462 → `Mission_Hunt_ObjectiveComplete` 5931-5942 → Resolve).
- `Mission_Complete` (EM 7050-7077) pays (`reward_player` 7056) and signals `md.kuertee_professions.BountyHunter_Event` (`$type = kProfs.$activity_mission_success`) and `GMMissionEnd` (with `$rewardCr`). `Mission_Fail` (7386-) signals the same with failure. Abort signals nothing.
- If the hunt cue is cleaned up without a mission (offer only), Resolve doesn't run (CleanUp 5497-5555).

### Hook options

| Option | Where | Pros | Cons |
| --- | --- | --- | --- |
| Diff into Resolve | `<add sel="//cue[@name='Mission_Hunt_Resolve']/actions/reset_cue[@cue='this']" pos="before">` (line 5719) calling our logger with `$Cue_Mission` | Sees all three results and every variable in scope; after the cap | A diff on EM (like the cap fix) |
| Listen to RAP's signals | `event_cue_signalled cue="md.kuertee_professions.GMMissionEnd"` / `BountyHunter_Event`; `event.param.$missionLib` | No diff | No abort; `$missionLib` isn't the hunt cue itself; also fires for other missions |
| `event_mission_aborted` per hunt | needs the cue | | Only aborts |

### Fields and where they live (on the hunt cue `$Cue_Mission` unless noted) [read]

| Field | Source |
| --- | --- |
| Mission id | `$MissionId` (5256) |
| Result | `$Result` (Resolve) |
| Reward paid | `$RewardCr` (Resolve 5694, money; 0 on fail at 5700) |
| Uncapped vs capped | `$BaseRewardData.$reward_forTargetKills` and `$PlayerDamageAndKillsData.$reward` before the cap call, `$CappedRewards.*` after (Resolve 5679-5692; cap call 5684) |
| Offer faction (guild) | `$Faction` = `$MissionOffer_Station.owner` (5281) |
| Target | `$MissionTarget`: `.idcode`, `.macro`, `.class`, `.isclass.ship_l/xl`, `.size`, `.trueowner`, `$MissionTarget_name` (5274) — the object may be gone at Resolve on success, so capture at split time or use `@` |
| Difficulty | `$Difficulty` (5284-5287) |
| Damage and killer | `run_actions ref="DamageCalculator_GetDamageAndKillsList"` (9383) per idcode: `$hull`, `$damage_total`, `$isPlayerKilled`, `$killer` (DamageCalculator_Kill 9399-9440). Only the target is in the hunt's `$EnemyTargets` (5353-5354; `IsFindNewEnemyTargets=false` at 5730) |
| Sanction tier | Not stored on the hunt cue. The idcode lists `md.kuertee_professions.Sanctions.$sanctionedAttackIds/$sanctionedKillIds` are cleared 1 s after the target dies (6776-6797), before Resolve. Record it at purchase: listen to `event_cue_signalled cue="md.kuertee_professions.SanctionAttack"` (`event.param.$ship`, `.$sanctionType`) and store it on our side by idcode. Costs: `$kProfs_sanctionCost_partial/full` on the hunt cue (RAP 3135-3144) |
| Escorts and escorts killed | Not tracked by EM. Our split records the escort list (idcodes, macros) and listens `event_object_destroyed group=` for kills (param = killer; `.isplayerowned`). RAP's `Attacker_Event` (RAP 5734-) also counts kills of ships whose commander is a mission target, but only in its silent scores |
| Relation changes | `event_player_relation_changed` (common.xsd 15830: param = faction, param2 = [new, old], param3 = `relationchangereason`, e.g. `killedobject`, `attackedobject`, `missioncompleted`, common.xsd 4690-4701). Sum per faction between hunt accept and Resolve. Mission notoriety: `$RewardNotoriety` (Resolve 5697-5699) |

One line per hunt, e.g. `debug_text filter="general"` with a fixed prefix (`[swibh-hunt]`) and `key=value` pairs, so the runner and a script can grep it (same style as the harness's `[swibh-test]` lines).

## Open questions to test in game

1. Does the engine cancel an escort's Escort default order when `remove_object_commander` runs, or does the escort keep escorting and re-join (§2)?
2. Does the job engine give a stripped job leader new escorts?
3. Does a ship spawned or warped next to the player trigger `event_object_changed_attention` rising past `visible`?
4. Does a diff on an instantiated sub-cue's actions apply to instances saved before the patch (§4)?
