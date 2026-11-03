# Hunt logging: hook points and where each value lives (2026-11-02)

Facts for design.md feature 1 (`[swibh-hunt] {json}` per hunt). EM = SWI 0.90 `ext/md/kuertee_emergent_missions.xml`, RAP = `ext/md/kuertee_professions.xml` (both under `E:\x4-dev\reference\mods\swi-0.90`). Schema: 8.00 `base/libraries/md.xsd` and `common.xsd`. Tags: [read] = seen in files; [inferred] = reasoning; **unverified** = to confirm in game.

Builds on, doesn't repeat: [wing-split-facts.md](wing-split-facts.md) §6 (Resolve hook option, field table), [hunt-pay-ael-112.md](hunt-pay-ael-112.md) (the three reward rolls), [save-check-ael-112.md](save-check-ael-112.md) (cue vars as saved), [cap-fix-facts.md](cap-fix-facts.md) (cap library, diffs reach saves), [swi-bounty.md](swi-bounty.md) §4.

All `$X` below are on the hunt cue instance `$Cue_Mission` (`Mission_Hunt`, EM 5251, `namespace="this"`, so its sub-cues' `$X` and Resolve's locals like `$DamageAndKillsList` land on it too) unless noted.

## 1. Hook points

| Event | Where | Notes |
|---|---|---|
| (a) Offer generated | `Mission_Hunt` actions, EM 5254-5370; `create_offer` 5334-5351; last action 5369 | One cue instance per offer. Signalled by `Missions_Hunts_CreateOffer` (5213-5249), itself called per pilot from the convo `Bounties_Convo_Next` (12114) or the full-mod path (11895, dead in SWI: `$isUseFullMod` forced false, cap-fix-facts §1). [read] |
| (b) Accepted | `Mission_Hunt_Accept` (5567, `event_object_signalled object="$Client" param="'accept'"`) → `MissionContact_Generate` (6393) → `MissionContact_OnCreate` (6330) → **`Mission_Hunt_CreateMission`** (5588-5628: `create_mission` 5601, `stat.missions_accepted` 5612, `remove_offer` 5614, RAP `RegisterMissionTargets` 5620, append to `$missions_active` 5625, `reset_cue` 5627). In SWI mode OnCreate then signals `ObjectiveFind` immediately (6344). | Best accept hook: before `reset_cue` 5627 of CreateMission. It runs once (OnCreate guards `not hasmission`, 6339). If the contact NPC fails 3 tries (6369-6383) the mission is never created. `Mission_Hunt_Accept2` (5579-5585) only appends `player.age` to the global `Missions_Hunts.$missionTimes`. [read] |
| (c) Success | Target destroyed after a player attack: `TargetManager_Destroyed` (6270) sets `$Objective_Step_destroy_success` (6302) → `ObjectiveDebrief` (6303); talking to the contact (6460-6462) → `ObjectiveComplete` (5931-5942, `signal_cue` Resolve 5940) → **Resolve** success (5662-5703). CleanUp only later, on leaving the station or closing the briefing (5503-5506, 6485). [read] |
| (d) Failed | Resolve fail branch (5704-5708, `$RewardCr`=0, `Mission_Fail` 7386). Reached by: timeout `Mission_Hunt_Timeout` (6319-6326); target destroyed/abandoned **not** attacked by player (6292-6295) or while step ≤ brief (6296-6299); on-load patch v11 if past timer (5402-5410); success with 0 player damage reward (5671-5674). [read] |
| (e) Aborted by player | `event_mission_aborted cue="$Cue_Mission"` + `hasmission` is one of Resolve's own conditions (5633-5637) → `$Result = aborted` (5646) → branch 5660-5661 only `signal_cue` CleanUp. No `Mission_Fail`, no logbook, no RAP signal. [read] (`event_mission_aborted` = "aborted by the player", md.xsd 2006.) |
| (f) EM cleanup | `Mission_Hunt_CleanUp` (5497-5555) + `CleanUp2` (5556-5564, `cancel_cue $Cue_Mission`). Triggers: leaving any station (`K_ArriveAndLeaveStations`) or a new convo class pick (`Bounties_Convo_Next_remove_mission_offers`, 12107) while **no mission or step complete** (5503-5517); `event_mission_aborted` without a mission (5518-5521); direct signals listed below. Removes offer/mission, contact NPC, damage data (`DamageCalculator_CleanData` 5551), `$EnemyTargets`. [read] |

### Does every ending pass through Resolve?

- **Accepted missions: yes** for success, fail and player abort [read]. Abort does go through Resolve (contrary to wing-split-facts §6's wording "aborted → CleanUp", which is the same thing: Resolve sets `$Result` then signals CleanUp).
- **Bypasses** [read]:
  - Offers never accepted: CleanUp only (5503-5521, and target destroyed with no mission, 6290-6291). No Resolve.
  - Patch v6 on load (5383-5388): an old cue not in `$missions_active` → step complete + CleanUp, no Resolve. Legacy only.
  - `reset emissions` chat command (`ResetAll` 106-121) resets `kEMissions`, the ancestor of `Missions_Hunts`; live hunt instances are presumably killed with no Resolve. **unverified**
  - Target captured/changes owner, contact NPC never created: no handler found; the mission waits for the timeout. **unverified**
- **Ordering risk on fails, unverified:** timeout and "destroyed by others" do `signal_cue ObjectiveComplete` then `signal_cue CleanUp` in one action block (6294-6295, 6322-6323). `signal_cue` dispatches "in the same frame, but only after the current cue actions are completed" (md.xsd 4214-4220). ObjectiveComplete then `signal_cue`s Resolve (5940), so Resolve may run **after** CleanUp has done `remove_mission` and `DamageCalculator_CleanData`, and possibly after `CleanUp2` has cancelled `$Cue_Mission` (which would cancel Resolve). The `do_if $Cue_Mission.hasmission` guard around `update_mission` in Resolve (5714) suggests the author saw Resolve run with the mission already removed, i.e. Resolve does run. Test: let a hunt time out, check the debug log for our line and the logbook for text 575.

## 2. Values: where they live, when readable

| Value | Source | Readable at |
|---|---|---|
| Mission id | `$MissionId` = `'kEM_Hunt_' + Missions_Hunts.$missionIdCounter` (5229-5241, set 5256) | offer → end. See below |
| Hunt cue | `$Cue_Mission` (5257) | always; unique object per offer. Its string form in `debug_text` is **unverified** (the save shows cue id e.g. `759826`) |
| Target object | `$MissionTarget` (5267) | live until destroyed; after death use `@` (wing-split-facts §6) |
| Target name incl. idcode | `$MissionTarget_name` (GetName, 5275), e.g. "NRL Patrol B-wing (AEL-112)" | offer → end, string survives death |
| idcode / macro / class / size / owner | `$MissionTarget.idcode/.macro/.class/.size/.trueowner`; after death only in `$DamageAndKillsList` entries (`$idCode`, `$macro`, `$class`, `$size`, `$faction`, save-check-ael-112 §2), which exist only if Resolve's success branch ran (5664) | stash at accept to be safe |
| Disguised | `$IsDisguised` (5287, re-set 6125) | offer → end |
| Offering faction | `$Faction` = `$MissionOffer_Station.owner` (5286) | offer → end |
| Offering station | `$MissionOffer_Station` (5259; also `$Ship`, 5261) | object; may be destroyed later |
| Offer NPC / contact | `$Client` = station `tradenpc` (5330); `$MissionContact_NPC/_Container` (6335-6337) | contact from accept |
| Difficulty | `$Difficulty` medium, hard for L/XL (5288-5291) | offer → end |
| Mission type, group | `$kEMissionType` (5279), `$MissionGroup` (5280-5283) | offer → end |
| Offered reward (kills, "up to") | `$BaseRewardData.$reward_forTargetKills/$reward_forTarget` at 5315 (money, ct); `$RewardText` string (5327) | numbers: offer and accept only, **overwritten** at Destroy step (5897). String: offer → end (never updated). Stash numbers at accept |
| Destroy-step re-roll | `$BaseRewardData` after 5897 (hunt-pay-ael-112 §2). Kills part also re-reads the pilot's live `$kEM_kills` (6649-6662), so new kills since the offer change it; no kills data → keeps old value (6664-6666) | Destroy step → Resolve, until 5689 |
| Payout roll | `Reward_CalculateForKills` (7079, roll 7130) → `$PlayerDamageAndKillsData.$reward` (5668) | Resolve success only |
| Cap before / after | Before: `$BaseRewardData.$reward_forTargetKills` + `$PlayerDamageAndKillsData.$reward` just before 5683. After: `$CappedRewards.$RewardForTarget` (= kills part) / `$RewardForPlayerKills` (5684-5690); both originals are **overwritten** at 5689-5690. Cap limit itself = `$MissionTarget.size * 5|2` (7360), not returned | before-cap only with a hook before 5683 |
| Paid | `$RewardCr` (5694; 0 on fail 5705; stays `0ct` from 5285 on abort) | after 5694 |
| Notoriety | `$RewardNotoriety` (5698) | success, after 5698 |
| Sanction tier | Not on the hunt cue. RAP `Sanctions.$sanctionedAttackIds/$sanctionedKillIds` by idcode, cleared 1 s after target death (wing-split-facts §6). EM 6749 reads `$MissionTarget.assignedaipilot.$kProfs_isSanctioned_partial/_full`, but **nothing in SWI 0.90 sets them** (grep, dead check) | record at purchase: `event_cue_signalled cue="md.kuertee_professions.SanctionAttack"` (RAP 3444/3467, `event.param.$ship/$sanctionType`); map ship → hunt via `Missions_Hunts.$missions_active` |
| Sanction cost | `$kProfs_sanctionCost_partial/_full` on the hunt cue (RAP 3135-3144) | set when the guild convo first lists the hunt, **not** proof of purchase; paid via `transfer_money` RAP 3439/3461 |
| Escorts / escorts killed | Not tracked by EM (wing-split-facts §6). Wing at accept: `$MissionTarget.commander`, `.subordinates` | stash at accept or at split |
| Target's own kills | `$TargetKillsDescription` text, e.g. "1 x M ship" (5312), **offer-time snapshot**, never recomputed (only read at 6703). Numbers: `$MissionTarget.pilot.$kEM_kills.{$Faction}.{class}` (6648, live, gone with the pilot) | text: offer → end |
| Player engagements | `$PlayerDamageAndKillsData.$description_damageAndKillsByClass` / `_ByMacro` text; `$DamageAndKillsList` (5664) entries `$damage_total`, `$isPlayerKilled` (= killer player-owned **or** damage ≥ 75, 9422), `$killer` (name string), `$hull` | Resolve success only; not computed on fail/abort |
| Attacked by player | `$isTargetAttackedByPlayer` (5368, set true at 6253 in `TargetManager_Attacked` 6244) | accept → end |
| Step flags | `$Objective_Step`, `$Objective_Step_find/_identify/_destroy_success` (5293-5303) | → end |
| Result | `$Result` ∈ `'success'/'fail'/'aborted'` (5357-5359, set 5645-5658, 5673) | Resolve |
| Accept time | **Not stored per mission.** `Accept2` appends to a global list (5581). `$timer_find_end` = `player.age + 3h` at `StartHunting` (5950) but is reset at target found (6124), so it's not a reliable accept time | stash `player.age` at accept |
| End time | `player.age` at Resolve | Resolve |
| Failure text | `GetMissionTexts` end branch (6754-6795): {11513,575} find failed (6768), 576 identify failed (6774), 572 "still operational" = destroy step not done, incl. target killed by others (6780), 577 "failed to damage" = success path with 0 reward (6787). Same branch order as Resolve's `$Result` logic | derive from step flags at Resolve |

### Mission id uniqueness [read]

- Counter `Missions_Hunts.$missionIdCounter` (init 0 at 5094) is incremented on **every offer** (5229), wraps to 0 after 9999 (5230-5232). Every convo class pick creates a fresh offer per pilot in the bucket, removing the old ones, so the counter climbs with board scans (AEL-112 was `kEM_Hunt_133`).
- Persistent: the counter is a var on the non-instantiated `Missions_Hunts` cue and `$MissionId` is a var on the hunt cue; both are in the save (save-check-ael-112: `$MissionId "kEM_Hunt_133"`).
- **Not unique across a save:** wraps at 10,000 offers, and `reset emissions` resets it to 0. Within one accepted hunt's life a collision is very unlikely. Key log rows on `missionId + target idcode + accept time` (design.md already plans mission + game time).

## 3. One line at Resolve, or stash at accept?

A single line at Resolve can carry: id, result, step flags, faction, station, difficulty, target name, offer reward **as text** (`$RewardText`), destroy-step `$BaseRewardData` (before 5689), paid, sanction costs offered, kill text, player engagement (success only). [read]

Must be stashed earlier (overwritten or never stored):
- accept time (`player.age`);
- offer reward **numbers** (overwritten at 5897);
- target idcode/macro/class/size, if the target can die without the success branch running (fail by others' kill; `$MissionTarget_name` still has the idcode);
- wing at accept;
- sanction tier (RAP signal);
- pre-cap amounts need a second insertion point before EM 5683, or a stash there.

Stash on our own table keyed by `$Cue_Mission` (or set `$Cue_Mission.$swibh_*`; MD allows writing another cue's vars). [inferred]

Suggested diff points [read for lines; XPaths **unverified** until `make check`]:
1. Accept: `//cue[@name='Mission_Hunt_CreateMission']/actions/reset_cue[@cue='this']` pos="before" (5627).
2. Pre-cap: `//cue[@name='Mission_Hunt_Resolve']/actions/do_else/do_if[@value='$Result == $Result_success'][2]/do_if[@value='kEMissions.$IsSWIExists']` pos="before" (5683).
3. End: `//cue[@name='Mission_Hunt_Resolve']/actions/reset_cue[@cue='this']` pos="before" (5719); covers success, fail, abort.

## 4. Board offers

- Clean point: append to `Mission_Hunt/actions` (after 5369). Every offer, convo-generated or not, runs it once. In scope: `$MissionId`, `$MissionTarget` (alive: idcode, macro, class, size, owner), `$IsDisguised`, `$Faction`, `$MissionOffer_Station`, `$Difficulty`, `$BaseRewardData` (offer roll), `$RewardText`, `$TargetKillsDescription`, `$LastKnownDatas` (sightings). [read]
- One scan = one convo class pick (12106-12120): it first removes the previous pick's untaken offers, then creates one offer per pilot in the bucket. S bucket = small and medium, L bucket = large and XL (12099-12104, swi-bounty §4.1). Group lines by the pick's `player.age` to reconstruct a board. [read, inferred]
- `Missions_Hunts_CreateOffer` can skip a pilot (station not operational, relation < neutral, pilot already has a mission from that faction, player-owned: 5219-5227) after the convo counted it, so offers logged ≤ the "N missions" shown. [read]
- Also patch-on-load: `Mission_Hunt` actions don't re-run on load, so no duplicate offer lines. [inferred]

## Emitting JSON from MD

Plan: a TypeScript schema generates an MD library that writes one `[swibh] {json}` line per event. Sources: vanilla 8.00 `base/libraries/scriptproperties.xml` (SP), `base/libraries/common.xsd` (CX), `base/libraries/md.xsd` (MX), vanilla `base/md/*.xml`; 9.00 has the same string, money and time entries (9.00 SP 1786-1788, 2386-2398). "Report" = `tests/game/report.md` from the 2026-10-31 run; "harness" = `tests/game/swibh_tests/md/swibh_tests.xml`.

### 1. Building strings

- **Concatenation:** `+` with mixed types, e.g. `player.age + ' Boarding ticker…' + $x.count` (vanilla `md/boarding.xml` 1101; SWI `ext/aiscripts/trade.station.xml` 14). [read]
- **Format:** `'template'.[$a, $b]`. SP 1723 documents `%1, %2, …`; the harness uses `%s` throughout (harness 46, 186, 203) and the report shows it fills in order (report 15-26). [read] Only the template is parsed; values put in are not re-scanned [inferred]. How a literal `%` in the template is written is **unverified**: keep `%` out of templates.
- **What `%s` prints** (harness line against the report):
  - money: the raw integer in **ct (cents)**, with no unit and no separators. `500000Cr` (harness 169) prints `50000000` (report 21). So 1 Cr = 100 ct; money is "numeric, suffix ct" (SP 2323). For whole credits, use `($m / 1Cr)i` (vanilla idiom, `research/headhunter.md` 102), or log ct and divide in TS. [read] (Side note: report 13 calls `100000000` a "reward", but that is 1,000,000 Cr in ct.)
  - `.formatted.default` / `.formatted.{'%s'}` exist only on money (SP 2324-2325) and time (SP 2335-2336). They give localised display text ("full accuracy, without cents"), so don't use them in logs. [read]
  - length/float: `1265.75`, `6328.75` with no `m` suffix (report 20, 22; `$Ship.size` is length, SP 63). [read]
  - boolean: `1` / `0` (report 20, `isclass.ship_l 1`). [read] Write a JSON bool as `if $b then 'true' else 'false'`.
  - enum: its name, e.g. `$Ship.class` prints `ship_l` (report 20). [read]
  - `player.age`: type time (SP 2347). How it prints (decimals, an `s` suffix?) is **unverified**. Safe form: `(player.age)f`, since floats print as plain decimals (report 22), or an integer of ms such as `((player.age)f * 1000)i` (**unverified** syntax for the nested cast).
  - null: how it prints is **unverified**. Guard every optional field in the generator: `if $x == null then 'null' else …`.
  - a component printed raw (`$Origin` in vanilla `conversations.xml` 1613): format **unverified**; never emit one.
- **Stable ids to emit:** `$obj.idcode` "AAA-123" (SP 194); `$x.macro.id` (SP 2010; report 20 `hapan_nova_macro`); `$faction.id` (SP 1757; report 20 `newrepublic`); `$Ship.owner.id` (harness 186). `.knownname` (SP 49 component, SP 1760 faction) is display text: localised, and players can rename ships, so it is free text (see section 2).
- **`.{…}`** is a property lookup by expression: table key `$t.{$key}` (SP 1718), `formatted.{$fmt}`, `distanceto.{$x}`. A text-DB lookup is `{page,id}` (vanilla `conversations.xml` 228, `source="{1002,3014}"`), which gives localised text, so keep it out of logs. Braces inside string literals appear to stay literal: vanilla `finalisestations.xml` 36 builds `'({' + $Station + '})'` [read]. That a JSON `{` survives `debug_text` unchanged is **unverified**: check in the first game test.
- **XML layer:** every `"` in the template must be written `&quot;` in the attribute, e.g. `text="'{&quot;ev&quot;:&quot;accept&quot;,&quot;id&quot;:&quot;%s&quot;}'.[$MissionId]"`, and `<`/`&` need entities too. A `'` inside an MD string is `\'` (vanilla `conversations.xml` 1066; harness 243). [read]

### 2. Escaping free text

- The string datatype has only the format property: no length, substring, find or replace (SP 1722-1724). [read]
- **`<substitute_text text="$out" source="$in"><replace string="…" with="…"/>…</substitute_text>`** replaces **all** occurrences of each sub-string (CX 36768-36815; used in vanilla `conversations.xml` 228-230). It is an action, available in MD. [read]
- Writing a literal backslash in an MD string (`'\\'`?) is **unverified**, and so is whether several `<replace>` children run one after another on the running result.
- **Safe workaround (recommended):**
  1. Key everything on ids (idcode, macro.id, faction id, `$MissionId`), which are `[A-Za-z0-9_-]`.
  2. When a display name is needed, run it through a lossy sanitiser with no backslash in the output: `"` → `'`, `\` → `/`, newline `'\n'` → space. MD knows `\n` (vanilla `boarding.xml` 1101). Use one `substitute_text` per replacement.
  3. Treat names as hints in TS, never as keys.
- A fallback for the cases above that are **unverified**: emit names in a separate non-JSON field at the end of the line (e.g. `[swibh] {json}\tname=…`), so a bad name can't break the JSON.

### 3. debug_text and debug_to_file

- Attributes are `text` (required), `context` (bool, default true: "Include the context of this debug_text") and `filter`, one of error/general/scripts/scripts_verbose/economy_verbose/combat/savegame/none (default scripts) (CX 25553-25595). `chance` (a percentage) and `comment` come from the common action group (CX 7119-7135). Vanilla uses `context="false" chance="$DebugChance"` (`boarding.xml` 1101). [read]
- **Line shape:** the harness test fixture models it as `[Scripts] 40.01 *** Context:md.SWIBH_Tests.Begin<inst:2a1b>: [swibh-test] RUN START 2 tests` (`tests/GameTests.Check.ps1` 15-28). That is a hand-written fixture, not a captured log, so the exact prefix, the category tag for `filter="general"` and the `context="false"` form are **unverified**. The runner does not rely on the prefix: it matches `\[swibh-test\] …` anywhere in the line (`tools/run-game-tests.ps1` 103-124). The `[swibh]` parser should do the same: find `[swibh] ` and JSON-parse the rest of the line. Use `context="false"` to drop the cue path.
- Prefix and truncation: the XSD documents no length limit; truncation is **unverified**. Keep lines short (well under 1 KB) until a test with a long line has run.
- **Logging only happens with launch flags:** the harness starts X4 with `-debug all -logfile debuglog.txt -scriptlogfiles` (tests/game/README.md 11). Without `-logfile`, no `debuglog.txt` is written, and which filters log without `-debug` is **unverified**. Playtesters must add the flags to the Steam launch options.
- `debug_to_file name= directory= append= output=` writes to `Documents\Egosoft\X4\…\logs\<directory>\<name>`, **only with `-scriptlogfiles`**. Allowed extensions are .txt/.csv/.log/.xml; `append` defaults to true; `output=true` also echoes to the scripts debug output (CX 25597-25640; vanilla `finalisestations.xml` 36). A dedicated `swibh/hunts.log` of pure JSONL would avoid prefix parsing. Whether lines in that file carry a prefix is **unverified**.

### 4. Library cue with params

- `<library name="Log_HuntAccept" purpose="run_actions"><params><param name="MissionId"/><param name="Reward" default="null"/>…</params><actions>…</actions></library>` (MX 4706-4790). A param is required unless it has a `default` (MX 4734). Params are an unbounded sequence (MX 4716); `run_actions` takes unbounded `<param name= value=>` (MX 2989-3011). **No count limit in the schema.** [read]
- `run_actions` runs in the library's own temporary variable set, restored afterwards (recursion is fine), and can return a value with `<return>` (MX 2980-3020, 4775-4782; CX 30732). It is MD-only: the word is absent from `aiscripts.xsd`. The harness calls EM's library exactly this way (harness 193-198). [read]
- `include_actions` runs in the caller's context and takes **no params** (MX 2910-2925). That is fine for a "stash" snippet but not for a typed emitter. [read]
- **Generator shape:** one library per event; each schema field becomes a `<param>`, optional ones with `default="null"`. Per field, it emits a `set_value` that renders the JSON value (quote and sanitise strings, `'null'` guard, bools as true/false, money as ct). It ends with one `debug_text` built as `'{&quot;ev&quot;:&quot;<event>&quot;,&quot;v&quot;:1,…}'.[…]`, using `context="false"`. The call site is `<run_actions ref="md.SWIBH_Log.Log_HuntAccept"><param name="MissionId" value="$MissionId"/>…</run_actions>`.

### 5. Lists and tables

- `do_for_each name= in=` walks a list, group or table. `counter` works for lists only; `valuename` for tables only; `reverse` also exists (MX 4403-4412; CX 7003+). The `loop` keyword gives `loop.index/element/key/value` (SP 2625-2633). The harness loops over a list literal `[$L, $XL]` (harness 180). [read]
- List properties: `count`, `{$n}` (1-based), `last`, `indexof`, `min`/`max` (SP 1696-1708). Table properties: `keys.count`, `keys.list` (order only reliable for numeric keys, "can change between savegames"), `keys.sorted`, `{$key}`, `$name` (SP 1710-1720). [read]
- To build a JSON array, start from `'['`, append `','` before every element after the first (`loop.index gt 1`) and each rendered element, then close with `']'`. For tables, emit `{"k":v}` the same way, but in a fixed key order taken from the schema (`keys.list` order is not stable). Keep arrays short (see the truncation note in section 3). [inferred]

## Player losses during a hunt

Goal: one `[swibh]` line per player-owned ship destroyed, tagged with the active hunt(s), with a value, so the playtest report can set losses against bounty pay. Sources: vanilla 8.00 `base/libraries/common.xsd` (CX), `base/libraries/scriptproperties.xml` (SP), `base/md/*.xml`; EM = SWI 0.90 `ext/md/kuertee_emergent_missions.xml`; EM UI = `starwarsmod_m1/ui/kuertee_emergent_missions.lua`. 9.00 has the same events and properties (9.00 CX 13910, 15885; SP 241, 243).

### 1. Destroyed events [read unless marked]

| Event | Params (CX doc) | Notes |
|---|---|---|
| `event_player_owned_destroyed` (CX 15746-15758) | param = killed object, param2 = killer, param3 = kill method | Global, no `object=` needed. Optional filters `killed=`, `killer=`, `method=`. **Use this one.** |
| `event_object_destroyed` (CX 13814-13825) | object = destroyed, param = killer, param2 = kill method, param3 = was parent killed | Needs a specific `object=`/`group=`; good for the target's wing (wing-split-facts §6), not for "any player ship" |
| `event_player_owned_attacked` (CX 15280-15290) | object = attacked, param = attacker, param2 = kill method, param3 = attacked component | No damage amount |
| `event_object_attacked` (CX 12944-12956) | same as above, per object | No damage amount |
| `event_player_owned_killed_object` (CX 15760) | param = killer, param2 = killed, param3 = method | The player side's kills (other direction) |

Vanilla's own loss handler is the model: `notifications.xml` 116-215 `PlayerOwnedKilled` (logbook "X was destroyed"):
- Filters 118-121: `event.param.isclass.defensible and not ismasstraffic/isunit/isdeployable/isclass.ship_xs/isclass.buildstorage`, and `event.param3 != killmethod.collected` / `!= killmethod.removed` ("spacesuit is removed"). So the event also fires for drones, deployables, spacesuits and stations; copy these filters and add `event.param.isclass.ship`.
- It reads `$killed.commander` first, "in case pilot is ejected which will also remove the commander information" (125), and ejects the pilot last because "otherwise, ownership information is lost" (178). So the object is still readable inside the handler; `notifications.xml` 558 also says "the destroyed object may still be operational when this event is handled". Read everything (value, idcode, macro, sector, commander) in the same action block. Whether `.value` is still the pre-death value there is **unverified**.
- Killer may be a component (turret) rather than a ship: vanilla uses `if $killer.isclass.defensible then $killer else @$killer.defensible` (196-197). It only names the killer for `killmethod.hitbybullet/hitbymissile/lowattentionattack` (196). Other methods seen in vanilla MD: `hitbyareadamage`, `hitbybomb`, `collected`, `detached`, `removed`. Killer can be null (collisions etc.) **unverified**; guard with `@`.
- **Player's own piloted ship:** it is player-owned, and `PlayerOwnedKilled` has no `player.occupiedship` exclusion, so the event should fire for it too **unverified**. Player death itself is caught in vanilla by `event_object_destroyed object="player.entity"` (e.g. `tutorial_flight.xml` 15-17 `PlayerDied`). Death ends the session (reload), so a line written in the same frame must reach the log before the game-over flow; whether `debug_text` flushes then is **unverified**. Log `isplayership = (event.param == player.occupiedship)` to tell them apart; if `player.occupiedship` is already null at that point, compare with a stashed value **unverified**.

### 2. Ship value [read unless marked]

| Expression | What it is | Includes |
|---|---|---|
| `$ship.value` (SP 238, object datatype) | "current value of this object, including value of units and upgrades" (money) | hull + equipment/upgrades + units (drones). **Crew and cargo not mentioned** (inferred: not included). Whether damage lowers it is **unverified** |
| `$ship.buildresourcevalue` (SP 239) | value from the resources needed to build it and its units and upgrades | same scope, resource-based |
| `$ship.repairprice` (SP 240) | "current repair cost of object, using average prices" | cheap single read; used by `aiscripts/order.repair.xml` 22, 190-201 and `order.restock.xml` 38 |
| `$ship.macro.ware.averageprice` (SP macro 2009+ `ware`, ware `averageprice` SP 1843) | hull-only list price | no loadout |
| `$ship.loadout.wares` (SP 467, 1680-1682) | warelist of equipment | sum `$w.averageprice` yourself |
| `$ship.people.count`, `.people.{entityrole}.count` (SP 375-380) | crew headcount | no money value |

Vanilla scripts that price ships: `md/gm_getexactfleet.xml` 976 (`$FleetValue` += `$Ship.value`) and 1100-1135 (macro `averageprice` + wares + ammo + mods, for ships not yet built); `md/gm_rescue_ship_2.xml` 1082 (reward = 10 % of `.value`); `md/rml_rescueship_2.xml` 121 (`$InitialSalvageShipValue = $SalvageShip.value`); `md/player_evaluator.xml` 198 (player fleet worth by `buildresourcevalue`). No vanilla insurance mechanic found. **Recommendation:** log `value` (ct) as the loss figure, plus `macro.id` and `class` so TS can re-price from `wares.xml` if needed.

### 3. Damage short of destruction [read]

- Readable any time: `hull`, `maxhull`, `hullpercentage`, `shield`, `maxshield`, `shieldpercentage` (SP 168-173); `repairprice` (SP 240) for a money figure.
- Events with an amount: `event_object_hull_damaged` (CX 12986, param2 = new hull, param3 = damage) and `event_object_shield_damaged` (CX 12973, same shape). Both need `object=`/`group=` per ship, and fire per hit, so they are costly fleet-wide. `event_player_owned_attacked` carries no amount.
- Cheap approach: at hunt end (Resolve), loop the player's ships near the target or in the player's fleet and log `repairprice` summed, or snapshot `repairprice` at accept and at end. Repairs between the two hide damage **unverified**.

### 4. More than one hunt at once [read]

- **Yes.** `Missions_Hunts.$missions_active` is a list (init 5095, append 5625, remove 5532); the "only one" guard is commented out (`<!-- <check_value value="Missions_Hunts.$missions_active.count == 0" /> -->`, EM 5216). The MD accept path has no limit check (`Mission_Hunt_Accept` 5567-5585).
- The only limits:
  - **Accepts per rolling hour:** `$missionsPerHour_max` = 3 (EM 5098), +3 at RAP silver / +4 at gold access key within 3 h (5180-5188); accept times in `$missionTimes` (appended 5581, pruned after 1 h 5190-5194). Enforced only in the map UI: `isOffersCanBeAccepted = false` when count ≥ max (EM UI 154-156, 188-197), reason texts 11513/543, 545 (EM UI 244-250). Hooked into SWI's `menu_map` via `registerCallback("createMissionContext_getIsMissionAcceptable", …)` (EM UI 19). Whether the SWI convo-briefing accept path also honours it is **unverified**.
  - **One mission per target:** an offer whose target is already in an active hunt is not acceptable (EM UI 199-217, reason 544); and a pilot with a mission from that faction is not offered again (EM 5223).
- So a loss must be attributed to **every** active hunt, or to the one whose target/wing killed it: iterate `md.kuertee_emergent_missions.Missions_Hunts.$missions_active` (or `global.$Missions_Hunts.$missions_active`, EM 20, 5158) and skip cues where `not $c.hasmission`.
- **Playtest observation (user, 2026-11-02):** with a hunt active, the manager's conversation options changed and offered no way to ask for another mission. So in play the conversation path seems to allow one hunt at a time, even though the script allows several. Not yet traced in EM's conversation code. Logging still carries a list of active hunts (0..n), so it holds either way.

### 5. Was the killer from the target's wing?

From wing-split-facts.md (not re-derived): `$ship.commander`, `.subordinates` (direct), `.allsubordinates` (whole tree) (§2 table, SP 325-358; §3); EM does not track escorts, so record the wing at accept or at split and listen with `event_object_destroyed group=` (§6 "Escorts and escorts killed"); RAP's `Attacker_Event` (RAP 5734-) counts kills of ships whose commander is a mission target, in silent scores only (§6). New here [read]: `toplevelcommander` (SP 334). Test, for each active hunt `$c`:

1. `$k = if $killer.isclass.defensible then $killer else @$killer.defensible` (see §1).
2. `$k == $c.$MissionTarget` → `byTarget`.
3. `$c.$swibh_wing.indexof.{$k}` (list stashed at accept/split: `$MissionTarget.allsubordinates` plus its commander chain) → `byWing`. Live checks `$k.commander == $c.$MissionTarget` or `@$k.toplevelcommander == @$c.$MissionTarget.toplevelcommander` also work but **fail after our split** (escorts lose their commander) and after the target dies, so the stash is the reliable source [inferred].
4. Else, same `$k.trueowner` as `$c.$MissionTarget.trueowner` (stashed at accept) → `byFaction`; otherwise `other`. Faction alone is weak (any patrol of that faction matches) [inferred].

Suggested line: `{"ev":"loss","t":<age>,"ship":idcode,"macro":id,"class":…,"value":ct,"repair":ct?,"method":…,"killer":idcode|null,"killerOwner":factionId,"isPlayerShip":bool,"hunts":[{"id":MissionId,"rel":"target|wing|faction|other"}]}`. Cue: `<cue name="Loss" instantiate="true"><conditions><event_player_owned_destroyed/><check_value value="event.param.isclass.ship and …"/></conditions>` [inferred; XML **unverified** until `make check`].

## #19 implementation status

Built 2026-11-02 ([#19](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/19)): `extension/swibh/` (`content.xml`, `md/swibh_hunt.xml`, and the diff `extensions/starwarsmod_m1/md/kuertee_emergent_missions.xml`). The diff only adds four `run_actions` calls; `swibh_hunt.xml` reads EM's hunt cue and changes nothing in EM. `make check` shows each `sel` matches one node in SWI 0.90's EM, and both files are valid against 8.00's `md.xsd`/`diff.xsd`.

| Hook | `sel` (under `Mission_Hunt/cues/`) | Writes |
|---|---|---|
| `Accept` | `Mission_Hunt_CreateMission/actions/reset_cue[@cue='this']`, before | `hunt.accept`; the stash; starts the per-hunt `Watch` (`hunt.kill`, `event_object_destroyed` on target + wing) |
| `PreCap` | `Mission_Hunt_Resolve/actions/do_else[2]/do_if[@value='$Result == $Result_success'][2]/do_if[@value='kEMissions.$IsSWIExists']`, before | stashes the pay before the cap |
| `Resolve` | `Mission_Hunt_Resolve/actions/reset_cue[@cue='this']`, before | `hunt.end` (success, fail, abort) |
| `CleanUp` | `Mission_Hunt_CleanUp/actions`, prepend | stashes the ending from the step flags; `hunt.end` 1 s later if Resolve wrote none |

Not on EM: `hunt.sanction` listens to `event_cue_signalled cue="md.kuertee_professions.SanctionAttack"` (no diff on RAP), cost from the hunt cue's `$kProfs_sanctionCost_*`; `player.loss` on `event_player_owned_destroyed` (vanilla's class filters, ships only, no kill-method filter), `activeHunts` from our own open-hunt table rather than `$missions_active`; `session.start` on `md.Setup.GameStart` and `event_game_loaded`.

Decisions in the code:
- **Accept hook in `Mission_Hunt_CreateMission`, not `Mission_Hunt_Accept`** (the issue names the latter): the mission only exists from there, and it runs once. So the hunt key's accept t is the mission's creation (the same frame in SWI mode, 6344), and an accept whose contact NPC fails (6369-6383) writes no `hunt.accept`.
- **Exactly one `hunt.end`:** the stash (`Hunts.$Open`, by hunt key) lives in our script, not on EM's cue, which CleanUp2 cancels. `Resolve` and the late check (`LateEnd`, 1 s after CleanUp) both write through `End`, which closes the hunt, so whichever runs first wins. This covers the ordering risk either way: if Resolve runs after CleanUp, its full data wins; if CleanUp2 cancels it, the late check writes `failed` with the step from EM's flags. Offers never accepted have no record, so CleanUp ignores them.
- **Wing:** the top ship commander above the target (a station isn't one) and all ships under it, minus the target.
- **Target's kills:** from the live pilot at the end, else as read when the target died (the `Watch`), else null.
- **Repairs:** `player.occupiedship`, else the ship the player flew at accept (Resolve on success runs when the player talks to the contact, usually on foot), and its `allsubordinates`.
- **Relations:** only EM's mission-completed notoriety (`$RewardNotoriety`). The game's relation losses for the kill aren't logged in v1.
- **Engagements (#23):** `Accept` calls `md.SWIBH_Engagement.HuntStarted` with the hunt key and target, and `End` calls `HuntEnded`, so the player's fights with the target's wing carry the hunt key. `HuntStarted` takes its own wing (every ship under the target's top commander), so it can count a drone our `hunt.accept` wing leaves out.
- **Game test setup:** the runner copies `extension/swibh/md/*.xml` into the test extension (#23's approach) rather than installing `swibh`, so the test doesn't load swibh's `content.xml` or the diff on EM. A real `swibh` install left in the game while `make game-test` runs would load every swibh script twice.

Gaps, still open (no in-game answer yet; `make game-test` with `hunt_log` needs the user's OK, and its fake hunts bypass EM, so these need a playtest):
- Whether Resolve runs on a timeout or a kill by others. Either way one `hunt.end` is written, so the log doesn't depend on the answer. To answer it in a playtest: after a timeout, look for EM's failure text in the logbook (Resolve writes it, section 1).
- Whether `event_player_owned_destroyed` fires for the piloted ship, and whether `player.occupiedship` still names it in that handler: `piloted` is `$Lost == @player.occupiedship`, so it is always false if X4 clears the seat first. If the event doesn't fire, a player death shows no `player.loss`. Not handled yet: the issue's "also listen for player death" waits on the playtest answer.
- How `player.age`, `level.medium` and floats print; whether `{` and `"` survive `debug_text`; long-line truncation. The first `make game-test` with `hunt_log` answers these (`make game-test`'s log check fails on any parse error).
- Not covered at all: `reset emissions` (no CleanUp, so a hunt stays open in our table and in `activeHunts`), a target that is captured, and a hunt whose contact NPC fails (no mission, so no `hunt.accept`).
