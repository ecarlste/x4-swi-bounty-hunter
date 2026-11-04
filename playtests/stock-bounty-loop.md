# Playtest: the stock bounty loop

Status: **in play (started 2026-11-03, resumed 2026-11-04); 5 hunts logged, hunt 5 in progress.**

**Resume here (updated 2026-11-04 ~09:50):** the write-up lives on branch `worktree-issue-4` (worktree `.claude/worktrees/issue-4`); start the next session there. **Note-taking rule:** this file is the only record. Log each finding here as it comes up (hunt log row + a notes section per hunt), keep this block current, and move anything from scratch folders into the repo before a `/clear`. Time each update with `date` for the real-time timeline (gaps of an hour or more are time away, by the player's rule).

- **Where play stands:** 5 hunts logged ([hunt log](#hunt-log), notes per hunt under [Notes](#notes)). Paid: hunt 1 (124,562), 2 (166,132), 4 (353,582); hunt 3's accept failed silently. Balance about 465,900 Cr (to confirm; the 179,365 Cr refit is in the hunt 3 notes). **Hunt 5 is in progress:** the veteran Y-wing SGP-611 (907k kills part) in Fondor near the Thyferra gate, guarded by 3 B-wings; the Fortitude lost the first attack to missiles and hit-and-run passes got it only to 97% hull. The player ejects on a loss and reloads. Its find step expires about 2.5 game hours after game time 13,685 s. Next: the player retries (missiles or ion cannons would help) or drops it; log the ending either way.
- **Saves:** the save map is in the Results header. Root profile `C:\Users\ecarl\OneDrive\Documents\Egosoft\X4\save\` (WSL `/mnt/c/Users/ecarl/OneDrive/Documents/Egosoft/X4/save/`). The player saves mostly over "BBH - Test 2" (`save_008`) and the quicksave. Save reads go to background agents working on a scratch copy, never the save folder; past reads: research/save-check-dhc-011.md, research/save-check-sgp-611.md. Helper scripts: research/save-read-scripts/.
- **Still to do from the checklist:** T03's exact entries under "... more. (Mods)"; T05 police licence (the player has a police scanner; criminal-traffic kills raised ICG -10 → 0, any money unknown); T18 vanilla missions; T06 named hunters; the opening's time to first hunt; then the After-the-session steps (stop time and game time, end balance, logbook extractor on the end save with `--since 0`, no debuglog step: stock SWI only).
- **Then:** draft the Verdict (variety, pay, pacing; the extension list is already long) for the player to correct; post the resolution comment on #4, close it, add the pointer on the map, and open a PR with `Closes #4` (body via `/mattpocock-skills:pr`). Ask before each outward step. Also flag for concept.md: "it should feel like being Boba Fett".
- Wayfinder ticket [Playtest the stock bounty loop](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/4). Its result feeds [Extension scope at launch](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/11).

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

- Date: 2026-11-03. Working save: "Bankrupt Bounty Hunter - New Save - Test 2". Its earlier states (`quicksave` at 310 s game time, `save_008` at 683 s) were read for [research/r41-deaggro.md](../research/r41-deaggro.md). The player then saved over the working save at the hunt 1 target in Muunilinst (825-02-08 12:01), so the 683 s state is probably gone; the R-41 findings are already written down. Check the slot's save time before using it for anything else. "BBH - Test 3": just after hunt 1's kill and escape, in the sector next to Muunilinst (about 13:00 real time). "BBH - Test 4": docked after hunt 1's debrief. "Test 1" (saved over): start of hunt 2's search. "BHH - Test 5": hunt 2's target found. "Test 2" (saved over again): after hunt 2's debrief.
- Save files (root profile, `Documents\Egosoft\X4\save\`, which is under OneDrive on this machine; times are file times, 2026-11-03): `quicksave` 11:19 (310 s game time); `save_009` "BBH - Test 3" 13:01; `save_010` "BBH - Test 4" 13:07; `save_007` "Milagro" 15:36; `save_011` "BHH - Test 5" 15:51; `save_013` "BHH - Test 6" 17:29; `save_008` "BBH - Test 2" 18:00 (after hunt 4's kill). Note: `save_007` used to be "Bankrupt Bounty Hunter Test 1", the save the rules said to keep; it was saved over at 15:36. The logbook fixture cut from it (`tools/fixtures/save_007-logbook.xml`) is unaffected.

### Hunt log

| # | Wharf / offering faction | Size | Offers (in reach / total) | Target (class, faction, wing?) | Offered (kill + up to) | Paid | Real time (travel / search / fight) | Debrief | Ending | Sanction | Fun 1-5 | Note |
| - | - | - | - | - | - | - | - | - | - | - | - | - |
| 1 | Celanon / IMP | S | 2 / 6 (S/M) | BLS Kihraxz WCP-957, S; leads a wing of 3 BLS R-41 Starchasers (found in Muunilinst) | Board: 28,421.25 + up to 73,510. Accepted: 27,622.50 + up to 71,570 | 124,562 (kills 27,037.50 + destruction 97,524.99); balance 1,000 → 125,562 | ~15 min to the sighting (travel ~15 / search ~0); fight short: target killed before the wing got behind the Fortitude, then escape | Dock (Talk to: Tracy Turner) | success: target killed, escaped the wing | none (Black Sun -2, "Unauthorised Kill", now -7; Galactic Empire +5, now 5) | not scored; travel dull, the kill-and-run fight fun | Accepted 2026-11-03. Expected a loss; won't-fight-four became kill-one-and-run |
| 2 | Milagro (HQ) / ASC | M | tbd / 27 (S/M) | PIR Mercenary Weequay YVN-990, M; alone, found in a battle between Anoat and a Pirate Federation station, one sector from its last-known position | Board: 9,957.50 + up to 205,290. Accepted: 10,100 + up to 208,510 | 166,132 (kills 8,845 + destruction 157,287.79); balance 125,562 → 291,694 | ~13 min to the sighting (travel + search, split tbd) | Talk to: Harinder Petrov | success: solo kill from the blind spot; other ships did some damage | none (Imperial Ascendancy +5, now -1) |  | Accepted 2026-11-03 |
| 3 | Milagro (HQ) / ICG | S | tbd | CSA Patrol V-19 (GKJ-…), S; wing unknown | Board: 683,224.96 + up to 83,520 (accepted figures tbd) |  |  |  | never started: the accept failed silently (no mission created) and used an hourly slot |  |  | Accepted 2026-11-03, about 17:18; a veteran: the kills part is 8× the "up to" |
| 4 | Milagro (HQ) / ICG | M | tbd | BH Amanaman YT-1300M (DHC-011), M; a bounty hunter as the target; wing unknown | Accepted: 99,135 + up to 206,730 (board figure not seen) | 353,582.48 (kills 107,145 + destruction 246,437.50); balance tbd | ~12 min to the sighting (travel + search); fight tbd | Docked at ICG station JTU-546 (Kessel) to talk to Mik Kellar; no guidance at all, found from the save | success, after the debrief contact was lost and replaced |  |  | Accepted 2026-11-03; this accept did create a mission |
| 5 | Milagro (HQ) / ASC | S | tbd | NRL Patrol Y-wing BTA-NR2 SGP-611, S; a veteran leading 3 NRL B-wings, found in Fondor (from a save read) | First Milagro board: 909,430 + up to 78,950. Accepted: 907,612.56 + up to 75,870 |  |  |  | first attack lost: Y-wing to 47% shield, then the Fortitude destroyed by missiles |  |  | Accepted 2026-11-03; the veteran-pay test (the V-19 accept failed) |

### L/XL offers seen

| When | Wharf / offering faction | Count | Example targets | Offered pay range |
| - | - | - | - | - |
| First visit (2026-11-03) | Celanon / ASC | 13, all difficulty Hard | IMP Victory II Star Destroyer, NRL Nebulon-B/-C escorts, MC80A heavy star cruiser, Dreadnought, Pelta II, MC80R Reef Home, Refurbished ISD-I, GR-500 miner, REB Nebulon-B | kill part 8,974-2,856,686 Cr; "up to" 1,007,630-1,687,010 Cr. T01's cap pays about 60 Cr, so the board promises millions it won't pay |
| After hunt 1 (2026-11-03) | Milagro (BHG headquarters) / ASC | 10, all Hard | BLS Interceptor Frigate, IMP Star Destroyer Victory II, NRL Nebulon-C escort and patrol, MC80A, two Pelta II, MC80R Reef Home, GR-500 miner, REB Raddus MC75 | kill part 8,850-1,208,864.96 Cr; "up to" 1,031,530-1,618,110.08 Cr |

### Other income

| When | Source (police bounty, Assassinate, ...) | Amount | Note |
| - | - | - | - |
| 2026-11-03, evening, around hunt 4 | Shooting criminal traffic while doing rounds of all the stations in a system (Kessel?) | tbd | Done to raise ICG reputation from -10 to 0 so JTU-546 would allow docking for hunt 4's debrief. Any money paid (police-style bounties, T05) to confirm from the logbook |

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

#### Second board: Milagro, BHG headquarters (after hunt 1)

- The guild HQ is in Milagro. ASC's S/M board there had **27 offers**, all difficulty Medium: 23 NRL, plus one each for BLS, HTP, PIR and REB. Far richer than Celanon's six IMP offers. ASC's L/XL board had 10 (see [L/XL offers seen](#lxl-offers-seen)).
  - About 16 S (X-wing T65B/T70/XJ, B-wing, Y-wing, E-wing): "up to" 65,900-87,220 Cr. About 11 M (CR-90A/AS, Dornean gunship, Weequay): "up to" 204,730-248,580 Cr. Sizes inferred from the "up to" bands, which match the S and M rolls.
  - Variety is thin in a different way: almost every target is NRL, and most are "Patrol" fighters or CR-90As. Plenty of offers, few kinds of target.
- **Veteran targets pay a fortune for S/M.** The kills part (the target's own kill record) ranges from about 8,000 Cr to 962,725 Cr (NRL Patrol Y-wing BTA-NR2 GQB-704). Others: Y-wing SGP-611 909,430; CR-90AS FAM-503 774,485; CR-90A NFG-193 587,030; X-wing CIY-666 263,061. Only L/XL pay is capped, so an S fighter with a long kill record could pay ten times a normal S hunt. Worth flying one to check the pay, and it's good series material: a famous ace is worth more than a cruiser.
- "Reward: Reward:" on every offer again.
- Milagro also has a pirate freeport (on this run at least): the guild HQ shares its sector with a pirate base. Useful for the series (a hunters' town next to a pirate town) and maybe for selling or repairs while hunting.
- **Getting there took a while:** a long flight from the IMP turn-in next to Muunilinst to Milagro. More dead time from travel. The screenshots are 13:10 (hunt 1's payment) and 15:35 (this board), but that span may include breaks: real flight time to confirm.

#### Menu location (T03)

- The hunt options at the Bounty Hunters station manager are under "... more. (Mods)", not at the top level. Exact entries: to check at the next station.

#### Real time played (pieced together from the session's updates)

- The player didn't time the session, so this is pieced together from timestamps (saves, commits, screenshots, chat), all 2026-11-03, Mountain time. Player's rule: any gap of an hour or more between updates was time away from the keyboard; otherwise the long parts were travel.
  - about 11:14: game start (the quicksave at 310 s game time is stamped 11:19);
  - 11:14 to about 12:36: the opening, the trip to Celanon, the first board, accepting hunt 1 (the WIP commit is 12:34);
  - 12:36 to about 13:15: hunt 1, from accepting to payment (sighting 12:51, debrief 13:07, ticker 13:10), then notes;
  - about 13:15 to 15:35: mostly away from the keyboard. The flight to the Milagro HQ ("took a while") falls somewhere in this gap; its length is unknown;
  - 15:35 to about 17:06: the Milagro board, hunt 2 (accepted 15:39, sighting 15:52, payment logged 16:46), then setting off back to Milagro;
  - 17:06 to 17:12: the flight back to Milagro for hunt 3 (about 6 min to reach the system).
  - 17:12 to about 22:45: hunt 3's failed accept, hunt 4 (18:05-21:40 includes a gap of over an hour, so time away by the player's rule; the exact split is unknown), the ICG reputation grind, hunt 5's accept (22:05) and its failed search;
  - 2026-11-04, from about 09:20: resumed, flying to Fondor for hunt 5.
- Active play so far: about 3 h 30 min (11:14-13:15 and 15:35-17:06), plus the flight to Milagro. Game time comes from the end save.

#### Hunt 1: BLS Kihraxz (WCP-957)

- Accepted from the IMP board at Celanon; it shows under Guild Missions > Bounty Hunters Guild as "Search and destroy: BLS Mercenary Kihraxz (WCP-957)", IMP, difficulty Medium.
- **Pay changed after accepting:** the board offered 28,421.25 Cr + up to 73,510 Cr; the accepted mission reads 27,622.50 Cr + up to 71,570 Cr. Both parts fell by about 2.8% (0.9719 and 0.9736).
  - Why, from the scripts (agent read, 2026-11-03; detail in [research/offer-pay-drift.md](../research/offer-pay-drift.md)): accepting doesn't recalculate the pay, and offers don't decay. Choosing a faction and size at the Guild NPC, or leaving the station, deletes the open offers and creates new ones, and each new offer rolls its pay again at random. So the accepted offer was most likely a new roll for the same target. The matching ~2.8% is a coincidence, maybe helped by a small drop in IMP relation. Inferred, not seen in game.
  - The final pay will differ again: the target part is rolled once more at Destroy and at the debrief ([research/hunt-pay-ael-112.md](../research/hunt-pay-ael-112.md)).
  - Series read: the board's numbers are a rough guide, not a quote. If the extension shows pay, it should fix the number when the offer is made.
- "Reward: Reward:" also appears in the accepted mission's Guild Missions entry, not only on the board.
- **Target found** in Muunilinst (Galactic Empire sector) at game date 825-02-08 12:01, balance 1,000 Cr; saved there. The Kihraxz leads "Alpha Group" on Defence: three BLS Mercenary R-41 Starchasers (AQN-739, NZU-257, NZW-546). Four ships in all.
  - This is the wing gap from the first board, met on the first hunt: the offer said nothing about three escorts. The opening already showed that two R-41s are too much for the Fortitude, so a "Medium" S hunt turns out to be a fight against four fighters, three of them the kind the player had to run from.
  - **How it was found:** the mission guidance points to the sector where the target was last seen. Here it was right by the gate the player came in through: luck, almost no search. The usual search is to fly around the sector in long-range scan mode (Shift+3) and pulse the long-range scan (R) until it picks up the target and marks it. That would be dead time on a typical hunt.
  - **Travel through unknown sectors:** the route crossed sectors the player hadn't discovered, so guidance couldn't plot through them. The player had to use "Find way to <sector>" over and over to find each next gate. Dull and fiddly, so dead time, and a fresh start always hits it (only a few sectors known). Extension idea: reveal the route, or the gates along it, when a hunt is accepted.
  - **Real time, accept to sighting: about 15 minutes**, nearly all travel, since the search took almost nothing. Measured from the session's screenshots: the accepted mission at 12:36:36 and the target found at 12:51:19 (MST, 2026-11-03).
- **The fight (2026-11-03):** saved just before attacking, expecting to be destroyed. Instead the player went straight for the Kihraxz and killed it before the three R-41s could get behind the Fortitude, then boosted away until the hyperdrive could engage and escaped. Saved in the next sector as "BBH - Test 3".
  - Finding: the wing doesn't make an S hunt impossible for the Fortitude. You don't have to beat the wing, only the target, and then get away. That changes the wing-intel gap from "the offer hides a fight you can't win" to "the offer hides how much risk you're taking on". Escort info is still worth showing, but the hunt is playable without it.
  - Series read: "kill the mark and run from the escorts" is a strong segment: tense, short, and a pattern a hunter can repeat.
  - The opening's R-41 lesson (two are too many) was about fighting them; here they were dodged, not fought.
- **Debrief and pay (T04):** the debrief needed docking ("5: Talk to: Tracy Turner"); it didn't finish over comms. Saved after as "BBH - Test 4". The briefing's results: kills 27,037.50 Cr + destruction 97,524.99 Cr = **124,562.49 Cr**, against the accepted 27,622.50 + up to 71,570 (99,192.50). So it paid about 26% more than the offer's maximum.
  - Matches the formula from [research/hunt-pay-ael-112.md](../research/hunt-pay-ael-112.md): the kills part was rolled again at Destroy (27,622.50 → 27,037.50), and the destruction part is a fresh roll × 100% damage × 1.25 for the player's kill (97,524.99 ≈ 78,020 × 1.25). The "Operation results" line (48,762.49) is display-only and shows half the destruction figure, the same as AEL-112.
  - So "up to" is not a maximum: the 1.25 kill bonus lifts it, and each new roll moves it. The offer is a rough guide in both directions.
  - Confirmed in the logbook ticker: "Payment received: 124,562 Cr, new balance is 125,562 Cr". Galactic Empire +5 (Mission Completed, now 5). Black Sun -2 (Unauthorised Kill, now -7), logged about 3 min before the payment: no sanction was bought, so killing a Black Sun ship cost Black Sun relation.
  - The Travel Mode charging and aborting in the ticker was just the player moving around the next sector before docking: the IMP turn-in was right next door. The escape was clean: the R-41s made one pass and never hit the Fortitude after that.
- **Player's read on fun (2026-11-03):** the travel isn't fun, which is expected this early: no satellites yet, and many sectors still unknown. Once satellites are up, finding the target matters less, and a hunt becomes mostly reaching the target, killing it without getting killed, and escaping. That core loop is the fun part; the early-game search and travel is the dead time.
  - The fight itself was fun even now: killing the mark fast and getting out was "pretty fun for a solo new player". Good segment material from episode 1, before any satellites.

#### Hunt 2: PIR Weequay (YVN-990)

- Accepted from ASC's board at the Milagro HQ: an M hunt, offered 9,957.50 Cr + up to 205,290 Cr. Chosen over the high-kill-record targets.
- **Player's plan:** an escort would probably be too much, but the Weequay has few turrets and the player knows its blind spot, so it can be taken solo. Scout it first, then try. Player knowledge of a ship's blind spots is what makes an M hunt possible in the Fortitude.
- **Found (about 15:52 real time):** not in the sector the guidance gave as last seen, but one sector over, in a battle between Anoat and a Pirate Federation station. The last-known position was out of date, so the search spread to the neighbouring sectors. That's the "last seen" intel being wrong, the same thing the wing-intel preference wants on purpose ([First board](#first-board-celanon-wharf)).
  - The target being in the middle of someone else's battle is good series material, and it changes the fight: other ships to hide among, and other guns to dodge.
  - Saves: saved over "Test 1" when the search started, and saved "BHH - Test 5" on finding the target (written as given; the earlier saves were "BBH").
  - Real time from accept (about 15:39) to the sighting (about 15:52): **about 13 minutes**, travel and search together.
- **The fight:** the Weequay was alone. None of the other pirates attacked the Fortitude, and the player stayed in its turret blind spot most of the time. Some other ships in the battle also did a little damage to it. A solo M kill in the starting ship, made possible by knowing the ship.
- **Debrief and pay:** "Talk to: Harinder Petrov" again (the same dock-to-debrief as T04). The accepted reward was 10,100 + up to 208,510, up from the board's 9,957.50 + up to 205,290: a re-roll again, upward this time ([research/offer-pay-drift.md](../research/offer-pay-drift.md)). Paid: kills 8,845 + destruction 157,287.79 = **166,132.79 Cr**. Ticker: "Payment received: 166,132 Cr, new balance 291,694 Cr". Imperial Ascendancy +5 (Mission Completed, now -1).
  - Against the accepted maximum (218,610 Cr) it paid about 76%, where hunt 1 paid 126%. The likely reason is the damage share: destruction pay = roll × your damage % × 1.25, and other ships hit the target. If the roll was near the "up to" (about 208,510), the player's share was about 60%. That's inferred: the briefing's "Operation results" block is empty this time, so it doesn't show "your damage". Check in the save.
  - Bug: the "Operation results" and "kills are" lines are empty, though a kills part (8,845 Cr) was paid. Hunt 1 listed both.
  - Series read: other people's battles both help and cost you. They make the kill easier, but every hit they land cuts your pay. A hunter wants the kill alone, so "the target is in a battle" carries a real choice.
- Saves: saved over the "Test 2" slot after the debrief ("Bankrupt Bounty Hunter - New Save - Test 2", which held the Muunilinst position from hunt 1).

#### Hunt 3: CSA Patrol V-19 (GKJ-…)

- Accepted at the Milagro HQ, about 17:18 real time, offered by ICG: "Search and destroy: CSA Patrol V-19 (GKJ-…)", difficulty Medium, 683,224.96 Cr + up to 83,520 Cr. The "up to" is in the S band, so a V-19 fighter.
- **This is the veteran-pay test** from the second board: the kills part (the target's kill record) is about 8 times the "up to". If it pays near 683k, a single S hunt is worth more than hunts 1 and 2 together. Expect the kills part to be rolled again at Destroy ([research/hunt-pay-ael-112.md](../research/hunt-pay-ael-112.md)).
- Player's read before the fight: the V-19 can probably out-turn the Fortitude easily. Unlike the Weequay, there's no blind spot to sit in, so this is a dogfight against a nimbler ship with a long kill record. It's faster too, but the Fortitude can kill it quickly if it can stay on its tail: it can't escape the V-19, but it can burst it down.
- **Ship upgrade before the hunt (about 17:22, at the BHG guild station):** with 291,694 Cr after hunts 1 and 2, the player refitted the Fortitude (an M gunboat) for 179,365 Cr, leaving about 112,329 Cr:
  - S Combat Thrusters Mk1 → Mk3 (66,811 Cr, less 5,142 for the old ones): yaw and pitch 37.3 °/s, roll 46.7 °/s, strafe 59.3 m/s. Aimed at the V-19's agility.
  - 2× IX-4 laser cannon → 2× TB KX5 laser cannon (37,728 Cr): burst 4,094 MW, sustained 3,129 MW.
  - Long Range Scanner Software Mk1 → Mk2 (58,546 Cr, less 29,273); Basic Scanner → Police Scanner (36,733 Cr, less 10,907); Trading Computer Extension Mk1 (10,125 Cr); 2 crewmen (14,744 Cr).
  - So the first upgrade came after two hunts, about 3 h 45 min into play: better turning and guns for the next fight, and a better scanner for searching. That answers part of "how long until the next ship": two S/M hunts bought a solid refit, not a new ship.
- **Bug: the accepted mission is missing (about 17:26, still at the Milagro HQ).** The board said "Mission accepted", but the V-19 hunt doesn't show in the player's current missions. Trying to accept it again gives the 3-missions-per-hour warning. So the accept counted toward the hourly limit, but no mission exists, or it was removed. Known accepts: hunt 2 (15:39) and this one (17:18). The limit counting 3 suggests another accept, or a different clock (game hours). Open questions: whether the refit at the shipyard removed it, and whether there's any guidance to the target. Under investigation ([research/missing-accepted-hunt.md](../research/missing-accepted-hunt.md)).
  - From the scripts (agent read, 2026-11-03): "Mission accepted" is only a label the map sets when you click. Emergent Missions counts the click toward the hourly limit at once, but creates the mission only after it spawns a contact NPC and a room, and that can fail silently after 3 tries. The offer then stays open (creating the mission would have removed it) and the slot stays used. So most likely the spawn failed and no mission was ever created. The refit probably isn't the cause. Likely, not proven.
  - The limit is 3 accepts per hour of **game time**: pausing doesn't count, SETA speeds it up, so accepts from before a long pause can still count. Old entries are dropped only when the map opens. Every click on Accept uses a slot, even a failed one.
  - Fix for the player: reload the save from before the accept (it also frees the slot), or wait until the oldest counted accept is an hour of game time old and reopen the map. Don't click Accept again on the stuck offer.
  - Series and extension read: a silent failure that still uses up one of three hourly accepts is a bad bug for a new player. The extension should check the mission was created, or at least say when it wasn't.
- Still to note: the board's offer count, the target's wing, whether a fighter with that kill record is harder to kill, and the paid amount.

#### Hunt 4: BH Amanaman YT-1300M (DHC-011)

- Accepted at the Milagro HQ for ICG after the V-19 accept failed: "Search and destroy: BH Amanaman YT-1300M (DHC-011)", Medium, 99,135 Cr + up to 206,730 Cr (M band). This one did register: it shows under Guild Missions and in the logbook.
- The target flies for "BH", another bounty hunter. Hunter hunting hunter is good series material.
  - Killing it cost nothing with the Bounty Hunters Guild: no reputation loss (player's report). So guild members can be hunted freely; whether "BH" is the guild's own faction or a separate one is unchecked. For the story: the guild doesn't protect its own, or doesn't care.
  - The player's relation with the guild seems locked at 0: it never moves, whatever the player does. Neutral by design, it seems; to confirm in the save (a locked relation, or one that never changes).
- How the hourly limit was cleared for this accept (reload, or waiting): to ask.
- Found the target after about 12 minutes (by the player's count; reported at 17:57); engaging.
- **Target killed (about 18:00).** But the debrief objective ("Talk to: <contact>") shows no guidance: no waypoint, not even the next sector. The player doesn't know where the contact is. In hunts 1 and 2 the contact was easy to reach (hunt 1's was at an IMP station next door to the kill), so this didn't come up. In SWI the contact NPC is spawned at a station when the hunt is accepted ([bounty-research.md](../bounty-research.md#a-hunt-start-to-finish)); hunt 1 suggests it's a station of the offering faction, not the wharf.
  - From the scripts (agent read, 2026-11-03; [research/debrief-contact-guidance.md](../research/debrief-contact-guidance.md)): the contact sits on the offering faction's station that last saw the target, normally near where it was found (or the nearest ICG defence station with an L dock), in a new office room. The "Talk to" line only appears if the contact existed at the kill. Likely causes of no guidance: the hunt isn't the active mission, or SWI moved the contact out of its room and couldn't place it anywhere. Fix to try: set the hunt active; else save and reload (the contact is spawned again on load). Don't abort: no timer, and aborting pays nothing. Comms may work (the debrief listens for any conversation with the contact); untested.
  - The player is at -10 reputation with ICG, the faction that offered the hunt. ICG offered the hunt anyway.
  - **Cause, from the save (agent read of `save_008`, 2026-11-03; [research/save-check-dhc-011.md](../research/save-check-dhc-011.md)):** the contact is Mik Kellar, placed at the ICG Defence Platform FKG-580 in Kubindi, a CSA-vs-ICG warzone. The kill is recorded (the mission is at step 5, DHC-011 counted as the player's kill). But Mik isn't on any station: when FKG-580 was attacked, EM removed him and destroyed his room, because the station refuses the player docking. EM then tried to place him on an ICG defence station the player can dock at, found none at -10, and gave up silently after 3 tries. So: no waypoint, and no pay until he's found.
    - ICG -10 is SWI's starting value for the Bounty Hunter gamestart (`commerceguild` → player -0.01), not something the player did. The first placement has no relation check, which is why the contact landed on an ICG station in the first place.
    - Suggested fix (not yet tried): save and reload; on load EM should put Mik back on FKG-580. Then talk to him at once, by comms if possible, since docking is probably refused. Any new attack on FKG-580 can remove him again.
    - **After the reload (save_008 re-saved 21:40, game time 10,704 s; read directly):** FKG-580 no longer exists: it's a wreck, destroyed at game time 9,849 s. The reload did place Mik Kellar again: he's now in the "War Room" (a manager's office) of another ICG station of the same type, JTU-546, in Kessel. That station isn't known to the player (no `knownto="player"`), and the talk-to objective still has no target, which may be why there's still no guidance. Docking there at ICG -10 is probably refused; comms is the thing to try.
- **Debriefed and paid (about 21:50):** kills 107,145 Cr + destruction 246,437.50 Cr = **353,582.48 Cr**, against the accepted 99,135 + up to 206,730 (305,865): about 116%. 100% damage and the player's kill: destruction = 197,150 × 1.25. The kills part rose at Destroy (99,135 → 107,145), and the target's record is "3 x S ships". The best-paying hunt so far, and an M hunt on a rival bounty hunter. Balance after: to fill in.
  - **How the debrief was reached:** the player flew to JTU-546 in Kessel, docked, and found Mik Kellar there. There was **no guidance at any point**, even after the reload placed him. The player only knew where to go because an agent read the save. A normal player would have lost this payout: the player found **no in-game way to locate him** (no waypoint, no station named in the briefing, nothing on the map).
  - **Fixing the reputation first:** before going to JTU-546 the player raised ICG reputation from -10 to 0 by shooting criminal traffic on rounds of the system's stations. So docking worked at ICG 0; this doesn't contradict the save read's guess that -10 means no docking. The grind is itself a finding: SWI's Bounty Hunter start puts the player at -10 with ICG, which blocks ICG debriefs until the player works it off.
    - Player's read: docking probably works from -9, so one criminal kill would have been enough. The player kept going to 0 hoping the guidance would update once the relation changed. It never did. Whether EM ever re-sets the talk-to guidance after a relation change is unchecked.
    - Extension read: a hunt that ICG offers can be impossible to debrief for a player ICG won't let dock, and the game never says so. The bounty-hunter window's remote debrief fixes this directly, and a contact should never vanish without a message.

#### Hunt 5: NRL Patrol Y-wing BTA-NR2 (SGP-611)

- Accepted at the Milagro HQ for ASC, about 22:05: 907,612.56 Cr + up to 75,870 Cr, Medium. It registered (objective 1 "Talk to: Shuji Chapman" completed). This is the veteran-pay test the V-19 was meant to be: the kills part is 12 times the "up to".
- It's the same target as on the first Milagro board (SGP-611: 909,430 + up to 78,950 then), so the target lived on between visits, and its offer was rolled again.
- **The mission text gives last-seen intel:** "last reported at -776.355, 362.803, 156488.766 in Yag'Dhul 02h 07min 34s ago. We will update you of new reports." A position and the report's age, which is close to the intel the player wants for the extension, minus the wing. The kills list reads "1.5 x L ships, 3.5 ...": fractions, because kills by the target's subordinates count 0.25 ([research/offer-pay-drift.md](../research/offer-pay-drift.md)). So this Y-wing, or its wing, has a share of L-ship kills.
- **The search is failing (as of about 22:25, 20 min after accepting):** the player covered all of Yag'Dhul, where it was last seen, with long-range scans at every station and gate: nothing. Then Foless: nothing. Now heading south. The last report was already about 2 hours old at accept, and the mission promises updates ("We will update you of new reports") but none had arrived. This is the dead time the search can turn into: a stale last-seen position, and a fighter that may be many sectors away.
  - Player's read: probably needs advanced satellites (the Fortitude carries 3 basic satellites). The search tools a new hunter has are long-range scans and flying around; satellites are the first upgrade that makes searching cheaper, as the player expected after hunt 1.
  - Quicksaved about 22:30 and asked an agent to locate the target from the save, outside the game, as with hunt 4's contact ([research/save-check-sgp-611.md](../research/save-check-sgp-611.md)). The search up to here, about 25 minutes with nothing found, is the stock result.
  - **What the save shows (game time 13,685 s):** SGP-611 is in **Fondor**, next door to Foless, in the zone with the Thyferra gate, roughly 28-51 km from that gate. Alive, in open space, on a ProtectPosition order (15 km radius, attack on sight). It leads a point-guard formation of **3 New Republic B-wings** (WKA-144, LVL-476, XKO-353). Pilot: Marelle Gerra. The player was in Vondarc, 4 jumps away (Vondarc → Wroona → Yag'Dhul → Foless → Fondor). So the player searched the right area but stopped one sector short.
    - The mission's intel was stale: its three "Report of SGP-611" beacons are all in Yag'Dhul and were 2 h 31 min to 2 h 41 min old. No fresh report had appeared.
    - **The find step has a deadline:** it expires at game time 22,939 s, about 2.5 game hours after the save. Not shown as "Time left" (that reads "-"). Unverified what happens at expiry.
    - The wing again: a "Medium" S hunt on a veteran with three B-wing escorts, not stated in the offer.
  - The player stopped playing after the save read (2026-11-03, about 22:45) and resumed on 2026-11-04 at about 09:20, flying from Vondarc to Fondor.
- **First attack (2026-11-04, about 09:29): lost.** The kill-and-run from hunt 1 didn't work: the player got the Y-wing down to 47% shield (hull untouched) before missiles tore the Fortitude apart. A veteran Y-wing with three B-wing escorts is out of reach for the refitted Fortitude. The offer called it "Medium" and said nothing of the wing or the missiles.
  - **The B-wings did it** (player's read), not the Y-wing. The escort is what makes this hunt hard, which is exactly what the offer leaves out. The extension's wing intel would have told the player to skip this one, or come back with a better ship.
  - The station the Y-wing guards doesn't attack the player; only its wingmen do. So the fight is the four ships, not the station's guns too.
  - **Hit-and-run passes (about 09:34):** several more runs, swooping in for damage and getting out before the B-wings could lock on. Best result: the Y-wing at 97% hull (shield gone). The B-wings cover it well and hit hard once they're on you. Chip damage on a well-escorted target is slow and risky in the Fortitude.
    - Player's read: with missiles the passes would work, by firing them in each pass and leaving. The Fortitude has no missiles (0 in the refit stats). The next upgrade is weapons, not speed or scanners. Ship progression decides which hunts a hunter can take.
  - **What a loss costs:** when the Fortitude blew up the player ejected, as usual in X4: no death, but the ship is gone, so without a reload the run would continue on foot in a spacesuit, with no ship. The player reloaded for the later passes.

### Verdict

- **Variety:** does the loop stay interesting over a series, or does it repeat after a few hunts?
- **Pay:** is S/M hunting a living from the Fortitude onward? How long until the next ship?
- **Pacing:** hunts per hour, and how much of an hour is action. Is it enough for an episode?
- **What the extension must add before episode 1** (input for [Extension scope at launch](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/11)):
  - **One bounty-hunter window, reachable from anywhere (player requirement, 2026-11-03):** a single UI for everything bounty-hunter related: contacts, offers, accepted hunts, debriefs. Open at all times, not only when docked at a wharf. In-fiction reason: it's a starship with a hyperdrive in Star Wars, so the hunter should be able to call any station that isn't jammed (by a battle, say), and above all contacts already met and done business with. This answers several stock-loop pains from this session: flying to a wharf to see a board, docking to debrief (T04), the menu under "... more. (Mods)" (T03), and a silently failed accept with no feedback (see the hunt 3 notes).
  - **The hourly accept limit (player requirement, 2026-11-03):** either prevent the bug (an accept that fails still uses one of the three slots) or let the player turn the limit off with a setting in the window. The limit is SWI's: 3 accepts per game hour, the cap at EM 5097, counted at EM 5582 ([research/missing-accepted-hunt.md](../research/missing-accepted-hunt.md)). Options to weigh in #11: count an accept only once the mission exists; a setting for the cap (off, or a number); or both.
  - **The starting ship (player, 2026-11-04):** the Fortitude isn't a good bounty-hunter ship to begin with (an M gunboat: no missiles, out-turned and outrun by fighters), so even "easy" S hunts are an uphill fight. It worked on lone or lightly escorted targets (hunts 1, 2, 4) and failed on a veteran with three B-wings (hunt 5). Question for #11 and the story (#3): give the hunter a path to a proper hunting ship early, or offer hunts matched to what the player flies.
    - Without missiles, 2 ion cannons would help: they slow the target and strip shields faster.
    - **The ship the player wants is the HWK-290**, but the Bounty Hunters Guild sells it only with licences costing 1 M + 3 M Cr, plus the ship itself, about 1.5 M Cr with the high loadout preset: about 5.5 M Cr in all. Bounty work so far has paid about 644 k Cr (hunts 1, 2, 4) in roughly 5 h of real time. At that rate the licences alone take about 30 hours of play, and the whole 5.5 M about 40. The player's read: **it feels like you'd need non-BH work to get to the point where you can do BH work.** That breaks the rule this playtest set (money from bounty work only) as soon as a player wants a proper ship.
  - **The bar (player, 2026-11-03):** bounty hunting in SWI should feel like being Boba Fett: the hunter has the contacts, the intel and the ship, and the work comes to them. The stock loop's flying to boards and docking to debrief feels like running errands.
  - **A tracking minigame for the search (player, 2026-11-03):** finding the target needs more of a tracking game that keeps the player engaged and having fun, not flying around pulsing long-range scans at a stale position (hunt 5: about 25 minutes with nothing found). Ideas to weigh: leads that narrow the search (sightings from stations, informants, traffic that saw it pass), fresher last-seen reports as you get closer, trails to follow (ion trails, jump records at gates), and the wing as part of the intel. The shape the player wants: you keep moving toward clues you find along the way, each one leading to the next, ideally lore-friendly (Star Wars ways a hunter finds a mark: informants, bribed dock officials, hyperspace route records, a tracking fob from the client).
  - **Open design question for #11 (player, 2026-11-03):** how to merge SWI's stock hunts into that window, and which Head Hunter-style features to add. Candidates seen so far: SWI's Emergent Missions hunts shown and accepted from the window (offers, pay, accept feedback, remote debrief); a wanted board with last-seen intel, including the target's wing ([research/headhunter.md](../research/headhunter.md) §8); general kill bounties away from a wharf (§2); wanted-ship-nearby alerts (§9-10); contacts who remember you.
