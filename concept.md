# SWI Bounty Hunter playthrough: concept

Status: **WIP, concept for agreement.** Enough to start exploring; details get worked out in later sessions.

## What this is

A YouTube series of recorded play sessions cut into short story videos, playing a bounty hunter in Star Wars Interworlds on X4 8.00, with a mod list tested for it. Stock SWI first; we add or build extras only where they make the series more fun or more interactive.

It's separate from A Pirate's Life (that's a 9.x mod; SWI is still on 8.00), but it's the other side of the same coin: hunting outlaws. What we learn about SWI, bounties and hunters feeds the mod's SWI profile and its [bounty hunters](https://github.com/ecarlste/x4-pirates-life-mod/blob/main/docs/DESIGN.md#bounty-hunters) design.

## Setup

- X4 8.00 HF4 NoSteam copy with SWI 0.90 ([Paths](https://github.com/ecarlste/x4-pirates-life-mod/blob/main/docs/PROJECT.md#paths-eriks-machine)).
- Mods and versions: [mods.md](mods.md). Every install, update or removal gets a row there.

## The stock start

SWI's **Bankrupt Bounty Hunter** (`x4ep1_sw_bhg` in SWI's `libraries/gamestarts.xml`):

- Character: Bobby the Fat, in Hutt Cartel space (Lannik), with 500 credits.
- Ship: a Fortitude-class shuttle with two lasers and basic software; everything else was sold to pay debts after missed contract deadlines.
- Difficulty "Moderate", with "a bounty on your head". Starting relations: slightly negative with the Hutt Cartel, Ascendancy and Commerce Guild; slightly positive with Corporate.

The bounty work itself comes from kuertee's Professions and Emergent Missions, which SWI bundles (`md/kuertee_professions*.xml`, `md/kuertee_emergent_missions*.xml`): a BountyHunter profession, a bounty hunters' guild, and bounty missions at stations. How these play is the first thing to find out.

## Format

Decided 2026-11-02 (grilling, [#2](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/2)).

- **Recorded, not live, for the whole first run.** Live streaming waits for a later run, perhaps one with A Pirate's Life.
- **Videos:** each recorded session is cut into story videos of 10–20 minutes: one contract (taken to paid) or one arc beat, which can span sessions. Only the fun parts stay in. No Shorts, ever: the community takes part through storytelling together, not feeds built for compulsive watching.
- **Raw sessions** go up on the same channel in their own playlist, without notifications (YouTube allows 3 per channel per 24 h).
- **Recording:** 4 hours a week in fixed slots: 2×1 h on weekdays and 1×2 h at the weekend, so the family can count on the time outside them. Sessions follow real-world time: they end on time or a few minutes early, at a lull, so the join between sessions isn't noticeable. A hunt still open carries over to the next session.
- **Publishing:** one Premiere a week on a fixed day. A second video from a good week goes into the buffer. Bank 3 videos before episode 1 goes public.
- **Editing** is outside the 4 hours. `make edit-markers` lists a recording's edit markers (accept, sanction, kill, payout, loss, engagements) with their positions in the video ([#22](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/22)).
- **Showcase videos:** one per `swibh` feature, about 3–8 minutes, plus a GitHub Wiki page, made when the feature ships in a release. They go in their own playlist and don't come out of the recording hours.
- **Channel:** a new space-games channel (name to be picked, e.g. "Spaceman Vam") under the same Google account as Vamorix. Vamorix stays as it is, its old videos stay up, and it points to the new channel. See [research/youtube-channel.md](research/youtube-channel.md).
- **Start gate:** recording starts once these are settled: the mods that can't be added after the start, the QoL mods, and every `swibh` feature needed to make bounty hunting an adventure, not just a job. The lists belong to [#10](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/10) and [#11](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/11). The mod goes out as GitHub Releases plus Nexus ([#8](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/8)).

## Series arc (first sketch)

From broke hunter in a shuttle to a feared name in the guild:

1. **Broke:** take any contract to pay off the debt and stay ahead of whoever holds the bounty on us.
2. **Making a name:** rank up in the guild, better ship, first wingmen.
3. **Big game:** high-value targets, capital-ship hunts, a nemesis or two.

The plot for the series, and whether Bobby the Fat stays the name, is open.

## Viewer interaction (ideas, nothing decided)

- Chat picks the next contract from the board.
- Viewers' names on targets, rivals or crew.
- Polls at story beats: take the bribe or bring them in, spare or destroy.
- A standing "most wanted" list the audience follows between streams.

Some of these work with stock SWI and a human reading chat; others would need a mod. Which ones are worth building is a later question.

## Open questions

- How good is the stock bounty loop in SWI 0.90: variety, pay, pacing over a long series?
- Which extra mods fit (bounty, combat, UI, immersion), and do they work on 8.00 with SWI?
- ~~Videos, streams, or both; how long an episode; how often?~~ Recorded sessions cut into weekly story videos: see [Format](#format) (2026-11-02).
- How viewers show up and take part, and what we show them between episodes. There's no live chat in the first run, so it happens between episodes.
- ~~Does anything need building, and if so is it its own mod or part of A Pirate's Life's SWI profile?~~ Yes, its own extension on top of SWI: see [design.md](design.md) (2026-11-01).
