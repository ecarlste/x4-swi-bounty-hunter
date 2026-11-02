# Save check: "Search and destroy: NRL Patrol B-wing (AEL-112)"

Save: `save_007.xml.gz` (the game reused the name again), mtime **2026-11-01 16:26:10 -0700**, copied to a scratch folder and streamed. `<save name="Bankrupt Bounty Hunter Test 1">`, game time 19,578.2. X4 8.00 + SWI 0.90. EM = `ext/md/kuertee_emergent_missions.xml`.
Save line numbers are from the decompressed stream (`zcat | sed -n`). Tags: [read] = seen in save/log, [inferred] = reasoned.

Mission: Imperial Ascendancy, Bounty Hunters Guild (`bountyHunters_guild`), medium, `$MissionId` "kEM_Hunt_133", `$kEMissionType` 106. Target `[0x2b696]` = `bwing_macro` AEL-112, class `ship_s`, owner newrepublic. Contact Leila Nakamura (`[0x1c502a]`).

## 1. Result: paid 220,810.00 Cr, the same as the briefing [read]

| Source | Value |
|---|---|
| Logbook, missions, t = 19,520.052 (save line 22304625) | "Reward for NRL Patrol B-wing (AEL-112) kills: 124,785.00 Cr. Your Engagements: 1 x S ship (kills: 1). Reward for NRL Patrol B-wing (AEL-112) destruction: 96,025.00 Cr. Total reward: 220,810.00 Cr." `money="22081000"` |
| Ticker, t = 19,520.117 | "Payment received: 220,810 Cr. New balance is 1,432,673 Cr" |
| Hunt cue `759826` (state complete, t = 16,063.852), `$RewardCr` | money 22,081,000 ct = **220,810.00 Cr** |
| `<player money>` in the save header | 1,432,673 |
| Balance before payout (ticker, t = 19,317.9) | 1,211,863 Cr; 1,211,863 + 220,810 = 1,432,673 |

The paid amount matches the projected 220,810.00 Cr exactly. No cap was applied: the target is S class, and `CapRewardBasedOnMissionTarget` caps only L/XL (`$CappedRewards` equals `$BaseRewardData`).

## 2. The hunt cue's vars (cue `759826`, save line ~24719510) [read]

- `$Result` = success, `$Objective_Step` = 6 (complete), `find`/`identify`/`destroy` `_success` = 1. `$IsDisguised` null.
- `$isTargetAttackedByPlayer` = 1. `$RewardNotoriety` = `$Reward_Notoriety__Result` = 0.004.
- `$BaseRewardData` (table 20684): `$reward_forTarget` = 9,602,500 ct (96,025 Cr), `$reward_forTargetKills` = 12,478,500 ct (124,785 Cr).
- `$CappedRewards` (table 33403): `$RewardForTarget` = 12,478,500 ct, `$RewardForPlayerKills` = 9,602,500 ct. Same two numbers, but the key names are swapped relative to `$BaseRewardData` (worth a look by whoever reconstructs the formula). The sum is unchanged.
- `$PlayerDamageAndKillsData` (table 33402): `$reward` = 9,602,500 ct (96,025 Cr), `$difficulty_max` = easy, `$description_damageAndKillsByMacro` = "1 killed / 1 x B-wing A/SF-01: your kills: 1, your damage: 100 / 100: 48,012.50 Cr.", `$description_damageAndKillsByClass` = "Your Engagements: 1 x S ship (kills: 1)."
  - 96,025 = 2 × 48,012.50 [inferred]. The per-macro line is half the destruction reward.
- `$RewardText` (the offer line) = "Reward: 107,665.00 Cr + up to 70,260.00 Cr". The mission texts' `$rewardText` = "Reward: 124,785.00 Cr + up to 96,025.00 Cr". So the reward was re-rolled on entering Destroy (EM 5896), as with KNW-904, and the briefing showed the re-rolled values.
- `$TargetKillsDescription` = "1 x M ship" (the target's own kill record, which sets the kills reward), while the debrief's engagement line says "1 x S ship (kills: 1)" (the player's engagement).
- `$kProfs_sanctionCost_full` = 115,167,000 ct (1,151,670 Cr), `$kProfs_sanctionCost_partial` = 3,970,000 ct (39,700 Cr).
- `$timer_find_end` = 29,484.968.

**DamageCalculator entry** (table 20685): `$class` ship_s, `$macro` bwing_macro, `$idCode` AEL-112, `$faction` newrepublic, `$damage_total` = 105.091, `$isPlayerKilled` = 1, `$killer` = "Fortitude-class", `$hull` null, **`$size` = 45.6172**.

## 3. How it died [read]

The wreck (`[0x2b696]`, save line 8094798, `state="wreck"`) has `attacker="[0x55523]" attackmethod="collided" attacktime="18720.92"`. `[0x55523]` is the player's `fortitude_macro` RCD-681. The kill was a collision (ram) with the player's ship, and it counted as a player kill.

## 4. Relations [read]

- **Imperial Ascendancy** (`ascendancy`, logbook faction `{999840,504110}`): logbook "Reputation gained: +5. Reason: Mission Completed. Current reputation: -1" at 19,520.052. Player relation is now -0.005. There's a booster of -0.001 dated 19,520.052. It was -6 before the turn-in; no earlier Ascendancy entry is in the logbook.
- **New Republic** (`newrepublic`, `{999840,502110}`): the kill itself cost "Reputation lost: -2, Unauthorised Kill, Current reputation: -9" at 18,720.196. The debug log has "relationship with New Republic was neutral(-0.006) and is now neutral(-0.008)". This happened even though the guild had sanctioned the attack (debug log 16,707.40: `Sanctions.$sanctionedAttackIds: ['FZX-357','AEL-112']`, `$sanctionedKillIds: []`). The sanction covered the attack but not the kill. Three earlier -3/-2/-2 "Unauthorised Kill" losses at 18,455-18,475 are from other NR ships.
- kuertee professions (debug log 19,520.05): Bounty Hunter points 24 → 32, and the Ascendancy's Bounty Hunter score 9 → 10.

## 5. Active missions [read]

`<missions>` (save line 24725801) contains only "Assign or hire a Builder" (upkeep). **AEL-112 is gone from the active missions.** The cue is `state="complete"`, and its sub-cues are waiting or complete.

## 6. Debug log [read]

There's no `debuglog.txt` in a profile-id folder for this save. Its saves are in `X4\save\`, and its log is `C:\Users\ecarl\OneDrive\Documents\Egosoft\X4\debuglog.txt`, last written 2026-11-01 16:26 ("Logfile started Sun Nov 01 15:11:01 2026", 56,590 lines, ends at game time ~19,618). The profile folders' logs (28456535, 90000001, 90000201) are older (2026-10-31 and earlier).

- No `CapRewardBasedOnMissionTarget` lines (expected for an S target), and no lines about the payout amount.
- AEL-112 lines: `RegisterMissionTargets` at 16,107.43 (acceptance), `Guilds_ConvoStart_SactionAttacks` at 16,699.60, `SanctionAttack` at 16,707.40, `SanctionAttack_Visible` at 18,670 and 18,681, `Notifications.PlayerKills` at 18,720.20 (the kill), and conversation with Leila Nakamura at 19,517.87, then the profession updates at 19,520.05.
- `kuertee_emergent_missions` errors:
  - 18,216.08 `Mission_Hunt_TargetFound_20220119`: "Property lookup failed: md.kuertee_npc_bridge_crew" (EM line 6121, `signal_cue_instantly`). This is the find step of this mission. The optional bridge-crew mod isn't installed, and the error is harmless (the mission went on to complete).
  - 15,925.92 (load) `AIPilotOrders_InteractMenu`: `md.Interact_Menu_API` missing.
  - 18 × `kuertee_professions.CleanMissionTargets` "Failed to remove table[...]" at load.
  - Nothing else from EM besides SectorRaid debug chatter.
