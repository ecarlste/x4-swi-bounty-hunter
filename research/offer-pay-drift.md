# Why a hunt's pay changed between the board and the accepted mission

Question from playtest #4 (2026-11-03), hunt 1: the IMP board at the Bounty Hunters wharf in Celanon offered "Search and destroy: BLS Mercenary Kihraxz (WCP-957)" for 28,421.25 Cr + up to 73,510 Cr. After accepting, Guild Missions showed 27,622.50 Cr + up to 71,570 Cr (ratios 0.9719 and 0.9736).

EM = `ext/md/kuertee_emergent_missions.xml` in the unpacked SWI 0.90 (`/mnt/e/x4-dev/reference/mods/swi-0.90`). Vanilla = `base/md/lib_reward_balancing.xml` in the unpacked 8.00. Tags: [read] = seen in code, [inferred] = reasoned. Builds on [hunt-pay-ael-112.md](hunt-pay-ael-112.md), which covers the pay formula and the re-rolls after accepting.

## Short answer

Accepting does not recalculate the pay, and nothing in the hunt code decays an offer over time. The reward text is computed once, when the offer is created, and `create_mission` reuses that same text on accept [read].

So the offer the player accepted was not the offer first seen. It was a new offer for the same target. SWI deletes every open hunt offer and creates fresh ones each time the player picks a faction and a size class in the Guild trade NPC's conversation (and deletes them when the player leaves the station). Each new offer rolls both pay parts again with vanilla's random `Reward_Money`. Most likely the player went through the IMP > "Small and medium-sized targets" conversation a second time (or left and came back) before accepting [read for the mechanism, inferred for this playtest].

The two parts dropped by different ratios because they are separate random rolls. Nothing ties them together. Both falling about 2.8% is a coincidence, or partly a small drop in the player's relation to IMP, which scales every roll (see below).

The paid amount will differ again: the target part is rolled again on entering Destroy and again at the debrief (with the damage share and the 1.25 kill bonus), and the kills part is rolled again on entering Destroy and then fixed. See [hunt-pay-ael-112.md](hunt-pay-ael-112.md).

## Evidence

### The reward text is fixed at offer creation [read]

- Offer setup: `Mission_Hunt_GetBaseRewardData` (EM 5315) → `Mission_Hunt_GetMissionTexts` (5321) → `$RewardText = $MissionTexts.$rewardText` (5327) → `create_offer ... rewardtext="$RewardText"` (5333-5342).
- The text is built from text 503, "Reward: %s(base) + up to %s(bonus)" (EM 6805; `ext/t/0001.xml` line 5227). The UI adds its own "Reward:" label, which is the "Reward: Reward:" bug.
- Accept: the UI signals `'accept'` to the client (`Mission_Hunt_Accept`, EM 5567-5576), which leads to `Mission_Hunt_CreateMission` (5588). It rebuilds only the description (5597-5600) and calls `create_mission ... rewardtext="$RewardText"` (5601-5603): the same variable, no new roll. It does not call `Mission_Hunt_GetBaseRewardData`.
- The only other text updates are `update_offer` / `update_mission` with `description=` only (5716, 5768, 5772). Nothing in the hunt (EM ~5200-7500) uses `Apply_TimeBonusCr` or any time factor; the only `relationto` check is the offer gate at 5222.

### Offers are deleted and recreated by the conversation [read]

- `Bounties_Convo_Next` (EM 12091-12124): choosing a size class (`kEM_bounties_byClass`, 12106) first sends `Bounties_Convo_Next_remove_mission_offers` (12107), then calls `Missions_Hunts_CreateOffer` for every target in the list (12110-12117) and opens the map on the offers (12121).
- `Mission_Hunt_CleanUp` (EM 5497-5545) runs on that signal when SWI is present and the full mod is off (5507-5511), or when the player leaves a station (`K_ArriveAndLeaveStations` with `$leaveFrom`, 5503-5506), but only for offers that are not accepted missions (5513-5514). It calls `remove_offer` (5535) and then cancels the mission cue (5560).
- `Missions_Hunts_CreateOffer` (EM 5213) → `Mission_Hunt` → the setup above, so each recreated offer rolls its pay again. The target and its kill record are the same, so the board looks the same apart from the numbers.

### Every pay value is a fresh random roll [read]

- `Mission_Hunt_GetBaseRewardData` (EM 6643-6693): kills part = 0.5 × Σ (class roll × kills of that class) (6649-6662); "up to" = one roll for the target's own class (6665-6687).
- Each roll: `GetRewardDataForClassKill` (EM 7271) → `GetRewardForLevel` (7313) → vanilla `Reward_Money` (285) → `Apply_RewardMultiplier` (240, ×1.0 here; SWI's kRAP +1 needs `$MissionGroup`, which is unset in this library).
- `Reward_Money`: base × uniform 24,000-26,000 (vanilla 295), then × uniform-ish between `$RelationBoost` and 1.3 × `$RelationBoost`, weighted toward the low end (342, `profile="decreasing"`), then rounded down to 10 Cr (345). No seed, so each call is independent.
- For an S target (easy, level 10) the base is 1.4 × 1.9 = 2.66, so the "up to" range is 63,840-89,908 Cr × boost when boost = 1. Both 73,510 and 71,570 fit. They are both multiples of 10, as the rounding predicts.
- The kills part is not a multiple of 5 (28,421.25 × 2 = 56,842.50) because kills by the target's subordinates count 0.25 (EM 11436-11437). So the kills part is a weighted sum of several separate rolls, and its ratio has no reason to match the target roll's ratio.

### Relation is the only shared factor [read, effect inferred]

`$RelationBoost` uses the offering faction's relation to the player (vanilla 333 for easy: 1 + relation / 0.1, clamped to 1-2; medium at 322, hard at 311). It scales the roll range for every class at once. If the player's IMP relation fell slightly between the two offer generations (for example a decaying temporary boost), every roll's range would shift down by the same factor. The rolls would still scatter randomly around it, so this can't produce two exactly equal ratios either. With relation at or below 0, the boost is clamped at 1 and relation has no effect.

## Unverified, and how to check

1. **That the offer was recreated.** Not observed. Check in game: open the IMP > S/M offers, note the numbers, talk to the trade NPC and pick IMP > S/M again. The numbers for the same targets should change. Leaving the station should remove the open offers. If the numbers change without either action, this explanation is wrong.
2. **That accepting keeps the text.** Accept an offer right after noting its numbers, without re-opening the conversation. The Guild Missions entry should match the board exactly.
3. **Relation drift.** Compare the player's IMP relation (Factions menu, or `relationto` in a save's faction block) before and after. Only matters if IMP relation is above 0 (easy boost) or above 0.01 (medium).
4. **In a save.** The accepted mission's cue keeps `$BaseRewardData` (`$reward_forTargetKills`, `$reward_forTarget`) and `$RewardText`. A save taken before re-opening the conversation and one after would show different values for a new offer cue with a higher `$MissionId` (counter at EM 5229) for the same target. With `UserSettings.$debugChance_missionHunt` on, the debug log prints both values at each offer creation (EM 5318-5319).
5. **Final pay.** Log the debrief amount for hunt 1 and compare with 27,622.50 + 71,570. Expect both parts to differ, per [hunt-pay-ael-112.md](hunt-pay-ael-112.md).
