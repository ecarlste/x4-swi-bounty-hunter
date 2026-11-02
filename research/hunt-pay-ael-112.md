# Hunt pay check: "Search and destroy: NRL Patrol B-wing (AEL-112)"

A Bounty Hunters Guild hunt flown by the user on 2026-11-01, X4 8.00 HF4 + SWI 0.90. Offering faction Imperial Ascendancy, difficulty Medium. This file rebuilds every number on the two screenshots from SWI's code. It's a manual data point for T02 (S/M pay formula, [test-plan.md](../test-plan.md#t02-sm-hunt-pay-against-the-formula)).

EM = `ext/md/kuertee_emergent_missions.xml` in the unpacked SWI 0.90 (`E:\x4-dev\reference\mods\swi-0.90`). Vanilla = `base/md/lib_reward_balancing.xml` in the unpacked 8.00. Tags: [read] = seen in code or on screen, [inferred] = reasoned.

## Screenshots

- [Mission list and objectives](screenshots/ael-112-bwing-mission.png): list reward "107,665.00 Cr + up to 70,260.00 Cr"; description "You will be rewarded 124,785.00 Cr and ... about 72,210.00 Cr"; target's kills "1 x M ship"; objectives 1-4 completed, "5: Talk to: Leila Nakamura" open.
- [Mission briefing](screenshots/ael-112-bwing-briefing.png): "Operation results: 1 killed / 1 x B-wing A/SF-01: your kills: 1, your damage: 100 / 100: 48,012.50 Cr." Then "Reward for ... kills: 124,785.00 Cr", "Reward for ... destruction: 96,025.00 Cr", "Total reward: 220,810.00 Cr".

## 1. The target is S class, so the cap doesn't run [read]

- "B-wing A/SF-01" is text `{999840,100410}` (`ext/t/0001.xml` 81), used by ware `bwing` → `bwing_macro` (`ext/libraries/wares.xml` 608-616).
- `assets/units/size_s/macros/bwing_macro.xml` (in the installed `extensions/starwarsmod_m1/ext_01.dat`; read by offset from `ext_01.cat`, nothing written to the install): `<macro name="bwing_macro" class="ship_s">`, hull 19,500. The only other B-wing macro is `bwing_menu_macro`.
- `CapRewardBasedOnMissionTarget` (EM 7340) is called at resolve (EM 5683-5692), but it sets `$rewardCap_mult` = 0 (7352) and only raises it for `ship_l` (5, line 7354) or `ship_xl` (2, line 7357). For an S ship the `do_if value="$rewardCap_mult"` is false, so both parts pass through unchanged.
- The difficulty is Medium because only L/XL targets get `level.hard` (EM 5288-5291). The offer splits by "small and medium" versus "large", so this S ship sits in the S/M list.

## 2. Where each number comes from

### Class reward is a fresh random roll on every call [read]

`GetRewardDataForClassKill` (EM 7271) → `GetRewardForLevel` (7313) → vanilla `Reward_Money` (285-350) → `Apply_RewardMultiplier` (240). Each call rolls again:

- `GetValue_Credits` (vanilla 51-104): difficulty factor × (1 + 0.1 × (level − 1)). S = easy, level 10 → 1.4 × 1.9 = 2.66. M = medium, level 1 → 8.
- × random 24,000-26,000 (vanilla 295);
- × relation boost (easy: 1→2 as the offering faction's relation goes 0→0.1; medium: 1→2 between 0.01 and 0.1), then × random 1-1.3 with a decreasing profile (vanilla 342);
- rounded down to 10 Cr (vanilla 345);
- `Apply_RewardMultiplier`: 1.0. SWI's kRAP diff (`ext/md/lib_reward_balancing.xml`) adds +1 for easy difficulty only when `$MissionGroup` is a guild group. `GetRewardForLevel` doesn't pass `$MissionGroup`, and the numbers below confirm the +1 isn't there: with it, the smallest possible S roll would be 127,680.
- The `$rewardMult` line is commented out (EM 7334-7336).

So an S roll without relation boost is 63,840-89,900 Cr, and an M roll 192,000-270,400 Cr. Every number below fits, and all end in 0.

| Moment | Call | S roll (target) | M roll (the 1 M kill) |
| --- | --- | --- | --- |
| Offer created | `Mission_Hunt_GetBaseRewardData` (EM 5315) | 70,260 | 215,330 |
| Entering Destroy (after Find, or after Scan if disguised) | `Mission_Hunt_GetBaseRewardData` again (EM 5897) | 72,210 | 249,570 |
| Debrief (resolve) | `Reward_CalculateForKills` (EM 5670 → 7130) | 76,820 | not rolled again |

### Offer "107,665 + up to 70,260" [read]

`Mission_Hunt_GetBaseRewardData` (EM 6643):
- kills part = 0.5 × Σ (class roll × target's kills of that class against the offering faction) (6648-6662): 0.5 × 215,330 × 1 = **107,665**;
- "up to" = one roll of the target's class (6668-6687): **70,260**.

The list's reward text is set once by `create_offer` / `create_mission` (`rewardtext`, EM 5334, 5601) and never updated: `update_mission` only changes the description (5716, 5772). So the list keeps showing the offer roll.

### Description "124,785 ... about 72,210" [read]

`Mission_Hunt_ObjectiveDestroy` re-runs `Mission_Hunt_GetBaseRewardData` (EM 5897) and stores it in `$BaseRewardData`. Kills part 0.5 × 249,570 = **124,785**; target part **72,210**. The description is rebuilt from it (6748, text 521). The user saw it change after Find; for a disguised target it changes after the Scan. The kills part is now fixed: resolve uses this stored `$BaseRewardData.$reward_forTargetKills` and doesn't roll it again.

### "48,012.50 Cr" on the Operation results line [read]

`Reward_CalculateForKills` (EM 7079), at resolve:
- rolls the target class again (7130): 76,820;
- `$damage` = min(100, your damage) = 100 (7143), so `$reward_thisEnemy` = 100/100 × 76,820 = 76,820 (7146);
- player kill, and S is in `$allowedClasses` (7156): × 1.25 (7165) = **96,025**.

The per-ship text line then shows `$data.$reward × $rewardMult / 100` (7189), and `$rewardMult` is 50 in this save (EM 170), so it prints 96,025 × 0.5 = **48,012.50**. The comment above it (7188) says the multiplier "will be applied when the total reward is given", but it never is (7334-7336 commented out; resolve adds the parts unscaled at 5694). So this line is display-only and shows half the real figure. "your damage: 100 / 100" is min(damage, 100 × your kills) (7126).

### "Destruction 96,025", "Total 220,810" [read]

`Mission_Hunt_Resolve` (EM 5630):
- `$PlayerDamageAndKillsData.$reward` = 96,025 (5670);
- cap skipped for an S target (section 1);
- `$BaseRewardData.$reward_forTarget` = 96,025 (5693), which is the "destruction" line (text 574, 6760);
- `$RewardCr` = 124,785 + 96,025 = **220,810** (5694);
- `Mission_Complete` → `reward_player money="$Cue_Mission.$RewardCr"` (7056). No multiplier is applied between 5694 and 7056.

So 96,025 is exactly 2 × 48,012.50 only because the display line halves it. The 1.25 kill bonus explains why 96,025 is above the 72,210 estimate (76,820 × 1.25), together with the third roll (76,820 versus 72,210).

## 3. Is 220,810 the payout? [read code; payout not yet seen]

Yes: **220,810 Cr** is what the code pays. Nothing at the debrief changes it: the "talk to" choice signals `Mission_Hunt_ObjectiveComplete` (EM 6460-6462), which signals `Mission_Hunt_Resolve` (5940), which computes and pays in one block (5667-5697). Notoriety goes to the Ascendancy separately (5699-5701).

One oddity to check: the "Operation results" block and the totals are written only by `Mission_Hunt_GetMissionTexts`' end-of-mission branch (6750-6765), which needs `$Objective_Step` ≥ 6 and `$Result` = success. The step becomes 6 in `Mission_Hunt_ObjectiveComplete`, which exists only to signal resolve (5926-5942), and the success result and `$RewardCr` are set only inside `Mission_Hunt_Resolve`, which pays before it rewrites the text (5694-5716). So by the code, the briefing screenshot was taken after the debrief, and the money is already paid. The mission stays in the list until you leave the station (`Mission_Hunt_CleanUp`, EM 5497), which may be why the open "Talk to" objective still showed in the other screenshot. Check the player's money history or the logbook's Missions entry (EM 7429-7430, with the money attached) for 220,810 Cr.

## 4. Against the research

- Matches [swi-bounty.md](swi-bounty.md) §4.4: kills part, damage share, × 1.25, no `$rewardMult` on pay, kRAP guild multiplier not applied, cap only for L/XL.
- Adds: each class value is re-rolled at offer, on entering Destroy and at resolve, so "up to" is an estimate rather than a maximum (here the paid target part, 96,025, was 37% above the offer's "up to"). The per-ship "Operation results" line shows half the real amount. Added to §4.4.
- Corrects [bounty-research.md](../bounty-research.md#a-hunt-start-to-finish): its pay line still said "then ×0.5 (EM's reward multiplier)". Fixed.
