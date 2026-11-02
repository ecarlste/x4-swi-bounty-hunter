# SWI Bounty Hunter

Bounty hunting in Star Wars Interworlds 0.90 on X4 8.00: a YouTube series played as a bounty hunter, and the `swibh` extension that makes a living from it possible at every ship size.

## Hunting

**Hunt**:
A bounty contract from SWI's Emergent Missions to find and kill one target ship for pay.
_Avoid_: Bounty mission, contract (when the Hunt mission type is meant)

**Target**:
The ship a hunt names to be killed; "bounty target" in full.
_Avoid_: Mark, bounty (alone: that's the pay)

**Sanction**:
A permit, bought from the Bounty Hunters trade NPC, that lets the player attack a hunt's target. Partial stops the police response; Full also removes the relation loss for attacking the target.
_Avoid_: Hunt protection, licence

**Pay cap**:
SWI's limit on what an L or XL hunt pays out, set from the target's size rather than the offer.
_Avoid_: Reward cap

## Wings

**Wing roll**:
The once-per-hunt roll, when the target first comes into range, that decides which of the target's wingmen desert and which stay loyal.
_Avoid_: Split roll, morale check

**Wing**:
A lead ship and every wingman attached to it. The two that matter are the **target's wing** and the **player's wing**, led by the ship the player flies.
_Avoid_: Fleet, squadron, group

**Wingman**:
A ship attached to a wing's lead, directly or as an escort of an escort, on either side. Drones are never wingmen.
_Avoid_: Escort (when the ship rather than the order is meant), wing ship

**Deserter**:
A target's wingman that deserts the target after the wing roll: it leaves the fight and goes on with its normal orders elsewhere.
_Avoid_: Bailer, bail (that's a crew abandoning its ship)

**Loyal wingman**:
A target's wingman that stays to fight after the wing roll; killing one costs no relation and adds to the hunt's pay.
_Avoid_: Hostile escort

## Logging

**Log event**:
One `[swibh] {json}` line the extension writes to the debug log, typed by its `type` field and defined in the log schema (ADR 0001).
_Avoid_: Log line (when the typed record is meant), message

**Hunt key**:
The id that groups every log event of one hunt: `<mission N>-<target idcode>-<accept game time>`. SWI's own mission id isn't unique on its own.
_Avoid_: Hunt id, mission id (when the key is meant)

**Open hunt**:
A hunt with a `hunt.accept` event and no `hunt.end`, from a reloaded save or an ending the logger missed. Reported apart and kept out of the stats.
_Avoid_: Unfinished hunt

**Wall time**:
The real-world local time a log event happened, as opposed to game time, which stops on pause and runs fast under SETA (ADR 0002).
_Avoid_: Real time, system time, timestamp (when wall time is meant)

**Engagement**:
A stretch of combat involving the player's wing, in any sector, from the first hit by or on any of its ships to the last before a quiet gap. A **hunt engagement** is one the target's wing takes part in. A wingman joins it with its first hit.
_Avoid_: Fight, battle, combat (when the logged span is meant)

**Extractor**:
A TypeScript tool that reads a data source (the debug log through the log parser, or a save's logbook) and writes a report, such as `make hunt-log`.
_Avoid_: Parser (that's the shared module extractors use)

## Recording

**Session**:
One fixed play slot of the series (1 h or 2 h). A hunt still open at its end carries over to the next session.
_Avoid_: Episode (that's a published video)

**Recording**:
One video file captured during a session. A session usually has one recording, more if capture was stopped and restarted.
_Avoid_: Session (when the file is meant), footage

**Edit marker**:
A key moment of a recording (hunt accept, sanction, kill, payout or failure, a loss, the game load) with its position in that recording, for cutting story videos.
_Avoid_: Bookmark, chapter, timestamp

## Releases

**Pre-release**:
A testing build of the extension for us and a few testers; it may need a new game.
_Avoid_: Beta, alpha

**Release**:
A public build of the extension on Nexus or Steam Workshop; it must work on existing saves.
_Avoid_: Launch (that word is for the series)
