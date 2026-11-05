# Hunt scan step, "your damage" and wing kills, and silent mission ends

Questions from playtest #4 (2026-11-04), hunts 8-10 of SWI 0.90's "Search and destroy: <target>" (Emergent Missions hunt):

1. Hunt 10 ("BAO Mercenary Weequay (ONJ-300)", really Black Sun in disguise). Killed without the Scan objective: 0 Cr. After a reload, scanned first, then killed: paid.
2. Hunt 10's Results: "1 killed / 1 x Weequay Corvette: your kills: 1, your damage: 44.3697 / 100: 59,993.42 Cr", kills 252,735.00, destruction 119,986.84, total 372,721.84. Offer 291,130 + up to 218,340. Only the player's three R-41s (player plus two crewed wingmen on Escort) fired, yet "your damage" is 44%.
3. Hunt 9's mission vanished from the list when the player reached Mon Gazza on the way to the target.

EM = `ext/md/kuertee_emergent_missions.xml`, text = `ext/t/0001.xml` (page 11513), both in the unpacked SWI 0.90 (`/mnt/e/x4-dev/reference/mods/swi-0.90`). Tags: [read] = seen in code, [inferred] = reasoned, not tested. Builds on [hunt-pay-ael-112.md](hunt-pay-ael-112.md) (pay formula, re-rolls, display halving), [offer-pay-drift.md](offer-pay-drift.md) (kills part weights) and [save-check-zgn-719.md](save-check-zgn-719.md) (hunt 8 save).

## Short answer

1. **An unscanned kill of a disguised target fails the mission and pays 0 Cr.** The kill still moves the mission to "talk to the contact", but at the debrief the result is "fail" with the text "You failed to confirm the identity of <target>." and "Total reward: 0 Cr" [read]. The scan is a required step: only finishing it sets the identify flag, removes the disguise, starts the Destroy step and starts the damage counter.
2. **Wingmen's damage is counted.** Any player-owned ship counts, and a wingman's kill counts as the player's [read]. The 44% comes from when counting starts: the damage counter only starts tracking the target when the Destroy step begins. For a disguised target that is when the scan finishes. Damage done before that is lost. With the player's side doing all later damage, "your damage" comes out at about the target's hull % when the scan finished [read for the code; that the wing shot the target before the scan finished is inferred]. So hunt 10's Weequay was probably at about 44% hull when the scan completed, and hunt 8's at about 33%.
3. **Destruction is 2x the per-ship line** because that line is shown at half value (`$rewardMult` 50%), which is never applied to the pay. This was already found in hunt-pay-ael-112.md [read].
4. **Silent ends:** the target destroyed or abandoned by anyone before a player-owned ship hit it; the 3 h Find timeout; and two load-time patches. Each one removes the mission right away [read]. The likely silent case for hunt 9 is that someone else killed the target, or its crew bailed [inferred].

## 1. The Scan step [read]

### Steps

`Mission_Hunt` sets the steps: brief 1, find 2, **identify 3**, destroy 4, debrief 5, complete 6, plus `$Objective_Step_find_success`, `_identify_success` and `_destroy_success`, all false (EM 5293-5303). The briefing objectives are talk, find, **`objective.scan` on `$MissionTarget`**, destroy, talk (EM 5605-5609).

`$IsDisguised` = `$MissionTarget.coverowner and coverowner != trueowner` (EM 5287, again at 6125). So the disguise is an engine cover owner on the ship. The hunt 8 save had no `cover` attribute on the wreck, because the scan clears it (below).

### Finding the target

`Mission_Hunt_TargetFound_20220119` (EM 6081-6133) fires on a long-range scan ping, an attention change to in-zone or nearer, or any player ship's radar finding the target as an enemy, in the Find or Destroy step. It sets `find_success` = true and resets the find timer to +3 h (6106, 6124). Then:
- disguised: `Mission_Hunt_ObjectiveIdentify` (6126-6127). That sets step 3 and `identify_success = false` (5872-5887).
- not disguised: straight to `Mission_Hunt_ObjectiveDestroy` (6129-6131).

### What the scan does

`Mission_Hunt_TargetManager_Scanned` (EM 6135-6157) needs `event_scan_finished scanned="$MissionTarget"` while the step is identify (6137-6139). It:
- tells kRAP "target scanned" (6141-6153);
- **`set_cover_owner object="$MissionTarget" faction="null"`** (6154): removes the disguise, so the ship now shows its true owner (BLS);
- sets `$OpposingFaction` to the true owner (6155);
- signals `Mission_Hunt_ObjectiveDestroy` (6156).

`Mission_Hunt_ObjectiveDestroy` (EM 5889-5911) then re-rolls `$BaseRewardData` (kills part plus the "up to" estimate, 5897), sets step 4, **sets `identify_success = true` (5903)**, and signals `Mission_Hunt_EnemyTargets2` (5906-5908), which starts the damage counter (section 2). Nothing else sets `identify_success` to true.

A scan finished in any other step does nothing (6139). The cue fires once (`reset_cue` commented out, 6157), and its child resets it only for the ship-scanner handover (6176-6181).

### An unscanned kill

`Mission_Hunt_TargetManager_Destroyed` (EM 6270-6308) fires on `event_object_destroyed` or `event_object_abandoned` for the target, whoever does it:
- mission not active: clean up (6290-6292);
- **no player-owned hit yet** (`$isTargetAttackedByPlayer`, set by any `isplayerowned` attacker at 6244-6268): `ObjectiveComplete` plus `CleanUp` (6293-6296);
- step brief or earlier: the same (6297-6300);
- otherwise: `destroy_success = true`, go to debrief (6301-6304). **This branch doesn't check the step, so a kill in the Identify step goes to the debrief like a normal kill.**

At the debrief, `Mission_Hunt_Resolve` (EM 5630-5719) sets the result to fail when any of `find_success`, `identify_success` or `destroy_success` is false (5648-5656). A fail sets `$RewardCr = 0` and runs `Mission_Fail` (5704-5709): no money, no notoriety or relation gain, and a kRAP "mission failure" event (7386-7413). The end text (EM 6773-6777) is text 576, "You failed to confirm the identity of %s(ship).", plus "Total reward: 0 Cr", and it's also written to the logbook (5711, 6798).

So hunt 10's first try: kill in step 3 → debrief objective → talking to the contact fails the mission with 0 Cr. The later scan-then-kill passes all three flags. Before the reload, the logbook's Missions category should hold the "failed to confirm the identity" entry [inferred].

Also [read]: if the kill comes before the target was ever "found" (find_success false), the text is 575, "You failed to find %s(ship)." (6766-6771).

## 2. How "your damage" and the pay are computed

### When counting starts [read]

- At offer creation the hunt puts the target in the mission's own `$EnemyTargets` group (EM 5353-5354).
- `Mission_Hunt_EnemyTargets2` (5722-5734) instantiates the `EnemyTargets` library, with `IsFindNewEnemyTargets` false. It's signalled **only** from `Mission_Hunt_ObjectiveDestroy` (5906-5908) and from load patch 7 when the step is destroy (5389-5393).
- The library's `EnemyTargets_Init` (8513-8541) runs `DamageCalculator_AddTarget` for the target **without an `Attacker`** (8516-8522).
- The other ways in (`EnemyTargets_Accumulate` 8543+, `EnemyTargets_FindInterval` 8666+) exclude hunts (`$kEMissionType != $missionType_hunt`, 8604) or only run for escort/mayday/patrol/raid/rescue missions.

`DamageCalculator_AddTarget` (EM 9300-9352) creates the record with `$hull` = the target's `hullpercentage` **now** and `$damage_total = 0` (9312-9327). The catch-up that credits `100 - hull` (9330-9339) only runs when a player-owned `Attacker` is passed, and Init passes none. Then it adds the target to `DamageCalculator.$EnemyTargets` (9349), which the damage and kill listeners watch.

**So damage done before the Destroy step starts is never counted.** For a target that isn't disguised, Destroy starts when the target is found, which is normally before any shooting (hunt-pay-ael-112: 100/100). For a disguised target it starts only when the scan finishes.

### Counting hits [read]

`DamageCalculator_Attacked` (EM 9443-9535), on `event_object_attacked` or `event_object_hull_damaged` for a tracked ship with hull > 0:
- The attacker is `event.param` for an attack event. For a hull-damage event it's taken from the pilot's `$kEM_lastAttack` list, sorted so the player's ship in range comes first, then other player-owned ships in range (9467-9475). The comment at 9471-9473 says it gives the damage to a player-owned ship when one is in the list.
- The damage is the drop in hull % since the last recorded value (`abs(old - new)`, 9511-9517), or `param3 / maxhull * 100` for a hull-damage event (9478).
- It's added to `$damage_total` **when `$attacker.isplayerowned`** (9518-9521). Wingmen, Escort-order ships and any other player-owned ship count, not only the ship the player flies.
- Only hull counts. Shield damage changes no hull %, so it's not counted. Since the share is of hull, that changes no result.

`DamageCalculator_Kill` (EM 9398-9441), on the target's death:
- `$isPlayerKilled = killer.isplayerowned or damage_total >= 75` (9419). **A wingman's kill is a player kill**, which matches hunt 8, where wingman RBQ-989 killed it and got "your kills: 1".
- On a player kill, the **last recorded hull %** is added to `$damage_total` (9415, 9420-9421): the killing blow gets the rest of the hull.

So if the player's side does every bit of damage after tracking starts, the total = (hull at start - last hull) + last hull = **the hull % when tracking started** [inferred from the code; matches both data points if the scans finished mid-fight].
- Hunt 10: 44.37 → the Weequay was at about 44% hull when the scan finished.
- Hunt 8: 32.92 → about 33%. The save shows the R-41s fighting JJO-747 from 25,904.9 to 26,012.6 (save-check-zgn-719.md), so the scan probably finished partway through.

How the wing got hits in before the scan can't be told from code: the player shooting first, the wing joining on their own, or the target attacking them. The save showed JJO-747 hit all three R-41s first (save-check-zgn-719.md) [inferred]. To check: scan a disguised target from range before anyone fires, then kill it. It should read about 100/100.

Other ways damage could go missing, all smaller [inferred]: the first hull-damage event before any attack event has no attacker (9465-9481); hull repaired by the target is credited as damage too (abs, 9512-9515), so that inflates rather than deflates.

### The per-ship line, destruction and kills parts [read]

`Reward_CalculateForKills` (EM 7079-7200), at debrief:
- Fresh roll for the target's class (7130-7135; ship_m = medium, level 1, 7290-7292), the same range as the "up to".
- `$damage = min(100, damage_total)` (7143), reward = damage/100 × roll (7146); × 1.25 on a player kill of S/M/L/XL/station (7155-7166).
- The per-ship line shows `reward × $rewardMult / 100` (7189), and `$rewardMult` = 50 (EM 170). The comment says the multiplier "will be applied when the total reward is given", but that line is commented out in `GetRewardForLevel` (7334-7336). "your damage: x / 100" is min(damage, 100 × player kills) (7126).

`Mission_Hunt_Resolve` then pays destruction = that unhalved reward (5693), kills = `$BaseRewardData.$reward_forTargetKills` as re-rolled when Destroy started (5897), total = kills + destruction (5694), via `reward_player` (7056). The SWI cap (5683-5692) only bites for L/XL targets; a corvette is M.

Check against the screenshots [inferred arithmetic]:

| | Hunt 10 | Hunt 8 |
|---|---|---|
| Destruction | 119,986.84 = 0.443697 × 216,340 × 1.25 | 83,610.86 = 0.329193 × 203,190 × 1.25 |
| Implied M roll | 216,340 (offer's "up to" roll was 218,340) | 203,190 (offer 216,660) |
| Per-ship line | 59,993.42 = destruction / 2 | 41,805.43 = destruction / 2 |
| Kills part | 252,735 = 0.5 × 505,470 (offer 291,130) | 9,502.50 = 0.5 × 19,005 (offer 8,832.50) |

Both implied rolls end in 0 and fall in the M range of 192,000-270,400 × relation boost, as `Reward_Money` rounds to 10 Cr (hunt-pay-ael-112.md). The kills part is 0.5 × Σ (class roll × the target's recorded kills against the offering faction), from `$MissionTarget.pilot.$kEM_kills` (6648-6662). It was rolled again when the Destroy step started, so it differs from the offer. Kills by the target's subordinates count 0.25 (EM 11436-11437, `0.25` at 11437; offer-pay-drift.md), which is why hunt 8's 19,005 is less than one S roll.

So the "up to" is the full-damage destruction value **before** the 1.25 kill bonus. With a 100% damage share and a kill, expect about 1.25 × "up to" (± the re-roll). Hunt 10 got 44% of that because of the late counting start.

## 3. What ends a hunt silently [read unless marked]

Every one of these runs `Mission_Hunt_CleanUp` (EM 5497-5565). It removes the mission and offer at once (`remove_offer` / `remove_mission`, 5535-5536) and cancels the mission cue (5560):

1. **The target destroyed or abandoned before any player-owned hit**, by anyone: NPC police, another hunter, a faction war, its crew bailing (`event_object_abandoned`), or a script `destroy_object` such as a despawn (6270-6296). The same happens if the step is still brief (6297-6300).
2. **Find timeout:** `Mission_Hunt_Timeout` at `$timer_find_end` (6311-6328). That's 3 h of game time from the first Find step (5948-5951), pushed to +3 h each time the target is found (6124). It only runs during the Find step: StopHunting resets it (5977).
3. **On load:** patch 11 ends the mission if `player.age >= $timer_find_end` (5403-5410). Patch 6 ends it if it's not in `Missions_Hunts.$missions_active` (5383-5388).
4. **Aborting it** from the mission menu (5516-5520, 5645-5661).
5. A completed mission is removed when you leave the station or close the debrief conversation (5501-5515, 6479-6486). That's after pay, so it's not a vanish.

Cases 1 and 2 signal `ObjectiveComplete` and then `CleanUp` in the same action block. `ObjectiveComplete` only signals `Resolve` (5940), so `Resolve`'s fail text, logbook entry and `Mission_Fail` are queued **after** `CleanUp`, whose child `Mission_Hunt_CleanUp2` cancels the mission cue (5556-5562). So `Resolve` may never run: no fail message, no logbook entry, the mission just disappears [inferred from MD signal order; untested].

**Hunt 9 [inferred]:** reaching a sector doesn't end a hunt by itself; no hunt cue listens for the player changing sector. The mission's `EnemyTargets_ChangeSector` (8883+) only removes ships from the mission's own group, and the hunt passes `IsForgetEnemyTargetOnNewSector=false`. The timing fits case 1:
- The target, now in a sector the player was entering, met local forces, or was destroyed or abandoned some other way, before the player's ships hit it.
- Or the 3 h Find timeout happened to run out then.

To tell them apart, use the save just after the vanish:
- the target ship by its code: a wreck, and its `attacker`; or gone;
- the hunt's cue instance (`$Result`, `$timer_find_end` against game time, `$Objective_Step`);
- the logbook's Missions entries.

## Unverified

- That the hunt 10 and hunt 8 targets were damaged before the scan finished (the 44%/33% explanation). Test: scan first from out of weapon range with the wing on hold, then attack.
- That case 1 and 2 ends write no logbook entry (signal order).
- Which scanner `event_scan_finished` accepts: the code names no scanner (6137), so a wingman's or NPC's scan might also count. Untested.
- Hunt 9's actual cause (no save read yet).
