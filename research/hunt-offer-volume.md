# Hunt offers per faction: volume and what raises it

Issue [#71](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/71). Read 2026-11-06 from SWI 0.91 HF1
(`E:\x4-dev\reference\mods\swi-0.91hf1`, scripts in `ext02/`) and vanilla X4 8.00 (`E:\x4-dev\reference\x4-8.00`).
Line numbers are 0.91 HF1 unless marked. "EM" = `ext02/md/kuertee_emergent_missions.xml`. Tags: [read] = read in
the source; [inferred] = follows from the source but not seen in game; [test] = still to check in game.
Background on the hunt flow is in [swi-bounty.md](swi-bounty.md) section 4 (0.90 line numbers).

## Short answers

1. **No cap, no timer per faction, no station or ship count.** A faction's hunt count is the number of live,
   non-player NPC pilots that **killed at least one of that faction's ships** in roughly the last 4 hours and
   that the faction still has a sighting of. So the count follows how much of that faction's fleet is being
   destroyed: in practice, its **wars**. MDW is at war (-1) with the New Republic, the Empire, the Ascendancy and
   the Rebels, has very high aggression and sends expeditions against three of them. The Hutt Cartel is at war only
   with the Sith (plus Black Sun and the Mandalorian raiders at -0.32), has very low aggression and no expedition
   enemies, so few pilots ever kill Hutt ships.
2. **Most offers:** the four big war factions, MDW, Empire (IMP), Ascendancy (ASC) and New Republic (NRL), then
   the Rebels, Anoat (war with IMP, and with NRL once its expansion trigger fires) and Corporate / Commerce Guild
   (at war with each other). Fewest: Hutt and the peaceful corporations and planets, whose only enemies are pirates
   and the Sith. Hapes, Sith, Black Sun, the pirates, Valarian and the hidden hunters **never offer**.
3. **MDW = faction id `mandodw`** ("Mandalorian Death Watch", short name MDW). Six defence stations, a shipyard,
   wharf, trade station and equipment dock. Its HQ is chosen in **Mandalore** (`swi_clustermandalore_sector001`),
   and the first matching type there is its **shipyard** [inferred], where the faction representative also
   spawns. A contact can sit there, or at any MDW station.
4. **Yes, with care.** The safest way is for `swibh` to make offers of its own through EM's own entry point
   (`Missions_Hunts_CreateOffer`), after seeding EM's sighting record for the target. That keeps EM's whole hunt
   loop (find, sanction, pay, our log hooks). A diff patch on the count itself has little to change, because the
   count is just real kills. Hook points and risks below.

Also asked by the coordinator: **MDW targets are mostly NRL because of war, not general hostility.** NRL is at -1
with MDW and is MDW's first expedition enemy. And the **18 vs 13** gap comes from the count being a snapshot taken
when you docked, while the offers are made later, when you pick the size, with a recheck that drops dead or
re-tasked targets (details in section 5).

## 1. What decides the count [read]

### 1.1 A pilot becomes huntable for faction F only by killing F's ships

- `Bounties_TargetDestroyed` (EM 11554-11599) runs on every `K_ObjectAttacks_AttackerKilledObject`. The killer
  must be an NPC-piloted ship (not a laser tower or unit), and the **victim's faction must not be in
  `ModFeatures.$factions_noBountyMissions`** (EM 11562). It then registers the killer (`Bounties_RegisterPilot`),
  adds the kill to `$pilot.$kEM_kills.{victim faction}.{victim class}` (`Bounties_RegisterKill`, EM 11478-11517:
  +1, or +0.25 for a subordinate kill) and writes a sighting for the **victim's faction**
  (`Bounties_UpdateLastKnown`, EM 11387-11477).
- S and M killers with a commander pass the kill to their **top-level commander** (EM 11573-11586). So a carrier or
  destroyer collects 0.25 per kill its fighters make, and becomes one L/XL bounty. That is why the L/XL bucket can
  be larger than the S/M one: MDW had 39 L/XL against 18 S/M [inferred].
- The excluded list in SWI (EM 63): `indibhg, sith, xenon, khaak, huttpirates, mandoraiders, valarian, blacksun,
  hapes`. Kills **of** these never make bounties, and these factions never offer (EM 12063). They can still be
  **targets**: a Black Sun ship that kills a Hutt freighter is a Hutt bounty.
- `Bounties_NewAttack` (EM 11518-11553) only refreshes sightings for pilots already registered. Attacks without a
  kill never create a bounty.

### 1.2 The sighting and its station

`Bounties_UpdateLastKnown` (EM 11387) stores, per witnessing faction, up to 10 sightings. Each has
`$station` = the **nearest station owned by that faction, galaxy-wide** (EM 11405). Only if the faction owns no
station at all does it take the nearest station that is neutral or better to the pilot's owner (EM 11406-11410).
That station is where the offer is posted, and its owner is the offering faction. So the station count does not
matter. One station anywhere is enough, but a faction with **no** station hands its hunts to another faction.

### 1.3 Expiry: about 4 hours

`Bounties_CleanInterval2` runs every 30 min (EM 11736) and calls `Bounties_CleanIntervalNow` (EM 11744-11799).
NPC pilots are dropped 4 h after their last update (player-owned ones after 1 h, EM 11757-11762). A faction's
sightings are dropped once their newest entry is older than that (EM 11771-11778). Each new kill or sighting
resets the clock. The count therefore reflects roughly the last 4 to 4.5 hours of combat.

### 1.4 The count you see in the conversation

`Bounties_PrepareMissionsForConvo` (EM 12043-12091) runs **once, when you arrive at a station**
(`Bounties_ArriveStation_RunOnce`, EM 12026-12042; reset when you leave, EM 12014-12025). For every registered
pilot that is operational and not player-owned, and for every faction F with a sighting of it, the pilot counts
for F if all of these hold (EM 12061-12066):

- F is in `kEMissions.$validFactions`, that is, tagged `economic` or `plunder` (EM 328-335);
- F is not in the excluded list;
- **F's relation to the player is at least F's `relation.neutral.min`**;
- the pilot has no hunt from F already (offered or accepted);
- the sighting's station is still operational;
- the pilot has kills recorded against F (EM 12067).

Pilots in S or M ships go in the S/M bucket and L or XL in the L/XL bucket (EM 12071-12076). XS pilots get a null
class and are never offered. `Bounties_Convo` (EM 12105) shows the bucket sizes as "%faction: %n missions"; the
class choice shows "Small and medium-sized targets: N" (603) and "Large and extra-large-sized targets: N" (604)
(EM 12168-12175). This only happens at a station owned by `bountyhunters` (EM 12111-12114).

**No per-faction or per-list limit applies.** Every pilot in the chosen bucket gets an offer (EM 12177-12186). The
"5 offers at a time" path (`Bounties_OpenMissionOffersUI_5OffersAtATime`, EM 11956) is the non-SWI full-mod path
and is not used in SWI (`$isMissionsFromConvo`, EM 11821). The only limit is the 3 accepted hunts per rolling hour
(`$missionsPerHour_max`, EM 5103), which limits accepting, not offering.

## 2. Why MDW posts many and Hutt few [read]

Starting relations in `ext02/libraries/factions.xml`. These are only start values: SWI's diplomacy, the plots
(`md/sw_diplo_simple.xml`, `md/sw_plot_*.xml`) and the player can change them during the game.

| | Hutt Cartel (`huttcartel`, factions.xml 418) | Mandalorian Death Watch (`mandodw`, 466) |
|---|---|---|
| At war (-1) with | Sith (and Khaak, Xenon) | NRL, Empire, Ascendancy, Rebels, Sith (and Khaak, Xenon) |
| Hostile (-0.32) | Black Sun, Mando raiders | Black Sun, Hutt pirates, Valarian |
| Mild (-0.032 to -0.01) | NRL, Hapes, Corporate, Valarian | Hapes |
| Friendly | Hutt pirates 0, Bounty Hunters +0.32 | Mando raiders, Kamino, Corporate +0.01, BH +0.32 |
| Faction logic (`md/factionlogic.xml`) | aggression **verylow**, no `ExpeditionEnemies` (251-268) | aggression **veryhigh**, `ExpeditionEnemies` = NRL, Empire, Ascendancy (269-287) |
| Jobs (`libraries/jobs.xml`, ids starting with the faction) | 49 | 58 |

The two fleets are about the same size (49 and 58 jobs), so **ship count is not the driver. Wars are.** MDW's ships
die all day against four large militaries, so hundreds of pilots hold MDW kills. Hutt ships mostly die to the odd
Sith, Black Sun or raider attack. The NRL is only at -0.032, and the Hutt pirates are at 0, so neither attacks on
sight. The two Hutt L/XL offers in T01 (a TFD and a HAP Nova) must be ships that killed Hutt ships anyway, for
example after a police scan fight (the Hutt Cartel responds to `policehalt` with `attack`, factions.xml) [inferred].

**Why MDW's targets are mostly NRL** [inferred from the above]: the NRL is at war with MDW and is first in MDW's
`ExpeditionEnemies`, so MDW expeditions go into NRL space, and NRL patrols (X-wings, A-wings, Y-wings, CR-90s)
answer them. Every NRL fighter that kills an MDW ship becomes an MDW bounty. IMP and ASC are also at war with MDW
and show up too (the Gozanti and the Customs Corvette), but less. Which enemy dominates depends on the map and the
current front, so it can change. A save check can count `$kEM_kills.{mandodw}` by killer owner if we need numbers.

## 3. Which factions post the most [read + inferred]

The ranking comes from the war table (factions.xml relations at -1, Khaak and Xenon left out). It shows how much
combat each faction sees, not counts from a save.

| Tier | Factions (id) | At war with |
|---|---|---|
| High | Empire (`galempire`) | NRL, ASC, MDW, Anoat, Rebels |
| High | Ascendancy (`ascendancy`) | NRL, IMP, MDW, Rebels |
| High | New Republic (`newrepublic`) | IMP, ASC, MDW (+ Anoat after `NRL_on_ANO`, `sw_diplo_simple.xml` 16-38, when Anoat holds more than 15 sectors) |
| High | Mandalorians (`mandodw`) | NRL, IMP, ASC, Rebels |
| Medium | Rebels (`rebelalliance`) | IMP, ASC, MDW (a smaller fleet: 14 jobs) |
| Medium | Anoat (`anoat`) | IMP (+ NRL later) |
| Medium | Corporate (`corporate`), Commerce Guild (`commerceguild`) | each other |
| Low | Hutt Cartel, Kamino, Naboo, the corporations (Kuat, Corellia, Sienar, ...), Mining Guild, Bounty Hunters | only the Sith and pirates (-1 to -0.1) |
| Never | Sith, Hapes, Black Sun, Hutt pirates, Mando raiders, Valarian, `indibhg` (excluded list, EM 63); Khaak, Xenon (not `economic`) | |

Seen in game: 24 L/XL from ASC and 2 from Hutt (T01, 0.90); MDW 18 S/M + 39 L/XL and Hutt 3 (2026-11-06). Both
fit the table. Relation to the player is also a gate: a faction you are hostile to (below its
`relation.neutral.min`) shows **no** hunts at all (EM 12064, 5227).

## 4. The Mandalorian faction [read]

- Id **`mandodw`**, name "Mandalorian Death Watch", short name **MDW** (`t/0001.xml` 2718-2719). Tags
  `standard claimspace economic police protective ...` (factions.xml 466), so it is a valid offerer and not
  excluded. The other Mandalorian faction, **`mandoraiders`** (factions.xml 705, a pirate), is excluded and never
  offers.
- Stations (`libraries/god.xml` 1447-1557): shipyard `shipyard_mandodw_01` in a zone of Mandalore sector 1
  (`swi_zone001_clustermandalore_sector001_macro`); wharf in Kalevala; trade station in Garos; equipment dock in
  Concord Dawn; six defence stations (Concord Dawn, Wayland, Ordo, Kalevala, Mandalore, Garos).
- **HQ:** `MandodwFactionLogic` sets `PreferredHQSpaceMacro = swi_clustermandalore_sector001_macro` and
  `PreferredHQTypes = ['equipmentdock', 'shipbuilding', 'defensestation', 'tradestation', 'any']`
  (factionlogic.xml 277-278). SWI's factionlogic.xml is a diff on vanilla's, so vanilla's `Find_Faction_Headquarters`
  (x4-8.00 `base/md/factionlogic.xml` 547-612) picks the HQ. It searches the sector first, type by type: there is
  no equipment dock in Mandalore, so **'shipbuilding' finds the shipyard** (`canbuildships`, 577-579).
  `'defensestation'` is a typo that vanilla never matches (it checks `'defencestation'`, 586), which doesn't matter
  here. After `set_faction_headquarters`, `CreateNewFactionRepresentative` (709-721) puts the MDW representative on
  the HQ. [inferred; a save check of the shipyard's `headquarters` flag would confirm it]
- `md/sw_plot_mando.xml` 196 can set MDW to +1 with the player (a story reward), which keeps the relation gate open.
- A contact can sit at the HQ shipyard, next to the representative, or at any MDW defence station. EM already
  uses defence stations as the fallback for its mission contact (see swi-bounty.md section 4.3).

## 5. Why the count (18) and the list (13) differ [read + inferred]

The 18 is counted **when you dock** (section 1.4). The offers are made **when you pick the size**, by
`Bounties_Convo_Next` (EM 12162-12192), which calls `Missions_Hunts_CreateOffer` (EM 5218-5255) for each pilot.
That rechecks each one and **silently skips** a pilot when:

- the pilot or its sighting station no longer exists (EM 12180-12183);
- `$pilot.ship` is gone or the pilot is no longer operational, for example its ship was destroyed or it moved to
  another ship (EM 5228-5232, using `$pilot_target.ship` where the count used `assignedcontrolled`);
- it already has a hunt from that faction (EM 5232);
- the station's owner fails the valid-faction or relation check (EM 5227).

MDW's targets are fighters in an active war, so several of the 18 can die in the minutes between docking and
picking the list. That is the most likely cause [inferred].

A second cause, which only applies if the **same list is picked twice** in one docking: picking a size first
sends `Bounties_Convo_Next_remove_mission_offers` with `signal_objects` (EM 12177), then makes the new offers with
`signal_cue_instantly`. The old offers' `Mission_Hunt_CleanUp` (EM 5502-5571), which clears
`$kEMissions_missions.{faction}` (EM 5537-5539), likely runs after that [inferred: `signal_objects` is not
instant]. So on a second pick the pilots who still have an old offer are skipped as "already has a hunt", and then
the old offers are removed. [test] Pick the same list twice and compare.

A third cause, not checked: the map's list comes from the engine (`C.GetCurrentMissionOffers`, SWI
`subst02/ui/addons/ego_detailmonitor/menu_map.xpl` 18949), and whether it hides offers at stations you haven't
discovered can't be seen in the scripts. [test]

## 6. Can `swibh` raise one faction's count? [read + inferred]

The count is real kills, so there is no number to turn up in EM. There are three ways to get more hunts for a
contact's faction. They are ordered from safest to riskiest.

### 6.1 Offers of our own, through EM's entry point (recommended)

`swibh` picks targets that fit the contact (for example Black Sun, raider or Sith ships near Hutt space, or
ships that have *attacked* Hutt ships), seeds EM's record, and asks EM for the offer:

1. `run_actions ref="md.kuertee_emergent_missions.Bounties_RegisterPilot"` (EM 11318) adds the pilot to
   `Bounties.$pilots`, so EM's cleanup and sighting updates track it. Cross-script refs like this already work:
   `kuertee_emergent_missions_rescue.xml` 100-286 calls `md.kuertee_emergent_missions.GetName` and others.
2. `run_actions ref="md.kuertee_emergent_missions.Bounties_UpdateLastKnown"` with `Faction` = the contact's faction
   writes the sighting and station that `Mission_Hunt` needs (`$TargetSector`, last three sightings, beacons:
   EM 5288, 6822).
3. `signal_cue_instantly cue="md.kuertee_emergent_missions.Missions_Hunts_CreateOffer"` with
   `table[$station = <contact's station>, $target = <ship>]` (EM 5218). Unlike the convo count, CreateOffer does
   **not** require kills.

What we gain: EM's find, identify, destroy, sanction, debrief and pay all run unchanged, our T12 log hooks
(`hunt.accept`, `hunt.end`) fire, and the offer is a normal Bounty Hunters Guild offer with the contact's faction.

Risks:
- **Pay without kills:** the kills part reads `$kEM_kills.{faction}`. With none, `Mission_Hunt_GetBaseRewardData`
  falls to `$BaseRewardData.$reward_forTargetKills` (EM 6667-6669), which is unset at the first call, so it is
  likely 0, maybe with a script error in the log. The target part (the "up to") is still paid. Either accept
  smaller hunts, or call `Bounties_RegisterKill` (EM 11478) to give a real kill count. Never invent kills that
  didn't happen.
- The seeded pilot now also shows on the Guild's convo list for that faction **only if it has kills** (EM 12067),
  so seeding without kills stays private to our contact. With a seeded kill it shows on the Guild list too.
- The offer is removed when the player leaves a station (`Mission_Hunt_CleanUp` on `K_ArriveAndLeaveStations`
  `$leaveFrom`, EM 5506-5509) unless it has been accepted. Our contact must make offers while the player is docked
  at the contact's station, or accept the offer right away.
- Using EM's internal names (`Bounties.$pilots`, `$kEM_lastKnownLocation`) ties us to EM's data layout. A SWI
  update can break it, so `make check` should match these cue and library names too, as it does for the T12 sels.
- The 3-per-hour accept cap still applies (EM 5103).

### 6.2 Diff patches on EM's count (possible, small gain)

Patches with the T12 pattern (`extension/swibh/extensions/starwarsmod_m1/md/kuertee_emergent_missions.xml`). The
cue path is `kEMissions/cues/Bounties/cues/...`:

- **Longer memory for one faction:** in `Bounties_CleanIntervalNow` (EM 11744), raise `$time_limit` (EM 11757-11762)
  for pilots with kills against the contact's faction. Low risk: it only keeps existing records longer. It needs
  `$kEM_timeLastUpdate`, which is per pilot, and the per-faction check (EM 11771-11778). More old offers, though
  their last sighting gets stale.
- **Count attacks as well as kills:** in `Bounties_NewAttack` (EM 11518), register attackers of the contact
  faction's ships even when they don't kill. A bigger change: pilots without kills fail the convo count
  (EM 12067), so this also needs a patch there, and the kills part pays 0. Higher risk, and it changes SWI's
  balance for everyone who has `swibh` installed.
- **Don't** edit the excluded list (EM 63) or `$validFactions` (EM 328). They change every faction's bounties
  and SWI's design.

### 6.3 Missions fully our own

`create_offer` with our own cue, outside EM. Full control and no reliance on EM's internals, but we would rebuild
find, sanction, pay and debrief, and lose the T12 log hooks. It is only worth it if the contact's hunts come to
differ a lot from EM's (leads, Alive only).

## 7. To check in game

- [test] The MDW HQ is the Mandalore shipyard, and the representative is there.
- [test] 18 vs 13: dock, count, pick S/M at once and count again; then pick the same list a second time.
- [test] An offer made by `swibh` through `Missions_Hunts_CreateOffer` with a seeded sighting and no kills: does
  it show, what does it pay, and does the log show an error?
