# Does crew make NPC turrets more accurate? (8.00 + SWI 0.91 HF1, from the files)

Asked 2026-11-10, during #47's trials, after targets and wingmen got full crews. The hypothesis
checked: "giving M targets full crews made their gunners more accurate".

**Verdict: the game files can't prove it, and they point the other way.** No XML ties turret
aim or hit chance to crew, crew count or any skill. Crew changes a ship's `combinedskill`
(the engine computes it, "favouring the pilot"). In XML, `combinedskill` sets only how often
an M ship's turret controller re-picks targets, not where the guns point. The service crews
the trials draw are weak (about 12-20 combined skill against 60 for a 9/9 pilot), so if the
engine averages them in, a crewed ship's `combinedskill` goes *down*. The change that did
reliably make targets tougher is bail-out: with no crew, the first successful bail roll takes
the pilot too, and a full crew makes that much rarer (section 3). The same change also pinned
target pilots to 9/9, where before their skill was random. That is a confound for any
before/after comparison.

Paths: `V` = `/mnt/e/x4-dev/reference/x4-8.00/base`, `S` = `/mnt/e/x4-dev/reference/mods/swi-0.91hf1`.

## 1. What decides turret accuracy in 8.00

### What the files prove

- **Aim and ballistics are engine code.** In high attention (the player present, as in every
  trial fight) the AI script only hands turrets a target list. `set_turret_targets` says the
  list is "ignored in low attention" (`V/libraries/common.xsd:35381`, `:35408`). Nothing in
  any aiscript computes a lead, an aim error or a hit chance for high-attention turret fire.
- **The only skill-keyed AI combat parameter is reaction time.** `V/libraries/parameters.xml:125-134`:
  `<aicombat><skills>` gives `reactiontime` 0.1 s at skill level 0 down to 0.0 s at level 5,
  with "skills are divided by 3" (so a 0-15 skill maps to levels 0-5). The schema doesn't say
  whose skill it is or what reacts (`V/libraries/parameters.xsd:329-336`, documented only as
  "Parameters for various AI combat related systems"). The other `aicombat` values
  (`parameters.xml:136`: `maxaimrangefactor`, `fastcharge`) don't involve skill.
- **What defines a turret's tracking and spread is its macro**, not a person: e.g.
  `rotationspeed max="90"` (`S/ext/assets/props/WeaponSystems/guided/macros/turret_m_borontube_macro.xml:9`)
  and bullet `angle="0.05"` (`S/ext/assets/fx/weaponFx/macros/bullet_a2_s_laser_macro.xml:7`).
  No weapon or turret macro in SWI's assets has a skill or accuracy attribute (grep).
- **Who controls an M ship's turrets.** The pilot of an S/M ship runs
  `fight.attack.object.fighter` or `.bigtarget` (`V/aiscripts/order.fight.attack.object.xml:948-964`),
  which fly the ship and fire its forward guns. Turrets belong to `fight.attack.object.medium`,
  "Defense/Attack mode of a medium ship (made by defense npc)" (`V/aiscripts/fight.attack.object.medium.xml:2-6`).
  No XML starts it (only `V/libraries/aicompat.xml:110` names it), so the engine runs it for
  the defence control. The defence post is a computer (`V/libraries/posts.xml:18`). The
  generic defence computer has piloting 0, morale 6 (`V/libraries/characters.xml:48-58`).
- **Where skill touches turrets in that script:** only the target re-scan interval.
  `$scantime = 500ms + (1 - ship.combinedskill/100) * 60s` (`fight.attack.object.medium.xml:540`,
  recomputed at `:1090`, the comment at `:1080-1089` says "refresh here in case pilot or crew
  gets better" and tabulates 100 → 0.5 s, 60 → 24.5 s, 20 → 48.5 s). It is the wait between
  target-list refreshes (`:1667`), cut short by events such as a new enemy found or the
  player changing target (`:1667-1690`). It also scales how much damage the script expects
  turrets to deal before it re-targets (`:1275`, `:1308`). This decides *which* target the
  turrets get and how quickly they switch. It does not decide how well they hit. Against one
  target that is already assigned, it barely matters.

### What `combinedskill` is

- The ship's `combinedskill` is "Effective combined skill value (from 0 to 100) of this
  controllable, taking entity and crew skill, where applicable, into account"
  (`V/libraries/scriptproperties.xml:422`, datatype `controllable` at `:302`).
- The UI tooltip: "Combined skill average of pilot and service crew, favouring the pilot.
  Influences all ship operations." (`V/t/0001-l044.xml:7700`, page 1026). The weighting is
  engine code, and no XML gives it.
- A person's combined skill comes from role weights: pilot = 80% piloting + 20% morale
  (`V/libraries/posts.xml:12-17`). Service crew = 75% engineering + 25% morale
  (`V/libraries/roles.xml:3-7`). Marines = 90% boarding + 10% morale (`roles.xml:14-18`).
  The skill text: engineering "Improves repair speed and response time. Influences all ship
  operations." (`V/t/0001-l044.xml:6606`).

### The numbers for the trials (an estimate)

The trials pilot is 9/9: (0.8·9 + 0.2·9)/15 ≈ 60. The SWI service crew the trials draw:

| Tier | Engineering | Morale | Combined (≈) | Source |
|---|---|---|---|---|
| Hutt/Black Sun/NR regular | 2-4 | 2-4 | 20 | `S/ext02/libraries/characters.xml:1779-1786`, `:1327-1334` |
| Hutt/Black Sun/NR rookie | 1-2 | 1-4 | 12 | `characters.xml:1850-1857` |
| Imperial regular | 4-11 | 0-12 | 47 | `characters.xml:708-716` |
| Imperial rookie | 1-2 | 0-3 | 9 | `characters.xml:756-765` |

The `*_military_crew` sets the trials use are 30 rookie / 60 regular service, plus marines
(`S/ext02/libraries/people.xml:63`, `:229`, `:561`, `:810`, `:1059`). If the engine averages
service crew in at all, a full crew pulls the ship's `combinedskill` *below* the pilot's 60,
which makes `$scantime` a little slower, not faster. Vanilla crews are just as weak (Argon
regular service: engineering 2-4, `V/libraries/characters.xml:201-209`).

## 2. Pilot only vs `<people ref="..._military_crew"><fillpercent exact="100"/></people>`

`create_ship` adds people only through `<people>` (`V/libraries/common.xsd:11176-11193`, a
PeopleDB ref whose `<fillpercent>` overrides the definition's). Every combat-relevant effect
the files show:

| Effect | Pilot only (people.count 0) | Full crew | Evidence |
|---|---|---|---|
| Turret aim / hit chance | nothing in XML | nothing in XML | section 1 |
| Turret re-target interval | from the ship's `combinedskill` (pilot only, presumably) | from the ship's `combinedskill`, which crew changes, probably lowering it (section 1) | `fight.attack.object.medium.xml:540`, `:1090` |
| Flee decision | ship `combinedskill` ≥ 20 gates fleeing, and the time-to-die test uses it | same, with the crew-altered value | `V/aiscripts/interrupt.attacked.xml:53`, `:66-74` |
| Boost, evade, mines (pilot scripts) | ship `combinedskill` | same, crew-altered | `V/aiscripts/fight.attack.object.fighter.xml:393`, `:427-431`, `V/aiscripts/move.evade.xml:59`, `fight.attack.object.bigtarget.xml:593-595` |
| Hull repair (engineer) | `repairmodifier = min(ship.combinedskill, 90) + 10`, repairs up to 60-100% hull, speeds repair up to 400% | same formula, crew-altered skill | `V/aiscripts/engineer.ai.xml:48-58`, `:64`, `:321` |
| Boarding defence | no service crew to call up, base resistance only | service crew join defending teams at their marine potential skill, and marines defend | `V/md/boarding.xml:995-1012`, `:1015-1019`, `V/libraries/parameters.xml:1528-1531` |
| Bail-out (player-caused) | first successful roll takes the pilot and the ship is abandoned | crew leaves in chunks, and the pilot goes only once a roll covers everyone left | section 3 |
| Surrender on demand (comm) | the people/capacity ratio is 0, so this check always passes | ratio 1.0 against (16 − morale)/16 ≤ 1, so the check always fails | `V/md/notifications.xml:1258` (SWI keeps it, `S/ext02/md/notifications.xml:61`) |

## 3. Bail-out, vanilla and SWI

The cue is `PlayerOwnedShipAttacks`: it runs only when a player-owned ship attacks
(`V/md/notifications.xml:1185`).

**Vanilla 8.00** (`V/md/notifications.xml`):
- Gate: shields < 20%, hull < 75%, not docked, and "(not capital ship or has people)" (`:1251`).
- The chance is `(46 − ship.combinedskill/5) × size ratio × damage ratio`, quartered if the
  attacker isn't the player's own ship (`:1264-1268`). Crew enters only through `combinedskill`.
- Number bailing is `min(max(min(capacity × (15 − pilot morale)/15, people.count), 1), 3)`
  (`:1291`). The pilot bails when that number ≥ `people.count` (`:1294`). With 0 crew that is
  1 ≥ 0, so the first success takes the pilot. A full crew needs several successes, each up to 3 people.
- The next roll comes 30 s later (`:1308`).

**SWI replaces the whole block** ("Enhanced Bailing", `S/ext02/md/notifications.xml:44-45`):
- `ejectchance = 11 + remainingcrewchance + hullshieldchance + sizechance − 1.75 × pilot morale`
  (`:93`, `:95`). `remainingcrewchance = 10 − ((people.count + 1)/capacity) × 10`, clamped 0-10
  (`:75`), so an empty ship gets up to +10 and a full one 0. The chance is halved for S/M combat
  types (`:103`). With a 9-morale pilot that is about 11 + 10 + ratio − 15.75 for an empty ship
  and 11 + 0 + ratio − 15.75 (floored at 1) for a full one, so empty ships roll much more often.
- Number bailing is random from `max(20% capacity, 1)` to `1.2 × people.count`, else all
  (`:125-134`). There's a 25% full-crew bail when hull < 10% (`:141-143`). The pilot bails when
  that number ≥ `people.count` (`:157`; the vanilla not-capital-ship test is dropped). With 0
  crew the else branch gives 0 ≥ 0, so the first success abandons the ship.
- The next roll comes 5 s later (`:170`).

So in both, **a pilot-only M ship abandons on its first successful roll**, and a full crew
both lowers SWI's roll chance and needs several rolls. This matches trials.md's crewless
Gozanti bailing.

## 4. What SWI changes

- **Turret aim: nothing.** SWI's `parameters.xml` diff replaces `lowattentioncombat` and
  `aiflight/skills` (`S/ext02/libraries/parameters.xml:34-38`, `:49`) but not `aicombat`.
  The low-attention change is out-of-sight only (`turretfactor` 1.0 vs vanilla 0.8,
  `V/libraries/parameters.xml:1742`).
- **The `fight.attack.object.medium` patch** (`S/ext02/aiscripts/fight.attack.object.medium.xml`)
  keeps forward guns on the primary target, adds a low-attention surface-element hit chance of
  `5 + 7 × pilot piloting` (`:9-12`, pilot skill, not crew), and sets `weaponmode.defend` turrets
  onto the preferred target (`:26-35`). It doesn't touch `$scantime` or `combinedskill`.
- **Engineer:** SWI only wakes the repair wait when the ship is attacked
  (`S/ext02/aiscripts/engineer.ai.xml:3-8`).
- **Bail:** rewritten, see section 3. SWI has no `boarding.xml` patch.
- **Crew quality:** SWI's crews are its own (the table in section 1).
- SWI's `ext/extensions/*` hold only map and asset diffs, with no aiscripts or parameters.

## 5. What only an in-game test can settle

1. **Whether crew changes `combinedskill`, and by how much.** Log `$ship.combinedskill` and
   `$ship.pilot.combinedskill` for the same 9/9 pilot, with no crew and with full crew.
2. **Whose skill `aicombat` reaction time reads** (the pilot, the defence computer, or the ship's
   combined skill) and whether it affects turrets. It's 0-0.1 s, which is small either way.
3. **Turret hit rate itself.** Same target and pilot, with and without crew; compare damage
   taken per minute at the same range. Change one variable at a time: the trials change also
   pinned target pilots to 9/9.
