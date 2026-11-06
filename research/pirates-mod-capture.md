[Back to the bounty research](../bounty-research.md). Related: [player-fleet-per-size.md](https://github.com/ecarlste/x4-swi-bounty-hunter/blob/research/player-fleet-per-size/research/player-fleet-per-size.md) (#35), [swi-0.91-diff.md](swi-0.91-diff.md). Issue [#48](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/48), child of map [#1](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/1), for the hunting ladder (#36).

# Pirates mod capture: what ports to 8.00 + SWI (2026-11-05)

Question: what does the user's own mod, A Pirate's Life (`~/workspace/x4-pirates-life-mod`, X4 9.xx), already have for capturing ships (S/M, and anything for L/XL) and for taking people prisoner? What would porting each piece into `swibh` on X4 8.00 + SWI 0.91 HF1 take?

Sources. `PL` = the pirates repo at commit `bf25224` (2026-10-30), read only. `V8` = vanilla 8.00 `base/` at `E:\x4-dev\reference\x4-8.00`; `V9` = vanilla 9.00 at `E:\x4-dev\reference\x4-9.00`. `SWI` = SWI 0.91 HF1 `ext02/` at `E:\x4-dev\reference\mods\swi-0.91hf1` (all scripts moved to `ext_02` in 0.91, see [swi-0.91-diff.md](swi-0.91-diff.md)). Script actions and events were checked by name in each version's `libraries/md.xsd`, `aiscripts.xsd`, `common.xsd` and `scriptproperties.xml`. Patch selectors were checked against the V8 and SWI files with grep. Nothing was run in game. Tags: **[read]** = seen in the files; **[inferred]** = reasoning, to check in game.

## Short answer

| Piece | What it does | Ports to 8.00 + SWI? | Work in `swibh` |
|---|---|---|---|
| Bail hook (`md/apirateslife_bail.xml`, `md/notifications.xml` diff) | Every bail check runs through a library that returns a new chance (now x2, x4 for capture-wing members); every bail signals `Bailed` | **Yes, both hook points match SWI's Enhanced Bailing** | Small (~60 lines). Drop the x4 wing bonus: SWI's formula has no ÷4 for wingmen. Retune or drop the x2 |
| Intact on pilot bail (same diff, `$damageminpercent` and `$scuttle`) | Stops vanilla's hull drop and sabotage when the pilot bails | **Not needed, and would not apply**: SWI's bail has neither step | None. Note SWI destroys unclaimed bailed ships after 30-70 min |
| Intact on marine claim (`aiscripts/move.claim.xml` diff) | Marines claim without hull or equipment damage | **Yes as is**: both selectors match V8; SWI doesn't patch `move.claim` | Tiny (~20 lines plus a setting) |
| Capture operation (`md/apirateslife_capture.xml`, `aiscripts/order.apirateslife.capture.xml`, `md/conversations.xml` and `aiscripts/fight.attack.object.fighter.xml` diffs) | Comm choice "capture" on a hostile pilot; wingmen break the hull to 75%, then only strip shields, no missiles; mission readout; outcomes | **Mostly**. MD, order and comm patch work on 8.00. The no-missiles patch does **not** match 8.00's fighter script and needs rewriting. The readout assumes vanilla's 30 s cooldown (SWI uses 5 s) | Medium (~500 lines incl. texts). Rewrite 2 selectors, retune readout and the wing bonus |
| Pirated-ship mark (`md/apirateslife_pirated.xml`) | Marks every ship the player gains as taken by bail, by boarding, or donated | **Yes as is**: all events exist in 8.00 | Small (~140 lines); useful for a "brought in alive" log event |
| L/XL capture | **Nothing built.** Capture operations refuse capital ships (`not $Target.iscapitalship`); boarding is only marked, using vanilla's own boarding | n/a | Under SWI, civilian L/XL can bail their pilot (SWI dropped vanilla's capital exclusion); military L/XL never do (SWI keeps 50% crew). Military L/XL means vanilla boarding (`order.fight.board`, `md/boarding.xml` exist in 8.00) |
| Taking prisoners | **Nothing built.** Planned as slice 5 "M capture with prisoners, ransom and laundering" | n/a | New work. 8.00 has the building blocks: `entityrole.prisoner`, `create_npc_template`, `transfer_people` (vanilla `move.claim` already takes a marine prisoner this way) |

So: the S/M pieces port with small changes and one rewritten patch. There is nothing to port for L/XL or prisoners; both would be new work in `swibh`, and SWI already changes the L/XL picture.

## 1. Bail hook [read]

**What it does.** `PL md/notifications.xml` 6-12 adds `run_actions md.APiratesLife_Bail.AdjustEjectChance` just before vanilla's roll, `do_if[@chance='if not $testcheat? then $ejectchance else 100']` inside `PlayerOwnedShipAttacks`. `PL md/apirateslife_bail.xml` 8-45 is that library: x4 for a capture-operation member while the player leads it in the target's sector (21-32), then x2 capped at 100 (35), a debug line, a `BailChecked` metrics signal, and returns the chance. `PL md/notifications.xml` 38-40 signals `md.APiratesLife_Bail.Bailed` with attacker, target, crew count and pilot-bail flag before `do_if[@value='$eject?']/remove_value[@name='$numcrewbailing']`; the `Bailed` cue (`apirateslife_bail.xml` 48-55) only logs.

**Depends on.** Vanilla's bail cue `PlayerOwnedShipAttacks` (`V8 md/notifications.xml` 1185; roll at 1276). The capture-operation table `global.$APiratesLife_CaptureOps`.

**On 8.00 + SWI.** SWI replaces the whole `do_if[@value='$target.iscapturable']` block of that cue with "Enhanced Bailing" (`SWI md/notifications.xml` 44-310). Its roll is still `<do_if value="true" chance="if not $testcheat? then $ejectchance else 100">` (108) and it still has `<do_if value="$eject?">` … `<remove_value name="$numcrewbailing"/>` (187, 196), so **both PL selectors match the SWI tree** [read]. `swibh` declares `<dependency id="SW Interworlds"/>` (`extension/swibh/content.xml`), so it loads after SWI and its diff applies to SWI's version; T12 showed the same holds for patches on SWI's EM file [inferred from T12].

What changes under SWI [read, SWI md/notifications.xml]:
- Formula (72-104): base 11 + up to 10 for missing crew + up to 10 for attacker-vs-target hull/shield + 0 to 10 for size difference − pilot morale × 1.75, minimum 1; halved for S/M combat ships (103). **No ÷4 for attackers the player isn't flying.** So PL's x4 wing bonus, which only undoes vanilla's ÷4, would over-boost wingmen under SWI and should go.
- Cooldown: `$nextcapturechance = player.age + 5s` (170), not vanilla's 30 s.
- Gates unchanged: shields < 20% and hull < 75%, not docked, capital ships need crew (56).
- Pilot bail (157): when the bailing batch covers all crew and the target isn't player-owned. Vanilla's "not a capital ship" and "attacker is player-owned or has a claim response" conditions are commented out (156).
- Large military ships (147-154: types expeditionary, scavenger, destroyer, frigate, carrier, battleship, resupplier, builder, class L or XL) never lose more than half their crew capacity, so their pilot never bails.

**Port.** Copy the two `add`s and the library; delete the wing x4 block; decide whether x2 stays (SWI's chances are already tuned by the SWI team). About 60 lines. If the hunt only needs "a target bailed" as a log event, the `Bailed` signal alone is ~10 lines [inferred].

## 2. Intact on pilot bail [read]

**What it does.** `PL md/notifications.xml` 21-35 sets `$damageminpercent` to 100 and `$scuttle` to false after vanilla sets them, so a bailing pilot doesn't drop the hull to about (100 − skill)% or sabotage weapons. Switch: `global.$APiratesLife_IntactOnEject`.

**On 8.00 + SWI.** V8 has `$damageminpercent` (1297) but no `$scuttle` variable (the 9.00 name); SWI's replacement has neither: the hull line is commented out (`SWI md/notifications.xml` 160) and the sabotage loop is empty (250-253). Both PL selectors would match nothing and log a patch error. SWI's pilot bail already leaves hull and equipment alone; it does remove part of the cargo, scaled by pilot skill, and plays the scuttle effect (234-246).

SWI adds one thing a hunter must know: every bailed ship goes on `static.$bailListJA` with a lifetime of 30-70 min (73-74, 271-280). On each later bail, ships past their lifetime that aren't player-owned are **destroyed** (289-300). An unclaimed prize can vanish [read; when exactly depends on when the next bail anywhere happens, inferred].

**Port.** Nothing to port.

## 3. Intact on marine claim [read]

**What it does.** `PL aiscripts/move.claim.xml` 7-24 sets `$damagemaxpercent` to 0 right after vanilla computes it, in both attention levels, so the claiming marine's hull and equipment damage (`100 − marine skill`) is skipped. Switch: `global.$APiratesLife_IntactOnClaim`.

**On 8.00 + SWI.** `V8 aiscripts/move.claim.xml` has both targets: `attention min="visible"` (22) with `set_value $damagemaxpercent` at 116, and `attention min="unknown"` (162) at 227. V8 and V9 differ by 4 lines only. SWI ships no `move.claim` patch. Ports unchanged.

**Port.** ~20 lines plus a config global. Only relevant if the player claims bailed ships with marines.

## 4. Capture operation (S/M) [read]

**What it does** (spec: `PL docs/specs/capture-operation.md`):
- `PL md/conversations.xml` 4-36 patches vanilla `DefaultComm`: asks `CanStart` before vanilla hangs up on a hostile pilot, keeps the line open if a capture may start, adds the choice `g_apirateslife_capture`, and names the section in `SectionHandler`.
- `PL md/apirateslife_capture.xml`: `CanStart` (17-30) needs a piloted, capturable ship that **isn't a capital ship**, isn't the player's or ownerless, while the player flies a ship. `Operation` (53-253) gives each wingman of `player.occupiedship` in the sector the order `APiratesLife_Capture`, keeps `global.$APiratesLife_CaptureOps.{$Target}`, applies "mark as hostile" (`set_relation_boost` -1), creates a fight mission with three objectives. A 1 s `Tick` ends it as destroyed, captured, abandoned, called off or escaped (15 km for 30 s), and shows what the next bail check needs (shields below 20%, hull below 75%, then the 30 s cooldown, 163-193). `End` clears the table, resets the boost on escape or call-off, and signals `Ended`.
- `PL aiscripts/order.apirateslife.capture.xml`: break (fire while hull ≥ 75%), suppress (fire only to knock shields down, stopping while shields still hold about 1.5 s of the wingman's laser DPS), floor (no fire at ≤ 35%). Uses vanilla `order.fight.attack.object`, hull and shield damage interrupts, `stop_shooting`, `cease_fire`, evasive `move_to`. Sets `this.$APiratesLife_NoMissiles` while running.
- `PL aiscripts/fight.attack.object.fighter.xml` 7-16: reads that flag to skip missile passes in sight and missile damage out of sight.
- Tested in the user's 9.00 game: S target with player plus 3 wingmen, M target (6 crew) with 6 wingmen (`PL docs/research/spike-1-bailing-boarding.md` 77-82).

**Depends on.** Actions and events all exist in 8.00 by name: `set_relation_boost`, `reset_relation_boost`, `cease_fire`, `stop_shooting`, `select_flight_behaviour`, `set_to_default_flight_control_model`, `abort_called_scripts`, `event_object_hull_damaged`, `event_object_shield_damaged`, `event_conversation_next_section`, `add_player_choice`; properties `iscapitalship`, `iscapturable`, `mayattack`, `defencenpc`, `dps.lasers` [read: V8 xsd and scriptproperties]. Texts in `PL t/0001-l044.xml` (page 1774100).

**On 8.00 + SWI.**
- `md/conversations.xml`: V8 and V9 are identical (empty diff), so all PL selectors match [read]. SWI's diff replaces `DefaultComm`'s `$maysurrender` (`SWI md/conversations.xml` 6-9: drops vanilla's S/M-only limit, hull below 50%), which PL doesn't touch; no conflict [read].
- `aiscripts/fight.attack.object.fighter.xml`: **both PL selectors fail on 8.00.** In sight, V8 line 331 reads `… or (this.ship.dps.missiles.all gt 0 and player.age gt $delaymissiles))` with no `not $firestorpedo? and` (that's 9.00, V9 374). Out of sight, V8 has no `$firemissiles` / `not $firestorpedo? or …` block (V9 562); missile damage comes from `get_attackstrength`'s `missileresult` (V8 650-656). The port needs the 8.00 string for the first and, for the second, an `add` after `get_attackstrength` that zeroes the missile results while the flag is set [read; the fix is inferred]. SWI's own diff on this file only adds a speed check before a `do_if` in the unknown-attention loop (`SWI aiscripts/fight.attack.object.fighter.xml` 3-7), so no overlap [read].
- The readout's step 3 assumes a 30 s cooldown; SWI uses 5 s, so the bar would be wrong and checks come six times as often [read]. The wing x4 in the bail hook should go (section 1).
- `CanStart` refuses capital ships, which is right for vanilla but leaves out the civilian L/XL that SWI lets bail [read].

**Port.** About 290 + 190 + 40 + 20 lines plus texts; rewrite 2 selectors; change the readout to SWI's 5 s; drop or retune the wing x4. Medium. For a bounty hunter, the "capture" comm choice could become "surrender or die", with the same wing logic [inferred].

## 5. Pirated-ship mark [read]

**What it does.** `PL md/apirateslife_pirated.xml`: records bails with a player-owned attacker (from `Bailed`, 69-83) and player boarding operations (`event_boarding_operation_created`, 85-93); on `event_contained_object_changed_true_owner` to the player (95-141) it marks the ship `'bail'`, `'boarding'` (also ships docked at a boarded ship) or a donation, and signals `Decided`.

**On 8.00.** `event_boarding_operation_created` and `event_contained_object_changed_true_owner` exist in V8's `md.xsd` [read]. No SWI file overlaps. Ports as is, ~140 lines. It needs the `Bailed` signal from section 1.

## 6. L/XL capture [read]

PL has **no L/XL capture code.** `CanStart` excludes capital ships (`PL md/apirateslife_capture.xml` 28). L/XL only appear as booty sizes (`PL md/apirateslife_booty.xml` 168-180, 238) and as boarding marks (section 5). The plan lists them as future work: "Boarding (L/XL): the full flow…" (spike checklist), slice 7 "L boarding through Hunt Large Targets", Phase 3 "XL capture set pieces", Phase 5 "SWI profile … including XXL capture tiers" (`PL docs/IMPLEMENTATION_PLAN.md` 61, 114, 120, 137). The spike says boarding research "hasn't started" (`PL docs/research/spike-1-bailing-boarding.md` 3, 99).

What 8.00 + SWI offer instead:
- **Civilian L/XL can be bailed under SWI**: SWI removed vanilla's capital-ship exclusion from pilot bails (`SWI md/notifications.xml` 156-157) and from surrender (`SWI md/conversations.xml` 7-8). A freighter, miner or tender at < 20% shields and < 75% hull can lose all crew and its pilot [read]. A capture operation would need `CanStart` to allow capital ships, and enough firepower to strip L shields without killing the hull [inferred].
- **Military L/XL can't be bailed**: they keep at least half their crew capacity (`SWI md/notifications.xml` 147-154) [read]. That leaves vanilla boarding: `V8 aiscripts/order.fight.board.xml`, `boarding.pod.xml`, `md/boarding.xml`, and `create_boarding_operation` in V8's `md.xsd` [read]. SWI only adds kuertee Professions hooks to the boarding missions (`SWI md/rml_board_ship.xml`, `gm_board_ship.xml`) [read].

## 7. Taking prisoners [read]

PL has **nothing** for prisoners: no script uses `prisoner`; the only hits are design text (`PL docs/DESIGN.md` 48, 129, 177) and plan items "5. M capture with prisoners, ransom and laundering" and "Prison break custom start" (`PL docs/IMPLEMENTATION_PLAN.md` 112, Phase 3). The booty handover's "pilot moves to a marine slot" (`PL md/apirateslife_booty.xml` 415-451) moves the **player's own** prize pilot, not a captive.

Building blocks in 8.00 [read]:
- `entityrole.prisoner` (`V8 libraries/common.xsd` 3515).
- Vanilla `move.claim` already takes a prisoner: when a marine boards a ship that someone else owns, it runs `create_npc_template … role="entityrole.prisoner"` on the marine's ship and `transfer_people` (`V8 aiscripts/move.claim.xml` 90-96, 203-209).
- `gm_prisonbreak.xml` puts a client into a `tag.prisoner` slot with `set_entity_role … entityrole.prisoner` (`V8 md/gm_prisonbreak.xml` 617-619); the Split and Tides of Avarice stories use the role too.
- SWI has a "CIS prisoner" game start (`SWI md/setup_gamestarts_sw.xml` 1642) but no prisoner mechanic for the player [read: grep].

A "bring the target in alive" feature (e.g. the target's pilot as a prisoner on the player's ship, handed in for the bounty) would be new `swibh` work: catch the bail or boarding, put the target's pilot NPC on the player's ship as `entityrole.prisoner`, and add a hand-in at a station. Rough size: medium, a few hundred lines; whether a bailed pilot can be picked up depends on whether `eject_people` leaves real spacesuits (SWI's calls pass no `spacesuit` flag, `SWI md/notifications.xml` 189-194) [inferred, check in game].

## What to check in game

- The PL bail hook on SWI: both inserts apply (no patch errors) and the `Bailed` signal fires on an SWI bail.
- A civilian L under SWI bailing its pilot at the gates.
- SWI's 30-70 min self-destruct on an unclaimed bailed ship.
- Whether bailed NPC crew and pilots leave spacesuits that can be picked up (for prisoners).
