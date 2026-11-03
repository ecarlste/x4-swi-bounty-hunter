# Playtest: the stock bounty loop

Status: **in play (session started 2026-11-03); notes so far are under [Notes](#notes).**

**Resume here (2026-11-03):** the write-up lives on branch `worktree-issue-4` (worktree `.claude/worktrees/issue-4`); start the next session there. **Note-taking rule:** this file is the only record. Log each finding here as it comes up, keep this block current (where play stands, next step, open questions), and move anything from scratch folders into the repo before a `/clear`. Where play stands: the opening (T07) and the first board at Celanon are done; the player is about to save and accept the S hunt on the BLS Kihraxz (WCP-957), then scout its wing before engaging. Still to do from the checklist: the hunt log rows, T03's menu location ("... more. (Mods)" or top level), T05 police licence, T18 vanilla missions, T06 named hunters, S-hunt pay per hour for Shaddo's debt (#3), and the After-the-session steps. Then resolve the wayfinder ticket: resolution comment, close, pointer on the map, PR with `Closes #4`. Wayfinder ticket [Playtest the stock bounty loop](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/4). Its result feeds [Extension scope at launch](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/11).

The question: how good is SWI 0.90's stock bounty loop over a long series, for contract variety, pay at each ship size, and pacing?

Background: how a hunt works is in [bounty-research.md](../bounty-research.md#a-hunt-start-to-finish). Pay facts already proven: the L/XL pay cap (about 60 Cr, T01) and S pay matching the formula (220,810 Cr for AEL-112, T02).

## Rules (agreed 2026-11-01)

- **Length:** one session of about 3 hours of real time.
- **Install:** X4 8.00 HF4 + DLCs + SWI 0.90, no other mods. Write the version line in the header below.
- **Start:** a fresh Bankrupt Bounty Hunter game. Use a new save slot; don't overwrite save_007.
- **Money from bounty work only:** SWI hunts, vanilla police kill bounties, and bounty-like vanilla missions (Assassinate, Destroy Rarely On Sight, Track Ship, Kill Mass Traffic, Board Ship). No trading or mining. If you have to break this rule to keep going, write down when and why: that's a finding.
- **L/XL hunts:** note the offers (count, targets, offered pay), but don't fly them. The cap is already proven.
- **Saves:** save before each hunt and after the session, so agents can check pay in the save later.

## Before you start

- [ ] Launch with `-debug all -logfile debuglog.txt` so SWI's own debug lines (`SanctionAttack_Visible`, `PlayerKills`) are kept. X4 overwrites `debuglog.txt` at each launch: copy it out after the session, before relaunching.
- [ ] Write the time you start, in real time and game time.
- [ ] Turn on screenshots or recording if you want material. Optional.

## During the session

### Opening (the first ~30 min)

- [ ] Do the start's two Hutt R-41s reach you? What happens? (T07)
- [ ] How long until you can take your first hunt, and what was in the way (distance to a wharf, money, the ship)?
- [ ] At a Bounty Hunters wharf trade NPC: where are the hunt options (top level, or under "... more. (Mods)")? (T03)
- [ ] Does a police licence pay vanilla kill bounties in Hutt space? (T05)

### Each hunt: one row in the hunt log below

- [ ] Wharf, offering faction, size class chosen (S/M or L/XL).
- [ ] How many offers the board showed, and how many were within reach of the Fortitude (or your current ship).
- [ ] Target: class, ship, faction, alone or in a wing.
- [ ] Offered pay (kill part + "up to"), and what it actually paid.
- [ ] Real time from accepting to being paid, and how much of it was travel vs. search vs. fighting.
- [ ] Debrief: did it finish over comms, or did you have to dock? (T04)
- [ ] Ending: success, failure, abort, and why.
- [ ] Sanction bought (tier and cost) or not. Relation changes you noticed.
- [ ] Fun, 1 to 5, plus one line: would this hunt make a good episode segment?

### Each time you're at a board

- [ ] L/XL offers: count, a few targets, offered pay range. Don't fly them.
- [ ] Did you hit the 3-accepts-per-hour limit? How long did you wait?
- [ ] Is the board thin (few offers, all far away)? Note which wharf and faction. (T15)

### Along the way

- [ ] Any bounty-like vanilla missions offered (Assassinate, etc.): what was there, and did you take any? (T18)
- [ ] Named hunters (Boba Fett, Cad Bane, etc.) seen: who, where, what they were doing. (T06)
- [ ] Dead time: anything that took long and was dull (long flights, waiting on the hourly limit, searching beacons).
- [ ] Moments that would make good series material.
- [ ] Bugs or confusing text (for example "Reward: Reward:", the wrong "time left").

## After the session

- [ ] Write the time you stop, in real time and game time, and your balance at the start and end.
- [ ] Fill the money and relation columns from the end save's logbook with the [playtest logbook extractor](../tests/game/README.md#playtest-logbook-extractor). Copy the end save to a scratch folder first (never run it in the save folder), then run `node tools/playtest-log.ts <scratch folder>/save_NNN.xml.gz --since <game time you started>`. Paste its hunt rows (paid, ending, offering faction), other income and relation changes into the Results below, and its pacing summary under Verdict. Aborted hunts leave no logbook entry: add those by hand.
- [ ] If the `swibh` extension was installed, copy `debuglog.txt` out and run `make hunt-log LOG=<copy>` ([hunt log](../tests/game/README.md#hunt-log-make-hunt-log)). Paste the net and pay per game hour from `data/hunts-summary.md` under Verdict, and commit `data/`. With stock SWI only, there are no log events: skip this.
- [ ] Ship upgrades you could afford, and when.
- [ ] Answer the three questions in "Verdict" below.
- [ ] Tell Claude the saves to check, and anything still to confirm.

## Results

Header: date, install version line, save names, real time played, game time played.

- Date: 2026-11-03. Save name "Bankrupt Bounty Hunter - New Save - Test 2" (`quicksave` at 310 s game time, `save_008` at 683 s).

### Hunt log

| # | Wharf / offering faction | Size | Offers (in reach / total) | Target (class, faction, wing?) | Offered (kill + up to) | Paid | Real time (travel / search / fight) | Debrief | Ending | Sanction | Fun 1-5 | Note |
| - | - | - | - | - | - | - | - | - | - | - | - | - |

### L/XL offers seen

| When | Wharf / offering faction | Count | Example targets | Offered pay range |
| - | - | - | - | - |
| First visit (2026-11-03) | Celanon / ASC | 13, all difficulty Hard | IMP Victory II Star Destroyer, NRL Nebulon-B/-C escorts, MC80A heavy star cruiser, Dreadnought, Pelta II, MC80R Reef Home, Refurbished ISD-I, GR-500 miner, REB Nebulon-B | kill part 8,974-2,856,686 Cr; "up to" 1,007,630-1,687,010 Cr. T01's cap pays about 60 Cr, so the board promises millions it won't pay |

### Other income

| When | Source (police bounty, Assassinate, ...) | Amount | Note |
| - | - | - | - |

### Notes

- (Opening, named hunters, vanilla missions, dead time, series moments, bugs.)

#### Opening: the two Hutt R-41s (T07)

- The Fortitude can't win the fight: two R-41s with missiles are too much. One at a time might be doable.
- Running works. They followed across sectors to a Hutt wharf and kept shooting the Fortitude on the pad while the player sat in it.
- Docking ends their Attack order (retested from the quicksave: docking alone is enough, getting out of the ship isn't needed). About 10 min of game time after the start they turn blue on the map and stay neutral: after undocking, flying up and scanning them, they didn't attack.
- Why, from the saves (agent read, 2026-11-03; full detail in [research/r41-deaggro.md](../research/r41-deaggro.md)): at 310 s both had one temporary Attack order on the Fortitude (`checkrelation` false) and a pilot relation boost of -1 toward the player, set at 10.03 s for 600 s. At 683 s both are on their default Patrol order (`checkrelation=1`), with no reference to the player's ship and no boost. Faction relation huttpirates/player is -0.0032 (neutral) in both. The boost comes from vanilla `aiscripts/order.fight.attack.object.xml` 778-779 (an Attack order on a non-hostile forces hostility). A docked target is dropped (749-752, then 1251-1276) and the order cancels with no other target (1314-1325); both ships changed combat state at 339.3 s. SWI only issues the order and disables relation changes (`ext/md/setup_gamestarts_sw.xml` 1593-1598). Unverified: the exact docking time.
- Series read: the opening is "survive the first 10 minutes": run and dock, no fight to win. The extension probably needn't touch the R-41 wave.

#### Reaching the first hunt

- The only Bounty Hunters wharf known at start is in Celanon, a long flight. The HQ's location isn't given in game; the player only knew it from earlier SWI play. A new player has no pointer to it.
- Candidate fixes (from [research/headhunter.md](../research/headhunter.md)): Head Hunter's general kill bounty (§2), wanted board on the map (§8) and wanted-ship-nearby alerts (§9-10) all give bounty work away from a wharf. Head Hunter has nothing for finding the HQ: a reveal at start or a line from Bobby could.

#### First board: Celanon wharf

- IMP: 6 Search and destroy offers, 2 S (BLS Kihraxz WCP-957: 28,421.25 Cr + up to 73,510; NRL Patrol X-wing T65B WXW-831: 16,805 + up to 73,160), 4 M (BLS Cumulus, BLS and HTP Gozanti Corsair, NRL Patrol CR-90A: 18-78 k + up to 202-240 k). Every other faction had at most 4 S/M offers. Thin for a new player in a Fortitude (T15). By contrast ASC alone had 13 L/XL offers (see [L/XL offers seen](#lxl-offers-seen)): the board is mostly hunts a new player can't fly and that the cap wouldn't pay.
- The right-hand column ("Medium" on all six) is difficulty, not size.
- Bug: every offer reads "Reward: Reward:". Credits show fractions (".50 Cr").
- **UX gap:** the offer doesn't say whether the target flies alone or in a wing, or whether it leads or follows. You find out only after accepting and searching, which can be a long trip for a fight the Fortitude can't take.
  - Reference: Starsector's bounties list the target's escorts, and sum up the rest when there are too many ("several other small ships").
  - Head Hunter shows no wing. Its board refreshes every 3 s while open; bounty is exact, but position is live only in sensor range and otherwise the "last spotted" sector (greyed), updated by kills or the player's scans ([research/headhunter.md](../research/headhunter.md) §8-10).
  - **Preference (2026-11-03):** show the wing as last-known intel ("last seen with 2 S fighters, 40 min ago"), which can be wrong, rather than exact live data the hunter shouldn't have. For [Extension scope at launch](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/11); the extension's pay already counts the target's wing ([design.md](../design.md)).

### Verdict

- **Variety:** does the loop stay interesting over a series, or does it repeat after a few hunts?
- **Pay:** is S/M hunting a living from the Fortitude onward? How long until the next ship?
- **Pacing:** hunts per hour, and how much of an hour is action. Is it enough for an episode?
- **What the extension must add before episode 1** (input for [Extension scope at launch](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/11)):
