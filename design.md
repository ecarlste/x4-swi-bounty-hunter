# No Disintegrations (Okay, Maybe a Few): design

Status: **agreed in the grilling session of 2026-11-01.** "No Disintegrations (Okay, Maybe a Few)" is a working title; the name gets its own brainstorming session later.

[Back to the concept](concept.md)

## What it is

A bounty hunting system for Star Wars Interworlds 0.90 on X4 8.00, as a separate extension loaded on top of SWI. Its goal: any SWI player can make a living purely as a bounty hunter at every ship size, stays in the action, and plays it with a community watching. Being hunted in turn by hunters that hostile factions pay is on the roadmap.

- Internal ID and folder: `swibh` (plain, so the display name can change without breaking saves). Depends on `SW Interworlds`.
- Not part of A Pirate's Life for now. That's a 9.x mod with no SWI profile yet ([research/cap-fix-facts.md](research/cap-fix-facts.md)). Keep it in mind for when SWI reaches 9.x.
- Works on existing saves where it can. A diff patch on SWI's MD libraries takes effect when a save loads (high confidence, to be proven by T12). It's preferred, not required.

## Features, in build order

### 1. Patch proof and per-hunt logging

- **T12:** prove that a diff patch on SWI's `md/kuertee_emergent_missions.xml` applies.
- **Logging:** the extension writes one line, `[swibh-hunt] {json}`, to the debug log for each hunt's ending: success, failure or abort. Every ending goes through `Mission_Hunt_Resolve` (EM 5630-5721). Each line records:
  - the target's class and size;
  - the offered and paid amounts;
  - the sanction tier;
  - each wingman's roll and its inputs;
  - loyal wingmen killed, and the bonus paid for them;
  - relation changes;
  - time taken.

  The sanction tier, escorts and relation changes have to be recorded as they happen ([research/wing-split-facts.md](research/wing-split-facts.md)). The player's own losses are noted by hand until there's a hook for them.
- **Collecting the log:** `make hunt-log`, run after each play session (X4 rewrites `debuglog.txt` at each launch). It adds new hunts to `data/hunts.csv`, skips hunts already recorded (keyed by mission and game time), and rebuilds `data/hunts-summary.md`. The data is what we tune the wing roll and the pay with.

### 2. The wing roll

This applies on **every** hunt whose target leads a wing, with or without a sanction.

- **When:** once per hunt, the first time the target comes into range. It's triggered by range, not by comms.
- **The roll:** each wingman rolls on its own. The bail chance comes from:
  - the wingman pilot's morale;
  - the player's combat ships near the target, weighted by class, against the target's wing. This borrows Head Hunter's way of counting ships ([research/headhunter-wings.md](research/headhunter-wings.md)).

  The roll and its inputs are logged.
- **Bailers:** stop firing, fly to another sector and carry on with their normal orders there. They stay in the universe and can be met again. They stay neutral, so shooting one anyway costs the usual relation.
- **Loyal wingmen:** made hostile to the player individually, with relation behaviour disabled (as Head Hunter does with its hunters), so attacking and killing them costs nothing with their faction. Each one *killed* adds 50% of a new reward roll for its own class to the hunt's pay. Survivors, and those who bail mid-fight, pay nothing.
- **Mechanics** ([research/wing-split-facts.md](research/wing-split-facts.md)):
  - Removing the commander isn't enough, because an escort's order re-attaches it to its leader. Each wingman needs new orders.
  - Escorts of escorts follow their own leader.
  - SWI's own detach (RAP 6762-6774) still covers a target that is a follower.
- **The sanction stays as it is:** no police or station response, and (Full) no relation loss for attacking the target. Two things remain open: the sanction's purpose now that the wing roll exists, and full immunity's price (1.15M Cr against a 220k hunt).

### 3. Remove the L/XL pay cap

Patch `CapRewardBasedOnMissionTarget` so that `$rewardCap_mult` stays 0, which skips the cap. L/XL hunts then pay what the offer shows. Only the Hunt uses the cap ([research/cap-fix-facts.md](research/cap-fix-facts.md)). Big targets are harder and should pay a lot, so the pay gets tuned later from the logged data.

### Later (deferred)

- **"Give up or die" hail:** a surrender option, possibly with intimidation that shifts the wing roll. Vanilla's Surrender hail and SWI's bail roll are starting points.
- **Full immunity's price, and what the sanction is for.**
- **Hunters hunting the player,** paid by factions that dislike the player.
- **Grilling:** which Head Hunter features the series wants.
- **A brainstorming session on the name.**

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
- **Existing tools:** `tools/check_game_tests.py` stays in Python until its next real change, then gets ported to TypeScript.
