# No Disintegrations - SWI Bounty Hunting: design

Status: **agreed in the grilling session of 2026-11-01.** The display name "No Disintegrations - SWI Bounty Hunting" was decided on 2026-11-02 ([#12](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/12)). It's used in `content.xml`, on the Nexus page, and in wiki and showcase titles. It's separate from the series and channel names. The repo name, the `swibh` id and folder, and the `[swibh]` log prefix stay as they are. Before release, check that no Nexus mod already uses the name.

[Back to the concept](concept.md)

## What it is

A bounty hunting system for Star Wars Interworlds 0.90 on X4 8.00 (moving to 0.91 HF1 in [#42](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/42); the hunt and the cap are unchanged there, see [research/swi-0.91-diff.md](research/swi-0.91-diff.md)), as a separate extension loaded on top of SWI. Its goal: any SWI player can make a living purely as a bounty hunter at every ship size, stays in the action, and plays it with a community watching. Being hunted in turn by hunters that hostile factions pay is on the roadmap.

- Internal ID and folder: `swibh` (plain, so the display name can change without breaking saves). Depends on `SW Interworlds`.
- Not part of A Pirate's Life for now. That's a 9.x mod with no SWI profile yet ([research/cap-fix-facts.md](research/cap-fix-facts.md)). Keep it in mind for when SWI reaches 9.x.
- Works on existing saves. A diff patch on SWI's MD libraries takes effect when a save loads (proven by T12, on a new game and an existing save). A pre-release may need a new game; a release on Nexus must work on existing saves (decided 2026-11-01; release criteria in [#13](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/13)).

## Features, in build order

### 1. Patch proof and per-hunt logging

Decided 2026-11-02 (grilling); facts in [research/hunt-logging-hooks.md](research/hunt-logging-hooks.md).

- **T12** ([#17](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/17)): a diff patch on SWI's `md/kuertee_emergent_missions.xml` applies, on a new game and an existing save (passed 2026-11-02).
- **Log events** ([ADR 0001](docs/adr/0001-one-schema-for-log-events.md), [#18](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/18)): one TypeScript schema in `tools/log/` defines every event; the MD library `extension/swibh/md/swibh_log.xml` and the extractors' parser are generated from it. Every line is `[swibh] {"v","type","t","wall","hunt"?,"data"}`: money in ct, game time as `player.age`, wall time as local `player.systemtime` ([ADR 0002](docs/adr/0002-wall-clock-stamp-on-log-events.md)), ids rather than free text. The logger records facts; extractors judge.
- **v1 events** ([#19](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/19)), for the stock SWI hunt; later features add fields under a new `v`:
  - `session.start` on game start and load, so reloads show;
  - `hunt.accept`: offering faction, wharf, difficulty, target and size class, offered pay, the wing, sanction tier. Stashed here because EM loses them by the end. Sets the **hunt key** `<mission N>-<target idcode>-<accept t>`;
  - `hunt.sanction` and `hunt.kill` as they happen ([research/wing-split-facts.md](research/wing-split-facts.md));
  - `hunt.end` for success, failure or abort (all pass `Mission_Hunt_Resolve`, EM 5630-5721): failed step, paid split before and after the cap, target's kills, player's engagements, relation changes, the player's wing's repair prices;
  - `player.loss` for every player ship destroyed, hunt or not: value (hull, upgrades, drones), killer, and each active hunt with whether its wing made the kill.
- **Later:** wing-roll inputs and the loyal-wingman bonus with feature 2; `hunt.offer` board scan ([#21](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/21)).
- **Collecting the log** ([#20](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/20)): `make hunt-log`, run after each play session (X4 rewrites `debuglog.txt` at each launch). It adds new hunts to `data/hunts.csv`, skips hunts already recorded (by hunt key), and rebuilds `data/hunts-summary.md`. It attributes losses to hunts, reports net = paid - losses - repairs, and lists **open hunts** apart from the stats; their events wait in `data/hunts-open.jsonl` for the log they end in. Loading an older save undoes the events after its game time. Built and tested on fixture logs ([tests/game/README.md](tests/game/README.md#hunt-log-make-hunt-log)); no real log yet. The data is what we tune the wing roll and the pay with. The #14 logbook extractor keeps reading saves.
- **Edit markers** ([#22](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/22)): `make edit-markers REC=<recording>` lists one recording's edit markers with their positions in the video, from each event's `wall` time minus the recording's start (the OBS file name, or a time given by hand). Engagement events ([#23](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/23)) add fight markers.

### 2. The wing roll

This applies on **every** hunt whose target leads a wing, with or without a sanction.

- **When:** once per hunt, the first time the target comes into range. It's triggered by range, not by comms.
- **The roll:** each wingman rolls on its own. The desertion chance comes from:
  - the wingman pilot's morale;
  - the player's combat ships near the target, weighted by class, against the target's wing. This borrows Head Hunter's way of counting ships ([research/headhunter-wings.md](research/headhunter-wings.md)).

  The roll and its inputs are logged.
- **Deserters:** stop firing, fly to another sector and carry on with their normal orders there. They stay in the universe and can be met again. They stay neutral, so shooting one anyway costs the usual relation.
- **Loyal wingmen:** made hostile to the player individually, with relation behaviour disabled (as Head Hunter does with its hunters), so attacking and killing them costs nothing with their faction. Each one *killed* adds 50% of a new reward roll for its own class to the hunt's pay. It counts whoever lands the kill, if the player or any player-owned ship damaged it in the last 10 minutes (a guess to tune; check Better Kill Credit doesn't double-count) ([Head Hunter: general kill bounty](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/58)). Survivors, and those who desert mid-fight, pay nothing.
- **Mechanics** ([research/wing-split-facts.md](research/wing-split-facts.md)):
  - Removing the commander isn't enough, because an escort's order re-attaches it to its leader. Each wingman needs new orders.
  - Escorts of escorts follow their own leader.
  - SWI's own detach (RAP 6762-6774; 6781-6793 in 0.91) still covers a target that is a follower.
- **The sanction stays as it is:** no police or station response, and (Full) no relation loss for attacking the target. Two things remain open: the sanction's purpose now that the wing roll exists, and full immunity's price (1.15M Cr against a 220k hunt).

### 3. Remove the L/XL pay cap

Patch `CapRewardBasedOnMissionTarget` so that `$rewardCap_mult` stays 0, which skips the cap. L/XL hunts then pay what the offer shows. Only the Hunt uses the cap ([research/cap-fix-facts.md](research/cap-fix-facts.md)). Big targets are harder and should pay a lot, so the pay gets tuned later from the logged data.

### Later (deferred)

- **"Give up or die" hail:** a surrender option, possibly with intimidation that shifts the wing roll. Vanilla's Surrender hail and SWI's bail roll are starting points.
- **Full immunity's price, and what the sanction is for.**
- **Hunters hunting the player,** paid by factions that dislike the player.
- **Grilling:** which Head Hunter features the series wants.

## Proof

Every feature is proven by automated tests in `make game-test` as it's built. Playtests are for flow and feel.

- **T12:** the patch applies.
- **Split test:** spawn a piloted leader with escorts, run the roll with fixed odds, then check each wingman's leader, orders and relation behaviour.
- **Cap tests:** `t01_pay_cap` and `t01_knw904` rerun, now expecting the full offer amount.
- **S/M pay:** unchanged (automated T02).
- **Relations:** killing a loyal wingman costs no relation, including SWI's own relation hits.

## Repo and tooling

- **Extension source:** `extension/swibh/`. `make install` copies it into the 8.00 install's `extensions/` folder, refuses while X4 is running, and every install gets a row in [mods.md](mods.md).
- **Scripts in TypeScript:** run with Node 26's built-in TypeScript support (`node tools/<name>.ts`). `typescript` is a dev dependency, used for a type check in `make check`.
- **Languages:** TypeScript first, PowerShell only for the Windows side, and no other language without a reason ([ADR 0003](docs/adr/0003-typescript-first-fewest-languages.md)). A test in `make check` (`tools/languages.test.ts`) fails on a tracked file in any other language, outside `research/`.
- **Offline checks:** `tools/offline-check.ts` (`make check-xml`), one module per check in `tools/offline-check/`, with fixture tests. It replaced `check_game_tests.py`; MD-diff `sel`s are now counted with real XPath, as X4 reads them (`a[@x='y'][2]` is the 2nd match).
