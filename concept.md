# SWI Bounty Hunter playthrough: concept

Status: **WIP, concept for agreement.** Enough to start exploring; details get worked out in later sessions.

## What this is

A YouTube series of recorded play sessions cut into short story videos, playing a bounty hunter in Star Wars Interworlds on X4 8.00, with a mod list tested for it. Stock SWI first; we add or build extras only where they make the series more fun or more interactive.

It's separate from A Pirate's Life (that's a 9.x mod; SWI is still on 8.00), but it's the other side of the same coin: hunting outlaws. What we learn about SWI, bounties and hunters feeds the mod's SWI profile and its [bounty hunters](https://github.com/ecarlste/x4-pirates-life-mod/blob/main/docs/DESIGN.md#bounty-hunters) design.

## Setup

- X4 8.00 HF4 NoSteam copy with SWI 0.90 ([Paths](https://github.com/ecarlste/x4-pirates-life-mod/blob/main/docs/PROJECT.md#paths-eriks-machine)).
- Mods and versions: [mods.md](mods.md). Every install, update or removal gets a row there.
- **The series starts on a fresh Bankrupt Bounty Hunter game**, once the locked mods are settled: stage 1 only works from 500 Cr and a shuttle. save_007 stays the test game, for trying features and story beats before they reach the series.

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
- **Publishing:** one Premiere a week on a fixed day. A second video from a good week goes into the buffer. Bank 3 videos before episode 1 goes public.
- **Editing** is outside the 4 hours. `make edit-markers` lists a recording's edit markers (game load, accept, sanction, kill, payout or failure, loss, engagements) with their positions in the video ([#22](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/22)).
- **Showcase videos:** one per `swibh` feature, about 3–8 minutes, plus a GitHub Wiki page, made when the feature ships in a release. They go in their own playlist and don't come out of the recording hours.
- **Channel:** a new space-games channel (name to be picked, e.g. "Spaceman Vam") under the same Google account as Vamorix. Vamorix stays as it is, its old videos stay up, and it points to the new channel. See [research/youtube-channel.md](research/youtube-channel.md).
- **Start gate:** recording starts once these are settled: the mods that can't be added after the start, the QoL mods, and every `swibh` feature needed to make bounty hunting an adventure, not just a job. The lists belong to [#10](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/10) and [#11](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/11). The mod goes out as GitHub Releases plus Nexus ([#8](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/8)).

## Story and character

Decided 2026-11-03 (grilling, [#3](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/3)).

- **Emergent, with a light spine.** The story is what the hunts produce, framed in the edit. A short spine of fixed beats gives each stage a goal; a beat lands when the game gets there, never on a schedule.
- **Bobby the Fat** keeps the stock name and backstory: debt from missed contract deadlines, ship sold, 500 Cr in Hutt space.
- **Shaddo the Hutt** holds the bounty: an invented creditor (not a canon Hutt), never seen in game. The bounty is debt collection, not a vendetta. The thread is told, not coded: any Hutt or pirate attack is framed as his collectors, starting with the R-41 ambush at the start, and the debt is a running total on screen. Paying it ends the collection, not Shaddo: he stays in the background as a possible client, rival or nemesis.
- **The debt** is sized so stage 1 lasts about 10 story videos, from the pay data of [Playtest the stock bounty loop](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/4). It's fixed before episode 1 and never changed on screen.
- **Narration:** you, playing, as yourself; the in-character framing (Bobby's log lines, Shaddo's messages) goes on title cards in the edit.
- **Every loss is canon.** Ejecting, retreating and rescue ships are all on camera, and recovering is part of the story. The only reload in the series is a true game over (stranded and out of air), and it adds one to an on-screen **death counter**. No reloading to try a fight another way: tactics get tried in the test game.

### Stages follow the target-size ladder

Taking the first target of a new size to paid is the beat that moves the series up.

1. **Broke:** S targets, solo, to pay Shaddo. Opens with the ambush and the debt stated; ends when the debt is paid.
2. **Making a name:** M then L targets, a better ship, the first wingmen, guild ranks.
3. **Big game:** XL targets, ending with the nemesis in an XL or an SWI dreadnought (XXL). Post-launch; a sketch only.

The ship and wing for each step are open: [Hunting ladder: ship and wing per target size](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/36), after [What the player can field per target size in SWI](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/35).

### Characters

- **Viewer-written:** the pilot of every wingman in the player's wing (and later any named crew) is a character written by viewers, in the style of the Kenshi Genesis series: viewers write and improve each other's stories on the casting call, and author score picks who joins. Each joins in their own video.
- **Dream ship:** the author picks a ship and loadout from a fixed list (set by the hunting-ladder ticket), maybe a size above where the character starts. Getting it for them is that character's thread.
- **Climbing the ladder:** characters move up in ship size with Bobby, as far as the game allows. When a bigger ship comes free, the character whose author has the highest **author score** gets it, if they're alive, in the wing and able to fly that size. The score counts one point per like on the author's story, plus one per like on each helpful feedback comment they leave on others' stories, so it rewards feedback people value, not arguing. How stories, the score and joining run: see [Viewer interaction](#viewer-interaction).
- **Death:** a character dies only if their suit's air runs out before they're picked up, so every rescue is played out. A pilot whose ship is destroyed always ejects in a spacesuit, and any ship of ours can pick them up (vanilla `md/notifications.xml` `PlayerOwnedKilled`, `aiscripts/order.rescue.ship.xml`; SWI doesn't change it). Suits have `<oxygen maxtime="30"/>` (`libraries/defaults.xml`, units not given); time it in the test game before episode 1. A character who dies gets a homage in the video and a credit in the description.
- **Intro cards and homages:** every named character (characters, Shaddo, the nemesis, notable targets when the edit thinks they've earned it) gets a short intro card when they first appear, and a homage if they die. How the cards look is production work (out of scope).

## Viewer interaction

Decided 2026-11-05 (grilling, [Launch viewer interaction](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/9)). Facts: [research/youtube-viewer-interaction.md](https://github.com/ecarlste/x4-swi-bounty-hunter/blob/research/youtube-viewer-interaction/research/youtube-viewer-interaction.md).

There's no live chat in the first run and recording runs 3 videos ahead, so viewers take part through things that can wait.

- **Casting call:** one normal video (not a Short), up with episode 1 and open all series, with a community post pointing to it. Stories are top-level comments, feedback is replies. Stories can't live on a community post: the Data API can't read those comments. Rules pinned on it: no links (the channel holds links for review), one active story per author, edit freely until picked. Before counting, clear the held-for-review and "likely spam" queues.
- **Joining:** when a wing slot opens in recording, the author with the highest **pick score** (points since their last pick; all of them if never picked) and no living character in the wing gets their character in. Promotion to a bigger ship uses the lifetime **author score**. Scores are snapshotted at that moment in recording; on a tie the earlier story wins. A story is frozen as of its pick, and the author carries it on in replies.
- **Score without a story:** feedback alone earns score, so a viewer can write a story later and enter with what they've built.
- **Deaths:** the author keeps their score. Their pick score starts again from the pick, so they get back in by staying active. Self-likes can't be filtered (nobody can see who liked a comment) and are accepted: at most 1 point per comment.
- **Counting:** a TypeScript script reads the casting call's threads and replies through the Data API and prints the scoreboard. It lives in its own repo, separate from the mod: this repo is `swibh` and its game tooling only. It's open source, so the algorithm is public, which is fine; the API key never goes in either repo. Run by hand at each wing slot and promotion. Built before the first wing slot, not before episode 1 ([#40](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/40)).
- **Polls** only on **standing choices** the game holds open for weeks (the next ship, a base, which faction's hunts to favour), posted when the choice shows in a published video and obeyed in the first session after the poll closes. Moments in a fight stay your call; the edit can ask "what would you have done?".
- **Ledger** in each description and a pinned post, looking back only: debt left to Shaddo, hunts taken to paid, the death counter, the wing roster with authors. No live most-wanted list: it would be 3 weeks stale.
- **Premiere chat:** you're in it at every Premiere. Nothing said there counts for votes or score.
- **Dropped or later:** chat picking the contract (no live chat); viewer names on targets or rivals (the mod could do it with `set_object_name`; post-launch); a companion site (below).
- **Companion site (post-launch):** a later effort. Fans would follow their character and give build and backstory input, fed from parsed saves or the hunt log, in real time or per publish. **Rule:** it never spoils: just enough to have fun with, with suspense kept for the videos (deaths, losses, spine beats wait for their Premiere). The vote stays on YouTube for the first run.

## Open questions

- How good is the stock bounty loop in SWI 0.90: variety, pay, pacing over a long series?
- Which extra mods fit (bounty, combat, UI, immersion), and do they work on 8.00 with SWI?
- ~~Videos, streams, or both; how long an episode; how often?~~ Recorded sessions cut into weekly story videos: see [Format](#format) (2026-11-02).
- ~~How viewers show up and take part, and what we show them between episodes?~~ The casting call, polls on standing choices, the ledger and Premiere chat: see [Viewer interaction](#viewer-interaction) (2026-11-05).
- ~~Does anything need building, and if so is it its own mod or part of A Pirate's Life's SWI profile?~~ Yes, its own extension on top of SWI: see [design.md](design.md) (2026-11-01).
