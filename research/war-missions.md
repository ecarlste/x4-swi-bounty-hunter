# War missions: which emergent missions, how they pay, does the L/XL cap bite? (2026-11-01)

Answers issue #5. `EM` = SWI 0.90 `ext/md/kuertee_emergent_missions.xml`, unpacked at `E:\x4-dev\reference\mods\swi-0.90` (`/mnt/e/x4-dev/reference/mods/swi-0.90`). Other SWI paths are relative to that folder; vanilla 8.00 paths are relative to `E:\x4-dev\reference\x4-8.00`. Text ids are page 11513 of `ext/t/0001.xml`. Tags: [read] = seen in files, [inferred] = reasoning, [untested] = not seen in game.

## Short answer

- **"War missions" most likely means the Sector Raid family**: "Support <faction> raid: <sector>" and "Support <faction> patrol: <sector>" (t 401/403, short names "Support Raid"/"Support Patrol", t 427/428). They're the only emergent missions created from the faction war AI: vanilla `FactionGoal_Invade_Space` gives a raid, `FactionGoal_Hold_Space` gives a patrol, and raids need a war subscription. [read; the user's meaning is inferred]
- **Mayday** ("Mayday! Mayday!", t 201/229) is the second candidate: any non-player ship near the player that comes under attack, which in SWI is often war fighting, but also pirates on traders. [read]
- **Escort** (Escort Miner/Trader, t 328/329) is **not offered in SWI 0.90**: every signal that would create it is commented out. It can't be what the user plays. [read]
- **No L/XL pay limit applies to any of them.** The cap calls at EM 701 (Mayday), 1362 (Escort) and 3000 (Sector Raid) are commented out, and no other code limits their pay by ship size. Only the Hunt is capped (cap-fix-facts.md). [read]
- **But the cap would hit Sector Raids hardest if SWI ever turned it on.** Every Sector Raid is led by an L or XL ship, and the commented-out call passes that friendly lead ship as the "target". Live, it would cut almost every Sector Raid to about 60 Cr. So **a fix to the cap library must not be written assuming only the Hunt calls it**. Patching the library itself (cap-fix-facts.md §4) is still fine, because the other three calls are dead. [read, inferred]
- These missions do get **SWI's 50% `$rewardMult`**, unlike the Hunt. That's a deliberate halving, not a bug. [read]
- So pay fixes don't need to reach beyond the Hunt for these missions. [inferred]

## 1. The candidates

EM's mission type ids (EM 265–271): mayday 101, escort 102, patrol 103, raid 104, defendPirate 105, hunt 106, rescue 107. Patrol, raid and defendPirate are three flavours of the one `Mission_SectorRaid` cue (EM 2369). [read]

| Mission (in-game name) | EM cue | What creates the offer in SWI | Live in SWI 0.90? | War theme |
|---|---|---|---|---|
| Support Raid / Support Patrol | `Mission_SectorRaid` (2369), via `Missions_SectorRaids_CreateOffer` (2042) | Faction AI: `ext/md/factionsubgoal_defendarea.xml` 94 (a diff on vanilla `FactionSubgoal_DefendArea`, started by `factiongoal_invade_space.xml` 961/1177 and `factiongoal_hold_space.xml` 891) | Yes | **Strong**: the faction war AI's own invasions and defences |
| Defend raider / Support Pirate (t 303/327) | same cue, type defendPirate | `ext/md/factiongoal_plunder.xml` 74 (pirate plunder goal) | Yes | Weak: helping a pirate raid |
| Mayday! Mayday! | `Mission_Mayday` (491) | `ext/md/npc_usecases.xml` 20–37, on vanilla `ship_in_distress` (`base/aiscripts/interrupt.attacked.xml` 242–275) | Yes | Medium: any attacked ship |
| Escort Miner / Escort Trader | `Mission_Escort` (1114) | Was `ext/aiscripts/order.trade.*.xml` and `order.restock.getsupplies.xml` (line 12/13/34), **all commented out** | **No** | None |
| Station Rescue (t 729) | `kEMissions_Rescue` in `ext/md/kuertee_emergent_missions_rescue.xml` (10) | `kEMission_station_attacked` from `ext/aiscripts/fight.attack.object.station.xml` 24/47/70 | Yes | Medium: a station under attack, often by capital ships |
| Search and destroy (Hunt) | `Mission_Hunt` (5251) | Bounty Hunters' Guild trade NPC (swi-bounty.md) | Yes | Targets include warring militaries |

Details [read]:

- **Sector Raid type choice** (EM 2057–2083): `FactionGoal_Plunder` → defendPirate; a defend-area subgoal owned by `FactionGoal_Invade_Space` → raid; otherwise patrol, upgraded to raid when the target sector is frontier, free or enemy, or is contested by an enemy of the ship's owner.
- **Only L/XL ships lead them.** Both diffs set `$kEMissions_isShipOk = (not player-owned) and isclass.[ship_l, ship_xl]` before signalling (`factionsubgoal_defendarea.xml` 11, `factiongoal_plunder.xml` 28). `Missions_SectorRaids_CreateOffer` also needs the owner at neutral or better to the player (EM 2048).
- **Requirements** (`Mission_SectorRaids_IsOkToCreateOffer`, EM 2124–2367; values in `ext/md/kuertee_emergent_missions_requirements_by_faction.xml` 27–34 and the per-faction tables from 60): raid needs a **war subscription** with the host faction (or relation ≥ friend if that faction has no subscriptions), patrol needs friend, defendPirate needs neutral. SWI's per-faction tables (Galactic Empire, Ascendancy, New Republic, ...) drop the reputation requirement. A raid joins the war subscription's mission group (`Mission_SectorRaid_SetMissionGroup`, EM 4254; called at 2415, 2623, 2908 and 4554).
- The description says it outright: "Support %1(ship) on their raid against enemy targets in %2(sector name) for at least 20 minutes" (t 402).
- **Mayday**: `OnShipInDistress` in SWI's `npc_usecases.xml` diff signals EM for every distress call whose attacker isn't player-owned. `Mission_Maydays_IsOkToCreateOffer` (EM 445) only refuses player-owned ships and ships already in an EM mission. Any class can be the ship in distress. The vanilla cue the diff extends needs the ship to be visible to the player and the player in a cockpit (`base/md/npc_usecases.xml` 2237–2244).

## 2. How each one pays

All of them pay through `Mission_Complete` → `reward_player money="$Cue_Mission.$RewardCr"` (EM 7050–7056). Base values come from `GetRewardForLevel` (EM 7313), which wraps vanilla `Reward_Money` and `Apply_RewardMultiplier`; swi-bounty.md §4.4 has the factors (medium level 1 ≈ 200 k Cr before relation boost and random; the class-kill values are L ≈ 1.0 M, M ≈ 200 k, S ≈ 66.5 k). `$rewardMult` is 50.0 (EM 170), so `× $rewardMult/100` = × 0.5. [read]

### Sector Raid (Support Raid / Patrol / Defend raider)

`Mission_SectorRaid_Complete` (EM 2966) pays only if the player got past the briefing and spent **at least 5 minutes** in the mission (`$time_inEscort ge 5min`, 2990); otherwise it fails. `Mission_SectorRaid_CalculateRewards` (EM 4380–4419) then builds three parts [read]:

1. **Patrol/escort reward** (`$reward_forEscort`, log line t 499 "Patrol reward"): `Mission_SectorRaid_GetRewardForEscort` (4818–4856) = `GetRewardForLevel(medium, level 1)` × danger × 0.5, where danger is the largest attacker class the player was assigned (XS 0.75, S 0.83, M 0.91, L/XL 1, station 1.25; XS if none was assigned). Then × `$time_inEscort / 20min` (4389). The fraction isn't clamped, so pay keeps growing past 20 minutes (t 412 says so).
2. **Kept-alive bonus** (`$reward_forKeptAlive`, t 497): the same calculation again, paid only if the lead ship is still operational (4394–4403).
3. **Engagement reward** (`$reward_forKills`, t 498): `Reward_CalculateForKills` (7079) over the enemies you damaged, × 0.5 (4416). Per enemy: class value × your damage % (max 100), × 1.25 if your kill. In SWI XS kills don't get the 1.25 (7156–7162).

Total: `$RewardCr = forEscort + forKills + forKeptAlive` (3009). Plus faction relation via vanilla `Reward_Notoriety` (3032–3034).

### Mayday

`Mission_Mayday_Complete` (EM 651–741) [read]:

- **Safe-escape reward**: `GetRewardForLevel(medium, level 1)` (658), × 0.5 in SWI (681–682). Outside SWI it's also scaled by enemy size over ship size (685); SWI skips that.
- **Engagement reward**: `Reward_CalculateForKills` × 0.5 (691–698).
- **You must engage.** If the engagement reward is 0, the mission fails (699, 736–737) even if the ship escaped.
- `$RewardCr = safeEscape + kills` (710).

### Escort (not offered in SWI, for completeness)

Trade reward = `GetRewardForLevel(easy, trades + 1)` × sectors crossed by sector class (1318–1325), × time-in-escort fraction × 0.5 if you were ever away (1328–1329); kills × 0.5 (1359); then SWI halves both again (1371–1373). [read]

### Station Rescue

`CalculateRescueRewards` (`kuertee_emergent_missions_rescue.xml` 1856–1876): `GetRewardForLevel(trivial, level 1)` per rescued NPC, per faction. The debrief (`GetBriefingDebriefing_Debrief`, EM 8041–8160) adds the Sector Raid escort, kept-alive and kill parts (it includes `Mission_SectorRaid_CalculateRewards`, EM 8077) and totals them at 8141. No cap call. [read]

## 3. L/XL pay limits

- **`CapRewardBasedOnMissionTarget` (EM 7340–7377) is the only size-based limit**, and SWI has only four calls to it (cap-fix-facts.md §2). Mayday (EM 699–709), Escort (1361–1370) and Sector Raid (2999–3008) wrap theirs in `<!-- ... -->`; only the Hunt's call (5684) is live. No other file in SWI calls it, and SWI's `gm_*.xml` diffs only record the reward for the professions module, without changing it. [read]
- **What the dead calls would have done** [read, inferred]: each passes the mission's **own (friendly) ship** `$Ship` as `MissionTarget`, not an enemy. So:
  - **Sector Raid**: the lead ship is always L/XL (§1), so if the call were live every raid's patrol and kill parts would be cut to `size × 5` ct (L) or `size × 2` ct (XL), about 60 Cr, the same as the Hunt (bounty-research.md "The L/XL pay cap"). The kept-alive part isn't passed in, so it would stay. Whoever commented it out probably saw that.
  - **Mayday**: capped only when the ship in distress is L/XL.
  - **Escort**: capped only for L/XL traders or miners.
- **Inferred:** the commented-out calls suggest SWI tried the cap on all four missions, found it broke them, and turned it off everywhere but the Hunt. That fits the "never tuned at payout" reading in cap-fix-facts.md §3. There's no comment in the code to confirm it.
- **Other size effects that aren't limits:** the danger factor rises with the attacker's class (L/XL 1.0, station 1.25), and kill pay rises with the enemy class (L ≈ 1.0 M, XL ≈ 1.4 M before × 0.5 and the damage share). Big targets pay *more* in these missions. [read]

## 4. What this means for the project

- The cap fix (design.md build step 3) only changes Hunt pay. Mayday and Sector Raid already pay uncapped, at SWI's intended 50%. [inferred]
- If the fix sets `$rewardCap_mult` to 0 in the library, nothing changes for the other missions while their calls stay commented out. If a future SWI turns any of them back on, the library fix would cover them too. [inferred]
- Not checked in game: a real Sector Raid or Mayday payout. A save check of one completed Support Raid (logbook lines t 499/497/498/496) would confirm the × 0.5 and the time fraction. [untested]
