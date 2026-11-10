# Crew and turret accuracy: published sources (2026-11-10)

Question: does an NPC ship's crew (service crew count or skill) change how well its turrets hit, or how it fights, repairs and bails? Hypothesis under test: "giving M ships full crews made their gunners more accurate".

This note covers **published sources only** (patch notes, Egosoft wiki, Egosoft-affiliated forum posts, community guides). The game files are read separately; where this note says "a guide claims X from the scripts", that claim still needs checking against 8.00 `base/` (`aiscripts/`, `md/`, `libraries/`).

Tags: **[official]** = Egosoft patch notes or an Egosoft-tagged account. **[wiki]** = Egosoft wiki page text (author staff status not verified). **[community]** = players. **[old]** = before 4.00.

## Verdict

**Unclear, leaning refuted for in-sector (high attention) turret aim. Plausible for out-of-sector (low attention) hits, but only on a community guide's word.**

- No Egosoft patch note, from 1.20 to 9.00, ties turret aim to crew. Every turret-accuracy note is a plain aim-code fix (prediction, rotation, firing range), with no skill or crew in it.
- An Egosoft-tagged moderator says turrets "aim and shoot, thats it" and that service crew "have nothing to do with Turrets" beyond repairing them.
- What crew *does* feed, per official notes: a ship-level **combined skill** (pilot plus crew) used at least for formations, and crew-driven self-repair. Per a detailed community guide (9.00), that combined skill also sets the **low-attention hit chance**, the repair threshold, and the chance a ship bails. Low attention is the abstract combat simulated away from the player. So a full crew could make an M ship hit more often out of the player's sight, but not in the player's sector, if the guide is right.
- Pilot-only ships: the guide's formula puts a 5-star pilot with no service crew at combined skill 70 (about 3.3 stars) against 100 with a full 5-star crew. If true, they bail more readily and repair less. This is not confirmed by Egosoft.

## Official sources

Patch notes come from Egosoft's Steam announcements (fetched in full via the Steam news API, `ISteamNews/GetNewsForApp`, appid 392160). The same text is on forum.egosoft.com. The lines below are every crew/skill/turret-aim/bail line that bears on the question.

| Version, date | Line (verbatim) | Bearing |
|---|---|---|
| 1.30, 2018-12-07 [old] | "Improved accuracy of turrets and gimballed weapons." | Aim code, no crew. |
| 1.50, 2018-12-20 [old] | "Fixed turrets and self-maintenance not working on ships whose pilots bailed out." | A pilotless ship lost turrets by bug; crew not involved. |
| 2.00, 2019-02-25 [old] | "Improved turret aiming and target movement prediction." | Aim code. |
| 2.00 | "Improved combat movement of capital ships with good captains and crews that do not have forward-mounted weapons..." | Crew skill affects capital *movement*, not turret aim. |
| 2.00 | "Improved balancing of capital ship crews bailing when ship is attacked." | Bail. |
| 4.00, 2021-03-16 | "Added possibility for crew to bail when under attack by NPCs." | NPC-vs-NPC bail. |
| 4.00 | "Fixed fleet commanders using their piloting skill rather than their combined skill for determining validity of formation shapes." | Confirms a separate **combined skill** (pilot plus crew) exists and is used for formations. |
| 4.00 | "Fixed turrets sometimes aiming at empty space...", "Fixed turret aiming against large targets." | Aim code. |
| 4.20 beta, 2021-11-17 | "Fixed large turrets missing small targets by aiming at wrong position." | Aim code. |
| 5.00, 2022-03-14 | "Fixed ship crews bailing in response to player demanding they surrender while in spacesuit." | Surrender. |
| 7.00, 2024-06-20 | "Added crew bailing out of player-owned ships that are destroyed." / "Fixed ship repair taking longer than it should with crew aboard." | Crew and repair are linked. |
| 7.00 | "Improved accuracy of weapon aim prediction." | Aim code. |
| 7.10, 2024-08-08 | "Improved firing range accuracy of turrets." | Aim code. |
| 7.50 beta 4, 2025-01-09 | "Fixed inaccurate beam turrets and improved general weapon accuracy." / "Fixed player-owned crew sometimes bailing into escape pods." | Aim code; bail. |
| 8.00 RC1, 2025-08-27 | "Improved weapon accuracy against moving targets." / "Improved weapon precision by more accurately scaling aim based on target's visible size and distance." | Aim code. No crew line anywhere in 8.00. |
| 9.00 beta, 2026-03-11 | "Turret accuracy has been vastly improved." / "Improved weapon and turret aim prediction." | Aim code. After 8.00. |
| 9.00 beta | "AI pilot aiming is now more organic. Depending on the skill of the pilot, evasive manoeuvres and strafing are more effective at throwing off their aim." | The only official skill-to-aim link: **pilot** skill, 9.00 and later. It doesn't say turrets or crew. |
| 9.00 beta | "Improved balancing of number of crew bailing out of destroyed player-owned ships." | Bail. |

Links (all under `https://steamstore-a.akamaihd.net/news/externalpost/steam_community_announcements/`): 1.30 `2416641943176244952`, 1.50 `2417769111283885032`, 2.00 `2480825216203844096`, 4.00 `5556851879153337409`, 7.00 `5759622039976766036`, 8.00 RC1 `1809235871557883`, 9.00 beta `1826992588590295`.

**Egosoft-tagged forum posts** (eMYNOCK carries Steam's [developer] tag. He is an Egosoft community moderator, not a confirmed programmer):

- 2022-10-18, "Crew for turrets?", https://steamcommunity.com/app/392160/discussions/0/1746766058732893887/ : "the overall skill of the total crew plus the captain combined determines the overall performance of a ship." / "for turrets.. they aim and shoot, thats it." Same thread, 2019-12-21: "No, Crews are needed for passive Repairs."
- 2021-07-18, "Round two of trying to find 100% answer: Turrets+Service crew", https://steamcommunity.com/app/392160/discussions/0/5208960061400031858/ : service crew affect ship behaviour and self-maintenance and "have nothing to do with Turrets" beyond repairing them on larger ships. He adds that turrets that can't hit a target don't fire at it.

The two posts are about 4.x/5.x, with no game version stated.

## Egosoft wiki

- Crew page, https://wiki.egosoft.com/X4%20Foundations%20Wiki/Manual%20and%20Guides/Objects%20in%20the%20Game%20Universe/Equipment/Crew/ . Rev 1.1 by Daniel Turner, 2018-12-11 [old]. Last edit by KittenMittens, 2025-01-08. Text: service crew "improve the ship's capabilities: controlling, aiming, trading.. and repairing!"; "The overall quality of the ship's crew is improved with the number of crew members and experience level of each crew member"; "All NPCs work better with higher morale!" This is the **only official-looking source that says crew improve "aiming"**. It is vague, dates from 1.x, gives no mechanism, and doesn't say turrets.
- Comments on that page (revision diff, https://wiki.egosoft.com/X4%20Foundations%20Wiki/Manual%20and%20Guides/Objects%20in%20the%20Game%20Universe/Equipment/Crew/?xpage=print&viewer=changes&rev2=8.1&rev1=27.1&language=en), from 2020-05-18 [old, community]: "AFAIK I haven't seen any correlation between turret accuracy and crew skill" and "your turrets' efficacy isn't impacted by the amount of crew you have." Opinion, with no test.
- Manual, Combat And Weapons (Daniel Turner, 2024-01-11) and NPC Behaviours ("Updated for 5.10", 2023-12-03): neither mentions crew effects on turrets.

## Community sources

- **"[9.00] X4 In-Depth FAQ"**, Kitten Mittens, Steam guide, posted 2024-01-21 and updated for 9.00: https://steamcommunity.com/sharedfiles/filedetails/?id=3120616748 . It names script tags (e.g. `fight.attack.object.fighter`) but gives no file paths and no test data. The fetch showed a Steam notice that the item was removed or flagged, so it may vanish. Its claims:
  - Each NPC's `combinedskill` = 80% main skill plus 20% morale.
  - Ship `combinedskill` = 70% pilot's plus 30% of the **average** over all service-crew slots. Empty seats and marines count as 0. Example: "a ship with a 5 star pilot, a full allotment of marines and no service crew ... will have a combinedskill of 70 (3 and 1/3rd stars)."
  - **Low attention** (M and capital): ships fire at each target "with a chance between the higher of 90 and combinedskill". Only ships above 90 have under a 10% miss chance. The guide states no skill-to-hit rule for high attention.
  - Repair: a check every 2 to 3 minutes, with the hull threshold for starting repairs set by combinedskill.
  - Bail: "eject_chance starts at 46%, then subtract up to 20% based on the combinedskill of the target ship". Prerequisites include hull below 75% and low shields. Pilots never abandon capital ships.
  - Surrender: needs empty crew space set by pilot morale (6.25% per morale point).
- Steam "what does service crew do?", 2021-03-22, https://steamcommunity.com/app/392160/discussions/0/3104642254791671668/ : Akira_R says combined crew skill affects "turret aiming". The numbers are self-declared "made up". One anecdote: marines-only M-ship turrets missed, and service crew "seemed" to fix it. Weak.
- Same thread as eMYNOCK 2022, hurepoix: ran destroyers with only a captain and "noticed no difference". Anecdote, no data.
- Egosoft forum "Turrets manned by the blind?", 2018-12-01/02 [old], https://forum.egosoft.com/viewtopic.php?t=402779 : "More service crew doesnt change a thing." Speculation, 1.x.
- Egosoft forum "How is skill actually calculated?", 2023-07-30, https://forum.egosoft.com/viewtopic.php?p=5198453 : skill 0-15 maps to 0-100 in scripts (100 = 5 stars). Weighting is "in one of the files in libraries", unnamed. No staff replies.

## Official vs community

| Claim | Official? | Status |
|---|---|---|
| Turret aim (in sector) depends on crew | No. Moderator says no. Wiki 1.x says crew improve "aiming", vaguely | Unproven; leans no |
| A combined pilot-plus-crew skill exists and matters | Yes (4.00 note, moderator) | Confirmed |
| Crew enable or speed up self-repair | Yes (moderator, 7.00 note) | Confirmed |
| Low-attention hit chance = max(90, combinedskill)-ish | No, guide only | Check `aiscripts` |
| 70/30 pilot/crew weighting; marines and empty seats count as 0 | No, guide only | Check `libraries/` or scripts |
| Combinedskill lowers bail chance | No, guide only (4.00 added NPC bailing) | Check `md`/`aiscripts` |
| Pilot skill affects aim | Yes, 9.00 only, and probably the pilot's own guns | After 8.00 |

## What remains unproven

- Whether high-attention turret fire reads any skill at all. No published source shows it does. The game files would settle it (look for `combinedskill` or `skill` near turret or weapon fire in `aiscripts/`).
- The low-attention hit formula, the 70/30 weighting and the bail formula, all from one community guide. Verify against 8.00 `base/`.
- What the wiki's "aiming" claim referred to. It may mean low-attention combat or the pilot's own guns.
- So for the hypothesis: if full crews seemed to make M ships more accurate in a fight the player watched, no published source supports a crew-aim link there. Other likely causes: same-session aim-code changes, target mix, or low-attention fights resolved off-screen.
