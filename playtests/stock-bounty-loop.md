# Playtest: the stock bounty loop

Status: **checklist ready, not played yet.** Wayfinder ticket [Playtest the stock bounty loop](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/4). Its result feeds [Extension scope at launch](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/11).

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
- [ ] Fill the money and relation columns from the end save's logbook: with the extractor if it's built ([Playtest logbook extractor](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/14)), otherwise by hand.
- [ ] Ship upgrades you could afford, and when.
- [ ] Answer the three questions in "Verdict" below.
- [ ] Tell Claude the saves to check, and anything still to confirm.

## Results

Header: date, install version line, save names, real time played, game time played.

### Hunt log

| # | Wharf / offering faction | Size | Offers (in reach / total) | Target (class, faction, wing?) | Offered (kill + up to) | Paid | Real time (travel / search / fight) | Debrief | Ending | Sanction | Fun 1-5 | Note |
| - | - | - | - | - | - | - | - | - | - | - | - | - |

### L/XL offers seen

| When | Wharf / offering faction | Count | Example targets | Offered pay range |
| - | - | - | - | - |

### Other income

| When | Source (police bounty, Assassinate, ...) | Amount | Note |
| - | - | - | - |

### Notes

- (Opening, named hunters, vanilla missions, dead time, series moments, bugs.)

### Verdict

- **Variety:** does the loop stay interesting over a series, or does it repeat after a few hunts?
- **Pay:** is S/M hunting a living from the Fortitude onward? How long until the next ship?
- **Pacing:** hunts per hour, and how much of an hour is action. Is it enough for an episode?
- **What the extension must add before episode 1** (input for [Extension scope at launch](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/11)):
