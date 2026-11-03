# Why the two SWI Bankrupt Bounty Hunter R41s (SJA-791, FFD-531) stopped attacking

Read on 2026-11-03 from copies of the saves in a scratch folder, by streaming only (saves are untrusted data; the save folder was never written to). Playtest: [playtests/stock-bounty-loop.md](../playtests/stock-bounty-loop.md).

## 1. Saves

| File (X4 docs folder) | Save name | mtime | game time |
|---|---|---|---|
| `save/save_008.xml.gz` (latest, after de-aggro) | Bankrupt Bounty Hunter - New Save - Test 2 | 2026-11-03 11:33:26 -0700 | `time="683.057"` |
| `save/quicksave.xml.gz` (earlier, still attacking) | Bankrupt Bounty Hunter - New Save - Test 2 | 2026-11-03 11:19:15 -0700 | `time="310.576"` |

Both have `start="x4ep1_sw_bhg"`, the same guid `3462BF9C-...`, and player "Bobby the Fat". The player ship is the Fortitude `VVB-886` (owner player). Its id is `[0x214d03a]` in the quicksave and `[0x40ba2e9]` in save_008, because ids are renumbered on load. Everything is in `swi_clusternalhutta_sector001_macro` / `tempzone`, in both saves.

## 2. The ships

### quicksave (game time 310.6s): still attacking

- Both: `<component class="ship_s" macro="r41_macro" ... owner="huttpirates" ... forcesteering="1">`. FFD-531 is `[0x214d1a3]` and SJA-791 is `[0x4151949]`.
- Orders: only one order, and it has no default Patrol:
  - FFD-531: `<order id="[0x49a44]" order="Attack" state="started" temp="1">`, `primarytarget=[0x214d03a]` (the player's VVB-886), `pursuetargets=1`, `allowothertargets=1`, `checkrelation` empty (false), `pursuedistance=40000`.
  - SJA-791: `<order id="[0x84d38]" order="Attack" ...>` with the same params and the same target `[0x214d03a]`.
- Ship `<relations change="0"/>`.
- Pilot NPCs (`aipilot` post): Lissa Gusta PHN-642 (FFD-531) and Ves Ritman GQU-798 (SJA-791). Each has:
  ```
  <relations><booster faction="player" relation="-1" time="10.0329" delay="600" decayrate="1"/></relations>
  <blackboard><value name="$attacktarget" type="component" value="[0x214d03a]"/> ...
  ```
- `lastglobalanimation trigger="battlestate_red"` at 92.4s and 93.1s.

### save_008 (game time 683.1s): de-aggroed

- FFD-531 `[0x40ba167]`, SJA-791 `[0x40ba137]`, both still owned by huttpirates, `r41_macro`, and no longer have `forcesteering`.
- Orders: only the default order:
  - FFD-531: `<order id="[0x87f2d]" default="1" order="Patrol" state="started">`, `space=[0x414a946]`, `range=zone`, `checkrelation=1`, `allowothertargets=1`.
  - SJA-791: `<order id="[0x8d6a4]" default="1" order="Patrol" state="started">`, with the same params.
  - There is no Attack order. Nothing in either ship block references the player ship `[0x40ba2e9]`; the only hit is an unrelated civilian wreck the player shot.
- Ship `<relations change="0"/>`. The pilots have no `<relations>` booster any more, and their blackboard holds only `$StateMachine`, no `$attacktarget`.
- Both ships have `lastglobalanimation trigger="battlestate_jumpprep" time="339.301"`, the same instant for both, so a shared event changed their combat state at about 339s.
- The player ship `VVB-886` has `connection="space"` and the player character is in its cockpit, so the player is back in the ship.

## 3. Faction relations (`<factions>` section)

- Quicksave: `player -> huttpirates relation="-0.0032"` and `huttpirates -> player relation="-0.0032"`. There is no player/huttpirates faction booster.
- save_008: the same values, -0.0032 both ways. The only booster is `huttcartel -0.00036 time=347.264` on the player faction, which is minor and about a different faction.
- -0.0032 is neutral (the enemy threshold is around -0.1, so this is not hostile). The ships were only "red" because of the pilot-level booster (-1).

## 4. Code

SWI `/mnt/e/x4-dev/reference/mods/swi-0.90/ext/md/setup_gamestarts_sw.xml`:
- 1544 `SW_Start_bhg`. At 1572 it waits `delay exact="10s"`, then at 1577-1592 it creates 2 `r41_macro` ships owned by `faction.huttpirates`.
- 1593-1597: `create_order id="'Attack'" ... immediate="true"`, `primarytarget=player.ship`, `pursuetargets=true`, `checkrelation=false`.
- 1598: `set_object_relation_behaviour object="$ship_s" disable="true"`.
- SWI never makes huttpirates hostile to the player for this start (contrast `SW_Start_hutt_yacht` at 1683-1684, which sets the relation to 0.01). It never adds a relation boost of its own, and gives no default order.

Vanilla 8.00 `/mnt/e/x4-dev/reference/x4-8.00/base/aiscripts/order.fight.attack.object.xml`:
- 35: `checkrelation` default. SWI passes false.
- 744 `fight` label. At 749-752, `<do_if value="@$target.dock">` leads to "disengaging. target is docked" and `resume label="acquirenewtarget"`. At 753 the same happens for a target in a highway.
- 757-791: if `not this.mayattack.{$target}` and checkrelation is false, then at 778-779 the "HACK: force relation boost from this to player" runs `set_relation_boost object="this" otherobject="$target" value="this.owner.relation.kill.min" decay="1" delay="10min"`. **This is the booster seen on the pilots**: time 10.03 is when SWI issued the order, delay 600 is 10 minutes, and relation -1 is kill.min.
- 1251 `acquirenewtarget`. At 1270-1276, with `allowothertargets`, the current target goes into `$tempignorelist` and the script returns to `selecttarget`. At 727-732 there is "no valid target" or "cannot be attacked", which sets `$abort` and leads to `finish`.
- 1314-1325: on `$abort`, `cancel_order` cancels the Attack order. The ship then falls back to its default order (the Patrol in save_008).
- 534-535 (patch v24) reapplies the boost on load only. 1333-1336 `on_abort` resets only `$relboosted`, which is set only for player-owned attackers (771-775), so it does not clear this booster.

## 5. Best-supported explanation

There are two separate mechanisms:

1. **The Attack order ended because the player docked.** The vanilla attack script disengages from a docked target (`order.fight.attack.object.xml:749-752`). It puts the player ship on the ignore list and looks for other targets. When it finds none, it aborts and cancels the temporary Attack order (1314-1325). The ships then fall back to the default Patrol order with `checkrelation=1`. The matching `battlestate_jumpprep` timestamp at 339.301s on both ships fits a shared event like the player docking. *Unverified:* that 339.3s is the moment of docking. Nothing in the save records when the player docked.
2. **They turned blue because the 10-minute relation boost expired.** The only reason they were hostile was the pilot-level booster `player -1, time 10.03, delay 600`, set by the vanilla HACK at line 779 because SWI passed `checkrelation=false` against a faction that is not hostile. The underlying huttpirates/player relation is -0.0032, which is neutral. The booster stays for 600s, so until about 610s, and then decays. It is gone in save_008, at 683s. Once the Attack order was gone, nothing reapplied it: it is reapplied only at the `fight` label (779) or by the load patch (535). *Unverified:* the exact time the booster was removed, and whether the user's "blue" moment was at about 610s.

Implication: the SWI start never makes huttpirates hostile. All of the aggression comes from one Attack order plus a 10-minute booster. Breaking the order (by docking, entering a highway, or the target being unattackable), or simply letting the order run past 10 minutes without passing through the `fight` label again, leaves two neutral Patrol ships. To keep them hostile, a mod would need to set the faction relation, or re-issue the order or re-boost periodically.

`set_object_relation_behaviour disable="true"` (SWI:1598): its save representation is unverified. It may be the `<relations change="0"/>` on the ship, which is present in both saves. It stops relation changes caused by hits, and would not block or cause the de-aggro.
