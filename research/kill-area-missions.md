# Kill-in-area missions in vanilla and SWI

For [#76](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/76), feeding the **sector bounty** and **retainer** (GLOSSARY.md) and [#58 Head Hunter: general kill bounty](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/58). Read 2026-11-08.

Sources: vanilla X4 8.00 at `E:\x4-dev\reference\x4-8.00` (paths are under `base/md/` unless named). SWI 0.90 at `reference\mods\swi-0.90` (`ext/md/`). "EM" = SWI's `ext/md/kuertee_emergent_missions.xml`. EM line numbers are 0.90. In 0.91 HF1 (`ext02/md/`) they move by about +5, and `Reward_CalculateForKills` is unchanged (0.91 line 7084). Tags: [read] = seen in the files; [inferred] = follows from the code, not seen in game.

Related notes: [war-missions.md](https://github.com/ecarlste/x4-swi-bounty-hunter/blob/research/war-missions/research/war-missions.md) (Sector Raid and Mayday pay, the 50% `$rewardMult`), [dirty-jobs-missions.md](https://github.com/ecarlste/x4-swi-bounty-hunter/blob/research/dirty-jobs-missions/research/dirty-jobs-missions.md) (how a mod calls a GM `Start` with its own client), [vanilla-bounty.md](vanilla-bounty.md) (police kill bounty).

## Short answer

- **Four kill-in-area missions exist.** Vanilla has **Patrol** (`GM_Patrol` on `RML_Patrol`) and **Destroy matching objects** (`GM_Destroy_Matching_Objects` on `RML_Destroy_Matching_Objects`). SWI adds the EM **Support Raid / Support Patrol** (the Sector Raid family) and **Mayday**. Kill Masstraffic only counts ambient civilian traffic. [read]
- **Only the vanilla Patrol and the EM missions pay per kill by class.** Patrol adds a bonus per kill: XS ×1, S ×2, M ×3, L ×6, XL ×12, then ×2 for a warship. EM pays a class value × the player's hull-damage share, ×1.25 for the kill, ×0.5 in SWI. Destroy matching objects pays one flat reward for N kills. [read]
- **I found no "kill N Hutt pirates" mission in SWI 0.90.** The nearest are vanilla Patrol variant 2, "Uncover Pirates" (enemies = every faction tagged pirate), and the kuertee guild Patrol job. [read; inferred that SWI's Hutt pirates carry the pirate tag]
- **Vanilla libraries can take a `swibh` contact as client.** SWI's own kuertee guilds call `md.GM_Patrol.Start` with `Client = $npc`. EM's Sector Raid can't take one: it needs a real faction-AI subgoal cue and an L/XL lead ship. [read]
- **One kill can pay several missions.** None of these missions marks a kill as used. Each one listens to the kill events on its own. EM's shared damage table keeps a list of missions for each enemy, and every mission on that list pays its share. [read; inferred for real play]

## 1. Vanilla Patrol (`GM_Patrol` + `RML_Patrol`)

**Pay** [read]:
- Base pay is `Reward_Money / 3` (`gm_patrol.xml` 295–297). The per-kill unit `$BaseBonusCr` is a random value from `Reward_Money/26` to `Reward_Money/18` (299).
- `Reward_Money` = difficulty × level factor × 24,000–26,000 × relation boost × 1.0–1.3 (`lib_reward_balancing.xml` 51–107, 285–351). Medium difficulty = 8. Level factor = 1 + 0.1 × (level − 1). For medium missions the relation boost goes from ×1 to ×2 (330–337).
- Per kill, `EnemyFendedOff` (`gm_patrol.xml` 887–921) adds `$BaseBonusCr` × class (XL 12, L 6, M 3, S 2, XS 1). It doubles that if the ship's `primarypurpose` is fight.
- On success the mission pays `$RewardCr`, then `$BonusCr` (1050–1053).
- Worked numbers for variants 1 and 3 (medium, level 3, relation boost 1): base ≈ 80k Cr; one S fighter ≈ 37–56k; M ≈ 55–83k; L ≈ 110–170k; XL ≈ 220–330k. Variant 2 is level 10, so about 1.6× that. [inferred from the formulas]
- **Trap:** `$BaseBonusCr` is only set when the caller doesn't pass `RewardCr` (294–299). `EnemyFendedOff` needs it (890). So a caller that sets its own `RewardCr` turns per-kill pay off. [read]

**Scope and time** [read]:
- `EnemyFactions` is a faction or a list (`gm_patrol.xml` 191). `Destinations` is a list of `[target, offset, range, alias, objective, min time, max time, spawn offset]` (`rml_patrol.xml` 39–55). A sector target uses the whole sector.
- Enemies are fight-purpose, non-masstraffic, undocked ships whose true owner is in `EnemyFactions` and that are in the patrol space (`rml_patrol.xml` 471–482).
- Generated variants: variant 1 patrols stations, with enemies = the faction's `enemy` relation list (1301). Variant 2 is pirates (1441). Variant 3 patrols one sector for 20 min, with enemies = the `killmilitary` relation list (1605–1626). Variant 3's 20 min is the destination's min and max time, not a mission timeout.
- `MissionDuration` is a real timeout: the mission fails when it runs out (`gm_patrol.xml` 1002–1012). The generated variants don't set it.

**Kill crediting** (`PlayerKill`, `rml_patrol.xml` 655–724) [read]:
- A kill counts in two cases. (a) A ship in the tracked enemy group is destroyed and the killer `isplayerowned`, so wingmen count. (b) `event_player_killed_object` (kills from the ship the player is flying, `common.xsd` 15650–15653) of an object owned by an enemy faction. It must be in the current patrol area, or the previous one within the cutoff (350, 363).
- Both cases need `player.controlled`, so the player must be flying a ship (701). There's no damage share and no assist credit.
- Side bug: the captured-ship branch signals `cue="EscapedEnemySignalCue"`, a literal, not `$EscapedEnemySignalCue` (738). So that signal probably never reaches `GM_Patrol`. [read; effect inferred]

**SWI changes** [read]: `ext/md/gm_patrol.xml` raises `OfferDistance` to 350 km and adds a `MissionGroup` param and kuertee professions hooks. `ext/md/rml_patrol.xml` registers the RML with professions. The pay is unchanged.

## 2. Vanilla Destroy matching objects (`GM_Destroy_Matching_Objects` + `RML_Destroy_Matching_Objects`)

- **Unused in vanilla and in SWI 0.90.** The header says "intended for Master Missions" (`gm_destroy_matching_objects.xml` 7). Nothing calls its `Start` (grep of base, the DLCs and SWI). It's the closest thing to a ready-made "kill N of faction X" mission. [read]
- **Pay:** one flat reward, `Reward_Money` × multiplier (235–242), paid at the end (820–821). It isn't scaled by class. [read]
- **Scope:** `NumberOfTargets`, `TargetClasses`, `TargetMacros`, `TargetOwners`, `TargetRaces`, `TargetLocation`, `TargetDistance` (141–148). `MissionDuration` is a timeout that fails the mission (700–712). [read]
- **Location isn't enforced for kills.** `Filter_Location` only drives the fly-to guidance and objective (`rml_destroy_matching_objects.xml` 58–80, 102–124). The kill check (201–238) tests only class, macro and owner. So a matching kill anywhere counts. [read]
- **Crediting** (201–260): (a) a ship from `$KillTargets` destroyed by a player-owned killer. That group is only filled from ships within 15 km of `player.ship` in the player's sector (144–147). (b) Any `event_player_killed_object` that matches the filters. So a wingman's kill counts only if the target was near the player when the list was last refreshed. [read]
- Each kill signals `SignalCue_Kill` with the killed object (21, 263–265). A caller can pay per kill from that. [read]
- **Trap:** `EndAmount` "negative = the caller ends it" (20). But `FindTargets` loops `do_while $KillTargets.count gt $EndAmount` (180–183), so a negative value would never end that loop. So use a large positive `EndAmount` instead. [read; effect inferred]
- SWI only adds kuertee professions hooks and a 1 ms delay before cleanup (`ext/md/gm_destroy_matching_objects.xml`, `ext/md/rml_destroy_matching_objects.xml`). [read]

## 3. Other vanilla destroy missions (not area kills)

- **Kill Masstraffic** (`gm_killmasstraffic.xml`): kill N **masstraffic** ships in a radius. It counts only `event_player_killed_object` with `ismasstraffic`, and only `faction.criminal` unless `CivilianTraffic` (712–728). One flat reward (273–276). It doesn't count real faction fleets. [read]
- **Destroy Objects** (`gm_destroy_objects.xml`, used by the war guild for KillShip and DestroyFleet, `x4ep1_war_subscriptions.xml` 15462, 15738): a fixed target group with one flat reward (392, 1015). Its RML gives full credit for a player-owned killer, or for ≥80% of the damage. It gives partial credit for 40–80% (`rml_destroy_components.xml` 426–452). [read]
- **Support Invasion** (`gm_support_invasion.xml`): needs a live `FactionGoal_Invade_Space` cue as `InvasionCue` (128). One flat reward (229, 728). [read]

## 4. SWI EM Sector Raid (Support Raid / Support Patrol / Defend raider)

The offer flow and the escort and kept-alive parts are in war-missions.md §1–2. This section covers the kill side only.

- **Per-class pay** (`Reward_CalculateForKills`, EM 7079–7175; class values from `GetRewardDataForClassKill`, 7271–7310) [read]:
  - Each enemy is worth `GetRewardForLevel` for its class: XS easy L1, S easy L10, M medium L1, L hard L1, XL hard L5, station hard L10.
  - That's × min(100, the player's hull-damage %) / 100. It's ×1.25 if `isPlayerKilled`; in SWI, XS kills don't get the 1.25 (7156–7162).
  - The kill total is then × `$rewardMult`/100 = ×0.5 (EM 170; applied at 4416).
  - At relation boost 1: XS ≈ 17.5k, S ≈ 41.6k, M ≈ 125k, L ≈ 625k, XL ≈ 875k for a full kill. Hard-difficulty classes (L, XL, station) get a relation boost of up to ×3, from the mission faction's relation to the player (`lib_reward_balancing.xml` 309–318). [inferred arithmetic]
- **Scope** [read]: the targets are ships attacking the raid faction's objects in the target sector, or in the lead ship's sector (`EnemyTargets_Accumulate`, EM 8543–8640, condition 8590–8600). There are also periodic finds within the lead ship's or a station's radar range (8666–8820). Criminal-faction attackers are skipped (8615). Only one Sector Raid exists per faction per target sector (2084–2092).
- **Time** [read]: there's no hard timer. Pay needs at least 5 min in the mission (2990). The escort part scales with time / 20 min and isn't capped (4389). The mission ends with the faction-AI subgoal (2711, 3572–3601).
- **Kill crediting** (`DamageCalculator_*`, EM 9188–9536) [read]:
  - Hull damage counts when the attacker `isplayerowned`, so wingmen count (9520–9526).
  - A kill counts as the player's if the killer is player-owned, **or** player-owned ships did ≥75% of the hull damage (9432). So assists pay pro rata, and a big assist counts as a kill.
  - Damage done before the enemy is tracked isn't counted. The exception is a first hit by a player-owned attacker, which credits 100 − hull% (9330–9339).
- **Can a `swibh` contact be the client?** No. `Mission_SectorRaid` (2369) reads `$ship` (an L/XL with an AI pilot) and `$cue_factionAI` (a faction subgoal with `$RegistryTable.$StartTime`) from its signal. It has no client or reward params. [read]
- **The damage table is reusable, though** [inferred]: `DamageCalculator_AddTarget` (9300) takes any `Cue_Mission`. `DamageCalculator_GetDamageAndKillsList` (9383) filters by it. `Reward_CalculateForKills` (7079) only needs `$Cue_Mission.$Faction` (and `$MissionId` for debug). So a `swibh` cue could sign enemies up and read back EM-style damage-share pay. That ties us to EM internals, which aren't an API.

## 5. SWI EM Mayday

- Scope is one ship in distress near the player and the ships attacking it, any class (war-missions.md §1). [read]
- Pay = a safe-escape part + `Reward_CalculateForKills` × 0.5 (EM 651–741). It fails if the kill part is 0 (699, 736–737). Kills are credited the same way as in §4. [read]
- It's not callable with our own client: it's signalled from SWI's `npc_usecases.xml` distress hook (war-missions.md §1). [read]

## 6. kuertee guild jobs in SWI

- `kuertee_professions_guilds.xml` `Patrol_Container` (5214–5325) builds a guild Patrol job. Its destinations are the faction's stations in a sector, 40 km each, 3 min, no max (5238–5241). It calls `md.GM_Patrol.Start` with `Client = $npc`, `ClientOwner = $npc.owner`, and `WithoutOffer` when threaded (5296–5320). So pay is plain GM_Patrol pay. [read]
- On success the professions module may pay an extra **guild bonus**: a share of `$rewardCr` × the Defender or Mercenary reputation bonus × 0.5 × a multiplier of 1–3 (`kuertee_professions.xml` `GMMissionEnd` 2407, `RewardBonus` 2459, paid at 2627). [read]
- These are the precedent for our reuse: SWI itself starts a vanilla GM with a guild NPC as client and no Bulletin Board offer. [read]

## 7. Two factions, one kill

- **Vanilla:** `RML_Patrol.PlayerKill` and `RML_Destroy_Matching_Objects.DestroyedObject` are `instantiate="true"` listeners on `event_object_destroyed` / `event_player_killed_object`. Nothing in them marks a kill as used (`rml_patrol.xml` 655–724; `rml_destroy_matching_objects.xml` 201–260). So two missions whose filters both match will both count the kill. [read; inferred in play]
- **Vanilla's limit is the enemy list:** a ship counts for faction A's Patrol only if its owner is in A's `EnemyFactions`. Two factions with a common enemy can both count it. [read]
- **EM:** each enemy has one entry in `DamageCalculator.$dmgAndKillsDataByIdCode` with a `$cues` list of missions (9318–9345). Each mission's pay reads the entries that list it (9383–9396). So one kill pays every EM mission that tracked that enemy. [read]
  - Catch: `EnemyTargets_Accumulate` won't add an enemy that's already in the global table and group (8604–8609). The periodic find (8812) only checks the mission's own group. So a second raid can still pick it up. [read; timing inferred]
  - Two raids from different factions in one sector are allowed; the one-per-sector check is per faction (2084–2092). [read]
- **Across systems:** EM, vanilla GMs and the vanilla police bounty (vanilla-bounty.md §1) are separate. One kill can pay all three. [inferred]

## Notable for our design

- **Build the sector bounty on `RML_Destroy_Matching_Objects`, or on our own listener.** It has owner and class filters and a per-kill signal (`SignalCue_Kill`). We'd pay per class ourselves and add our own sector check, because the RML doesn't enforce location. Use a large positive `EndAmount`, not a negative one. [inferred]
- **Or use `GM_Patrol` for a "patrol this sector" retainer.** Leave `RewardCr` unset so the per-kill bonus stays on, and tune pay with `Difficulty` and `MissionLevel`. Its ×2 for warships and its ×1 to ×12 class ladder are a ready pay table. [inferred]
- **The class ratios differ a lot.** Patrol pays XS:S:M:L:XL as 1:2:3:6:12 (×2 for warships). EM pays about 0.4:1:3:15:21 relative to S. EM makes capital kills worth far more. [read, arithmetic inferred]
- **Assist rules to choose from:** Patrol and Destroy matching objects give no assist credit. Vanilla Destroy Objects gives a kill at ≥80% damage and partial credit at 40–80%. EM pays pro rata by hull damage and gives a kill at ≥75%. [read]
- **Wingman kills:** only the group-based branches credit player-owned killers. The `event_player_killed_object` fallback only covers the player's own ship. Our sector bounty should use `event_object_destroyed` with a `killer.isplayerowned` check if wings are meant to count. [read; design inferred]
- **Stacking is the default.** A sector bounty from faction A and a retainer from faction B would both pay for the same kill. Vanilla police bounty and any running EM raid would pay too, unless we block it on purpose. Decide whether that's wanted. [inferred]
- **The kuertee guild bonus may fire on our GM calls**, because SWI hooks every `GM_Patrol` end. Check it before relying on exact pay. [inferred]

## Open questions

1. Does SWI's Hutt pirate faction (`huttpirates`) carry the `pirate` tag, so it shows up in `md.$PirateFactions` and Patrol variant 2? (Check SWI `libraries/factions.xml`.)
2. Does a `GM_Patrol.Start` call from `swibh` fire the kuertee guild bonus, and does it count toward kuertee's Defender profession?
3. In play, do a Sector Raid and a Patrol (or two raids from different factions) both pay for one kill? It needs a save check of the logbook kill lines.
4. Is X4's reversed random range (`min = /18`, `max = /26`, `gm_patrol.xml` 299) read as a range between the two? It's assumed above.
5. Is EM's damage table safe to use from another script across saves? (It has a `patch` that rebuilds the table on load, EM 9188–9298.)
