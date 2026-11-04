# Save check: hunt 6 aftermath, "Search and destroy: HTP Mercenary Weequay (VUA-500)"

Save: `quicksave.xml.gz` (file time 2026-11-04 11:11), `<save name="BBH - Test 2">`, game time 18,082.502, X4 8.00 (build 590967) + SWI 0.90, player "Bobby the Fat", 631,379 Cr. It was copied to the scratch folder as `quicksave-hunt6.xml.gz` and unpacked. The save folder was not touched. Line numbers are from the unpacked file (`zcat | sed -n`). Tags: [read] = seen in the save, [inferred] = reasoned, not tested.

## Short answer

1. **Both hunters are dead.** Nobutora (ZRU-226) died first, at 17,929.6, killed by the Ascendancy station PWU-496. **Boba Fett (CWH-250) died at 18,022.9, killed by the player's Fortitude VVB-886.** So the player landed the killing shot on Fett. The player was undocked and firing from 17,959.9 to 18,024.1.
2. **The rep loss was Imperial Ascendancy, -2, "Unauthorised Kill", 4 -> 2**, 13 s after the player killed Fett. Rutan is Ascendancy space. Fett's own faction (`indibhg`) has locked relations, so the loss didn't land there; the vanilla kill rule charged the sector's owner instead [inferred]. The station's guns killing Nobutora cost nothing.
3. **Loot: already picked up.** The logbook shows mods and wares collected at 18,075-18,077 (list below). Fett's three drop containers are marked collected. One drop is left: 3 light concussion missiles from Nobutora, next to its wreck. They vanish at 18,229.9, about 2.5 min after the save. The Fortitude can't use missiles anyway.
4. **Hunt 6 is debriefed and paid:** 149,220.62 Cr at 17,851.5, plus +5 Ascendancy rep (-> 4). Money now 631,379 Cr.
5. **Surprise:** the VUA-500 wreck lists the **player's ship** as its killer (`attacker`, 17,495.68). The hunt's pay line says "damage: 49 / 100" and no "kills: 1". So the earlier conclusion "Fett got the kill" is in doubt. See "Open questions".

## 1. The hunters [read]

All three wrecks and the player are in Rutan: cluster `swi_clusterrutan_macro`, sector `swi_clusterrutan_sector001_macro` (owner `ascendancy`, line 1225761), tempzone FYT-800 `[0x161c1382]` (line 1252586).

| Line | Ship | State | Killer (`attacker`) | Method | Time |
|---|---|---|---|---|---|
| 1253249 | CWH-250 `firespray_macro`, `indibhg`, id `[0x161dee02]` (Boba Fett) | wreck | `[0x214f30b]` = player's VVB-886 | hitbybullet | 18,022.939 |
| 1253782 | ZRU-226 `porax_38b_macro`, `indibhg`, id `[0x214988c]` (Nobutora) | wreck | `[0x161d0103]` = station PWU-496 | hitbybullet | 17,929.619 |

- PWU-496 (line 1295797): `station_gen_factory_base_01_macro`, owner `ascendancy`, id `[0x161d0103]`. Last hit by Fett (area damage) at 17,959.239.
- Player VVB-886 (line 1254285): `fortitude_macro`, `connection="space"` (not docked at the save). Last hit by Fett, area damage, at 18,023.038: a shot already in flight when Fett died. Hull 2,076.6 (line ~1254509).
- Player's guns (lines 1254609, 1254622): `shootcontroller class="player"`, primary fire from 17,959.873 to 18,024.095.
- Positions in the zone: Fett's wreck (-2,947, -1,072, -2,810); Nobutora's wreck (-786, -297, -337); station (-1,346, 604, -1,051); player (-2,015, 2,146, 539). The player is about 4.7 km from Fett's wreck.
- Wrecks self-destruct at 19,823 (Fett) and 19,730 (Nobutora).
- Scheduled `relationrangechanged` events between the player and `indibhg` at 18,498-18,548 (player, line 1254294 on). That fits the hunters' forced hostility (at least 10 min, research/named-hunters.md) running out [inferred].

**Sequence:** Nobutora dies to the station (17,929.6). Fett hits the station (17,959.2). The player opens fire at once (17,959.9). The player kills Fett (18,022.9). Reputation lost (18,035.9). Loot collected (18,075-18,077).

## 2. The reputation loss [read]

Logbook (line 22128032): `"Reputation lost: - -2" text="Faction: Imperial Ascendancy / Reason: Unauthorised Kill / Current reputation: 2"` at 18,035.908. Same entry at line 22127939 with `faction="{999840,504110}"` (Imperial Ascendancy).

- Before: +5 "Mission Completed", current 4 (line 22128030, at 17,851.498). After: 2.
- Raw relation (line 884 and 900): Ascendancy -> player `-0.005`, plus a booster `+0.0015` stamped 18,035.908. Player's block mirrors it (lines ~1147, ~1157).
- Why [inferred]: "Unauthorised Kill" is reason `{20217,600}`, from `change_relation_on_kill` in vanilla `md/notifications.xml` `PlayerKills` (8.00 lines ~1714-1782). It fires only for kills by the player's own ship. `indibhg` relations are `locked="1"` (line 2677) and Ascendancy has no relation entry for `indibhg` (neutral). So the engine charged the hit to Ascendancy, the owner and police of Rutan, because Fett wasn't an Ascendancy enemy. The same -2 happened on AEL-112 (research/hunt-protection-ael-112.md §3).
- Not the cause: the player's shots on the station (no "Unauthorised Attack" entry), or the station's own kill of Nobutora (no entry at 17,929).
- Takeaway: killing a named hunter who attacks you still costs -2 with the sector owner. For the extension: a hunter who turns on the player should be a sanctioned kill, or the player should be warned.

## 3. Loot [read]

Collected (logbook lines 22128033-22128049, 18,075.14-18,076.87):

- Exceptional Shield Generator Coil x2 (Naboo Royal Shield Modification 2/2)
- Exceptional Engine Fuel Injector x2 (Dense Core Hyperdrive 71 %)
- Tuning Software x2, Nividium Oxide x2, Extended Fuel Container x4, Basic Ship Nanoweave x1, Durasteel Frame x1, Damaged Hyperdrive Core x1, Useful Scrap x16
- "Payment received: 5,592 Cr" (balance 626,223) and "5,156 Cr" (balance 631,379), at the same moments. Probably wares sold on pickup [inferred].

Drops still in the zone:

- Lines 1306968, 1306998, 1307028: three `collectablewares` (two `sm_gen_wares_common_01`, one `sm_gen_wpsmod_common_01`, a weapon-mod box), all `state="wreck"`, spawned 18,049.1, removal at 18,349. `state="wreck"` means already picked up [inferred]; they match the 18,075 pickups. Nothing left to collect.
- Line 1304543: `collectableammo` KLM-394, 3 x `missile_concussion_light_macro`, at Nobutora's wreck, spawned 17,929.9, self-destructs at 18,229.9. Collectable but useless to the Fortitude.
- No other drops in the zone.

## 4. Hunt 6 state [read]

- Debrief done and paid. Logbook line 22127938 (17,851.498): "Reward for HTP Mercenary Weequay (VUA-500) kills: 26,516.25 Cr. Your Engagements: 1 x M ship (damage: 49 / 100). Reward for … destruction: 122,704.37 Cr. Total reward: 149,220.62 Cr." Line 22128031: "Payment received: 149,220 Cr, New balance is 620,631 Cr".
- Davina Komatsu (line 24470809, `ascendancy`) `lastspeaktime="17885.763"`.
- Money now: 631,379 Cr (`<player money>`, line 7).

## 5. Logbook, last ~30 min (16,280-18,082)

Apart from travel mode, scans and news:

- 17,851.5: +5 Ascendancy (Mission Completed), 4; hunt 6 paid 149,220.62 Cr.
- 18,035.9: -2 Ascendancy (Unauthorised Kill), 2.
- 18,075-18,077: the loot above, +10,748 Cr.

## Open questions

- **Who killed VUA-500?** Its wreck (line 21375352, Triton, `swi_clustertriton_sector001_macro`, ownerless) has `attacker="[0x214f30b]"` (the player's ship), `hitbybullet`, 17,495.68. But the pay line shows "damage: 49 / 100" with no "kills: 1", and the Lawlessness counter didn't move. Either `attacker` is the last hit and not always the killer, or the Hunt's credit and the Lawlessness counter don't use the killer at all. Not resolved here.
- Whether Fett and Nobutora respawn, and when (named-hunters.md says about 3,850 s for Amanaman).
- The UI reputation scale (-0.0035 effective shows as "2") wasn't checked.
