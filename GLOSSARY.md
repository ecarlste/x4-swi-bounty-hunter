# SWI Bounty Hunter

Bounty hunting in Star Wars Interworlds 0.90 on X4 8.00: a YouTube series played as a bounty hunter, and the `swibh` extension that makes a living from it possible at every ship size.

## Hunting

**Hunt**:
A bounty contract to find and kill one target ship for pay, offered by a contact (from SWI's Emergent Missions, or later from the extension itself) or found on a SWI wharf board. Its steps are Offer, Track, Strike, Escape and Payout.
_Avoid_: Bounty mission, contract (when the Hunt mission type is meant)

**Contact**:
A named person who represents one faction and offers the hunter hunts. The hunter meets them once in person at the faction's HQ and can reach them remotely from then on.
_Avoid_: Client, quest giver, faction (when the person is meant)

**Standing**:
How far the hunter has come with one contact, in tiers earned by hunts done for them. It's separate from the relation with the contact's faction, which only decides whether the contact will deal with the hunter.
_Avoid_: Reputation, relation, rank

**Notoriety**:
How famous the hunter is across the galaxy, in tiers from Nobody to Legendary. It rises with every completed hunt and never drops.
_Avoid_: Fame, reputation, renown

**Lead**:
One clue on the way to a hunt's target, such as a sighting, an informant or a jump record. Each lead points at the next, and the last gives a fresh position.
_Avoid_: Clue, hint, last-known location (that's SWI's stale position)

**Target**:
The ship a hunt names to be killed; "bounty target" in full.
_Avoid_: Mark, bounty (alone: that's the pay)

**Sanction**:
A permit, bought from the Bounty Hunters trade NPC, that lets the player attack a hunt's target. Partial stops the police response; Full also removes the relation loss for attacking the target.
_Avoid_: Hunt protection, licence

**Pay cap**:
SWI's limit on what an L or XL hunt pays out, set from the target's size rather than the offer.
_Avoid_: Reward cap

**Dead or Alive**:
An offer's usual terms: the hunt pays when the target is killed or captured, and pays more if its prisoner is also delivered.
_Avoid_: Wanted (on its own), kill bounty

**Alive only**:
An offer's terms when the target's pilot must be delivered as a prisoner; the hunt fails if the target dies.
_Avoid_: Capture bounty, live bounty

**Prisoner**:
A hunt target's pilot, taken from their escape pod and held aboard a ship in the player's wing until delivery. Never the target's crew or wingmen.
_Avoid_: Captive, passenger, arrest (the game has no arrest)

**Delivery**:
Handing a prisoner to the contact's faction by docking the ship that carries them at a station or ship of that faction.
_Avoid_: Turn-in, drop-off

## Wings

**Wing roll**:
The once-per-hunt roll, when the target first comes into range, that decides which of the target's wingmen desert and which stay loyal.
_Avoid_: Split roll, morale check

**Wing**:
A lead ship and every wingman attached to it. The two that matter are the **target's wing** and the **player's wing**, led by the ship the player flies.
_Avoid_: Fleet, squadron, group

**Wingman**:
A ship attached to a wing's lead, directly or as an escort of an escort, on either side. Drones, and ships docked inside another ship, are never wingmen.
_Avoid_: Escort (when the ship rather than the order is meant), wing ship

**Deserter**:
A target's wingman that deserts the target after the wing roll: it leaves the fight and goes on with its normal orders elsewhere.
_Avoid_: Bailer, bail (that's a crew abandoning its ship)

**Loyal wingman**:
A target's wingman that stays to fight after the wing roll; killing one costs no relation and adds to the hunt's pay.
_Avoid_: Hostile escort

**Buyout**:
Paying a target's wingman, through a contact before the strike, to desert. A wingman bought out always deserts at the wing roll.
_Avoid_: Bribe, payoff

## Ships

**Capture**:
Taking a ship for the player by making its crew bail, or by boarding it, then claiming it with a marine, who flies it until a character or a better pilot takes over. Fair game is a hunt's target, its loyal wingmen and any pirate. Capturing a hunt's target counts as killing it.
_Avoid_: Steal (in rules text), salvage, claim (that's only the last step)

**Build**:
A named loadout for one hull that ships with the extension: a **stock build** (one the player flies, or a placeholder until a character's author picks theirs) or a **homage build** (designed by the author whose character flies that ship, kept in the extension for good, and never an exact copy of an earlier one).
_Avoid_: Loadout (that's any ship's equipment, in the game's sense), BH loadout, fit

**Refit**:
A contact's service that brings a ship to one of their builds: it flies to the contact's faction wharf, docks, gets the build's equipment, repairs and bounty-hunter paint, then undocks and resumes its orders. A contact only offers builds its faction has the equipment for.
_Avoid_: Outfit, upgrade, wharf refit (that's the game's own)

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
A stretch of combat involving the player's wing, in any sector, from the first hit by or on any of its ships to the last before a quiet gap, or until the player's ship is lost or changed. A **hunt engagement** is one the target's wing takes part in.
_Avoid_: Fight, battle, combat (when the logged span is meant)

**Extractor**:
A TypeScript tool that reads a data source (the debug log through the log parser, or a save's logbook) and writes a report, such as `make hunt-log`.
_Avoid_: Parser (that's the shared module extractors use)

## Story

**Stage**:
One of the series arc's five parts: stage 0 (the dirty jobs, before any bounty work), then stages 1-4, each set by the largest target size the player takes on (S; M then weak L; L; XL and the nemesis).
_Avoid_: Act, chapter, season

**Dirty job**:
Low-paying work for Shaddo in stage 0 that chips at the debt and isn't a hunt: hauling trash loot, collecting a debt, a smuggling run.
_Avoid_: Shit job, odd job, side mission

**Rival hunter**:
Another bounty hunter going after the same target mid-hunt, who may help the player or fight them. The nemesis is one. Not a hunter sent after the player.
_Avoid_: Competitor, enemy hunter

**Rung**:
One target size on the hunting ladder (S, M, L, XL, then the nemesis): its wing configs, and the spine beat of the first hunt at that size taken to paid. An aim, never a gate. A stage spans one or more rungs.
_Avoid_: Tier, level

**Wing config**:
The ship Bobby flies plus his wing, counted as ships per size (not specific models), as one of a rung's three steps: **entry** (can just take that size), **established** (takes it reliably) or **top** (overmatches it, ready for the next size).
_Avoid_: Loadout (that's one ship's equipment), fleet setup

**Reserve pilot**:
A character already picked who has no ship yet and rides along until a seat comes free.
_Avoid_: Bench, spare

**Spine beat**:
A fixed story moment the series plays toward, such as Saving Shaddo or the first target of a new size taken to paid. It lands when the game gets there, never on a schedule.
_Avoid_: Plot point, milestone

**Character**:
A named person in the story: Bobby, Shaddo, the nemesis, or a viewer-written pilot of one of the player's wingmen.
_Avoid_: Wingman (that's the ship the character flies), NPC, crew member

**Author**:
The viewer who wrote a character's story.
_Avoid_: Submitter, owner

**Author score**:
An author's running total for the whole series: a point per like on their story, plus a point per like on each feedback comment they leave on others' stories, all on the casting call. Feedback alone earns it, before any story. The highest score decides which character is promoted to a bigger ship.
_Avoid_: Karma, points (alone)

**Pick score**:
The part of an author's score earned since their last character was picked (all of it for an author never picked). When a wing slot opens, the author with the highest pick score and no living character in the wing gets their character in.
_Avoid_: Entry points

**Casting call**:
The one video, up from episode 1 and open all series, where authors post character stories as comments and leave feedback as replies. A story is frozen as of its pick; later developments go in the author's replies.
_Avoid_: Call (alone), contest, submission thread, contract (that's the game's)

**Ledger**:
The hand-kept summary in each video's description and a pinned post, looking back only: debt left to Shaddo (until it's forgiven), hunts taken to paid, the death counter, the wing roster with each character's author.
_Avoid_: Most-wanted list, scoreboard

**Standing choice**:
A decision the game holds open for weeks (the next ship, a base, which faction's hunts to favour), the only kind put to a viewer poll; the result is obeyed in the first session after the poll closes.
_Avoid_: Story-beat poll

**Dream ship**:
The ship a character's author picks from a fixed list, flown with their homage build: the goal of that character's thread.
_Avoid_: Wishlist ship

**Death counter**:
The on-screen count of true game overs, the only reloads in the series.
_Avoid_: Reload count

## Recording

**Session**:
One fixed play slot of the series (1 h or 2 h). A hunt still open at its end carries over to the next session.
_Avoid_: Episode (that's a published video)

**Recording**:
One video file captured during a session. A session usually has one recording, more if capture was stopped and restarted.
_Avoid_: Session (when the file is meant), footage

**Edit marker**:
A key moment of a recording (game load, hunt accept, sanction, kill, payout or failure, a loss, an engagement's start and end) with its position in that recording, for cutting story videos.
_Avoid_: Bookmark, chapter, timestamp

## Releases

**Display name**:
"No Disintegrations - SWI Bounty Hunting": the extension's name for players, in `content.xml`, on Nexus and in showcase titles. It can change; the internal id `swibh` never does.
_Avoid_: Mod name (ambiguous with `swibh`), series name

**Pre-release**:
A testing version of the extension for us and a few testers; it may need a new game.
_Avoid_: Beta, alpha

**Release**:
A public version of the extension on Nexus or Steam Workshop; it must work on existing saves.
_Avoid_: Launch (that word is for the series)

## Mods

**Series mod**:
A mod chosen for the playthrough and listed as part of the series setup. What a series mod needs (DLC, other mods) is installed but isn't a series mod itself, and the extension requires only what it uses, never a series mod by default.
_Avoid_: Required mod, dependency (that's what the extension declares)

**Locked mod**:
A mod that changes the universe, jobs, factions or ships, or leaves things in the save, so it is installed before the series' first game starts and stays for the whole run.
_Avoid_: Core mod, permanent mod

**QoL mod**:
A mod that only changes the UI or the information shown, so it can be added or removed mid-run.
_Avoid_: UI mod (some locked mods have UI too)

**Version lock**:
The point, on the day the series is ready to launch, when the newest SWI and series mods have passed a short playtest, the docs are updated, and every version is fixed for the run.
_Avoid_: Freeze
