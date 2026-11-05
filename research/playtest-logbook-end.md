# Playtest #4 logbook, read from the end save

The logbook of the playtest's end save (the 2026-11-05 14:42 quicksave, game time 47,051), read with the playtest logbook extractor ([tests/game/README.md](../tests/game/README.md#playtest-logbook-extractor)). The playtest started at game time 0, so `--since 0` keeps everything. The save was copied to a scratch folder first; the live save folder was not read.

```
node tools/playtest-log.ts <scratch>/qs-oow130.xml.gz --since 0
```

It ran cleanly (exit 0). Its full output follows, then a comparison against the hunt log in [playtests/stock-bounty-loop.md](../playtests/stock-bounty-loop.md).

## Extractor output

### Hunt log

Logbook entries after game time 0.

| Ended (game time) | Target | Offering faction | Ending | Paid | Kills part | Destruction part | Engagements | Note |
| - | - | - | - | - | - | - | - | - |
| 3,940.294 | BLS Mercenary Kihraxz (WCP-957) | Galactic Empire | success | 124,562.49 Cr | 27,037.50 Cr | 97,524.99 Cr | 1 x S ship (kills: 1) |  |
| 6,518.883 | PIR Mercenary Weequay (YVN-990) | Imperial Ascendancy | success | 166,132.79 Cr | 8,845.00 Cr | 157,287.79 Cr | 1 x M ship (damage: 74 / 100) |  |
| 11,233.788 | BH Amanaman YT-1300M (DHC-011) | Independent Commerce Guild | success | 353,582.48 Cr | 107,145.00 Cr | 246,437.50 Cr | 1 x M ship (kills: 1) |  |
| 17,851.498 | HTP Mercenary Weequay (VUA-500) | Imperial Ascendancy | success | 149,220.62 Cr | 26,516.25 Cr | 122,704.37 Cr | 1 x M ship (damage: 49 / 100) |  |
| 26,751.878 | TST Mercenary Weequay (ZGN-719) | Imperial Ascendancy | success | 93,113.36 Cr | 9,502.50 Cr | 83,610.86 Cr | 1 x M ship (kills: 1) |  |
| 27,239.397 | PIR Gang Weequay (VEJ-815) |  | failure | 0.00 Cr |  |  |  | You failed to find PIR Gang Weequay (VEJ-815). |
| 28,065.069 | BAO Mercenary Weequay (ONJ-300) | Imperial Ascendancy | success | 372,721.84 Cr | 252,735.00 Cr | 119,986.84 Cr | 1 x M ship (kills: 1) |  |
| 31,698.749 | HTP Mercenary Y-wing BTL-BP (BQL-614) | Independent Commerce Guild | success | 129,043.84 Cr | 37,150.00 Cr | 91,893.84 Cr | 1 x S ship (kills: 1) |  |
| 34,869.177 | CSA Border Control ARC-170 (SHK-785) | Independent Commerce Guild | success | 1,768,732.48 Cr | 1,669,595.04 Cr | 99,137.49 Cr | 1 x S ship (kills: 1) |  |
| 39,718.356 | PIR Mercenary Gozanti Corsair (DMD-761) | Anoat Federation | success | 378,842.48 Cr | 98,555.00 Cr | 280,287.50 Cr | 1 x M ship (kills: 1) |  |
| 41,843.417 | BAO Gang Defender Corvette (VSH-071) | Anoat Federation | success | 911,251.36 Cr | 655,496.24 Cr | 255,755.16 Cr | 1 x M ship (kills: 1) |  |
| 44,199.321 | BLS Mercenary Weequay (KBZ-737) | Imperial Ascendancy | success | 440,345.00 Cr | 149,270.00 Cr | 291,075.00 Cr | 1 x M ship (kills: 1) |  |
| 47,019.089 | HTP Mercenary Gozanti Corsair (OOW-130) | Anoat Federation | success | 252,882.24 Cr | 38,965.00 Cr | 213,917.24 Cr | 1 x M ship (kills: 1) |  |

### Other income

| When (game time) | Source | Faction | Amount |
| - | - | - | - |
| 348.209 | Rewarded for station defence | Hutt Cartel | 500.00 Cr |
| 9,785.098 | Rewarded for station defence | Independent Commerce Guild | 500.00 Cr |
| 9,824.312 | Rewarded for station defence | Independent Commerce Guild | 500.00 Cr |
| 9,890.234 | Rewarded for station defence | Independent Commerce Guild | 500.00 Cr |
| 10,042.305 | Rewarded for station defence | Independent Commerce Guild | 500.00 Cr |
| 10,095.773 | Rewarded for station defence | Independent Commerce Guild | 500.00 Cr |
| 10,160.061 | Rewarded for station defence | Independent Commerce Guild | 500.00 Cr |
| 10,297.916 | Rewarded for station defence | Independent Commerce Guild | 500.00 Cr |
| 10,374.196 | Rewarded for station defence | Independent Commerce Guild | 500.00 Cr |
| 10,471.216 | Rewarded for station defence | Independent Commerce Guild | 500.00 Cr |
| 11,099.088 | Rewarded for station defence | Independent Commerce Guild | 500.00 Cr |
| 11,433.389 | Rewarded for station defence | Independent Commerce Guild | 500.00 Cr |
| 23,315.259 | Rewarded for station defence | TransGalMeg Industries | 500.00 Cr |
| 39,824.775 | Rewarded for station defence | Anoat Federation | 500.00 Cr |
| 42,328.357 | Rewarded for station defence | Anoat Federation | 500.00 Cr |

### Relation changes

| When (game time) | Faction | Change | Reason | Now |
| - | - | - | - | - |
| 348.209 | Hutt Cartel | +1 | Destroyed Enemy | 0 |
| 3,778.249 | Black Sun | -2 | Unauthorised Kill | -7 |
| 3,940.294 | Galactic Empire | +5 | Mission Completed | 5 |
| 6,518.883 | Imperial Ascendancy | +5 | Mission Completed | -1 |
| 9,785.098 | Independent Commerce Guild | +2 | Destroyed Enemy | -8 |
| 9,824.312 | Independent Commerce Guild | +1 | Destroyed Enemy | -7 |
| 9,890.234 | Independent Commerce Guild | +1 | Destroyed Enemy | -6 |
| 10,042.305 | Independent Commerce Guild | +1 | Destroyed Enemy | -5 |
| 10,095.773 | Independent Commerce Guild | +1 | Destroyed Enemy | -4 |
| 10,160.061 | Independent Commerce Guild | +1 | Destroyed Enemy | -3 |
| 10,297.916 | Independent Commerce Guild | +1 | Destroyed Enemy | -2 |
| 10,374.196 | Independent Commerce Guild | +1 | Destroyed Enemy | -1 |
| 10,471.216 | Independent Commerce Guild | +1 | Destroyed Enemy | 0 |
| 11,099.088 | Independent Commerce Guild |  | Destroyed Enemy | 0 |
| 11,233.788 | Independent Commerce Guild | +6 | Mission Completed | 6 |
| 11,433.389 | Independent Commerce Guild |  | Destroyed Enemy | 6 |
| 17,851.498 | Imperial Ascendancy | +5 | Mission Completed | 4 |
| 18,035.908 | Imperial Ascendancy | -2 | Unauthorised Kill | 2 |
| 23,315.259 | TransGalMeg Industries | +1 | Destroyed Enemy | 1 |
| 26,751.878 | Imperial Ascendancy | +5 | Mission Completed | 7 |
| 27,958.905 | Black Sun | -2 | Unauthorised Kill | -9 |
| 28,065.069 | Imperial Ascendancy | +2 | Mission Completed | 9 |
| 31,698.749 | Independent Commerce Guild | +3 | Mission Completed | 9 |
| 33,514.992 | Corporate Sector Authority | -2 | Unauthorised Kill | -1 |
| 33,540.657 | Corporate Sector Authority | -3 | Unauthorised Kill | -4 |
| 33,595.453 | Corporate Sector Authority | -2 | Unauthorised Kill | -6 |
| 33,644.648 | Corporate Sector Authority | -2 | Unauthorised Kill | -8 |
| 34,869.177 | Independent Commerce Guild | +2 | Mission Completed | 11 |
| 39,718.356 | Anoat Federation | +5 | Mission Completed | 5 |
| 39,824.775 | Anoat Federation | +1 | Destroyed Enemy | 6 |
| 41,843.417 | Anoat Federation | +3 | Mission Completed | 9 |
| 42,328.357 | Anoat Federation |  | Destroyed Enemy | 9 |
| 43,788.73 | Black Sun | -2 | Unauthorised Kill | -11 |
| 44,199.321 | Imperial Ascendancy | +2 | Mission Completed | 11 |
| 47,019.089 | Anoat Federation | +2 | Mission Completed | 11 |

### Pacing

- Hunts ended: 13
- Game time from the first to the last: 11:57:59
- Hunts per game hour: 1.09
- Total paid: 5,140,430.98 Cr

## Totals

- Bounty pay (13 hunts ended, 12 paid): **5,140,430.98 Cr**.
- Game-time span: first hunt end 3,940.294 to last 47,019.089, 43,078.8 s (11:57:59), 1.09 hunts per game hour.
- Other income in the logbook: 15 x "Rewarded for station defence", 500 Cr each, 7,500 Cr in all. Loot and salvage sales aren't in the logbook.

## Not trimmed

The logbook reaches back to game time 348 (a station defence reward before hunt 1), and hunt 1 (WCP-957) is there. Nothing early is missing.

## Against the playtest hunt log (hunts 1-16)

**Same 13 hunts both ways.** The extractor finds hunts 1, 2, 4, 6, 8, 9, 10, 11, 12, 13, 14, 15 and 16. The hunt log has nothing the extractor lacks except:

- Hunt 3 (V-19 GKJ-…): the accept failed and no mission was created, so there's no entry.
- Hunts 5 (SGP-611) and 7 (FKV-554): dropped by the player. EM writes no logbook entry for an aborted hunt, as the README says.
- Hunt 10's first, unscanned run (paid 0) was reloaded, so it isn't in this save.

The extractor finds no hunt the log lacks: hunt 15 (DMD-761), first found by a save read, is the only one not seen in play, and it is in both.

**Pay: no disagreements.** Every paid figure matches to the cent where the log gives cents. The log rounds hunts 1 (124,562), 2 (166,132) and 15 (378,842). Hunt 9 (VEJ-815) is a failure paying 0.00 Cr ("You failed to find"), as logged; it has no offering faction because no reputation entry was written with it.

**Offering factions agree:** IMP = Galactic Empire (hunt 1), ASC = Imperial Ascendancy (2, 6, 8, 10, 14), ICG = Independent Commerce Guild (4, 11, 12), ANO = Anoat Federation (13, 15, 16).

**Order of hunts 13-15:** hunt 15 (DMD-761) ended at 39,718, before hunt 13 (VSH-071, 41,843) and hunt 14 (KBZ-737, 44,199). This answers the log's open question on when hunt 15 happened. Its target's full name is "PIR Mercenary Gozanti Corsair (DMD-761)".

**Relations, small notes:**

- Hunt 13's "Anoat Federation 0 → 9" spans two hunts: hunt 15 took it 0 → 5, a station defence kill to 6, then hunt 13 +3 to 9.
- Hunt 12: Corporate Sector Authority went from +1 to -8 over four Unauthorised Kills (-2, -3, -2, -2). Independent Commerce Guild went 9 → 11 at the debrief (+2). Both match the log.
- Black Sun went -7 (hunt 1) → -9 (hunt 10) → -11 (43,788, during hunt 14), as logged.
- The extractor also shows the Imperial Ascendancy -2 Unauthorised Kill at 18,035.908, just after hunt 6. The hunt log doesn't record it.
- Hunt 4's ICG climb from -10 to 0 (nine "Destroyed Enemy" kills, 9,785-10,471) fills the log's "Other income" row: 11 ICG station defence rewards (9,785-11,433) at 500 Cr each, 5,500 Cr in all (the last two gave no reputation).
