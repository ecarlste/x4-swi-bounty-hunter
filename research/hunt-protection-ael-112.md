# Hunt sanction ("immunity") on AEL-112: what was bought and why the wing stayed

The user's hunt "Search and destroy: NRL Patrol B-wing (AEL-112)" (Imperial Ascendancy, Bounty Hunters Guild, Medium; target `bwing_macro`, New Republic), 2026-11-01, X4 8.00 HF4 + SWI 0.90. The user paid for an extra option at the guild and expected the target to be split off from its wing. It wasn't. They had to kill the three wingmen too, and New Republic took -2 "Unauthorised Kill" for the target as well. Pay and the save are in [hunt-pay-ael-112.md](hunt-pay-ael-112.md) and [save-check-ael-112.md](save-check-ael-112.md).

RAP = `ext/md/kuertee_professions.xml`, EM = `ext/md/kuertee_emergent_missions.xml`, text = `ext/t/0001.xml`, all in the unpacked SWI 0.90 (`E:\x4-dev\reference\mods\swi-0.90`). Vanilla = unpacked 8.00 `base/`. Tags: [read] = seen in code, save or log; [inferred] = reasoned.

## Short answer

- The option is the **sanction**: "Sanction my attacks on: NRL Patrol B-wing (AEL-112)", then "**Partial immunity. No retaliations.**: 39,700 Cr" or "Full immunity. No retaliations and intact relationships.: 1,151,670 Cr". The user bought **partial**.
- Partial is meant to stop police and station retaliation for attacking that one ship. It is **not** meant to save the relation: the NPC says so when you pay (text 713). So the -2 for the target kill is by design.
- Both sanctions also try to pull the target out of its group: `remove_object_commander` on the target when it comes into view. That only works when the target is a **wingman**. AEL-112 was the **wing leader** (patrol job `newrepublic_mixed_patrol_s`, with three `newrepublic_mixedfighters_escort` ships under it). It had no commander, so the call did nothing (the debug log says `commander: null` nine times), and the escorts kept their Escort order and defended it. Nothing ever detaches a target's subordinates.
- That's a **design gap in kuertee's code** (it assumes a target is a follower), not something the user did wrong. The text never promises a split, though: no line says the target will be separated from its wing.
- The three wingmen were **not sanctioned** (the sanction covers one idcode). Each kill cost New Republic relation (-3, -2, -2), and none of them paid anything.

## Tiers at a glance [read unless marked]

The code has exactly **two tiers**. `$sanctionType` is only ever `'partial'` or `'full'` (RAP 6725-6726, 6747-6756), and it's signalled from only two places (3444, 3467). No third tier exists, hidden or not.

| | Partial | Full |
| --- | --- | --- |
| Option text (after "Sanction my attacks on: <ship>", 712) | "Partial immunity. No retaliations.: <cost>" (`{161815,720}`) | "Full immunity. No retaliations and intact relationships.: <cost>" (`{161815,721}`) |
| NPC reply after paying | 713 "Remember that this will prevent their faction from retaliating but your relationship will suffer." | 722 "This will prevent their faction from retaliating and will also rectify the damage to your relationship." |
| Cost | vanilla `Reward_Money(level.easy, level 1, target.trueowner)` × `Apply_RewardMultiplier`; AEL-112: **39,700 Cr** | `Reward_Money(level.hard, level 1, target.trueowner)` × `Apply_RewardMultiplier`; AEL-112: **1,151,670 Cr** |
| When it's shown | idcode not yet in the attack list, and you have the money (RAP 3413-3417) | idcode not yet in the kill list, and you have the money (3419-3423). Still offered after partial, as an upgrade |
| Lists it writes | `$sanctionedAttackIds` | `$sanctionedAttackIds` + `$sanctionedKillIds` |
| Police and station response to attacks | suppressed: no police call (`IllegalActivityRetaliate` police chance 0), station "refuse to retaliate" (`AttackResponse`), patrols ignore the `police` signal | same |
| "Unauthorised Attack" relation loss (reported by police/station) | **still applied** | suppressed (relation chance 0) |
| "Unauthorised Kill" relation loss (`PlayerKills`) | **still applied** (seen: -2 on AEL-112) | suppressed for the player's own kill. [inferred] Probably not when the player's AI ship lands the kill |
| Laser-tower relation boost for the victim (`move.flee`, `order.move.recon`) | applied | suppressed |
| Target's wing | `remove_object_commander` on the target each time it comes into view. Detaches a follower only; a wing **leader** keeps its escorts | same |
| Escorts | not covered: attacks and kills are unsanctioned, and they pay nothing | same |
| Duration | until the target is destroyed, or **3 h after purchase** (`SanctionAttack_Timeout`), or a newer sanction on the same ship replaces it | same |

Hidden conditions:
- The whole offer appears only at the Bounty Hunters representative or a `bountyhunters`-owned station's trade NPC, for an active Hunt whose target's true owner is a valid or plunderer faction (3119-3134).
- A tier you can't afford is simply not listed.
- After you buy a tier, the "Sanction my attacks on" line disappears only once **both** lists hold the idcode (3130-3132). So after partial it stays, offering only full.
- RAP also signals `md.kuertee_chc.Sanctions_SanctionAttacks` if kuertee's Crime Has Consequences is present (3441-3443, 3464-3466). It isn't part of SWI, so that's dead here.
- [inferred] Upgrading from partial to full may lose the sanction. `SanctionAttack` signals the ship so the older instance cleans up (6742), then waits 1 s before writing the lists (6745). The older `SanctionAttack_CleanUp` also waits 1 s (6788) before removing the idcode from **both** lists, so the two race. If the cleanup runs second, the target ends up unsanctioned. Check with the debug log's list lines after an upgrade (T19).

## 1. Paid options during a Hunt [read]

The sanction is the only paid option for a Hunt in SWI. EM itself takes no money anywhere (its only money action is `reward_player`, EM 7056). Guild access keys (silver/gold, more hunts per hour) exist in RAP but are hidden in SWI (`$convo_isShowAccessKeys`, RAP 3071-3093; [swi-bounty.md](swi-bounty.md) §5.3). The "Download the reports from this mission" button on a map offer is free (§4.2).

### Where it's offered

`Guilds_ConvoStart_20220707` (RAP ~3115-3150). In SWI mode the NPC must be `faction.bountyhunters.representative`, or the trade NPC of a station owned by `bountyhunters` (RAP 3119-3124). For each active Hunt whose target isn't already in both sanction lists (3131-3132), and whose target's **true owner** is a valid or plunderer faction (3134), it adds a choice through `Guilds_ConvoStart_SactionAttacks` (3217-3228):

- `{161815,712}` "Sanction my attacks on: %1(ship)" (text 5451).

Choosing it (`kProfs_bh_immunities_step_1_ship`, RAP 3409-3425) offers whichever you can afford and don't already have:

- `{161815,720}` "Partial immunity. No retaliations.: %s(cost)" (text 5459), shown if the idcode isn't in `$sanctionedAttackIds` and you have the money (3414-3417).
- `{161815,721}` "Full immunity. No retaliations and intact relationships.: %s(cost)" (text 5460), shown if it isn't in `$sanctionedKillIds` (3420-3423).

### Cost formula

Computed once per mission, the first time the conversation runs (RAP 3135-3144), and stored on the hunt cue:

- partial = vanilla `Reward_Money(level.easy, 1, target.trueowner)` → `Apply_RewardMultiplier` → `$kProfs_sanctionCost_partial`;
- full = `Reward_Money(level.hard, 1, target.trueowner)` → `Apply_RewardMultiplier` → `$kProfs_sanctionCost_full`.

The relation boost in `Reward_Money` uses the **target's** faction's relation to the player (param 4). For AEL-112 the save holds partial **39,700 Cr** and full **1,151,670 Cr** ([save-check-ael-112.md](save-check-ael-112.md) §2).

### Payment and confirmation

- Partial (`kProfs_bh_immunities_step_2_partial`, RAP 3426-3446): `transfer_money` from the player to the NPC's owner (or `VerboseTransactionLog` with description 803 "Immunity for attacks", if that mod exists), then signals `SanctionAttack` with `$sanctionType = partial` (3444). The NPC says `{161815,713}` "Remember that this will prevent their faction from retaliating but your relationship will suffer." (text 5453).
- Full (3448-3469): same, with description 804 "Immunity for attacks and intact relationships" and `$sanctionType = full` (3467). The NPC says 722 "This will prevent their faction from retaliating and will also rectify the damage to your relationship." (text 5461).

### What each does in code

`Sanctions` (RAP 6723) keeps two idcode lists in `global.$kProfs_Sanctions` (6729-6731). `SanctionAttack` (6734-6760): partial adds the idcode to `$sanctionedAttackIds`; full adds it to both lists. The lists are cleared when the ship is destroyed, after 3 h, or when a newer sanction replaces it (`SanctionAttack_CleanUp` 6776-6797, `_Timeout` 6799).

| Hook (SWI diff) | Reads | Effect |
| --- | --- | --- |
| `notifications.xml` `AttackResponse` (474-480) | either list | station/police NPC uses the "refuse to retaliate" use case |
| `notifications.xml` `IllegalActivityRetaliate` (489-516) | attack list → police chance 0; kill list → relation chance 0 | no police call (partial); no "Unauthorised Attack" relation loss (full only) |
| `notifications.xml` `PlayerKills` condition (450-459) | **kill list only** | skips vanilla `change_relation_on_kill` ("Unauthorised Kill", vanilla `md/notifications.xml` 1715-1740; reason text `{20217,600}`) for the player's own kills. Full only |
| `aiscripts/move.seekenemies.xml` 37-38, 50-51; `order.move.recon.xml` 47-48 | either list | NPC patrols ignore the `police` signal about that victim |
| `aiscripts/move.flee.xml` 16, 20; `order.move.recon.xml` 63, 67 | kill list | no laser-tower relation boost for the victim |
| `SanctionAttack_Visible` (RAP 6762-6774) | n/a | the wing detach, below |

## 2. The wing detach [read]

```xml
<cue name="SanctionAttack_Visible" instantiate="true">          <!-- RAP 6762 -->
  <conditions>
    <event_object_changed_attention object="$ship" />
    <check_value value="event.param ge attention.visible" />
    <check_value value="event.param2 lt attention.visible" />
  </conditions>
  <actions>
    <do_if value="$ship.commander">
      <remove_object_commander object="$ship"/>                <!-- RAP 6771 -->
```

Both partial and full set this up. Whenever the sanctioned ship comes into the player's visible attention, it is removed from **its own commander**. The comment at RAP 6727-6728 shows the intent: "they are removed from groups automatically". Nothing else in RAP or EM touches commanders or subordinates for a Hunt (the only `remove_object_commander` is 6771; EM's `.subordinates` uses at 8983 and 10782-10958 belong to other missions).

### Why it didn't happen on AEL-112

The target was the **leader**, not a follower.

- In the quicksave from before the fight (`quicksave.xml.gz`, game time 18,310.4, save line 5213501), AEL-112 (`[0x2b696]`) has the default order Patrol and the job `newrepublic_mixed_patrol_s` (5213749). Three ships list `commander="[0x2b696]"`, with job `newrepublic_mixedfighters_escort` and default order Escort:
  - ZRT-957, `t65xj3_xwing_macro` (5214284, 5214482);
  - RNS-504, `t65xj3_xwing_macro` (5214940, 5215138);
  - NHJ-691, `ewing_macro` (5215568, 5215779).
- SWI's `ext/libraries/jobs.xml`: `newrepublic_mixed_patrol_s` (6768) has `<subordinate job="newrepublic_mixedfighters_escort" />`, and that job (6920) is Escort, pointguard formation, `quota wing="3"`.
- The debug log has nine `SanctionAttack_Visible` lines for AEL-112, from 18,215.53 to 18,680.95, and **every one says `commander: null`**. The `do_if` was false each time, so nothing was removed.
- Vanilla `order.fight.escort.xml` listens for `event_object_attacked object="$target"` (1428, 2408), so the escorts engage whoever attacks their leader. They did: NHJ-691 attacked the player's N-1 HJE-131 at 18,442.9 (logbook).

So the detach only works for a target that has a commander. To split a leader from its wing, the code would also need to detach the leader's subordinates (for example `remove_object_commander` on each of `$ship.subordinates`), or give them other orders. It doesn't. The other conditions were all met: it fired, it was the right object, and the player was in the sector.

Is it a bug? It's a **design gap** [inferred]: the detach was written for wingmen and silently does nothing on a leader, which many patrol targets are. The player-facing text never mentions a split (712, 713, 720, 721 above), so the user's expectation isn't promised by the game. The sanction's idcode is also never extended to the subordinates, so even a full sanction wouldn't cover them.

## 3. The "Unauthorised Kill" on the target [read]

- The user bought **partial**. Debug log 16,707.40: `$sanctionedAttackIds: ['FZX-357','AEL-112']`, `$sanctionedKillIds: []`. At 16,706.40 there's an error about a missing voice for line `\713`, the partial confirmation line.
- Only the kill list blocks `PlayerKills`. So at 18,720.20 `Notifications.PlayerKills` ran for AEL-112 (debug log), and the relation went -0.006 → -0.008: logbook "Reputation lost: -2, Unauthorised Kill, Current reputation: -9".
- That matches the text: 720 says only "No retaliations", and 713 says "your relationship will suffer". **Working as designed.** A full sanction (1,151,670 Cr) would have blocked it.
- Caveat [inferred]: the hook sits on `PlayerKills`, which ran only for kills by the player's own ship. The two kills by the player's AI wingman (below) changed the relation with no `PlayerKills` line in the log, so the engine applies those itself. A full sanction would probably not cover a target killed by one of the player's AI ships.

## 4. The wingmen [read]

From the newest save (`save_007.xml.gz`, 2026-11-01 16:32:39, game time 19,948.4, streamed from a copy) and the debug log:

| Ship | Killed at | Killer | Logbook (New Republic) | Debug log |
| --- | --- | --- | --- | --- |
| ZRT-957 X-wing (escort) | 18,455.17 (wreck, save 12984708) | player's N-1 DBQ-259 `[0x55420]`, AI wingman | -3 Unauthorised Kill → -3 | relation 0 → -0.002; no `PlayerKills` line |
| RNS-504 X-wing (escort) | 18,470.04 (save 12985206) | DBQ-259 | -2 → -5 | -0.002 → -0.004; no `PlayerKills` line |
| NHJ-691 E-wing (escort) | 18,473.94 (save 12984988) | player's Fortitude RCD-681 `[0x55523]` | -2 → -7 | `PlayerKills` NHJ-691; -0.004 → -0.006 |
| AEL-112 B-wing (target) | 18,720.92, rammed (save 8116864) | RCD-681 | -2 → -9 | `PlayerKills` AEL-112; -0.006 → -0.008 |

- **Sanctioned?** No. Only AEL-112's idcode was in a list. Each escort kill cost relation. All three escorts died, so the whole wing was killed.
- **Paid?** No. The Hunt pays only for the mission target: `Reward_CalculateForKills` runs on the target alone, and the debrief's line is "1 killed / 1 x B-wing A/SF-01" and "Your Engagements: 1 x S ship (kills: 1)" (save check §2). The logbook has no other mission or bounty payment between 18,455 and 18,475. There was no police bounty either: New Republic isn't hostile and no licence pays for its ships.
- **Side effect in kuertee's silent reputation books:** RAP's `Attacker_Event` (RAP 5797-5829) counts a kill on a ship whose commander is a mission target as a kill "related" to the mission, and logged NHJ-691 as "Sanctioned kills" (Defender, from the Ascendancy) at 18,474.80. So RAP thinks of the escorts as part of the job, but only in its own reputation score. The vanilla relation still dropped. (Line 5800 also has `@target.commander` with a missing `$`; minor.)

## 5. Does the text or code imply the wing should be split off? [read]

- **Text: no.** 712 "Sanction my attacks on: %1(ship)", 720 "Partial immunity. No retaliations.", 721 "Full immunity. No retaliations and intact relationships.", 713/722 (the NPC's replies about retaliation and relationship), and 803/804 (the transaction descriptions). None mentions the wing, escorts or separation. The unused 711 "Sanction my attacks on my targets?" and 715 "Immunities from retaliations against you during Search And Destroy missions are now available." don't either.
- **Code: partly.** `SanctionAttack_Visible` and the comment at RAP 6727-6728 show kuertee meant a sanctioned ship to leave its group, so the player fights it alone without its fleet. That intent covers only a follower. A leader keeps its escorts.

## 6. Bugs and gaps found

1. The sanction's wing detach does nothing on a wing leader (RAP 6762-6774). The escorts stay, aren't sanctioned, and cost relation per kill.
2. The sanction covers one idcode, so a target's escorts are never sanctioned, partial or full.
3. [inferred] The full sanction's "intact relationships" hooks only `PlayerKills`. A kill by the player's AI ship may still cost relation.
4. RAP 5800: `@target.commander` (missing `$`) in `Attacker_Event`'s related-target test.
5. [inferred] Upgrading from partial to full may race the old instance's cleanup (RAP 6742-6745 versus 6788) and drop the idcode from both lists.
6. Already known: description line 512 "will not retaliate" checks `$kProfs_isSanctioned_*`, which nothing sets (EM 6749), so the mission never shows that it's sanctioned.

A patch could, in `SanctionAttack_Visible`, also `remove_object_commander` each of `$ship.subordinates`, or add the subordinates' idcodes to the same sanction lists. Untested.
