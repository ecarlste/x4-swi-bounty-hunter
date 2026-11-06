# SWI Bounty Hunter playthrough: concept

Status: **WIP, concept for agreement.** Enough to start exploring; details get worked out in later sessions.

## What this is

A YouTube series of recorded play sessions cut into short story videos, playing a bounty hunter in Star Wars Interworlds on X4 8.00, with a mod list tested for it. Stock SWI first; we add or build extras only where they make the series more fun or more interactive.

It's separate from A Pirate's Life (that's a 9.x mod; SWI is still on 8.00), but it's the other side of the same coin: hunting outlaws. What we learn about SWI, bounties and hunters feeds the mod's SWI profile and its [bounty hunters](https://github.com/ecarlste/x4-pirates-life-mod/blob/main/docs/DESIGN.md#bounty-hunters) design.

## Setup

- X4 8.00 HF4 NoSteam copy with SWI 0.90 ([Paths](https://github.com/ecarlste/x4-pirates-life-mod/blob/main/docs/PROJECT.md#paths-eriks-machine)).
- Mods and versions: [mods.md](mods.md). Every install, update or removal gets a row there.
- **The series starts on a fresh Bankrupt Bounty Hunter game**, once the locked mods are settled: stage 0 only works from 500 Cr and a shuttle. save_007 stays the test game, for trying features and story beats before they reach the series.

## The stock start

SWI's **Bankrupt Bounty Hunter** (`x4ep1_sw_bhg` in SWI's `libraries/gamestarts.xml`):

- Character: Bobby the Fat, in Hutt Cartel space (Lannik), with 500 credits.
- Ship: a Fortitude-class shuttle with two lasers and basic software; everything else was sold to pay debts after missed contract deadlines.
- Difficulty "Moderate", with "a bounty on your head". Starting relations: slightly negative with the Hutt Cartel, Ascendancy and Commerce Guild; slightly positive with Corporate.

The bounty work itself comes from kuertee's Professions and Emergent Missions, which SWI bundles (`md/kuertee_professions*.xml`, `md/kuertee_emergent_missions*.xml`): a BountyHunter profession, a bounty hunters' guild, and bounty missions at stations. How these play is the first thing to find out.

## Format

Decided 2026-11-02 (grilling, [#2](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/2)).

- **Recorded, not live, for the whole first run.** Live streaming waits for a later run, perhaps one with A Pirate's Life.
- **Videos:** each recorded session is cut into story videos of 10–20 minutes: one hunt (taken to paid) or one arc beat, which can span sessions. Only the fun parts stay in. No Shorts, ever: the community takes part through storytelling together, not feeds built for compulsive watching.
- **Raw recordings** go up on the same channel in their own playlist, without notifications (YouTube allows 3 per channel per 24 h).
- **Recording:** 4 hours a week in fixed slots: 2×1 h on weekdays and 1×2 h at the weekend, so the family can count on the time outside them. Sessions follow real-world time: they end on time or a few minutes early, at a lull, so the join between sessions isn't noticeable. A hunt still open carries over to the next session.
- **Publishing:** one Premiere a week on a fixed day. A second video from a good week goes into the buffer. No bank before episode 1: it premieres on its cliffhanger, and the buffer builds once the casting call is running (amended by [Saving Shaddo](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/50), 2026-11-06).
- **Editing** is outside the 4 hours. `make edit-markers` lists a recording's edit markers (game load, accept, sanction, kill, payout or failure, loss, engagements) with their positions in the video ([#22](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/22)).
- **Showcase videos:** one per `swibh` feature, about 3–8 minutes, plus a GitHub Wiki page, made when the feature ships in a release. They go in their own playlist and don't come out of the recording hours.
- **Channel:** a new space-games channel (name to be picked, e.g. "Spaceman Vam") under the same Google account as Vamorix. Vamorix stays as it is, its old videos stay up, and it points to the new channel. See [research/youtube-channel.md](research/youtube-channel.md).
- **Start gate:** recording starts once these are settled: the mods that can't be added after the start, the QoL mods, and every `swibh` feature needed to make bounty hunting an adventure, not just a job. The lists belong to [#10](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/10) and [#11](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/11). The mod goes out as GitHub Releases plus Nexus ([#8](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/8)).

## Story and character

Decided 2026-11-03 (grilling, [#3](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/3)).

- **Emergent, with a light spine.** The story is what the hunts produce, framed in the edit. A short spine of fixed beats gives each stage a goal; a beat lands when the game gets there, never on a schedule.
- **Bobby the Fat** keeps the stock name and backstory: debt from missed contract deadlines, ship sold, 500 Cr in Hutt space.
- **Shaddo the Hutt** holds the bounty: an invented Hutt Cartel boss (not a canon Hutt), in game since [Saving Shaddo: the scripted rescue](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/50) (2026-11-06; this replaces "never seen in game, told not coded"). Bobby missed deadlines on a job for him, so Shaddo hired Hutt Pirates to collect: the R-41s that attack at the start are `huttpirates` (SWI `setup_gamestarts_sw.xml`), and the start is in Hutt Cartel space. The debt is a running total on screen until it's forgiven at the rescue.
- **The debt** would take years to pay off on dirty jobs; it's never paid, only forgiven (see stage 0).
- **Narration:** you, playing, as yourself; the in-character framing (Bobby's log lines, Shaddo's messages) goes on title cards in the edit.
- **Every loss is canon.** Ejecting, retreating and rescue ships are all on camera, and recovering is part of the story. The only reload in the series is a true game over (stranded and out of air), and it adds one to an on-screen **death counter**. No reloading to try a fight another way: tactics get tried in the test game.

### Stages follow the target-size ladder

Taking the first target of a new size to paid is the beat that moves the series up.

0. **Dirty jobs (all of episode 1):** short, to show Bobby suffering without dragging. Opens with the ambush and the debt stated. Three **dirty jobs** for Shaddo, in order: haul a load of trash loot to a buyer, collect a debt from a late payer, then a smuggling run that ends where Shaddo is. Ends with **Saving Shaddo** (below).
1. **S:** bounty work begins, with the newbie wingman. Ends with the first M hunt taken to paid.
2. **M, then weak L.**
3. **L,** until the wing is XL-capable. Post-launch sketch.
4. **XL farming,** ending with the nemesis. Post-launch sketch.

### Saving Shaddo

Decided 2026-11-06 (grilling, [Saving Shaddo: the scripted rescue](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/50)).

- **Trigger:** the attack starts when Bobby arrives at the third dirty job's destination. "We just happen to be there."
- **The hunter:** a fixed, named NPC we write, in an S heavy fighter a bit stronger than Bobby's, with 1-2 escorts. He can be beaten. If he ejects he gets away and returns as the nemesis. If the player kills his pod, a named sibling or child takes up the revenge instead.
- **Shaddo ejects:** Bobby picks up his pod and delivers him to his station. That delivery is the first in-person meeting with the contact, where the reward is given.
- **Outcomes:**

  | Outcome | Debt | Contact | Wingman |
  |---|---|---|---|
  | Shaddo and at least 1 escort R-41 survive | forgiven (he'd be dead otherwise, and knows it) | Shaddo | Shaddo's newbie in a surviving escort R-41 |
  | Shaddo survives, no escort survives | forgiven | Shaddo | Half an R-41's price in cash; Bobby captures an S on his first bounty and the newbie flies it |
  | Shaddo dies | cleared (nobody owes a dead Hutt) | his sibling or child, told by his henchmen what Bobby tried | none from Shaddo: Bobby captures an S on his first bounty and recruits its pilot |
  | Questline skipped | none | Shaddo or a random contact (a menu option) | none |

- **Why Shaddo gives a wingman:** he wants Bobby alive and loyal, so Bobby will come again if he's ever in trouble. That's a hook for a later rescue from the nemesis.
- **Bobby keeps the Fortitude.** The newbie flies the reward ship. Bobby's own upgrade comes from the Guild or from capture in stage 1.
- **Episode 1 ends** with the newbie unnamed, as the cliffhanger and the casting call's opening, and a short tease of the contact UI. The capture fallback adds one quick stage 1 fight and makes the cut 5-10 min longer, but it ends at the same point.
- **In `swibh` for every player:** the questline is on by default only in a new Bankrupt Bounty Hunter game. Other starts and existing saves begin with contacts unlocked, with a settings button to start the questline. A skip button (like skipping a tutorial) and feature flags in the settings menu work as in A Pirate's Life. It must be built before episode 1 ([Extension scope at launch](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/11)). Captures assume A Pirate's Life's S/M port is ready at launch.

### The hunting ladder

Decided 2026-11-05 (grilling, [Hunting ladder: ship and wing per target size](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/36)). Facts: [What the player can field per target size in SWI](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/35), [research/corp-ship-ladder.md](research/corp-ship-ladder.md), [research/reapers-ship-pack-ships.md](https://github.com/ecarlste/x4-swi-bounty-hunter/blob/research/reapers-ship-pack-ships/research/reapers-ship-pack-ships.md).

Each **rung** (one target size) has three wing configs: **entry** (can just take the size), **established** (takes it reliably) and **top** (seal-clubbing it, ready for the next size). Trials in the test game set them. A rung is an aim, not a gate. Bobby flies the first ship of each config and leads.

**A config is a count of ships per size, not a list of models** (amended by [Saving Shaddo](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/50), 2026-11-06). The ships named below are examples. The real ships come from the Guild first, then capture plus a contact refit. Each author's dream ship decides which contact gets used, since the right contact is needed to refit it to its strongest build. Bobby's first replacement for the Fortitude may well be a captured S.

| Rung | Entry | Established | Top |
|---|---|---|---|
| S | Fortitude (the start ship) + the newbie in an R-41 | 2 S | Bobby's S + 4 S wingmen |
| M | HWK-290 + 4 R-41 (or N-1 Modified) | HWK-290 + 3 HWK-290 + 4 R-41 | Firespray + 4 corvettes or corsairs (Weequay, C-ROC, Gozanti) + 4 HWK-290 + 4 R-41 |
| L | Not set: no L target played yet. Ideas: the Heraklon Auxiliary Carrier (Reaper's; claim a derelict or 3.88 M at Nar Shaddaa), a pack of M ships stripping turrets then bail or board, bombers | | |
| XL | Venator (Clone Era), bought at Kamino (40 M licence + about 39.6 M) or captured, with Bobby's fighter docked in it for the kill | | |
| Nemesis | No new ship: the XL fleet. XXL ownership stays off the ladder | | |

- The M configs are the user's plan, to be proven in [M-rung loadout trials](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/47) (the HWK leads and strips shields; a wingman loss in an earlier 4 R-41 fight shows the risk). The top M config is the step up to weak L targets.
- **Ships are stolen first, bought second:** captured from bounty targets and pirates, then refitted as bounty-hunter ships. Buying (corporation, Bounty Hunters and Valarian licences; no stations) is the fallback. Open: [Capture and refit: how Bobby gets his ships](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/49), after [Pirates mod capture: what ports to 8.00 + SWI](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/48). Live prisoners worth more than dead: [Alive bounties: prisoners worth more alive](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/51).
- **Dream-ship list:** every ship in a rung's configs. For now: R-41, N-1 Modified, HWK-290, Firespray, Weequay Corvette, C-ROC Corsair, Gozanti. L and XL picks (bombers among them) join when those rungs are set.

### Characters

- **Viewer-written:** the pilot of every wingman in the player's wing (and later any named crew) is a character written by viewers, in the style of the Kenshi Genesis series: viewers write and improve each other's stories on the casting call, and author score picks who joins. Each joins in their own video.
- **Dream ship:** the author picks a ship and loadout from a fixed list (the ships in the hunting ladder's configs), maybe a size above where the character starts.
- **Cadence, no cap:** the first character is the newbie from Saving Shaddo, named from the casting call after episode 1; then 1 per published video (amended by [Saving Shaddo](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/50)). A character with no free ship is a **reserve pilot** until a captured or bought ship gives them a seat. Amends the "wing slot opens" rule of [Launch viewer interaction](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/9) (decided in [#36](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/36)). Getting it for them is that character's thread.
- **Climbing the ladder:** characters move up in ship size with Bobby, as far as the game allows. When a bigger ship comes free, the character whose author has the highest **author score** gets it, if they're alive, in the wing and able to fly that size. The score counts one point per like on the author's story, plus one per like on each helpful feedback comment they leave on others' stories, so it rewards feedback people value, not arguing. How stories, the score and joining run: see [Viewer interaction](#viewer-interaction).
- **Death:** a character dies only if their suit's air runs out before they're picked up, so every rescue is played out. A pilot whose ship is destroyed always ejects in a spacesuit, and any ship of ours can pick them up (vanilla `md/notifications.xml` `PlayerOwnedKilled`, `aiscripts/order.rescue.ship.xml`; SWI doesn't change it). Suits have `<oxygen maxtime="30"/>` (`libraries/defaults.xml`, units not given); time it in the test game before episode 1. A character who dies gets a homage in the video and a credit in the description.
- **Intro cards and homages:** every named character (characters, Shaddo, the nemesis, notable targets when the edit thinks they've earned it) gets a short intro card when they first appear, and a homage if they die. How the cards look is production work (out of scope).

## Viewer interaction

Decided 2026-11-05 (grilling, [Launch viewer interaction](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/9)). Facts: [research/youtube-viewer-interaction.md](https://github.com/ecarlste/x4-swi-bounty-hunter/blob/research/youtube-viewer-interaction/research/youtube-viewer-interaction.md).

There's no live chat in the first run and recording runs a few videos ahead once the buffer builds, so viewers take part through things that can wait.

- **Casting call:** one normal video (not a Short), up with episode 1 and open all series, with a community post pointing to it. Stories are top-level comments, feedback is replies. Stories can't live on a community post: the Data API can't read those comments. Rules pinned on it: no links (the channel holds links for review), one active story per author, edit freely until picked. Before counting, clear the held-for-review and "likely spam" queues.
- **Joining:** at each pick (the newbie first, then 1 per published video; see Characters), the author with the highest **pick score** (points since their last pick; all of them if never picked) and no living character in the wing gets their character in. Promotion to a bigger ship uses the lifetime **author score**. Scores are snapshotted at that moment in recording; on a tie the earlier story wins. A story is frozen as of its pick, and the author carries it on in replies.
- **Score without a story:** feedback alone earns score, so a viewer can write a story later and enter with what they've built.
- **Deaths:** the author keeps their score. Their pick score starts again from the pick, so they get back in by staying active. Self-likes can't be filtered (nobody can see who liked a comment) and are accepted: at most 1 point per comment.
- **Counting:** a TypeScript script reads the casting call's threads and replies through the Data API and prints the scoreboard. It lives in its own repo, separate from the mod: this repo is `swibh` and its game tooling only. It's open source, so the algorithm is public, which is fine; the API key never goes in either repo. Run by hand at each wing slot and promotion. Built before the first wing slot, not before episode 1 ([#40](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/40)).
- **Polls** only on **standing choices** the game holds open for weeks (the next ship, a base, which faction's hunts to favour), posted when the choice shows in a published video and obeyed in the first session after the poll closes. Moments in a fight stay your call; the edit can ask "what would you have done?".
- **Ledger** in each description and a pinned post, looking back only: debt left to Shaddo (episode 1 only), hunts taken to paid, the death counter, the wing roster with authors. No live most-wanted list: it would be 3 weeks stale.
- **Premiere chat:** you're in it at every Premiere. Nothing said there counts for votes or score.
- **Dropped or later:** chat picking the contract (no live chat); viewer names on targets or rivals (the mod could do it with `set_object_name`; post-launch); a companion site (below).
- **Companion site (post-launch):** a later effort. Fans would follow their character and give build and backstory input, fed from parsed saves or the hunt log, in real time or per publish. **Rule:** it never spoils: just enough to have fun with, with suspense kept for the videos (deaths, losses, spine beats wait for their Premiere). The vote stays on YouTube for the first run.

## Open questions

- How good is the stock bounty loop in SWI 0.90: variety, pay, pacing over a long series?
- Which extra mods fit (bounty, combat, UI, immersion), and do they work on 8.00 with SWI?
- ~~Videos, streams, or both; how long an episode; how often?~~ Recorded sessions cut into weekly story videos: see [Format](#format) (2026-11-02).
- ~~How viewers show up and take part, and what we show them between episodes?~~ The casting call, polls on standing choices, the ledger and Premiere chat: see [Viewer interaction](#viewer-interaction) (2026-11-05).
- ~~Does anything need building, and if so is it its own mod or part of A Pirate's Life's SWI profile?~~ Yes, its own extension on top of SWI: see [design.md](design.md) (2026-11-01).
