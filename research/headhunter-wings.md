[Back to the Head Hunter inventory](headhunter.md). Related: [wing-split-facts.md](wing-split-facts.md), [hunt-protection-ael-112.md](hunt-protection-ael-112.md).

# Head Hunter - Reloaded: wings, surrender and odds (2026-11-01)

Question: what does Head Hunter - Reloaded (`ice_headhunter` 1.01) do about a target's wing, surrender or hailing, and fleet-strength odds, and what can we borrow for our design? The design: when the player comes into range of a hunt target that leads a wing, each wingman either bails or stays loyal. Loyal wingmen cost no faction relation and add to the bounty at less than full value. The bail chance may depend on the size of the player's wing. The player may also hail the target with "give up or die".

Source: `Ice Headhunter 2289 1.01 2026-08-09T23-56Z LQxlx1JCN.zip` from Downloads. Its `ext_01.cat/.dat` was unpacked into the scratchpad (`.../scratchpad/hh/`) and only read. Abbreviations are the same as in [headhunter.md](headhunter.md): `MD` = `md/ice_headhunter_md.xml`, `HUNT` = `md/ice_headhunter_hunted.xml`, `AI` = `aiscripts/headhunter.assassinate.xml`. `V8` = vanilla 8.00 `base/` (`E:\x4-dev\reference\x4-8.00`), `SWI` = SWI 0.90 `ext/` (`E:\x4-dev\reference\mods\swi-0.90`). The Nexus description wasn't checked; the code answers every point. Tags: [read] = seen in the files; [inferred] = reasoning only.

## Short answer

| Point | Does Head Hunter do it? |
|---|---|
| 1. Target wings and escorts | **No wing logic for targets.** Targets aren't spawned: any existing ship that kills becomes wanted, alone. Its escorts aren't wanted, aren't split and have no morale. The only wing-aware lines give a drone's kill or claim to its commander. Escorts pay only through the separate "general bounty" for any hostile ship the player attacked. HH doesn't avoid relation penalties for the player: it adds none and removes none. |
| 2. Hail, surrender, intimidation | **Only the reverse direction:** the player can pay **hunters** to stand down (a bribe). Wanted targets can't be hailed into surrendering. A wanted S/M ship whose crew bails (vanilla's bail) just has its bounty cleared, with no pay (a bug). |
| 3. Odds from fleet strength | **Yes, for hunters only:** a hunter group mirrors the player's combat ships near the target, one S per S, one M per M, one L per L and three L per XL, capped by a difficulty setting. Their equipment tier depends on the bounty. Morale isn't involved. |
| 4. NPC hunters after the player | Yes: a wing with a leader and subordinates on `assignment.attack`, made hostile by a **per-object relation boost**, not a faction change. Killing hunters costs no relation (`set_object_relation_behaviour disable`). They break off and leave with `MoveDie` when the target dies, or when the player bribes them. |
| 5. Port to 8.00 + SWI | Every MD/AI action used here exists in 8.00 ([headhunter.md](headhunter.md), per-feature table). Only the faction roster and `tag.military` ships need SWI changes. |

## 1. How Head Hunter treats a target's wing [read]

- **No spawned targets.** Wanted targets are ordinary ships that killed something (`MD` `WantedDestructionTracker` 627-726, `PlayerWantedDeathTracker` 388-487). Nothing spawns a target, gives it escorts or looks at its `subordinates`. `subordinates` and `commander` appear in the MD file only at:
  - `MD` 535-536: when the module killer is a drone, the bounty goes to `event.param.commander`;
  - `MD` 739-745: when the killer of a wanted ship is a drone, the claim goes to the drone's commander.
- **Escorts are separate ships.** A leader's escorts get a wanted entry only if they made kills themselves. Killing the leader doesn't touch them. Head Hunter never splits, detaches or re-orders a target's wing.
- **No morale or bail of its own.** Bail-outs come from vanilla/SWI (see point 2). HH only reacts to `event_object_abandoned` on wanted ships (`MD` 945-966 `SCapturedHandler`): it removes the bounty and plays `PayoutEffect` (voice only). `$rewardCr` is computed at 953 but never transferred.
- **Pay for escorts:** only through the *general bounty* (`MD` `HHAttackTagger` 5-38, `DeathWatcher` 53-92). Any S-XL ship that is `ishostileto.{faction.player}` (line 22), was attacked by a player asset and dies within 600 s pays `random(0.5..1.0) × (shield + hull) × $HeadHunterBountyMultiplier`, from `faction.civilian` (76-85). The killer isn't checked. So hostile escorts each pay a small HP-based amount, separate from the wanted bounty.
- **Relations:** HH doesn't protect the player. Attacking a non-hostile wanted ship triggers vanilla's normal relation and police response. `PlayerWantedAttackTracker` (`MD` 359-387) even makes the *player's* ship wanted if that victim dies. The only relation HH adds is a gain: `add_faction_relation` toward the victim's faction when a wanted bounty is claimed (`MD` 759, at most 0.02), plus the general-bounty gain toward the sector owner (60-69, probably null; see headhunter.md feature 2).

## 2. Hail, surrender and intimidation [read]

- **The bribe is the only conversation hook.** `HUNT` `StartTalk` 407-423 fires on `event_conversation_started conversation="default"` / `event_conversation_returned_to_section section="default"` when the hailed ship is in `$HHHunters` (413). The NPC says 10101 and gets a choice, "Payoff Bounty ... <amount> Cr" (`add_player_choice`, 421, `TXT` 137). `PayoffBounty` 424-486: if `player.money ge` the bounty, `transfer_money` from the player to the hunter's owner (439). Every hunter then gets `reset_relation_boost`, `cease_fire`, a `'stop attack'` signal to its L defence NPC, and a `MoveDie` to a random non-player station (441-460). The wanted entry is deleted (460-464) and the NPC says 10102. If the player can't pay, the NPC says 10103 (474-478). **The outcome is purely "can you afford it"**, with no skill, morale or odds roll.
- **No surrender of wanted targets.** HH adds no choices to a wanted ship's conversation and has no eject, pay or capture logic for targets. Capture or abandonment only clears the bounty: `LCapturedHandler` 907-924 (L/XL `event_object_claimed`), `WantedShipBoardedByPlayerHandler` 925-944 and `SCapturedHandler` 945-966.

### What already exists in vanilla 8.00 and SWI (not Head Hunter, but this is the system HH relies on)

- **The vanilla "surrender" hail.** `V8` `md/conversations.xml` 22-24 sets `$surrenderoption`: the player is piloting, the NPC is a pilot and the target is at visible attention. It sets `$maysurrender`: S/M, capturable, shields below 20 %, hull below 75 % and `$nextcapturechance` passed. Lines 118-124 add the "Surrender!" choice (`{1002,12005}`) leading to `g_surrender` or `g_surrender_nope`. At 659-664, `g_surrender` signals the bail roll and `g_surrender_nope` gets line 5036 ("finds it funny").
- **The bail roll** is `V8` `md/notifications.xml` `PlayerOwnedShipAttacks` (1185). It runs on `event_player_owned_attacked_object`, on the `'shouldwebail'` signal from `aiscripts/interrupt.attacked.xml` 281-285 (NPC-vs-NPC attacks), and on the surrender demand. The surrender path first gates on crew morale at 1258: `people.count / capacity < (16 - pilot.skill.morale) / 16`. The vanilla chance is at 1264: `(46 - combinedskill/5) × min(target.maxhull / attacker.maxhull, 1) × min(attacker HP% / target HP%, 1)`, divided by 4 if the player isn't flying. When all crew bail, a non-capital S/M ship is abandoned by its pilot (1294-1300), and HH's `event_object_abandoned` handlers see that.
- **SWI replaces that block** (`SWI` `md/notifications.xml` 45, `<replace sel="//cue[@name='PlayerOwnedShipAttacks']/actions/do_if[@value='$target.iscapturable']">`) with "EnhancedBail" (62-110). It computes `11 + crew-missing (0-10) + attacker/target HP ratio (≤10) + size gap (0/3.33/6.66/10) - 1.75 × pilot morale`, with a minimum of 1, halved for S/M combat ship types. The survival window is 30-70 min.
- **What it means for us [inferred]:** a "give up or die" hail can reuse the vanilla `default` conversation hook (like HH's `StartTalk`), add our own choice for hunt targets, and decide with our own roll. The vanilla and SWI rolls only apply to S/M ships that are already damaged, and they are about crew ejecting, not the ship surrendering intact.

## 3. Morale or odds from fleet strength [read]

- **Hunter sizing** (`HUNT` 160-224) is the only odds mechanic. `find_gravidar_contact` from the target lists player-owned ships in the same sector within `$playertarget.currentradarrange` (165-174), with the target added (176). Each one with `primarypurpose == purpose.fight` adds S→1 S, M→1 M, L→1 L or XL→3 L (181-198). The cap `$HeadHunterHunterSpawnLimit` (3/5/10/15/0) fills L first, then M, then S (203-224). The bounty sets the equipment tier: more than 1 M is tier 2, more than 5 M is tier 3 (225-230; mods at 316-348).
- No morale anywhere in HH. `pilot.skill.morale` and `combinedskill` aren't read. Gravidar counting by class and purpose is the whole "strength" model.
- **To borrow:** the same `find_gravidar_contact` + `primarypurpose == purpose.fight` count, run around the *player* instead, gives our "size of the player's wing" input. Weighting S=1, M=2-3, L=6+ is closer to real strength than HH's 1:1 [inferred]. For each wingman, combine it with `pilot.skill.morale` (as vanilla/SWI do) for the bail roll.

## 4. NPC hunters after the player [read]

- `HUNT` `HunterTimer` 22-76, `SpawnHunters` 77-283 and `HuntersCreated` 284-372 are covered in [headhunter.md](headhunter.md) features 11-14. The parts relevant to wings:
  - **Wing structure:** hunters are sorted by `value` (354). The most valuable leads. The rest get `set_object_commander ... assignment="assignment.attack"` (355-359), and only the leader runs the `HeadHunter` order (361-366).
  - **Hostile without a faction change:** `AI` 53 and 68 call `set_relation_boost object=<ship> faction="faction.player" value="-1" decay="1" delay="10min" silent="true"` on the leader and each subordinate when a wanted player ship shows on gravidar. The Attack orders use `checkrelation=false` (61, 76). The boost is undone with `reset_relation_boost` (`HUNT` 443, 502).
  - **Killing them is free:** `set_object_relation_behaviour object="$hunter" disable="true"` (`HUNT` 300, and on defence drones at 309). `V8` common.xsd 33827-33830 documents this as "Set relation change behaviour for an object when attacked or killed ... true = disabled".
  - **Break-off:** `cease_fire`, `reset_relation_boost`, then `MoveDie` (`atstation` = a random non-player station, `byhighway` for S/M, `byhostile=true`), skipped while boarding (`HUNT` 441-460 bribe, 498-519 target gone).
  - Known bug: the subordinate loop gives `Attack` to the leader each time (`AI` 54-63).

## 5. Porting to 8.00 + SWI

| Piece | APIs | 8.00 | SWI | Note |
|---|---|---|---|---|
| Per-ship hostility (`set_relation_boost` / `reset_relation_boost`) | `V8` common.xsd 34955 / 32103 | yes | yes | Engine actions |
| No relation loss on kill (`set_object_relation_behaviour`) | common.xsd 33827 | yes | yes [inferred] | Needs a test: does it also stop SWI's "Unauthorised Kill" (-2) and the escorts' -7 seen in AEL-112? Those come from SWI/RAP scripts, not only the engine |
| Wing re-order (`set_object_commander`, `cease_fire`, `create_order MoveDie/Attack`) | see wing-split-facts.md §2 | yes | yes | `MoveDie` is a good "bail" exit |
| Hail hook (`event_conversation_started conversation="default"`, `add_player_choice`, `event_conversation_next_section`) | md.xsd | yes | yes | Voice lines 10101-10103 and 5036/5037 are unchecked in SWI (headhunter.md open question 8) |
| Crew bail (`eject_people`, `event_object_abandoned`) | common.xsd 26108 | yes | yes; SWI's EnhancedBail replaces the vanilla roll | Our wingman "bail" should be a flee (orders), not `eject_people`, unless we want abandoned ships to claim |
| Strength count (`find_gravidar_contact`, `primarypurpose`, `isclass`) | md.xsd, scriptproperties | yes | yes | |
| Pay (`transfer_money from="faction.civilian"`) | | yes | yes (`civilian` exists in SWI) | For a hunt, pay through SWI's hunt reward instead, mind the L/XL cap (cap-fix-facts.md) |
| Hunter factions and `tag.military` ships | data | yes | **no**: the vanilla factions are inactive | Use `blacksun`, `huttcartel`, `mandodw` or `valarian` (headhunter.md, feature 12) |

Nothing in these pieces needs 9.00. The 9.00-only APIs are all in HH's Lua board ([headhunter.md](headhunter.md) summary).

## Worth borrowing for our design

1. **Loyal wingmen:** `set_relation_boost -1` (hostile to the player only) plus `set_object_relation_behaviour disable=true` (killing them costs no relation), as HH does for hunters. This is the closest existing pattern to "loyal ones cost no faction relation". Test it against SWI's own relation hits first.
2. **Bailing wingmen:** the HH break-off, `cease_fire` + `remove_object_commander` + `MoveDie byhostile=true`, plus the order replacement from wing-split-facts.md §2.
3. **Bail odds:** a gravidar count of the player's `purpose.fight` ships by class (`HUNT` 165-198). Combine it per wingman with `pilot.skill.morale`, in the style of SWI's EnhancedBail.
4. **Bounty for loyal wingmen:** HH's general bounty, `0.5-1.0 × (shield+hull) × multiplier` (`MD` 76-78), is a ready per-ship "less than full value" formula. Or use a fixed fraction of the target's hunt reward.
5. **"Give up or die" hail:** follow `StartTalk`/`PayoffBounty` (a `default` conversation hook + `add_player_choice` + next-section cue). Decide the outcome with our own odds roll, not with money as HH does. The vanilla surrender option (`conversations.xml` 22-24, 118-124) shows the conditions to stay consistent with.
6. **Don't copy:** abandoned wanted ships paying nothing (`MD` 953), the subordinate-attack bug (`AI` 54-63), and `destroy_group` despawns.
