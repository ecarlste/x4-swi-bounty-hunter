# Save check: "Search and destroy: NRL Patrol Y-wing BTA-NR2 (SGP-611)"

Save: `quicksave.xml.gz`, `<save name="BBH - Test 2">`, game time 13,685.357, X4 8.00 (build 590967) + SWI 0.90, gamestart `x4ep1_sw_bhg`, player "Bobby the Fat", 471,411 Cr. It was copied to the scratch folder as `quicksave-hunt5.xml.gz`, unpacked and streamed. The save folder was not touched. Line numbers are from the unpacked stream (`zcat | sed -n`). Tags: [read] = seen in the save, [inferred] = reasoned, not tested.

## Tell the player first

1. **SGP-611 is not in Yag'Dhul. It's in Fondor** (`swi_clusterfondor_sector001_macro`, New Republic space), zone 003, the zone with the gate to Thyferra. It's alive, in open space (not docked), on a ProtectPosition order (radius 15 km, attack on sight).
2. **It leads a wing of three B-wings:** WKA-144, LVL-476 and XKO-353 (all `bwing_macro`, New Republic, all alive, wingmen 1-3 on Escort). Plan for four S fighters, not one. The Y-wing's pilot is Marelle Gerra.
3. **Route from Vondarc (where VVB-886 is): 4 jumps. Vondarc -> Wroona -> Yag'Dhul -> Foless -> Fondor.** Yag'Dhul is on the way, so the mission's "find" markers there cost no detour, but the ship won't be at them.
4. **The mission's intel is stale.** The three "Report of SGP-611" beacons are all in Yag'Dhul, 2 h 31 min to 2 h 41 min old when EM wrote them. The find step expires at game time 22,939 (about 2.5 h of game time from the save).

## 1. The target [read]

- Component (line 20745738): `class="ship_s" macro="ywing_btlnr2_macro" code="SGP-611" owner="newrepublic" knownto="player"`, id `[0x379fe]`, spawntime 979.901. No `state="wreck"`. Last attacked at 4,080.185 (`lowattentionattack`).
- Ancestors:
  - 104795 galaxy `swi_galaxy_macro` `[0x1fc4]`
  - 20742300 cluster `swi_clusterfondor_macro` `[0x9cee2]`, `known="1"`
  - 20742304 sector `swi_clusterfondor_sector001_macro` `[0x9cee3]`, owner `newrepublic`
  - 20742307 zone `swi_zone003_clusterfondor_sector001_macro` `[0x9cee4]`. Its first child is gate `props_gates_anc_gate_macro` NYV-133 on connection `swi_gate_cfondors001z003_cthyferras001z004_connection` (the Thyferra gate).
- `connection="space"`, parent is the zone: **not docked**.
- Position: the component `<offset>` (about line 20745792) is x 48,989 / y 2,021 / z -14,850 (zone-relative). The `<movement>` read/write position (line 20745752) is x 2,383 / y 3,955 / z -27,565 in space `[0x9cee4]`, velocity about 225 m/s. The two differ by a fixed amount, and the B-wings show the same difference, so one is probably in a different frame. Either way it's 28-51 km from the zone origin (the Thyferra gate).
- Movement target point: (-3,843, -4,239, -15,746) in the same zone. It's patrolling around its protect position.
- Order (about line 20745815): `ProtectPosition`, default, started. `radius` 15000, `attackonsight` 1, `destination` = list 71840 (not resolved).
- Source: `class="commandeered"`, original job `newrepublic_mixed_patrol_s`, sector `[0x77bc9]` = `swi_clusterabregadorae_sector001_macro` (Abregado-rae, line 16412844), next to Fondor.
- Pilot (line ~20745966): npc "Marelle Gerra", VVI-934, `newrepublic`.

## 2. The wing [read]

The formation (`<formation><leader>`, shape `pointguard`, radius 1,059 m) lists members `[0x379fe]` (SGP-611), `[0x2af4f]`, `[0x37a14]`, `[0x2af84]`. The `<subordinates>` group 1 is `assignmment="defence"`, with three subordinate connections.

| Line | Code | Macro | Wingman | Order | Notes |
|---|---|---|---|---|---|
| 20746054 | WKA-144 `[0x2af4f]` | `bwing_macro` | member 1, leader `[0x379fe]` | Escort | source job `newrepublic_mixedfighters_escort`, commander `[0x379fe]`. Last attacked by `[0x49e97]` at 7,856.695 |
| 20746466 | LVL-476 `[0x37a14]` | `bwing_macro` | member 2 | Escort | |
| 20746882 | XKO-353 `[0x2af84]` | `bwing_macro` | member 3 | Escort | last attacked by `[0x49e97]` at 7,876.608 |

All are `newrepublic` and `knownto="player"`, and none has `state="wreck"`. WKA-144's movement position (2,548, 3,354, -27,491) is about 600 m from the leader.

## 3. The player [read]

- Line 15962310: `fortitude_macro` VVB-886, owner `player`. Last hit by a missile from `[0x78b69]` at 9,193.601.
- Ancestors: cluster `swi_clustervondarc_macro` -> sector `swi_clustervondarc_sector001_macro` (owner `ascendancy`, line 15885273) -> zone `swi_zone003_clustervondarc_sector001_macro` (line 15952660).
- Route: gate graph built from the save (each gate connection's `<connected>` partner, mapped to sector, BFS). Shortest path: **Vondarc -> Wroona -> Yag'Dhul -> Foless -> Fondor (4 jumps).** Vondarc's neighbours: Sullust, Wroona. Fondor's neighbours: Abregado-rae, Foless, Thyferra.

## 4. Mission and EM intel [read]

- Mission (line 24294838): id 814063, `active="1"`, accepted at 12,139.094 (about 26 min of game time before the save). The contact is Shuji Chapman, QCJ-781, owner `ascendancy` (npc at line 16025732). Text: "last reported at -776.355, 362.803, 156488.766 in Yag'Dhul 02h 32min 16s ago". Kills: 1.5 x L, 3.5 x S. Reward 907,612.56 Cr + about 75,870 Cr for damage.
- Briefing: step 2 find, target sector `[0x5010d]` (Yag'Dhul) at (-776.355, 362.803, 156,488.766). Steps 3 and 4 (scan, destroy) target `[0x379fe]`, which is the right ship. Step 5 is a debrief with Shuji Chapman.
- Live step 2 objective: `endtime="22939.094"`, targets three player-owned nav beacons in Yag'Dhul zone 005 (`swi_zone005_clusteryagdhul_sector001_macro`, `[0x50443]`, sector `[0x5010d]` owner `newrepublic`, `contested="1"`):
  - line 10363957 AME-863 "(Report of SGP-611, 02h 31min 32s ago)", offset (-776, 363, -8,511). This is the mission-text point (zone 005 sits at about z +165 km in the sector).
  - line 10363966 WCO-717 "(… 02h 39min 45s ago)", offset (8,255, -3,797, -1,575)
  - line 10363975 HOS-438 "(… 02h 41min 15s ago)", offset (-618, 4,905, -4,329)
- So EM's newest report puts it in Yag'Dhul about 2.5 h before it was written. The ship has since moved two jumps (Yag'Dhul -> Foless -> Fondor) and now guards a spot in Fondor. **The intel is stale.** The beacon names are fixed strings, so the "ago" times don't count up after they're written.

## Unverified

- Which of the two positions (component offset or movement position) is the true zone-relative one, and the zone's offset inside the sector (the macro default, not read from the save). The distance from the Thyferra gate is therefore 28-51 km, not exact.
- The ProtectPosition destination (list 71840) isn't resolved, so it's unknown whether the ship will stay in Fondor. It's a default order, so it probably stays near there until something changes it.
- Whether EM will put a fresh report beacon in Fondor before the player arrives ("We will update you of new reports"). The EM cue variables for this hunt weren't read.
- The route counts gate links only. It ignores travel time and hostile space: Yag'Dhul is contested, and Foless and Fondor are probably New Republic.
