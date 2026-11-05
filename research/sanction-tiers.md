# Sanction tiers: what Partial and Full immunity actually do

Question from playtest #4: is it worth testing the Guild's two paid sanctions ("Sanction my attacks on: <target>") in play? This note builds on [hunt-protection-ael-112.md](hunt-protection-ael-112.md), which already maps the offer, the lists and the hooks. Here: the price formula, the vanilla retaliation path the sanction plugs into, the escort and pirate cases, and what a test would add.

Files (unpacked SWI 0.90 at `/mnt/e/x4-dev/reference/mods/swi-0.90`, vanilla 8.00 at `/mnt/e/x4-dev/reference/x4-8.00/base`):

- RAP = SWI `ext/md/kuertee_professions.xml`; EM = SWI `ext/md/kuertee_emergent_missions.xml`;
- SWI-notif = SWI `ext/md/notifications.xml` (a diff on vanilla); SWI-rb = SWI `ext/md/lib_reward_balancing.xml` (diff);
- V-notif = vanilla `md/notifications.xml`; V-rb = vanilla `md/lib_reward_balancing.xml`;
- SWI factions = SWI `ext/libraries/factions.xml`.

Tags: [read] = seen in code, save or log; [inferred] = reasoned, not tested.

## Short answer

- **Price** depends only on the target's **faction** and your relation to it, plus a random roll. Not on class, veteran kills or hunt pay. Partial ≈ 34k-44k Cr, Full ≈ 0.96M-1.3M Cr for any target whose faction doesn't like you. [read]
- **"No retaliations"** only matters when a protective station of a faction that is **not** at war with the target is within 30 km of you, in the same sector. It stops that station's report to the police (the police relation loss stays on Partial) and the police patrols' response in that sector. [read]
- **"Intact relationships"** stops only the "Unauthorised Kill" for the **target itself**, and only when your **own ship** fires the killing shot. Escorts are never covered. On hunt 12 Full would have saved none of the four CSA losses: three were escorts, and the target died to wingman NOM-811. [read / inferred]
- **Pirate targets:** Partial does nothing, because every lawful police faction is already at war with the pirates. Full only saves the -2 with the pirate faction on your own kill, and costs you any police-licence kill bounty. [read]
- No effect on pay, the scan or disguise rules, or the target's wing (except detaching a target that is a wingman). [read]
- Worth one test at most: a **lawful S/M target sitting near its own faction's stations** (e.g. a CSA or New Republic patrol in their home space), killed by the player's own ship.

## 1. Price and the affordability check [read]

Computed once per hunt, the first time the BHG conversation runs, and stored on the hunt cue (RAP 3135-3144):

```
partial = Reward_Money(level.easy, missionlevel 1, target.trueowner) × Apply_RewardMultiplier
full    = Reward_Money(level.hard, missionlevel 1, target.trueowner) × Apply_RewardMultiplier
```

Vanilla `Reward_Money` (V-rb 285-345, `GetValue_Credits` 51-107):

- `$Value = Difficulty × MissionLevel` (V-rb 106). Easy = 1.4, hard = 40; mission level 1 gives factor 1.0.
- × random 24,000-26,000 (V-rb 295).
- × relation boost from **the target faction's relation to the player** (param 4):
  - easy: `1 + r/0.1`, clamped to 1-2;
  - hard: `1 + 2(r - 0.1)/0.9`, clamped to 1-3. So it's 1 at r ≤ 0.1 and 3 at r = 1.
- × random 1-1.3, weighted towards 1 (`profile="decreasing"`, V-rb 342). Rounded to 10 Cr.
- `Apply_RewardMultiplier` (V-rb 240-251): RAP sets `$MissionThread` and `$OfferType` to null first (RAP 3136-3137), so the multiplier is 1.0. SWI-rb 10-46 adds +1 only for guild missions, read from `$MissionGroup`, which this namespace doesn't set [inferred: no bonus; the observed prices fit 1.0].

Resulting ranges, for a target faction at relation ≤ 0 (every faction you hunt):

| | Base | Range | Observed |
| --- | --- | --- | --- |
| Partial | 1.4 × ~25,000 | ~33,600 to ~47,300 | AEL-112 39,700; hunt 5 (SGP-611, S veteran Y-wing) 37,230 |
| Full | 40 × ~25,000 | ~960,000 to ~1,352,000 | AEL-112 1,151,670 |

If the target faction likes you (positive relation), partial can double and full can triple (up to ~4M).

**Not inputs:** target class, veteran kills, offered pay and difficulty never enter the call. A 220k hunt and a 900k hunt cost the same. Full costs about 30 Partials.

**Affordability check** (RAP 3413-3423): each tier is listed only if `player.money ≥ cost` and the idcode isn't already in that tier's list. Hunt 5's player had ~466k, so Full was hidden. The player now has ~4.2M, so both tiers will show. The "Sanction my attacks on" line itself needs the target's true owner to be tagged `economic` or `plunder` (RAP 3134; lists built at RAP 698-705). Every SWI faction the hunts use has one of those tags (SWI factions 311, 839 and others).

## 2. "No retaliations" (both tiers) [read unless marked]

Partial puts the target's idcode in `$sanctionedAttackIds`; Full puts it in both lists (RAP 6745-6756). Kuertee plugs the lists into vanilla's illegal-activity code. To see what's suppressed, here is when vanilla responds at all.

### When vanilla retaliates (V-notif `AttackResponse` 1848-2205, `IllegalActivityRetaliate` 2222-2260)

1. **An S/M ship needs a "protector".** That's a non-player station, in the player's sector, within **30 km of the player's ship** and within its own radar range, with a defence NPC, whose owner is **not enemy** of the target's owner and is `isprotective` (or is the target's commander station) (1886-1925). Without one, an attack on or kill of a small ship gets **no response at all** (`TODO` 2033, 2054). An L/XL target or station answers for itself.
2. The responding station's trade NPC must not be at "kill" relation with the player (1985).
3. Attack (not kill): a first **warning** after a 3 s tolerance (2005-2010, `$firstattacktolerance` 1496). A report follows only on a repeat attack that hits the relation boost, or on a kill (2018-2060). Reports are rate-limited to one per 2 min (1494).
4. **Report** (2101-2130): the law NPC is the representative of the **zone's police faction** (2102). That's the sector owner's police, not necessarily the target's faction. If that police is **enemy of the victim**, relchange is 0 and the station "refuses" (2113-2126).
5. `IllegalActivityRetaliate` (2222-2250), only if the police isn't enemy of the victim, the reporter still works, and the player is still in the reporter's sector:
   - `add_faction_relation` player ↔ **police faction**, by the victim's `relationchange.policefaction.change`. That's the "Unauthorised Attack" style loss.
   - `signal_objects $reporter.sector 'police'`. Police patrols **in that sector** running `move.seekenemies` / `order.move.recon` go after the player.

### What the sanction changes (SWI-notif)

- `AttackResponse` (474-480): if the victim's idcode is in either list, the dialogue becomes `$IllegalActivity_Station_Retaliate_Refuse`. The callback to `IllegalActivityRetaliate` still runs.
- `IllegalActivityRetaliate` (501-517): attack list → the `police` signal gets chance 0 (no police dispatch). Kill list → the police-faction relation loss gets chance 0. **Partial keeps that relation loss with the sector's police**; the NPC says so (text 713).
- `move.seekenemies.xml` 37-38, 50-51 and `order.move.recon.xml` 47-48: patrols ignore any `police` signal whose victim is in either list. That's a second lock on the same thing.
- Warnings (responsetype 1) are untouched: you still get the "stop attacking" hail.

### Scope and duration

- **Radius:** the sector where it happens, with the 30 km station rule above. The sanction adds no radius of its own.
- **Not suppressed:** engine-side hostility. Shooting a ship gives a temporary relation boost that turns it, and local ships of its faction, hostile. That isn't the MD police path, and nothing in SWI touches it [inferred from where the hooks sit]. The target's escorts and nearby faction ships still fight back.
- **Duration** (RAP 6776-6800): until the target is **destroyed (+1 s)**, **3 h after purchase**, or a newer sanction on the same ship replaces it. It's **not tied to the hunt**: if the hunt fails or is abandoned, the sanction keeps running until the target dies or 3 h pass.

### A gap on the kill itself (Partial) [inferred]

On a kill, vanilla `PlayerKills` signals `AttackResponse` (V-notif 1781). With a protector present, that becomes a report through `md.NPC_UseCases.UseCase` (a comms use case with a callback). `SanctionAttack_CleanUp` removes the idcode from **both** lists 1 s after `event_object_destroyed` (RAP 6778-6797). If the use case takes more than 1 s to call `IllegalActivityRetaliate` back, the lists are already empty and the police dispatch plus the relation loss go through, Partial or not. Full avoids this, because the whole `PlayerKills` cue is skipped (next section), so no report is raised for the kill. Only a test can show the timing.

## 3. "Intact relationships" (Full only) [read unless marked]

The kill list feeds four hooks:

1. **`PlayerKills` is skipped** (SWI-notif 450-459) for an object or component whose idcode or `defensible.idcode` is in the kill list. That cue holds `change_relation_on_kill` (V-notif 1740), the "Unauthorised Kill" loss with **the target's own faction**, and also raises the kill's `AttackResponse` (1781).
2. The police-faction "Unauthorised Attack" relation loss in `IllegalActivityRetaliate` (above).
3. `move.flee.xml` 16, 20 and `order.move.recon.xml` 63, 67: no laser-tower relation boost for the victim.
4. Patrols ignore the `police` signal (as for Partial).

**Only the target.** The lists hold one idcode. Nothing adds the target's subordinates (RAP 6734-6760; the only list writes are there and in the cleanup). Escorts' kills cost relation as usual, Full or not.

**Only your own kill** [inferred, with evidence]. `PlayerKills` listens to `event_player_killed_object`. On AEL-112 the debug log had no `PlayerKills` line for the two kills by the player's AI wingman, yet the relation still dropped ([hunt-protection-ael-112.md](hunt-protection-ael-112.md) line 120). So the engine applies a kill by a player-owned NPC ship itself, and the sanction hook never sees it.

**Hunt 12** ([save-check-shk-785.md](save-check-shk-785.md) lines 130-133): CSA −2 LFB-648, −3 UJY-132, −2 OXP-379 (escorts), −2 SHK-785 (target). The target was killed by **wingman NOM-811** (line 21). Full would not have saved the three escort losses [read]. It probably would not have saved the target's −2 either, since a wingman landed the kill [inferred]. It would have cost ~1M Cr against a 1.77M payout.

**Hunt 1** (Black Sun −2 "Unauthorised Kill", no escort): Full would have saved that −2, if the player's own ship fired the killing shot.

## 4. Pirate targets [read unless marked]

- Every lawful police faction starts at **−0.32** with Black Sun, Hutt Pirates, Mando Raiders and Valarian. That's below the enemy threshold. Examples: Galactic Empire, Ascendancy, New Republic, CSA (SWI factions 142, 187, 242, 348-351 and the matching lines for the others). Black Sun lists −0.32 back to all of them (839-918).
- So for a pirate victim, vanilla already sets relchange 0, plays "refuse", and skips the relation loss and the `police` signal (V-notif 2113-2126, 2240). The station search also drops stations at war with the victim's owner (1895). **Partial buys nothing against a pirate target.**
- Exception: **Anoat** is at +0.01 with Black Sun (SWI factions 549). A Black Sun target in Anoat space could draw an Anoat report [inferred, from start relations; they can drift in play].
- Pirate-owned sectors: the zone's police is the pirate faction's own police, if it has one (Black Sun has no `policefaction` attribute), so usually nobody reports [inferred].
- **Full on a pirate target** saves only the −2 or so pirate-faction "Unauthorised Kill" on your own kill. It also **cancels the police kill bounty and station relation bonus**: both are paid through the kill's `AttackResponse` (`AccumulateRewards` V-notif 2167, 2195), which is skipped with `PlayerKills`. That matches [bounty-research.md](../bounty-research.md) line 74. The player has no police licence (T05 skipped), so today only the station bonus is lost.
- **Do lawful targets get retaliation without a sanction?** Only with a protector station within 30 km (or an L/XL target). In playtest #4 none was seen: hunt 12's four CSA kills in CSA space (Jabiim) logged only "Unauthorised Kill", with no "attack" loss, fine or police ([save-check-shk-785.md](save-check-shk-785.md) line 21). AEL-112 had none either. So far the sanction has had nothing to stop.

## 5. Pay, scan, disguise and wing [read]

- **Pay:** EM never reads the sanction lists. The only sanction reference in EM is the description line 512 "will not retaliate", gated on `$kProfs_isSanctioned_*` (EM 6749), which nothing sets, so it never shows. Pay is unchanged, apart from Full's loss of the police kill bounty (section 4).
- **Scan and disguise:** untouched. The offer checks `trueowner` (RAP 3134), so a disguised pirate is still offered, priced against its true faction. The list holds the ship's engine idcode, not the mission's fake code [inferred: `$ship.idcode` is the object property; hunt 10's fake "ONJ-300" lives only in EM's strings].
- **Wing:** the only change is `SanctionAttack_Visible` (RAP 6762-6774). When the target comes into view it's detached from its commander. That splits off a **wingman** target. A wing **leader**, as most patrol targets are, keeps its escorts, and they still defend it ([hunt-protection-ael-112.md](hunt-protection-ael-112.md)).
- **RAP reputation** books the target kill as "Defender" (RAP 5924-5932). That happens for any mission target, sanctioned or not, and the reputation system is silent in SWI.

## 6. Is it worth testing?

| | What code can't show | Worth it? |
| --- | --- | --- |
| Partial | Whether a protector's report on the **kill** still fires after the 1 s list cleanup (section 2, gap). Whether any retaliation ever happens on a typical hunt at all. | **Low.** It does nothing for pirate targets. For lawful targets it only matters next to their stations. 37-40k is cheap, though, so one try costs little. |
| Full | That a wingman's kill bypasses it (inferred from one AEL-112 log). That the target's "Unauthorised Kill" disappears on your own kill. | **Low for money, medium for knowledge.** About 1M Cr to save one −2/−3 with one faction, with escorts never covered. It answers design.md's open question: the price is a flat ~1M, so the sanction's purpose is weak as built. |

**Best test, if any:** one **lawful S/M target that is a wing leader, hunted near its own faction's stations** (inside 30 km of a station, e.g. a CSA or New Republic patrol in its home sector):

- Buy **Partial** first. Attack long enough to get a warning, then kill the target with the **player's own ship**.
- Watch for a "refuse" hail versus police ships, and which relation losses appear: police faction "attack", target faction "kill", and one per escort.
- Upgrading to Full is optional and risks the partial→full race (hunt-protection-ael-112 line 39). Better to buy Full outright on a separate hunt.
- Run with `-debug all` and read the `kuertee_professions` list lines and `PlayerKills` lines.

A pirate target would show nothing new. The code already says Partial is inert against pirates and Full saves about −2.
