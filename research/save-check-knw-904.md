# Save check: "Search and destroy: NRL Escort MC40A (KNW-904)"

Save: `save_007.xml.gz` (scratch copy), X4 8.00 + SWI 0.90. EM = `ext/md/kuertee_emergent_missions.xml`.
Save line numbers are from the decompressed stream (`zcat | sed -n`). Tags: [read] = seen in save/code, [inferred] = reasoned.

## 1. Mission cue (md cue `810659`) [read]
- `<mission id="810659" ... faction="ascendancy" group="bountyHunters_guild" level="hard" rewardtext="Reward: 35,835.00 Cr + up to 1,141,130.00 Cr">` (save line 23735304). Briefing: talkto, find, scan, destroy, talkto. The current objective is find (step 2).
- The cue's vars are at `<md>/<script name="kuertee_emergent_missions">/.../<cue id="810659" state="complete" time="6767.682"><vars>` (line 23728380):
  - `$MissionId` = "kEM_Hunt_21", `$kEMissionType` = 106, `$Faction` = ascendancy, `$OpposingFaction` = newrepublic, `$Difficulty` = hard.
  - `$MissionTarget` = `[0x4449f]`. `$Ship` = `[0x1943a]` (the offer station, not the target).
  - `$IsDisguised` = null/false. `$isTargetAttackedByPlayer` = null. `$PlayerDamageAndKillsData` = null.
  - `$Objective_Step` = 2, and every `*_success` flag is null.
  - `$timer_find_end` = 18195.66. That is 7395.66 (accept time) + 3 h.
  - `$RewardCr` = 1, a placeholder that line 5694 overwrites.
  - `$RewardText` -> string ref 1752 = "Reward: 35,835.00 Cr + up to 1,141,130.00 Cr".
  - `$BaseRewardData` -> table ref 3185 (`<refs type="table">`):
    - `$reward_forTarget` = money 114113000 ct (1,141,130 Cr);
    - `$reward_forTargetKills` = money 3583500 ct (35,835 Cr).
- No DamageCalculator data for this ship exists in the save. No table anywhere uses the keys `$damage_total` or `$size`. The player has not damaged it yet.
- `$TargetKillsDescription` = "1 x S ship". So 35,835 = 0.5 × the S class reward (≈71.7k) (EM 6648-6663).

## 2. Target ship `[0x4449f]` [read]
- `<component class="ship_l" macro="mc40a_macro" code="KNW-904" owner="newrepublic" ...>` (line 8470574).
  - It has no cover-owner attribute, which matches `$IsDisguised` = false.
  - It leads the job `newrepublic_mixedfighters_escort`.
- **Not disguised**: the Scan objective is always in the briefing (EM 5607). On find, the mission goes straight to Destroy (EM 6125-6131), and the identify flag is set there (EM 5903).
- **Size is not stored** in this save (it is after the find step, section 6). The macro is at `assets/units/size_l/macros/mc40a_macro.xml`, and its component is at `assets/units/size_l/mc40a.xml`. Both are indexed in `starwarsmod_m1/ext_01.cat`, but **`ext_01.dat` is absent** from the reference copy, so the dimensions can't be read there. The automated test `t01_knw904` read it in game: **`size` = 1,296.5** [seen].

## 3. Settings [read]
- `kEMissions` cue `808354`: `$IsSWIExists` = 1, so the cap at EM 5683 runs.
- `UserSettings` cue `808352` (v9):
  - `$rewardMult` = 50.0 (float);
  - `$isUseFullMod` = 0;
  - all `$debugChance*` = 0.

## 4. Payout at resolve [read code, numbers inferred]
Steps in order, all on success:
1. Entering Destroy **re-rolls** `$BaseRewardData` (EM 5896), with a new random factor and relation boost.
2. `Reward_CalculateForKills` (EM 5670 -> 7079) **re-rolls** the L class reward:
   - × damage% / 100 (EM 7146);
   - × 1.25 if it is a player kill (EM 7157-7166). A player kill means the killer is player-owned or player damage ≥ 75 (EM 9422).
3. Cap (EM 5683-5692 -> 7340-7375): cap = `size × 5`. The result is converted with `()ct`, so it is in **ct**, not Cr.
4. `$RewardCr` = sum (EM 5694). `Mission_Complete` then does `reward_player money=$RewardCr` (EM 7056).

Nothing multiplies the payout after the cap:
- `$rewardMult` is not applied to hunts. Its line is commented out (EM 7335), and it is used only in the per-macro text (EM 7189).
- Notoriety (EM 5699) changes faction relation, not money.

Predictions. `t01_knw904` (`make game-test`, 2026-10-31) spawned `mc40a_macro` (class `ship_l`, size 1,296.5) and ran SWI's `CapRewardBasedOnMissionTarget` with the offer's numbers [seen]:

| Case | Uncapped (offer values) | Capped parts | Paid (EM 5694) |
|---|---|---|---|
| 100% damage, player kill | 35,835 + 1,141,130 × 1.25 = 1,462,247.50 Cr | 158 + 6,323 ct | **6,481 ct = 64.81 Cr** |
| 10% damage, another ship kills | 35,835 + 114,113 = 149,948 Cr | 1,549 + 4,933 ct | **6,482 ct = 64.82 Cr** |

The cap is 1,296.5 × 5 = 6,482.5. Each part is cut to whole ct on its own (`()ct` drops the fraction: 158.86 → 158, 6,323.64 → 6,323), so the total is always 6,481 or 6,482 ct. Which one depends on the split, so the re-rolls in steps 1 and 2 can move it by 1 ct but no further [read code, numbers seen].

A 0% share (no damage) fails the mission and pays 0 (EM 5676).

## 5. Why the offer shows 1,141,130 [read]
- Text 503 is built in `Mission_Hunt_GetMissionTexts` (EM 6805) from the pre-cap `$BaseRewardData`. It is stored as `$RewardText` (EM 5327) and passed to `create_offer` (EM 5342) and `create_mission` (EM 5603).
- No later `update_mission` sets `rewardtext` (EM 5716, 5772 update only `description`).
- The cap runs only inside Resolve, after the text exists. Only the post-resolve description and logbook (EM 6760-6763, 574/496) show the capped total.

## Encyclopedia check (2026-10-31)

The in-game encyclopedia entry "MC40A Light Cruiser" confirms Ship Size **L**, Ship Type Carrier, Max Hull 525,000 MJ, 7 shield generators, 7 large turrets, 150 missiles, 4 S docks, 10 ship storage, 15 drones, mass 235 t, produced by New Republic [seen]. It doesn't show length; the automated test read `size` = 1,296.5 (section 4).

## 6. After the find step (second save, 2026-10-31)

Save: `save_007.xml.gz` again (the game reused the name), copied as `save_007_afterfind.xml.gz`, same `<save name="Bankrupt Bounty Hunter Test 1">`, game time 8,090.8 (the first copy was 7,417.3). Cue ids are renumbered on every save: the hunt cue is now `787304` (it was `810659`), same `$MissionId` "kEM_Hunt_21" vars, same `$MissionTarget` `[0x4449f]` [read].

| | First save (7,417 s) | After find (8,091 s) |
|---|---|---|
| `$Objective_Step` | 2 (find) | **4 (destroy)**; the briefing's destroy objective is `active="1"` |
| `$Objective_Step_find_success` | null | **1** |
| `$Objective_Step_identify_success` | null | **1** (set on find, as EM 5903 does for an undisguised target) |
| `$timer_find_end` | 18,195.66 (accept + 3 h) | **18,793.50** = 7,993.50 + 3 h, so the timer was reset at about 7,993 s, when the find step ended |
| `$BaseRewardData` | 35,835 + 1,141,130 Cr | **40,185 + 1,079,330 Cr** (re-rolled on entering Destroy, EM 5896) |
| Mission description | "35,835 … about 1,141,130" | "You will be rewarded 40,185.00 Cr and … about 1,079,330.00 Cr" |
| `$RewardText` (offer line) | 35,835 + up to 1,141,130 | unchanged; still the offer's numbers (section 5) |
| `$attacker_largest` / class | not set | `[0x4449f]` / `ship_l` |
| `$LastKnownDatas` | the station report | unchanged: "-32524.715, 3058.138, 2021.696" in Gyndine, from station `[0x1943a]`; no new report |
| `$beacons_lastKnown` | group | empty group |
| `$isTargetAttackedByPlayer`, `$PlayerDamageAndKillsData` | null | null |
| `$RewardCr` | 1 | 1 (still the placeholder) |

**Damage calculator.** The target is now in EM's `DamageCalculator` (`$dmgAndKillsDataByIdCode`, key "$KNW-904"): `$class` ship_l, `$macro` mc40a_macro, `$faction` newrepublic, `$hull` 100.0, `$damage_total` null (0), `$isPlayerKilled` null, `$killer` null, `$cues` = [the hunt cue], `$cues_playerKill` empty, and **`$size` = 1,296.5 (length)**, the same number the automated test read [read]. So the cap at resolve will use 1,296.5.

**Target.** Still `mc40a_macro` KNW-904, owner newrepublic, leading the same `newrepublic_mixedfighters_escort` wing. No hull or shield damage is stored in its component (no damage entries, matching `$hull` 100) [read]. It has moved inside Gyndine (`swi_clustergyndine_sector001_macro`, `[0x43eff]`): from about (-5,208, 1,611, -33,444) in zone 001 to a temp zone, about (-98,819, 2,473, -44,860) in sector coordinates, flying at about 125 m/s [read; sector position inferred from zone offset + ship offset].

**Player.** Same ship, `fortitude_macro` RCD-681. In the first save it was docked in Millagro; now it's in space in Gyndine at about (-103,547, 2,746, -46,005), **about 4.9 km from the target** [read; distance inferred]. Its weapons' shoot controllers have KNW-904 as their target (started 8,061.3 s), but nothing has hit it yet. The `<player money>` value is unchanged (419,566) [read].

**Payout prediction.** Nothing here changes it. With the re-rolled 40,185 + 1,079,330 Cr: 100% damage and a player kill gives 187.50 + 6,295.00 → 187 + 6,295 = **6,482 ct = 64.82 Cr**; 10% damage, 1,758.73 + 4,723.77 → **6,481 ct = 64.81 Cr** [inferred from the code and the test]. Resolve re-rolls the kill reward again (section 4, step 2), but every split pays 6,481 or 6,482 ct. Doing no damage still fails the mission and pays 0.
