# Enhanced Kill Credit 8.00.01: what the code does

Research for [#85](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/85), which feeds the in-game trial [#62](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/62) (Locked-mod trials). This note reads the mod's code only. Nothing was run in game.

**Sources**

- EKC = the Nexus file `Enhanced Kill Credit-2033-8-00-01-1774484138.zip`, unzipped.
  - **P** = the main script packed in `ext_01.dat`, i.e. `md/enhanced_kill_credit.xml`, 1,015 lines. The catalogue entry is timestamped 1774481092, which is 2026-03-25 23:24 UTC.
  - **L** = the loose `md/enhanced_kill_credit.xml`, 1,010 lines, file date 2026-03-23.
  - **PM** and **LM** = the packed and loose copies of `md/enhanced_kill_credit_menu.xml`.
  - Also read: `content.xml`, `ReadMe.txt` and `ChangeLog.txt`.
- V = vanilla X4 8.00, unpacked at `/mnt/e/x4-dev/reference/x4-8.00/base`:
  - V-notif = `md/notifications.xml`
  - V-def = `libraries/defaults.xml`
  - V-xsd = `libraries/common.xsd`
  - V-sp = `libraries/scriptproperties.xml`
- SWI = SWI 0.91 HF1, unpacked at `/mnt/e/x4-dev/reference/mods/swi-0.91hf1` (scripts in `ext02/`).
- Repo notes: [vanilla-bounty.md](vanilla-bounty.md), [swi-bounty.md](swi-bounty.md), [sanction-tiers.md](sanction-tiers.md) and [hunt-pay-ael-112.md](hunt-pay-ael-112.md).

Line numbers are from P unless marked otherwise. Tags: **[read]** = seen in a file at the cited line. **[2nd-hand]** = from a non-primary source such as a forum post or the mod's ReadMe. **[inferred]** = reasoned and not tested.

## Answers against #62's bar

| #62 item | Verdict | Why |
|---|---|---|
| Wing kills and assists pay | **Pass, from code.** The amount needs a game check. | A kill by any player-owned object other than the ship the player flies pays: wingmen, remote fleets, defence stations, laser towers and mines. Assists pay by damage share, and the player's own damage counts towards an assist. Payment needs a police licence, or an enemy station of the victim within 30 km (§2, §3). |
| SWI's sanctions don't pay twice for one kill | **Pass, from code**, with one edge case for a game check. | EKC skips any kill whose killer is `player.occupiedship`, and vanilla pays only those kills. So each kill is paid by vanilla or by EKC, never both. Edge case: a kill by a turret on the player's own ship, if the engine reports the turret and not the ship as the killer (§4). |
| Hunt pay stays the main earner at the defaults | **Game check needed.** The code says remote fleets *can* out-earn hunts. | EKC pays 75% of vanilla's police bounty per kill: S 22.5k, M 45k, L 225k, XL 450k Cr. An S hunt paid 221k (AEL-112). One wingman L kill pays about as much as an S hunt, and nothing caps it per hour (§3). |
| No kill pays without a contract (#58) | **Fail by design.** | EKC's whole point is to pay uncontracted kills. With a police licence it pays for **any** non-player-owned ship that a player-owned ship kills, even one the police are not at war with (§2.1). The only way to honour #58 is to set the reward settings to 0, which disables the mod. |
| Run at defaults or with published settings | **Defaults work. A published settings file is possible, but not as the ReadMe describes it** (§7). | The loose and packed copies differ, so editing the loose file may do nothing (§1). A small companion MD script, or our own extension, can set EKC's save variables whichever copy loads. |
| Which copy loads | **Game check needed.** No primary source settles it. | The executable has a `-prefersinglefiles` switch, which implies packed files win by default. The cheapest check is to grep a save for a variable name that only one copy uses (§1). |
| Cost and safety | **Probably fine.** | It adds no diff patches, keeps a small save state and has `save="false"`. Removing it should be safe. Two catches: it does nothing in a **new game** until the first save is loaded, and queued rewards are dropped on every load (§6). |

Further findings the trial should look at:

- EKC calls `change_relation_on_kill` on every kill it pays (line 598). Without EKC, the engine already applies the relation loss for a wingman's kill ([sanction-tiers.md](sanction-tiers.md) line 97), so a wingman kill may cost relation **twice**.
- On an assist, EKC charges the player the kill's relation loss even though an NPC fired the killing shot.
- EKC never checks `isrelationchangedisabled`, which design.md relies on for loyal wingmen. See §5.
- At its defaults, EKC pays more than vanilla for the same kill. Without a police licence, the nearest station pays EKC 75% of the full bounty. Vanilla pays the player's own kill only a third (§3.3).

## 1. Which copy X4 loads

### What's in the zip [read]

- `content.xml`: id `enhanced_kill_credit`, version 800, date 2026-03-25, `save="false"`, no dependencies.
- `ext_01.cat` lists two files: `md/enhanced_kill_credit.xml` (78,738 bytes, timestamp 2026-03-25 23:24 UTC) and `md/enhanced_kill_credit_menu.xml` (49,287 bytes, 23:10 UTC).
- The loose `md/` folder has the same two paths, with file dates 2026-03-23.
- The changelog dates 8.00.00 to 2026-03-23 and 8.00.01 to 2026-03-25.
- [inferred] So the loose files are 8.00.00 left in the folder, and the packed copy is 8.00.01.

### How they differ [read]

Both copies declare `<mdscript name="Enhanced_Kill_Credit">`, and every `EKCState` variable name is the same in both. Most of the roughly 400-line diff is renaming:

| Kind of name | Loose (L) | Packed (P) |
|---|---|---|
| Libraries | `EKC_FileConfigOverridesSave`, `EKC_ApplyDebugLogSettings`, `EKC_CreditLineForLiveObject`, `EKC_BuildCreditEntry`, `SendToAttackResponse` | the same names without the `EKC_` prefix, and `RelationAndPayout` for the last one |
| Cues | `BatchFlusher`, `EKC_SyncDebugChances`, `EKC_ApplyConfigDefaults`, `AttackAccumulator`, `FirstDamage`, `MonitorTarget`, `MonitorTimeout`, `MonitorDamage`, `MonitorKilled`, `PlayerOwnedKills`, `QueueReward`, `ApplyRewardsPlus` | `PendingPayoutFlush`, `SyncDebugChances`, `ApplyConfigDefaults`, `AssistTracker`, `FirstPlayerHit`, `WatchVictim`, `WatchIdleDrop`, `WatchFurtherHits`, `WatchVictimEnd`, `RemotePilotKill`, `EnqueueCombatPayout`, `SettleCombatPayout` |
| Variables | `$Monitored` (L 237), `$Target`, `$PlayerAttackers` (L 281), `$BaseObject`, `$Killer`, `$ekc*` | `$TrackedVictims` (P 238), `$TrackedVictim`, `$PlayerOwnedAttackers` (P 282), `$KilledObject`, `$KillerObject`, `$snap*` and others |

I normalised those names and diffed again. Only two changes affect behaviour [read]:

1. **Assist index guard.** P 453-468 adds `do_if $BestIdx gt 0 and $BestIdx le $AttackerList.count`, with a cleanup in the `do_else`. In L, a bad index would run the payout on an invalid killer. This is the changelog's "minor edge cases".
2. **Reputation in the negative band.** L 896-903 copies vanilla (V-notif 2394-2404): when the payer's relation is below -0.0032 (UI -5), it sets `relation × 0.1 ^ (bonus / 0.006401)`, so each bonus moves the UI value by the same amount at any depth. P 905-908 always uses a plain `add_faction_relation value=$relbonus`.
   - [inferred] Under P, a kill pays much less visible reputation with a faction that dislikes you than vanilla or L would.
   - This doesn't affect bounty money.

The menu scripts are tied to their own copy [read]. LM calls `md.Enhanced_Kill_Credit.EKC_ApplyConfigDefaults` and `EKC_SyncDebugChances`, and PM calls the same cues without the prefix. If X4 mixed the copies, say the loose main script with the packed menu, the menu's Reset button and its debug toggle would signal cues that don't exist. That matters only when SirNukes' Mod Support APIs is installed, which we don't plan.

### Which one X4 loads

- [read] The 8.00 `X4.exe` contains the command-line switch string `prefersinglefiles` next to `personalfolderid`, `soundsystem` and `enablealldlc`. Found with `grep -a` on `/mnt/e/SteamLibrary/steamapps/common/X4 Foundations - 8.00/X4.exe`.
- [2nd-hand] An Egosoft forum thread ([Loose files vs Catalog?](https://forum.egosoft.com/viewtopic.php?p=5181706)) and the third-party [x4cat reference](https://meethune.github.io/x4cat/modding-reference/extension-structure.html) both describe `-prefersinglefiles` as the option that makes X4 use loose files over catalogues. No Egosoft staff post or wiki page confirms it. The Egosoft wiki's X Catalog Tool page says only that files in `ext_*` catalogues are part of the extension.
- [inferred] A switch to *prefer* loose files implies that, by default, the packed `ext_01.dat` copy wins when both copies exist. So with a normal launch, X4 most likely runs **P (8.00.01)**, and the ReadMe's advice to edit `enhanced_kill_credit.xml` (and its `EKC_FileConfigOverridesSave` library, which only L has) **does nothing**.

**Cheapest check in game, with no file edits:** load save_007 with EKC installed, save, and search the save for `TrackedVictims` or `PlayerOwnedAttackers` (packed copy) versus `Monitored` or `PlayerAttackers` (loose copy). Saves store MD variables by name, as the save-check notes show for EM's `$PlayerDamageAndKillsData`. `$TrackedVictims` is created by the root cue `AssistTracker`, which has no conditions (P 235-239), so it's in the save from the first load.

A second option, if the save search is awkward: start the game with `-debug scripts`. Edit only the **loose** file: set `EnableDebugLog` to true (L 115) and `EKC_FileConfigOverridesSave` to true (L 36), then load. `[EKC] ...` lines in `debuglog.txt` mean the loose copy runs. No lines means the packed copy runs, because its own defaults keep debug off. Revert both edits afterwards.

## 2. Which kills pay

### 2.1 Final blow by a player-owned object: `RemotePilotKill` (P 488-508) [read]

- **Trigger.** `event_player_owned_killed_object`. Its documentation says it fires "when a player owned object, including player, kills an object (param = killer object, param2 = killed object…)" (V-xsd 15760-15763).
- **Conditions:**
  - EKC is enabled;
  - `event.param != player.occupiedship` (line 492). This is the only exclusion, and it drops the ship the player is in;
  - the victim is destructible, has an owner, and is owned by neither the player nor ownerless (493-494);
  - the victim is defensible: a ship, station or deployable (502). Components and other odd destructibles are skipped.
- **No hostility check.**
  - Vanilla pays the police bounty only if the police faction `hasrelation.enemy` to the victim (V-notif 2162).
  - EKC's police route has no such test (P 706-720). It pays whenever the victim has a bounty value (all ship classes do) and the player holds the local police licence.
  - [inferred] So a wingman kill of a lawful SWI hunt target in its own faction's space pays that faction's police bounty, if the player owns that faction's licence.
  - The station route does still need a station that is an enemy of the victim's owner (762, 770).
- **Which killers count** [read, plus inferred where marked]:
  - wingmen and other ships under the player's command;
  - remote fleets and patrols. [inferred] This includes fights out of the player's sector, since the event covers any player-owned object;
  - player stations and defence platforms. If the killer is a turret mounted on a ship or station, the parent gets the credit (600-604);
  - deployables such as laser towers and mines (`$useDeployKillerScale`, 605).
- **Excluded:**
  - the ship the player occupies, whose kills vanilla's `PlayerKills` pays (V-notif 1715);
  - [inferred] while the player sits in a ship they don't pilot, kills by that ship pay nothing from either script.

### 2.2 Assists: `AssistTracker` (P 235-483) [read]

1. **Start.** `FirstPlayerHit` listens to `event_player_owned_attacked_object` ("a player owned object, **including the player**, attacks another object", V-xsd 15293-15296). It starts watching the victim if all of these hold:
   - the victim is class `ship_s`/`ship_m`/`ship_l`/`ship_xl`/`module`/`station`, or a deployable. **Not XS**;
   - the victim is an enemy of the player;
   - the victim's police bounty is above 0;
   - the attacker is operational and has DPS above 0. This filters out ramming and death explosions;
   - the victim isn't already watched (241-253).
2. **Watch.** `WatchVictim` records each new attacker, player-owned or not: its DPS and the victim's shield+hull at that attacker's first hit (266-320). Watching stops after 5 minutes with no new attacker (287-296).
   - [read] `$LastCombatActivity` only updates when a **new** attacker joins (308), so a long duel with no newcomer gets dropped after 5 minutes even mid-fight.
3. **End** (`WatchVictimEnd`, 322-479):
   - The player's own ship kills it: vanilla pays, EKC stops (336-340).
   - Another player-owned ship kills it: `RemotePilotKill` pays (342-346).
   - A non-player-owned killer, with at least one player-owned attacker on the list: this is the **assist** case. The player's share is the sum over player-owned attackers, the payout uses that share, and the credit goes to the player-owned attacker with the biggest share (347-463).
   - Abandoned or changed owner: stop with no payout (472-477).
4. **The share** (356-440). Attackers are sorted by the victim's shield+hull at their first hit. Each slice of shield+hull between two first-hits is split among the attackers present, by DPS. The result is each attacker's DPS-weighted share of the shield+hull removed.
   - Example [inferred, from the formula]: a wingman starts alone at full health. An NPC with the same DPS joins at 50%. The wingman's share is 50% + 25% = **75%**.
5. **Assist modes.**
   - Default `DynamicAssistReward=true`: the payout is multiplied by the share.
   - Threshold mode: pays the full assist rate if the share is at least `AssistThreshold` (50), and nothing otherwise (443-447).
   - [read] **The player's own damage counts**, because the event includes the player. A ship the player shot up and the police finished off pays an EKC assist, with the player's ship as the credited "killer". Vanilla pays nothing in that case.

## 3. How much

### 3.1 Settings at the defaults (`ConfigDefaults`, P 46-118) [read]

| Setting | Default |
|---|---|
| `ShipBountyPercent`, `ShipRepPercent` | 75 |
| `DeployableBountyPercent`, `DeployableRepPercent` | 33 |
| `StationBountyPercent`, `StationRepPercent` | 33 |
| `PlayerOwnedKillPercent`, `AssistKillPercent` | 100 |
| `DynamicAssistReward` | true |
| `AssistThreshold` | 50 |
| `StationRewardRange` | 30 km, clamped to 5-100 (731-738) |
| `MinTriggerDelay`, `MaxTriggerDelay` | 45 s, 10 min |
| `EnableDebugLog` | false |

### 3.2 Formulas (`RelationAndPayout`, P 577-816) [read]

```
base_bounty = victim.relationchange.policefaction.bounty   (V-def per class)
base_rep    = victim.relationchange.killfaction.bonus      (V-def per class)

type% =  Deployable%  if the KILLER is a deployable (laser tower, mine)        (616-622)
         Deployable%  else if the VICTIM is a deployable                       (623-629)
         Station%     else if the VICTIM is a station or module                (630-636)
         Ship%        otherwise                                                (637-643)

final blow : bounty = base_bounty × type% × PlayerOwnedKill%  (100)           (672-673)
             rep    = base_rep    × type% × PlayerOwnedKill%
assist     : bounty = base_bounty × type% × share × AssistKill% (100)          (648-664)
             rep    = base_rep    × type% × share × AssistKill%
```

**Correction to #62's wording** [read]: the 33% "stations" rate applies when the **victim** is a station or module, not when a station is the killer. A kill by a player **defence station's** turret is credited to the station (602-604), and it pays the **ship** rate, 75%, for a ship victim. Only laser towers and mines (deployable killers) get 33%.

### 3.3 Who pays and where the money comes from [read]

1. **Bounty, police route** (706-720).
   - The police faction is `victim.zone.policefaction`, or failing that `victim.sector.owner.policefaction`. Vanilla uses only the zone.
   - If the player holds that faction's police licence and its representative exists, the bounty is queued for the **police representative**.
2. **Bounty, station route** (721-723, 803-805).
   - Without the licence, the bounty goes to the closest station that meets all of these:
     - in the victim's sector;
     - functional, and not player-owned;
     - an **enemy of the victim's owner**;
     - its owner is protective and not relation-locked;
     - has a trade NPC;
     - within `StationRewardRange` (30 km) of the killer, and within the station's radar range (757-798).
   - That station pays the **whole** scaled bounty.
   - Vanilla pays the player's own kill only `bounty / 3` by this route (V-notif 2285-2288).
   - If no station qualifies, nothing is paid (810-812).
3. **Reputation** always takes the station route, with the same station search. It's granted to the station owner (806-808).
4. **Payment** (`SettleCombatPayout`, 881-1013).
   - `transfer_money from=$rewardnpc.container`: the money comes out of the account of the station the payer sits on, which is vanilla's method too (V-notif 2391).
   - [inferred] A police representative with no container pays no money (900), and a broke station may pay little.
   - Reputation uses `add_faction_relation` (907).
   - The logbook entry is "Combat Reward", category general, listing the ships, deployables and stations credited.
5. **Batching** (179-203, 824-873). One queue row per payer, flushed when it has been idle for 45 s or 10 minutes have passed since the first kill. The check runs every 5 s. Vanilla batches the same way (V-notif 2291-2312).

### 3.4 Worked examples at the defaults [inferred from §3.2, with the V-def values read]

V-def values per class:

| Class | Police bounty | Kill bonus | V-def lines |
|---|---|---|---|
| ship_s | 30,000 Cr | 0.001 | 727-729 |
| ship_m | 60,000 Cr | 0.002 | 625-627 |
| ship_l | 300,000 Cr | 0.005 | 512-514 |
| ship_xl | 600,000 Cr | 0.01 | 391-393 |
| station | 40,000 Cr | 0.02 | 951 |

| Case | EKC bounty | EKC rep (to the station owner) |
|---|---|---|
| Wingman kills an S ship | 30,000 × 0.75 = **22,500 Cr** | 0.00075 (about 1 UI step in the neutral band) |
| Wingman kills an M ship | 60,000 × 0.75 = **45,000 Cr** | 0.0015 |
| Wingman has a 75% share, the police finish an S ship | 30,000 × 0.75 × 0.75 = **16,875 Cr** | 0.00056 |
| Remote fleet kills an L ship | **225,000 Cr** | 0.00375 |
| Remote fleet kills an XL ship | **450,000 Cr** | 0.0075 |
| Defence station turret kills an M ship | **45,000 Cr** (ship rate) | 0.0015 |
| Laser tower kills an M ship | 60,000 × 0.33 = **19,800 Cr** | 0.00066 |
| Any player-owned killer destroys an enemy station | 40,000 × 0.33 = **13,200 Cr** | 0.0066 |
| For comparison, vanilla: the player's own S kill | 30,000 with a licence, or 10,000 from a station without | 0.001 |

Compared with SWI hunt pay:

- **AEL-112**, an S target, paid **220,810 Cr** in total ([hunt-pay-ael-112.md](hunt-pay-ael-112.md)). A wingman landing that kill would add **22,500 Cr** on top, about 10%.
- **SHK-785** paid about 1.77M ([sanction-tiers.md](sanction-tiers.md) line 99). An M target's class roll alone is roughly 200-520k ([swi-bounty.md](swi-bounty.md) §4.4: medium level 1 = 8 × 25,000 × relation boost 1-2 × random 1-1.3).
- **Uncontracted kills.** A wing that kills 5 escort S fighters earns 112,500 Cr with no contract, about half an S hunt.
- **Big ships.** Each L or XL kill by a patrol or carrier group pays 225k or 450k, more than an S hunt. Hunts are capped at 3 accepted per rolling hour ([swi-bounty.md](swi-bounty.md) §1), while EKC has no cap.
- [inferred] A remote fleet that fights capitals, or a defence network on a contested gate, can out-earn hunts at the defaults. The trial should measure this, as #62 asks.

## 4. Stacking with SWI [read, with inferences marked]

- **Vanilla and EKC never pay the same kill.**
  - Vanilla pays only `event_player_killed_object`, a kill "from their currently controlled object" (V-xsd 15650-15653; V-notif 1715-1717).
  - EKC skips `event.param == player.occupiedship` (P 492), and on the assist path it hands that case back to vanilla (P 336-340).
  - SWI changes vanilla's `PlayerKills` only to skip sanctioned kills (SWI `ext02/md/notifications.xml` 450-459; [vanilla-bounty.md](vanilla-bounty.md) line 75). SWI adds no kill-reward path for other player-owned ships (grep of SWI for `event_player_owned_killed_object`: only a commented-out line, RAP 4344).
  - **Game check:** when a turret on the player's own ship lands the kill, is `event.param` the turret? If it is, the test `event.param != player.occupiedship` passes, and vanilla and EKC could both pay. EKC's own turret-to-parent mapping (P 600-604) shows the engine can report turrets as killers.
- **Sanctions.**
  - A sanction pays nothing itself. "Intact relationships" skips vanilla's `PlayerKills` for the target ([sanction-tiers.md](sanction-tiers.md) line 90), which also drops the police bounty and station bonus for the player's own kill (line 109).
  - EKC doesn't read `global.$kProfs_Sanctions` at all.
  - So a sanctioned target killed by a **wingman** still pays EKC's bounty and reputation, and still takes EKC's `change_relation_on_kill`. The sanction never covered wingman kills anyway (sanction-tiers.md line 97).
  - Nothing pays twice.
- **Hunt plus EKC.** SWI's hunt pays when the killer is player-owned or the player did at least 75% of the damage (`DamageCalculator`, [swi-bounty.md](swi-bounty.md) §4.4).
  - A wingman's kill of a hunt target pays **both** the hunt and EKC.
  - The player's own kill pays the hunt plus vanilla's police bounty or station reward, as it does today. That stacking is vanilla's, not EKC's.
  - Under #58 ("one kill pays every contract it qualifies for"), stacking a hunt is fine. EKC's payment isn't a contract, though, so it's the "general kill bounty" #58 rejected.
- **Relations.**
  - EKC calls `change_relation_on_kill killer=<credited player-owned object> killed=<victim>` on every kill it handles (P 598). The action is documented as "Change relation of the killed object towards the killer" (V-xsd 21335-21338).
  - [inferred] **Final blow by a wingman:** [sanction-tiers.md](sanction-tiers.md) line 97 found that the engine already applies the kill's relation loss when a player-owned NPC ship kills (AEL-112 log: no `PlayerKills` line, but the relation still dropped). EKC then applies it a **second time**. That would be -2 to -4 extra per S kill with a lawful target's faction. **Game check:** compare the relation drop from one wingman kill of a non-enemy-faction ship with and without EKC.
  - [read] **Assist:** EKC applies the kill relation loss, credited to the player's best attacker, although an NPC killed it. On its own that only matters for victims that are enemies of the player (the assist path needs `hasrelation.enemy`).
  - [read] **The `isrelationchangedisabled` check.** Vanilla checks `not event.param.isrelationchangedisabled` before `change_relation_on_kill` (V-notif 1719), and EKC doesn't. design.md makes loyal wingmen "hostile … with relation behaviour disabled … so killing them costs nothing". [inferred] If the engine action doesn't itself respect that flag, EKC would break design.md's "killing a loyal wingman costs no relation" whenever a player-owned ship other than the player's lands the kill. **This needs our own test when loyal wingmen are built** (design.md Relations test).
- **Loyal-wingman pay (design.md).** The extension's assist rule ("whoever lands the kill, if the player or any player-owned ship damaged it in the last 10 minutes") stacks with EKC; they don't overlap. A loyal wingman killed by the player's wing pays 50% of a new class roll into the hunt, plus EKC's 22.5k or 45k bounty, with a licence or a nearby enemy station.
  - [inferred] Loyal wingmen are made individually hostile. If their faction is not at war with the local police or stations, the police route still pays (no hostility check) and the station route doesn't.
  - The double-count to check is EKC plus the loyal bonus. Both pay, and only rates can balance that.

## 5. Fit with the design

- **#58 "No kill pays without a contract"**: EKC breaks this by design. It pays for escorts, random pirates and capitals, with no contract. Vanilla already breaks it for the player's own kills: the police licence and station-defence rewards, in [vanilla-bounty.md](vanilla-bounty.md) §1. EKC extends that to every asset the player owns. At its defaults it pays a remote kill **more** than vanilla pays the player's own kill without a licence: 75% of the full bounty against a third.
- **Options:**
  - drop EKC;
  - run it at the defaults and accept it as the series' version of vanilla's "station defence" pay;
  - publish settings that cut ship bounty, e.g. to 33% (S 9,900, M 19,800, L 99,000). Setting bounty to 0 and keeping reputation leaves only reputation. That partly honours #58: no money without a contract, with reputation as flavour.

## 6. Cost and safety

**Listeners** [read]:

| Cue | Trigger | Scope |
|---|---|---|
| `FirstPlayerHit` | `event_player_owned_attacked_object` | Every attack by any player-owned object, anywhere. The conditions are cheap property checks plus one `indexof` on a group (241-253). |
| `WatchVictim` | one instance per watched victim, with `event_object_attacked` on that victim | Every hit from any attacker, but only a list lookup unless the attacker is new (299-320). |
| `WatchIdleDrop` | a 1-minute timer per victim | |
| `WatchVictimEnd` | listens globally to `event_player_owned_killed_object` | Plus destroyed, abandoned and changed-owner events on that victim. |
| `RemotePilotKill` | per player-owned kill | |
| `PendingPayoutFlush` | every 5 s | Only while something is queued (181-185). |

- [inferred] This is bounded and light. The heaviest part is the hit listener in big fleet battles, the same event family vanilla's `PlayerOwnedShipAttacks` uses. #62's DABC trial is the place to watch frame rate with EKC on.
- [inferred] **Instances pile up per load.** `EKCState` is `instantiate="true"` on `event_game_loaded` (138-141), and each instance owns an instantiated child `PendingPayoutFlush` with `checkinterval="5s"` that never completes. Each load adds one more waiting instance.
  - They all share the static queue, and the first to flush removes the rows (191-199), so this shouldn't pay twice.
  - It does add one 5-second check per past load.
  - **Save check:** count the EKC 5-second cue instances in a save after a few reloads.

**Save state** [read]:

| Where | What | Kept across loads? |
|---|---|---|
| `EKCState` static variables | the 16 settings, `$Initialized`, debug chances, session totals | Yes |
| `EKCState` static variables | the nine `$Pending*` lists | **No.** They are reset to `[]` on every load (160-168), so rewards queued but not yet paid when you save are lost when you load. Vanilla keeps its queue in `IllegalActivity`. |
| `AssistTracker` | `$TrackedVictims` group | Yes |
| `WatchVictim` instances | per-victim attacker lists | Yes |
| `SettleCombatPayout` | writes vanilla's `md.Notifications.IllegalActivity.$updatingrelation`, true then false within one action block (906-908) | Nothing left over |

**New games** [read and inferred]:

- `EKCState` runs only on `event_game_loaded`, "when the game has completed loading a savegame" (V-xsd 16369-16370). Nothing in P listens to `event_game_started`.
- Every payout path checks `md.Enhanced_Kill_Credit.EKCState.$EnableEKC? and …` (244, 491).
- So **in a brand-new game EKC pays nothing until the player saves and loads once**. Add that to the series start checklist.
- save_007 in trial A is a load, so it isn't affected.

**Uninstall** [read and inferred]:

- `save="false"` in `content.xml`. [2nd-hand] This flag marks whether saves made with the extension require it.
- EKC ships no diff patches to vanilla or SWI files (the catalogue holds only the two new MD scripts), and it doesn't touch jobs, wares or macros.
- [inferred] Removing it leaves orphaned MD state for a script that's no longer present. X4 normally drops that on load. Credits and reputation already paid stay.
- **Game check:** load a save made with EKC after removing it, and grep `debuglog.txt` for errors. This is #62's planned uninstall check.

## 7. Could a published drop-in settings file work?

- **Editing the loose `enhanced_kill_credit.xml`, as the ReadMe says:**
  - only works if X4 loads the loose copy. §1 suggests it doesn't;
  - even then it needs `EKC_FileConfigOverridesSave=true` for an existing save, because settings live in the save after the first load (147-152);
  - and replacing a mod file is a fiddly step for viewers.
  - Not recommended until the §1 check is done.
- **Replacing the packed copy:** viewers would have to repack `ext_01.cat`/`.dat`. No.
- **A companion MD script (recommended if we tune):**
  - Both copies keep their settings in the same fully qualified variables, `md.Enhanced_Kill_Credit.EKCState.$ShipBountyPercent` and so on (52-115), so a script outside EKC can set them whichever copy loads.
  - It could be a tiny separate extension with `<dependency id="enhanced_kill_credit"/>`, or a cue inside our own `swibh` extension when EKC is present. It would:
    - on `event_game_loaded`, with a short delay so `EKCState` runs first, write the chosen values;
    - also set `$Initialized=true`, so a first load doesn't reset to the defaults.
  - Viewers install one more folder, or nothing extra if it's in `swibh`.
  - [inferred] The cue will be **unverified until `make check`** and an in-game load.
- **An MD diff patch on `ConfigDefaults`** from a dependent extension. The selector `//library[@name='ConfigDefaults']//set_value[@name='md.Enhanced_Kill_Credit.EKCState.$ShipBountyPercent']/@exact` matches both copies [read]. It only takes effect on a save's first load or via the override library, so the companion script is simpler.
- **The menu:** it needs SirNukes' Mod Support APIs (`md.Simple_Menu_API.*` throughout PM), which would reopen #10.

## 8. Checks for trial A

1. Which copy runs: search the save for `TrackedVictims` (packed) or `Monitored` (loose). See §1.
2. A wingman kill of an S and an M target: check the "Combat Reward" logbook entry and amount against §3.4. Check whether a police licence is held (the station route needs an enemy station within 30 km).
3. The relation drop from one wingman kill, with EKC against the same kill without it (the double `change_relation_on_kill`, §4).
4. The player's own kill made by a turret, if the ship has turrets: one "Combat Reward" line, or vanilla's "Rewarded for station defence" as well? See §4.
5. Patrol or defence platform earnings against hunt pay. In a new game, remember to save and load once first (§6).
6. Uninstall: load without EKC and check `debuglog.txt`.
